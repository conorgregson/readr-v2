import { Button } from "../../../shared/ui/Button";
import { useSessionsStore } from "../store/sessions.store";

export function SessionsUndoBar() {
  const undo = useSessionsStore((s) => s.undo);
  const undoDelete = useSessionsStore((s) => s.undoDelete);
  const canUndo = useSessionsStore((s) => s.canUndo);

  if (!undo) return null;
  if (!canUndo()) return null; // hide immediately once expired

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="text-xs text-slate-600">Session deleted.</div>
      <Button variant="secondary" onClick={undoDelete} disabled={!canUndo()}>
        Undo
      </Button>
    </div>
  );
}
