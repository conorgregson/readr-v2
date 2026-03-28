import type { Request, Response, NextFunction } from "express";
import { sendCreated, sendNoContent, sendOk } from "../../utils/http";
import {
  BookListResponseSchema,
  BookResponseSchema,
} from "../../modules/books/books.schema";
import { bulkMutationResultSchema } from "../../modules/books/books.bulk.schema";
import {
  bulkDeleteBooks,
  bulkUpdateBooks,
  createBook,
  deleteBook,
  listBooks,
  updateBook,
} from "./books.service";
import {
  toBookListResponse,
  toBookResponse,
} from "../../modules/books/books.mapper";

export async function getBooksHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const query = (req as any).validatedQuery ?? {};
    const books = await listBooks(userId, query);
    const response = BookListResponseSchema.parse(toBookListResponse(books));
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function createBookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const body = (req as any).validatedBody;
    const created = await createBook(userId, body);
    const response = BookResponseSchema.parse(toBookResponse(created));
    sendCreated(res, response);
  } catch (error) {
    next(error);
  }
}

export async function updateBookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { id } = (req as any).validatedParams as { id: string };
    const body = (req as any).validatedBody;
    const updated = await updateBook(userId, id, body);
    const response = BookResponseSchema.parse(toBookResponse(updated));
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function deleteBookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const { id } = (req as any).validatedParams as { id: string };
    await deleteBook(userId, id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdateBooksHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const body = (req as any).validatedBody;
    const result = await bulkUpdateBooks(userId, body);
    const response = bulkMutationResultSchema.parse(result);
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function bulkDeleteBooksHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const body = (req as any).validatedBody;
    const result = await bulkDeleteBooks(userId, body);
    const response = bulkMutationResultSchema.parse(result);
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}
