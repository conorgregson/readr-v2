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
      className={`w-full rounded border border-slate-300 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${className}`}
    >
      {children}
    </select>
  );
}
