import { CONFIG } from "./config/env";
import app from "./app";
import { startNcporLivePolling } from "./services/ncporLiveService";

app.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Himdrishti Backend Engine Running`);
  console.log(`📡 URL: http://localhost:${CONFIG.PORT}`);
  console.log(`🇦🇶 Stations: BHARATI Research Station & MAITRI Research Station`);
  console.log(`=======================================================`);

  // Start background real-time AWS synchronization with NCPOR live portal
  startNcporLivePolling(10);
});
