# Readr v2.1 — Parity Charter

React Frontend Rebuild with v1.9 Behavioral Lock

---

# Mission

Rebuild the Readr frontend in **React + TypeScript (Vite)** while preserving **v1.9 behavioral parity**.

v2.1 is:

- Local-first
- Frontend-only
- Behaviorally identical to v1.9 (within defined scope)
- Architected so Express + Prisma + PostgreSQL can replace local persistence in v2.2 without UI rewrites

Behavioral accuracy > new features.

---

# Parity Lock Definition

## Tier 0 Lock = Frozen Behavior

Once a feature reaches Tier 0 Lock:

- No regressions allowed
- Any regression blocks forward progress
- Covered by automated tests where feasible
- New work must not destabilize it

---

# Sprint Milestones

- [x] Sprint 0 — Prep & Guardrails
- [x] Sprint 1 — React Foundation
- [x] Sprint 2 — UI Patterns & State Skeleton
- [x] Sprint 3 — Search + Filters Parity (read-only)
- [x] Sprint 4 — Books CRUD + Timestamp Parity
- [x] Sprint 5 — **Books Tier 0 Lock**
- [x] Sprint 6 — Sessions Core
- [x] Sprint 7 — **Sessions Tier 0 Lock**
- [x] Sprint 8 — Hardening & Accessibility Sweep
- [x] Sprint 9 — Tests & CI Baseline
- [ ] Sprint 10 — Freeze & Stabilization

---

# v2.1 Tier 0 Progress Dashboard

_Last updated: 2026-03-05_

All rows must be complete before v2.1 freeze.

---

## Books / Search Tier 0 (Sprint 5 Target)

### Search Engine

| Area                                           | Status |
| ---------------------------------------------- | ------ |
| AND semantics + token rules                    | ✅     |
| Fuzzy matching                                 | ✅     |
| Filters-before-search                          | ✅     |
| Empty vs NoResults logic                       | ✅     |
| Looser search behavior                         | ✅     |
| Highlight rendering parity                     | ❌     |
| Autocomplete suggestions parity                | ❌     |
| Dedicated Search button parity (if applicable) | ✅     |

Search Tier 0 Completion: **6 / 8**

---

### Books Behavior

| Area                            | Status                     |
| ------------------------------- | -------------------------- |
| Add/Edit parity                 | ✅                         |
| Inline save/cancel integrity    | ✅                         |
| Status transitions + timestamps | ✅                         |
| Optimistic update rollback      | ✅                         |
| Undo (~6s) delete               | ✅                         |
| Undo (~6s) finish               | ✅                         |
| Undo preserves filters/search   | ✅                         |
| Undo persistence after refresh  | 🚫 (not required for v2.1) |

Books Tier 0 Completion: **7 / 8**

---

## Sessions Tier 0 (Sprint 7 Target)

### Sprint 6 — Sessions Core

| Area                | Status |
| ------------------- | ------ |
| CRUD flows          | ✅     |
| Sorting determinism | ✅     |
| Stable rendering    | ✅     |

### Sprint 7 — Lock Items

| Area                                 | Status |
| ------------------------------------ | ------ |
| Keyboard navigation (Arrow/Home/End) | ✅     |
| Live region announcements            | ✅     |
| Undo (~6s) delete                    | ✅     |
| Highlight parity in rows             | ✅     |

Sessions Tier 0 Completion: **7 / 7**

Sessions behavior is now frozen.

---

## Sprint 8 — Hardening & Accessibility

| Area                        | Status |
| --------------------------- | ------ |
| Focus management            | ✅     |
| Corrupt storage fallback    | ✅     |
| Large dataset sanity check  | ✅     |
| Rapid interaction stability | ✅     |

Sprint 8 Completion: **4 / 4**

---

## Sprint 9 — Tests & CI Baseline

| Area                             | Status |
| -------------------------------- | ------ |
| Search unit suite stable         | ✅     |
| Undo unit tests implemented      | ✅     |
| Sessions sort tests              | ✅     |
| Keyboard interaction test        | ✅     |
| Intentional regression proof run | ✅     |
| CI gating enabled                | ✅     |

Sprint 9 establishes automated guardrails for Tier 0 features.

The following protections now exist:

- Search engine logic covered by unit tests
- Undo system logic covered by unit tests
- Sessions sorting logic covered by unit tests
- Keyboard navigation behavior covered by component tests
- CI pipeline running typecheck, lint, and test suites on every push and PR

A regression-proof validation was executed by temporarily introducing a fuzzy-match logic change in `search.engine.ts`.
The test suite failed as expected, confirming that CI guardrails detect behavioral regressions.

The change was reverted and the test suite returned to green.

Sprint 9 Completion: **6 / 6**

---

## Sprint 10 — Freeze & Stabilization

| Area                                | Status |
| ----------------------------------- | ------ |
| Full Tier 0 manual audit            | ❌     |
| Architecture boundary audit         | ❌     |
| Dead code removal                   | ❌     |
| Console/runtime warning audit       | ❌     |
| Dependency + typecheck verification | ❌     |
| Regression confidence validation    | ❌     |

Sprint 10 Completion: **0 / 6**

Sprint 10 Freeze Condition:

- All rows must be complete before tagging v2.1.0.
- No new features may be introduced during this sprint.

This sprint formally locks the React frontend as stable prior to API migration in v2.2.

---

# Scope Clarification (v2.1)

## In Scope for v2.1 Freeze

- Books
- Search + filters
- Sessions logging + history
- Undo system
- Keyboard parity
- Highlighting
- Autocomplete (if retained)
- Hardening + accessibility baseline
- CI baseline

## Explicitly Deferred

### v2.2+

- Bulk edit
- Saved favorite filters
- Import/export + merge/dedupe
- Multi-device sync logic

### v2.3+

- Charts
- Badges
- Streak systems
- Shareable snapshot export

---

# Tier Structure

## Tier 0 — Must Match Exactly

Any deviation from v1.9 behavior is a regression.

## Tier 1 — Must Feel Identical

Implementation may differ; UX must be indistinguishable.

## Tier 2 — Internal Invariants

State, persistence, and domain integrity rules must hold at all times.

---

# Release Gate — v2.1 Complete

v2.1 is complete when:

- Books/Search Tier 0 fully green
- Sessions Tier 0 fully green
- Hardening complete
- CI baseline active
- No behavioral regressions from v1.9

After freeze:
→ v2.2 (API integration) begins.
