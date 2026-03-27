# Readr v2 — Full-Stack Reading Tracker

### _Turn pages into progress._

A versioned full-stack reading tracker built to demonstrate modern frontend architecture, API-backed system evolution, behavioral parity testing, and CI-gated development.

<p align="center">

<a href="https://readr-v2-app.vercel.app">
  <img src="https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-000000?style=for-the-badge&logo=vercel" />
</a>

<a href="https://github.com/conorgregson/readr-v2/releases/tag/v2.3.0">
  <img src="https://img.shields.io/badge/Latest%20Release-v2.3.0-4CAF50?style=for-the-badge" />
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

<img src="https://img.shields.io/badge/Status-v2.4%20In%20Progress-F9A825?style=for-the-badge" />
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
- **Authentication + user-scoped data now live in v2.3**
- **Backup export/import now live with ownership enforcement**
- **Basic auth endpoint rate limiting now protects repeated register/login attempts**
- **v2.4 is currently in progress**, focused on engagement systems, analytics surfaces, and advanced library workflows

> Current stable release: **v2.3.0**
> Current development milestone: **v2.4 — Engagement & Insights Expansion**

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

> Latest official release: **v2.3.0 — Authentication & data ownership**
> Current development milestone: **v2.4.0 — Engagement & insights expansion**

---

## Current Development Focus (v2.4)

Readr v2.4 is currently in progress.

This phase expands the stable authenticated, API-backed architecture with a new layer of advanced UX and derived read models, including:

- bulk edit workflows for multi-book mutation
- saved library views with persistent filters/sorts
- dashboard statistics and chart-ready summaries
- reading goals, streaks, and badge progression
- accessibility, performance, and release hardening for larger libraries

v2.4 is a **feature-layering release**, not an architectural migration.

That means the primary goal is to extend the system safely on top of the stable boundaries established in v2.0–v2.3 rather than rewrite persistence, routing, or ownership architecture again.

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
- Auth write endpoints include basic rate limiting on register/login
- Repeated auth attempts return structured `429` responses

These constraints are enforced at both the API layer and database level, and validated through integration testing.

This ensures the system is safe for multi-user environments.

---

## Authentication Flow

Readr v2.3 introduces **JWT-based authentication** to establish identity and enforce strict user ownership across the system.

Core flow:

- Users register or log in through the auth API
- The backend validates credentials and returns:
  - a signed JWT
  - the authenticated user payload
- The frontend stores the token and restores the session on app load
- Protected API routes require a valid `Authorization: Bearer <token>` header
- Invalid, expired, malformed, or incorrectly signed tokens are rejected with `401 Unauthorized`

This authentication layer ensures that all protected operations execute within an authenticated user context.

That includes:

- books
- sessions
- backup export
- backup import
- account lookup via `/api/auth/me`

Because identity is established before protected data is accessed, the backend can safely enforce **per-user ownership** on every request.

### Why this matters

Authentication in Readr v2.3 is not just a login feature — it is the foundation for **multi-user data isolation**.

Without authentication, the system could not reliably determine:

- which books belong to which user
- which sessions belong to which library
- which backup payloads are allowed to be imported or exported

By introducing JWT-based auth before expanding multi-user functionality further, v2.3 creates a secure base for future features while preserving the app’s existing behavior and architecture.

---

## Auth API Summary

Primary authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Endpoint responsibilities

- `POST /api/auth/register`
  - Creates a new user account
  - Validates request shape strictly
  - Returns a signed JWT and authenticated user payload on success

- `POST /api/auth/login`
  - Validates submitted credentials
  - Returns a signed JWT and authenticated user payload on success

- `GET /api/auth/me`
  - Requires a valid bearer token
  - Returns the currently authenticated user
  - Rejects missing, malformed, expired, or invalid tokens with `401 Unauthorized`

### Auth contract

Protected requests use the standard authorization header format:

```http
Authorization: Bearer <token>
```

This token is issued by the backend during registration or login and is required for all user-scoped operations.

### Security behavior

The auth layer is designed to fail safely:

- Missing authorization headers are rejected
- Malformed bearer tokens are rejected
- Invalid signatures are rejected
- Expired tokens are rejected
- Invalid payload shapes are rejected
- Unexpected request keys are rejected by strict validation
- Repeated register/login attempts are throttled with structured `429` responses

Together, these guarantees make authentication predictable at the API boundary and provide a reliable foundation for per-user ownership enforcement across books, sessions, and backup operations.

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
- [Key Engineering Concepts](#key-engineering-concepts)
- [Security & Data Ownership (v2.3)](#security--data-ownership-v2.3)
- [Authentication Flow](#authentication-flow)
- [Auth API Summary](#auth-api-summary)
- [Parity Summary (v2.1)](#parity-summary-v2.1)
- [Why This Project](#why-this-project)
- [Roadmap Philosophy](#roadmap-philosophy)
- [Changelog](#changelog)
- [Release Strategy](#release-strategy)
- [Roadmap (High-Level)](#roadmap-high-level)
- [Tech Stack](#tech-stack)
- [Testing & CI](#testing--ci)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Deployment & Environment](#deployment--environment)
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
- sprint tags continue throughout active milestone development

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
- **v2.3.0** — Authentication, accounts, and multi-user data boundaries ✅
- **v2.4.0** — Engagement & insights expansion _(in progress)_ 🚧
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
- GitHub Actions

---

## Testing & CI

Readr includes both **frontend behavioral tests** and **backend integration tests** to validate correctness across the UI, API, and data ownership layers.

This layered strategy helps ensure that architectural changes do not introduce regressions, that protected routes behave predictably, and that user-scoped data boundaries remain enforced.

---

### Frontend Testing (v2.1 → v2.3)

The frontend test suite protects core UI behavior as the app evolves from parity-focused rebuild work into authenticated, API-backed flows.

Covered areas include:

- Search engine logic (tokenization, fuzzy matching, AND semantics)
- Books undo system (delete/restore integrity)
- Sessions sorting (deterministic ordering guarantees)
- Keyboard navigation and accessibility behavior
- Auth store behavior
- Token restore flow
- Logout state reset behavior

Tools:

- **Vitest**
- **React Testing Library**
- **jsdom**

These tests ensure that the React application remains behaviorally stable while new architecture is introduced underneath it.

---

### Backend Integration Testing (v2.3)

The backend includes **API-level integration tests** to validate correctness, security, and ownership enforcement across the system.

Covered areas:

- **Authentication**
  - Register flow
  - Login flow
  - Authenticated account lookup via `GET /api/auth/me`
  - Protected route enforcement (`401` on unauthorized access)

- **Auth hardening**
  - Missing authorization headers rejected
  - Malformed authorization headers rejected
  - Invalid JWTs rejected
  - Expired JWTs rejected
  - Incorrectly signed tokens rejected
  - Invalid token payload shapes rejected
  - Unexpected request keys rejected by strict validation

- **HTTP hardening**
  - Unknown routes return structured JSON `404`
  - Malformed JSON bodies return structured `400`
  - Oversized request bodies return structured `413`

- **Ownership enforcement**
  - Books are scoped to the authenticated user
  - Sessions are scoped to the authenticated user
  - Cross-user data access is rejected

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

These tests validate that the system enforces **strict per-user data boundaries** and a predictable auth contract, which are core requirements of v2.3.

---

### Postman Test Suites

In addition to automated tests, the API is validated using structured Postman collections:

- `Health/`
- `Auth/`
- `Backup/`
- `Books/`
- `Sessions/`

These collections support:

- Manual endpoint verification
- Regression testing during development
- Real-world request/response validation outside the automated test harness

---

### Continuous Integration

GitHub Actions runs automated validation on **every push and pull request**.

Pipeline steps:

1. Type checking
2. ESLint validation
3. Test suite execution (frontend + backend)

This keeps regressions visible early and helps maintain release discipline across sprint branches and merge flow.

---

### Why This Matters

This testing strategy ensures that:

- UI behavior remains stable
- Auth flows remain predictable
- API contracts remain consistent
- Ownership boundaries cannot be bypassed
- Architectural evolution does not come at the cost of correctness

That combination is central to Readr’s development model: **versioned system growth with explicit reliability checks at each stage.**

---

## Project Structure

The repository is organized by **architectural responsibility**, keeping UI, state, API, validation, and persistence concerns clearly separated across the frontend and backend.

```bash
readr-v2/
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI pipeline (typecheck, lint, test)
│
├── client/                           # React frontend (Vite + TypeScript)
│   ├── scripts/
│   │   └── gen-backup.mjs            # Backup/dev utility script
│   ├── src/
│   │   ├── app/                      # App shell, routing, top-level composition
│   │   ├── features/                 # Domain features
│   │   │   ├── auth/                 # Authentication UI, services, state
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   └── page.tsx
│   │   │   ├── books/                # Book library flows
│   │   │   │   ├── components/
│   │   │   │   ├── search/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   ├── page.tsx
│   │   │   │   └── types.ts
│   │   │   ├── sessions/             # Reading session flows
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   ├── page.tsx
│   │   │   │   └── types.ts
│   │   │   └── settings/             # Import/export and app settings flows
│   │   │       ├── services/
│   │   │       └── page.tsx
│   │   ├── shared/                   # Cross-feature building blocks
│   │   │   ├── a11y/                 # Accessibility helpers
│   │   │   ├── api/                  # API client helpers and shared request logic
│   │   │   ├── data/                 # Shared data helpers/constants
│   │   │   ├── types/                # Shared TypeScript types
│   │   │   └── ui/                   # Reusable UI primitives/states
│   │   │       └── states/
│   │   ├── test/                     # Frontend test setup and helpers
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── vercel.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── server/                           # Express backend
│   ├── postman/                      # Manual API regression collections/reports
│   │   ├── reports/
│   │   ├── Readr-v2-API.postman_collection.json
│   │   └── Readr-v2-local.postman_environment.json
│   ├── prisma/
│   │   ├── migrations/               # Database migration history
│   │   ├── schema.prisma             # Prisma schema and model relationships
│   │   └── seed.ts                   # Seed data script
│   ├── src/
│   │   ├── config/                   # Environment/runtime configuration
│   │   ├── db/
│   │   │   └── client.ts             # Prisma client setup
│   │   ├── middleware/               # Auth, error handling, request guards
│   │   ├── modules/                  # Route-domain backend modules
│   │   │   ├── auth/                 # Register, login, me
│   │   │   ├── backup/               # Import/export with ownership enforcement
│   │   │   ├── books/                # Book CRUD
│   │   │   └── sessions/             # Session CRUD
│   │   ├── tests/
│   │   │   ├── helpers/
│   │   │   ├── integration/          # API integration and hardening tests
│   │   │   └── setup.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts                    # Express app composition
│   │   └── index.ts                  # Server entry point
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── docs/                             # Architecture notes, sprint docs, dependency maps, screenshots
├── CHANGELOG.md
├── roadmap.md
├── LICENSE.md
└── README.md
```

### Structure philosophy

A few intentional boundaries shape the repository:

- **Frontend features are domain-oriented**
  - Authentication, books, sessions, and settings are grouped by behavior rather than by file type alone
- **Shared frontend infrastructure stays centralized**
  - Accessibility, API helpers, shared UI, data helpers, and common types live under `shared/`
- **Backend modules map directly to API responsibilities**
  - Auth, backup, books, and sessions are isolated into focused route-domain modules
- **Validation, auth, and persistence stay near the backend boundary**
  - Middleware, Prisma access, runtime config, and module logic are separated from presentation concerns
- **Testing exists at multiple layers**
  - Frontend tests protect behavioral parity and UI correctness
  - Backend integration tests protect API contracts, auth correctness, and ownership enforcement
  - Postman collections support structured manual regression checks

This structure supports Readr’s versioned development model: preserving clear architectural boundaries while the system evolves from parity-focused frontend work into secure, multi-user full-stack behavior.

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
                        │                         │
                        └─────────────────────────┘
```

---

## Deployment & Environment

Readr v2 is deployed as a **split frontend/backend architecture**:

- **Frontend:** Vercel (React + Vite)
- **Backend:** Render (Express API)
- **Database:** PostgreSQL (Neon for local)

---

### Environment Configuration

The system relies on strict environment configuration for production:

#### Frontend (Vercel)

- `VITE_API_BASE_URL`
  - Points to the deployed backend API
  - Example:
    ```
    https://readr-impd.onrender.com
    ```

#### Backend (Render)

- `DATABASE_URL`
- `JWT_SECRET`

These variables are required at runtime and must be configured in the deployment platform (not just `.env` locally).

---

### Key Lessons from Deployment

During production rollout, several issues were identified and resolved:

- **Environment variable mismatch**
  - `VITE_API_BASE_URL` was misnamed, causing the frontend to fail API calls

- **Missing backend secret**
  - `JWT_SECRET` was not configured in Render, causing authentication failures (`500` errors)

- **Local vs production parity**
  - Local `.env` values do not carry over to Vercel/Render automatically
  - Each platform requires explicit configuration

---

### Why This Matters

These fixes reinforced critical full-stack principles:

- Production systems depend on **correct environment configuration**
- Authentication systems require **secure and consistent secrets**
- Deployment platforms are **isolated environments**, not extensions of local dev

This mirrors real-world debugging scenarios where infrastructure — not code — is often the source of failure.

---

### Mermaid Diagram

```mermaid
flowchart TD

A["React Frontend (Vite + TypeScript + Tailwind)"]
  --> B["Client Services Layer (API-backed)"]

B --> C["Express Server (Node + TypeScript)"]

C --> D["Controller Layer"]
D --> E["Service Layer"]

E --> F["Prisma ORM"]
F --> G[("PostgreSQL Database")]

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

### 6. Contract-First Feature Expansion (v2.4)

v2.4 begins with a contract-first sprint that defines request/response shapes, derived-state ownership rules, and feature dependencies before implementation expands into UI and mutation behavior.

This approach is used to reduce the risk of:

- inconsistent DTOs
- duplicated business logic
- premature UI coupling
- boundary erosion across frontend and backend layers

By locking these assumptions early, later sprint work can build on stable contracts instead of inventing them during implementation.

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

### 1. Clone the repository

```bash
git clone https://github.com/conorgregson/readr-v2.git
cd readr-v2
```

---

### 2. Install dependencies

Install dependencies separately for the frontend and backend:

```bash
cd client
npm install
```

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Readr v2 requires separate environment configuration for the frontend and backend.

#### Frontend (`client/.env`)

Create a `.env` file inside `client/`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

This tells the frontend where to send API requests during local development.

#### Backend (`server/.env`)

Create a `.env` file inside `server/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/readr_v2
JWT_SECRET=your-development-secret
PORT=4000
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
```

Required backend variables:

- `DATABASE_URL`
  - PostgreSQL connection string for local development
- `JWT_SECRET`
  - Secret used to sign and verify JWTs
- `POST`
  - Local backend port
- `AUTH_RATE_LIMIT_WINDOW_MS`
  - Rate-limit window for auth write endpoints, in milliseconds
- `AUTH_RATE_LIMIT_MAX`
  - Maximum register/login attempts allowed within the configured window

> These values must also be configured separately in production environments such as Vercel and Render.

### 4. Ensure PostgreSQL is available

Readr requires a PostgreSQL database for local backend development.

You can use either:

- a local PostgreSQL installation
- a hosted development database such as Neon

Make sure your DATABASE_URL points to a valid database before running

### 5. Apply database schema

After the database is running, initialize Prisma:

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

This generates the Prisma client and applies the latest schema to your local database.

### 6. Start the backend

From `server/`:

```bash
npm run dev
```

The API will run locally at:

```bash
http://localhost:4000
```

### 7. Start the frontend

From `client/`:

```bash
npm run dev
```

The frontend will run locally through Vite, typically at:

```bash
http://localhost:5173
```

### 8. Run Tests

#### Frontend tests

From `client/`:

```bash
npm run test
```

#### Backend tests

From `server/`:

```bash
npm run test
```

If backend integration tests use a dedicated test database, ensure it is configured and available before running the suite.

### 9. Production deployment

Readr v2 uses a split deployment model:

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon (production) / PostgreSQL for local development

Production environments must provide valid runtime configuration for:

- `VITE_API_BASE_URL`
- `DATABASE_URL`
- `JWT_SECRET`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`

### Development Notes

- The frontend depends on the backend being available at the configured API base URL
- Authentication and all protected data flows require a valid backend `JWT_SECRET`
- Register/login endpoints are protected by basic rate limiting in v2.3
- Books, sessions, and backup operations are user-scoped in v2.3
- Local development requires a reachable PostgreSQL database via `DATABASE_URL`
- Local `.env` files do not automatically carry into deployed environments

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
