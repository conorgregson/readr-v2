# Sprint 2 Blueprint — UI Patterns & State Skeleton

**Readr v2.1**

Objective:
Define consistent UI behavior patterns and scaffold state architecture
before real data wiring begins.

This sprint creates:

- Shared UI states (loading/empty/no-results/error)
- A consistent error/toast pattern
- Zustand store scaffolding with typed selectors
- Pages wired to toggle these patterns manually

No real persistence.
No real search logic yet.
This sprint is the “behavior framework.”

---

## Sprint 2 Goal

At the end of Sprint 2:

- All pages can display loading/empty/no-results/error states
- Error presentation is consistent (toast or inline)
- Zustand compiles with strong typing
- booksStore exists with a selector scaffold (even if empty)
- You can manually toggle states from dev-only switches or mock data

---

## Guardrails

- No feature completion work (no search parity, no CRUD)
- No storage integration beyond placeholders
- Keep patterns reusable (avoid per-page one-offs)

---

## Scope

### UI State Components (shared)

Create (or equivalents):

- LoadingState
- EmptyState
- NoResultsState
- ErrorState

Rules:

- Must be reusable across features (books/sessions/settings)
- Must be easy to drop into any page

### Error Pattern

Choose and implement one pattern:

- Inline error banner (preferred for parity + simplicity)
  OR
- Toast system (if already in v1 patterns)

Must support:

- simple message
- optional retry callback
- not blocking unrelated UI

### Zustand Setup

- Zustand installed and configured
- Create store scaffolds:

#### books.store.ts (minimum)

- state: books[], filters, searchQuery
- actions: setSearchQuery, setFilters (stubs ok)
- selectors: visibleBooks (stub ok)

#### sessions.store.ts (optional scaffold)

- state: sessions[], sortMode
- actions: setSortMode (stub ok)

No real logic needed yet—just stable typing and shape.

### Pages wired for manual state toggling

Each page should be able to show:

- loading
- empty
- error
- normal content

This can be done via:

- temporary dev toggles
- mocked arrays
- query string toggles (optional)

---

## Deliverable

- Reusable UI states implemented and demo-able
- Store scaffolding compiles with strict TypeScript typing
- Pages demonstrate the UI patterns

---

## Tests

Optional:

- One small store initialization test (smoke test)
  Not required yet unless it helps you.

---

## Exit Criteria

- Pages can toggle loading/empty/error/no-results states manually
- Store compiles with strong typing
- No console errors
- UI pattern components are reusable and consistent
