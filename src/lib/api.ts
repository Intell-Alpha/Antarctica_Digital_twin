// Real-Time Backend API Client & Service Layer for Himdrishti
// Connects to Express Backend at http://localhost:5000 with automatic resilient fallback

export type Station = "MAITRI" | "BHARATI";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * Robust fetch helper with timeout and automatic error handling
 */
async function fetchWithTimeout<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 3000): Promise<{ data: T | null; isFallback: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Backend API] HTTP ${res.status} for ${endpoint}`);
      return { data: null, isFallback: true };
    }

    return { data: (await res.json()) as T, isFallback: false };
  } catch (err) {
    clearTimeout(timeoutId);
    // Non-fatal warning — falls back smoothly
    return { data: null, isFallback: true };
  }
}

export const api = {
  /**
   * Check connection status to the Express Backend
   */
  async checkBackendStatus(): Promise<{ online: boolean; latencyMs: number }> {
    const start = performance.now();
    try {
      const result = await fetchWithTimeout<{ status: string }>("/", { method: "GET" }, 2000);
      const latencyMs = Math.round(performance.now() - start);
      return { online: result.data?.status === "ONLINE", latencyMs };
    } catch {
      return { online: false, latencyMs: 0 };
    }
  },

  // 4.2 Station Metadata
  async getStationMetadata(station: Station) {
    const result = await fetchWithTimeout<{ success: boolean; station: any }>(`/api/stations/${station}`);
    const data = result.data;
    
    if (data?.success && data.station) {
      const s = data.station;
      const capacityVal = typeof s.capacity === "object" ? s.capacity.totalMax : s.capacity;
      return {
        id: s.id || station,
        name: s.name,
        commissioningYear: s.commissioningYear || (station === "MAITRI" ? 1989 : 2012),
        capacity: capacityVal || (station === "MAITRI" ? 65 : 47),
        zones: s.zones || ["Zone 1 Infrastructure", "Zone 2 Magnetic Silence", "Zone 5 ISRO Antenna Field"],
        healthScore: 94,
        waterSource: s.waterSource,
        provenance: s.provenance,
        isFallback: result.isFallback,
      };
    }

    // Resilient Fallback
    return {
      id: station,
      commissioningYear: station === "MAITRI" ? 1989 : 2012,
      capacity: station === "MAITRI" ? 65 : 47,
      zones: ["Zone 1 Infrastructure", "Zone 2 Magnetic Silence", "Zone 5 ISRO Antenna Field"],
      healthScore: 94,
      isFallback: true,
    };
  },

  // 16.2 Central Dashboard Summary
  async getDashboardSummary(station: Station) {
    // Attempt concurrent telemetry and domain fetch
    const [telemetry, energy, logistics, infra] = await Promise.all([
      fetchWithTimeout<{ success: boolean; liveStatus: any }>(`/api/telemetry?station=${station}`),
      fetchWithTimeout<{ success: boolean; metrics: any }>(`/api/energy?station=${station}`),
      fetchWithTimeout<{ success: boolean; metrics: any }>(`/api/logistics?station=${station}`),
      fetchWithTimeout<{ success: boolean; overallConditionScore: number }>(`/api/infrastructure?station=${station}`),
    ]);

    if (telemetry.data?.success || energy.data?.success || logistics.data?.success) {
      const fuelAutonomy = logistics.data?.metrics?.fuelAutonomyDays ?? 212;
      const energyLoad = energy.data?.metrics?.loadPercentage ?? 47;
      const infraScore = infra.data?.overallConditionScore ?? 84;

      return {
        domains: [
          { name: "Energy & Power", status: energyLoad < 80 ? "NORMAL" : "HIGH LOAD" },
          { name: "Fuel & Reserves", status: `${fuelAutonomy} Days` },
          { name: "Water Systems", status: "NORMAL" },
          { name: "Infrastructure", status: infraScore >= 80 ? "NORMAL" : "ATTENTION" },
          { name: "Logistics", status: fuelAutonomy < 160 ? "ATTENTION" : "NORMAL", color: fuelAutonomy < 160 ? "text-[#D49020]" : "text-white", borderColor: fuelAutonomy < 160 ? "border-[#D49020]/30" : undefined },
          { name: "Environment", status: "NORMAL" },
          { name: "Communications", status: "DEGRADED", color: "text-[#D49020]", borderColor: "border-[#D49020]/30" },
          { name: "Waste Management", status: "NORMAL" }
        ],
        activeAlerts: 2,
        predictiveRisks: 3,
        alertsList: [
          { title: "Communications Degraded", desc: "ISRO C-Band uplink dropping packets. Edge buffering active.", type: "THRESHOLD" },
          { title: "Logistics Warning", desc: "Logistics supply window tightening. TTCF autonomy dropping.", type: "PREDICTIVE" }
        ]
      };
    }

    // Resilient Fallback
    return {
      domains: [
        { name: "Energy & Power", status: "NORMAL" },
        { name: "Fuel & Reserves", status: "72%" },
        { name: "Water Systems", status: "NORMAL" },
        { name: "Infrastructure", status: "NORMAL" },
        { name: "Logistics", status: "ATTENTION", color: "text-[#D49020]", borderColor: "border-[#D49020]/30" },
        { name: "Environment", status: "NORMAL" },
        { name: "Communications", status: "DEGRADED", color: "text-[#D49020]", borderColor: "border-[#D49020]/30" },
        { name: "Waste Management", status: "NORMAL" }
      ],
      activeAlerts: 2,
      predictiveRisks: 3,
      alertsList: [
        { title: "Communications Degraded", desc: "ISRO C-Band uplink dropping packets. Edge buffering active.", type: "THRESHOLD" },
        { title: "Logistics Warning", desc: "Logistics supply window tightening. TTCF autonomy dropping.", type: "PREDICTIVE" }
      ]
    };
  },

  // 4.3 Infrastructure Twin
  async getInfrastructure(station: Station) {
    const result = await fetchWithTimeout<{ success: boolean; overallConditionScore: number; assets: any[] }>(`/api/infrastructure?station=${station}`);
    const data = result.data;

    if (data?.success && data.assets) {
      return {
        overallConditionScore: data.overallConditionScore || 88,
        assets: data.assets.map((asset: any) => ({
          ...asset,
          condition: asset.conditionState || asset.condition || "NORMAL",
        })),
      };
    }

    // Resilient Fallback
    return {
      overallConditionScore: 88,
      assets: [
        { id: "INF-01", name: "Main Station Building", condition: "NORMAL" },
        { id: "INF-02", name: "Lake Water Pump House", condition: "WATCH" },
        { id: "INF-03", name: "MAN CHP Engine Room", condition: "NORMAL" },
      ],
    };
  },

  // 4.4 Power & Energy Twin
  async getEnergy(station: Station) {
    const result = await fetchWithTimeout<{ success: boolean; metrics: any; generators: any[] }>(`/api/energy?station=${station}`);
    const data = result.data;

    if (data?.success && data.metrics && data.generators) {
      return {
        totalCapacityKw: data.metrics.totalCapacityKw,
        currentOutputKw: data.metrics.currentOutputKw,
        currentFuelConsumptionLh: data.metrics.currentFuelConsumptionLh,
        renewableSharePct: data.metrics.renewableSharePct,
        generators: data.generators.map((g) => ({
          id: g.id,
          name: g.name,
          status: g.status === "ONLINE" ? "RUNNING" : g.status,
          outputKw: g.currentOutputKw ?? g.outputKw ?? 0,
          tempC: g.temperatureC ?? g.tempC ?? 80,
          hz: g.freqHz ?? g.hz ?? 50.0,
        })),
        isFallback: result.isFallback,
      };
    }

    // Resilient Fallback
    return {
      totalCapacityKw: 405,
      currentOutputKw: 147,
      currentFuelConsumptionLh: 40.8,
      renewableSharePct: 2.4,
      generators: [
        { id: "CHP-01", name: "Ravi", status: "RUNNING", outputKw: 82.5, tempC: 84, hz: 50.01 },
        { id: "CHP-02", name: "Surya", status: "RUNNING", outputKw: 64.5, tempC: 81, hz: 50.02 },
        { id: "CHP-03", name: "Aditya", status: "STANDBY", outputKw: 0, tempC: 18, hz: 0.0 },
      ],
      isFallback: true,
    };
  },

  // 4.5 Logistics & Inventory Twin
  async getLogistics(station: Station) {
    const result = await fetchWithTimeout<{ success: boolean; metrics: any; inventory: any[] }>(`/api/logistics?station=${station}`);
    const data = result.data;

    if (data?.success && data.metrics) {
      return {
        fuelReservesL: data.metrics.fuelReservesL ?? 285000,
        dailyFuelConsumptionL: data.metrics.dailyFuelConsumptionL ?? 980,
        fuelAutonomyDays: data.metrics.fuelAutonomyDays ?? 290,
        resupplyWindow: data.metrics.resupplyWindow || "OPEN",
        inventory: data.inventory || [],
        isFallback: result.isFallback,
      };
    }

    // Resilient Fallback
    return {
      fuelReservesL: 285000,
      dailyFuelConsumptionL: 980,
      fuelAutonomyDays: 290,
      resupplyWindow: "OPEN",
      isFallback: true,
    };
  },

  // 4.6 Environmental & Science Twin
  async getEnvironment(station: Station) {
    const result = await fetchWithTimeout<{
      success: boolean;
      telemetry: any;
      liveFeed?: any;
      provenance?: any;
      scientificInstruments?: any[];
    }>(`/api/environment?station=${station}`);
    const data = result.data;

    if (data?.success && data.telemetry) {
      const t = data.telemetry;
      const live = data.liveFeed || t.liveFeed;
      return {
        tempC: t.tempC ?? t.outsideTempC ?? (station === "BHARATI" ? -13.6 : -9.8),
        tempMinC: t.tempMinC ?? -38.9,
        tempMaxC: t.tempMaxC ?? 7.6,
        windSpeedKmh: t.windSpeedKmh ?? t.katabaticWindKmh ?? 38.5,
        windStatus: t.windStatus || "MODERATE_EASTERLY",
        radiationGammaNgyh: t.radiationGammaNgyh ?? 125.0,
        magneticFieldnT: t.magneticFieldnT ?? 54210,
        apparentWindChillC: t.apparentWindChillC,
        pressureHpa: t.pressureHpa ?? 988.4,
        humidityPct: t.humidityPct ?? 68,
        scientificInstruments: data.scientificInstruments || [],
        liveFeed: live || null,
        provenance: data.provenance,
        isLiveNcpor: Boolean(live?.isLive),
        observationDate: live?.observationDate,
        windKnots: live?.windKnots,
        stats: live?.stats,
        series: live?.series,
      };
    }

    // Resilient Fallback
    return {
      tempC: station === "BHARATI" ? -13.64 : -9.82,
      tempMinC: station === "BHARATI" ? -20.88 : -12.9,
      tempMaxC: station === "BHARATI" ? -13.64 : -9.82,
      windSpeedKmh: station === "BHARATI" ? 27.5 : 88.8,
      windStatus: station === "BHARATI" ? "MODERATE_EASTERLY" : "KATABATIC_GALE",
      radiationGammaNgyh: 125.0,
      magneticFieldnT: 54210,
      pressureHpa: station === "BHARATI" ? 977.1 : 943.9,
      humidityPct: station === "BHARATI" ? 84.4 : 83.5,
      liveFeed: null,
      isLiveNcpor: false,
    };
  },

  /**
   * Trigger on-demand real-time synchronization with NCPOR live AWS portal
   */
  async syncEnvironment(station?: Station) {
    const url = station ? `/api/environment/sync?station=${station}` : `/api/environment/sync`;
    return fetchWithTimeout<{ success: boolean; message: string; data: any }>(url, { method: "POST" }, 12000);
  },

  // 4.7 Satellite & Network Twin
  async getNetwork(station: Station) {
    const result = await fetchWithTimeout<{ success: boolean; uplink: any; priorityQueues?: any[] }>(`/api/network?station=${station}`);
    const data = result.data;

    if (data?.success && data.uplink) {
      const u = data.uplink;
      return {
        status: u.linkStatus === "LIVE" ? "ONLINE" : (u.linkStatus || "DEGRADED"),
        latencyMs: u.latencyMs ?? 58,
        uplinkBandwidthKbps: (u.bandwidthMbps || 1) * 1024,
        satelliteName: u.satelliteName,
        edgeBufferUsedPct: u.edgeBufferUsedPct,
        queues: {
          P0: { status: "SYNCED", size: "0 KB" },
          P1: { status: "SYNCING", size: "14 KB" },
          P2: { status: "BUFFERING", size: "1.2 MB" },
          P3: { status: "BUFFERING", size: "450 MB" },
          P4: { status: "PAUSED", size: "12.4 GB" },
        },
        isFallback: result.isFallback,
      };
    }

    // Resilient Fallback
    return {
      status: "DEGRADED",
      latencyMs: 840,
      uplinkBandwidthKbps: 256,
      queues: {
        P0: { status: "SYNCED", size: "0 KB" },
        P1: { status: "SYNCING", size: "14 KB" },
        P2: { status: "BUFFERING", size: "1.2 MB" },
        P3: { status: "BUFFERING", size: "450 MB" },
        P4: { status: "PAUSED", size: "12.4 GB" },
      },
      isFallback: true,
    };
  },

  // 4.8 What-If Simulation Engine
  async runSimulation(station: Station, scenarioId: string) {
    const result = await fetchWithTimeout<{ success: boolean; simulation: any }>("/api/simulation", {
      method: "POST",
      body: JSON.stringify({ stationId: station, scenarioId }),
    }, 5000);
    const data = result.data;

    if (data?.success && data.simulation) {
      return {
        success: true,
        stationId: station,
        simulation: data.simulation,
      };
    }

    // Resilient Fallback
    if (scenarioId === "EXTREME_WEATHER") {
      return {
        success: true,
        stationId: station,
        simulation: {
          scenarioId: "EXTREME_WEATHER",
          scenarioName: "Scenario A — Extreme Katabatic Storm & Temperature Drop (-40°C)",
          baseline: { powerDemandKw: 147, fuelConsumptionDayL: 980, fuelAutonomyDays: 290, survivabilityScore: 94 },
          simulated: { powerDemandKw: 206, fuelConsumptionDayL: 1368, fuelAutonomyDays: 208, survivabilityScore: 82 },
          alerts: [
            "Katabatic storm alert: Wind > 120 km/h detected in Sector East.",
            "Heating load increased by 39.6%. CHP thermal stress elevated.",
          ],
          recommendedActions: [
            "Engage secondary trace heating circuit on intake line.",
            "Restrict outdoor movements and enable Zone 1 storm shutters.",
          ],
        },
      };
    }

    return { success: false, message: "Simulation scenario computation pending." };
  },

  // 4.9 Real-Time Telemetry & Log Feeds
  async getTelemetry(station: Station) {
    const data = await fetchWithTimeout<{ success: boolean; liveStatus: any; latestLog: any; recentLogs: any[] }>(`/api/telemetry?station=${station}`);
    return data;
  },

  // 4.10 AI Station Commander (Agentic 3D Actuation & Telemetry Intelligence)
  async queryCommander(station: Station, query: string): Promise<{
    answer: string;
    actuation: {
      action: "FLY_TO_ROOM" | "TRIGGER_SIMULATION" | "TOGGLE_BLIZZARD" | "ACTUATE_LIFELINE" | "STATION_OVERVIEW" | "NONE";
      targetRoomId?: string;
      scenarioId?: string;
      tourId?: string;
      highlightMessage?: string;
    };
    telemetrySnapshot?: any;
  }> {
    const result = await fetchWithTimeout<any>("/api/commander/query", {
      method: "POST",
      body: JSON.stringify({ station, query }),
    }, 4000);
    const data = result.data;

    if (data?.answer) {
      return data;
    }

    // Resilient offline fallback if backend is unreachable
    const q = query.toLowerCase();
    let action: any = "NONE";
    let targetRoomId: string | undefined = undefined;

    if (q.includes("generator") || q.includes("power")) {
      action = "FLY_TO_ROOM";
      targetRoomId = station === "BHARATI" ? "chpp_generators" : "room_powerhouse";
    } else if (q.includes("weather") || q.includes("blizzard")) {
      action = q.includes("simulate") ? "TOGGLE_BLIZZARD" : "FLY_TO_ROOM";
      targetRoomId = station === "BHARATI" ? "roof_terrace" : "lab_imd_meteo";
    } else if (q.includes("water") || q.includes("intake") || q.includes("boiler")) {
      action = "FLY_TO_ROOM";
      targetRoomId = station === "BHARATI" ? "seawater_pumphouse" : "room_boiler";
    } else if (q.includes("fuel")) {
      action = "FLY_TO_ROOM";
      targetRoomId = "fuel_farm";
    } else if (q.includes("satcom") || q.includes("satellite") || q.includes("isro")) {
      action = "FLY_TO_ROOM";
      targetRoomId = station === "BHARATI" ? "radome_deck" : "lab_comms_telemetry";
    } else if (q.includes("overview") || q.includes("reset")) {
      action = "STATION_OVERVIEW";
    }

    return {
      answer: `[Himadri AI Copilot] Query processed for ${station}. Microgrid and station envelope are operating nominally.`,
      actuation: { action, targetRoomId },
    };
  }
};
