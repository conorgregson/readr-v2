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
  date: string;
  value: number;
};

export type ReadingTrendResponse = {
  metric: ReadingTrendMetric;
  points: TimeSeriesPoint[];
};
