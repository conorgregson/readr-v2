import * as React from "react";
import { Spinner } from "./Spinner";
import { cn } from "./cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      className,
      disabled,
      loading = false,
      type,
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500";

    const styles =
      variant === "primary"
        ? "bg-teal-600 text-white hover:bg-teal-700"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-700"
          : "border border-slate-300 bg-white text-black hover:bg-slate-100";

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        {...props}
        type={type ?? "button"}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          base,
          styles,
          isDisabled && "opacity-60 cursor-not-allowed",
          className,
        )}
      >
        {loading ? (
          <span aria-hidden="true">
            <Spinner size="sm" />
          </span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
