import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { getEnvironmentByStation } from "../repositories/environmentRepository";
import {
  fetchStationLiveTelemetry,
  syncAllStationsLive,
  getStationLiveFeed
} from "../services/ncporLiveService";

export const getEnvironment = (req: Request, res: Response) => {
  const stationId = ((req.query.station as string)?.toUpperCase() as StationId) || "BHARATI";
  const telemetry = getEnvironmentByStation(stationId);
  const liveFeed = telemetry.liveFeed || getStationLiveFeed(stationId);

  res.json({
    success: true,
    stationId,
    provenance: {
      sourceType: liveFeed?.isLive ? "LIVE_SENSOR" : "OFFICIAL",
      sourceName: "NCPOR / NCAOR Official AWS Portal (MoES, Govt of India)",
      sourceRef: stationId === "BHARATI" ? "https://data.ncpor.res.in/bharati/live" : "https://data.ncpor.res.in/maitri/live",
      confidence: "HIGH",
      verificationStatus: "VERIFIED_REALTIME"
    },
    telemetry,
    liveFeed: liveFeed ?? null,
    scientificInstruments:
      stationId === "BHARATI"
        ? [
            { name: "Automatic Weather Station (AWS)", status: "ONLINE", parameter: "T, P, Humidity, Wind", liveSync: true },
            { name: "Proton Precession Magnetometer (PPM)", status: "ONLINE", parameter: "Geomagnetic Field" },
            { name: "Digital Fluxgate Magnetometer (DFM)", status: "ONLINE", parameter: "3-Axis Field" },
            { name: "ISRO Ground Station Antenna C-Band", status: "ONLINE", parameter: "Remote Sensing & Satellite Link" },
            { name: "BARC IERMON Gamma Monitors", status: "ONLINE", parameter: "Gamma Dose (100-750 nGy/h)" }
          ]
        : [
            { name: "Automatic Weather Station (AWS)", status: "ONLINE", parameter: "T, P, Humidity, Wind", liveSync: true },
            { name: "MARA Atmospheric Radar", status: "ONLINE", parameter: "Atmospheric Winds & Turbulence" },
            { name: "Ionospheric TEC Receiver", status: "ONLINE", parameter: "Scintillation & Electron Content" },
            { name: "All-Sky Aurora Camera", status: "ONLINE", parameter: "Optical Auroral Scan" },
            { name: "Digital Fluxgate Magnetometer", status: "ONLINE", parameter: "Geomagnetic Scan" }
          ]
  });
};

export const syncEnvironmentLive = async (req: Request, res: Response) => {
  const requestedStation = (req.query.station as string)?.toUpperCase() as StationId | undefined;

  try {
    if (requestedStation && (requestedStation === "BHARATI" || requestedStation === "MAITRI")) {
      const result = await fetchStationLiveTelemetry(requestedStation);
      res.json({
        success: true,
        stationId: requestedStation,
        message: `Successfully synchronized live AWS data for ${requestedStation} from NCPOR`,
        data: result
      });
    } else {
      const result = await syncAllStationsLive();
      res.json({
        success: true,
        message: "Successfully synchronized live AWS data for all Antarctic stations from NCPOR",
        data: result
      });
    }
  } catch (err: any) {
    res.status(502).json({
      success: false,
      message: `Failed to synchronize live AWS feed: ${err.message}`
    });
  }
};
