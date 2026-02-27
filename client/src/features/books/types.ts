export type BookId = string;

// v1.9 canonical values
export type BookStatus = "planned" | "reading" | "finished";

// v1.9 series + format enums (string unions for now)
export type SeriesType = "series" | "standalone";
export type FormatParent = "digital" | "physical";
export type FormatSubtype =
  | "Hardcover"
  | "Paperback"
  | "ebook"
  | "Audiobook"
  | "PDF";

export type Book = {
  id: BookId;

  title: string;
  author?: string;

  status: BookStatus;

  //timestamps
  createdAt: string; // ISO
  updatedAt: string; // ISO
  startedAt?: string; // ISO (set when moving to reading)
  finishedAt?: string; // ISO (set when finished)

  // v1.9 parity fields used in UI + search fields
  genre?: string;
  series?: string;
  seriesType?: SeriesType; // defaults to standalone is missing in v1.9
  format?: FormatParent; // defaults to physical is missing in v1.9
  formatSubtype?: FormatSubtype;

  isbn?: string;

  // TBR planning
  plannedMonth?: string; // input type="month" value, e.g. "2026-02"
};

export type BooksFilters = {
  status: BookStatus[]; // multi-select
  authors: string[];
  genres: string[];
  series: string[];
  tbrOnly: boolean;
  tbrMonth: string; // "" means no month constraint
};

export const defaultBooksFilters = (): BooksFilters => ({
  status: [],
  authors: [],
  genres: [],
  series: [],
  tbrOnly: false,
  tbrMonth: "",
});
