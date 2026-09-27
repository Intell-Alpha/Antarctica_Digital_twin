import {
  StationId,
  ENVIRONMENT_DATA,
  GENERATORS_DATA,
  LOGISTICS_INVENTORY,
  STATIONS,
  SimulationResult
} from "../store/digitalTwinStore";

export class DigitalTwinEngine {
  public static runScenario(
    stationId: StationId,
    scenarioId: string,
    params: Record<string, any> = {}
  ): SimulationResult {
    const env = ENVIRONMENT_DATA[stationId];
    const generators = GENERATORS_DATA[stationId];
    const totalGenOutput = generators.reduce((acc, g) => acc + g.currentOutputKw, 0);
    const fuelReserves = LOGISTICS_INVENTORY[stationId][0].currentStockUnits;
    const currentDailyFuel = LOGISTICS_INVENTORY[stationId][0].dailyConsumptionUnits;
    const currentAutonomy = Math.round(fuelReserves / currentDailyFuel);

    const baseline = {
      powerDemandKw: totalGenOutput,
      fuelConsumptionDayL: currentDailyFuel,
      fuelAutonomyDays: currentAutonomy,
      survivabilityScore: 94,
      stationHealth: "OPTIMAL"
    };

    let simPowerKw = totalGenOutput;
    let simFuelDayL = currentDailyFuel;
    let criticalAlerts: string[] = [];
    let recommendedActions: string[] = [];
    let scenarioName = scenarioId;

    if (scenarioId === "EXTREME_WEATHER") {
      scenarioName = "Scenario A — Extreme Katabatic Storm & Temperature Drop (-40°C)";
      const tempDrop = params.tempC ? Math.abs(params.tempC - env.tempC) : 18;
      const heatingIncreasePct = tempDrop * 2.2;
      simPowerKw = Math.round(totalGenOutput * (1 + heatingIncreasePct / 100));
      simFuelDayL = Math.round(currentDailyFuel * (1 + heatingIncreasePct / 100));
      criticalAlerts.push(`Katabatic storm alert: Wind > 120 km/h detected in Sector East.`);
      criticalAlerts.push(`Heating load increased by ${heatingIncreasePct.toFixed(1)}%. CHP thermal stress elevated.`);
      recommendedActions.push("Engage secondary trace heating circuit on intake line.");
      recommendedActions.push("Restrict outdoor movements and enable Zone 1 storm shutters.");
    } else if (scenarioId === "GENERATOR_FAILURE") {
      scenarioName = "Scenario B — Primary Generator Trip / Failure";
      const primaryGen = generators[0];
      const lostPower = primaryGen.currentOutputKw;
      simPowerKw = totalGenOutput - lostPower;
      simFuelDayL = Math.round(currentDailyFuel * 0.75);
      criticalAlerts.push(`CRITICAL: ${primaryGen.name} TRIPPED! Lost ${lostPower} kW generation.`);
      criticalAlerts.push(`UPS Battery auto-engaged. Instantaneous load shedding initiated.`);
      recommendedActions.push(`Spin up standby generator (${generators[2]?.name || "Backup Unit"}).`);
      recommendedActions.push("Isolate non-critical scientific loads in Zone 2 & 4.");
    } else if (scenarioId === "INCREASED_ENERGY_DEMAND") {
      scenarioName = "Scenario C — Peak Scientific Campaign & Station Expansion (+40% Load)";
      simPowerKw = Math.round(totalGenOutput * 1.4);
      simFuelDayL = Math.round(currentDailyFuel * 1.38);
      criticalAlerts.push("Peak load threshold warning: Generation capacity at 88%.");
      recommendedActions.push("Monitor CHP oil temperature & glycol coolant flow.");
      recommendedActions.push("Schedule fuel transfer from Tank Module 3 to Day Tanks.");
    } else if (scenarioId === "SUPPLY_DELAY") {
      scenarioName = "Scenario D — Austral Summer Resupply Vessel Sea-Ice Blockade (60-day delay)";
      const delayDays = params.delayDays || 60;
      simPowerKw = totalGenOutput;
      simFuelDayL = currentDailyFuel;
      criticalAlerts.push(`Resupply vessel delayed by ${delayDays} days due to heavy sea-ice pack in Quilty Bay.`);
      criticalAlerts.push(`Predicted fuel autonomy drops from ${currentAutonomy} days to ${currentAutonomy - delayDays} days.`);
      recommendedActions.push("Implement eco-mode heating schedules in non-essential modules.");
      recommendedActions.push("Request DROMLAN air cargo emergency drop if autonomy drops below 100 days.");
    } else if (scenarioId === "COMMUNICATION_OUTAGE") {
      scenarioName = "Scenario E — Orbital Satellite Link Interruption (Store & Forward Test)";
      simPowerKw = totalGenOutput;
      simFuelDayL = currentDailyFuel;
      criticalAlerts.push("INSAT-3DR satellite signal lost. Switched to Edge Gateway buffering mode.");
      criticalAlerts.push("P0 Emergency & P1 Critical Infra logs queued in NVMe storage.");
      recommendedActions.push("Verify edge store-and-forward buffer capacity.");
      recommendedActions.push("Re-orient C-band dish backup toward contingency satellite.");
    }

    const simAutonomyDays = Math.round(fuelReserves / simFuelDayL);
    const scoreDrop = simAutonomyDays < 150 ? 25 : simAutonomyDays < 200 ? 12 : 5;
    const survivabilityScore = Math.max(30, 94 - scoreDrop - (scenarioId === "GENERATOR_FAILURE" ? 20 : 0));
    const stationHealth = survivabilityScore > 80 ? "NORMAL" : survivabilityScore > 60 ? "WATCH" : "CRITICAL";

    return {
      scenarioId,
      scenarioName,
      parameters: params,
      baseline,
      simulated: {
        powerDemandKw: simPowerKw,
        fuelConsumptionDayL: simFuelDayL,
        fuelAutonomyDays: simAutonomyDays,
        survivabilityScore,
        stationHealth,
        criticalAlerts,
        recommendedActions
      }
    };
  }
}
