import { apiRequest } from "../../../shared/api/request";
import type {
  DashboardSummaryResponse,
  ReadingTrendMetric,
  ReadingTrendResponse,
} from "../../../../../shared/types/v2.4";

export const StatsService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    return apiRequest<DashboardSummaryResponse>("/stats/summary", {
      method: "GET",
    });
  },

  async getTrend(metric: ReadingTrendMetric): Promise<ReadingTrendResponse> {
    const params = new URLSearchParams({ metric });

    return apiRequest<ReadingTrendResponse>(
      `/stats/trend?${params.toString()}`,
      {
        method: "GET",
      },
    );
  },
};
