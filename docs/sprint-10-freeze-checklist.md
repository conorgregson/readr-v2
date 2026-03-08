# Sprint 10 Checklist — Freeze & Stabilization

**Project:** Readr v2.1
**Sprint:** 10
**Objective:** Formally lock the React frontend before API integration begins in **v2.2**.

This sprint verifies that the application is **behaviorally stable, architecturally sound, and release-ready**.

⚠️ **No new features may be introduced during this sprint.**

---

# Sprint 10 Goal

At the end of Sprint 10:

- Tier 0 behavior confirmed through manual audit
- Architecture boundaries verified
- No console warnings
- No dead code or unused exports
- Clean dependency graph
- CI fully green
- Application ready for **v2.1.0 tag**

---

# Execution Order

Sprint 10 tasks should be completed in this order:

1. Tier 0 manual audit
2. Parity gap closure (highlight / autocomplete)
3. Architecture boundary audit
4. Dead code cleanup
5. Console/runtime audit
6. Dependency / type / install verification

---

# 1️) Tier 0 Manual Audit

Verify that all Tier 0 behaviors match **v1.9 behavior**.

---

## Books — Behavior Verification

- [ ] Add book flow works correctly
- [ ] Edit book flow works correctly
- [ ] Cancel edit restores previous values
- [ ] Status transitions update timestamps correctly
- [ ] Undo delete restores correct book
- [ ] Undo finish restores correct status
- [ ] Undo preserves filters + search state
- [ ] Rapid delete + undo cycles remain stable
- [ ] Search results update correctly after edits
- [ ] Filters and search interaction remain deterministic

---

## Books — Search Verification

- [ ] Token splitting works correctly
- [ ] AND semantics enforced
- [ ] Fuzzy matching works as expected
- [ ] Filters applied before search
- [ ] Looser search behavior works correctly
- [ ] Empty vs NoResults logic correct

---

## Books — UI Behavior

- [ ] Highlight rendering consistent
- [ ] Autocomplete suggestions behave correctly (if retained)
- [ ] Inline editing interactions remain stable
- [ ] Rapid edits do not corrupt state

---

## Sessions — CRUD

- [ ] Session creation works
- [ ] Session editing works
- [ ] Session deletion works
- [ ] Undo delete restores exact prior state
- [ ] Rapid add/delete cycles remain stable

---

## Sessions — Sorting

Confirm deterministic sort order:
**date → createdAt → id**

- [ ] Sessions sorted deterministically
- [ ] Undo restore maintains correct ordering

---

## Sessions — Keyboard Navigation

- [ ] ArrowDown moves selection
- [ ] ArrowUp moves selection
- [ ] Home jumps to first row
- [ ] End jumps to last row
- [ ] Escape clears selection
- [ ] No keyboard trap
- [ ] aria-selected state correct

---

## Sessions — Highlighting

- [ ] Search highlights session rows
- [ ] Highlight rendering stable
- [ ] Highlight updates correctly after edits

---

## Rapid Interaction Stability

Stress tests:

- [ ] Rapid keyboard navigation
- [ ] Rapid delete + undo cycles
- [ ] Edit → cancel → re-edit flows
- [ ] Filter switching during edits
- [ ] Rapid search changes

Expected result:

- No crashes
- No state corruption
- No selection desynchronization

---

# 2️) Parity Gap Closure

Resolve remaining Tier 0 dashboard gaps.

---

## Highlight Rendering

- [ ] Highlight behavior matches v1.9
- [ ] Highlights render correctly across search/filter changes
- [ ] Highlight DOM updates remain stable during edits

---

## Autocomplete (If Retained)

One of the following must be true:

- [ ] Autocomplete parity verified
      **OR**
- [ ] Autocomplete formally removed from v2.1 scope

Documentation must reflect the final decision.

---

# 3️) Architecture Boundary Audit

Confirm strict layering discipline.

Architecture rule:
**UI → Store → Service → Persistence**

---

## Component Layer

- [ ] Components do not access persistence directly
- [ ] Components do not call services directly
- [ ] Components only interact with stores

---

## Store Layer

- [ ] Stores are the only write gatekeepers
- [ ] State updates remain deterministic
- [ ] Undo system implemented at store layer

---

## Service Layer

- [ ] Services handle all IO
- [ ] No persistence logic duplicated in stores

---

## Dependency Graph

- [ ] No circular imports
- [ ] No cross-domain leakage (books ↔ sessions)
- [ ] Modules import only from allowed layers

---

# 4️) Dead Code & Cleanup

Remove temporary development artifacts.

---

## Remove

- [ ] Debug console logs
- [ ] Temporary sprint scaffolding
- [ ] Deprecated helpers
- [ ] Unused utilities
- [ ] TODO placeholders
- [ ] Temporary test hacks

---

## Confirm

- [ ] No unused exports
- [ ] No unused files
- [ ] No orphaned imports
- [ ] No leftover dev helpers

---

# 5️) Console & Runtime Audit

Open the browser console during normal usage.

Verify that the console remains clean.

---

## React Warnings

- [ ] No React warnings
- [ ] No controlled/uncontrolled input warnings
- [ ] No state update race warnings

---

## Accessibility

- [ ] No accessibility warnings
- [ ] aria attributes correct
- [ ] Focus management stable

---

## Runtime

- [ ] No hydration mismatches
- [ ] No error boundary triggers
- [ ] No runtime exceptions during normal flows

---

# 6️) Dependency & Type Audit

Verify project stability and reproducibility.

---

## TypeScript

- [ ] Strict typecheck passes
- [ ] No implicit `any`
- [ ] No unused types

---

## ESLint

- [ ] ESLint passes clean
- [ ] No unused variables
- [ ] No rule suppressions hiding real issues

---

## Dependencies

- [ ] No unused dependencies
- [ ] Lockfile stable
- [ ] Clean install works

Test with:

- rm -rf node_modules
- npm install
- npm run build
- npm run test

All steps must pass.

---

# 7️) CI Verification

Sprint 9 CI must remain stable.

Confirm:

- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Unit tests pass
- [ ] Component tests pass
- [ ] CI pipeline runs on push and PR

---

# Release Readiness Review

Before tagging `v2.1.0`:

- [ ] Tier 0 manual audit complete
- [ ] All parity gaps resolved
- [ ] Architecture boundaries verified
- [ ] Console clean
- [ ] Dead code removed
- [ ] Dependencies validated
- [ ] CI fully green
- [ ] No open behavioral bugs

---

# Exit Criteria

Sprint 10 is complete when:

- All checklist items are verified
- Tier 0 parity fully green
- CI remains stable
- No console warnings
- Architecture boundaries respected

At that point:
git tag v2.1.0

This marks the formal completion of the **React frontend rebuild phase**.

---

# Next Phase

After Sprint 10 freeze:

**v2.2 — API Integration**

Local persistence will be replaced with:

- Express API
- Prisma ORM
- PostgreSQL database

The UI should require **minimal or no changes** thanks to the service/store architecture.
