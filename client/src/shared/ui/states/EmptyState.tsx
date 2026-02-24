import type { ReactNode } from "react";

export function EmptyState({
  title = "Nothing here yet",
  description = "When you add items, they’ll show up here.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="text-base font-semibold text-slate-100">{title}</div>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
