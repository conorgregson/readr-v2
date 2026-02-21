import React from "react";
import { Spinner } from "./Spinner";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500";

  const styles =
    variant === "primary"
      ? "bg-teal-600 text-white hover:bg-teal-700"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "border border-slate-300 bg-white text-black hover:bg-slate-100";

  const isDisabled = disabled || loading;
  const disabledStyles = isDisabled ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${base} ${styles} ${disabledStyles} ${className}`}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
