import type { ReactNode } from "react";
import type React from "react";

export function EmptyState({
  title = "Nothing here yet",
  description = "When you add items, they’ll show up here.",
  action,
  className = "",
  ...props
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={[
        "rounded-xl border border-slate-800 bg-slate-900/40 p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-base font-semibold text-slate-100">{title}</div>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
