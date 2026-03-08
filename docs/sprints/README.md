# Readr v2.1 — Sprint Blueprints Index

This folder contains tactical implementation blueprints for each sprint
in the v2.1 React rebuild.

Each blueprint is:

- Scope-limited
- Parity-driven
- Time-boxed to ~1 week
- Aligned with the v1.9 Parity Lock Specification
- Structured around Tier 0 freeze gates

These documents are implementation guides — not architecture or roadmap docs.

---

## Sprint Blueprints (Charter-Aligned)

### Sprint 0 — Prep & Guardrails

Project setup, constraints, and parity charter established.

→ [Sprint 0 Blueprint](./sprint-0-blueprint.md)

---

### Sprint 1 — React Foundation

App boots, routes render, layout stable.

→ [Sprint 1 Blueprint](./sprint-1-blueprint.md)

---

### Sprint 2 — UI Patterns & State Skeleton

Reusable UI states + Zustand scaffolding.

→ [Sprint 2 Blueprint](./sprint-2-blueprint.md)

---

### Sprint 3 — Books List + Search Parity (Read-Only)

Core Readr loop rebuilt with full search/filter parity.

→ [Sprint 3 Blueprint](./sprint-3-blueprint.md)

---

### Sprint 4 — Books CRUD + Timestamp Parity

Add/Edit/Delete flows fully implemented and demo-ready.

→ [Sprint 4 Blueprint](./sprint-4-blueprint.md)

---

### Sprint 5 — Books Tier 0 Lock 🔒

Undo system, highlight parity, autocomplete parity, search lock.

→ [Sprint 5 Blueprint](./sprint-5-blueprint.md)

---

### Sprint 6 — Sessions Core

Log sessions + history + sorting + editing.

→ [Sprint 6 Blueprint](./sprint-6-blueprint.md)

---

### Sprint 7 — Sessions Tier 0 Lock 🔒

Keyboard navigation, undo, highlight, deterministic sort lock.

→ [Sprint 7 Blueprint](./sprint-7-blueprint.md)

---

### Sprint 8 — Hardening & Accessibility

A11y pass, focus management, state stability.

→ [Sprint 8 Blueprint](./sprint-8-blueprint.md)

---

### Sprint 9 — Tests + CI Baseline

Unit + component tests + GitHub Actions pipeline.

→ [Sprint 9 Blueprint](./sprint-9-blueprint.md)

---

### Sprint 10 — Freeze & Stabilization ✅

Manual Tier 0 audit, cleanup, release validation, and final freeze.

→ [Sprint 10 Blueprint](./sprint-10-blueprint.md)

---

## How to Use These Docs

- Always finish the current sprint before referencing the next.
- Tier 0 lock sprints (5 & 7) must be fully green before moving forward.
- If behavior is unclear, check:
  - `parity-charter-v2.1.md`
  - `test-matrix-parity.md`
- No new features until Tier 0 freeze conditions are met.
- Refactor only if it reduces React → API friction.

This structure ensures:

- Predictable progress
- Clean freeze boundaries
- No parity regressions
- API readiness after Sprint 10
