import { Router } from "express";
import { processCommanderQuery } from "../controllers/commanderController";

const router = Router();

// POST /api/commander/query
router.post("/query", processCommanderQuery);

export default router;
