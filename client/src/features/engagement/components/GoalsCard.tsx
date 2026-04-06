import type {
  GoalProgress,
  ReadingGoalsResponse,
} from "../../../../../shared/types/v2.4";

function GoalRow(props: { label: string; goal?: GoalProgress }) {
  if (!props.goal) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="text-sm text-slate-300">{props.label}</div>
        <div className="mt-1 text-xs text-slate-500">Not configured</div>
      </div>
    );
  }

  const percent =
    props.goal.target > 0
      ? Math.min(
          100,
          Math.round((props.goal.progress / props.goal.target) * 100),
        )
      : 0;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-300">{props.label}</div>
        <div className="text-xs text-slate-400">
          {props.goal.progress} / {props.goal.target}
        </div>
      </div>

      <div
        className="mt-2 h-2 rounded-full bg-slate-800"
        role="progressbar"
        aria-label={`${props.label} progress`}
        aria-valuemin={0}
        aria-valuemax={props.goal.target}
        aria-valuenow={props.goal.progress}
      >
        <div
          className="h-2 rounded-full bg-teal-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {props.goal.complete ? "Complete" : `${percent}% complete`}
      </div>
    </div>
  );
}

export function GoalsCard(props: { goals: ReadingGoalsResponse }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-50">Reading Goals</h2>
        <p className="mt-1 text-sm text-slate-400">
          Server-derived goal progress for your current reading targets.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <GoalRow label="Yearly Books" goal={props.goals.yearlyBooksGoal} />
        <GoalRow label="Yearly Pages" goal={props.goals.yearlyPagesGoal} />
        <GoalRow label="Monthly Books" goal={props.goals.monthlyBooksGoal} />
      </div>
    </section>
  );
}
