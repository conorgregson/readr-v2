import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// Forward ref so inline edit autofocus can focus/select the input
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded border bg-white text-black placeholder:text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${className}`}
      />
    );
  },
);
