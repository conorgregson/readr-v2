# Sprint 7 Blueprint — Tests + CI

**Readr v2.1**

Objective:
Lock confidence with a baseline test suite and CI pipeline.

This sprint focuses on:

- Vitest + React Testing Library setup
- High-risk unit tests (search, analytics, undo if present)
- Critical component tests (keyboard + save/cancel flows)
- GitHub Actions CI (typecheck/lint/test)

The goal is not “100% coverage.”
The goal is catching regressions.

---

## Sprint 7 Goal

At the end of Sprint 7:

- CI runs on every push/PR
- Tests cover the highest-risk parity areas
- A deliberate break is caught by tests (proof of value)
- Team confidence increases: you can refactor safely

---

## Guardrails

- No feature work
- No refactors unless required to enable testability
- Focus on parity-critical behaviors only

---

## Scope

### 1) Testing Setup

- Install and configure:
  - Vitest
  - @testing-library/react
  - @testing-library/user-event
- Add test scripts and ensure they run locally and in CI
- Add jsdom environment

### 2) Unit Tests (Must-Have)

Write unit tests for pure logic modules:

Search:

- tokenize + normalization
- AND semantics
- fuzzy matching cases
- looser search behavior options

Analytics (if included in scope):

- streaks calculation
- percent change math
- range window bounds correctness

Import/export (if included):

- schema validation
- merge + dedupe correctness

### 3) Component Tests (Must-Have)

Write component tests for the highest-risk UI behaviors:

Books:

- no-results vs empty
- looser search CTA behavior
- save/cancel does not leak edits
- Enter/Escape behavior where critical

Sessions:

- history keyboard navigation (Arrow/Home/End) if applicable
- edit/save/delete flow

Autosuggest (if included):

- combobox ARIA + keyboard pick

### 4) CI Pipeline (GitHub Actions)

On PR/push:

- npm install
- typecheck
- lint
- test

Optional:

- cache node_modules

### 5) “Intentional Break” Proof

Make one controlled change temporarily that should fail:

- e.g., change fuzzy distance rule or streak behavior
  Confirm tests fail, then revert.

This proves the suite actually guards parity.

---

## Deliverable

- Green CI badge
- Baseline test coverage locked
- Documented “what’s covered” list

---

## Exit Criteria

- CI runs on every push/PR
- Tests catch at least one intentional break
- High-risk parity areas covered (search + core flows minimum)
- No flaky tests
