# Sprint 1 Blueprint — React Foundation

**Readr v2.1**

Objective:
Boot a stable React app that matches Readr structurally:

- Routes exist and persist
- Layout is consistent across navigation
- Tailwind + base theme is in place
- Shared UI primitives exist (minimal set)

No domain data yet.
No persistence logic yet.
This sprint is about a reliable runway.

---

## Sprint 1 Goal

At the end of Sprint 1:

- App runs cleanly with Vite + React + TypeScript
- Routes render page shells: /, /sessions, /settings
- AppShell provides persistent navigation + outlet
- Tailwind is configured and base styling matches Readr direction
- Core shared UI primitives exist and are usable

---

## Guardrails

- No domain logic (books/sessions) beyond placeholders
- No “feature building” yet
- No premature optimization
- No refactors unless they remove friction

---

## Scope

### Setup

- Vite + React + TS project stable
- Basic project scripts usable (dev/build/preview)
- Hot reload reliable (no layout resets on route change)

### Routing

- React Router configured:
  - `/` → Books page shell
  - `/sessions` → Sessions page shell
  - `/settings` → Settings page shell
- Navigation works with no full reloads

### Layout

- AppShell includes:
  - header + nav links
  - outlet for route content
- Layout does not remount/reset on route changes

### Tailwind + base theme

- Tailwind configured and applied
- Base layout spacing and typography consistent

### Shared UI primitives (minimum)

- Button
- Input
- Card
  (Optional: Select, Spinner if quick)

---

## Deliverable

- Navigable app with consistent shells for all routes
- Shared UI components imported and usable

---

## Tests

None required in Sprint 1 (optional smoke test only).

---

## Exit Criteria

- No console errors
- Hot reload stable
- Route navigation does not reset the layout
- Shared UI primitives render correctly
- Repo remains clean and documented
