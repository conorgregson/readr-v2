// Sprint 2 dev helper — remove once UI state transitions are driven by real data flows.

import { Button } from "./Button";
import type { PageMode } from "../types/ui-state";

export function DevStateBar({
  mode,
  onMode,
  onError,
  className,
}: {
  mode: PageMode;
  onMode: (mode: PageMode) => void;
  onError: () => void;
  className?: string;
}) {
  return (
    <div
      className={["flex flex-wrap gap-2", className].filter(Boolean).join("")}
    >
      <Button
        variant={mode === "results" ? "primary" : "secondary"}
        onClick={() => onMode("results")}
      >
        Results
      </Button>
      <Button
        variant={mode === "loading" ? "primary" : "secondary"}
        onClick={() => onMode("loading")}
      >
        Loading
      </Button>
      <Button
        variant={mode === "empty" ? "primary" : "secondary"}
        onClick={() => onMode("empty")}
      >
        Empty
      </Button>
      <Button
        variant={mode === "noresults" ? "primary" : "secondary"}
        onClick={() => onMode("noresults")}
      >
        No Results
      </Button>
      <Button
        variant={mode === "error" ? "danger" : "secondary"}
        onClick={onError}
      >
        Error
      </Button>
    </div>
  );
}
