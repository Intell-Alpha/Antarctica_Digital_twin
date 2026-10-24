import { Router } from "express";
import { processCommanderQuery } from "../controllers/commanderController";
import { validate } from "../middleware/validate";
import { commanderPayloadSchema } from "../schemas/commanderSchema";

const router = Router();

// POST /api/commander/query
router.post("/query", validate(commanderPayloadSchema), processCommanderQuery);

export default router;
