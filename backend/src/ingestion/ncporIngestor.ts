import {
  StationId,
  ENVIRONMENT_DATA,
  NcporLiveFeed
} from "../store/digitalTwinStore";
import { CONFIG } from "../config/env";
import {
  fetchStationLiveTelemetry,
  ParsedStationLiveResult
} from "./ncporClient";
import { logger } from "../utils/logger";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

// In-memory cache for polar link drop resilience
const liveCache: Record<StationId, ParsedStationLiveResult | null> = {
  BHARATI: null,
  MAITRI: null
};

// Ingestor state variables
let isRunning = false;
let pollingTimer: NodeJS.Timeout | null = null;
let activeSyncPromise: Promise<{
  BHARATI: ParsedStationLiveResult | null;
  MAITRI: ParsedStationLiveResult | null;
  syncedAt: string;
}> | null = null;

let consecutiveFailures = 0;
let circuitBreakerState: CircuitBreakerState = "CLOSED";
let circuitBreakerOpenUntil: number | null = null;
let configuredIntervalMs = 10 * 60 * 1000;
let nextScheduledTime: number | null = null;

const CIRCUIT_BREAKER_MAX_FAILURES = 5;
const CIRCUIT_BREAKER_PAUSE_MS = 5 * 60 * 1000; // 5 minutes
const BASE_BACKOFF_MS = 2000; // 2 seconds
const MAX_BACKOFF_MS = 60000; // 60 seconds

/**
 * Calculates exponential backoff: 2s, 4s, 8s, 16s, up to 60s
 */
export function calculateBackoffMs(failures: number): number {
  const backoff = BASE_BACKOFF_MS * Math.pow(2, Math.max(0, failures - 1));
  return Math.min(MAX_BACKOFF_MS, backoff);
}

/**
 * Synchronize both Bharati and Maitri research stations concurrently.
 * Implements single-flight deduplication so concurrent calls join the same execution.
 */
export async function syncAllStationsLive(): Promise<{
  BHARATI: ParsedStationLiveResult | null;
  MAITRI: ParsedStationLiveResult | null;
  syncedAt: string;
}> {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    logger.info("[NCPOR Ingestor] Synchronizing live AWS feeds for BHARATI & MAITRI...");

    const [bharatiRes, maitriRes] = await Promise.allSettled([
      fetchStationLiveTelemetry("BHARATI"),
      fetchStationLiveTelemetry("MAITRI")
    ]);

    let successCount = 0;

    if (bharatiRes.status === "fulfilled") {
      successCount++;
      const val = bharatiRes.value;
      liveCache.BHARATI = val;
      updateStationStore("BHARATI", val);
      logger.info(
        `🇦🇶 [BHARATI] Synced Live: ${val.kpi.tempC}°C | Wind: ${val.kpi.windKmh} km/h (${val.kpi.windKnots} kts) | Baro: ${val.kpi.pressureHpa} hPa`
      );
    } else {
      logger.warn(`⚠️ [BHARATI] Live sync warning:`, bharatiRes.reason?.message);
    }

    if (maitriRes.status === "fulfilled") {
      successCount++;
      const val = maitriRes.value;
      liveCache.MAITRI = val;
      updateStationStore("MAITRI", val);
      logger.info(
        `🇦🇶 [MAITRI] Synced Live: ${val.kpi.tempC}°C | Wind: ${val.kpi.windKmh} km/h (${val.kpi.windKnots} kts) | Baro: ${val.kpi.pressureHpa} hPa`
      );
    } else {
      logger.warn(`⚠️ [MAITRI] Live sync warning:`, maitriRes.reason?.message);
    }

    // If both failed, throw error to trigger backoff / circuit breaker logic
    if (successCount === 0) {
      const bharatiErr = bharatiRes.status === "rejected" ? bharatiRes.reason?.message : "Failed";
      const maitriErr = maitriRes.status === "rejected" ? maitriRes.reason?.message : "Failed";
      throw new Error(`Both stations failed to sync (BHARATI: ${bharatiErr}; MAITRI: ${maitriErr})`);
    }

    return {
      BHARATI: liveCache.BHARATI,
      MAITRI: liveCache.MAITRI,
      syncedAt: new Date().toISOString()
    };
  })();

  try {
    return await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
  }
}

/**
 * Updates in-memory digital twin store with latest parsed telemetry
 */
function updateStationStore(station: StationId, result: ParsedStationLiveResult): void {
  const currentEnv = ENVIRONMENT_DATA[station];
  currentEnv.tempC = result.kpi.tempC;
  currentEnv.humidityPct = result.kpi.humidityPct;
  currentEnv.pressureHpa = result.kpi.pressureHpa;
  currentEnv.windSpeedKmh = result.kpi.windKmh;
  currentEnv.windStatus = result.kpi.windStatus;

  if (result.stats?.temperature.min !== null && result.stats?.temperature.min !== undefined) {
    currentEnv.tempMinC = result.stats.temperature.min;
  }
  if (result.stats?.temperature.max !== null && result.stats?.temperature.max !== undefined) {
    currentEnv.tempMaxC = result.stats.temperature.max;
  }

  const feed: NcporLiveFeed = {
    isLive: true,
    stationName:
      station === "BHARATI"
        ? "Bharati Research Station (Larsemann Hills)"
        : "Maitri Research Station (Schirmacher Oasis)",
    sourceUrl: result.sourceUrl,
    observationDate: result.observationDate,
    lastSyncedAt: result.timestamp,
    windKnots: result.kpi.windKnots,
    windMps: result.kpi.windMps,
    stats: result.stats,
    series: result.series
  };
  currentEnv.liveFeed = feed;
}

/**
 * Executes a single ingestion iteration and schedules the next run according to status.
 */
async function runIngestionCycle(): Promise<void> {
  if (!isRunning) return;

  // Check if circuit breaker is OPEN and period has expired
  const now = Date.now();
  if (circuitBreakerState === "OPEN") {
    if (circuitBreakerOpenUntil && now < circuitBreakerOpenUntil) {
      const remainingMs = circuitBreakerOpenUntil - now;
      scheduleNextRun(remainingMs);
      return;
    }
    // Transition to HALF_OPEN to probe connection
    circuitBreakerState = "HALF_OPEN";
    logger.info("[NCPOR Ingestor] Circuit breaker entering HALF_OPEN probe state.");
  }

  try {
    await syncAllStationsLive();

    // Success path: reset failures and restore closed circuit
    if (consecutiveFailures > 0 || circuitBreakerState !== "CLOSED") {
      logger.info(`[NCPOR Ingestor] Ingestion succeeded. Resetting failure counter (was ${consecutiveFailures}). Circuit breaker CLOSED.`);
    }
    consecutiveFailures = 0;
    circuitBreakerState = "CLOSED";
    circuitBreakerOpenUntil = null;

    // Schedule next normal cycle
    scheduleNextRun(configuredIntervalMs);
  } catch (err: any) {
    consecutiveFailures++;
    logger.warn(`[NCPOR Ingestor] Ingestion failure #${consecutiveFailures}: ${err.message}`);

    if (consecutiveFailures >= CIRCUIT_BREAKER_MAX_FAILURES) {
      circuitBreakerState = "OPEN";
      circuitBreakerOpenUntil = Date.now() + CIRCUIT_BREAKER_PAUSE_MS;
      logger.error(
        `🚨 [NCPOR Ingestor] Circuit breaker TRIPPED (OPEN): ${consecutiveFailures} consecutive failures. Pausing polling for 5 minutes.`
      );
      scheduleNextRun(CIRCUIT_BREAKER_PAUSE_MS);
    } else {
      const backoffMs = calculateBackoffMs(consecutiveFailures);
      logger.info(
        `⏳ [NCPOR Ingestor] Retrying in ${backoffMs / 1000}s (exponential backoff failure #${consecutiveFailures})...`
      );
      scheduleNextRun(backoffMs);
    }
  }
}

/**
 * Helper to schedule next cycle via setTimeout
 */
function scheduleNextRun(delayMs: number): void {
  if (!isRunning) return;

  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }

  nextScheduledTime = Date.now() + delayMs;
  pollingTimer = setTimeout(() => {
    runIngestionCycle().catch((e) => {
      logger.error("[NCPOR Ingestor] Unexpected cycle error:", e);
    });
  }, delayMs);
}

/**
 * Start periodic background ingestion with exponential backoff and circuit breaker.
 * Respects CONFIG.POLLER_ENABLED flag.
 */
export function startNcporIngestor(intervalMinutes = 10): void {
  if (!CONFIG.POLLER_ENABLED) {
    logger.info("⏸️ [NCPOR Ingestor] POLLER_ENABLED is false. Ingestion polling is disabled.");
    return;
  }

  if (isRunning) {
    logger.info("[NCPOR Ingestor] Ingestion poller is already running.");
    return;
  }

  configuredIntervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
  isRunning = true;
  consecutiveFailures = 0;
  circuitBreakerState = "CLOSED";
  circuitBreakerOpenUntil = null;

  logger.info(`📡 [NCPOR Ingestor] Starting hardened ingestion (interval: ${intervalMinutes} min, max backoff: 60s, breaker: 5 fails/5 min).`);

  // Run immediate first cycle
  runIngestionCycle().catch((err) => {
    logger.warn("[NCPOR Ingestor] Initial run caught error:", err.message);
  });
}

/**
 * Stop background ingestion poller gracefully (e.g. on SIGTERM/SIGINT)
 */
export function stopNcporIngestor(): void {
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
  isRunning = false;
  nextScheduledTime = null;
  logger.info("🛑 [NCPOR Ingestor] Telemetry ingestion stopped gracefully.");
}

/**
 * Retrieve cached or fresh live feed for a specific station
 */
export function getStationLiveFeed(station: StationId): ParsedStationLiveResult | null {
  return liveCache[station];
}

/**
 * Inspect internal ingestor health & circuit breaker metrics
 */
export function getIngestorStatus() {
  return {
    isRunning,
    circuitBreakerState,
    consecutiveFailures,
    circuitBreakerOpenUntil: circuitBreakerOpenUntil ? new Date(circuitBreakerOpenUntil).toISOString() : null,
    nextScheduledRun: nextScheduledTime ? new Date(nextScheduledTime).toISOString() : null,
    cache: {
      BHARATI: liveCache.BHARATI ? { tempC: liveCache.BHARATI.kpi.tempC, time: liveCache.BHARATI.timestamp } : null,
      MAITRI: liveCache.MAITRI ? { tempC: liveCache.MAITRI.kpi.tempC, time: liveCache.MAITRI.timestamp } : null
    }
  };
}
