# Sprint 6 Blueprint — Sessions Core

Readr v2.1

Objective:
Deliver full Sessions CRUD + history parity.

This sprint builds Sessions functionality.
Locking occurs in Sprint 7.

---

# Sprint 6 Goal

At the end of this sprint:

- Sessions can be logged
- History renders correctly
- Sorting deterministic
- Edit/delete flows implemented
- Persistence confirmed
- No UI instability

---

# Scope

## Logging Flow

- Book selection required (unless legacy allowed none)
- Date normalization matches v1.9
- Minutes/pages validation parity
- Reject 0/0 sessions
- Reject negative values
- Enter saves
- Escape cancels

---

## History View

- Displays:
  - Date
  - Book title
  - Minutes/pages
  - Notes (truncated if needed)
- Stable rendering (no flicker)

---

## Sorting

- Deterministic
- Stable
- Tie-breaker defined
- Immediate UI update

---

## Edit/Delete

- Inline or modal (match v1.9)
- Cancel restores original values
- Delete removes immediately
- Undo implemented in Sprint 7

---

# Tests Required

## Unit

- Normalization rules
- Deterministic sorting
- CRUD integrity

## Component

- Log form validation
- Edit/save/cancel
- Delete removes row

## Manual QA

- Multiple dates
- Active sort while editing
- Delete while sorted
- Refresh persistence

---

# Acceptance Criteria

- Sessions stable
- Sorting deterministic
- Persistence confirmed
- No console errors
