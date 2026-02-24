import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// Forward ref so inline edit autofocus can focus/select the input
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={[
          "w-full rounded border border-slate-300 bg-white text-black px-3 py-2",
          // Left-only focus indicator
          "focus:outline-none focus:ring-0",
          "focus:border-teal-500",
          "focus:shadow-[inset_4px_0_0_0_rgba(20,184,166,1)]",
          className,
        ].join(" ")}
      />
    );
  },
);

Input.displayName = "Input";
