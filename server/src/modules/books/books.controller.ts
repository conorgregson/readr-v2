import type { Request, Response, NextFunction } from "express";
import { sendCreated, sendNoContent, sendOk } from "../../utils/http";
import {
  BookListResponseSchema,
  BookResponseSchema,
} from "../../modules/books/books.schema";
import { createBook, deleteBook, listBooks, updateBook } from "./books.service";
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
    const query = (req as any).validatedQuery ?? {};
    const books = await listBooks(query);
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
    const body = (req as any).validatedBody;
    const created = await createBook(body);
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
    const { id } = (req as any).validatedParams as { id: string };
    const body = (req as any).validatedBody;
    const updated = await updateBook(id, body);
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
    const { id } = (req as any).validatedParams as { id: string };
    await deleteBook(id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
