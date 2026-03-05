import * as React from "react";
import { cn } from "./cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded border border-slate-300 bg-white text-black px-3 py-2 text-sm",
          "focus:outline-none focus:ring-0 focus:border-teal-500",
          "focus:shadow-[inset_4px_0_0_0_rgba(20,184,166,1)]",
          className,
        )}
      />
    );
  },
);

Textarea.displayName = "Textarea";
