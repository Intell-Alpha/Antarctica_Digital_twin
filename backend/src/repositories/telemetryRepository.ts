import { TELEMETRY_LOGS, StationId, TelemetryLog, ENVIRONMENT_DATA, EnvironmentalTelemetry } from "../store/digitalTwinStore";

export function getTelemetryLogsByStation(stationId: StationId): TelemetryLog[] {
  return TELEMETRY_LOGS[stationId] || [];
}

export function getLiveStatus(stationId: StationId) {
  const environment = ENVIRONMENT_DATA[stationId];
  return {
    temperature: environment.tempC,
    windSpeed: environment.windSpeedKmh,
    status: "NORMAL"
  };
}
