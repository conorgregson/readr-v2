import type { ReadingStreakResponse } from "../../../../../shared/types/v2.4";

function StreakStat(props: { label: string; value: number; helper?: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="text-sm text-slate-400">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">
        {props.value}
      </div>
      {props.helper ? (
        <div className="mt-1 text-xs text-slate-500">{props.helper}</div>
      ) : null}
    </div>
  );
}

export function StreakCard(props: { streaks: ReadingStreakResponse }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-50">
          Reading Streaks
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Current and longest streaks derived from your reading activity.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <StreakStat
          label="Current Streak"
          value={props.streaks.currentStreakDays}
          helper="Consecutive reading days currently active"
        />
        <StreakStat
          label="Longest Streak"
          value={props.streaks.longestStreakDays}
          helper={
            props.streaks.graceWindowEnabled
              ? "Grace window enabled"
              : "Grace window disabled"
          }
        />
      </div>
    </section>
  );
}
