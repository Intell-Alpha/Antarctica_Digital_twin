import express, { Request, Response } from "express";
import cors from "cors";
import { CONFIG } from "./config/env";

import stationRoutes from "./routes/stationRoutes";
import infrastructureRoutes from "./routes/infrastructureRoutes";
import energyRoutes from "./routes/energyRoutes";
import logisticsRoutes from "./routes/logisticsRoutes";
import environmentRoutes from "./routes/environmentRoutes";
import networkRoutes from "./routes/networkRoutes";
import simulationRoutes from "./routes/simulationRoutes";
import telemetryRoutes from "./routes/telemetryRoutes";
import syntheticDataRoutes from "./routes/syntheticDataRoutes";
import { startNcporLivePolling } from "./services/ncporLiveService";

const app = express();

app.use(cors({ origin: CONFIG.CORS_ORIGIN }));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ONLINE",
    system: "Antarctica Digital Twin Backend Core Engine",
    stations: ["BHARATI", "MAITRI"],
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

import commanderRoutes from "./routes/commanderRoutes";

// Mount modular API routers
app.use("/api/stations", stationRoutes);
app.use("/api/infrastructure", infrastructureRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/environment", environmentRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/synthetic-data", syntheticDataRoutes);
app.use("/api/commander", commanderRoutes);

app.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Antarctica Digital Twin Backend Engine Running`);
  console.log(`📡 URL: http://localhost:${CONFIG.PORT}`);
  console.log(`🇦🇶 Stations: BHARATI Research Station & MAITRI Research Station`);
  console.log(`=======================================================`);

  // Start background real-time AWS synchronization with NCPOR live portal
  startNcporLivePolling(10);
});
