# Sprint 9 Blueprint — Tests + CI Baseline

Readr v2.1

Objective:
Lock confidence with automated guardrails.

---

# Sprint 9 Goal

- CI runs on every PR
- High-risk parity logic covered
- Intentional break test proves protection
- No flaky tests

---

# Scope

## Testing Setup

- Vitest
- React Testing Library
- user-event
- jsdom
- Scripts configured

---

## Unit Tests

Books:

- Search tokenization
- Fuzzy matching
- Undo timing
- Highlight logic

Sessions:

- Deterministic sort
- Undo restore integrity

---

## Component Tests

Books:

- Undo restore
- Autocomplete selection
- Highlight rendering

Sessions:

- Arrow/Home/End
- Edit/save/cancel
- Undo delete

---

## Intentional Break Proof

Temporarily break:

- Fuzzy threshold
- Undo timing
- Sort comparator

Confirm failure.
Revert.

---

## CI (GitHub Actions)

On push/PR:

- install
- typecheck
- lint
- test

Fail fast on regression.

---

# Exit Criteria

- CI green
- High-risk areas covered
- Intentional break proven
- Tier 0 freeze protected
