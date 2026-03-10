import { Router } from "express";
import {
  createBookHandler,
  deleteBookHandler,
  getBooksHandler,
  updateBookHandler,
} from "../books/books.controller";
import { validateBody, validateParams, validateQuery } from "../../utils/http";
import {
  BookIdParamSchema,
  CreateBookSchema,
  ListBooksQuerySchema,
  UpdateBookSchema,
} from "./books.schema";

const router = Router();

router.get("/", validateQuery(ListBooksQuerySchema), getBooksHandler);
router.post("/", validateBody(CreateBookSchema), createBookHandler);
router.patch(
  "/:id",
  validateParams(BookIdParamSchema),
  validateBody(UpdateBookSchema),
  updateBookHandler,
);
router.delete("/:id", validateParams(BookIdParamSchema), deleteBookHandler);

export { router as booksRouter };
