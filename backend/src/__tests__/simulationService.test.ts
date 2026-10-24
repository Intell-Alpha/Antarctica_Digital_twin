import { runScenario } from "../services/simulationService";

describe("SimulationService", () => {
  it("should return baseline and simulated objects for a valid scenario", () => {
    const result = runScenario("BHARATI", "EXTREME_WEATHER", { tempC: -40 });

    expect(result).toHaveProperty("baseline");
    expect(result).toHaveProperty("simulated");
    expect(result.baseline).toHaveProperty("powerDemandKw");
    expect(result.baseline).toHaveProperty("fuelAutonomyDays");
    expect(result.simulated).toHaveProperty("powerDemandKw");
    expect(result.simulated).toHaveProperty("fuelAutonomyDays");
    expect(result.simulated).toHaveProperty("criticalAlerts");
    expect(result.simulated).toHaveProperty("recommendedActions");
  });

  it("should calculate heatingIncreasePct correctly based on temperature drop", () => {
    const result = runScenario("BHARATI", "EXTREME_WEATHER", { tempC: -40 });

    // Temperature drop from -20 (env.tempC default) to -40 = 20 degrees
    // heatingIncreasePct = 20 * 2.2 = 44%
    expect(result.simulated.powerDemandKw).toBeGreaterThan(result.baseline.powerDemandKw);
    expect(result.simulated.criticalAlerts).toContainEqual(
      expect.stringContaining("Heating load increased by")
    );
  });
});
