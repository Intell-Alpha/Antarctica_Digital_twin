import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { getAllStationsData, getStationDataById } from "../repositories/stationRepository";

export const getAllStations = (req: Request, res: Response) => {
  res.json({
    success: true,
    stations: getAllStationsData()
  });
};

export const getStationById = (req: Request, res: Response) => {
  const station = getStationDataById(req.params.id);
  if (!station) {
    return res.status(404).json({ success: false, error: "Station not found" });
  }
  res.json({
    success: true,
    station
  });
};
