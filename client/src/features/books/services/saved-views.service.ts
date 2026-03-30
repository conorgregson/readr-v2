import type {
  CreateSavedViewRequest,
  SavedLibraryView,
  SavedViewsResponse,
  UpdateSavedViewRequest,
} from "../../../../../shared/types/v2.4";
import { apiRequest } from "../../../shared/api/request";

function normalizeStringArray(values?: string[]): string[] | undefined {
  if (!values) return undefined;

  const normalized = [
    ...new Set(values.map((value) => value.trim()).filter(Boolean)),
  ];

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeFilters(
  filters:
    | CreateSavedViewRequest["filters"]
    | UpdateSavedViewRequest["filters"],
) {
  if (!filters) return filters;

  const normalized = {
    ...(filters.status ? { status: [...new Set(filters.status)] } : {}),
    ...(filters.authors
      ? { authors: normalizeStringArray(filters.authors) }
      : {}),
    ...(filters.genres ? { genres: normalizeStringArray(filters.genres) } : {}),
    ...(filters.series ? { series: normalizeStringArray(filters.series) } : {}),
    ...(filters.tbrOnly !== undefined ? { tbrOnly: filters.tbrOnly } : {}),
    ...(filters.tbrMonth?.trim() ? { tbrMonth: filters.tbrMonth.trim() } : {}),
    ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  };

  return normalized;
}

function normalizeSort(
  sort: CreateSavedViewRequest["sort"] | UpdateSavedViewRequest["sort"],
) {
  if (!sort) return sort;

  return {
    key: sort.key,
    direction: sort.direction,
  };
}

function normalizeCreateInput(
  input: CreateSavedViewRequest,
): CreateSavedViewRequest {
  return {
    name: input.name.trim(),
    filters: normalizeFilters(input.filters) ?? {},
    sort: normalizeSort(input.sort)!,
    ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}

function normalizeUpdateInput(
  input: UpdateSavedViewRequest,
): UpdateSavedViewRequest {
  return {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.filters !== undefined
      ? { filters: normalizeFilters(input.filters) ?? {} }
      : {}),
    ...(input.sort !== undefined ? { sort: normalizeSort(input.sort)! } : {}),
    ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}

export const SavedViewsService = {
  async list(): Promise<SavedLibraryView[]> {
    const response = await apiRequest<SavedViewsResponse>("/saved-views", {
      method: "GET",
    });

    return response.items;
  },

  async create(input: CreateSavedViewRequest): Promise<SavedLibraryView> {
    return apiRequest<SavedLibraryView>("/saved-views", {
      method: "POST",
      body: normalizeCreateInput(input),
    });
  },

  async update(
    id: string,
    patch: UpdateSavedViewRequest,
  ): Promise<SavedLibraryView> {
    return apiRequest<SavedLibraryView>(`/saved-views/${id}`, {
      method: "PATCH",
      body: normalizeUpdateInput(patch),
    });
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/saved-views/${id}`, {
      method: "DELETE",
    });
  },
};
