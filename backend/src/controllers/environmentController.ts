import { Request, Response } from "express";
import { ENVIRONMENT_DATA, StationId } from "../store/digitalTwinStore";

export const getEnvironment = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const telemetry = ENVIRONMENT_DATA[stationId];

  res.json({
    success: true,
    stationId,
    telemetry,
    scientificInstruments:
      stationId === "BHARATI"
        ? [
            { name: "Automatic Weather Station (AWS)", status: "ONLINE", parameter: "T, P, Humidity, Wind" },
            { name: "Proton Precession Magnetometer (PPM)", status: "ONLINE", parameter: "Geomagnetic Field" },
            { name: "Digital Fluxgate Magnetometer (DFM)", status: "ONLINE", parameter: "3-Axis Field" },
            { name: "ISRO Ground Station Antenna C-Band", status: "ONLINE", parameter: "Remote Sensing & Satellite Link" },
            { name: "BARC IERMON Gamma Monitors", status: "ONLINE", parameter: "Gamma Dose (100-750 nGy/h)" }
          ]
        : [
            { name: "MARA Atmospheric Radar", status: "ONLINE", parameter: "Atmospheric Winds & Turbulence" },
            { name: "Ionospheric TEC Receiver", status: "ONLINE", parameter: "Scintillation & Electron Content" },
            { name: "All-Sky Aurora Camera", status: "ONLINE", parameter: "Optical Auroral Scan" },
            { name: "Digital Fluxgate Magnetometer", status: "ONLINE", parameter: "Geomagnetic Scan" }
          ]
  });
};
