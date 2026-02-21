# Roadmap

This roadmap outlines the development priorities for **Readr**.
It documents both historical progress (v1.x) and the forward-looking evolution toward a scalable, full-stack application (v2+).

---

## 🧭 Roadmap Philosophy

Readr is developed in clearly scoped, versioned milestones.
Each release isolates a specific risk area (architecture, UX, performance, persistence, or scale) before layering additional features.

The roadmap prioritizes:
- Feature parity before rewrites
- Accessibility and performance by default
- Maintainable architecture over premature complexity

This roadmap is both a planning tool and a historical record — documenting *why* decisions were made, not just *what* was built.

---

## 🎯 Goals

- Provide a minimal, offline-first reading log (v1.x).
- Evolve into a scalable full-stack application with cloud sync (v2.x).
- Maintain usability, accessibility, and performance at every stage.
- Avoid premature complexity while building a strong architectural foundation.

---

## 📌 Milestones

---

## 🧱 Legacy Roadmap (v1.x)

The sections below document the complete development history of **Readr v1**
(vanilla JavaScript, offline-first, single-user).

v1.x is feature-complete and in maintenance mode.

---

### ✅ Version 1.0 — Core MVP Release
*(unchanged — retained as historical record)*

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

## 🚀 Version 2.0 — Fullstack Foundation

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

## 🚧 Version 2.1 — React Frontend (In Progress)

**Focus:** Frontend rebuild while preserving v1.9 behavior

### Goals

- Rebuild the v1.9 UI in React + TypeScript
- Preserve feature parity before introducing API-backed persistence
- Establish a clean component and state architecture

### Planned Work

- React app scaffolding and routing (Vite)
- Tailwind-based design system
- Core layout and navigation
- Book list, filters, and search UI
- Add/edit book flows
- Session logging and history (frontend-only)
- Centralized state management
- Error, loading, and empty-state patterns
- Initial frontend test coverage + CI

Planned: Q1 2026

---

## 🌐 Version 2.2 — API Integration & Persistence

**Focus:** Replace local storage with API-backed persistence

### Planned Work

- Connect React frontend to existing API
- CRUD flows for books and sessions
- Server-side search, filters, and pagination
- Import/export via API
- Shared validation schemas (Zod)
- Security baseline (CORS, Helmet, rate limiting)
- Logging and centralized error handling

Planned: Q1–Q2 2026

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

## 🤝 Contributing

- Check open issues ofr active discussions.
- Suggest new features via the feature request template.
- This roadmap evolves alongside real-world usage and feedback.
