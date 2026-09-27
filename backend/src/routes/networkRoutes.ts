import { Router } from "express";
import { getNetwork } from "../controllers/networkController";

const router = Router();

router.get("/", getNetwork);

export default router;
