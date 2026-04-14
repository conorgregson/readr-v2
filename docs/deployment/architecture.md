# Deployment Architecture — Readr v3.0

This document describes the current deployment architecture for Readr v3.0, including service boundaries, request flow, environment responsibilities, and the main operational assumptions behind the hosted stack.

Its purpose is to make the system easier to understand, review, debug, and maintain.

---

## Purpose

This guide exists to answer four practical questions:

1. what is deployed where
2. how requests move through the system
3. which environment variables belong to which platform
4. where to look when something breaks

It is written for the current Readr v3.0 architecture:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL
- **Local backend workflow:** manual local setup or Docker Compose

---

## High-Level Architecture

Readr uses a split hosted architecture with three clearly separated responsibilities:

- **Vercel** hosts and serves the frontend
- **Render** runs the backend API
- **Neon** provides the hosted PostgreSQL database

This keeps deployment concerns separated by layer:

- frontend delivery and build configuration
- backend runtime and API behavior
- database persistence and connectivity

### High-Level Hosted Flow

```txt
Browser
  -> Vercel frontend
  -> Render API
  -> Neon PostgreSQL
```

---

## Architecture Goals

The hosted architecture is designed to support:

- clear separation of concerns
- multi-user authenticated access
- API-backed persistence
- independent frontend and backend deployment
- managed PostgreSQL infrastructure
- safer release verification and rollback boundaries

This architecture is intentionally practical rather than over-engineered. The goal is deployment clarity and reliability, not infrastructure complexity for its own sake.

---

## System Components

### 1. Frontend

#### Platform

- **Hosted on**: Vercel

#### Responsibilities

The frontend is responsible for:

- rendering the application UI
- handling navigation and user interactions
- managing client-side state
- calling backend API endpoints
- storing/restoring auth session state
- presenting data returned by the API

#### What the frontend does not do

The frontend does **not**:

- access the database directly
- own authentication enforcement
- enforce cross-user data ownership
- persist protected data outside the backend contract

#### Operational notes

The frontend depends on a valid backend base URL through:

```env
VITE_API_BASE_URL="https://your-render-service.onrender.com"
```

Important:

- this value must be the backend origin only
- it must **not** include `/api`
- the client `appends /api` internally

### 2. Backend

#### Platform

- **Hosted on**: Render

#### Responsibilities

The backend is responsible for:

- exposing the REST API
- validating request shapes
- authenticating users
- issuing and validating JWTs
- enforcing per-user ownership
- orchestrating business logic
- reading/writing application data through Prisma
- exposing health status
- returning structured error responses

#### Main backend domains

The current backend includes route-domain modules such as:

- auth
- books
- sessions
- backup
- stats
- engagement
- saved views
- shared read-model helpers

#### What the backend does not do

The backend does **not**:

- render frontend UI
- depend on frontend runtime state for security decisions
- bypass Prisma for application persistence logic

#### Operational notes

The backend depends on hosted runtime configuration in Render, including:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV`
- `PORT`
- `CORS_ALLOWED_ORIGINS`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`

### 3. Database

#### Platform

- **Hosted on**: Neon PostgreSQL

#### Responsibilities

The database is responsible for:

- persistent storage
- relational integrity
- durable application data
- user-scoped records
- supporting Prisma-backed application queries and mutations

#### Operational notes

The application does not connect to Neon directly from the browser.

Database access flows through:

- Render backend
- Prisma ORM
- application services/controllers

This ensures database access stays behind authenticated server-side boundaries.

---

## Request Flow

### Browser Request Path

A typical user request follows this path:

**1.** user loads the frontend from Vercel

**2.** frontend initializes client state

**3.** frontend sends API request to the Render backend

**4.** backend validates request and auth context

**5.** backend performs database access through Prisma

**6.** Neon returns the requested data or mutation result

**7.** backend returns structured JSON response

**8.** frontend updates UI state

### Example: authenticated book fetch

```txt
Browser
-> Vercel-served frontend app
-> GET https://render-service/api/books
-> backend validates bearer token
-> Prisma queries PostgreSQL
-> backend returns user-scoped books
-> frontend renders library state
```

### Example: login flow

```txt
Browser
-> Vercel-served frontend app
-> POST https://render-service/api/auth/login
-> backend validates credentials
-> backend signs JWT
-> backend returns token + user payload
-> frontend stores session state
```

---

## Service Boundaries

A core Readr design principle is that each layer should own only the responsibilities appropriate to that layer.

### Frontend boundary

Owns:

- presentation
- interaction
- client state
- API consumption
- session restore behavior

Does not own:

- database access
- authoritative auth enforcement
- security decisions about user ownership

### Backend boundary

Owns:

- request validation
- auth enforcement
- ownership enforcement
- API contracts
- persistence orchestration
- health signaling
- structured operational behavior

Does not own:

- visual rendering
- browser-managed state
- frontend routing concerns

### Database boundary

Owns:

- stored records
- integrity of relational persistence
- durable backing state

Does not own:

- API contract semantics
- browser/session behavior
- deployment routing

These boundaries matter because they make the stack easier to reason about and easier to debug when failures occur.

---

## Environment Responsibilities

One of the most important deployment-hardening lessons in v3.0 is that environment variables are platform-specific responsibilities.

Local `.env` files do not automatically carry into hosted platforms, and frontend and backend variables are not interchangeable.

### Vercel Responsibilities

The frontend deployment requires:

```env
VITE_API_BASE_URL="https://your-render-service.onrender.com"
```

This variable determines where the built frontend sends API requests.

Important:

- backend origin only
- no `/api` suffix
- configured in Vercel, not inherited from local files

### Render Responsibilities

The backend deployment requires values such as:

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

These values define the runtime behavior of the API and must be configured directly in Render.

### Root Prisma Tooling Responsibility

Repository-level Prisma tooling uses:

```env
DATABASE_URL="postgresql://..."
```

This is separate from frontend deployment config and may also be separate from some local backend workflows depending on how the repository is being used.

---

## Local Architecture

Readr supports two local backend workflows.

### Option A — Manual Local Workflow

Typical local arrangement:

```txt
Browser/Vite frontend (localhost:5173)
-> local Express API (localhost:4000)
-> local PostgreSQL or hosted dev
```

This flow is useful when you want direct local control over the backend and database setup.

### Option B — Docker Backend Workflow

Typical local Docker arrangement:

```txt
Browser/Vite frontend (localhost:5173)
-> Dockerized Express backend (localhost:4000)
-> Dockerized PostgreSQL database
```

This flow improves consistency for backend startup and local database orchestration without replacing the hosted production architecture.

### Docker scope

The Docker setup currently covers:

- backend container
- local PostgreSQL container

The frontend remains outside Docker and continues to run through Vite during local development.

---

## Deployment Model

The hosted stack is intentionally split rather than monolithic.

### Why split frontend and backend hosting?

This allows:

- independent frontend and backend deploys
- clearer operational responsibility per layer
- more targeted rollback decisions
- simpler review of environment contracts
- easier debugging of request-path failures

### Why use a managed database?

Using Neon for PostgreSQL reduces the operational burden of self-managing the production database and keeps the project focused on application architecture rather than database infrastructure administration.

---

## Health, Readiness, and Operational Signals

### Backend health

The backend exposes a hosted `/health` endpoint used for:

- startup verification
- release smoke checks
- quick runtime sanity checks
- post-deploy validation

A healthy `/health` response is one of the fastest ways to confirm that the backend is at least minimally operational.

### Frontend verification

The frontend is considered minimally healthy when:

- the deployed app loads
- there is no blank page or fatal boot failure
- static assets load correctly
- initial console output shows no major runtime failures

### End-to-end deployment confidence

A release is not considered healthy based on deployment success alone.

Minimum confidence checks should include:

- frontend load
- backend `/health`
- login
- protected request flow
- logout
- console/network sanity check

---

## Failure Boundaries

One of the advantages of the split architecture is that failures can often be classified by boundary.

### Frontend boundary failures

Examples:

- blank page
- broken asset loading
- wrong frontend env value
- runtime client exception

Typical first checks:

- Vercel deployment status
- browser console
- browser network
- `VITE_API_BASE_URL`

### Backend boundary failures

Examples:

- `/health` fails
- Render startup crash
- missing backend env vars
- API returns server errors

Typical first checks:

- Render logs
- hosted `/health`
- runtime env values
- startup behavior

### Database boundary failures

Examples:

- Prisma connection errors
- protected data requests fail
- startup fails due to DB access
- database credentials/config drift

Typical first checks:

- `DATABASE_URL`
- backend logs
- database availability
- Prisma/runtime error output

### Cross-boundary failures

Examples:

- frontend loads but API requests fail
- CORS issues
- route mismatch
- wrong backend target
- version drift between services

Typical first checks:

- browser network tab
- request URL
- auth headers
- `CORS_ALLOWED_ORIGINS`
- deployment version alignment

---

## Common Reviewer Questions

### Why not connect the frontend directly to the database?

Because that would collapse the security boundary. Auth enforcement, ownership enforcement, validation, and contract control belong in the backend.

### Why not deploy everything on one platform?

A split architecture better reflects real-world deployment boundaries and keeps frontend and backend concerns independently testable and deployable.

### Why is `VITE_API_BASE_URL` origin-only?

Because the frontend appends `/api` internally. Including `/api` in the env value can create malformed request paths.

### Why document environment ownership so explicitly?

Because deployment failures often come from config drift, not application logic. Clear ownership reduces ambiguity and speeds up recovery.

---

## Operational Assumptions

This architecture assumes:

- the frontend always talks to the backend through the configured API base URL
- the backend is the only application layer that talks to the database
- protected data access always requires backend auth enforcement
- hosted config is managed separately per platform
- release safety depends on both CI validation and post-deploy smoke checks
- documented recovery steps are part of the architecture’s maintainability story

---

## Architecture Summary

Readr v3.0 is built on a clear three-layer hosted deployment model:

- **Vercel** serves the frontend
- **Render** runs the backend API
- **Neon** persists PostgreSQL data

Within that model:

- the frontend owns UI and API consumption
- the backend owns auth, validation, business logic, and persistence orchestration
- the database owns durable storage and relational integrity

This separation gives Readr a deployment architecture that is easier to understand, easier to debug, easier to verify during release, and easier to maintain over time.

---

## Related Docs

- [`./troubleshooting-and-recovery.md`](./troubleshooting-and-recovery.md)
- [`../sprints/v3.0/v3.0-release-checklist.md`](../sprints/v3.0/v3.0-release-checklist.md)
- [`../sprints/v3.0/v3.0-deployment-verification-checklist.md`](../sprints/v3.0/v3.0-deployment-verification-checklist.md)
- [`../sprints/v3.0/v3.0-smoke-test-flow.md`](../sprints/v3.0/v3.0-smoke-test-flow.md)
