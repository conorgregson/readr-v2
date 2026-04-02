import type { Request, Response, NextFunction } from "express";
import { sendOk } from "../../utils/http";
import {
  dashboardSummaryResponseSchema,
  readingTrendResponseSchema,
} from "./stats.schema";
import { getDashboardSummary, getReadingTrend } from "./stats.service";

export async function getDashboardSummaryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const summary = await getDashboardSummary(userId);
    const response = dashboardSummaryResponseSchema.parse(summary);
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function getReadingTrendHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { metric } = (req as any).validatedQuery;
    const trend = await getReadingTrend(userId, metric);
    const response = readingTrendResponseSchema.parse(trend);
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}
