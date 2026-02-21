# Sprint 6 Blueprint — Hardening & Accessibility

**Readr v2.1**

Objective:
Make the React frontend stable and production-safe before adding tests/CI.

This sprint focuses on:

- Accessibility (ARIA, focus management, keyboard flow)
- Edge-case state transitions
- Performance sanity (avoid obvious slowdowns)
- Service layer sanity check (API-swap readiness)
- Consistent UX polish (no flicker, no broken transitions)

No new features.
No scope creep.
This sprint is about correctness and resilience.

---

## Sprint 6 Goal

At the end of Sprint 6:

- No obvious a11y regressions from v1.9
- Keyboard behavior matches parity requirements
- Focus management is predictable and consistent
- State edge cases don’t break the UI
- Service/store boundaries are clean (backend-ready)
- App feels stable under rapid interactions

---

## Guardrails

- No new features (strict)
- Only refactor if it reduces future API friction or fixes bugs
- Any behavior changes must be parity-driven

---

## Scope

### 1) Accessibility Pass

Required checks:

- Buttons/inputs have accessible names
- Proper labels for form inputs
- No missing roles for interactive components
- Visible focus indicator always present
- No keyboard traps

If modals/drawers exist:

- focus trap
- Escape closes
- focus restored to the trigger

If autosuggest exists:

- role="combobox"
- listbox roles/options correct
- aria-activedescendant behaves properly

### 2) Focus Management Parity

Confirm focus behavior for:

Books:

- after add/save/cancel/delete
- after search clear (Escape)
- after ArrowDown selection activation

Sessions:

- after log/save/cancel/delete
- after keyboard row selection changes
- Escape clears selection & returns focus appropriately (if parity says so)

### 3) Keyboard Flow Verification

Run through key interactions:

- Enter saves where expected
- Escape cancels/closes where expected
- Arrow navigation works where applicable
- Tab order is logical and consistent

### 4) State Edge Cases

Verify transitions:

- empty → add data → non-empty
- non-empty → filter to no-results → clear
- search query change while editing
- edit while filtered
- delete while filtered
- rapid save/cancel toggles

App must not:

- throw
- leave UI stuck
- display stale derived results

### 5) Service Layer Sanity Check (API Swap Readiness)

Confirm:

- UI never calls persistence directly
- stores call feature services
- services encapsulate storage details
- data mapping points are clear (future API client)

### 6) Performance Sanity

- Avoid recomputing search every render (memoize selectors)
- Avoid full-list rerenders on minor updates (key stability)
- No UI flicker from spinners showing too aggressively

---

## Deliverable

- Polished, stable React frontend
- Documented known edge cases
- Clear readiness for Sprint 7 tests + CI

---

## Tests

Not the focus, but you may add:

- one or two lightweight regression tests discovered during hardening

---

## Exit Criteria

- No obvious UX/a11y regressions
- Keyboard flow verified for critical paths
- Edge-case transitions behave correctly
- Service/store boundaries clean and backend-ready
- No console errors
