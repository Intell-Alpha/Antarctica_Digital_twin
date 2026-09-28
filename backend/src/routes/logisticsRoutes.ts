import { Router } from "express";
import { getLogistics } from "../controllers/logisticsController";

const router = Router();

router.get("/", getLogistics);

export default router;
