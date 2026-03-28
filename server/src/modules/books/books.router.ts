import { Router } from "express";
import {
  bulkDeleteBooksHandler,
  bulkUpdateBooksHandler,
  createBookHandler,
  deleteBookHandler,
  getBooksHandler,
  updateBookHandler,
} from "../books/books.controller";
import { validateBody, validateParams, validateQuery } from "../../utils/http";
import {
  bulkDeleteBooksRequestSchema,
  bulkUpdateBooksPatchSchema,
  bulkUpdateBooksRequestSchema,
} from "./books.bulk.schema";
import {
  BookIdParamSchema,
  CreateBookSchema,
  ListBooksQuerySchema,
  UpdateBookSchema,
} from "./books.schema";

import { requireAuth } from "../../middleware/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/", validateQuery(ListBooksQuerySchema), getBooksHandler);
router.post("/", validateBody(CreateBookSchema), createBookHandler);

router.patch(
  "/bulk",
  validateBody(bulkUpdateBooksRequestSchema),
  bulkUpdateBooksHandler,
);

router.delete(
  "/bulk",
  validateBody(bulkDeleteBooksRequestSchema),
  bulkDeleteBooksHandler,
);

router.patch(
  "/:id",
  validateParams(BookIdParamSchema),
  validateBody(UpdateBookSchema),
  updateBookHandler,
);

router.delete("/:id", validateParams(BookIdParamSchema), deleteBookHandler);

export { router as booksRouter };
