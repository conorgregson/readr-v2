import React from "react";

type SpinnerProps = {
  size?: "sm" | "md";
  className?: string;
  label?: string; // screen reader label
};

export function Spinner({
  size = "sm",
  className = "",
  label = "Loading",
}: SpinnerProps) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span className={`inline-flex items-center ${className}`}>
      <svg
        className={`animate-spin ${dimension}`}
        viewBox="0 0 24 24"
        aria-label={label}
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
