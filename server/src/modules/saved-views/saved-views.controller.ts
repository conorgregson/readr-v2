import type { Request, Response, NextFunction } from "express";
import { sendCreated, sendNoContent, sendOk } from "../../utils/http";
import {
  SavedViewResponseSchema,
  SavedViewsResponseSchema,
} from "./saved-views.schema";
import {
  createSavedView,
  deleteSavedView,
  listSavedViews,
  updateSavedView,
} from "./saved-views.service";
import {
  toSavedViewResponse,
  toSavedViewsResponse,
} from "./saved-views.mapper";

export async function getSavedViewsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const views = await listSavedViews(userId);
    const response = SavedViewsResponseSchema.parse(
      toSavedViewsResponse(views),
    );
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function createSavedViewHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const body = (req as any).validatedBody;
    const created = await createSavedView(userId, body);
    const response = SavedViewResponseSchema.parse(
      toSavedViewResponse(created),
    );
    sendCreated(res, response);
  } catch (error) {
    next(error);
  }
}

export async function updateSavedViewHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { id } = (req as any).validatedParams as { id: string };
    const body = (req as any).validatedBody;
    const updated = await updateSavedView(userId, id, body);
    const response = SavedViewResponseSchema.parse(
      toSavedViewResponse(updated),
    );
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function deleteSavedViewHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { id } = (req as any).validatedParams as { id: string };
    await deleteSavedView(userId, id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
