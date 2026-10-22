import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { runScenario } from "../services/simulationService";

export const postSimulation = (req: Request, res: Response) => {
  const stationId = (req.body.stationId || req.query.station || "BHARATI").toString().toUpperCase() as StationId;
  const scenarioId = req.body.scenarioId || "EXTREME_WEATHER";
  const params = req.body.parameters || {};

  const result = runScenario(stationId, scenarioId, params);

  res.json({
    success: true,
    stationId,
    simulation: result
  });
};
