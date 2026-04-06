import { apiRequest } from "../../../shared/api/request";
import type { EngagementSnapshotResponse } from "../../../../../shared/types/v2.4";

export const EngagementService = {
  async getSnapshot(): Promise<EngagementSnapshotResponse> {
    return apiRequest<EngagementSnapshotResponse>("/engagement", {
      method: "GET",
    });
  },
};
