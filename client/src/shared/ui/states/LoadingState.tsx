import { Spinner } from "../Spinner";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-4">
      <Spinner />
      <div className="text-sm text-slate-300">{label}</div>
    </div>
  );
}
