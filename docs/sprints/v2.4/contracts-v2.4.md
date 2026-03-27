# Readr 2.4 — Contracts

## Purpose

This document defines the initial server/client contracts for Readr 2.4.

v2.4 is a feature-layering release built on top of the stable API-backed, authenticated architecture introduced in earlier v2.x versions. This phase does not introduce a persistence migration or architectural rewrite. Its purpose is to establish safe, explicit contracts for:

- bulk edit workflows
- saved library views
- dashboard/statistics read models
- goals, streaks, and badge read models

These contracts are defined before UI implementation so that feature work can proceed without ad hoc modeling or duplicated business logic.

---

## Contract Principles

### 1. No breaking change to core CRUD routes

Existing books and sessions CRUD routes should remain stable unless a change is absolutely necessary.

### 2. Server-owned derived state

Where correctness matters, derived engagement data must be computed on the server rather than reconstructed in the UI.

This applies especially to:

- streaks
- badge progression
- dashboard summaries
- aggregate statistics

### 3. Read-only analytics and engagement surfaces

Dashboard, stats, goals, streaks, and badges should initially be exposed through read-only API responses.

### 4. User ownership enforced at the API boundary

All v2.4 data must remain scoped to the authenticated user. No client-provided ownership field is trusted.

### 5. Bulk mutations must be atomic

Grouped book mutations must succeed or fail as one unit. Partial mutation states must not be exposed.

---

# 1. Bulk Edit Contracts

## Purpose

Bulk edit introduces grouped mutation flows for multiple books at once.

Initial supported operations:

- batch status update
- batch delete

Future bulk field updates may be added later if they remain safe and consistent.

---

## Request: Batch Update Books

```ts
type BulkUpdateBooksRequest = {
  ids: string[];
  patch: {
    status?: "planned" | "reading" | "finished";
  };
};
```

---

## Rules

- `id` must be a non-empty array
- all ids must be valid book ids
- duplicate ids should be normalized or rejected consistently
- `patch` must include at least one allowed field
- all targeted books must belong to the authenticated user
- operation must be atomic

---

## Request: Batch Delete Books

```ts
type BulkDeleteBooksRequest = {
  ids: string[];
};
```

## Rules

- `id` must be a non-empty array
- all ids must be valid book ids
- duplicate ids should be normalized or rejected consistently
- all targeted books must belong to the authenticated user
- operation must be atomic

---

## Response: Bulk Mutation Result

```ts
type BulkMutationResult = {
  ok: true;
  operationId: string;
  operation: "update" | "delete";
  affectedCount: number;
  affectedIds: string[];
};
```

---

## Notes

- `operationId` exists to support grouped Undo and operation tracking
- `affectedIds` should reflect the final resolved set after validation/normalization
- response shape should remain stable across all bulk book mutation flows

---

## Error Expectations

Examples of invalid requests:

- empty `ids`
- invalid patch shape
- unauthorized ownership access
- malformed ids

Failure behavior:

- grouped operation fails as a unit
- no partial success response shape
- no partial commit at persistence layer

---

# 2. Saved Views Contracts

## Purpose

Saved views allow users to persist reusable library configurations across sessions.

A saved view combines:

- filter state
- sort state
- naming metadata
- optional pinned/default behavior

---

## Saved View Shape

```ts
type SavedLibraryView = {
  id: string;
  name: string;
  filters: {
    status?: Array<"planned" | "reading" | "finished">;
    favorite?: boolean;
    search?: string;
  };
  sort: {
    key: "title" | "author" | "createdAt" | "updatedAt" | "finishedAt";
    direction: "asc" | "desc";
  };
  isPinned: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

## Request: Create Saved View

```ts
type CreateSavedViewRequest = {
  name: string;
  filters: {
    status?: Array<"planned" | "reading" | "finished">;
    favorite?: boolean;
    search?: string;
  };
  sort: {
    key: "title" | "author" | "createdAt" | "updatedAt" | "finishedAt";
    direction: "asc" | "desc";
  };
  isPinned?: boolean;
  isDefault?: boolean;
};
```

---

## Request: Update Saved View

```ts
type UpdateSavedViewRequest = {
  name?: string;
  filters?: {
    status?: Array<"planned" | "reading" | "finished">;
    favorite?: boolean;
    search?: string;
  };
  sort?: {
    key: "title" | "author" | "createdAt" | "updatedAt" | "finishedAt";
    direction: "asc" | "desc";
  };
  isPinned?: boolean;
  isDefault?: boolean;
};
```

---

## Response: Saved Views List

```ts
type SavedViewsResponse = {
  items: SavedLibraryView[];
};
```

---

## Rules

- saved views are always scoped to the authenticated user
- only one view may be `isDefault: true` at a time
- invalid sort keys are rejected at schema boundary
- deleted or missing default views should degrade safely in the UI

---

# 3. Dashboard / Statistics Contracts

## Purpose

v2.4 introduces read-only statistics and dashboard summaries powered by server-derived aggregates.

These responses are intended for:

- summary cards
- charts
- insight surfaces

They are not mutation endpoints.

---

## Response: Dashboard Summary

```ts
type DashboardSummaryResponse = {
  totals: {
    books: number;
    finishedBooks: number;
    pagesRead: number;
    sessionsLogged: number;
    avgSessionMinutes: number;
  };
  currentPeriod: {
    booksFinishedThisMonth: number;
    pagesReadThisMonth: number;
  };
};
```

---

## Response: Reading Trend

```ts
type TimeSeriesPoint = {
  date: string;
  value: number;
};

type ReadingTrendResponse = {
  metric: "pages" | "sessions" | "booksFinished";
  points: TimeSeriesPoint[];
};
```

---

## Rules

- all analytics responses are read-only
- values are computed server-side
- empty libraries should return valid empty-safe responses
- sparse historical data should not break response shape

---

# 4. Goals / Streaks / Badges Contracts

## Purpose

v2.4 adds motivation systems on top of server-derived stats.

These features must not rely on duplicate UI-side business logic for correctness.

---

# Response: Reading Goals

```ts
type ReadingGoalsResponse = {
  yearlyBooksGoal?: {
    target: number;
    progress: number;
    complete: boolean;
  };
  yearlyPagesGoal?: {
    target: number;
    progress: number;
    complete: boolean;
  };
  monthlyBooksGoal?: {
    target: number;
    progress: number;
    complete: boolean;
  };
};
```

---

## Response: Reading Streaks

```ts
type ReadingStreakResponse = {
  currentStreakDays: number;
  longestStreakDays: number;
  graceWindowEnabled: boolean;
};
```

---

## Response: Badge Progress

```ts
type BadgeProgress = {
  key: string;
  title: string;
  description: string;
  tier?: "bronze" | "silver" | "gold";
  unlocked: boolean;
  progress: number;
  target: number;
};
```

---

## Response: Engagement Snapshot

```ts
type EngagementSnapshotResponse = {
  goals: ReadingGoalsResponse;
  streaks: ReadingStreakResponse;
  badges: BadgeProgress[];
};
```

---

## Rules

- all engagement responses are read-only in the initial implementation phase
- streaks and badge progression are computed server-side
- UI may format or group results but should not recreate business rules
- empty-state responses must be valid and renderable

---

# 5. Open Decisions

These items are intentionally deferred for implementation discussion:

- whether duplicate ids in bulk mutation are rejected or normalized
- whether bulk edit expands beyond status changes in v2.4
- whether monthly page goals are included in initial scope
- whether streak grace windows are enabled in first release
- exact badge catalog and milestone thresholds
- whether saved views persist free-text search or only structural filters

---

# 6. Implementation Notes

Sprint 0 only locks contracts and boundaries.

This phase should prioritize:

- type definitions
- validation schemas
- architecture notes
- endpoint planning

This phase should avoid:

- premature UI wiring
- duplicated frontend-only derivation logic
- expanding persistence scope without clear need
