import type { Book, BooksFilters } from "./types";

export function applyFilters(books: Book[], filters: BooksFilters): Book[] {
  const statusSet = new Set(filters.status);
  const authorSet = new Set(filters.authors.map((s) => (s ?? "").trim()));
  const genreSet = new Set(filters.genres.map((s) => (s ?? "").trim()));
  const seriesSet = new Set(filters.series.map((s) => (s ?? "").trim()));

  const hasStatus = statusSet.size > 0;
  const hasAuthors = authorSet.size > 0;
  const hasGenres = genreSet.size > 0;
  const hasSeries = seriesSet.size > 0;

  return (books ?? []).filter((b) => {
    if (hasStatus && !statusSet.has(b.status)) return false;
    if (hasAuthors && !authorSet.has((b.author ?? "").trim())) return false;
    if (hasGenres && !genreSet.has((b.genre ?? "").trim())) return false;
    if (hasSeries && !seriesSet.has((b.series ?? "").trim())) return false;

    if (filters.tbrOnly) {
      if (!b.plannedMonth) return false;
      if (filters.tbrMonth && b.plannedMonth !== filters.tbrMonth) return false;
    }

    return true;
  });
}
