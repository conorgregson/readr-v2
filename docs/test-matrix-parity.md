# Readr v2.1 — Parity Test Matrix

Unit vs Component vs Manual QA Coverage Plan

This matrix supports:

→ [`docs/parity-charter-v2.1.md`](/docs/parity-charter-v2.1.md)

Tier 0 Locks are not complete until relevant rows are green.

Legend:

- ✅ Covered + passing
- 🟡 Partial / needs expansion
- ❌ Missing
- 🚫 Deferred (not in v2.1 scope)

Goal:

- Lock logic with unit tests
- Verify DOM behavior with component tests
- Confirm UX realism via manual QA

---

# 🔴 Tier 0 Lock — Books/Search (Sprint 5)

## Search Engine

| Area                        | Unit | Component | Manual | Status |
| --------------------------- | ---- | --------- | ------ | ------ |
| Fuzzy matching              | ✅   | ❌        | ✅     | 🟡     |
| Token splitting             | ✅   | ❌        | ✅     | 🟡     |
| AND semantics               | ✅   | ❌        | ✅     | 🟡     |
| Search + filter combination | ✅   | ✅        | ✅     | ✅     |
| Looser search logic         | ✅   | ✅        | ✅     | ✅     |
| Empty vs NoResults          | ❌   | ✅        | ✅     | 🟡     |
| Highlight rendering         | ❌   | ❌        | ❌     | ❌     |
| Autocomplete suggestions    | ❌   | ❌        | ❌     | ❌     |
| Dedicated Search button\*   | ❌   | ❌        | ❌     | ❌     |

\* Only if applicable.

---

## Undo System (Books)

| Area                           | Unit | Component | Manual | Status |
| ------------------------------ | ---- | --------- | ------ | ------ |
| Undo timer window              | ✅   | ❌        | ✅     | 🟡     |
| Object restoration integrity   | ✅   | ❌        | ✅     | 🟡     |
| Undo with active filters       | 🟡   | ❌        | ✅     | 🟡     |
| Undo persistence after refresh | 🚫   | 🚫        | 🚫     | 🚫     |

Tier 0 Lock requirement: All rows green before Sprint 5 closes.

---

# 🔴 Tier 0 Lock — Sessions (Sprint 7)

## Sessions Core (Sprint 6)

| Area                | Unit | Component | Manual | Status |
| ------------------- | ---- | --------- | ------ | ------ |
| Sorting determinism | ❌   | ❌        | ✅     | 🟡     |
| CRUD flows          | ❌   | 🟡        | ✅     | 🟡     |
| Stable rendering    | ❌   | 🟡        | ✅     | 🟡     |

## Keyboard + Highlight (Sprint 7)

| Area                    | Unit | Component | Manual | Status |
| ----------------------- | ---- | --------- | ------ | ------ |
| Arrow/Home/End behavior | ❌   | 🟡        | ✅     | 🟡     |
| Row navigation state    | ❌   | 🟡        | ✅     | 🟡     |
| Live region updates     | ❌   | 🟡        | ✅     | 🟡     |
| Search highlight rows   | ❌   | 🟡        | ✅     | 🟡     |
| Undo session delete     | ❌   | 🟡        | ✅     | 🟡     |

Tier 0 Lock requirement: All rows green before Sprint 7 closes.

---

# 🟠 Hardening & A11y (Sprint 8)

| Area                      | Unit | Component | Manual | Status |
| ------------------------- | ---- | --------- | ------ | ------ |
| Focus management          | ❌   | ❌        | ✅     | 🟡     |
| Corrupt storage fallback  | ❌   | ❌        | ✅     | 🟡     |
| Rapid interaction stress  | ❌   | ❌        | ✅     | 🟡     |
| Large dataset performance | ❌   | ❌        | ✅     | 🟡     |

---

# 🟢 CI Baseline (Sprint 9)

Before enabling CI badge:

- [ ] Search logic unit tests stable
- [ ] Undo unit tests implemented
- [ ] Sessions sort unit tests implemented
- [ ] At least one keyboard interaction component test
- [ ] Regression-proof “intentional break” test exists
- [ ] CI fails on regression

---

# 🚫 Deferred to v2.2+

These are not required for v2.1 freeze:

- Bulk edit
- Saved favorite filters
- Import / export + merge/dedupe
- Multi-device sync behavior

---

# 🚫 Deferred to v2.3+

- Charts / analytics
- Badge system
- Snapshot export
- Streak visualizations

---

# Testing Strategy Rule

Logic errors → Unit test
DOM behavior → Component test
UX realism → Manual QA

All three layers are required for Tier 0 Lock confidence.
