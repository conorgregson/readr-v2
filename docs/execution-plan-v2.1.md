# Readr v2.1 — Execution Plan

Time-Boxed React Rebuild Strategy

Sprint length: ~1 week
Cadence goal: visible progress every sprint
Rule: no new features until parity milestones are hit

This plan converts the v2.1 roadmap into tactical sprint execution.

---

## Strategic Principles

1. Rebuild behavior, not redesign UI.
2. Preserve v1.9 parity before introducing improvements.
3. Lock high-risk logic (search + analytics) early.
4. No backend work during v2.1.
5. Refactor only when it reduces future API friction.

---

## Sprint Timeline Overview

| Sprint | Focus               | Outcome                      |
| ------ | ------------------- | ---------------------------- |
| 1      | Foundation          | React app alive              |
| 2      | Patterns + State    | Behavior framework           |
| 3      | Books List + Search | Core loop parity             |
| 4      | Books CRUD          | Demo-ready milestone         |
| 5      | Sessions            | Secondary feature parity     |
| 6      | Hardening           | Stability + accessibility    |
| 7      | Tests + CI          | Confidence + regression lock |

Estimated duration: ~7–8 weeks (faster if full-time)

---

## Sprint 1 — React Foundation

Objective:
Boot a stable React + TS + Router app.

Deliverables:

- Vite + React setup
- React Router working
- AppShell layout stable
- Shared UI primitives (Button, Input, Card)

Blueprint:
→ [Sprint 1 Blueprint](./sprints/sprint-1-blueprint.md)

Exit criteria:

- No console errors
- Layout stable across route changes
- Hot reload reliable

---

## Sprint 2 — UI Patterns & State Skeleton

Objective:
Create reusable UI states and Zustand scaffolding.

Deliverables:

- Loading / Empty / Error / NoResults states
- books.store scaffold
- sessions.store scaffold
- Strong typing

Blueprint:
→ [Sprint 2 Blueprint](./sprints/sprint-2-blueprint.md)

Exit criteria:

- Pages can toggle UI states manually
- Store compiles cleanly

---

## Sprint 3 — Books List + Search Parity

Objective:
Rebuild search + filters with full v1.9 behavior parity.

Deliverables:

- smartSearch ported
- applyFilters implemented
- Derived selector wired
- Looser search behavior
- Highlight rendering

Blueprint:
→ [Sprint 3 Blueprint](./sprints/sprint-3-blueprint.md)

Exit criteria:

- Search semantics match legacy
- No-results + looser search work correctly
- Unit tests cover search engine

---

## Sprint 4 — Books CRUD Parity

Objective:
Add full Add/Edit/Delete flows.

Deliverables:

- Add book modal/drawer
- Edit book save/cancel
- Validation parity
- Keyboard parity

Blueprint:
→ [Sprint 4 Blueprint](./sprints/sprint-4-blueprint.md)

Exit criteria:

- CRUD flows mirror v1.9
- Search/filter unaffected
- Demo-ready milestone

---

## Sprint 5 — Sessions Parity

Objective:
Implement session logging + history.

Deliverables:

- Log session UI
- History view with sorting
- Edit/Delete flows
- Book linkage intact

Blueprint:
→ [Sprint 5 Blueprint](./sprints/sprint-5-blueprint.md)

Exit criteria:

- Sessions behave like v1.9
- Sorting stable
- Persistence confirmed

---

## Sprint 6 — Hardening & Accessibility

Objective:
Stabilize and polish.

Deliverables:

- Accessibility pass
- Keyboard flow verification
- Edge-case state validation
- Clean service boundaries

Blueprint:
→ [Sprint 6 Blueprint](./sprints/sprint-6-blueprint.md)

Exit criteria:

- No obvious a11y regressions
- UI stable under rapid interaction
- Backend-ready architecture

---

## Sprint 7 — Tests + CI

Objective:
Lock confidence.

Deliverables:

- Vitest setup
- Unit tests (search, analytics, core logic)
- Component tests (critical flows)
- GitHub Actions CI

Blueprint:
→ [Sprint 7 Blueprint](./sprints/sprint-7-blueprint.md)

Exit criteria:

- CI runs on every push/PR
- Tests catch at least one intentional break
- High-risk parity areas covered

---

## Completion Definition

v2.1 is complete when:

- Books + Sessions parity achieved
- No regressions from v1.9
- Accessibility baseline met
- CI green
- Codebase clean and backend-ready

At that point:

- You can begin backend integration
- Or plan v2.2 feature expansion
