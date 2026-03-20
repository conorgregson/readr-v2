# Sprint 8 Blueprint — Hardening & Accessibility

Readr v2.1

Objective:
Stabilize the entire frontend before CI baseline.

No new features.

---

# Focus Areas

## Accessibility

- All buttons/inputs labeled
- Visible focus states
- No keyboard traps
- Modals restore focus
- Combobox ARIA correct
- Live region consistent

---

## Focus Management

Verify:

- After add/save/delete
- After undo
- After search clear
- After session selection change

---

## Edge Case State Transitions

- Empty → data → filtered → cleared
- Edit while filtered
- Rapid save/cancel toggles
- Rapid undo cycles

App must never:

- Throw
- Leave stale derived results
- Lock focus incorrectly

---

## Service Layer Sanity

- UI never touches persistence
- Store only write path
- Services only IO layer
- No accidental direct localStorage usage

---

## Performance Sanity

- Memoize heavy selectors
- Avoid unnecessary list rerenders
- No spinner flicker

---

# Exit Criteria

- No obvious a11y regressions
- Edge cases stable
- State transitions predictable
- Backend-ready boundaries clean
