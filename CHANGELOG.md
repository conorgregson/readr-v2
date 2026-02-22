# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.1-sprint-0] — Prep & Guardrails (2026-02-22)

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
