# Readr v2.4 — Architecture Note

## Overview

Readr v2.4 is a feature-expansion release built on the stable authenticated, API-backed architecture established in earlier v2.x versions.

This release does not introduce:

- a persistence migration
- a major routing rewrite
- a store architecture rewrite
- a break in existing CRUD boundaries

Instead, v2.4 layers new workflows and derived read models onto the current system.

Primary feature groups:

- bulk book actions
- saved library views
- dashboard statistics
- goals, streaks, and badges

---

## Architectural Priorities

### 1. Preserve existing layering

Feature work must continue to respect the established boundary:

**UI → store/state → service/API client → server API → persistence**

No feature should bypass those boundaries for convenience.

### 2. Keep derived correctness on the server

Server-derived state is required where correctness, consistency, and trust matter.

This includes:

- badge unlock logic
- streak calculations
- summary statistics
- dashboard aggregates

The UI is responsible for presentation, not authoritative rule evaluation.

### 3. Treat analytics and engagement as read models first

Dashboard, goals, streaks, and badges should enter the system as read-only surfaces before any expansion into richer editing or configuration flows.

This keeps v2.4 focused and avoids overcoupling derived-state features too early.

### 4. Keep bulk actions safe and atomic

Bulk book actions introduce grouped mutation complexity.

That means:

- validation must happen before execution
- ownership must be enforced before mutation
- transactions must prevent partial commits
- grouped Undo must be planned into the response model

### 5. Maintain user ownership boundaries

All v2.4 features must remain scoped to the authenticated user.

This applies to:

- book selection in bulk actions
- saved views
- stats
- engagement progress
- any future related persistence

---

## Feature Boundaries

# Bulk Edit

Bulk edit is a mutation feature.

Responsibilities:

- server validates all targeted ids
- server enforces ownership
- mutation executes atomically
- response provides grouped operation metadata

Non-goals for Sprint 0:

- broad arbitrary field mutation
- inline UI implementation
- undo restoration logic implementation

---

# Saved Views

Saved views are lightweight user-owned preference records.

Responsibilities:

- persist reusable filter + sort state
- restore library configuration reliably
- remain scoped per authenticated user
- fail safely when views are invalid or missing

Saved views are not:

- shared artifacts
- collaborative objects
- recommendation systems

---

# Dashboard / Statistics

Dashboard and analytics are read-only aggregate surfaces.

Responsibilities:

- expose stable summary cards
- support chart-ready payloads
- remain safe for empty or sparse data
- avoid any mutation semantics

These surfaces should be computed on the server to preserve consistency across clients and sessions.

---

# Goals / Streaks / Badges

These are engagement read models built from user activity and aggregate state.

Responsibilities:

- derive progress consistently
- avoid duplicated rule logic in the UI
- remain renderable in empty states
- support accessible presentation

The UI may:

- organize
- sort
- visually group
- decorate

The UI should not:

- authoritatively calculate streaks
- evaluate badge unlock rules
- recompute goal completion as the source of truth

---

## Why Sprint 0 Is Contract-First

v2.4 touches multiple feature families that depend on shared assumptions.

Without a contract-first phase, the project risks:

- inconsistent DTO shapes
- duplicated business logic
- premature UI coupling
- accidental boundary erosion
- later refactors to reconcile mismatched assumptions

Sprint 0 exists to reduce that risk before implementation begins.

---

## Non-Goals of v2.4

v2.4 does not include:

- public profiles
- social reading features
- shared libraries
- external integrations
- AI-generated insights
- architecture replacement of existing CRUD systems

---

## Success Criteria

v2.4 architecture is successful if:

- new features fit the existing layering model
- server-owned derived state stays server-owned
- bulk actions do not compromise integrity
- analytics remain stable and read-only
- the UI stays presentation-focused rather than rule-authoritative
