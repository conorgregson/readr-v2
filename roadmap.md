# Roadmap

This roadmap documents the evolution of **Readr** from a minimal offline-first reading tracker (v1.x) into a scalable, full-stack application (v2+).

It captures both historical milestones and forward-looking architectural decisions.

---

## Philosophy

Readr is developed in clearly scoped, versioned milestones.

Each release isolates a primary risk area — architecture, UX, persistence, performance, or scale — before layering additional complexity.

Core principles:

- Feature parity before rewrites
- Accessibility and performance by default
- Maintainable architecture over premature abstraction
- Incremental, testable progress

This roadmap is both a planning document and a technical narrative explaining _why_ decisions were made.

---

## Goals

- Provide a minimal, offline-first reading log (v1.x).
- Evolve into a scalable full-stack application with API-backed persistence first, then cloud-ready user features (v2.x).
- Maintain usability, accessibility, and performance at every stage.
- Avoid premature complexity while building a strong architectural foundation.

---

## Milestones

---

## 🧱 Legacy Roadmap (v1.x)

The sections below document the complete development history of **Readr v1**
(vanilla JavaScript, offline-first, single-user).

v1.x is feature-complete and in maintenance mode.

---

### ✅ Version 1.0 — Core MVP Release

_(unchanged — retained as historical record)_

Released: Sep 2025

---

### ✅ Version 1.1 — Usability & Goals Update

Released: Sep 2025

---

### ✅ Version 1.2 — Branding & PWA Polish

Released: Sep 2025

---

### ✅ Version 1.3 — Header & Accessibility Refresh

Released: Sep 2025

---

### ✅ Version 1.4 — Power-User Features

Released: Sep 2025

---

### ✅ Version 1.5 — Book Enhancements

Released: Sep 2025

---

### ✅ Version 1.6 — Search & Filters

Released: Oct 2025

---

### ✅ Version 1.7 — Goals & Layout Polish

Released: Nov 2025

---

### ✅ Version 1.8 — Sessions & History

Released: Dec 2025

---

### ✅ Version 1.9 — Visualization & Motivation

Released: Dec 2025

---

## ✅ Version 2.0 — Fullstack Foundation

**Focus:** Establish the technical foundation for Readr v2

### Scope

- Express + TypeScript backend
- PostgreSQL database with Prisma ORM
- Modular API architecture
- CI with automated API tests and health checks
- Clean server lifecycle handling (local + CI)
- Dockerized local database setup

### Notes

- No v2 frontend features are included in this release.
- v2.0.0 exists to de-risk future frontend and API work by locking in a stable backend baseline.

Released: Dec 2025

---

## ✅ Version 2.1 — React Frontend Rebuild

**Focus:** Rebuild the v1.9 UI in React + TypeScript while preserving feature parity before API-backed persistence.

### Completed Work

- React + TypeScript frontend rebuild
- Tailwind-based UI system and routing
- Books CRUD + search/filter parity
- Undo delete + undo finish
- Search highlighting + autosuggest
- Sessions logging + history
- Deterministic sorting + keyboard navigation
- Accessibility and focus hardening
- Frontend test baseline + CI
- Freeze validation and dead-code cleanup

### Notes

- v2.1 is complete and formally frozen.
- Persistence remains local-first for this release.
- v2.2 will replace local storage with API-backed persistence.

Released: Mar 2026

---

## ✅ Version 2.2 — API Integration & Persistence

**Focus:** Replace local-first persistence with API-backed storage while preserving the v2.1 React UI and behavioral parity guarantees.

### Planned Work

- Reconcile the v2.0 backend scaffold with the finalized v2.1 frontend domain types
- Update Prisma schema to match canonical frontend models
- Stabilize Books and Sessions API contracts
- Introduce typed client API services
- Migrate frontend persistence from localStorage to API-backed storage
- Preserve parity-sensitive behaviors (undo, deterministic sorting, keyboard flows)
- Remove active localStorage persistence from Books and Sessions flows
- Strengthen server baseline (CORS, Helmet, centralized error handling)
- Re-run parity validation after migration

### Notes

- v2.2 is a persistence migration, not a UX redesign.
- The React UI should remain materially unchanged.
- Frontend domain types from v2.1 are treated as the canonical contract.
- A client-only demo is already deployed via Vercel; v2.2 will connect the UI to the API layer.

Released: Mar 2026

---

## ✅ Version 2.3 — Identity & Data Ownership

**Focus:** Introduced user identity and enforced strict per-user data boundaries across the system.

### Completed Work

- Added user model and JWT-based authentication
- Implemented secure password handling with hashed credentials
- Added auth middleware for protected routes
- Enforced per-user ownership for books and sessions
- Added token-aware frontend auth layer
- Implemented session persistence and auth restore flow
- Added safe bulk import/export with ownership enforcement
- Added security hardening for authentication flows
- Added basic rate limiting for auth write endpoints

### Notes

- v2.3 completed the transition from single-user architecture to user-owned data architecture.
- Data isolation is now treated as a first-class invariant across the API and persistence layers.
- Authentication remains intentionally minimal and implementation-focused.
- Register/login endpoints now return structured rate-limit responses when abuse thresholds are exceeded.

Released: Mar 2026

---

## ✅ Version 2.4 — Engagement & Insights Expansion

**Focus:** Reintroduce advanced UX and motivation systems on top of the stable API-backed, user-owned architecture.

### Completed Work

- Added bulk edit workflows for multi-book mutation
- Added grouped Undo support for batch operations
- Added saved views with server-backed filter persistence
- Introduced server-derived reading statistics and summaries
- Added streak tracking and badge progression
- Added reading goals and progress surfaces
- Added dashboard insights and chart-based visualizations
- Preserved CRUD correctness, accessibility, and performance through Sprint 5 hardening

### Notes

- v2.4 is a controlled feature-layering release, not an architectural migration.
- Derived engagement data is computed server-side where correctness matters.
- Bulk operations preserve integrity, atomicity, and grouped Undo guarantees.
- Sprint 5 completed accessibility, recovery, and regression hardening across the release surface.
- Social, public, and multi-user collaborative features remain out of scope for this phase.

Released: Apr 2026

---

## ✅ Version 3.0 — Deployment & Growth

**Focus:** Hardened Readr’s deployed stack for stronger reliability, consistency, release safety, and production maturity.

### Completed Work

- Audited and documented the hosted **Vercel + Render + Neon** architecture
- Standardized deployment-facing environment documentation across frontend, backend, and Prisma tooling
- Removed deployment ambiguity around environment ownership and request flow
- Added backend containerization and Docker Compose support for local backend + database workflows
- Improved local environment consistency and repeatability
- Strengthened release confidence with health-check validation and deploy-readiness workflow improvements
- Added release support docs including:
  - deployment architecture documentation
  - troubleshooting and recovery guidance
  - release checklist
  - deployment verification checklist
  - smoke-test flow
- Rewrote the README into a release-ready v3.0 overview covering:
  - hosted architecture
  - service boundaries
  - local development workflow
  - Docker workflow
  - environment setup responsibilities
  - testing / CI overview
  - operational docs references
- Verified production deployment successfully through CI and hosted smoke validation

### Notes

- v3.0 is a deployment-hardening and release-maturity milestone, not a major product-surface expansion.
- The hosted stack remains intentionally practical:
  - **Frontend:** Vercel
  - **Backend:** Render
  - **Database:** Neon PostgreSQL
  - **Local containerization:** Docker + Docker Compose
- This release focused on making the current stack easier to run, easier to ship, easier to debug, and easier to understand.
- Final validation confirmed:
  - CI passed
  - deployed frontend loaded successfully
  - hosted `/health` returned healthy
  - login and logout worked
  - protected authenticated flows worked across books, sessions, stats, saved views, and book mutation
  - no obvious console or network failures appeared during the recorded smoke pass

Released: Apr 2026

---

## 🌐 Version 3.1 — Account & Profile Management

**Focus:** Expand Readr’s identity layer into a fuller account platform with profile customization, account recovery, and stronger security controls.

### Planned Work

- Password reset / forgot password flow
- Change email and password
- Delete account
- Reset profile / clear all user data
- Display name and profile customization
- Avatar system and optional profile photo upload
- Sign in with Google
- Two-step authentication

### Notes

- v3.1 builds on the more stable deployment, release, and operational foundation established in v3.0.
- This release is about account lifecycle maturity, not social features.
- Security and account recovery should be stable before adding broader community features.

Planned: Q2 2026

---

## 📚 Version 3.2 — Library Organization & Metadata

**Focus:** Make Readr feel more like a complete personal library by improving organization, metadata structure, and bulk management.

### Planned Work

- Collections / shelves for books
- Tags for books
- Favorite genres, authors, and books
- Genre dropdown from existing values
- Multi-genre support per book
- Bulk edit for genre, series, series type, format, and subtype
- Total books count and richer library summaries
- Add/edit start and finish dates for books read in the past

### Notes

- v3.2 deepens library organization without changing the core product direction.
- This release should make metadata more structured and reusable across filters, recommendations, and future discovery features.
- Collections and tags should be designed to scale cleanly into future social and recommendation systems.

Planned: Q2 2026

---

## 🎯 Version 3.3 — Reviews, History & Rereads

**Focus:** Improve how Readr represents real reading history over time, including rereads, reviews, and retrospective logging.

### Planned Work

- Book ratings
- Written reviews
- Better support for historical reading entries
- Add start/finish dates for previously completed books
- Reread support without requiring duplicate book records
- Richer completion history and per-book reading timelines

### Notes

- v3.3 is an important model-layer upgrade, not just UI polish.
- Reread support should preserve analytics integrity while avoiding duplicate-library clutter.
- Reviews and history features will create stronger inputs for future recommendation systems.

Planned: Q3 2026

---

## 🤝 Version 3.4 — Social & Community Features

**Focus:** Introduce optional reader-to-reader features that allow connection, shared experiences, and group reading workflows.

### Planned Work

- Friends / connections
- Book club support
- Group reading sessions
- Book-club discussion or chat spaces
- Shared activity surfaces
- Seasonal or community-based badges

### Notes

- v3.4 marks a major product expansion beyond single-user reading management.
- Social systems should come only after account, metadata, and reading-history models are mature.
- Messaging and group activity should be scoped carefully to avoid unnecessary moderation and complexity too early.

Planned: TBD

---

## 🤖 Version 3.5 — Discovery & Recommendations

**Focus:** Help users discover books more effectively through personalization, richer metadata, and recommendation systems.

### Planned Work

- Personalized recommendations based on genre, author, favorites, and reading history
- Recommendation explanations
- External books API integration
- Metadata autofill and book lookup
- Discovery flows based on past reading behavior
- Recommendation surfaces tied to shelves, tags, and reviews

### Notes

- v3.5 depends on strong metadata and reading-history signals from earlier releases.
- External API integrations should improve convenience without making the product dependent on a single provider.
- Recommendation quality will improve substantially once ratings, favorites, and reread history exist.

Planned: TBD

---

## 📱 Version 3.6 — Mobile & App Experience

**Focus:** Refine Readr into a stronger cross-device product with a more polished mobile and app-like experience.

### Planned Work

- Improved mobile UX and layout
- Mobile-specific interaction refinements
- Downloadable desktop/mobile app experience
- Better install flows and app-shell polish
- More robust device-aware behaviors
- Future support for richer app notifications and mobile workflows

### Notes

- v3.6 is about product polish and usability across devices, not core domain expansion.
- This release should build on the stable feature set from earlier 3.x versions rather than introducing major new product models.
- The goal is to make frequent daily use feel smoother and more native-like.

Planned: TBD

---

## 🔮 Long-Term Ideas

These are intentionally de-scoped from near-term planning:

- Author pages and series progress tracking
- DNF / abandoned-book support
- Book cover upload and metadata enrichment
- Year in Review and monthly recap experiences
- Quote / highlight saving
- Reading pace forecasting
- Privacy controls for future public/social features
- Notification center / inbox
- Admin / moderation tools for groups and chat
- Data portability and compliance tooling
