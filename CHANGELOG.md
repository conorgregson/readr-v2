# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.3.0-sprint-3] — Import/Export & Ownership Safety (2026-03-22)

### Added

- Backup export endpoint scoped to authenticated user
- Bulk import endpoint with validation and rollback support
- Backend integration tests for auth and backup flows
- Postman test collections for Auth, Backup, Books, and Sessions

### Changed

- Import logic now enforces strict ownership (userId override)
- Data ingestion pipeline validates relationships and structure

### Fixed

- Prevented cross-user data leakage during export
- Blocked invalid import payloads from persisting
- Ensured failed imports do not partially write to database

### Notes

- Establishes secure data boundaries for multi-user architecture
- Foundation for future account-based features in v2.3

--

## [v2.3.0-sprint-2] — Auth UX & Session Persistence (2026-03-20)

### Added

- Added auth bootstrap loading state in AppShell.
- Added client-side validation feedback for login and registration forms.
- Added separate loading states for login and registration actions.
- Added centralized unauthorized-response handling in the API client.

### Changed

- Improved auth error messaging for invalid credentials and duplicate email cases.
- Improved session restore flow using `/auth/me` on app load.
- Hardened token storage reads and writes against browser storage failures.
- Updated auth page behavior to disable inputs and prevent duplicate submissions during pending requests.

### Removed

- Removed implicit token clearing from the auth service layer in favor of store-controlled session handling.

### Notes

- Sprint 2 completes auth UX polish and session persistence hardening for v2.3.
- App bootstrap now resolves authentication state before rendering protected UI.
- Invalid token detection occurs during auth restore and authenticated API requests.
- Immediate logout after manual same-tab token mutation (e.g., DevTools) is not guaranteed and is out of scope for this sprint.
- Behavior aligns with standard client-side session validation patterns.

---

## [v2.3.0-sprint-1] — Auth & Ownership Foundation (2026-03-19)

### Added

- JWT-based authentication system with register, login, and session restore
- User model with email and passwordHash
- Auth middleware (`requireAuth`) for protecting API routes
- Per-user ownership via `userId` on Books and Sessions
- Auth endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Auth store with login, restoreAuth, and logout flows
- Login/register UI with app-level auth gating

### Changed

- All Books and Sessions endpoints now require authentication
- All queries scoped by authenticated `userId`
- Sessions creation validates ownership of associated Book
- API client attaches bearer token to all requests

### Removed

- Anonymous/global data access across Books and Sessions

### Notes

- Establishes identity and strict data isolation as core system invariants
- Consolidates Sprint 0–3 architecture into first v2.3 implementation milestone
- Forms the foundation for multi-user production deployment

---

## [v2.2.0] — API Persistence Migration (2026-03-19)

### Added

- API-backed persistence for Books and Sessions
- Unified request handling across client service layer
- Export backup system using live API data

### Changed

- Migrated from localStorage to Express + PostgreSQL persistence
- Standardized error handling and API response validation
- Updated Settings page messaging for backup system
- README updated to reflect API-backed architecture

### Removed

- Legacy localStorage persistence for Books and Sessions
- Obsolete storage adapters and dead persistence helpers
- Dual persistence pathways (client vs server)

### Fixed

- Inconsistent service layer behavior between Books and Sessions
- Edge cases in undo behavior under API persistence
- Stale assumptions tied to local-first architecture

### Notes

- Backup import is temporarily disabled and will return in v2.3
- v2.2 marks completion of the local-first → API migration

---

## [v2.2.0-sprint-4] — Sessions Persistence Migration (2026-03-17)

### Added

- Added API-backed Sessions restore support for undo delete via `POST /api/sessions/restore`.

### Changed

- Migrated Sessions persistence from localStorage to backend API storage.
- Updated the Sessions store to load, create, update, delete, and restore Sessions asynchronously through the API.
- Normalized Sessions API responses into the frontend’s date-only Session shape.
- Normalized Sessions update payloads before PATCH requests to keep request data consistent.

### Removed

- Removed the active localStorage-backed persistence path for Sessions records.

### Notes

- Deterministic Sessions sorting remained intact after load and mutation flows.
- Keyboard navigation, selection behavior, and undo parity were preserved after the persistence migration.

---

## [v2.2.0-sprint-3] — Sessions API Contract (2026-03-16)

### Added

- Full Sessions CRUD API (`GET`, `POST`, `PATCH`, `DELETE`)
- Zod validation schemas for sessions requests and responses
- Query filtering support (`bookId`, `search`, `from`, `to`)
- Pagination parameters (`limit`, `offset`)
- Deterministic sorting (`date DESC`, `createdAt DESC`, `id DESC`)
- Postman contract test suite for Sessions endpoints

### Changed

- Sessions responses now normalize empty `notes` values to `null`

### Notes

- Manual API contract verification completed via Postman test collection
- All Sessions CRUD, validation, filtering, and sorting scenarios validated

---

## [v2.2.0-sprint-2] — Books Persistence Migration (2026-03-10)

### Added

- Typed Books API client for backend persistence
- API-backed create/update/delete flows
- Environment-based API configuration via `VITE_API_BASE`

### Changed

- Migrated Books persistence from localStorage to API
- Zustand store updated for async persistence
- Delete undo flow now delays server commit until expiration

### Removed

- localStorage persistence for Books

---

## [v2.2-sprint-1] — Books API Contract (2026-03-10)

### Added

- Implemented Books CRUD endpoints for `GET`, `POST`, `PATCH`, and `DELETE`
- Added Books DTO mapper for stable frontend-facing response shapes
- Added Books service layer for Prisma-backed persistence
- Added status transition timestamp handling for `planned`, `reading`, and `finished`

### Changed

- Tightened Books Zod schemas for create, update, params, query, and response validation
- Standardized delete behavior to return `204 No Content`
- Synced Prisma schema and database contract for current Books fields

### Fixed

- Resolved local schema/database mismatch causing Prisma read failures
- Fixed timestamp update typo affecting status transition PATCH behavior
- Fixed Zod v4 startup issue in sessions schema by using `.safeExtend()`

### Notes

- Postman validation passed for valid CRUD flows, invalid payloads, missing resources, and timestamp contract behavior

---

## [v2.2-sprint-0] — Schema & Contract Audit (2026-03-08)

### Added

- Express backend architecture with modular routing
- PostgreSQL database configured via Prisma
- Prisma schema for Books and Sessions models
- relational link between books and reading sessions
- Zod request validation for all API routes
- response schema validation for API outputs
- HTTP helper utilities and AppError error system
- Prisma seed script for development data

### Changed

- project architecture updated to support full-stack development
- backend now replaces the local-only data model used in v1.9

### Notes

- establishes the core backend data layer for Readr v2
- prepares the project for React frontend API integration in Sprint 1

---

## [v2.1-sprint-10] — Freeze & Stabilization (2026-03-07)

### Added

- Restored Books **Mark Finished** action with ~6s undo parity.
- Added Books search result highlighting for title and author matches.
- Added Books autosuggest with keyboard navigation and suggestion commit behavior.
- Added final Sprint 10 manual freeze validation across Books and Sessions flows.

### Changed

- Updated Books toolbar behavior and tests to support autosuggest and committed search parity.
- Updated Book list rendering to support highlight-aware search query propagation.
- Improved Sessions keyboard navigation stability by keeping focus on the table container and using `aria-activedescendant`.
- Refined Sessions selection behavior so rapid navigation remains stable on large datasets.
- Updated parity docs, sprint docs, and freeze tracking to reflect v2.1 completion.

### Removed

- Removed legacy Books dev scaffold page.
- Removed legacy Books dev store.
- Removed `DevStateBar` dev helper and remaining Sprint scaffolding usage.
- Removed dev-only console logging from `BooksService`.
- Removed stale router references to deleted dev-only routes.

### Notes

- v2.1 React frontend parity is now formally frozen against the defined v1.9 scope.
- Build, typecheck, tests, and manual Tier 0 audit all passed at freeze.
- v2.2 will begin API integration on top of the now-stable React frontend foundation.

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
