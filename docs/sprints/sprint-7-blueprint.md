# Sprint 7 Blueprint — Sessions Tier 0 Lock

Readr v2.1

Objective:
Freeze Sessions into Tier 0 parity.

---

# Sprint 7 Goal

At the end of this sprint:

- Keyboard navigation parity achieved
- Undo (~6s) delete works
- Highlight parity in rows
- Live-region announcements implemented
- Deterministic sort fully locked
- Sessions Tier 0 fully green

---

# Tier 0 Requirements

## Keyboard Navigation

If supported in v1.9:

- ArrowDown moves selection
- ArrowUp moves selection
- Home → first
- End → last
- Escape clears selection
- aria-selected correct
- No keyboard trap

---

## Undo (Sessions)

- Delete supports ~6s undo
- Undo restores exact prior state
- Undo preserves sorting + selection
- Undo does not duplicate rows

---

## Highlight Parity

- Search highlights session rows
- Notes highlight correctly
- No DOM corruption

---

## Live Region

- Selection changes announced
- Undo actions announced
- Accessible labeling consistent

---

# Tests Required

## Unit

- Undo timer logic
- Deterministic sort invariants

## Component

- Arrow/Home/End movement
- Undo restore
- Highlight rendering

## Manual QA

- Delete under active sort → undo
- Keyboard navigate rapidly
- Highlight under filter
- Stress test selection state

---

# Acceptance Criteria

- All Sessions Tier 0 rows green
- No keyboard regressions
- No selection state bugs
- No console errors

Sessions frozen.
