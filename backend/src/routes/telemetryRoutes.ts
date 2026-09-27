import { Router } from "express";
import { getTelemetry } from "../controllers/telemetryController";

const router = Router();

router.get("/", getTelemetry);

export default router;
