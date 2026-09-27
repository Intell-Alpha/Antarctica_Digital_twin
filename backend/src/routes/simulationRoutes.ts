import { Router } from "express";
import { postSimulation } from "../controllers/simulationController";

const router = Router();

router.post("/", postSimulation);

export default router;
