import {
  StationId,
  ENVIRONMENT_DATA,
  GENERATORS_DATA,
  TELEMETRY_LOGS,
  TelemetryLog
} from "../store/digitalTwinStore";

export class TelemetryGenerator {
  public static getLiveSnapshot(stationId: StationId) {
    const logs = TELEMETRY_LOGS[stationId] || [];
    const generators = GENERATORS_DATA[stationId] || [];
    const env = ENVIRONMENT_DATA[stationId];

    const sampleMsgs = [
      "Edge cache verifying integrity...",
      "ISRO Satellite Link ping: 42ms",
      "Priyadarshini line trace heat loop active.",
      "Structural resonance check complete.",
      "BARC radiation sensor sample: 125 nGy/h"
    ];

    const newLog: TelemetryLog = {
      timestamp: new Date().toUTCString().slice(17, 25) + " UTC",
      level: Math.random() > 0.85 ? "WARN" : "INFO",
      source: "SYS_CORE",
      message: sampleMsgs[Math.floor(Math.random() * sampleMsgs.length)]
    };

    return {
      stationId,
      timestamp: new Date().toISOString(),
      liveStatus: {
        stationHealthScore: 94,
        outsideTempC: env.tempC,
        katabaticWindKmh: env.windSpeedKmh,
        survivabilityDays: 290,
        activeGeneratorsCount: generators.filter(g => g.status === "ONLINE").length
      },
      latestLog: newLog,
      recentLogs: [...logs, newLog].slice(-10)
    };
  }
}
