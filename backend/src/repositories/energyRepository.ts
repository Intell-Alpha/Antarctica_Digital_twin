import { GENERATORS_DATA, StationId, GeneratorAsset } from "../store/digitalTwinStore";

export function getGeneratorsByStation(stationId: StationId): GeneratorAsset[] {
  return GENERATORS_DATA[stationId] || [];
}

export function getEnergyMetrics(stationId: StationId) {
  const generators = getGeneratorsByStation(stationId);
  const totalCapacityKw = generators.reduce((sum, g) => sum + g.ratedCapacityKw, 0);
  const currentOutputKw = generators.reduce((sum, g) => sum + g.currentOutputKw, 0);
  const currentFuelConsumptionLh = generators.reduce((sum, g) => sum + g.fuelConsumptionLh, 0);
  const loadPercentage = totalCapacityKw > 0 ? (currentOutputKw / totalCapacityKw) * 100 : 0;
  const renewableSharePct = stationId === "BHARATI" ? 8.5 : 4.2;

  return {
    totalCapacityKw,
    currentOutputKw,
    currentFuelConsumptionLh,
    loadPercentage,
    renewableSharePct,
    generators
  };
}
