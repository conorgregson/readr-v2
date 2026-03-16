import type { Book, BooksFilters } from "./types";

function norm(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

export function applyFilters(books: Book[], filters: BooksFilters): Book[] {
  const statusSet = new Set(filters.status);
  const authorSet = new Set(filters.authors.map(norm).filter(Boolean));
  const genreSet = new Set(filters.genres.map(norm).filter(Boolean));
  const seriesSet = new Set(filters.series.map(norm).filter(Boolean));

  const hasStatus = statusSet.size > 0;
  const hasAuthors = authorSet.size > 0;
  const hasGenres = genreSet.size > 0;
  const hasSeries = seriesSet.size > 0;

  return (books ?? []).filter((b) => {
    if (hasStatus && !statusSet.has(b.status)) return false;
    if (hasAuthors && !authorSet.has(norm(b.author))) return false;
    if (hasGenres && !genreSet.has(norm(b.genre))) return false;
    if (hasSeries && !seriesSet.has(norm(b.series))) return false;

    if (filters.tbrOnly) {
      if (!b.plannedMonth) return false;
      if (filters.tbrMonth && b.plannedMonth !== filters.tbrMonth) return false;
    }

    return true;
  });
}
