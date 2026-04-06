import type { BadgeProgress } from "../../../../../shared/types/v2.4";

function tierClasses(tier?: BadgeProgress["tier"]) {
  switch (tier) {
    case "bronze":
      return "border-amber-700/60";
    case "silver":
      return "border-slate-500/70";
    case "gold":
      return "border-yellow-500/70";
    default:
      return "border-slate-800";
  }
}

export function BadgesGrid(props: { badges: BadgeProgress[] }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-50">Badges</h2>
        <p className="mt-1 text-sm text-slate-400">
          Milestone progress based on books, pages, sessions, and streaks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {props.badges.map((badge) => {
          const percent =
            badge.target > 0
              ? Math.min(100, Math.round((badge.progress / badge.target) * 100))
              : 0;

          return (
            <article
              key={badge.key}
              className={[
                "rounded-lg border bg-slate-950/60 p-4 transition",
                tierClasses(badge.tier),
                badge.unlocked ? "ring-1 ring-teal-500/40" : "",
              ].join(" ")}
              aria-label={`${badge.title}: ${badge.unlocked ? "Unlocked" : "In progress"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    {badge.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {badge.description}
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full px-2 py-1 text-[10px] uppercase tracking-wide",
                    badge.unlocked
                      ? "bg-teal-500/20 text-teal-300"
                      : "bg-slate-800 text-slate-400",
                  ].join(" ")}
                >
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                {badge.tier ? `${badge.tier} tier` : "Milestone"}
              </div>

              <div
                className="mt-3 h-2 rounded-full bg-slate-800"
                role="progressbar"
                aria-label={`${badge.title} progress`}
                aria-valuemin={0}
                aria-valuemax={badge.target}
                aria-valuenow={badge.progress}
              >
                <div
                  className="h-2 rounded-full bg-teal-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-2 text-xs text-slate-500">
                {badge.progress} / {badge.target}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
