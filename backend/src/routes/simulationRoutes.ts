import { Router } from "express";
import { postSimulation } from "../controllers/simulationController";
import { validate } from "../middleware/validate";
import { simulationPayloadSchema } from "../schemas/simulationSchema";

const router = Router();

router.post("/", validate(simulationPayloadSchema), postSimulation);

export default router;
