# Readr v1.9 → v2.1 Parity Lock Specification

**Behavior + Logic Regression Guardrails**

This document defines **what must not regress** when rebuilding Readr in React (v2.x).
It includes both:

- **User-facing parity** (flows, UX, keyboard, edge cases)
- **Internal parity** (store/service invariants, persistence, analytics correctness)

Use this as:

- Sprint acceptance criteria
- PR review checklist
- Test plan for Vitest + React Testing Library
- Manual QA checklist before releases

---

## Scope + Execution Rules

- **Sprint cadence:** 1 week
- **Goal:** visible progress every sprint
- **Rule:** **no new features** until parity milestones are hit
- If parity is unclear → verify against v1.9 behavior first
- No UI redesign unless parity forces it
- Refactor only if it reduces future React → API friction

---

## Parity Tier Definitions

### Tier 0 — Must Match Exactly

Any difference will be considered a regression.

### Tier 1 — Must Feel Identical

Implementation can differ, but user experience must be indistinguishable.

### Tier 2 — Internal Invariants

Rules that must always hold true in state/persistence/service layers.

---

# Tier 0: Critical Parity Requirements

## 1) Search System Parity (v1.4 + v1.6 + v1.8)

Search is a top regression risk. v2 must preserve the same results and “feel”.

### Core behavior

- [ ] Search supports **fuzzy/typo tolerance** (e.g., `"Hobbot"` → `"Hobbit"`).
- [ ] Search supports **partial token matching** (e.g., `"har pot"` → `"Harry Potter"`).
- [ ] Search semantics are the same for:
  - [ ] case-insensitivity
  - [ ] trimming whitespace
  - [ ] token splitting rules
  - [ ] matching fields (title/author/etc.) exactly as v1.9
- [ ] Search + filters combination semantics match v1.9.

### Dedicated Search button + instant search

- [ ] Instant search behavior matches v1.9.
- [ ] Search button triggers search the same way as v1.9 (if both exist).

### Autocomplete suggestions

- [ ] Suggestions appear from the same metadata sources (title/author/series/genre as applicable).
- [ ] Selecting a suggestion behaves like v1.9.

### Highlighting

- [ ] Matching tokens are highlighted in UI where v1.9 highlighted them.
- [ ] Highlighting persists through filters and state changes.

---

## 2) “No Results” vs “Empty” Parity + Looser Search CTA

- [ ] **Empty state** appears only when no books exist.
- [ ] **No results** appears only when books exist but none match search/filters.
- [ ] “Try looser search” CTA appears under the same conditions as v1.9.
- [ ] Clicking looser search produces the same expansion rules as v1.9.
- [ ] Exiting looser search returns to normal behavior predictably.

---

## 3) Inline Editing + Undo Parity (v1.4)

High-risk in React due to rerenders and state sync.

### Inline editing

- [ ] Inline edit shows the same fields and defaults as v1.9.
- [ ] Save commits changes; Cancel discards changes.
- [ ] Edits never “leak” into non-edit UI unless saved.
- [ ] Edit does not break sort/filter/search behavior.

### Undo (~6s window)

- [ ] Undo restores deleted/finished items within ~6 seconds.
- [ ] Undo restores the same object state (including metadata fields).
- [ ] Undo does not corrupt ordering or derived UI.
- [ ] Undo does not break persistence (refresh after undo matches expected behavior).

---

## 4) Sessions History + Keyboard Navigation Parity (v1.4 + v1.8 + v1.9)

Sessions is the second-highest regression area.

- [ ] Sessions link to the correct book.
- [ ] Session table/list shows the same fields as v1.9.
- [ ] Sorting behavior matches v1.9 and is deterministic.
- [ ] Inline edit/save/cancel/delete behavior matches v1.9.
- [ ] Row navigation parity:
  - [ ] ArrowUp/ArrowDown moves selection
  - [ ] Home/End jumps
  - [ ] Live-region (or equivalent) announces selection changes (if v1.9 did)
- [ ] Notes truncation + tooltip behavior matches v1.9.
- [ ] Search highlighting in titles/notes matches v1.9.

---

## 5) Analytics / Stats Layer Parity (v1.9)

(If v2.1 scope includes these views, they must not regress.)

- [ ] Charts update automatically when sessions change.
- [ ] Trend ranges work (weekly/monthly/yearly).
- [ ] Percent change math matches v1.9.
- [ ] Chart themes (light/dark/mono) persist and respect settings.
- [ ] Badge unlock logic matches v1.9 rules (if included).
- [ ] Alt-text summaries exist for charts/badges (a11y parity).

---

## 6) Keyboard Shortcuts Parity (v1.9)

- [ ] Shortcut (e.g., `N`) opens New Session (if enabled).
- [ ] Shortcut toggle in Settings persists.
- [ ] No new shortcut conflicts introduced.

---

# Tier 1: Behavioral Parity Requirements

## Import/Export + Schema Versioning

- [ ] Export JSON shape matches v1.9.
- [ ] Import validates structure and rejects malformed backups with clear errors.
- [ ] Safe merge + dedupe rules match v1.9.
- [ ] Import does not silently lose data.

## Settings Menu + Update Flow (PWA behaviors, if included)

- [ ] Settings menu opens/closes like v1.9 (click outside/Esc).
- [ ] “Check updates” behavior matches v1.9 service worker flow (if present).
- [ ] Reset preferences clears filters/sort and re-renders immediately.

## Performance feel

- [ ] Search, filter, list render remain responsive on large libraries.
- [ ] Avoid UI flicker or spinner flashing.

---

# Tier 2: Internal Invariants (Must Always Hold True)

## Books invariants

- [ ] Every book has a unique, stable `id`.
- [ ] `createdAt` is immutable; `updatedAt` changes only on updates (if v1.9 did).
- [ ] Status transitions match v1.9 rules.
- [ ] Optional fields (ISBN, series, physical/digital, genre, etc.) persist correctly.
- [ ] Bulk edits preserve referential integrity.

## Sessions invariants

- [ ] Every session has a unique, stable `id`.
- [ ] `bookId` references a valid book OR is handled exactly like v1.9 if missing.
- [ ] Negative/invalid values are rejected consistently.
- [ ] Sorting is deterministic and stable.
- [ ] Derived stats update immediately after session mutation.

## Store/service contract

- [ ] Components do not write to persistence directly.
- [ ] Stores are the only write path for domain data.
- [ ] Services are the only persistence touchpoint.
- [ ] Store actions are atomic:
  - [ ] apply full update OR rollback on failure
  - [ ] no “half-applied” state

## Persistence & recovery

- [ ] Data survives refresh.
- [ ] Storage keys are stable and documented.
- [ ] Corrupt/missing storage does not crash the app:
  - [ ] defaults safely applied
  - [ ] optional user-facing warning if data cannot be parsed

---

# High-Risk Regression Zones (Targeted Tests Required)

- [ ] Fuzzy search scoring / matching algorithm
- [ ] Token splitting rules (search + highlight)
- [ ] Looser search toggle semantics
- [ ] Undo timing window + rollback correctness
- [ ] Session table keyboard navigation + live updates
- [ ] Sort stability (books + sessions)
- [ ] Import dedupe/merge correctness
- [ ] Analytics percent-change math (if included)
- [ ] Performance for 1,000+ books / 2,000+ sessions

---

# Release Gate (Parity Lock)

Before calling a parity milestone “done”, all must pass:

## Manual run-through

- [ ] Add multiple books with different statuses
- [ ] Fuzzy search with typo + partial tokens
- [ ] Trigger and exit looser search
- [ ] Inline edit + cancel
- [ ] Delete + Undo within ~6s
- [ ] Log multiple sessions across multiple days
- [ ] Navigate session history using keyboard only
- [ ] Edit/delete sessions; confirm derived UI updates
- [ ] Export backup → import same backup → confirm match

## CI baseline (when enabled)

- [ ] Store selector tests (filters/search/looser search)
- [ ] CRUD flow tests (add/edit/delete)
- [ ] Import/export validation test
- [ ] Sessions history interaction test
- [ ] At least one “intentional break” test proves regressions get caught

---

# v2.1 Time-Boxed Execution Plan (1-Week Sprints)

Sprint length: **1 week**
Cadence goal: **visible progress every sprint**
Rule: **no new features until parity milestones are hit**

## Sprint 0 — Prep & Guardrails (½–1 week)

**Objective:** remove friction before real work starts.

### Scope

- Repo cleanup / create `client/` workspace
- Decide naming conventions (folders, components, stores)
- Add `docs/architecture-v2.1.md` + roadmap

### Deliverable

- Repo structure documented; no blockers for Sprint 1

### Exit criteria

- Vite app can be created cleanly
- Decisions documented
- No blockers for Sprint 1

---

## Sprint 1 — React Foundation

**Objective:** app boots, routes, and looks like Readr (structurally).

### Scope

- Vite + React + TS setup
- React Router (`/`, `/sessions`, `/settings`)
- AppShell (header/nav + outlet)
- Tailwind config + base theme
- Core UI primitives (Button, Input, Card minimum)

### Deliverable

- Navigable app with page shells
- Consistent layout across routes

### Exit criteria

- No console errors
- Hot reload stable
- Layout does not reset between routes

---

## Sprint 2 — UI Patterns & State Skeleton

**Objective:** define how the app behaves before adding data.

### Scope

- LoadingState, EmptyState, NoResultsState, ErrorState
- Toast or inline error pattern
- Zustand setup
- Empty `books.store.ts` scaffold + selectors

### Deliverable

- Reusable UI states wired into pages
- Store structure ready for real data

### Exit criteria

- Pages can toggle loading/empty/error states manually
- Store compiles with strong typing

---

## Sprint 3 — Books List + Search Parity

**Objective:** core Readr loop working in React.

### Scope

- BooksService (local-first)
- Book list UI wired to store
- Filters + search
- No-results + looser search behavior
- Keyboard interactions (as applicable)

### Deliverable

- Books page behaves like v1.9 (read-only initially)

### Exit criteria

- Search semantics match legacy
- Filters update list predictably
- No-results state behaves correctly

---

## Sprint 4 — Add/Edit Book Flows

**Objective:** achieve Books parity complete.

### Scope

- Add book modal/drawer
- Edit book flow (save/cancel)
- Validation + error handling
- Keyboard parity (Enter/Escape)

### Deliverable

- Fully functional Books feature

### Exit criteria

- CRUD flows mirror v1.9 UX
- No regression in list/search/filter behavior
- First **demo-ready** milestone

---

## Sprint 5 — Sessions Logging + History

**Objective:** secondary feature parity.

### Scope

- SessionsService (local-first)
- Log session UI
- Session history list/table
- Sort, edit, delete flows

### Deliverable

- Sessions feature complete (frontend-only)

### Exit criteria

- Sessions link correctly to books
- History behavior matches v1.9
- UI patterns reused (no one-off hacks)

---

## Sprint 6 — Hardening & Accessibility

**Objective:** make it production-safe before tests.

### Scope

- Accessibility pass (ARIA, focus management)
- Keyboard flow verification
- State edge cases (empty → data → empty)
- Service layer sanity check (API swap readiness)

### Deliverable

- Polished, stable React frontend

### Exit criteria

- No obvious UX/a11y regressions
- Clear path to backend integration

---

## Sprint 7 — Tests + CI

**Objective:** lock confidence.

### Scope

- Vitest setup
- Store unit tests (books + sessions)
- Component tests for critical flows
- GitHub Actions CI (typecheck/lint/test)

### Deliverable

- Green CI badge + baseline coverage

### Exit criteria

- CI runs on every push/PR
- Tests catch at least one intentional break

---

## Timeline Summary

| Sprint | Focus             | Outcome            |
| -----: | ----------------- | ------------------ |
|      0 | Prep              | Clean runway       |
|      1 | Foundation        | React app alive    |
|      2 | Patterns + State  | Behavior framework |
|      3 | Books list/search | Core loop          |
|      4 | Books CRUD        | Demo-ready         |
|      5 | Sessions          | Feature parity     |
|      6 | Hardening         | Stability          |
|      7 | Tests + CI        | Confidence         |

Total: **~7–8 weeks** (can compress if full-time)
