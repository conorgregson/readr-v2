# Readr v2.1 Architecture (React Parity Rebuild)

## Goal

Rebuild the Readr frontend in **React + TypeScript (Vite)** while preserving **v1.9 behavior parity**.

v2.1 is:

- Local-first
- Frontend-only
- Architected so that a future **Express + Prisma + PostgreSQL API** can replace local persistence without UI rewrites

Behavioral accuracy > new features.

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

1. **Behavior parity first**: match v1.9 flows, semantics, and keyboard behavior.
2. **Feature-first structure**: keep files grouped by domain (books/sessions/settings).
3. **UI never touches storage**: all persistence/API access is behind a **service layer**.
4. **Explicit state boundaries**: global state for shared app data; local state for forms/UI.
5. **Reusable UI primitives**: consistent components + patterns for loading/empty/error.

---

## Routing + App Shell

**React Router** with a persistent layout.

Routes:

- `/` — Books page (list + filters + search + add/edit)
- `/sessions` — Session History
- `/settings` — Settings (page or panel)

Layout pattern:

- `AppShell` (header/nav) + `<Outlet />` for page content

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
      services/
      store/
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
      apiClient.ts (future placeholder)
    utils/
      formatting + validation helpers
```

Notes:

- Domain types live inside each feature
- No shared/types/ unless truly global types emerge
- Shared UI components remain primitive and reusable

## Domain Model (TypeScript as Source of Truth)

Core types (frontend canonical)

- `Book` (id, title, author, status, createdAt/updatedAt, etc.)
- `Session` (id, bookId, date, minutes/pages, notes, etc.)
- Enums/constants: `BookStatus`, sort modes, filter states

If backend shapes differ later, a **mapping layer** will adapt API responses into frontend domain models.

## State Management (Zustand)

### `booksStore`

State:

- `books[]`
- `filters`
- `searchQuery`
- Derived selector: `visibleBooks`

Actions:

- `loadBook`
- `addBook`
- `updateBook`
- `deleteBook`
- `setFilter`
- `setSearch`

### `sessionsStore`

State:

- `sessions[]`
- `sort`
- `activeEdits`

Actions:

- `logSession`
- `updateSession`
- `deleteSession`
- `setSort`

### `uiStore` (Global UI Only)

State:

- Toasts
- Global banners
- App-level modals
- Global loading flags

Guardrail:

Feature-specific modal/edit state should live inside that feature’s store or local component state.

Guideline:

- `Global store` for shared app data and cross-page state
- `Component local state` for form inputs and transient UI

---

## Service Layer (Local-First now, API-Ready later)

All IO is behind `services/`. Components call services via store actions or hooks.

v2.1 services:

- `BooksService`
  - `list()`, `create()`, `update()`, `remove()`
- `SessionsService`
  - `list()`, `log()`, `update()`, `remove()`

Implementation in v2.1:

- Local persistence (localStorage/IndexedDB) or in-memory adapter

Swap later:

- Replace service implementations with API calls to Express/Prisma without changing UI.

---

## UI Patterns

### Loading

- Sponner of minimal loading state
- Avoid blocking UI unnecessarily

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

- List view with filters + search
- Inline or modal edit
- Preserve v1.9 save/cancel semantics
- Keyboard parity:
  - Enter = confirm
  - Escape = cancel
  - Arrow navigation where applicable

Sessions:

- Log session (frontend-only in v2.1)
- History table/list
- Sort + edit/delete parity

Accessibility:

- Focus management
- ARIA where appropriate
- No regression from v1.9 behavior

---

## Testing Strategy

Focus on parity-critical logic:

- Store actions + selectors
- Filtering + looser search behavior
- Add/edit/delete flows
- Session logging + sorting
- Empty vs no-results logic

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

- React UI matches v1.9 behavior
- Persistence is abstracted behind services
- State boundaries are stable
- Loading / empty / error patterns are consistent
- Test baseline exists
- CI is green
