# Readr v2.1 Architecture

React Parity Rebuild (Frontend-Only)

---

## Purpose

This document describes **how v2.1 is structured**.

Behavioral requirements, Tier 0 locks, sprint gates, and scope are defined in:

- [`docs/parity-charter-v2.1.md`](/docs/parity-charter-v2.1.md)

v2.1 is:

- Local-first
- Frontend-only
- Behaviorally aligned to v1.9 (within v2.1 scope)
- Architected so an Express + Prisma + PostgreSQL API can replace local persistence in v2.2 without UI rewrites

Behavioral accuracy > new features.

---

## Scope Boundary

### In scope for v2.1 freeze

- Books + Search/Filters parity (Tier 0 lock)
- Sessions core + history parity (Tier 0 lock)
- Undo (~6s), highlighting, autocomplete
- Keyboard parity (sessions + editing) and live region announcements where applicable
- Hardening/a11y baseline + performance sanity check
- CI baseline (typecheck + tests)

### Deferred (does not block v2.1)

- v2.2+: API persistence migration, import/export + merge/dedupe, saved filters, bulk edit
- v2.3+: charts/badges/streaks/snapshot export

---

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- **State**: Zustand
- **Tests**: Vitest + React Testing Library
- **CI**: GitHub Actions (typecheck / lint / test)

### Backend (after v2.1)

- Express + TypeScript
- PostgreSQL
- Prisma ORM

---

## Core Architecture Principles

1. **Parity first**: match v1.9 flows, semantics, and keyboard behavior.
2. **Feature-first structure**: group files by domain (books/sessions/settings).
3. **UI never touches storage**: all persistence/API access is behind a **service layer**.
4. **Explicit state boundaries**: global state for shared domain data; local state for transient UI/forms.
5. **Reusable UI primitives**: consistent components + patterns for loading/empty/error.
6. **Atomic actions**: store actions must apply-or-rollback (no half-applied state).

---

## Routing + App Shell

**React Router** with a persistent layout.

Routes:

- `/` — Books page (list + filters + search + add/edit)
- `/sessions` — Session History
- `/settings` — Settings (page or panel)

Layout:

- `AppShell` (header/nav) + `<Outlet />` for page content

Goal: layout persists across routes with no reset/jank.

## Folder Structure

```bash
src/
  app/
    App.tsx
    router.tsx
    AppShell.tsx
    providers.tsx

  features/
    books/
      components/
      hooks/
      services/
        books.service.ts
      store/
        books.store.ts
      types.ts
      page.tsx

    sessions/
      components/
      hooks/
      services/
        sessions.service.ts
      store/
        sessions.store.ts
      types.ts
      page.tsx

    settings/
      components/
      services/
      store/
      page.tsx

  shared/
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Select.tsx
      Spinner.tsx
    services/
      storage/
      apiClient.ts # future placeholder for v2.2
    utils/
      formatting.ts
      validation.ts
```

Notes:

- Domain types live inside each feature
- Avoid `shared/types/` unless truly global types emerge.
- Shared UI components remain primitive and reusable

## Domain Model (TypeScript as Source of Truth)

Frontend domain types are canonical in v2.1.

Core types:

- `Book` (id, title, author, status, createdAt/updatedAt, startedAt/finishedAt, optional metadata)
- `Session` (id, bookId, date, minutes/pages, notes, etc.)
- Enums/constants: `BookStatus`, sort modes, filter states

If backend shapes differ later, introduce a mapping/adapter layer (API → domain) without changing UI code.

## State Management (Zustand)

### booksStore

State:

- `books[]`
- `filters`
- `searchQuery`
- derived selector: `visibleBooks`

Actions:

- `loadBook`
- `addBook`
- `updateBook`
- `deleteBook`
- `setFilter`
- `setSearch`

Tier 0 lock actions (Sprint 5):

- `undoLastBookAction` (or equivalent)
- `setLooserSearch` (if modeled explicitly)
- highlight + autocomplete state (if stored)

### sessionsStore

State:

- `sessions[]`
- `sort`
- `activeEdits` (or editing state)
- optional: row selection state for keyboard navigation

Actions:

- `loadSessions`
- `logSession`
- `updateSession`
- `deleteSession`
- `setSort`

Tier 0 lock actions (Sprint 7):

- `undoLastSessionAction` (or equivalent)
- keyboard navigation actions (selection movement, focus sync)

Sorting must be deterministic and stable.

### uiStore (Global UI Only)

State:

- toasts
- global banners
- app-level modals
- global loading flags

Guardrail:

Feature-specific modal/edit state should live inside that feature’s store or local component state.

Guideline:

- Global store: shared domain data and cross-page state
- Local component state: form inputs and transient UI

---

## Service Layer (Local-First now, API-Ready later)

All IO is behind `services/`. Components call services via store/actions/hooks.

v2.1 services:

- `BooksService`
  - `list()`, `create()`, `update()`, `remove()`
- `SessionsService`
  - `list()`, `log()`, `update()`, `remove()`

Implementation in v2.1:

- Local persistence (localStorage/IndexedDB) or in-memory adapter (dev)

Swap later (v2.2):

- Replace service implementations with API calls to Express/Prisma
- UI and store APIs remain stable

Rule: no direct localStorage/IndexedDB usage in components.

---

## UI Patterns

### Loading

- Minimal loading state (avoid unnecessary blocking)
- Avoid flicker/jank during rapid interactions

### Empty vs No Results

- `EmptyState`: no data exists yet
- `NoResultsState`: filters/search return none
  - Includes "Try looser search" parity behavior

### Errors

- User-facing actionable messaging
- Retry/reset patterns
- Developer logs remain console-only

Optional error shape:

```ts
interface AppError {
  code: string;
  message: string;
  detail?: string;
}
```

---

## Forms + CRUD (Parity Rules)

Books:

- list view with filters + search
- inline or modal edit
- preserve v1.9 save/cancel semantics
- keyboard parity:
  - Enter = confirm
  - Escape = cancel
  - Arrow navigation where applicable

Sessions:

- log session (local-first in v2.1)
- history table/list
- sort + edit/delete parity
- keyboard navigation parity (ArrowUp/Down/Home/End) where applicable

Accessibility:

- focus management
- ARIA where appropriate
- no regression from v1.9 behavior

---

## Testing Strategy

Focus on parity-critical logic:

- store actions + selectors
- filtering + looser search behavior
- undo timing + restore integrity
- add/edit/delete flows
- session logging + sorting determinism
- empty vs no-results logic
- keyboard navigation + live region updates (sessions)

Tracking source of truth:

- [`docs/v2.1-test-matrix.md`](/docs/test-matrix-parity.md)

---

## CI Pipeline (GitHub Actions):

On PR:

- Install
- Typecheck
- Lint
- Test

Fail fast on regressions.

---

## v2.1 Definition of Done

v2.1 is complete when:

- Books/Search Tier 0 lock achieved
- Sessions Tier 0 lock achieved
- Persistence fully abstracted behind services
- State boundaries are stable
- Loading/empty/error patterns are consistent
- A test baseline exists and is stable
- CI is green and gating PRs
