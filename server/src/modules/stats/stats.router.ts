import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { validateQuery } from "../../utils/http";
import {
  getDashboardSummaryHandler,
  getReadingTrendHandler,
} from "./stats.controller";
import { readingTrendQuerySchema } from "./stats.schema";

const router = Router();

router.use(requireAuth);

router.get("/summary", getDashboardSummaryHandler);
router.get(
  "/trend",
  validateQuery(readingTrendQuerySchema),
  getReadingTrendHandler,
);

export { router as statsRouter };
