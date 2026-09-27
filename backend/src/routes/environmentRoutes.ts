import { Router } from "express";
import { getEnvironment } from "../controllers/environmentController";

const router = Router();

router.get("/", getEnvironment);

export default router;
