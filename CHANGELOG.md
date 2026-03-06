# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.1-sprint-9] — Tests & CI Baseline (2026-03-06)

### Added

- Search engine unit tests (`search.engine.test.ts`)
- Books undo logic unit tests
- Sessions sorting unit tests
- Sessions keyboard navigation component tests
- Books list keyboard navigation component tests
- Books toolbar search behavior component tests
- Test setup utilities for Vitest + Testing Library

### Changed

- Added CI pipeline validating client code on push and pull request

### Fixed

- Stabilized BookList keyboard navigation test behavior with controlled component rerender

### Notes

Regression-proof validation executed during this sprint.

A temporary regression was introduced in `search.engine.ts` by modifying
fuzzy-match acceptance logic (`d <= maxDist` → `d < maxDist`).

Search engine tests failed as expected, confirming that CI guardrails
detect behavioral regressions.

The change was reverted and the test suite returned to green.

---

## [v2.1-sprint-8] — Hardening & Accessibility (2026-03-05)

### Added

- Settings data tools: JSON export/import for Books and Sessions.
- Defensive import validation with safe failure on malformed or empty payloads.

### Changed

- Strengthened focus management around dialogs and undo flows.
- Hardened persistence boundaries: UI remains IO-free; services own storage.

### Fixed

- Prevented invalid backup data from being written to local storage.
- Eliminated crash paths during data ingest and edge-case state transitions.

### Notes

- Verified large dataset responsiveness (typing, scrolling, filters) and persistence after refresh.

---

## [v2.1-sprint-7] — Sessions Tier 0 Lock (2026-03-02)

### Added

- Sessions keyboard navigation parity (ArrowUp/Down, Home, End, Escape).
- Undo delete (~6s) with full UI state restoration (filters, sort, selection).
- Live-region announcements for selection changes and undo actions.
- Search highlight rendering across Sessions rows (date, title, author, notes).
- Deterministic Sessions sorting with final `id` tie-breaker.

### Changed

- Sessions delete now supports undo with persistence via `upsert`.
- Sessions state guarantees deterministic ordering invariants.
- Selection model refactored to be store-driven and keyboard-safe.

### Removed

- None.

### Fixed

- Prevented ordering drift when sessions shared identical timestamps.
- Prevented selection inconsistencies after delete.
- Prevented DOM highlight corruption during multi-token searches.

### Notes

Sprint 7 locks Sessions into Tier 0 parity.

Undo follows Contract A: full restoration of prior UI state.
Sessions behavior is now frozen pending Hardening & A11y (Sprint 8).

---

## [v2.1-sprint-6] — Sessions Core (2026-03-02)

### Added

- Local-first Sessions persistence layer with normalization and sorting utilities.
- Versioned Sessions storage envelope (`{ v: 1, sessions: [...] }`).
- Automatic migration from legacy array storage format.
- Sessions History table with book title/author resolution.
- Inline session editing (book, date, pages, minutes, notes).
- Session deletion with confirmation prompt.
- Sessions toolbar with:
  - Search (title, author, notes, date)
  - Filters (book, type, date range)
  - Sort (newest / oldest)
  - “Showing X of Y” summary indicator
  - Quick filter chips (Pages / Minutes)
- UI persistence for Sessions filters and sort preferences.
- Date range auto-correction (prevents From > To invalid state).

### Changed

- `loadSessions` now hydrates from versioned storage with migration guard.
- Sessions state now supports filter and sort management at the store level.
- Sessions page now computes visible rows via memoized filter + sort pipeline.
- History table refactored to use dedicated `SessionsRow` component.

### Removed

- Legacy stub Sessions placeholder cards from initial scaffold.

### Fixed

- Prevented edit panel from closing on failed update.
- Ensured session re-sorts correctly after date edits.
- Ensured empty state triggers when final session is deleted.

### Notes

Sprint 6 completes Sessions Core parity foundation.
Undo architecture intentionally deferred per v2.1 guardrails.
Sessions storage is now schema-ready for future migrations.

---

## [v2.1-sprint-5] — Books Tier 0 Lock (2026-03-01)

### Added

- Snapshot-based Undo system for book deletion (~6s window).
- `replaceAll()` persistence method to enable atomic rollback and restore.
- Store-level undo slot with expiration handling.
- Red destructive variant styling for Delete button.
- Unit tests covering:
  - Undo timer behavior
  - Snapshot restoration integrity
  - Expiration guard
  - Rollback on delete failure
  - `replaceAll` persistence call

### Changed

- `deleteBook` action now snapshots full `books[]` before removal.
- Undo logic centralized in store (single-slot model).
- Books Tier 0 progress updated in Parity Charter.
- Parity Test Matrix updated to reflect Undo coverage.

### Removed

- N/A

### Fixed

- Ensured delete rollback restores exact ordering and timestamps.
- Prevented stale undo records after expiration.
- Cleared undo slot on failed delete persistence.

### Notes

Sprint 5 formally freezes Books/Search Tier 0 behavior.
Undo delete is now protected by unit tests and considered parity-locked.

---

## [v2.1.0-sprint-4] — Books CRUD & Timestamp Parity (2026-03-01)

### Added

- Local-first Books persistence via `BooksService` (localStorage adapter).
- Add Book flow with required `title` and `author` validation (v1.9 parity).
- Inline editing for `title`, `author`, and `status` with row-local draft state.
- Optimistic updates with rollback on failure.
- `startedAt` and `finishedAt` parity logic based on status transitions.
- Timestamp display polish for Started / Finished dates on book cards.
- Subtle per-row “✓ Saved” micro-feedback on successful updates.
- Accessibility polish:
  - `aria-live="polite"` status region for save confirmation.
  - `aria-invalid` for required field validation.
  - Ref-forwarding support in shared `Button` for focus management.

### Changed

- Enforced `author` as a required domain field across types, store, service, and tests.
- Improved store update flow with normalization and trimming of optional fields.
- Sanitized persisted records on load to prevent runtime crashes from malformed data.

### Removed

- N/A

### Fixed

- Resolved TypeScript type inconsistencies after enforcing required `author`.
- Prevented invalid persisted records from breaking app initialization.

### Notes

- Delete UI and Undo UX remain intentionally deferred until the dedicated Undo architecture phase.
- Achieves functional CRUD and timestamp parity with v1.9 core book behavior.

---

## [v2.1.0-sprint-3] — Search & Filters Parity (2026-02-26)

### Added

- Implemented `smartSearch` with:
  - AND semantics
  - Quoted phrase support
  - Fuzzy matching
  - Prefix bonus scoring
  - Search support for `series`, `genre`, `isbn`, `format`, and `formatSubtype`
- Filters now apply **before** search execution
- Added `BooksToolbar` component
- Added `BooksFiltersPanel` with multi-select status filtering
- Added `SearchStatus` with dynamic result counts:
  - `N results`
  - `N results (filtered from Y)`
- Added “Try looser search” and “Clear search” actions in `NoResults` state
- Added extensive Vitest coverage for search edge cases

### Changed

- Standardized `BookStatus` to canonical values:
  - `"planned" | "reading" | "finished"`
- Refactored dev page to align with multi-select status filter
- Improved search ranking behavior with prefix weighting and fuzzy fallback

### Fixed

- Resolved inconsistencies between legacy status strings and canonical enum values
- Corrected search behavior when filters reduce dataset before query execution

### Notes

- Achieves functional parity with v1.9 search + filter behavior.
- Establishes foundation for future UI polish and performance optimizations.

---

## [v2.1.0-sprint-2] — UI States & Store Skeleton (2026-02-24)

### Added

- Shared page UI state components: Loading, Empty, Error, and No Results.
- Store-driven UI state scaffolding for Books and Sessions (Zustand).
- `loadBooks()` and `loadSessions()` lifecycle stubs to establish future persistence/API boundaries.
- `DevStateBar` helper for manual state toggling during foundation work.

### Changed

- Refactored Books and Sessions pages to use centralized store-driven page state instead of local component state.
- Standardized state toggling UI across pages via `DevStateBar`.

### Removed

- N/A

### Fixed

- Corrected store typing and initial state shape for strict TypeScript compliance.
- Fixed Sessions store import path and minor copy issues.

### Notes

- This sprint establishes consistent UI state patterns and state management scaffolding only.
- Domain behavior parity work (search, filters, CRUD, persistence) remains deferred to later sprints.

---

## [v2.1.0-sprint-1] — React Foundation (2026-02-23)

### Added

- Initialized React + TypeScript frontend using Vite.
- Configured React Router with core routes (`/`, `/sessions`, `/settings`).
- Implemented persistent `AppShell` layout (header + navigation + outlet).
- Established Tailwind CSS base theme and global styling.
- Created shared UI primitives: `Button`, `Input`, `Card`, `Select`, `Spinner`.
- Added production build and preview workflow (`vite build`, `vite preview`).

### Changed

- Transitioned frontend from legacy structure to React-based SPA architecture.
- Aligned folder structure with v2.1 feature-driven direction.

### Removed

- Residual legacy frontend mounting patterns incompatible with React Router layout model.

### Fixed

- Ensured strict TypeScript compliance during production builds.
- Resolved unused import build failures under `tsc -b`.

### Notes

- This release establishes the React application foundation only.
- No domain logic (books, sessions, search, or persistence) is implemented yet.
- Sprint 2 introduces UI state patterns and centralized state scaffolding.

---

## [v2.1-sprint-0] — Prep & Guardrails (2026-02-21)

### Added

- v2.1 documentation foundation:
  - Architecture spec (`docs/architecture-v2.1.md`)
  - Time-boxed execution plan (`docs/execution-plan-v2.1.md`)
  - Sprint blueprints index + Sprint 1–7 implementation guides (`docs/sprints/*`)
- Parity guardrails to prevent regressions from v1.9:
  - Parity checklist (`docs/parity-checklist-v1.9.md`)
  - Parity must-haves checklist (v1.4–v1.9)
  - Parity test matrix (unit vs component vs manual QA)
- React frontend folder scaffolding under `client/src/`:
  - Feature-first structure for `features/books/` (service + store + types + page)
  - Shared UI primitives (`shared/ui/*`)
  - Shared API client wiring (`shared/services/apiClient.ts`)
- Project-level planning artifacts (`docs/`, `roadmap.md`)

### Changed

- Restructured/cleaned legacy frontend files to align with v2.1 architecture and sprint execution plan.
- Updated README/roadmap alignment to reflect v2.1 frontend rebuild and version narrative.

### Removed

- Removed unused legacy frontend files superseded by the v2.1 feature-first structure.

### Notes

- Sprint 0 is a planning and guardrails milestone — no user-facing feature parity work is included yet.
- Sprint tags are used as development checkpoints; SemVer releases will be published at stable milestones (e.g., v2.1.0).

---

## [v2.0.0] — Fullstack Foundation (2025-12-14)

### Added

- Express-based backend API with modular routing.
- Prisma ORM with PostgreSQL datasource and indexed schema.
- `/health` endpoint for readiness checks and CI smoke tests.
- Postman/Newman API test suite for automated endpoint validation.
- GitHub Actions CI workflows including:
  - PostgreSQL-backed integration tests
  - Health-check smoke tests
  - Build and type-check validation
- Graceful server shutdown handling (`SIGTERM`, `SIGINT`).
- Cross-platform port cleanup to prevent `EADDRINUSE` errors.

### Fixed

- Prevented port conflicts during CI and local test execution.
- Ensured clean server shutdown after automated API tests.

### Notes

- Initial stable release of Readr v2.
- Establishes the backend and CI foundation for future frontend development.
- No React frontend v2 features are included in this release.

---

## [v2.0.0-rc.1] — Backend & CI Foundation Pre-release (2025-12-12)

### Added

- Initial Express API scaffolding.
- Prisma + PostgreSQL data layer.
- CI workflows for API testing and health checks.

### Notes

- Release candidate for v2.0.0.
- Feature-complete backend baseline pending CI validation.
