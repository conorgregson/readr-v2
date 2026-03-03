import { useSessionsStore } from "../store/sessions.store";

export function SessionsLiveRegion() {
  const liveMessage = useSessionsStore((s) => s.liveMessage);
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {liveMessage}
    </div>
  );
}
