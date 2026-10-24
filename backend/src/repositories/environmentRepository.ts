import { ENVIRONMENT_DATA, StationId, EnvironmentalTelemetry } from "../store/digitalTwinStore";

export function getEnvironmentByStation(stationId: StationId): EnvironmentalTelemetry {
  return ENVIRONMENT_DATA[stationId];
}
