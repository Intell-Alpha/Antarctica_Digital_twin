import { STATIONS, StationId, StationIdentity } from "../store/digitalTwinStore";

export function getAllStationsData(): StationIdentity[] {
  return Object.values(STATIONS);
}

export function getStationDataById(id: string): StationIdentity | null {
  const stationId = id.toUpperCase() as StationId;
  return STATIONS[stationId] || null;
}
