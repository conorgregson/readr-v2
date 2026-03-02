export type SessionId = string;

export type Session = {
  id: SessionId;
  bookId: string; // v2.1 string ids
  date: string; // "YYYY-MM-DD"
  pages?: number; // >= 0
  minutes?: number; // >= 0
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestam
};

export type CreateSessionInput = {
  bookId: string;
  date: string; // "YYYY-MM-DD" (or raw date input that is normalized)
  pagesRead?: number; // from UI (map → pages)
  minutes?: number;
  notes?: string;
};

export type SessionsSortKey = "date:desc" | "date:asc";

export type SessionsFilters = {
  bookId?: string; // exact match
  type?: "pages" | "minutes" | ""; // v1.9 behavior
  dateStart?: string; // "YYYY-MM-DD"
  dateEnd?: string; // "YYYY-MM-DD"
  bookTitle?: string; // text filter (title only)
  search?: string; // tokens search (title/notes/date)
};
