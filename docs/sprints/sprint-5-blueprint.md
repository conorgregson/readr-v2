# Sprint 5 Blueprint — Books Tier 0 Lock

Readr v2.1

Objective:
Freeze Books + Search into Tier 0 behavioral lock before Sessions begin.

This sprint is about correctness, not new features.

---

# Sprint 5 Goal

At the end of this sprint:

- Undo system works (~6s window)
- Undo survives refresh (if parity requires)
- Highlight rendering matches v1.9
- Autocomplete suggestions parity achieved
- Search behavior fully locked
- Optimistic rollback finalized
- No regressions in filters/search
- Unit + component tests added for high-risk areas

Books/Search become frozen.

---

# Non-Negotiable Tier 0 Requirements

## Undo (Books)

- Delete supports ~6s undo
- Finish supports ~6s undo
- Undo restores exact object state
- Undo preserves:
  - Filters
  - Search
  - Ordering
- Undo does not corrupt timestamps
- Undo window expiration finalizes deletion

No partial restores.

---

## Highlight Rendering

- Token matches highlighted exactly like v1.9
- Fuzzy matches highlighted correctly
- No double wrapping
- No broken HTML injection
- Highlight persists across edits

---

## Autocomplete Parity

If v1.9 supported autocomplete:

- Suggestions based on current dataset
- Arrow navigation works
- Enter selects suggestion
- Escape closes dropdown
- aria-activedescendant correct
- No keyboard trap

---

## Dedicated Search Button (If Applicable)

If v1.9 required explicit submit:

- Parity behavior preserved
- Enter vs click behavior identical
- No auto-search deviation

---

## Optimistic Update Finalization

- Store actions must apply-or-rollback
- Persistence failure restores prior state
- No half-applied UI state

---

# Tests Required

## Unit

- Undo timer expiration logic
- Object restoration integrity
- Highlight tokenization logic
- Autocomplete suggestion filtering

## Component

- Undo restores correct card
- Highlight renders correctly
- Autocomplete keyboard selection
- Enter/Escape search behavior

## Manual QA

- Delete under active filter → undo
- Finish under search → undo
- Rapid delete/undo cycles
- Highlight under looser search
- Autocomplete with 500+ books

---

# High-Risk Areas

1. Undo + active filters
2. Undo + search query
3. Highlight HTML injection
4. Optimistic rollback on failure
5. Expired undo timer edge cases

---

# Acceptance Criteria

Sprint 5 is complete when:

- All Books Tier 0 rows in Parity Charter are ✅
- No highlight bugs
- Undo stable under stress
- Tests added and passing
- No console errors

Books are frozen.

Sessions may begin in Sprint 6.
