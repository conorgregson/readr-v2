# Readr — Full-Stack Reading Tracker

### _Turn pages into progress._

A versioned full-stack reading tracker built to demonstrate modern frontend architecture, API-backed system evolution, deployment hardening, behavioral reliability, and CI-gated development.

<p align="center">

<a href="https://readr-v2-app.vercel.app">
  <img src="https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-000000?style=for-the-badge&logo=vercel" />
</a>

<a href="https://github.com/conorgregson/readr-v2/releases/tag/v2.4.0">
  <img src="https://img.shields.io/badge/Latest%20Release-v2.4.0-4CAF50?style=for-the-badge" />
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
<img src="https://img.shields.io/badge/Status-v3.0%20Release%20Ready-FF9800?style=for-the-badge" />
<img src="https://img.shields.io/badge/Commits-Signed%20(Verified)-00C853?style=for-the-badge&logo=github" />

</p>

---

## Live Demo

Try the deployed full-stack app here:

**▶** https://readr-v2-app.vercel.app

The live app runs on a split hosted architecture:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

Current stable feature release:

- **v2.4.0** — Engagement & insights expansion

Current milestone:

- **v3.0.0** — Deployment, reliability, and release-hardening maturity

---

## Overview

Readr is a versioned full-stack reading tracker designed to demonstrate disciplined system growth across frontend architecture, backend persistence, authentication, data ownership, testing, and deployment hardening.

The project began as an offline-first reading log and evolved through staged milestones into a multi-user, API-backed application with:

- a React + TypeScript frontend
- an Express + Prisma backend
- PostgreSQL persistence
- JWT-based authentication
- user-scoped data boundaries
- CI-backed validation
- documented deployment and recovery workflows

A major goal of the project is to show **how architecture can evolve safely** without sacrificing correctness, maintainability, or release confidence.

The original offline-first app remains available here:

**▶** https://github.com/conorgregson/reading-log-app

---

## Table of Contents

- [Live Demo](#live-demo)
- [Overview](#overview)
- [Latest Release](#latest-release)
- [Why This Project](#why-this-project)
- [Key Engineering Highlights](#key-engineering-highlights)
- [Authentication & Data Ownership](#authentication--data-ownership)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Deployment & Environment](#deployment--environment)
- [Local Development](#local-development)
- [Local Workflow Options](#local-workflow-options)
- [Testing & CI](#testing--ci)
- [Release Process & Operational Docs](#release-process--operational-docs)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [Author](#author)
- [License](#license)

---

## Latest Release

### v2.4.0 — Engagement & Insights Expansion

The latest shipped release expands the stable authenticated, API-backed architecture with:

- bulk edit workflows for multi-book mutation
- grouped Undo support for bulk operations
- saved library views with persistent filters and sorts
- dashboard statistics and chart-ready summaries
- reading goals, streaks, and badge progression
- accessibility and regression hardening

### v3.0.0 — Deployment & Growth

v3.0 focuses on infrastructure maturity rather than major product-surface changes.

This milestone improves:

- environment clarity
- local Docker workflow consistency
- health checks and runtime visibility
- CI-backed deploy readiness
- release verification and smoke-test discipline
- documentation, troubleshooting, and recovery guidance

---

## Why This Project

Readr is both a product and a systems-design exercise.

It demonstrates:

- incremental, versioned system evolution
- safe migration from local-first to API-backed persistence
- clear separation of concerns across UI, state, IO, and persistence
- schema-driven validation with Zod and Prisma
- disciplined release engineering with CI and deployment verification
- practical deployment architecture across separate hosting providers

The goal is not just to build features, but to evolve the system intentionally while keeping behavior stable and risks isolated.

---

## Key Engineering Highlights

### Behavioral Parity as a Migration Strategy

The React rebuild prioritized behavioral parity with the earlier offline-first app before API migration. This reduced the risk of mixing architectural change with UI behavior change.

### Local-First to API-Backed Evolution

Readr evolved in stages:

- **v1.x** — offline-first localStorage app
- **v2.1** — React + TypeScript rebuild with parity lock
- **v2.2** — migration to API-backed persistence
- **v2.3** — authentication and strict per-user ownership
- **v2.4** — engagement systems and derived read models
- **v3.0** — deployment hardening and release maturity

### Deterministic UI Behavior

Critical UI behaviors such as sorting, Undo recovery, and filtered-list restoration are designed to remain predictable across state changes.

### Strict Data Ownership

Authenticated data access is enforced across books, sessions, exports, and imports. Import flows reject invalid relationships and do not trust incoming ownership fields.

### CI-Gated Development

Typechecking, linting, tests, build validation, artifact startup checks, health checks, and smoke-test procedures are used to reduce release risk.

---

## Authentication & Data Ownership

Readr uses JWT-based authentication to establish identity and enforce user ownership across protected operations.

Protected areas include:

- books
- sessions
- backup export
- backup import
- account lookup
- authenticated derived data surfaces

### Auth API Summary

Primary endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Protected requests use:

```http
Authorization: Bearer <token>
```

This token is issued by the backend during registration or login and is required for all user-scoped operations.

### Security Guarantees

The system is designed to fail safely:

- missing authorization headers are rejected
- malformed bearer tokens are rejected
- invalid signatures are rejected
- expired tokens are rejected
- invalid payload shapes are rejected
- unexpected request keys are rejected by strict validation
- repeated auth write attempts are throttled with structured `429` responses

These protections support reliable multi-user isolation and predictable API behavior.

---

## Tech Stack

### Frontend

- React 18
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- React Router
- Zustand
- Vitest
- React Testing Library

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Zod
- Supertest

### Tooling & Infrastructure

- GitHub Actions
- Vercel
- Render
- Neon PostgreSQL
- Docker Compose
- Postman

---

## Architecture

### Hosted Request Flow

```txt
Browser
  -> Vercel frontend
  -> Render API
  -> Neon PostgreSQL
```

### Application Architecture

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
                   │         Express API             │
                   │  Node.js + TypeScript + Zod     │
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
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │     PostgreSQL DB       │
                        └─────────────────────────┘
```

### Service Boundaries

- **Frontend**
  - renders UI
  - manages client state
  - calls API services
  - does not directly access the database
- **Backend**
  - validates requests
  - authenticates users
  - enforces ownership rules
  - exposes API contracts
  - manages database access through Prisma
- **Database**
  - persists application state
  - enforces relational integrity
  - supports secure per-user data storage

---

## Deployment & Environment

Readr uses a split deployment model:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

This separation keeps frontend delivery, backend runtime, and managed database concerns clearly isolated.

### Production Environment Responsibilities

#### Vercel

Frontend deployment requires:

```env
VITE_API_BASE_URL="https://your-render-service.onrender.com"
```

Important:

- use the backend origin only
- do **not** include `/api`
- the client appends `/api` internally

#### Render

Backend runtime requires:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="replace-with-a-secure-secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="production"
PORT="10000"
CORS_ALLOWED_ORIGINS="https://readr-v2-app.vercel.app"
AUTH_RATE_LIMIT_WINDOW_MS="900000"
AUTH_RATE_LIMIT_MAX="10"
```

#### Root Prisma Tooling

Repository-level Prisma tooling uses:

```env
DATABASE_URL="postgresql://..."
```

### Environment Templates

The repository should include:

- `/.env.example`
- `client/.env.example`
- `server/.env.example`
- `server/.env.test.example`

These files should only contain placeholder values, never real secrets.

---

## Local Development

Readr supports two local backend workflows:

- traditional manual setup
- Docker-based backend + database orchestration

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

Readr uses separate environment files for **root tooling**, **frontend local development**, and **backend runtime**.

Create the following files before starting the app.

#### Root (`/.env`)

Create a root `.env` file for Prisma and repository-level database tooling:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

This value is used by Prisma configuration and database commands run from the repository. Do **not** commit real credentials.

#### Frontend (`client/.env`)

Create a `.env` file inside client/:

```env
VITE_API_BASE_URL="http://localhost:4000"
```

This tells the frontend where to send API requests during local development.

Important:

- Use the **backend origin only**
- Do **not** include `/api`
- The frontend appends `/api` internally when making requests

Examples:

Correct: `http://localhost:4000`
Incorrect: `http://localhost:4000/api`

#### Backend (`server/.env`)

Create a `.env` file inside `server/`:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
JWT_SECRET="your-development-secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT="4000"
CORS_ALLOWED_ORIGINS="http://localhost:5173,https://readr-v2-app.vercel.app"
AUTH_RATE_LIMIT_WINDOW_MS="900000"
AUTH_RATE_LIMIT_MAX="10"
```

Required backend variables:

- `DATABASE_URL`
  - PostgreSQL connection string used by the API runtime
- `JWT_SECRET`
  - Secret used to sign and verify JWTs
- `JWT_EXPIRES_IN`
  - JWT lifetime configuration
- `NODE_ENV`
  - Runtime environment name
- `PORT`
  - Local backend port
- `CORS_ALLOWED_ORIGINS`
  - Comma-separated list of allowed frontend origins
- `AUTH_RATE_LIMIT_WINDOW_MS`
  - Rate-limit window for auth write endpoints, in milliseconds
- `AUTH_RATE_LIMIT_MAX`
  - Maximum register/login attempts allowed within the configured window

#### Backend test environment (`server/.env.test`)

Create a `.env.test` file inside `server/` for backend integration tests:

```env
DATABASE_URL="postgresql://username:password@host/test_database"
JWT_SECRET="test-secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="test"
CORS_ALLOWED_ORIGINS="http://localhost:5173"
```

> Local `.env` files do not automatically carry into Vercel or Render. Production configuration must be set separately in each platform.

---

## Local Workflow Options

### Option A — Traditional Manual Workflow

Use your own local PostgreSQL instance or a hosted development database.

From `server`:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

This generates the Prisma client and applies the latest schema to your local database.

Backend runs at:

```bash
http://localhost:4000
```

From `client/`:

```bash
npm run dev
```

Frontend typically runs at:

```bash
http://localhost:5173
```

### Option B — Docker Backend Workflow

Use Docker Compose for local PostgreSQL + backend orchestration.

From the repository root:

```bash
docker compose up
```

This starts:

- local PostgreSQL
- local Express backend

Then start the frontend separately:

```bash
cd client
npm run dev
```

Useful commands:

```bash
docker compose build --no-cache
docker compose up
```

```bash
docker compose down
```

```bash
docker compose down -v
```

Use `docker compose down -v` only if you intentionally want to wipe local containerized database state.

---

## Testing & CI

Readr uses layered validation across frontend behavior, backend contracts, and deployment readiness.

### Frontend Testing

Covers areas such as:

- search logic
- Undo behavior
- sorting behavior
- auth state behavior
- token restore flow
- logout state reset
- bulk selection and grouped Undo
- saved view behavior
- dashboard and engagement UI behavior
- accessibility semantics

Tools:

- Vitest
- React Testing Library
- jsdom

### Backend Testing

Covers areas such as:

- register/login flows
- authenticated account lookup
- protected route enforcement
- invalid and expired token handling
- malformed request handling
- ownership enforcement
- backup import/export integrity
- transaction rollback behavior
- structured hardening responses

Tools:

- Vitest
- Supertest
- PostgreSQL test database

### Postman Test Suites

The API is also validated through structured Postman collections for:

- health
- auth
- backup
- books
- sessions
- stats
- engagement

### Continuous Integration

GitHub Actions is used to validate:

- typechecking
- linting
- frontend tests
- backend tests
- production builds
- deploy-readiness checks
- built-artifact startup validation
- `/health` validation
- API smoke flows where applicable

This keeps release confidence high and helps catch environment-sensitive failures before deployment.

---

## Release Process & Operational Docs

Readr v3.0 adds lightweight release-process documentation to make deployments safer and more repeatable.

Sprint 4 / Sprint 5 operational docs:

- [`./docs/sprints/v3.0/v3.0-release-checklist.md`](./docs/sprints/v3.0/v3.0-release-checklist.md)
- [`./docs/sprints/v3.0/v3.0-deployment-verification-checklist.md`](./docs/sprints/v3.0/v3.0-deployment-verification-checklist.md)
- [`./docs/sprints/v3.0/v3.0-smoke-test-flow.md`](./docs/sprints/v3.0/v3.0-smoke-test-flow.md)

Recommended supporting docs:

- [`./docs/deployment/architecture.md`](./docs/deployment/architecture.md)
- [`./docs/deployment/troubleshooting-and-recovery.md`](./docs/deployment/troubleshooting-and-recovery.md)

These docs separate:

- pre-deploy validation
- post-deploy verification
- rollback and recovery expectations
- deployment architecture reference
- troubleshooting steps for common failures

---

## Project Structure

```bash
readr-v2/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── client/
│   ├── scripts/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── books/
│   │   │   ├── engagement/
│   │   │   ├── sessions/
│   │   │   ├── settings/
│   │   │   └── stats/
│   │   ├── shared/
│   │   │   ├── a11y/
│   │   │   ├── api/
│   │   │   ├── data/
│   │   │   ├── types/
│   │   │   └── ui/
│   │   ├── test/
│   │   └── main.tsx
│   ├── index.html
│   ├── vercel.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── server/
│   ├── postman/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── backup/
│   │   │   ├── books/
│   │   │   ├── engagement/
│   │   │   ├── saved-views/
│   │   │   ├── sessions/
│   │   │   ├── stats/
│   │   │   └── views/
│   │   ├── tests/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── docs/
├── shared/
│   └── types/
│       └── v2.4.ts
├── CHANGELOG.md
├── roadmap.md
├── LICENSE.md
└── README.md
```

### Structure Philosophy

A few intentional boundaries shape the repository:

- frontend features are grouped by domain behavior
- shared frontend infrastructure remains centralized
- cross-app contracts live at the repo level
- backend modules map to route-domain responsibilities
- testing exists at multiple layers
- deployment and release docs are versioned alongside implementation work

This structure supports versioned development without collapsing architecture boundaries as the system grows.

---

## Screenshots

The UI below reflects the current full-stack system with API-backed persistence, authentication, user-scoped data, and the v2.4 engagement and insights layer.

> All screenshots reflect the live application connected to the production API.

---

**User authentication (login / account access)**

![Auth](./docs/screenshots/auth.png)

---

**Library view with search, filtering, status tracking, and server-backed books data**

![Library](./docs/screenshots/library.png)

---

**Saved views with persistent filters, sort state, and active view controls**

![Saved Views](./docs/screenshots/saved-views.png)

---

**Search with fuzzy matching and highlight rendering**

![Search](./docs/screenshots/search.png)

---

**Bulk selection and grouped library actions**

![Bulk Actions](./docs/screenshots/bulk-actions.png)

---

**Grouped Undo after bulk status updates**

![Bulk Undo](./docs/screenshots/bulk-undo.png)

---

**Dashboard with server-derived reading stats and chart-based summaries**

![Dashboard](./docs/screenshots/dashboard.png)

---

**Goals, streaks, and badge progression**

![Engagement](./docs/screenshots/engagement.png)

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

## Roadmap

Readr is developed in versioned milestones where each release isolates a specific risk area before introducing new complexity.

High-level version history:

- **v2.0.0** — Backend & CI foundation
- **v2.1.0** — React frontend rebuild with full v1.9 behavioral parity
- **v2.2.0** — API integration & persistence migration
- **v2.3.0** — Authentication and strict user ownership
- **v2.4.0** — Engagement & insights expansion
- **v3.0.0** — Deployment hardening, release safety, and hosted architecture maturity

For the full roadmap, see [`roadmap.md`](./roadmap.md).

---

## Changelog

All notable changes are documented in [`CHANGELOG.md`](./CHANGELOG.md),
following **Keep a Changelog** and **Semantic Versioning**.

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
