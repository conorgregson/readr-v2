# Readr v2 — Full-Stack Reading Tracker

### _Turn pages into progress._

A versioned full-stack reading tracker built to demonstrate modern frontend architecture, behavioral parity testing, and CI-gated development.

<p align="center">

<a href="https://readr-v2-app.vercel.app">
  <img src="https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-000000?style=for-the-badge&logo=vercel" />
</a>

<a href="https://github.com/conorgregson/readr-v2/releases/tag/v2.2.0">
  <img src="https://img.shields.io/badge/Version-v2.2.0-4CAF50?style=for-the-badge" />
</a>

<img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-008080?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Backend-Express%20%2B%20Node-003366?style=for-the-badge&logo=node.js" />
<img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/ORM-Prisma-0C344B?style=for-the-badge&logo=prisma" />

<br/>

<a href="https://github.com/conorgregson/readr-v2/actions/workflows/ci.yml">
  <img src="https://img.shields.io/github/actions/workflow/status/conorgregson/readr-v2/ci.yml?style=for-the-badge&label=CI&logo=github" />
</a>

<img src="https://img.shields.io/badge/Tests-Full--Stack%20Validated-6A1B9A?style=for-the-badge" />

<img src="https://img.shields.io/badge/Status-v2.3%20Sprint%203%20Complete-FF9800?style=for-the-badge" />
<img src="https://img.shields.io/badge/Commits-Signed%20(Verified)-00C853?style=for-the-badge&logo=github" />

</p>

---

## Live Demo

Try the deployed full-stack app here:

**▶** https://readr-v2-app.vercel.app

The demo is now connected to the **Express + PostgreSQL backend**, with all reading data persisted via the API.

### Notes

- Data is **fully server-backed (v2.2+)**
- Changes persist across sessions and devices
- **Authentication + user-scoped data (v2.3 in progress)**
- **Backup export/import now implemented with ownership enforcement**

> v2.3 introduces secure multi-user data boundaries and safe bulk import.

---

## Overview

**Readr v2** is a full-stack reading tracker designed to demonstrate modern frontend architecture, API-driven persistence, and disciplined system evolution.

It is a structured rewrite of the original offline-first app (**v1.0–v1.9**), transitioning to a scalable, multi-user system.

Key goals:

- Build a **React + TypeScript frontend** with strict behavioral parity guarantees
- Introduce a **typed Express + PostgreSQL backend**
- Enforce **clear separation between UI, state, and persistence**
- Validate correctness through **CI and full-stack testing**

Each version isolates a specific risk area (parity, persistence, ownership) before introducing new complexity.

The original v1.x app remains available here:
**▶** https://github.com/conorgregson/reading-log-app

> Current focus: **v2.3 — Authentication & data ownership**

---

## Key Engineering Concepts

Readr v2 was designed to demonstrate several real-world frontend engineering patterns:

- **Behavioral Parity Testing**
  The React frontend rebuild enforces v1.9 behavioral parity using automated tests to prevent regressions during architectural migration.

- **Deterministic UI State**
  Session history sorting is guaranteed deterministic so identical datasets always produce identical ordering.

- **Undo Architecture**
  Critical actions (delete / finish) support ~6s undo windows while preserving filters, search state, and list ordering.

- **Local-First → API Migration Strategy**
  Readr evolved through a staged migration to reduce system-wide risk:
  - v1.x: fully offline-first (localStorage)
  - v2.1: React rebuild maintained local persistence for parity lock
  - v2.2: full migration to API-backed persistence (Express + PostgreSQL)

  This approach ensured UI behavior remained stable while replacing the underlying data layer.

- **CI-Gated Development**
  GitHub Actions enforces typecheck, lint, and test validation on every push and pull request.

These patterns mirror practices used in production applications where architectural changes must not introduce behavioral regressions.

---

## Security & Data Ownership (v2.3)

Readr v2.3 introduces strict per-user data boundaries across the system.

Key guarantees:

- All data is scoped to the authenticated user
- Backup export returns only user-owned records
- Backup import enforces ownership (incoming `userId` is ignored)
- Invalid relationships (e.g., orphan sessions) are rejected
- Failed imports rollback completely (no partial writes)

These constraints are enforced at both the API layer and database level, and validated through integration testing.

This ensures the system is safe for multi-user environments.

---

## Parity Summary (v2.1)

**v2.1 goal:** rebuild the v1.9 frontend in **React + TypeScript** with **behavior parity** before any API migration.

**Tier 0 Lock (freeze gates):**

- **Books/Search locked (Sprint 5):** Undo (~6s), highlight parity, autocomplete parity, regression tests
- **Sessions locked (Sprint 7):** CRUD + deterministic sorting, keyboard navigation + live regions, Undo (~6s), highlight parity, regression tests

**Hardening (Sprint 8):**

- Accessibility + focus management baseline
- Corrupt storage resilience
- Performance sanity check on large libraries

**CI baseline (Sprint 9):**

- Typecheck + tests required on PRs
- “Intentional regression” proof test to confirm the suite catches breakages

Canonical docs:

- Parity Charter: [`docs/sprints/v2.1/parity-charter-v2.1.md`](/docs/sprints/v2.1/parity-charter-v2.1.md)
- Architecture: [`docs/sprints/v2.1/architecture-v2.1.md`](/docs/sprints/v2.1/architecture-v2.1.md)
- Test Matrix: [`docs/sprints/v2.1/test-matrix-parity.md`](/docs/sprints/v2.1/test-matrix-parity.md)
- Dependency Map: [`docs/sprints/v2.1/dependency-map-v2.1.md`](/docs/sprints/v2.1/dependency-map-v2.1.md)

---

## Table of Contents

- [Overview](#overview)
- [Parity Summary (v2.1)](#parity-summary-v2.1)
- [Why This Project](#why-this-project)
- [Roadmap Philosophy](#roadmap-philosophy)
- [Changelog](#changelog)
- [Release Strategy](#release-strategy)
- [Roadmap (High-Level)](#roadmap-high-level)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Engineering Decisions](#engineering-decisions)
- [Screenshots](#screenshots)
- [Installation & Development](#installation--development)
- [Author](#author)
- [License](#license)

---

## Why This Project

Readr is both a product and a systems-design exercise.

It demonstrates:

- Incremental, versioned system evolution
- Safe migration from local-first → API-backed architecture
- Strict separation of concerns across frontend and backend
- Schema-driven validation (Zod + Prisma)
- Full-stack testing (UI parity + API integration)

The goal is not just to build features, but to evolve architecture intentionally while maintaining correctness at every step.

---

## Roadmap Philosophy

Readr is developed in versioned milestones where each release isolates a specific risk area
(e.g., architecture, persistence, UX, or scale) before introducing new complexity.

The roadmap documents not just _what_ was built, but _why_ — serving as both a planning tool
and a technical narrative.

See the full roadmap in [`roadmap.md`](./roadmap.md).

---

## Changelog

All notable changes are documented in [`CHANGELOG.md`](./CHANGELOG.md),
following **Keep a Changelog** and **Semantic Versioning**.

---

## Release Strategy

Readr uses two parallel versioning systems:

### Official Releases (Semantic Versioning)

Major milestones follow **SemVer** and represent stable, coherent deliverables:

- `v2.0.0` — Backend & CI foundation
- `v2.1.0` — React frontend rebuild
- Future versions increment semantically

These releases are published in GitHub Releases.

### Sprint Tags (Development Checkpoints)

During active development, sprint tags are used to mark internal milestones:

- `v2.1-sprint-0`
- `v2.1-sprint-1`
- …
- `v2.1-sprint-9`

Sprint tags serve as:

- Structured iteration checkpoints
- Rollback anchors
- Evidence of disciplined development cadence

Only SemVer releases represent official “ship-ready” states.

---

## Roadmap (High-Level)

- **v2.0.0** — Backend & CI foundation (Express + Prisma + PostgreSQL) ✅
- **v2.1.0** — React frontend rebuild with full v1.9 behavioral parity ✅
- **v2.2.0** — API integration & persistence migration (local-first → API) ✅
- **v2.3.0** — Authentication, accounts, and multi-user data boundaries 🚧
- **v2.4.0** — Server-driven badges, statistics, and engagement systems
- **v3.0.0** — Production infrastructure & hosted deployment architecture

For detailed version history and architectural milestones, see [`roadmap.md`](./roadmap.md).

---

## Tech Stack

### Frontend

- React 18
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- React Router
- Zustand
- Vitest + React Testing Library

### Backend

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Zod
- Docker
- GitHub Actions

---

## Testing & CI

Readr includes both **frontend parity tests** and **backend integration tests** to ensure system-wide correctness.

---

### Frontend Testing (v2.1 — Parity Lock)

The React rebuild enforces strict behavioral parity with v1.9.

Covered areas:

- Search engine logic (tokenization, fuzzy matching, AND semantics)
- Books undo system (delete/restore integrity)
- Sessions sorting (deterministic ordering guarantees)
- Keyboard navigation and accessibility behavior

Tools:

- **Vitest**
- **React Testing Library**
- **jsdom**

These tests ensure that architectural changes do not introduce UI regressions.

---

### Backend Integration Testing (v2.3)

The backend includes **API-level integration tests** to validate correctness, security, and data integrity.

Covered areas:

- **Authentication**
  - Register / login flows
  - Protected route enforcement (`401` on unauthorized access)

- **Backup Export**
  - Returns only authenticated user data
  - Prevents cross-user data leakage

- **Backup Import**
  - Valid payload ingestion
  - Duplicate ID rejection
  - Orphan relationship validation (sessions → books)
  - Transaction rollback on failure
  - Forced ownership assignment (never trusts incoming `userId`)

Tools:

- **Vitest**
- **Supertest**
- **PostgreSQL test database (`readr_v2_test`)**

These tests validate that the system enforces **strict per-user data boundaries**, a core requirement of v2.3.

---

### Postman Test Suites

In addition to automated tests, the API is validated using structured Postman collections:

- `Health/`
- `Auth/`
- `Backup/`
- `Books/`
- `Sessions/`

These collections support:

- Manual verification of endpoints
- Regression testing during development
- Real-world API interaction simulation

---

### Continuous Integration

GitHub Actions runs automated validation on **every push and pull request**.

Pipeline steps:

1. Type checking
2. ESLint validation
3. Test suite execution (frontend + backend)

A regression-proof validation was performed by intentionally introducing failures to confirm CI blocks broken builds.

---

### Why This Matters

This layered testing strategy ensures:

- UI behavior remains stable (parity protection)
- API contracts remain correct
- Data integrity is enforced across users
- Security boundaries cannot be bypassed

This mirrors production-grade systems where **frontend, backend, and data ownership must all be validated independently.**

---

## Project Structure

The repository is organized by architectural responsibility rather than framework convention, reinforcing separation between presentation, business logic, and persistence layers.

```bash
readr-v2/
│
├── client/                 # React frontend
│   ├── scripts/
│   ├── src/
│   │   ├── app/            # App shell + router
│   │   ├── features/       # Feature domains (books/sessions/settings)
│   │   ├── shared/         # UI primitives + shared utilities
│   │   ├── test/
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── vercel.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── api/            # Route definitions
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── db/             # Prisma client and DB helpers
│   │   └── index.ts        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma
│   └── docker-compose.yml
│
├── docs/
│   ├── sprints/            # v2.1 sprint blueprints
│   │   └── README.md       # v2.1 sprints README
│   ├── v2.1-parity-charter.md
│   ├── v2.1-architecture.md
│   ├── v2.1-test-matrix.md
│   ├── v2.1-dependency-map.md
│   ├── v2.2-api-integration-blueprint.md
│   └── v2.3-feature-expansion-blueprint.md
│
├── CHANGELOG.md
├── roadmap.md
├── LICENSE.md
└── README.md
```

---

## Architecture

### ASCII Diagram

```txt
                     ┌──────────────────────────┐
                     │        React UI          │
                     │  (Vite + TS + Tailwind)  │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                          Client Services Layer
                      API-backed persistence (v2.2)

                                   │
                                   ▼
                   ┌─────────────────────────────────┐
                   │         Express API              │
                   │  Node.js + TypeScript + Zod      │
                   └───────────────┬─────────────────┘
                                   │
                                   ▼
                          Business Logic Layer
                       (services/, controllers/)

                                   │
                                   ▼
                        ┌───────────────────────┐
                        │     Prisma ORM        │
                        │  (Typed DB access)    │
                        └───────────┬──────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │     PostgreSQL DB       │
                        │  Dockerized Local Dev   │
                        └─────────────────────────┘
```

---

### Mermaid Diagram

```mermaid
flowchart TD

A[React Frontend (Vite + TypeScript + Tailwind)]
  --> B[Client Services Layer (API-backed)]

B --> C[Express Server (Node + TypeScript)]

C --> D[Controller Layer]
D --> E[Service Layer]

E --> F[Prisma ORM]
F --> G[(PostgreSQL Database)]

classDef teal fill:#008080,stroke:#004d4d,color:white;
classDef navy fill:#003366,stroke:#001933,color:white;

class A,B teal
class C,D,E navy
class F,G teal
```

---

## Engineering Decisions

Readr v2 emphasizes architectural clarity and incremental evolution over rapid feature expansion.

Key decisions:

### 1. Backend-First Foundation (v2.0.0)

The backend was built and stabilized before rewriting the frontend to:

- De-risk persistence and schema design early
- Lock API boundaries before UI coupling
- Establish CI-backed integration testing from the start

### 2. Parity Before Expansion (v2.1)

The React frontend rebuild prioritizes feature parity with v1.9 before introducing API-backed persistence.
This avoids mixing behavioral changes with architectural migration.

### 3. Local-First → API Migration Strategy

- v1.x: fully offline-first
- v2.1: React rebuild stays local-first (parity lock)
- v2.2: migrate persistence to API (stable UI)

This staged migration reduces system-wide risk and simplifies debugging.

### 4. Strict Separation of Concerns

- UI components are isolated from state logic.
- Stores isolate state from persistence.
- Services abstract IO (local now, API later).
- Backend separates controllers, services, and schemas.

This keeps React → API integration friction low.

### 5. CI as a First-Class Concern

Backend endpoints are validated via automated API tests.
v2.1 expands regression protection with parity tests and CI gating.

Engineering choices are documented to emphasize maintainability and long-term scalability.

---

## Screenshots

The UI below reflects the current full-stack system with API-backed persistence, authentication, and user-scoped data.

> All screenshots reflect the live application connected to the production API.

---

**User authentication (login / account access)**

![Auth](./docs/screenshots/auth.png)

**Library view with search, filtering, and status tracking**

![Library](./docs/screenshots/library.png)

---

**Search with fuzzy matching and highlight rendering**

![Search](./docs/screenshots/search.png)

---

**Undo system (~6s window) preserving state, filters, and ordering**

![Undo](./docs/screenshots/undo.png)

---

**Session history with deterministic sorting and reading progress tracking**

![Sessions](./docs/screenshots/sessions.png)

---

**Add Book flow with structured input and validation-ready form**

![Add Book](./docs/screenshots/add-book.png)

---

**Backup export/import system with ownership-safe data handling**

![Backup](./docs/screenshots/backup.png)

---

**Responsive mobile layout**

![Mobile](./docs/screenshots/mobile-view.png)

---

## Installation & Development

### 1. Clone the repo

```bash
git clone https://github.com/conorgregson/readr-v2.git
cd readr-v2
```

### 2. Frontend (client)

```bash
cd client
npm install
npm run dev
```

### 3. Backend (server)

```bash
cd server
npm install
npm run dev
```

### 4. Database (Docker + Postgres)

```bash
docker-compose up -d
```

---

## Author

Built and maintained by **Conor Gregson**.

- **GitHub**: https://github.com/conorgregson
- **LinkedIn**: https://www.linkedin.com/in/conorgregson

---

## License

This project is licensed under:

**Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**

You may view, use, and modify the source code for non-commercial purposes only.
Commercial use requires prior written permission.

Full license text:
https://creativecommons.org/licenses/by-nc/4.0/legalcode

See the [LICENSE](./LICENSE.md) file for details
