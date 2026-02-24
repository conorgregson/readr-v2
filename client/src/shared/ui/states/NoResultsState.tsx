import type React from "react";

export function NoResultsState({
  query,
  description,
  action,
}: {
  query?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="text-base font-semibold text-slate-100">No results</div>
      <p className="mt-1 text-sm text-slate-300">
        {description ??
          (query ? (
            <>
              No matches for <span className="text-slate-100">"{query}"</span>.
            </>
          ) : (
            "No matches found."
          ))}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
