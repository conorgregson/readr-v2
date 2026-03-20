# Readr v2.1 — Sprint Dependency Map

This document visualizes execution order and freeze boundaries
for the v2.1 Parity Charter.

For behavioral requirements:
→ [`docs/parity-charter-v2.1.md`](/docs/parity-charter-v2.1.md)

---

## Linear Progression View

````mermaid
flowchart TB

S0["Sprint 0<br/>Prep & Guardrails"]
S1["Sprint 1<br/>React Foundation"]
S2["Sprint 2<br/>UI Patterns & State Skeleton"]
S3["Sprint 3<br/>Search + Filters Parity (read-only)"]
S4["Sprint 4<br/>Books CRUD + Timestamp Parity"]
S5["Sprint 5<br/><b>Books Tier 0 Lock</b>"]
S6["Sprint 6<br/>Sessions Core"]
S7["Sprint 7<br/><b>Sessions Tier 0 Lock</b>"]
S8["Sprint 8<br/>Hardening & Accessibility"]
S9["Sprint 9<br/>Tests & CI Baseline"]
S10["Sprint 10<br/><b>Freeze & Stabilization</b>"]

S0 --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8 --> S9 --> S10

S5 -.-> BFREEZE{{"Books/Search Frozen"}}
S7 -.-> SFREEZE{{"Sessions Frozen"}}
S10 -.-> V22["v2.2 API Integration Begins"]

## Risk-Based View

```mermaid
flowchart LR

A["Foundation<br/>S0–S2"]
B["Search Engine Parity<br/>S3"]
C["Books Functional Parity<br/>S4"]
D["Books Tier 0 Lock<br/>S5"]
E["Sessions Core<br/>S6"]
F["Sessions Tier 0 Lock<br/>S7"]
G["Hardening<br/>S8"]
H["CI Baseline<br/>S9"]
I["Freeze & Stabilization<br/>S10"]

A --> B --> C --> D --> E --> F --> G --> H --> I
I --> V22["v2.2 API Migration"]
````

## Freeze Boundary

v2.1 freeze boundary:

- Books/Search Tier 0 locked
- Sessions Tier 0 locked
- Hardening complete
- CI baseline active
- Freeze validation complete

After freeze:
No new features until v2.2 branch begins.
