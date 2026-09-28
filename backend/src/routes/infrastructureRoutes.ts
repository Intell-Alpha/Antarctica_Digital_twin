import { Router } from "express";
import { getInfrastructure } from "../controllers/infrastructureController";

const router = Router();

router.get("/", getInfrastructure);

export default router;
