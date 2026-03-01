# Readr v2 — Full-Stack Reading Tracker

### _Turn pages into progress._

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-008080?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Express%20%2B%20Node-003366?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/ORM-Prisma-0C344B?style=for-the-badge&logo=prisma" />
  <br/>
  <img src="https://img.shields.io/badge/Status-Active%20Development-FFA500?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Commits-Signed%20(Verified)-00C853?style=for-the-badge&logo=github" />
</p>

---

## Overview

**Readr v2** is a deliberate full-stack rewrite of my original offline-first reading tracker (**v1.0–v1.9**).

The goal of v2 is not just a UI upgrade, but a structural evolution:

- A scalable Express + PostgreSQL backend
- A modern, strongly-typed React frontend
- Clear architectural boundaries between UI, state, and persistence
- Automated testing and CI from the foundation up

Each version isolates a specific risk area (architecture, UX, persistence, or scale) before layering new complexity.

The original v1.x app remains available here:
**▶** https://github.com/conorgregson/reading-log-app

> Current focus: **v2.1 React frontend rebuild (feature parity phase).**

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

- Parity Charter: [`docs/parity-charter-v2.1.md`](/docs/parity-charter-v2.1.md)
- Architecture: [`docs/architecture-v2.1.md`](/docs/architecture-v2.1.md)
- Test Matrix: [`docs/test-matrix-parity.md`](/docs/test-matrix-parity.md)
- Dependency Map: [`docs/dependency-map-v2.1.md`](/docs/dependency-map-v2.1.md)

---

## Table of Contents

- [Overview](#overview)
- [Parity Summary (v21)](#parity-summary-v21)
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

- Incremental versioning discipline
- Frontend and backend separation of concerns
- Schema-driven validation (Zod + Prisma)
- CI-backed API testing
- Migration from offline-first architecture to API-backed persistence

The goal is not just to build features, but to evolve architecture intentionally.

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
- `v2.1.0` — React frontend rebuild (in progress)
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

- **v2.0.0** — Backend & CI foundation ✅
- **v2.1.0** — React frontend rebuild (parity lock) 🚧
- **v2.2.0** — API integration & persistence
- **v2.3.0+** — Accounts, analytics, and growth features

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

## Project Structure

The repository is organized by architectural responsibility rather than framework convention, reinforcing separation between presentation, business logic, and persistence layers.

```bash
readr-v2/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── app/            # App shell + router
│   │   ├── features/       # Feature domains (books/sessions/settings)
│   │   ├── shared/         # UI primitives + shared utilities
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── vitest.config.ts
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
│   ├── v2.1-parity-charter.md
│   ├── v2.1-architecture.md
│   ├── v2.1-test-matrix.md
│   └── v2.1-dependency-map.md
│
├── CHANGELOG.md
├── roadmap.md
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
                      Client Services Layer (v2.1)
                        local-first persistence

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

A[React Frontend<br/>Vite + TypeScript + Tailwind]
  --> B[Client Services Layer<br/>local-first in v2.1]

B -->|v2.2+| C[Express Server<br/>Node + TypeScript]

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

> Screenshots will be added as the v2.1 parity phase stabilizes.

- Dashboard _(coming soon)_
- Library / Book List _(coming soon)_
- Add Book Modal _(coming soon)_
- Session History _(coming soon)_
- Settings Panel _(coming soon)_

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
