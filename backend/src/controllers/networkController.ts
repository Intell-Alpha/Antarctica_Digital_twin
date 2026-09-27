import { Request, Response } from "express";
import { SATELLITE_UPLINK, StationId } from "../store/digitalTwinStore";

export const getNetwork = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const uplink = SATELLITE_UPLINK[stationId];

  res.json({
    success: true,
    stationId,
    uplink,
    priorityQueues: [
      { priority: "P0", label: "Emergency / Safety Alerts", status: "ACTIVE (0 Queued)" },
      { priority: "P1", label: "Critical Infrastructure Telemetry", status: "ACTIVE (0 Queued)" },
      { priority: "P2", label: "Operational State Logs", status: "ACTIVE (4 Queued)" },
      { priority: "P3", label: "Scientific Data Stream", status: "BUFFERED" },
      { priority: "P4", label: "Bulk Imagery & Video Archives", status: "PAUSED FOR NEXT PASS" }
    ]
  });
};
