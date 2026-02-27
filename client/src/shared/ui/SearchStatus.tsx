import React from "react";

export function SearchStatus({
  text,
  id = "search-status",
}: {
  text: React.ReactNode;
  id?: string;
}) {
  const hasContent = (() => {
    if (text == null) return false;
    if (typeof text === "string") return text.trim().length > 0;
    return true;
  })();

  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        "min-h-[20px] text-sm text-slate-400 transition-opacity duration-150",
        hasContent ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {text}
    </div>
  );
}
