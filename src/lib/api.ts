// Mock API Service Layer for Antarctica Digital Twin
// Maps directly to the Backend API Specification

export type Station = "MAITRI" | "BHARATI";

export const api = {
  // 4.2 Station Metadata
  async getStationMetadata(station: Station) {
    // Simulating network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id: station,
      commissioningYear: station === "MAITRI" ? 1989 : 2012,
      capacity: station === "MAITRI" ? 65 : 47,
      zones: ["Zone 1 Infrastructure", "Zone 2 Magnetic Silence", "Zone 5 ISRO Antenna Field"],
      healthScore: 94,
    };
  },

  // 16.2 Central Dashboard Summary
  async getDashboardSummary(station: Station) {
    await new Promise((resolve) => setTimeout(resolve, 300));
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
    return {
      overallConditionScore: 88,
      assets: [
        { id: "INF-01", name: "Main Station Building", condition: "NORMAL" },
        { id: "INF-02", name: "Lake Water Pump House", condition: "WATCH" },
        { id: "INF-03", name: "MAN CHP Engine Room", condition: "NORMAL" },
      ]
    };
  },

  // 4.4 Power & Energy Twin
  async getEnergy(station: Station) {
    return {
      totalCapacityKw: 405,
      currentOutputKw: 147,
      currentFuelConsumptionLh: 40.8,
      renewableSharePct: 2.4,
      generators: [
        { id: "CHP-01", name: "Ravi", status: "RUNNING", outputKw: 82.5, tempC: 84, hz: 50.01 },
        { id: "CHP-02", name: "Surya", status: "RUNNING", outputKw: 64.5, tempC: 81, hz: 50.02 },
        { id: "CHP-03", name: "Aditya", status: "STANDBY", outputKw: 0, tempC: 18, hz: 0.0 },
      ]
    };
  },

  // 4.5 Logistics & Inventory Twin
  async getLogistics(station: Station) {
    return {
      fuelReservesL: 285000,
      dailyFuelConsumptionL: 980,
      fuelAutonomyDays: 290,
      resupplyWindow: "OPEN",
    };
  },

  // 4.6 Environmental & Science Twin
  async getEnvironment(station: Station) {
    return {
      tempC: -22.4,
      windSpeedKmh: 38.5,
      radiationGammaNgyh: 125.0,
      magneticFieldnT: 54210,
    };
  },

  // 4.7 Satellite & Network Twin
  async getNetwork(station: Station) {
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
      }
    };
  },

  // 4.8 What-If Simulation Engine
  async runSimulation(station: Station, scenarioId: string) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate compute time
    
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
            "Heating load increased by 39.6%. CHP thermal stress elevated."
          ],
          recommendedActions: [
            "Engage secondary trace heating circuit on intake line.",
            "Restrict outdoor movements and enable Zone 1 storm shutters."
          ]
        }
      };
    }
    
    return { success: false, message: "Simulation scenario not fully mocked yet." };
  }
};
