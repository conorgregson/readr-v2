import { Card } from "../../../shared/ui/Card";
import type { Session } from "../types";
import { SessionsRow } from "./SessionsRow";

type SessionsHistoryTableProps = {
  sessions: Session[];
};

export function SessionsHistoryTable({ sessions }: SessionsHistoryTableProps) {
  if (!sessions.length) {
    return (
      <Card>
        <div className="text-sm text-slate-500">
          No sessions logged yet. Use "Log session" to add one.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">History</h2>
        <div className="text-xs text-slate-400">
          {sessions.length === 1 ? "1 entry" : `${sessions.length} entries`}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-400">
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">Book</th>
              <th className="py-2 pr-3 font-medium">Details</th>
              <th className="py-2 font-medium">Notes</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {sessions.map((s) => (
              <SessionsRow key={s.id} session={s} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
