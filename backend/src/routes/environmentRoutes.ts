import { Router } from "express";
import { getEnvironment, syncEnvironmentLive } from "../controllers/environmentController";

const router = Router();

router.get("/", getEnvironment);
router.post("/sync", syncEnvironmentLive);
router.get("/sync", syncEnvironmentLive);

export default router;
