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

## 🌐 Version 2.2 — API Integration & Persistence

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

- v2.2 is a **persistence migration**, not a UX redesign.
- The React UI should remain materially unchanged.
- Frontend domain types from v2.1 are treated as the canonical contract.

Planned: Q2 2026

---

## 🔑 Version 2.3 — Authentication & Accounts

**Focus:** Introduce user identity and secure multi-user data boundaries without compromising architectural simplicity.

### Planned Work

- User accounts (JWT or OAuth)
- Per-user data scoping
- Secured API routes
- Token storage strategy documented
- Account-aware import/export

Planned: Q2 2026

---

## 🎖️ Version 2.4 — Badge System Overhaul

**Focus:** Move gamification logic server-side and make badges scalable

### Planned Work

- Badge definitions and progress tracking in DB
- Server-side evaluation engine
- Tiered badge system
- Accessible UI with progress indicators
- Snapshot and stats integration

Planned: TBD

---

## 🌍 Version 3.0 — Deployment & Growth

**Focus:** Transition Readr from a local development project into a production-ready, publicly accessible application.

### Planned Work

- Cloud deployment (frontend + backend)
- CI/CD pipeline
- Public demo environment
- Environment-based configuration

Planned: TBD

---

## 🔮 Long-Term Ideas

These are intentionally de-scoped from near-term planning:

- Team / group reading spaces
- Public profiles and challenges
- External API integrations (e.g., Goodreads)
- Advanced exports (Markdown, PDF, Notion)
- Custom fields and templates
- AI-assisted reading insights (opt-in only)

---

## Contributing

- Check open issues ofr active discussions.
- Suggest new features via the feature request template.
- This roadmap evolves alongside real-world usage and feedback.
