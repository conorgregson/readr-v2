export type BookStatus = "planned" | "reading" | "finished";

export type SortDirection = "asc" | "desc";

export type LibrarySortKey =
  | "title"
  | "author"
  | "createdAt"
  | "updatedAt"
  | "finishedAt";

export type SavedLibraryViewFilters = {
  status?: BookStatus[];
  favorite?: boolean;
  search?: string;
};

export type SavedLibraryViewSort = {
  key: LibrarySortKey;
  direction: SortDirection;
};

export type SavedLibraryView = {
  id: string;
  name: string;
  filters: SavedLibraryViewFilters;
  sort: SavedLibraryViewSort;
  isPinned: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedViewRequest = {
  name: string;
  filters: SavedLibraryViewFilters;
  sort: SavedLibraryViewSort;
  isPinned?: boolean;
  isDefault?: boolean;
};

export type UpdateSavedViewRequest = {
  name?: string;
  filters?: SavedLibraryViewFilters;
  sort?: SavedLibraryViewSort;
  isPinned?: boolean;
  isDefault?: boolean;
};

export type SavedViewsResponse = {
  items: SavedLibraryView[];
};
