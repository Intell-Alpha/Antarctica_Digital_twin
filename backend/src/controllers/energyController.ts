import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { getEnergyMetrics } from "../repositories/energyRepository";

export const getEnergy = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const metrics = getEnergyMetrics(stationId);

  res.json({
    success: true,
    stationId,
    metrics: {
      totalCapacityKw: metrics.totalCapacityKw,
      currentOutputKw: metrics.currentOutputKw,
      loadPercentage: Math.round(metrics.loadPercentage),
      currentFuelConsumptionLh: metrics.currentFuelConsumptionLh,
      batteryUpsStatus: "NOMINAL - 100% CHARGED",
      renewableSharePct: metrics.renewableSharePct
    },
    generators: metrics.generators
  });
};
