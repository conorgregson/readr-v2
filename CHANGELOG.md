# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v3.0.0-sprint-4] — CI/CD & Release Confidence (2026-04-09)

### Added

- Expanded GitHub Actions coverage to include server validation alongside client checks
- Added Prisma generation to CI for clean-runner compatibility
- Added built-artifact startup validation against a Postgres test service
- Added API smoke validation in CI using the Postman/Newman contract suite

### Changed

- Updated CI sequencing so API smoke runs after successful server startup validation
- Separated static server validation from DB-backed validation for clearer CI failure isolation
- Updated Postman contract tests to use authenticated `/api/*` routes
- Updated Postman auth/bootstrap variables and protected request coverage to match current backend requirements
- Corrected session notes-only update contract expectations to reflect current API behavior

### Notes

- Sprint 4 shifts Readr v3.0 from basic client-only CI toward fuller deploy-readiness validation
- Hosted deployment verification remains a separate post-deploy step
- Hosted verification completed and passed after merge to `main` and platform deployment

---

## [v3.0.0-sprint-3] — Reliability, Health Checks & Runtime Visibility (2026-04-08)

### Added

- Added startup readiness logging for boot, database connection, and API-ready states.
- Added optional runtime context to `AppError` for clearer operational diagnostics.
- Added request-aware warning and error logging in the centralized HTTP error handler.
- Added contextual logging for auth rate-limit events.
- Added auth failure context for missing and malformed authorization headers.

### Changed

- Updated `/health` to return a more meaningful deployment-safe response with service, environment, and timestamp fields.
- Simplified CORS origin handling while preserving deployment-safe rejection behavior.
- Improved shutdown and fatal-process logging for clearer runtime visibility.
- Improved environment validation logs so invalid config fails fast with clearer startup output.

### Notes

- Sprint 3 focused on operational confidence rather than feature work.
- Verification passed for build, tests, health checks, request hardening, auth failures, rate limiting, startup validation, and hosted health verification.

---

## [v3.0-sprint-2] — Docker & Local Environment Standardization (2026-04-08)

### Added

- Added a backend Dockerfile for local containerized development.
- Added a root `.dockerignore` to reduce noisy Docker build context.
- Added a `docker-compose.yml` workflow for local Postgres + backend orchestration.
- Added documented Docker startup, rebuild, shutdown, and reset commands to the README.

### Changed

- Standardized local backend development around a verified Docker-based workflow.
- Aligned container startup with the repo’s actual TypeScript, shared config, and Prisma requirements.
- Clarified local vs hosted environment responsibilities in project documentation.

### Notes

- Verified local Docker workflow now starts Postgres and the backend successfully.
- Confirmed Prisma client generation works inside the backend container.
- Confirmed the backend health route responds successfully in the Dockerized local setup.
- Frontend containerization remains optional and out of scope for this sprint.

---

## [v3.0.0-sprint-1] — Deployment Audit & Environment Hardening (2026-04-07)

### Added

- Added root, client, server, and server test `.env.example` templates.
- Added clearer deployment and environment documentation for the Vercel, Render, and Neon stack.

### Changed

- Standardized local client API configuration to use `VITE_API_BASE_URL`.
- Clarified that frontend API base values must use the backend origin only and must not include `/api`.
- Centralized validation for auth rate-limit environment variables in backend env parsing.
- Updated rate-limit middleware to consume validated environment config.
- Expanded README deployment notes to distinguish root Prisma tooling, backend runtime config, Vercel responsibilities, and Render responsibilities.

### Removed

- Removed outdated reliance on older client environment naming such as `VITE_API_BASE`.

### Notes

- Sprint 1 establishes the deployment/configuration baseline for v3.0.
- Hosted verification will complete after merge to `main`, since production deployment is tied to the main branch.

---

## [v2.4.0] — Engagement & Insights Expansion (2026-04-06)

### Added

- Added multi-book bulk edit workflows with grouped mutation handling.
- Added persistent saved library views with user-scoped filters, sorts, and active-view controls.
- Added protected stats summary and trend endpoints for server-derived dashboard insights.
- Added dashboard summary cards and chart-based reading trend visualization.
- Added server-derived engagement surfaces for reading goals, streaks, and badge progression.
- Added grouped Undo support for bulk delete and bulk status update flows.
- Added regression coverage across bulk actions, saved views, dashboard recovery, and engagement behavior.

### Changed

- Changed v2.4 implementation to preserve server-owned derived-state boundaries for stats, goals, streaks, and badges.
- Changed Books workflow to support multi-select operations, grouped Undo behavior, and stronger bulk-action hardening.
- Changed saved-view UX to prefer explicit active-view management over misleading overwrite behavior.
- Changed BooksPage and StatsPage recovery flows from dismiss-only behavior to Retry + Dismiss actions.
- Changed the authenticated app shell label to reflect v2.4 feature work.

### Removed

- Removed unsafe local-only bulk status Undo behavior.
- Removed the need for client-side engagement evaluation as a source of truth.
- Removed the `Update View` action from active saved view controls.

### Fixed

- Fixed bulk mutation recovery so grouped status changes can restore mixed prior states safely.
- Fixed weak page-level recovery behavior where clearing errors did not retry failed loads.
- Fixed saved-view toolbar and selection test assumptions after sort and active-view workflows were introduced.
- Fixed stats trend and aggregation issues affecting session counts, books finished, and sparse dashboard rendering.

### Notes

- v2.4 completes the engagement and insights expansion milestone on top of the stable authenticated, API-backed architecture introduced in v2.0–v2.3.
- This release adds advanced UX and motivation systems without introducing a new architectural migration.
- Correctness-sensitive derived data remains server-owned to preserve consistency across dashboard and engagement surfaces.

---

## [v2.4.0-sprint-5] — Hardening, Accessibility & Release Lock (2026-04-06)

### Added

- Added real grouped Undo support for bulk status updates with mixed-status restore handling.
- Added Retry actions to Books and Stats error states.
- Added accessibility improvements for books search/list navigation, inline validation messaging, dashboard chart narration, and engagement progress surfaces.
- Added page-level regression tests for grouped bulk update Undo behavior.
- Added regression coverage for Retry-based recovery on Books and Stats pages.
- Added toolbar regression coverage for pending bulk-action disabled states.

### Changed

- Changed bulk status Undo from deferred/unsafe behavior to a server-backed grouped restore flow.
- Changed BooksPage error recovery from dismiss-only to Retry + Dismiss actions.
- Changed StatsPage error recovery from dismiss-only to Retry + Dismiss actions.
- Changed books search and results semantics to improve combobox/listbox accessibility.
- Changed Sprint 5 focus from feature expansion to release-lock hardening, accessibility, recovery, and regression safety.

### Removed

- Removed the remaining gap where bulk status updates had no real grouped Undo path.
- Removed dismiss-only recovery behavior as the only response to failed Books and Stats loads.

### Fixed

- Fixed grouped bulk status changes so original mixed statuses can be restored safely.
- Fixed weak recovery flows where clearing page errors did not retry failed loads.
- Fixed accessibility gaps in search suggestions, active result semantics, inline validation announcements, and chart/progress narration.
- Fixed Sprint 5 regression gaps around grouped mutation recovery and dashboard reload behavior.

### Notes

- Sprint 5 completes the v2.4 hardening phase and prepares the milestone for release.
- This sprint focuses on correctness, accessibility, recovery, and regression confidence rather than introducing major new surfaces.

---

## [v2.4.0-sprint-4] — Goals, Streaks & Badges (2026-04-06)

### Added

- Added server-derived reading goals for books and pages progress.
- Added server-derived streak tracking with current and longest streak summaries.
- Added badge progression for books, pages, streaks, and session milestones.
- Added the read-only `/api/engagement` API surface for engagement snapshot data.
- Added engagement UI to the dashboard for goals, streaks, and badges.
- Added server and client tests covering engagement logic, integration, and reset behavior.

### Changed

- Built Sprint 4 on top of the existing stats foundation rather than introducing duplicate aggregate logic.
- Updated streak badge behavior to reflect longest streak progress.
- Kept engagement evaluation server-owned so the UI remains presentation-focused.
- Updated the authenticated app shell label to reflect v2.4 feature work.

### Removed

- Removed the need for client-side goal, streak, or badge evaluation as a source of truth.

### Notes

- Sprint 4 adds the motivation layer for v2.4 while preserving the established authenticated API-backed architecture.
- Goals, streaks, and badges remain read-only in this release phase.

---

## [v2.4.0-sprint-3] — Stats & Dashboard (2026-04-02)

### Added

- Added protected stats summary endpoint for server-derived dashboard totals
- Added protected stats trend endpoint for pages, sessions, and books finished metrics
- Added dashboard summary cards to the client Stats page
- Added Stats feature service, store, and route wiring
- Added primary navigation access to the Stats page
- Added SVG bar chart visualization for recent trend data

### Changed

- Changed current-period summary logic to reflect this month so far
- Changed trend aggregation to use explicit metric-specific query paths
- Changed chart rendering from minimal inline bars to a clearer dashboard-style bar chart
- Changed chart polish to hide zero bars and improve axis spacing

### Fixed

- Fixed stats trend query handling in the controller validation path
- Fixed session trend aggregation so daily session counts render correctly
- Fixed books finished trend anchoring so recent completion activity appears correctly
- Fixed dashboard trend rendering for sparse datasets

### Notes

- Sprint 3 introduces read-only analytics surfaces without adding mutation complexity
- Server-owned aggregation boundaries remain preserved for dashboard correctness

---

## [v2.4.0-sprint-2] — Saved Views & Library Controls (2026-03-29)

### Added

- Added persistent user-scoped saved library views.
- Added library sort state and sort controls to the Books toolbar.
- Added inline save-view composer with optional default and pinned flags.
- Added active saved view management actions for rename, pin/unpin, set/unset default, and delete.
- Added lightweight animated feedback cues for saved view actions.
- Added bootstrap loading for saved views after books load.
- Added backend saved-view schema, service, mapper, controller, routes, and Prisma model.

### Changed

- Changed Books toolbar layout so the Books title stays above saved-view controls on all screen sizes.
- Changed current-view behavior so manual filter/search/sort changes clear the active saved view when state no longer matches.
- Changed saved-view UX to prefer explicit metadata management over misleading in-place overwrite behavior.

### Removed

- Removed the `Update View` action from active saved view controls.

### Fixed

- Fixed visible-book selection test assumptions after sort was introduced.
- Fixed saved-view toolbar tests to match the new inline save and active-view management flows.

### Notes

- Overwrite/update-view content behavior is deferred to a future hardening sprint so `Current view` semantics remain accurate.

---

## [v2.4.0-sprint-1] — Bulk Edit Foundation (2026-03-28)

### Added

- Added shared bulk mutation DTOs for v2.4 contracts.
- Added backend bulk books validation schemas.
- Added atomic bulk books endpoints for batch status updates and batch delete.
- Added client bulk update and bulk delete service methods.
- Added multi-select state and batch actions to the books store.
- Added batch action toolbar controls for selected books.
- Added selected row styling and checkbox feedback in the books list.
- Added real grouped undo for bulk delete using delayed commit.

### Changed

- Changed grouped bulk delete flow to commit after the undo window instead of immediately.
- Changed cross-app bulk types to use the shared repo-level contract location.
- Changed bulk mutation handling to normalize duplicate ids consistently.
- Changed Sprint 1 undo scope to support grouped delete undo only.

### Removed

- Removed unsafe local-only bulk status undo behavior.

### Notes

- Bulk status undo was intentionally deferred to Sprint 5 hardening because a local-only restore model caused client/server state drift.
- Sprint 1 ships safe bulk edit foundations with real grouped delete undo and no partial mutation states.

---

## [v2.4-sprint-0] — Contracts & Derived-State Design (2026-03-26)

### Added

- Added Sprint 0 docs for v2.4 contracts, architecture, and dependency planning
- Added shared client type definitions for bulk edit, saved views, stats, and engagement features
- Added backend type/schema scaffolding for bulk book mutation contracts
- Added backend type/schema scaffolding for saved library view contracts
- Added backend type/schema scaffolding for dashboard/statistics read models
- Added backend type/schema scaffolding for goals, streaks, and badge read models

### Changed

- Updated v2.4 roadmap framing to reflect the broader engagement and insights expansion phase
- Formalized server-owned derived-state boundaries for engagement and analytics features

### Removed

- None

### Fixed

- Reduced future contract drift by defining initial request/response shapes before implementation
- Prevented early feature coupling by keeping Sprint 0 limited to docs, schemas, and type-safe contracts

### Notes

- Sprint 0 is a planning and contract checkpoint, not a user-facing feature release
- Runtime implementation for bulk edit and related v2.4 surfaces begins in Sprint 1

---

## [v2.3.0] — Identity & Data Ownership (2026-03-25)

### Added

- Added JWT-based authentication with register, login, and `me` endpoints
- Added secure password hashing and credential validation
- Added auth middleware for protected routes
- Added token-aware frontend auth store and auth page
- Added auth restore flow and logout handling
- Added strict per-user ownership enforcement for books and sessions
- Added ownership-safe backup export/import behavior
- Added duplicate ID rejection and orphan relationship validation for backup import
- Added backend integration coverage for auth, ownership, backup, strict validation, and HTTP hardening
- Added frontend auth store and auth page tests
- Added basic rate limiting for auth write endpoints

### Changed

- Updated protected API flows to operate within an authenticated user context
- Updated README to document authentication flow, auth API summary, testing coverage, project structure, and local setup
- Updated roadmap language to reflect v2.3 completion

### Removed

- Removed stale or unused placeholder files from the server structure

### Fixed

- Fixed cross-user data access risks across books, sessions, and backup flows
- Fixed unsafe import behavior by enforcing ownership and rollback guarantees
- Fixed inconsistent auth failure handling for malformed or invalid token cases
- Fixed release documentation inconsistencies around v2.3 status and local setup

### Notes

- v2.3 completes the transition from single-user architecture to user-owned data architecture
- Auth rate limiting is intentionally lightweight and scoped to register/login only

---

## [v2.3-sprint-5] — Tests, Docs & Release Lock (2026-03-25)

### Added

- Added backend integration coverage for auth success/failure paths
- Added backend ownership enforcement tests for books and sessions
- Added frontend auth store tests for login, register, restore, and logout behavior
- Added frontend auth page tests for mode switching, validation, loading states, and error rendering
- Added basic rate limiting for auth write endpoints with structured `429` responses

### Changed

- Updated README to document authentication flow, auth API summary, testing coverage, project structure, and local development setup
- Updated roadmap language to reflect v2.3 completion
- Updated installation guidance to remove inaccurate Docker-based local setup references

### Removed

- Removed stale and empty placeholder files from the server structure

### Fixed

- Fixed missing release-lock coverage for authenticated ownership flows
- Fixed documentation inconsistencies around v2.3 status and local database setup
- Fixed auth page submit validation so invalid credentials are blocked client-side before submit

### Notes

- Sprint 5 closes the release-lock phase for v2.3
- This sprint focused on reliability validation, documentation alignment, and final hardening rather than new product surface area

---

## [v2.3.0-sprint-4] — Security & Hardening (2026-03-23)

### Added

- Centralized environment validation for backend runtime configuration
- JSON 404 handler and malformed JSON request handling
- Request body size limit for API hardening
- Integration tests for auth hardening, HTTP boundary behavior, strict schema enforcement, and backup import validation

### Changed

- Hardened CORS to use environment-based allowed origins
- Refactored auth middleware to use the shared error pipeline
- JWT signing now uses configured expiry from environment variables
- Request schemas now reject unknown fields across auth, books, sessions, and backup import endpoints
- Backup import validation now rejects duplicate session ids and supports round-trip export/import compatibility

### Fixed

- Prevented backup import requests from being sent with non-JSON object bodies in the client API layer
- Fixed backup import schema mismatch so exported backups containing nullable enum fields can be re-imported successfully
- Limited public error detail exposure to safe validation failures only
- Fixed session schema extension issue by using `safeExtend()` with refined Zod objects
- Corrected session notes normalization behavior for empty-string inputs

### Notes

- Sprint 4 completes the main boundary-hardening pass for v2.3
- Authentication, validation, CORS, and backup import/export flows now fail more safely and consistently
- Rate limiting was intentionally left out of core scope to keep the sprint focused on must-have security and API hardening

---

## [v2.3.0] — Identity & Data Ownership (In Progress)

### Changed

- Added “Deployment & Environment” section to README documenting Vercel + Render setup, required environment variables, and production debugging insights

### Fixed

- Resolved production environment variable mismatch (`VITE_API_BASE_URL`) causing frontend to fail API requests
- Fixed missing `JWT_SECRET` in backend deployment, restoring authentication flow in production

### Notes

- Full-stack demo now fully operational on Vercel (frontend) and Render (backend)
- Highlights importance of environment parity between local and production

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
