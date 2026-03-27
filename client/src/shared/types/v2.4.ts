export type BookStatus = "planned" | "reading" | "finished";

export type SortDirection = "asc" | "desc";

export type LibrarySortKey =
  | "title"
  | "author"
  | "createdAt"
  | "updatedAt"
  | "finishedAt";

export type BulkMutationOperation = "update" | "delete";

export type BulkUpdateBooksRequest = {
  ids: string[];
  patch: {
    status?: BookStatus;
  };
};

export type BulkDeleteBooksRequest = {
  ids: string[];
};

export type BulkMutationResult = {
  ok: true;
  operationId: string;
  operation: BulkMutationOperation;
  affectedCount: number;
  affectedIds: string[];
};

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

export type DashboardSummaryResponse = {
  totals: {
    books: number;
    finishedBooks: number;
    pagesRead: number;
    sessionsLogged: number;
    avgSessionMinutes: number;
  };
  currentPeriod: {
    booksFinishedThisMonth: number;
    pagesReadThisMonth: number;
  };
};

export type ReadingTrendMetric = "pages" | "sessions" | "booksFinished";

export type TimeSeriesPoint = {
  date: string; // YYYY-MM-DD
  value: number;
};

export type ReadingTrendResponse = {
  metric: ReadingTrendMetric;
  points: TimeSeriesPoint[];
};

export type GoalProgress = {
  target: number;
  progress: number;
  complete: boolean;
};

export type ReadingGoalsResponse = {
  yearlyBooksGoal?: GoalProgress;
  yearlyPagesGoal?: GoalProgress;
  monthlyBooksGoal?: GoalProgress;
};

export type ReadingStreakResponse = {
  currentStreakDays: number;
  longestStreakDays: number;
  graceWindowEnabled: boolean;
};

export type BadgeTier = "bronze" | "silver" | "gold";

export type BadgeProgress = {
  key: string;
  title: string;
  description: string;
  tier?: BadgeTier;
  unlocked: boolean;
  progress: number;
  target: number;
};

export type EngagementSnapshotResponse = {
  goals: ReadingGoalsResponse;
  streaks: ReadingStreakResponse;
  badges: BadgeProgress[];
};
