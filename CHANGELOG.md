# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.1-sprint-3] — Search & Filters Parity (2026-02-26)

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
