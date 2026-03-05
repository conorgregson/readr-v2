import { Spinner } from "../Spinner";
import type React from "react";

export function LoadingState({
  label = "Loading...",
  className = "",
  ...props
}: { label?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      role={props.role ?? "status"}
      aria-busy={props["aria-busy"] ?? true}
      className={[
        "flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Spinner />
      <div className="text-sm text-slate-300">{label}</div>
    </div>
  );
}
