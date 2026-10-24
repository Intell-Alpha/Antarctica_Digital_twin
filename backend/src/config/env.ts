import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  POLLER_ENABLED: process.env.POLLER_ENABLED !== "false"
};
