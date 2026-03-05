import * as React from "react";
import { cn } from "./cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} {...props} className={cn("rounded border p-4", className)} />
  );
});

Card.displayName = "Card";
