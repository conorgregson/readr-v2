import type { ReactNode } from "react";

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-6">
      <div className="text-base font-semibold text-rose-100">{title}</div>
      {message ? (
        <p className="mt-1 text-sm text-rose-200/90">{message}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
