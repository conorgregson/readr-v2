import * as React from "react";
import { cn } from "./cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded border border-slate-300 bg-white text-black px-3 py-2",
          // Left-only focus indicator
          "focus:outline-none focus:ring-0 focus:border-teal-500",
          "focus:shadow-[inset_4px_0_0_0_rgba(20,184,166,1)]",
          className,
        )}
      />
    );
  },
);

Input.displayName = "Input";
