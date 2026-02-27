# Readr v2.1 — React Frontend Parity Roadmap

## Goals

- Rebuild the Readr frontend in **React + TypeScript** with **behavior parity to v1.9**
- Preserve local-first workflows while preparing for a future fullstack backend
- Establish a clean, testable, and scalable frontend foundation

---

## Parity Lock Progress Dashboard (as of 2026-02-26)

### Sprint Milestones

- [x] Sprint 0 — Prep & Guardrails
- [x] Sprint 1 — React Foundation
- [x] Sprint 2 — CRUD + Inline Editing Parity
- [x] Sprint 3 — Search + Filters Parity
- [ ] Sprint 4 — Books Parity Lock (Undo + highlight + autocomplete + remaining Tier 0)
- [ ] Sprint 5 — Sessions Parity
- [ ] Sprint 6 — Hardening & Accessibility
- [ ] Sprint 7 — Tests & CI Baseline

### Tier 0 — Must Match Exactly (Books/Search)

**Search**

- [x] Smart search semantics (AND)
- [x] Quoted phrases
- [x] Fuzzy matching fallback
- [x] Prefix bonus / ranking improvements
- [x] Filters apply before search
- [x] No-results vs empty behavior + “Try looser search”
- [ ] Highlight rendering parity
- [ ] Autocomplete suggestions parity
- [ ] Dedicated Search button parity (if applicable)

**Books**

- [x] Inline editing save/cancel (title/author/status)
- [x] Canonical status values ("planned" | "reading" | "finished")
- [ ] Undo (~6s) for delete/finish
- [ ] Undo does not break filters/sort/search ordering
- [ ] Undo persistence behavior matches v1.9

### Tier 0 — Must Match Exactly (Sessions)

- [ ] Sessions history list/table parity
- [ ] Keyboard navigation (Arrow/Home/End) parity
- [ ] Undo for deleted sessions parity

### Testing Lock-in (Matrix-driven)

- [x] Search logic unit tests (edge cases)
- [ ] Looser search component tests
- [ ] Highlight rendering component tests
- [ ] Autocomplete component tests

---

## v2.1.0 — React Foundation

**Planned**:

### App scaffolding & routing

- [ ] Initialize React + TypeScript app using Vite
  - _AC:_ App builds, runs, and hot reloads without errors
- [ ] Configure React Router with core routes (`/`, `/session`, `/settings`)
  - _AC:_ Navigation works and routes render correct page shells
- [ ] Implementation persistent AppShell (header/nav + outlet)
  - _AC:_ Layout remains stable across route changes

### Tailwind & design system primitives

- [ ] Configure Tailwind with base theme (spacing, typography, radius)
  - _AC:_ Global styles apply consistently across the app
- [ ] Create core UI primitives (Button, Input, Select, Card, Modal/Drawer, Toast)
  - _AC:_ Components are reusable, accessible, and styled consistently

### Global UI state patterns

- [ ] Implement LoadingState component
  - _AC:_ All pages can show a loading placeholder
- [ ] Implement EmptyState and NoResultsState components
  - _AC:_ Clear distinction between "no data" and "no search results"
- [ ] Implementation ErrorState pattern
  - _AC:_ Errors display actionable messages and recovery options

---

## v2.1.1 — Books Parity (Core Value)

**Planned**:

### Centralized state management

- [ ] Set up Zustand store for books
  - _AC:_ Store holds books, filters, search query, and derived visible list
- [ ] Define store actions (add/update/delete/filter/search)
  - _AC:_ State updates are predictable and type-safe

### Book list, filters, and search

- [ ] Build book list UI wired to store
  - _AC:_ Books render correctly and update reactively
- [ ] Implement filters and search with v1.9 semantics
  - _AC:_ Results match legacy behavior exactly
- [ ] Implement "looser search" fallback
  - _AC:_ No-results state offers looser search and restores results

### Add/edit book flows

- [ ] Build add book modal/drawer with validation
  - _AC:_ New books are created and reflected immediately
- [ ] Build edit book flow with save/cancel behavior
  - _AC:_ Editing mirrors v1.9 UX, including keyboard interactions

---

## v2.1.2 — Sessions Parity

**Planned**:

### Session logging

- [ ] Implement session logging UI (frontend-only)
  - _AC:_ Sessions can be logged and associated with books
- [ ] Wire session logging to sessions store
  - _AC:_ Logged sessions persist locally and update UI immediately

### Session history

- [ ] Build session history list/table
  - _AC:_ Sessions render in correct order with formatted timestamps
- [ ] Implement sort, edit, and delete actions
  - _AC:_ Session history interactions match v1.9 behavior

---

## v2.1.3 — State Hardening & UX Polish

**Planned**:

### Shared service layer

- [ ] Implement BooksService and SessionsService abstractions
  - _AC:_ UI does not access storage directly
- [ ] Confirm services can be swapped for API calls later
  - _AC:_ No UI changes required to change data source

### Accessibility & keyboard parity

- [ ] Verify Enter/Escape behavior across modals and forms
  - _AC:_ Keyboard flows match v1.9
- [ ] Validate ARIA roles and focus management
  - _AC:_ App is navigable via keyboard and screen reader-friendly

---

## v2.1.4 — Tests & CI Baseline

**Planned**:

### Frontend test coverage

- [ ] Write unit tests for books store logic
  - _AC:_ Filters, search, and CRUD actions are covered
- [ ] Write component tests for critical flows
  - _AC:_ Add/edit book, empty/no-results, and session flows are tested

### CI setup

- [ ] Configure GitHub Actions workflow
  - _AC:_ CI runs typecheck, lint, and tests on push/PR
- [ ] Ensure CI is fast and reliable
  - _AC:_ Pipeline completes consistently without flakiness

---

## v2.1 Completion Criteria

- React frontend achieves **full v1.9 behavior parity**
- Centralized state and services are stable
- UI patterns are consistent and accessible
- Baseline tests and CI are green
- App is ready to connect to the Express + Prisma backend in v2.2+
