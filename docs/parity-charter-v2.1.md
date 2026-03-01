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
- [ ] Sprint 5 — **Books Tier 0 Lock**
- [ ] Sprint 6 — Sessions Core
- [ ] Sprint 7 — **Sessions Tier 0 Lock**
- [ ] Sprint 8 — Hardening & Accessibility Sweep
- [ ] Sprint 9 — Tests & CI Baseline

---

# v2.1 Tier 0 Progress Dashboard

_Last updated: 2026-03-01_

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
| Dedicated Search button parity (if applicable) | ❌     |

Search Tier 0 Completion: **5 / 8**

---

### Books Behavior

| Area                            | Status |
| ------------------------------- | ------ |
| Add/Edit parity                 | ✅     |
| Inline save/cancel integrity    | ✅     |
| Status transitions + timestamps | ✅     |
| Optimistic update rollback      | 🟡     |
| Undo (~6s) delete               | ❌     |
| Undo (~6s) finish               | ❌     |
| Undo preserves filters/search   | ❌     |
| Undo persistence after refresh  | ❌     |

Books Tier 0 Completion: **3.5 / 8**

**Sprint 5 Freeze Condition:**
All rows above must be ✅ before closing Sprint 5.

---

## Sessions Tier 0 (Sprint 7 Target)

### Sprint 6 — Sessions Core

| Area                | Status |
| ------------------- | ------ |
| CRUD flows          | ❌     |
| Sorting determinism | ❌     |
| Stable rendering    | ❌     |

### Sprint 7 — Lock Items

| Area                                 | Status |
| ------------------------------------ | ------ |
| Keyboard navigation (Arrow/Home/End) | ❌     |
| Live region announcements            | ❌     |
| Undo (~6s) delete                    | ❌     |
| Highlight parity in rows             | ❌     |

Sessions Tier 0 Completion: **0 / 7**

**Sprint 7 Freeze Condition:**
All rows must be ✅ before closing Sprint 7.

---

## Sprint 8 — Hardening & Accessibility

| Area                        | Status |
| --------------------------- | ------ |
| Focus management            | ❌     |
| Corrupt storage fallback    | ❌     |
| Large dataset sanity check  | ❌     |
| Rapid interaction stability | ❌     |

---

## Sprint 9 — CI Baseline

| Area                              | Status |
| --------------------------------- | ------ |
| Search unit suite stable          | 🟡     |
| Undo unit tests implemented       | ❌     |
| Sessions sort tests               | ❌     |
| Keyboard interaction test         | ❌     |
| Intentional regression proof test | ❌     |
| CI gating enabled                 | 🟡     |

---

# Scope Clarification (v2.1)

## In Scope for v2.1 Freeze

- Books
- Search + filters
- Sessions logging + history
- Undo system
- Keyboard parity
- Highlighting
- Autocomplete
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

Deferred features do not block v2.1 freeze.

---

# Tier Structure

## Tier 0 — Must Match Exactly

Any deviation from v1.9 behavior is a regression.

## Tier 1 — Must Feel Identical

Implementation may differ; UX must be indistinguishable.

## Tier 2 — Internal Invariants

State, persistence, and domain integrity rules must hold at all times.

---

# Tier 0 Requirements (v1.4–v1.9)

## v1.4 — Power-User Features

### Undo System

- [ ] Delete/finish supports Undo (~6s)
- [ ] Undo restores exact previous object state
- [ ] Undo preserves ordering, filters, and search integrity
- [ ] Undo works for books and sessions

### Inline Editing

- [x] Save commits without re-adding
- [x] Cancel restores original values
- [ ] Does not break keyboard behavior

### Smarter Search

- [x] Fuzzy typo tolerance
- [x] Partial token matching
- [x] Looser search toggle behavior
- [x] Correct no-results state rendering

---

## v1.5 — Book Enhancements (In Scope Only)

- [ ] Series / Standalone flag persists
- [ ] Digital / Physical flag persists
- [ ] ISBN stored if provided
- [x] Planned → Reading → Finished flow correct

Bulk edit deferred to v2.2+.

---

## v1.6 — Search & Filters (In Scope Only)

- [ ] Dedicated Search button parity (if applicable)
- [ ] Autocomplete suggestions parity
- [x] Clear All resets immediately
- [ ] Performance acceptable with 1,000+ books

Saved favorite filters deferred to v2.2+.

---

## v1.8 — Sessions & History

- [ ] Sessions CRUD parity
- [ ] Deterministic sorting
- [ ] Keyboard navigation (Arrow/Home/End)
- [ ] Live-region announcements (if applicable)
- [ ] Search highlight in titles/notes
- [ ] Long notes truncation parity
- [ ] Undo for deleted sessions

---

## v1.9 — Visualization & Motivation

Out of scope for v2.1.
Deferred to v2.3+ unless explicitly scheduled.

---

# Tier 2 — Internal Invariants

## Store / Service Rules

- Components never access persistence directly
- Stores are the only write path
- Services are the only IO layer
- Actions are atomic (apply OR rollback)
- Corrupt storage never crashes the app

## Books Invariants

- Unique stable `id`
- Immutable `createdAt`
- Controlled `updatedAt`
- Correct timestamp transitions

## Sessions Invariants

- Unique stable `id`
- Valid `bookId`
- Deterministic sorting
- Undo restores exact prior state

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
