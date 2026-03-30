import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { validateBody, validateParams } from "../../utils/http";
import {
  createSavedViewHandler,
  deleteSavedViewHandler,
  getSavedViewsHandler,
  updateSavedViewHandler,
} from "./saved-views.controller";
import {
  CreateSavedViewSchema,
  SavedViewIdParamSchema,
  UpdateSavedViewSchema,
} from "./saved-views.schema";

const router = Router();

router.use(requireAuth);

router.get("/", getSavedViewsHandler);

router.post("/", validateBody(CreateSavedViewSchema), createSavedViewHandler);

router.patch(
  "/:id",
  validateParams(SavedViewIdParamSchema),
  validateBody(UpdateSavedViewSchema),
  updateSavedViewHandler,
);

router.delete(
  "/:id",
  validateParams(SavedViewIdParamSchema),
  deleteSavedViewHandler,
);

export { router as savedViewsRouter };
