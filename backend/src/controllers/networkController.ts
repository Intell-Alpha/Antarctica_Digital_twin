import { Request, Response } from "express";
import { StationId } from "../store/digitalTwinStore";
import { getNetworkByStation } from "../repositories/networkRepository";

export const getNetwork = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const uplink = getNetworkByStation(stationId);

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
