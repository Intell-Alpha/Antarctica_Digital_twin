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
import commanderRoutes from "./routes/commanderRoutes";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || CONFIG.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

// In development, also allow port 3001 if CORS_ORIGIN has not been explicitly customized
if (!process.env.CORS_ORIGIN && !allowedOrigins.includes("http://localhost:3001")) {
  allowedOrigins.push("http://localhost:3001");
}

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    uptime: process.uptime() 
  });
});

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ONLINE",
    system: "Himdrishti Backend Core Engine",
    stations: ["BHARATI", "MAITRI"],
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Mount modular API routers
app.use("/api/stations", stationRoutes);
app.use("/api/infrastructure", infrastructureRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/environment", environmentRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/simulation", rateLimiter, simulationRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/synthetic-data", syntheticDataRoutes);
app.use("/api/commander", rateLimiter, commanderRoutes);

// Global Error Handler for JSON parsing and unhandled errors
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Validation failed",
      details: [
        {
          field: "body",
          message: "Malformed JSON payload: " + err.message,
        },
      ],
    });
  }

  console.error("[Unhandled Server Error]", err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
