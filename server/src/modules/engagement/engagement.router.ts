import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { getEngagementSnapshotHandler } from "./engagement.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getEngagementSnapshotHandler);

export { router as engagementRouter };
