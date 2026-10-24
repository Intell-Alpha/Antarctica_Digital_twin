import { CONFIG } from "./config/env";
import app from "./app";
import { startNcporIngestor, stopNcporIngestor } from "./ingestion/ncporIngestor";

const server = app.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Himdrishti Backend Engine Running`);
  console.log(`📡 URL: http://localhost:${CONFIG.PORT}`);
  console.log(`🇦🇶 Stations: BHARATI Research Station & MAITRI Research Station`);
  console.log(`=======================================================`);

  // Start background real-time AWS synchronization with NCPOR live portal if enabled
  if (CONFIG.POLLER_ENABLED) {
    startNcporIngestor(10);
  } else {
    console.log(`⏸️ NCPOR Ingestion Poller is disabled (POLLER_ENABLED=false).`);
  }
});

// Graceful shutdown handling on SIGTERM / SIGINT
const handleGracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  // Stop background telemetry ingestor
  stopNcporIngestor();

  // Close HTTP server
  server.close(() => {
    console.log("✅ HTTP server closed. Process exiting cleanly.");
    process.exit(0);
  });

  // Force exit fallback if connections linger
  setTimeout(() => {
    console.error("⚠️ Forcing shutdown after timeout.");
    process.exit(1);
  }, 5000).unref();
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

export default server;
