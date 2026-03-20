# Sprint 10 Blueprint — Freeze & Stabilization

Readr v2.1

Objective:
Formally lock the React frontend before API migration.

---

# Sprint 10 Goal

- Full Tier 0 audit complete
- No console warnings
- No architectural boundary violations
- No dead code
- Clean dependency graph
- v2.1 ready for final tag

---

# Scope

## Tier 0 Manual Audit

Books:

- Add/edit parity verified
- Undo (~6s) delete + finish verified
- Deterministic status transitions confirmed
- Filter + search integrity preserved
- Highlight behavior consistent

Sessions:

- CRUD flows verified
- Deterministic sort (date → createdAt → id) confirmed
- Keyboard navigation (Arrow/Home/End/Escape) verified
- Undo (~6s) restore integrity confirmed
- Highlight parity in rows verified
- Selection stability under rapid interaction confirmed

Parity must match v1.9 core behavior.

---

## Architecture Boundary Audit

Validate:

- No component accesses persistence directly
- No `fetch` usage inside UI components
- Stores remain the only write gatekeepers
- Services remain the only IO layer
- No circular imports
- No cross-domain leakage (books ↔ sessions boundaries respected)

Confirm strict UI → Store → Service discipline.

---

## Dead Code & Cleanup

Remove:

- Sprint scaffolding
- Debug console logs
- Unused utilities
- Deprecated helpers
- TODO placeholders
- Temporary test hacks

Confirm:

- No unused exports
- No unused files
- No orphaned imports

---

## Console & Runtime Audit

Verify:

- No React warnings
- No accessibility warnings
- No controlled/uncontrolled input warnings
- No async state race warnings
- No hydration mismatches
- No error boundary triggers during normal flows

Dev console must remain clean.

---

## Dependency & Type Audit

Confirm:

- Strict TypeScript passes
- ESLint passes clean
- No implicit `any`
- No unused dependencies
- Lockfile stable
- Clean install on fresh clone

---

## Stress & Stability Validation

Manual stress checks:

- Rapid add/delete cycles
- Rapid undo cycles
- High-volume dataset (1000+ books simulated)
- Rapid keyboard navigation
- Filter switching during edits
- Edit → cancel → undo → re-edit flows

No crashes.
No state corruption.
No selection desync.

---

# Release Readiness Review

Before tagging `v2.1.0`:

- Sprint 9 CI fully green
- Tier 0 fully green
- No open behavioral bugs
- No architectural violations
- No console warnings

---

# Exit Criteria

- Tier 0 freeze validated
- CI passing
- Architecture boundary discipline confirmed
- Console clean
- No regression from v1.9 core flows
- `v2.1.0` tagged

---

This sprint marks the formal end of the React frontend rebuild phase.

After completion:

→ v2.2 API Integration begins.
