export type FocusToken =
  | { kind: "elementId"; id: string }
  | { kind: "selector"; selector: string }
  | { kind: "none" };

export function captureFocusToken(): FocusToken {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return { kind: "none" };

  // Prefer restoring by id when possible.
  if (el.id) return { kind: "elementId", id: el.id };

  // If the element provides a stable data attribute, restore via selector.
  const dataFocusId = el.getAttribute("data-focus-id");
  if (dataFocusId)
    return {
      kind: "selector",
      selector: `[data-focus-id="${CSS.escape(dataFocusId)}"]`,
    };

  return { kind: "none" };
}

export function focusById(id: string) {
  const el = document.getElementById(id) as HTMLElement | null;
  el?.focus();
  return !!el;
}

export function focusFirstMatch(selectors: string[]) {
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el) {
      el.focus();
      return true;
    }
  }
  return false;
}

export function restoreFocus(
  token: FocusToken,
  opts?: { fallbackSelectors?: string[]; deferMs?: number },
) {
  const deferMs = opts?.deferMs ?? 0;
  window.setTimeout(() => {
    let ok = false;

    if (token.kind === "elementId") ok = focusById(token.id);
    if (!ok && token.kind === "selector")
      ok = focusFirstMatch([token.selector]);

    if (!ok && opts?.fallbackSelectors?.length) {
      focusFirstMatch(opts.fallbackSelectors);
    }
  }, deferMs);
}
