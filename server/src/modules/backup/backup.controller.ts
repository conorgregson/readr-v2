import type { Request, Response, NextFunction } from "express";
import { sendOk, validateBody } from "../../utils/http";
import {
  BackupExportResponseSchema,
  BackupImportResponseSchema,
  ImportBackupSchema,
} from "./backup.schema";
import { toBackupExportResponse } from "./backup.mapper";
import { exportBackup, importBackup } from "./backup.service";

export async function exportBackupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const data = await exportBackup(userId);
    const response = BackupExportResponseSchema.parse(
      toBackupExportResponse(data),
    );
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export async function importBackupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth!.userId;
    const body = (req as any).validatedBody;
    const imported = await importBackup(userId, body);
    const response = BackupImportResponseSchema.parse(imported);
    sendOk(res, response);
  } catch (error) {
    next(error);
  }
}

export const validateImportBackup = validateBody(ImportBackupSchema);
