import * as React from "react";
import { cn } from "./cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded border border-slate-300 bg-white text-black px-3 py-2",
          // Left-only focus indicator
          "focus:outline-none focus:ring-0 focus:border-teal-500",
          "focus:shadow-[inset_4px_0_0_0_rgba(20,184,166,1)]",
          className,
        )}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
