# Troubleshooting & Recovery — Readr v3.0

This guide documents the most common deployment, environment, runtime, and connectivity problems that may appear in Readr’s hosted or local workflows.

Its purpose is to make failures easier to diagnose, safer to recover from, and faster to resolve without relying on memory or ad hoc debugging.

---

## Scope

This guide covers:

- frontend deployment issues
- backend deployment issues
- environment variable misconfiguration
- frontend ↔ backend communication failures
- backend ↔ database connectivity failures
- auth/session issues
- release smoke-test failures
- rollback and recovery steps

It is written for the current Readr v3.0 architecture:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL
- **Local backend workflow:** traditional local setup or Docker Compose

---

## Quick Triage

When something breaks, identify the failure boundary first.

### 1. Is the frontend loading?

Check whether:

- the deployed Vercel app loads
- the app renders instead of showing a blank page
- browser console shows fatal boot errors
- static assets load successfully

If the frontend does not load at all, start with **Frontend Failures**.

### 2. Is the backend healthy?

Open the hosted `/health` endpoint and confirm it returns a healthy response.

If `/health` fails, start with **Backend Startup / Runtime Failures**.

### 3. Is frontend ↔ backend communication working?

If the frontend loads but actions fail:

- open browser devtools
- inspect Network
- inspect Console
- confirm requests are reaching the expected backend origin

If requests fail, start with **Frontend ↔ Backend Request Failures**.

### 4. Is the database reachable?

If the backend is running but protected routes or data endpoints fail, inspect backend logs for database connection errors.

If database connectivity is the issue, go to **Database Connectivity Failures**.

### 5. Is auth specifically failing?

If login, logout, token restore, or protected routes are failing while the app otherwise loads, go to **Authentication & Session Failures**.

---

## Known Good Baseline

Before deeper debugging, compare the system against the expected deployment contract.

### Production

- frontend deployed on **Vercel**
- backend deployed on **Render**
- database hosted on **Neon**
- frontend uses `VITE_API_BASE_URL`
- frontend appends `/api` internally
- backend requires `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ALLOWED_ORIGINS`, and auth rate-limit settings
- hosted `/health` should return success
- login, logout, and protected requests should work end to end

### Local

- frontend typically runs on `http://localhost:5173`
- backend typically runs on `http://localhost:4000`
- frontend `VITE_API_BASE_URL` should be the backend origin only
- local backend may run either manually or through Docker Compose

---

## Frontend Failures

### Symptoms

- blank page on load
- fatal boot failure
- white screen
- static assets fail to load
- console shows immediate runtime errors
- the app loads but never becomes interactive

### Checks

#### Confirm the deployment completed successfully

In Vercel, verify:

- the latest deployment finished without errors
- the intended branch/commit was deployed
- environment variables were available to the build

#### Check browser console

Look for:

- missing environment-driven values
- invalid API base URL behavior
- failed module/script loading
- runtime exceptions during boot
- hydration or rendering errors

#### Check Network on initial load

Look for:

- failed JS or CSS asset requests
- failed startup API requests
- requests pointed at the wrong origin

### Common causes

#### `VITE_API_BASE_URL` is missing or wrong

The frontend requires the backend origin only.

Correct:

```env
VITE_API_BASE_URL="https://your-render-service.onrender.com"
```

Incorrect:

```env
VITE_API_BASE_URL="https://your-render-service.onrender.com/api"
```

Because the client appends `/api` internally, including `/api` in the env value can produce broken request paths.

#### Production build succeeded with stale config

A deployment can appear successful while still targeting the wrong backend if the build picked up an outdated environment variable value.

Always confirm the deployed frontend is talking to the intended backend.

#### Broken asset delivery

If the app fails before any API call occurs, check whether Vercel is serving all generated assets correctly.

### Recovery steps

**1.** confirm the correct commit was deployed

**2.** confirm `VITE_API_BASE_URL` is correct in Vercel

**3.** redeploy frontend if the variable was corrected

**4.** verify the app loads with no fatal console errors

**5.** verify initial API requests point to the expected backend

---

## Backend Startup / Runtime Failures

### Symptoms

- hosted `/health` fails
- Render deploy finishes unsuccessfully
- backend starts and immediately crashes
- backend deploy logs show startup failure
- frontend loads but every API request fails due to backend unavailability

### Checks

#### Inspect Render deploy logs

Look for:

- missing environment variables
- Prisma startup issues
- database connection failures
- runtime exceptions during boot
- port binding problems

#### Check `/health`

Open the hosted health endpoint directly.

Expected result:

- success response
- no repeated crash/restart behavior
- health remains stable a few minutes after startup

#### Confirm backend env variables

Render should have valid values for:

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

### Common causes

#### Missing `DATABASE_URL`

The backend may boot partially or fail immediately depending on where the missing configuration is used.

#### Missing or invalid `JWT_SECRET`

This often causes auth-related failures even when non-auth routes appear normal.

#### Bad `CORS_ALLOWED_ORIGINS`

A bad CORS config may not always break `/health`, but it can break browser-based API use from the frontend.

#### Production-only config drift

The local app may work while Render fails because local .env files do not carry into hosted environments automatically.

### Recovery steps

**1.** inspect Render logs

**2.** confirm required env vars are present and correctly named

**3.** verify `/health`

**4.** redeploy after config fixes

**5.** re-run smoke checks after the backend is healthy

---

## Frontend ↔ Backend Request Failures

### Symptoms

- frontend loads, but login or data requests fail
- `401`, `403`, `404`, or CORS errors appear in browser Network
- requests go to the wrong backend
- the app appears stuck in loading/error states

### Checks

#### Inspect browser Network

For failing requests, confirm:

- request URL is correct
- request method is correct
- response status is expected
- request is reaching the intended Render backend
- no duplicated `/api/api` path exists
- auth header exists where required

#### Inspect browser Console

Look for:

- CORS errors
- fetch failures
- failed preflight requests
- frontend-side parsing/runtime errors

### Common causes

#### Wrong API base URL

Most common symptom:

- requests point to the wrong backend
- or requests include malformed path composition

#### CORS misconfiguration

If the backend does not include the deployed Vercel origin in `CORS_ALLOWED_ORIGINS`, requests from the browser can fail even though `/health` looks fine.

#### Route mismatch

A frontend route or service may call an endpoint path that no longer matches the backend contract.

#### Stale deployment

Frontend and backend may be on different expected versions briefly after partial deployment.

### Recovery steps

**1.** verify request URL in Network

**2.** verify deployed frontend env value

**3.** verify Render `CORS_ALLOWED_ORIGINS`

**4.** verify backend route exists and matches frontend service expectations

**5.** redeploy affected service if versions are out of sync

---

## Database Connectivity Failures

### Symptoms

- backend deploy logs show database connection errors
- protected routes return server errors
- Prisma operations fail
- `/health` fails if DB access is part of readiness
- startup hangs or becomes unstable

### Checks

#### Inspect backend logs for Prisma/database errors

Look for messages related to:

- connection refused
- authentication failed
- SSL requirements
- invalid connection string
- timeouts
- unavailable database host

#### Verify `DATABASE_URL`

Confirm that:

- the value exists
- credentials are valid
- host is correct
- database name is correct
- SSL requirements are correct for Neon

#### Compare local vs production assumptions

A local connection string may work differently than Neon production configuration.

### Common causes

#### Invalid database URL

Incorrect credentials, wrong host, wrong database, or bad formatting can break Prisma and route behavior.

#### Database provider issue or temporary availability problem

If Neon is degraded or temporarily unreachable, Render may start but fail when database-backed requests are made.

#### Environment mismatch

The backend may be pointed at a stale or unintended database.

### Recovery steps

**1.** verify `DATABASE_URL` in Render

**2.** inspect logs for the exact connection failure type

**3.** confirm database provider availability

**4.** redeploy after correction if config changed

**5.** verify `/health` and a protected DB-backed route afterward

---

## Authentication & Session Failures

### Symptoms

- login fails unexpectedly
- logout does not clear - session correctly
  protected routes return `401`
- token restore fails after refresh
- authenticated requests fail despite successful login

### Checks

#### Verify login request/response

In browser Network, inspect:

- request body shape
- response status
- whether token/user payload is returned as expected

#### Verify token storage / restore flow

Check whether:

- token is stored after login
- authenticated requests include `Authorization: Bearer <token>`
- token restore happens on reload
- logout clears auth state

#### Check backend auth errors

Inspect backend logs for:

- malformed bearer token
- invalid signature
- expired token
- missing auth header
- rejected payload shape

### Common causes

#### Invalid or changed `JWT_SECRET`

Tokens signed under a previous secret become invalid if the secret changes.

#### Expired tokens

Expected behavior if token lifetime has elapsed.

#### Missing auth header

A frontend regression or service issue may cause protected calls to omit the bearer token.

Mixed deployment versions

Frontend auth expectations and backend auth contract may temporarily diverge after partial deployment.

### Recovery steps

**1.** inspect login response

**2.** inspect authenticated request headers

**3.** verify current `JWT_SECRET` in Render

**4.** clear session locally and log in again

**5.** redeploy if frontend/backend auth contract drift is suspected

---

### Environment Misconfiguration

#### Symptoms

- local works, hosted fails
- CI passes, deploy fails
- frontend loads but cannot talk to backend
- backend boots but auth or DB behavior is broken
- behavior differs unexpectedly across environments

### Checklist

#### Frontend

- `VITE_API_BASE_URL` exists
- value is backend origin only
- value does not include `/api`

#### Backend

- `DATABASE_URL` exists
- `JWT_SECRET` exists
- `JWT_EXPIRES_IN` exists
- `PORT` exists if runtime expects it
- `CORS_ALLOWED_ORIGINS` includes deployed frontend origin
- auth rate-limit variables exist

#### Test / CI

- test DB config is separate from local dev config
- CI env assumptions match actual scripts

### Common causes

- stale variable names
- variable exists locally but not in hosted environment
- wrong value copied between environments
- integration-managed variables create confusion but are not actually active runtime inputs
- env change was made but service was not redeployed

### Recovery steps

**1.** compare actual environment values against the documented contract

**2.** correct the wrong or missing value

**3.** redeploy affected service

]**4.** verify `/health`

**5.** verify smoke-test flow end to end

---

## Docker Local Workflow Failures

### Symptoms

- `docker compose up` fails
- backend container starts but API is unreachable
- Prisma generation fails in container
- DB connection from backend container fails
- local health check fails

### Checks

#### Confirm containers started

Run:

```bash
docker compose up
```

Check whether:

- database container starts
- backend container starts
- backend remains running instead of exiting immediately

#### Inspect container logs

Look for:

- missing env vars
- Prisma errors
- port binding issues
- DB connection failures

#### Verify backend health locally

Open:

```env
http://localhost:4000/health
```

### Common causes

#### Bad container `DATABASE_URL`

Containerized backend must use the container host/service name, not localhost.

Typical example:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/readr_v3?schema=public"
```

#### Volume/data drift

A stale local DB volume may preserve unexpected state.

### Recovery steps

**1.** rebuild containers if config changed

```bash docker compose build --no-cache
docker compose up
```

**2.** stop containers if needed

```bash
docker compose down
```

**3.** wipe local DB volume only if intentionally resetting state

```bash
docker compose down -v
```

---

## Smoke-Test Failures After Deploy

If deployment completes but smoke checks fail, use this sequence.

### Minimum smoke checks

- frontend loads
- `/health` is healthy
- no fatal console errors
- login works
- protected request succeeds
- logout works

### Failure classification

#### Frontend fails before auth

Likely frontend deploy/config/asset issue.

#### `/health` fails

Likely backend startup or environment issue.

#### Login fails but `/health` passes

Likely auth contract, env, or frontend ↔ backend request issue.

#### Protected routes fail after login

Likely token/header/session issue or backend auth enforcement issue.

#### Core data request fails

Likely database connectivity or route mismatch issue.

### Recovery steps

**1.** identify the first failing step

**2.** capture console, network request, or backend log evidence

**3.** classify the problem by boundary

**4.** determine whether it is release-blocking

**5.** fix or rollback

**6.** re-run full smoke flow afterward

---

## Rollback & Recovery Checklist

Use this when a deployment is unhealthy or release verification fails.

### 1. Classify the failure

Decide whether the issue is primarily:

- frontend
- backend
- auth
- env/config
- database
- routing/version mismatch

### 2. Decide whether rollback is required

Rollback is appropriate when:

- the deployed app is materially broken
- login/protected use is failing
- health checks are unstable
- environment misconfiguration cannot be corrected safely in-place fast enough
- smoke checks indicate a release-blocking regression

### 3. Restore last known good version

Depending on the failure:

- redeploy the last known good frontend deployment
- redeploy the last known good backend deployment
- revert the breaking merge/commit if needed
- restore correct hosted env configuration if config drift caused the issue

### 4. Re-verify after rollback

After rollback or recovery:

- confirm frontend loads
- confirm `/health` is healthy
- confirm login works
- confirm protected routes work
- confirm logout works
- confirm no major console/network failures remain

### 5. Document the cause before retrying

Before attempting a new deploy, record:

- what failed
- where it failed
- root cause if known
- config or code change applied
- whether rollback or redeploy resolved it

---

## Safe Recovery Principles

When recovering from a bad deploy:

- change one thing at a time - when possible
- verify the smallest meaningful boundary first
- do not assume local success means hosted success
- do not rely on remembered env values; inspect actual deployed config
- prefer evidence from logs, browser Network, and `/health` over guesswork
- re-run smoke checks after every meaningful fix
- record what happened so the issue is easier to prevent next time

---

## Recommended Verification Order After Any Fix

After a config change, redeploy, or rollback, verify in this order:

**1.** backend `/health`

**2.** deployed frontend load

**3.** browser console/network on initial load

**4.** login

**5.** protected request / authenticated route

**6.** logout

**7.** one additional core data flow if relevant

This order isolates failures quickly and avoids wasting time deep in the UI before basic deployment health is confirmed.

---

## Related Docs

- [`../sprints/v3.0/v3.0-release-checklist.md`](../sprints/v3.0/v3.0-release-checklist.md)
- [`../sprints/v3.0/v3.0-deployment-verification-checklist.md`](../sprints/v3.0/v3.0-deployment-verification-checklist.md)
- [`../sprints/v3.0/v3.0-smoke-test-flow.md`](../sprints/v3.0/v3.0-smoke-test-flow.md)
- [`./architecture.md`](./architecture.md)

---

## Recovery Record Template

Use this short template when documenting a deploy issue.

```md
### Incident Summary

- Environment:
- Date / time:
- Reported symptom:
- First failing check:
- Affected boundary:
- Severity:

### Evidence

- Frontend URL:
- Backend health URL:
- Console findings:
- Network findings:
- Backend log findings:

### Root Cause

Describe the underlying reason the issue happened.

Examples:

- Vercel frontend was deployed with an outdated `VITE_API_BASE_URL`
- Render backend was missing `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS` did not include the deployed frontend origin
- backend was pointed at an invalid `DATABASE_URL`
- frontend and backend were temporarily out of sync after partial deployment

### Fix Applied

Describe the specific action taken to resolve the issue.

Examples:

- updated `VITE_API_BASE_URL` in Vercel and redeployed the frontend
- added the missing `JWT_SECRET` in Render and redeployed the backend
- corrected `CORS_ALLOWED_ORIGINS` and re-ran smoke checks
- fixed the production `DATABASE_URL` and confirmed `/health` recovered
- redeployed the last known good backend version to restore service

### Verification After Fix

- [ ] `/health` healthy
- [ ] frontend loads
- [ ] login works
- [ ] protected flow works
- [ ] logout works

### Follow-Up Prevention

Examples:

- add the missing variable to `.env.example`
- update the release checklist
- add a CI validation step for env completeness
- document the failure pattern in the troubleshooting guide
```
