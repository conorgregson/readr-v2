import type { BookStatus } from "../../../../shared/types/v2.4";

export type NormalizedBulkIds = string[];

export type BulkTargetBooksSnapshot = {
  id: string;
  status: BookStatus;
};

export type BulkDeleteRestoreSnapshot = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
};

export type BulkUndoSnapshot = {
  operationId: string;
  affectedIds: string[];
};
