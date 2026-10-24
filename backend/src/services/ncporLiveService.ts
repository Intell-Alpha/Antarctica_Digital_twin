// Backward compatibility bridge for ncporLiveService
// Re-exports hardened ingestion client and ingestor from src/ingestion

export * from "../ingestion/ncporClient";
export {
  syncAllStationsLive,
  getStationLiveFeed,
  startNcporIngestor as startNcporLivePolling,
  startNcporIngestor,
  stopNcporIngestor,
  getIngestorStatus
} from "../ingestion/ncporIngestor";
