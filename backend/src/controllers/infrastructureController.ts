import { Request, Response } from "express";
import { INFRASTRUCTURE_DATA, StationId } from "../store/digitalTwinStore";

export const getInfrastructure = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const assets = INFRASTRUCTURE_DATA[stationId] || [];
  const avgCondition = Math.round(
    assets.reduce((sum, a) => sum + a.conditionScore, 0) / (assets.length || 1)
  );

  res.json({
    success: true,
    stationId,
    totalAssets: assets.length,
    overallConditionScore: avgCondition,
    assets
  });
};
