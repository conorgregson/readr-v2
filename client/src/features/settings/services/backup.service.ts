import { apiRequest } from "../../../shared/api/request";
import type {
  BookStatus,
  FormatParent,
  FormatSubtype,
  SeriesType,
} from "../../books/types";

export type BackupBook = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;

  genre: string | null;
  series: string | null;
  seriesType: SeriesType | null;
  format: FormatParent | null;
  formatSubtype: FormatSubtype | null;
  isbn: string | null;
  plannedMonth: string | null;

  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackupSession = {
  id: string;
  bookId: string;
  pages: number | null;
  minutes: number | null;
  notes: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type BackupExportData = {
  version: string;
  exportedAt: string;
  books: BackupBook[];
  sessions: BackupSession[];
};

export type BackupImportResult = {
  importedBooks: number;
  importedSessions: number;
};

export const BackupService = {
  async export(): Promise<BackupExportData> {
    return apiRequest<BackupExportData>("/backup/export", {
      method: "GET",
    });
  },

  async import(payload: unknown): Promise<BackupImportResult> {
    return apiRequest<BackupImportResult>("/backup/import", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
