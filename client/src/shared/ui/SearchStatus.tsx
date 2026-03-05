import * as React from "react";

type SearchStatusProps = React.HTMLAttributes<HTMLDivElement> & {
  text?: React.ReactNode;
  id?: string;
};

export function SearchStatus({
  text,
  id = "search-status",
  className = "",
  ...props
}: SearchStatusProps) {
  const hasContent =
    text != null && (typeof text !== "string" || text.trim().length > 0);

  return (
    <div
      {...props}
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-has-content={hasContent ? "true" : "false"}
      className={[
        "min-h-[20px] text-sm text-slate-400 transition-opacity duration-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasContent ? text : null}
    </div>
  );
}
