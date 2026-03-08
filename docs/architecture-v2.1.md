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
- Freeze validation and dead-code cleanup

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

- `/` — Books page
- `/sessions` — Session History
- `/settings` — Settings

Layout:

- `AppShell` + `<Outlet />`

Goal: layout persists across routes with no reset/jank.

## Folder Structure

```bash
src/
  app/
    router.tsx
    AppShell.tsx

  features/
    books/
      components/
      search/
      services/
        books.service.ts
      store/
        books.store.ts
      types.ts
      page.tsx

    sessions/
      components/
      services/
        sessions.service.ts
      store/
        sessions.store.ts
      types.ts
      page.tsx

    settings/
      page.tsx

  shared/
    a11y/
    data/
    ui/
      states/
      Button.tsx
      Card.tsx
      Input.tsx
      Select.tsx
      Spinner.tsx
    types/

  test/

  index.css
  main.tsx
```

Notes:

- Directory tree abbreviated for clarity. Only representative files and folders are shown.
- Domain types live inside each feature
- Shared UI components remain primitive and reusable
- Dev-only scaffolding was removed during Sprint 10 freeze cleanup

## Domain Model (TypeScript as Source of Truth)

Frontend domain types are canonical in v2.1.

Core types:

- `Book` (id, title, author, status, createdAt/updatedAt, startedAt/finishedAt, optional metadata)
- `Session` (id, bookId, date, minutes/pages, notes, etc.)
- Enums/constants: `BookStatus`, sort modes, filter states

If backend shapes differ later, introduce a mapping layer without rewriting UI code.

## State Management (Zustand)

### booksStore

State:

- `books[]`
- `filters`
- `searchQuery`
- `searchFuzzyOverride`
- `undo`
- derived selector: `visibleBooks`

Actions:

- `loadBook`
- `addBook`
- `updateBook`
- `deleteBook`
- `finishBook`
- `undoLast`
- `setFilters`
- `clearFilters`
- `setSearchQuery`
- `enableLooserSearch`

### sessionsStore

State:

- `sessions[]`
- `filters`
- `sortKey`
- `selectedId`
- `liveMessage`
- `undo`

Actions:

- `loadSessions`
- `addSession`
- `updateSession`
- `deleteSession`
- `undoDelete`
- `setFilters`
- `clearFilters`
- `setSortKey`
- selection helpers and announcements

Sorting remains deterministic and stable.

### Local UI State

Local component state is used for:

- inline edit drafts
- modal/panel open state
- transient focus management
- autosuggest UI state

Guardrail:

- shared domain data lives in feature stores
- transient UI state stays local unless cross-page reuse is required

---

## Service Layer (Local-First now, API-Ready later)

All IO is behind `services/`.

v2.1 services:

- `BooksService`
  - `list()`, `create()`, `update()`, `remove()`, `replaceAll()`
- `SessionsService`
  - `list()`, `create()/log()`, `update()`, `remove()`, `upsert()`

Implementation in v2.1:

- local persistence adapter
- storage sanitization and corruption fallback where required

Swap later (v2.2):

- replace service internals with API calls
- store and UI contracts remain stable

Rule: no direct localStorage usage in components.

---

## UI Patterns

### Loading

- Minimal loading state
- Avoid unnecessary blocking or flicker

### Empty vs No Results

- `EmptyState`: no data exists yet
- `NoResultsState`: search/filters return none
- Includes "Try looser search" parity behavior where applicable

### Errors

- User-facing actionable messaging
- Retry/reset patterns
- No debug scaffolding in production code

---

## Forms + CRUD (Parity Rules)

Books:

- list view with filters + search
- add/edit/delete/finish flows
- undo delete + undo finish
- autosuggest + highlight parity
- keyboard-safe save/cancel behavior

Sessions:

- log session (local-first in v2.1)
- history table/list
- sort + edit/delete parity
- keyboard navigation parity (ArrowUp/Down/Home/End) where applicable
- undo delete
- row highlight parity

Accessibility:

- focus restoration
- live regions where applicable
- keyboard parity maintained through freeze

---

## Testing Strategy

Focus on parity-critical logic:

- search engine semantics
- undo timing + restore integrity
- add/edit/delete/finish flows
- session sorting determinism
- empty vs no-results logic
- keyboard navigation
- autosuggest behavior
- highlight rendering
- build/type/test freeze validation

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
- Test baseline exists and is stable
- CI is green and gating PRs
- Freeze cleanup and release validation are complete
