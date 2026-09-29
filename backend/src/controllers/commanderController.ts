import { Request, Response } from "express";
import { getStationLiveFeed } from "../services/ncporLiveService";
import {
  StationId,
  ENVIRONMENT_DATA,
  GENERATORS_DATA,
  LOGISTICS_INVENTORY,
  SATELLITE_UPLINK,
} from "../store/digitalTwinStore";

export interface AIActuation {
  action: "FLY_TO_ROOM" | "TRIGGER_SIMULATION" | "TOGGLE_BLIZZARD" | "ACTUATE_LIFELINE" | "STATION_OVERVIEW" | "NONE";
  targetRoomId?: string;
  scenarioId?: string;
  tourId?: string;
  highlightMessage?: string;
}

export interface AICommanderResponse {
  answer: string;
  actuation: AIActuation;
  telemetrySnapshot?: {
    station: string;
    temperatureC: number;
    windSpeedKmh: number;
    powerOutputKw: number;
    fuelAutonomyDays: number;
    satelliteLatencyMs: number;
    isLiveFeed: boolean;
  };
}

export const processCommanderQuery = (req: Request, res: Response) => {
  try {
    const station = (req.body.station || "BHARATI").toUpperCase() as StationId;
    const query = String(req.body.query || "").trim();

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const q = query.toLowerCase();

    // Live or cached environment
    const liveFeed = getStationLiveFeed(station);
    const staticEnv = ENVIRONMENT_DATA[station] || ENVIRONMENT_DATA.BHARATI;
    const tempC = liveFeed?.kpi.tempC ?? staticEnv.tempC;
    const windSpeedKmh = liveFeed?.kpi.windKmh ?? staticEnv.windSpeedKmh;
    const pressureHpa = liveFeed?.kpi.pressureHpa ?? staticEnv.pressureHpa;
    const isLive = !!liveFeed?.isLive;

    // Generators & Power
    const gens = GENERATORS_DATA[station] || [];
    const totalPowerKw = gens.reduce((sum, g) => sum + g.currentOutputKw, 0) || (station === "BHARATI" ? 147.0 : 142.0);

    // Logistics & Fuel
    const fuelInv = LOGISTICS_INVENTORY[station]?.[0];
    const fuelDays = fuelInv ? fuelInv.daysRemaining : (station === "BHARATI" ? 290 : 211);

    // Satcom
    const sat = SATELLITE_UPLINK[station] || SATELLITE_UPLINK.BHARATI;

    const snapshot = {
      station,
      temperatureC: tempC,
      windSpeedKmh,
      powerOutputKw: totalPowerKw,
      fuelAutonomyDays: fuelDays,
      satelliteLatencyMs: sat.latencyMs,
      isLiveFeed: isLive,
    };

    let answer = "";
    let actuation: AIActuation = { action: "NONE" };

    // 1. POWER / GENERATORS / CHPP
    if (q.includes("generator") || q.includes("power") || q.includes("kw") || q.includes("engine") || q.includes("chpp")) {
      const room = station === "BHARATI" ? "chpp_generators" : "room_powerhouse";
      actuation = {
        action: "FLY_TO_ROOM",
        targetRoomId: room,
        highlightMessage: `Directing camera to ${station} Power Generation Hall`,
      };
      answer = `[Station Powerhouse Active] Current microgrid generation is ${totalPowerKw} kW across active generator sets at 415V 50Hz. Thermal cogeneration heat recovery is pre-heating hydronic circulation to the station core. Microgrid health is NOMINAL.`;
    }
    // 2. WEATHER / BLIZZARD / TEMPERATURE
    else if (q.includes("blizzard") || q.includes("wind") || q.includes("weather") || q.includes("temp") || q.includes("storm") || q.includes("katabatic")) {
      if (q.includes("simulate") || q.includes("trigger") || q.includes("test")) {
        actuation = {
          action: "TOGGLE_BLIZZARD",
          scenarioId: "EXTREME_WEATHER",
          highlightMessage: `Engaging 105 km/h Katabatic Blizzard & Whiteout Simulation`,
        };
        answer = `[Emergency Protocol Engaged] Actuating katabatic blizzard simulation. Wind particle drift accelerated to 105 km/h. Frost vignette and whiteout fog enforced across ${station} terrain.`;
      } else {
        const room = station === "BHARATI" ? "roof_terrace" : "lab_imd_meteo";
        actuation = {
          action: "FLY_TO_ROOM",
          targetRoomId: room,
          highlightMessage: `Directing camera to Atmospheric Weather Observatory`,
        };
        answer = `[${isLive ? "Live NCPOR Sensor" : "Station"} Telemetry] Ambient temperature is ${tempC}°C with katabatic winds at ${windSpeedKmh} km/h and barometric pressure at ${pressureHpa} hPa. Station envelope insulation is operating at nominal thermal barrier efficiency.`;
      }
    }
    // 3. WATER / LAKE PRIYADARSHINI / RO DESALINATION
    else if (q.includes("water") || q.includes("lake") || q.includes("intake") || q.includes("boiler") || q.includes("desalination") || q.includes("ro ")) {
      const room = station === "BHARATI" ? "seawater_pumphouse" : "room_boiler";
      actuation = {
        action: "FLY_TO_ROOM",
        targetRoomId: room,
        tourId: "water",
        highlightMessage: `Navigating to ${station} Freshwater Lifecycle & Intake`,
      };
      answer = `[Freshwater Lifeline Online] ${
        station === "BHARATI"
          ? "Seawater pump house at Quilty Bay is drawing polar water into the 2-stage RO desalination membranes, delivering 4,200 L/day potable water."
          : "Priyadarshini Lake 280m heated gantry intake is drawing sub-ice freshwater into the central boiler calorifiers at +68°C."
      } Heat-trace circuits are verified ACTIVE with zero ice crystallization detected.`;
    }
    // 4. FUEL / ATF-50 / DIESEL RESERVES
    else if (q.includes("fuel") || q.includes("diesel") || q.includes("tank") || q.includes("autonomy") || q.includes("atf")) {
      actuation = {
        action: "FLY_TO_ROOM",
        targetRoomId: "fuel_farm",
        tourId: "fuel",
        highlightMessage: `Directing camera to Arctic ATF-50 Bulk Fuel Storage`,
      };
      answer = `[Logistics Status] Station bulk fuel farm contains Arctic ATF-50 fuel reserves providing ${fuelDays} days of total mission autonomy. Fuel supply headers and day tanks are maintained at +18°C by jacketed heat-tracing.`;
    }
    // 5. SATCOM / ISRO / RADOME / TELEMETRY
    else if (q.includes("satcom") || q.includes("satellite") || q.includes("isro") || q.includes("antenna") || q.includes("radome") || q.includes("comms")) {
      const room = station === "BHARATI" ? "radome_deck" : "lab_comms_telemetry";
      actuation = {
        action: "FLY_TO_ROOM",
        targetRoomId: room,
        highlightMessage: `Navigating to ISRO Satellite Radome Complex`,
      };
      answer = `[ISRO Telemetry Link Nominal] Dual C/Ku-band satellite ground tracking station is locked onto GSAT satellites with ${sat.latencyMs}ms store-and-forward round-trip latency. Remote SCADA telemetry buffer is synchronized with NCPOR headquarters in Goa.`;
    }
    // 6. SCIENCE / GEOMAGNETIC / AURORA / LABS
    else if (q.includes("science") || q.includes("aurora") || q.includes("geomag") || q.includes("lab") || q.includes("biology") || q.includes("iig")) {
      const room = station === "BHARATI" ? "lab_bio" : "lab_kamet_geomag";
      actuation = {
        action: "FLY_TO_ROOM",
        targetRoomId: room,
        highlightMessage: `Inspecting Science & Research Observatories`,
      };
      answer = `[Scientific Payloads Active] ${
        station === "BHARATI"
          ? "Level 02 Microbiology and Geosciences laboratories are processing soil, permafrost, and environmental radiation samples with continuous HEPA bio-containment."
          : "IIG Kamet Geomagnetic Observatory is recording 3-axis fluxgate magnetometer readings and Southern Lights (Aurora Australis) magnetospheric disturbances."
      }`;
    }
    // 7. MEDICAL / HOSPITAL / SURGERY
    else if (q.includes("hospital") || q.includes("medical") || q.includes("surgery") || q.includes("ot") || q.includes("doctor") || q.includes("patient")) {
      const room = station === "BHARATI" ? "hospital" : "room_hospital";
      actuation = {
        action: "FLY_TO_ROOM",
        targetRoomId: room,
        highlightMessage: `Navigating to Critical Care Suite & Operating Theater`,
      };
      answer = `[Medical Suite Ready] The surgical operating theater and tele-medicine suite are in 100% sterile standby status. Defibrillator, positive-pressure air filtration, and emergency life support oxygen generators are verified OPERATIONAL.`;
    }
    // 8. CRISIS SIMULATION / WHAT-IF
    else if (q.includes("what if") || q.includes("failure") || q.includes("simulate") || q.includes("crisis") || q.includes("blackout")) {
      actuation = {
        action: "TRIGGER_SIMULATION",
        scenarioId: q.includes("weather") ? "EXTREME_WEATHER" : "GENERATOR_FAILURE",
        highlightMessage: `Triggering Dynamic Station What-If Simulator`,
      };
      answer = `[Simulation Engine Initialized] Running dynamic digital twin predictive physics model for crisis assessment. Load-shedding priorities calculated and equipment stress limits plotted.`;
    }
    // 9. OVERVIEW / RESET
    else if (q.includes("overview") || q.includes("reset") || q.includes("campus") || q.includes("outside") || q.includes("station view")) {
      actuation = {
        action: "STATION_OVERVIEW",
        highlightMessage: `Returning to full ${station} station campus overview`,
      };
      answer = `[Campus Overview] Repositioning camera to macroscopic overview of ${station} Research Station, all buildings, and surrounding polar terrain.`;
    }
    // DEFAULT GENERAL STATION INTELLIGENCE
    else {
      answer = `[Himadri AI Copilot] ${station} Digital Twin is operating nominally. Microgrid is at ${totalPowerKw} kW, ambient temperature is ${tempC}°C with ${windSpeedKmh} km/h winds, and fuel autonomy stands at ${fuelDays} days. You can command me to navigate to any facility, trigger blizzards, inspect pipelines, or simulate equipment failures.`;
    }

    const payload: AICommanderResponse = {
      answer,
      actuation,
      telemetrySnapshot: snapshot,
    };

    return res.json(payload);
  } catch (error) {
    console.error("[Commander Controller] Error processing AI query", error);
    return res.status(500).json({ error: "Failed to process commander query" });
  }
};
