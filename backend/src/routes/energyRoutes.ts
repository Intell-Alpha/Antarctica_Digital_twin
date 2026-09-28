import { Router } from "express";
import { getEnergy } from "../controllers/energyController";

const router = Router();

router.get("/", getEnergy);

export default router;
