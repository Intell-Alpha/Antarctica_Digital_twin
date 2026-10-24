import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { getInfrastructureMetrics } from "../repositories/infrastructureRepository";

export const getInfrastructure = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const { overallConditionScore, assets } = getInfrastructureMetrics(stationId);

  res.json({
    success: true,
    stationId,
    totalAssets: assets.length,
    overallConditionScore: Math.round(overallConditionScore),
    assets
  });
};
