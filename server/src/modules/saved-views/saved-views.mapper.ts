import type { Prisma, SavedView } from "@prisma/client";
import type {
  SavedLibraryViewFilters,
  SavedLibraryViewSort,
} from "../../../../shared/types/v2.4";
import type { SavedViewResponse } from "./saved-views.schema";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSavedLibraryViewFilters(
  value: Prisma.JsonValue,
): SavedLibraryViewFilters {
  if (!isObjectRecord(value)) {
    return {};
  }

  const out: SavedLibraryViewFilters = {};

  if (Array.isArray(value.status)) {
    const status = value.status.filter(
      (item): item is "planned" | "reading" | "finished" =>
        item === "planned" || item === "reading" || item === "finished",
    );
    if (status.length > 0) out.status = status;
  }

  if (Array.isArray(value.authors)) {
    const authors = value.authors.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    if (authors.length > 0) out.authors = authors;
  }

  if (Array.isArray(value.genres)) {
    const genres = value.genres.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    if (genres.length > 0) out.genres = genres;
  }

  if (Array.isArray(value.series)) {
    const series = value.series.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    if (series.length > 0) out.series = series;
  }

  if (typeof value.tbrOnly === "boolean") {
    out.tbrOnly = value.tbrOnly;
  }

  if (typeof value.tbrMonth === "string" && value.tbrMonth.trim()) {
    out.tbrMonth = value.tbrMonth.trim();
  }

  if (typeof value.search === "string" && value.search.trim()) {
    out.search = value.search.trim();
  }

  return out;
}

function toSavedLibraryViewSort(view: SavedView): SavedLibraryViewSort {
  return {
    key: view.sortKey as SavedLibraryViewSort["key"],
    direction: view.sortDir as SavedLibraryViewSort["direction"],
  };
}

export function toSavedViewResponse(view: SavedView): SavedViewResponse {
  return {
    id: view.id,
    name: view.name,
    filters: toSavedLibraryViewFilters(view.filters as Prisma.JsonValue),
    sort: toSavedLibraryViewSort(view),
    isPinned: view.isPinned,
    isDefault: view.isDefault,
    createdAt: view.createdAt.toISOString(),
    updatedAt: view.updatedAt.toISOString(),
  };
}

export function toSavedViewsResponse(views: SavedView[]): {
  items: SavedViewResponse[];
} {
  return {
    items: views.map(toSavedViewResponse),
  };
}
