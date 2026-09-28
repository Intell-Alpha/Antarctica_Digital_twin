import { Router } from "express";
import { getSyntheticDatasets } from "../controllers/syntheticDataController";

const router = Router();

router.get("/", getSyntheticDatasets);

export default router;
