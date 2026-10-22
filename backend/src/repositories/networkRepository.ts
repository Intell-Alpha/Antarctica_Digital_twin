import { SATELLITE_UPLINK, StationId, SatelliteUplink } from "../store/digitalTwinStore";

export function getNetworkByStation(stationId: StationId): SatelliteUplink {
  return SATELLITE_UPLINK[stationId];
}
