import React from "react";

type SelectProps<T extends string> =
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    value: T;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  };

export function Select<T extends string>({
  className = "",
  children,
  ...props
}: SelectProps<T>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded border border-slate-300 bg-white text-black px-3 py-2",
        // Left-only focus indicator
        "focus:outline-none focus:ring-0",
        "focus:border-teal-500",
        "focus:shadow-[inset_4px_0_0_0_rgba(20,184,166,1)]",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
}
