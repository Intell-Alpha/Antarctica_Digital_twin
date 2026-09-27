import { Request, Response } from "express";
import { GENERATORS_DATA, StationId } from "../store/digitalTwinStore";

export const getEnergy = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const generators = GENERATORS_DATA[stationId] || [];
  const totalCapacityKw = generators.reduce((acc, g) => acc + g.ratedCapacityKw, 0);
  const currentOutputKw = generators.reduce((acc, g) => acc + g.currentOutputKw, 0);
  const currentFuelConsumptionLh = generators.reduce((acc, g) => acc + g.fuelConsumptionLh, 0);

  res.json({
    success: true,
    stationId,
    metrics: {
      totalCapacityKw,
      currentOutputKw,
      loadPercentage: Math.round((currentOutputKw / (totalCapacityKw || 1)) * 100),
      currentFuelConsumptionLh,
      batteryUpsStatus: "NOMINAL - 100% CHARGED",
      renewableSharePct: stationId === "BHARATI" ? 8.5 : 4.2
    },
    generators
  });
};
