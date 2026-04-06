import { GoalsCard } from "./GoalsCard";
import { StreakCard } from "./StreakCard";
import { BadgesGrid } from "./BadgesGrid";
import type { EngagementSnapshotResponse } from "../../../../../shared/types/v2.4";

export function EngagementPanel(props: {
  snapshot: EngagementSnapshotResponse;
}) {
  return (
    <div className="space-y-6">
      <GoalsCard goals={props.snapshot.goals} />
      <StreakCard streaks={props.snapshot.streaks} />
      <BadgesGrid badges={props.snapshot.badges} />
    </div>
  );
}
