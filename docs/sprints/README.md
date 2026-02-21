# Readr v2.1 — Sprint Blueprints Index

This folder contains tactical implementation blueprints for each sprint
in the v2.1 React rebuild.

Each blueprint is:

- Scope-limited
- Parity-driven
- Time-boxed to ~1 week
- Aligned with the v1.9 Parity Lock Specification

These documents are implementation guides — not architecture or roadmap docs.

---

## Sprint Blueprints

### Sprint 1 — React Foundation

App boots, routes render, layout stable.

→ [Sprint 1 Blueprint](./sprint-1-blueprint.md)

---

### Sprint 2 — UI Patterns & State Skeleton

Reusable UI states + Zustand scaffolding.

→ [Sprint 2 Blueprint](./sprint-2-blueprint.md)

---

### Sprint 3 — Books List + Search Parity

Core Readr loop rebuilt with full search/filter parity.

→ [Sprint 3 Blueprint](./sprint-3-blueprint.md)

---

### Sprint 4 — Books CRUD Parity

Add/Edit/Delete flows fully implemented and demo-ready.

→ [Sprint 4 Blueprint](./sprint-4-blueprint.md)

---

### Sprint 5 — Sessions Parity

Log sessions + history + sorting + editing.

→ [Sprint 5 Blueprint](./sprint-5-blueprint.md)

---

### Sprint 6 — Hardening & Accessibility

A11y pass, keyboard parity, edge-case stabilization.

→ [Sprint 6 Blueprint](./sprint-6-blueprint.md)

---

### Sprint 7 — Tests + CI

Unit + component tests + GitHub Actions pipeline.

→ [Sprint 7 Blueprint](./sprint-7-blueprint.md)

---

## How to Use These Docs

- Always finish the current sprint before referencing the next.
- If behavior is unclear, check:
  - `parity-lock-v1.9.md`
  - `parity-must-haves-v1.4–v1.9.md`
- No new features until parity milestones are met.
- Refactor only if it reduces React → API friction.

This structure ensures:

- Predictable weekly progress
- Clear demo checkpoints
- No parity regressions
