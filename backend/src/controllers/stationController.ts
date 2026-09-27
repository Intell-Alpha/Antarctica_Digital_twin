import { Request, Response } from "express";
import { STATIONS, StationId } from "../store/digitalTwinStore";

export const getAllStations = (req: Request, res: Response) => {
  res.json({
    success: true,
    stations: Object.values(STATIONS)
  });
};

export const getStationById = (req: Request, res: Response) => {
  const id = req.params.id.toUpperCase() as StationId;
  const station = STATIONS[id];
  if (!station) {
    return res.status(404).json({ success: false, error: "Station not found" });
  }
  res.json({
    success: true,
    station
  });
};
