import https from "node:https";
import {
  StationId,
  ENVIRONMENT_DATA,
  NcporLiveFeed,
  NcporSeriesPoint
} from "../store/digitalTwinStore";

// TLS Agent configured to tolerate certificate domain alias (e.g. *.ncpor.res.in vs data.ncaor.gov.in)
const tlsAgent = new https.Agent({
  rejectUnauthorized: false
});

export interface ParsedStationLiveResult {
  isLive: boolean;
  station: StationId;
  sourceUrl: string;
  observationDate: string;
  timestamp: string;
  kpi: {
    tempC: number;
    humidityPct: number;
    pressureHpa: number;
    windKnots: number;
    windMps: number;
    windKmh: number;
    windStatus: string;
  };
  stats?: {
    temperature: { avg: number | null; min: number | null; max: number | null };
    windSpeedMps: { avg: number | null; min: number | null; max: number | null };
    airPressureHpa: { avg: number | null; min: number | null; max: number | null };
    relativeHumidityPct: { avg: number | null; min: number | null; max: number | null };
  };
  series?: {
    temperature: NcporSeriesPoint[];
    windSpeed: NcporSeriesPoint[];
    airPressure: NcporSeriesPoint[];
    humidity: NcporSeriesPoint[];
  };
}

// In-memory cache for polar link drop resilience
const liveCache: Record<StationId, ParsedStationLiveResult | null> = {
  BHARATI: null,
  MAITRI: null
};

let pollingIntervalTimer: NodeJS.Timeout | null = null;

function computeWindStatus(windKmh: number): string {
  if (windKmh >= 100) return "CLASS_3_CATASTROPHIC_BLIZZARD";
  if (windKmh >= 75) return "CLASS_2_SEVERE_BLIZZARD";
  if (windKmh >= 50) return "KATABATIC_GALE";
  if (windKmh >= 30) return "MODERATE_EASTERLY";
  return "LIGHT_POLAR_BREEZE";
}

/**
 * Fetch and parse real-time AWS data from NCPOR / NCAOR live feeds
 */
export async function fetchStationLiveTelemetry(
  station: StationId
): Promise<ParsedStationLiveResult> {
  const stationLower = station.toLowerCase();
  const urls = [
    `https://data.ncpor.res.in/${stationLower}/live`,
    `https://data.ncaor.gov.in/${stationLower}/live`
  ];

  let html: string | null = null;
  let usedUrl = "";
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        // @ts-ignore - native fetch supports node https agent via dispatcher or custom agent option
        agent: tlsAgent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntarcticaDigitalTwinBackend/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        html = await res.text();
        usedUrl = url;
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!html) {
    throw new Error(
      `[NCPOR Live Service] Failed to retrieve data for ${station} from endpoints: ${lastError?.message || "Unknown error"}`
    );
  }

  // Parse instantaneous KPIs
  const tempMatch = html.match(
    /id\s*=\s*["']?divtemp["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
  );
  const rhMatch = html.match(
    /id\s*=\s*["']?divrh["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
  );
  const apMatch = html.match(
    /id\s*=\s*["']?divap["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
  );
  const wMatch = html.match(
    /id\s*=\s*["']?divw["']?[^>]*>(?:&nbsp;|\s)*([+-]?\d+(?:\.\d+)?)/i
  );
  const dateMatch = html.match(/<td rowspan="2"[^>]*>([^<]+)<\/td>/i);

  const parsedTemp = tempMatch ? parseFloat(tempMatch[1]) : ENVIRONMENT_DATA[station].tempC;
  const parsedRh = rhMatch ? parseFloat(rhMatch[1]) : ENVIRONMENT_DATA[station].humidityPct;
  const parsedAp = apMatch ? parseFloat(apMatch[1]) : ENVIRONMENT_DATA[station].pressureHpa;
  const windKnots = wMatch ? parseFloat(wMatch[1]) : 20.0;
  const windMps = +(windKnots * 0.514444).toFixed(2);
  const windKmh = +(windKnots * 1.852).toFixed(1);
  const windStatus = computeWindStatus(windKmh);

  // Extract 24-hour hourly trend arrays
  const extractSeries = (seriesName: string): NcporSeriesPoint[] => {
    const regex = new RegExp(
      `name:\\s*["']${seriesName}["'][\\s\\S]*?dataPoints:\\s*\\[([\\s\\S]*?)\\]`,
      "i"
    );
    const m = html!.match(regex);
    if (!m) return [];
    return [
      ...m[1].matchAll(/\{\s*x:\s*(\d+),\s*y\s*:\s*([+-]?\d+(?:\.\d+)?)\s*\}/g)
    ].map((item) => ({
      timestamp: Number(item[1]),
      value: Number(item[2])
    }));
  };

  const tempSeries = extractSeries("Temperature");
  const windSeries = extractSeries("Wind Speed");
  const pressureSeries = extractSeries("Air Pressure");
  const humiditySeries = extractSeries("Relative Humidity");

  // Parse statistical summary tables
  const parseColumnStats = (tableHeader: string) => {
    const tableRegex = new RegExp(
      `<th>${tableHeader}<\\/th>[\\s\\S]*?<\\/table>`,
      "i"
    );
    const tableBlock = html!.match(tableRegex);
    if (!tableBlock) return null;
    const block = tableBlock[0];

    const getVal = (label: string) => {
      const rowRegex = new RegExp(
        `<td>${label}<\\/td>\\s*<td>\\s*([+-]?\d+(?:\\.\\d+)?)`,
        "i"
      );
      const rm = block.match(rowRegex);
      return rm ? parseFloat(rm[1]) : null;
    };

    return {
      tempC: getVal("Temperature"),
      windMps: getVal("Wind Speed"),
      pressureHpa: getVal("Air Pressure"),
      humidityPct: getVal("Rel\\. Humidity")
    };
  };

  const avgStats = parseColumnStats("Average");
  const minStats = parseColumnStats("Minimum");
  const maxStats = parseColumnStats("Maxmimum") || parseColumnStats("Maximum");

  const result: ParsedStationLiveResult = {
    isLive: true,
    station,
    sourceUrl: usedUrl,
    observationDate: dateMatch ? dateMatch[1].trim() : "Live Automatic Weather Station",
    timestamp: new Date().toISOString(),
    kpi: {
      tempC: parsedTemp,
      humidityPct: parsedRh,
      pressureHpa: parsedAp,
      windKnots,
      windMps,
      windKmh,
      windStatus
    },
    stats: {
      temperature: {
        avg: avgStats?.tempC ?? null,
        min: minStats?.tempC ?? null,
        max: maxStats?.tempC ?? null
      },
      windSpeedMps: {
        avg: avgStats?.windMps ?? null,
        min: minStats?.windMps ?? null,
        max: maxStats?.windMps ?? null
      },
      airPressureHpa: {
        avg: avgStats?.pressureHpa ?? null,
        min: minStats?.pressureHpa ?? null,
        max: maxStats?.pressureHpa ?? null
      },
      relativeHumidityPct: {
        avg: avgStats?.humidityPct ?? null,
        min: minStats?.humidityPct ?? null,
        max: maxStats?.humidityPct ?? null
      }
    },
    series: {
      temperature: tempSeries,
      windSpeed: windSeries,
      airPressure: pressureSeries,
      humidity: humiditySeries
    }
  };

  // Cache result
  liveCache[station] = result;

  // Ingest directly into store
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
    stationName: station === "BHARATI" ? "Bharati Research Station (Larsemann Hills)" : "Maitri Research Station (Schirmacher Oasis)",
    sourceUrl: result.sourceUrl,
    observationDate: result.observationDate,
    lastSyncedAt: result.timestamp,
    windKnots: result.kpi.windKnots,
    windMps: result.kpi.windMps,
    stats: result.stats,
    series: result.series
  };
  currentEnv.liveFeed = feed;

  return result;
}

/**
 * Sync both Maitri and Bharati live stations concurrently
 */
export async function syncAllStationsLive(): Promise<{
  BHARATI: ParsedStationLiveResult | null;
  MAITRI: ParsedStationLiveResult | null;
  syncedAt: string;
}> {
  console.log(`[NCPOR Live Service] Synchronizing live AWS feeds for BHARATI & MAITRI...`);

  const [bharatiRes, maitriRes] = await Promise.allSettled([
    fetchStationLiveTelemetry("BHARATI"),
    fetchStationLiveTelemetry("MAITRI")
  ]);

  if (bharatiRes.status === "fulfilled") {
    console.log(
      `  🇦🇶 [BHARATI] Synced Live: ${bharatiRes.value.kpi.tempC}°C | Wind: ${bharatiRes.value.kpi.windKmh} km/h (${bharatiRes.value.kpi.windKnots} kts) | Baro: ${bharatiRes.value.kpi.pressureHpa} hPa`
    );
  } else {
    console.warn(`  ⚠️ [BHARATI] Live sync warning:`, bharatiRes.reason?.message);
  }

  if (maitriRes.status === "fulfilled") {
    console.log(
      `  🇦🇶 [MAITRI] Synced Live: ${maitriRes.value.kpi.tempC}°C | Wind: ${maitriRes.value.kpi.windKmh} km/h (${maitriRes.value.kpi.windKnots} kts) | Baro: ${maitriRes.value.kpi.pressureHpa} hPa`
    );
  } else {
    console.warn(`  ⚠️ [MAITRI] Live sync warning:`, maitriRes.reason?.message);
  }

  return {
    BHARATI: liveCache.BHARATI,
    MAITRI: liveCache.MAITRI,
    syncedAt: new Date().toISOString()
  };
}

/**
 * Retrieve cached or fresh live feed for a specific station
 */
export function getStationLiveFeed(station: StationId): ParsedStationLiveResult | null {
  return liveCache[station];
}

/**
 * Start periodic background polling of both stations
 */
export function startNcporLivePolling(intervalMinutes = 10): void {
  if (pollingIntervalTimer) {
    clearInterval(pollingIntervalTimer);
  }

  // Trigger immediate initial sync
  syncAllStationsLive().catch((err) => {
    console.warn("[NCPOR Live Service] Initial synchronization encountered an issue:", err.message);
  });

  const intervalMs = Math.max(2, intervalMinutes) * 60 * 1000;
  pollingIntervalTimer = setInterval(() => {
    syncAllStationsLive().catch((err) => {
      console.warn("[NCPOR Live Service] Periodic synchronization encountered an issue:", err.message);
    });
  }, intervalMs);

  console.log(`📡 [NCPOR Live Service] Background polling initialized (every ${intervalMinutes} minutes).`);
}
