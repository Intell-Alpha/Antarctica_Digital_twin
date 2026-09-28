import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { TelemetryGenerator } from "../services/telemetryGenerator";

export const getTelemetry = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const snapshot = TelemetryGenerator.getLiveSnapshot(stationId);

  res.json({
    success: true,
    ...snapshot
  });
};
