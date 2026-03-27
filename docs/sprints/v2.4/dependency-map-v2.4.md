# Readr v2.4 — Dependency Map

## Purpose

This document captures the implementation order and feature dependencies for v2.4.

v2.4 is intentionally structured so that high-risk assumptions are locked early and later UI work builds on stable contracts.

---

## Sprint Order

1. Sprint 0 — Contracts & Derived-State Design
2. Sprint 1 — Bulk Edit Foundation
3. Sprint 2 — Saved Views & Library Controls
4. Sprint 3 — Stats & Dashboard
5. Sprint 4 — Goals, Streaks & Badges
6. Sprint 5 — Hardening & Release Lock

---

## Dependency Overview

### Sprint 0

Foundational sprint.

Defines:

- bulk edit contracts
- saved view model
- stats/dashboard response shapes
- goals/streaks/badges domain boundaries
- server-derived vs UI-derived responsibilities

All later sprints depend on Sprint 0 outputs.

---

### Sprint 1 depends on Sprint 0

Bulk edit requires:

- stable grouped mutation request/response shapes
- atomicity rules
- ownership enforcement rules
- grouped Undo planning

Sprint 1 should not invent contract shapes during UI implementation.

---

### Sprint 2 depends on Sprint 0

Saved views require:

- a stable persistence model
- valid filter/sort schema
- rules for pinned/default behavior
- fallback behavior for missing/invalid views

Sprint 2 should not define persistence behavior ad hoc.

---

### Sprint 3 depends on Sprint 0

Stats/dashboard requires:

- stable read-only summary contracts
- chart-ready aggregate response shapes
- server-owned derivation rules
- empty-state-safe response rules

Sprint 3 should not derive authoritative dashboard logic in the client.

---

### Sprint 4 depends on Sprint 0 and Sprint 3

Goals, streaks, and badges require:

- engagement response contracts from Sprint 0
- supporting aggregate/stat assumptions from Sprint 3
- clear boundary between presentation and evaluation logic

Sprint 4 should build on stable metrics rather than invent parallel derived-state paths.

---

### Sprint 5 depends on all prior sprints

Hardening and release lock validates:

- bulk edit safety
- saved view correctness
- dashboard stability
- engagement correctness
- accessibility and performance across the full release

---

## Recommended Build Order Within Sprint 0

1. contracts-v2.4.md
2. architecture-v2.4.md
3. dependency-map-v2.4.md
4. shared client types
5. backend schema/type definitions
6. placeholder module structure if needed

---

## Cross-Feature Risk Notes

### Risk: duplicated business logic

Most likely in:

- streak calculations
- badge evaluation
- dashboard summaries

Mitigation:

- define server-owned rules early
- keep UI presentation-only where correctness matters

### Risk: boundary erosion

Most likely in:

- direct UI-side contract invention
- feature-specific shortcuts around existing store/service/API flow

Mitigation:

- preserve current layering
- define DTOs before implementation

### Risk: partial mutation behavior

Most likely in:

- grouped updates
- grouped deletes
- future Undo support

Mitigation:

- require atomicity
- define grouped operation result shape early

### Risk: unstable feature scope

Most likely in:

- saved views expanding too broadly
- engagement systems growing beyond read-only scope
- analytics surfacing mutation/configuration needs too early

Mitigation:

- keep v2.4 feature layering disciplined
- separate initial read models from future expansion ideas

---

## Exit Condition for Sprint 0

Sprint 0 is complete when:

- v2.4 contracts are documented
- architectural boundaries are explicitly stated
- dependency order is clear
- shared type/schema groundwork exists
- Sprint 1 can begin without inventing core shapes on the fly
