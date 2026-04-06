import type { Request, Response, NextFunction } from "express";
import { sendOk } from "../../utils/http";
import { engagementSnapshotResponseSchema } from "./engagement.schema";
import { getEngagementSnapshot } from "./engagement.service";

export async function getEngagementSnapshotHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const snapshot = await getEngagementSnapshot(userId);
    const response = engagementSnapshotResponseSchema.parse(snapshot);
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}
