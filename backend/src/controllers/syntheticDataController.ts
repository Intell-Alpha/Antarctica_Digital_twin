import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import {
  BHARATI_HISTORICAL_METEOROLOGY,
  MAITRI_HISTORICAL_METEOROLOGY,
  generateSynthetic24hTimeSeries
} from "../store/syntheticData";

export const getSyntheticDatasets = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";

  const historicalMeteorology =
    stationId === "BHARATI" ? BHARATI_HISTORICAL_METEOROLOGY : MAITRI_HISTORICAL_METEOROLOGY;

  const timeSeries24h = generateSynthetic24hTimeSeries(stationId);

  res.json({
    success: true,
    stationId,
    description: "Synthetic Telemetry & Historical Dataset Storage",
    historicalMeteorology2015_2022: historicalMeteorology,
    synthetic24hTimeSeriesRecordsCount: timeSeries24h.length,
    synthetic24hTimeSeries: timeSeries24h
  });
};
