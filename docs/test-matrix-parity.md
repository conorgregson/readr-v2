# Readr v1.4–v1.9 Parity Test Matrix

Unit vs Component vs Manual QA Coverage Plan

> Progress snapshot (as of 2026-02-26)
>
> ✅ Search logic unit coverage: strong (edge cases covered)
>
> ⏳ Still needed for parity lock confidence:
>
> - Highlight rendering → component tests
> - Autocomplete suggestions → unit + component tests
> - Undo timer + restore integrity → unit tests (and some component/QA)
> - Sessions keyboard behavior → component tests + QA

This matrix identifies where each high-risk subsystem
must be validated.

Goal:

- Lock down logic with unit tests.
- Verify DOM behavior with component tests.
- Confirm UX feel via manual QA.

---

# 🔴 Highest Risk: Search System

| Area                        | Unit Test | Component Test | Manual QA |
| --------------------------- | --------- | -------------- | --------- |
| Fuzzy matching              | ✅        | ❌             | ✅        |
| Token splitting             | ✅        | ❌             | ✅        |
| Looser search logic         | ✅        | ✅             | ✅        |
| Search + filter combination | ✅        | ✅             | ✅        |
| Highlight rendering         | ❌        | ✅             | ✅        |
| Autocomplete suggestions    | ✅        | ✅             | ✅        |

Notes:

- Unit tests must include typo + multi-token cases.
- Manual QA should simulate fast typing + rapid clearing.

---

# 🔴 Highest Risk: Undo System

| Area                           | Unit Test | Component Test | Manual QA |
| ------------------------------ | --------- | -------------- | --------- |
| Undo timer window              | ✅        | ❌             | ✅        |
| Object restoration integrity   | ✅        | ❌             | ✅        |
| Undo with active filters       | ✅        | ✅             | ✅        |
| Undo persistence after refresh | ✅        | ❌             | ✅        |

Notes:

- Include deep equality checks.
- Confirm no partial rollback states.

---

# 🔴 Highest Risk: Sessions History + Keyboard Nav

| Area                      | Unit Test | Component Test | Manual QA |
| ------------------------- | --------- | -------------- | --------- |
| Sorting determinism       | ✅        | ❌             | ❌        |
| Row navigation state      | ✅        | ❌             | ❌        |
| Arrow/Home/End behavior   | ❌        | ✅             | ✅        |
| Live region updates       | ❌        | ✅             | ✅        |
| Note truncation + tooltip | ❌        | ✅             | ✅        |

Notes:

- Keyboard tests should simulate key events.
- Manual QA should test long lists.

---

# 🔴 Highest Risk: Analytics / Charts

| Area                               | Unit Test | Component Test | Manual QA |
| ---------------------------------- | --------- | -------------- | --------- |
| Percent change math                | ✅        | ❌             | ❌        |
| Streak calculation                 | ✅        | ❌             | ❌        |
| Chart data derivation              | ✅        | ❌             | ❌        |
| Theme persistence                  | ✅        | ✅             | ✅        |
| Auto-update after session mutation | ✅        | ✅             | ✅        |

Notes:

- Lock math logic early.
- Charts should not flicker during updates.

---

# 🟠 Medium Risk: Bulk Edit

| Area                          | Unit Test | Component Test | Manual QA |
| ----------------------------- | --------- | -------------- | --------- |
| Multi-update integrity        | ✅        | ❌             | ❌        |
| Bulk edit with active filters | ✅        | ✅             | ✅        |
| Bulk edit + undo interaction  | ✅        | ❌             | ✅        |

---

# 🟠 Medium Risk: Import / Export

| Area                      | Unit Test | Component Test | Manual QA |
| ------------------------- | --------- | -------------- | --------- |
| JSON schema validation    | ✅        | ❌             | ❌        |
| Safe merge & dedupe       | ✅        | ❌             | ❌        |
| Malformed import error UI | ❌        | ✅             | ✅        |
| Export shape matches v1.9 | ✅        | ❌             | ✅        |

Notes:

- Include snapshot-style tests for export structure.

---

# 🟡 Lower Risk: Basic CRUD

| Area             | Unit Test | Component Test | Manual QA |
| ---------------- | --------- | -------------- | --------- |
| Add book         | ✅        | ✅             | ✅        |
| Edit book        | ✅        | ✅             | ✅        |
| Delete book      | ✅        | ❌             | ✅        |
| Validation rules | ✅        | ✅             | ✅        |

---

# CI Baseline Requirements (Sprint 7)

Before enabling CI badge:

- [ ] Search logic unit tests
- [ ] Undo unit tests
- [ ] Sessions sort unit tests
- [ ] At least one keyboard interaction component test
- [ ] Import validation test
- [ ] One intentional failure test proving regression detection

---

# Testing Strategy Rule

Logic errors → Unit test
DOM behavior → Component test
UX feel + keyboard realism → Manual QA

All three layers are required for parity confidence.
