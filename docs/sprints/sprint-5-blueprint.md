# Sprint 5 Blueprint — Sessions Logging + History Parity

**Readr v2.1**

Objective:
Deliver full Sessions parity in React (frontend-only) including:

- Log session flow
- Sessions history view (list/table)
- Sort + edit + delete flows
- Keyboard interactions (history navigation)
- Reuse shared UI patterns (loading/empty/error/no-results)
- Data integrity with Books (bookId linkage)

Sprint 5 completes the “secondary feature” parity milestone.

---

## Sprint 5 Goal

At the end of this sprint:

- Sessions can be logged against books
- Sessions history renders correctly and predictably
- Sort/edit/delete match v1.9 behavior
- Keyboard navigation parity is in place (where v1 supports it)
- No one-off UI hacks (use shared patterns)
- Persistence works (sessions survive refresh)

This should feel like v1.9 Sessions, but implemented in React.

---

## Non-Negotiable Parity Rules

These must match v1.9:

- A session counts only if it has valid non-zero pages and/or minutes
- Date normalization matches legacy (same YYYY-MM-DD behavior)
- Sessions histroy sorting is deterministic and stable
- Editing a session preserves identity and updates derived viewes immediately
- Deleting a session removes it immediately (Undo if already part of v2 scope)
- Keyboard navigation works in history (ArrowUp/Down/Home/End) if present in v1.9
- Truncated notes display correctly with tooltip behavior (if applicable)

Do NOT:

- Change how totals are computed (minutes preferred; pages fallback)
- "Fix" date timezone quirks during parity phase
- Let sessions exist without a resolvable book unless v1.9 allowed it

---

## Architecture Plan

### Folder Structure

```bash
features/sessions/
  components/
    LogSessionForm.tsx
    SessionsTable.tsx (or list)
    EditSessionForm.tsx
  services/
    sessions.service.ts
  store/
    sessions.store.ts
    types.ts
    page.tsx
```

Shared integration points:

- sessions use books from `features/books/store/books.store.ts`
- analytics update wiring is Sprint 6+ unless explicitly required

---

## Data Model Parity (Core)

A session should support legacy fields from v1.9:

- dataKey: "YYYY-MM-DD" (preffered) OR date: ISO string
- pagesRead: number (optional)
- minutes: number (optional)
- legacy: { type: "pages"|"minutes", value: number } fallback
- bookId: string
- notes: string (optional)
- finished: boolean (optional)

Parity rule:

- Normalize values exactly like v1.9 analystics did:
  - prefer pagesRead/minutes
  - fallback to type/value only if primary is zero
  - negative/non-finite becomes 0
  - sessions with both pages and minutes 0 are ignored

---

## Store + Service Responsibilities

### sessions.service.ts (local-first)

Must provide:

- list()
- create(session)
- update(id, updates)
- remove(id)

Must handle persistence.
No UI logic.

### sessions.store.ts

State:

- sessions[]
- sortMode
- editingSessionId (if inline editing)
- error state per operation (optional)

Actions:

- loadSessions()
- addSession()
- updateSession()
- deleteSession()
- setSortMode()

Atomic rule:
No half-applied state if persistence fails.

---

## Session Logging Flow

### UI Requirements

- User can select a book (required unless v1.9 allowed none)
- Date defaults appropriately (match v1.9)
- Minutes/pages input supports:
  - one or both
  - validation and coercion
- Notes input optional

### Validation Parity

- Reject sessions with both minutes/pages = 0
- Reject negative values
- Date must parse into valid day key
- BookId must exist (or match v1.9 behavior if missing)

### Keyboard Parity

- `Enter` saves (when valid)
- `Escape` cancels (if modal/drawer form)
- Focus lands on first field when opened

---

## Sessions History View Parity

### Render + UX

- Shows same fields as v1.9 (date, minutes/pages, book title, notes)
- Handles long notes with truncation + tooltip if applicable
- Stable rendering: no flicker on edit/save

### Sorting

- Must match v1.9 behavior and be deterministic:
  - stable ordering
  - tie-breakers consistent
- Sorting changes re-render history immediately

### Edit / Delete

- Edit updates session in-place
- Cancel restores original values
- Delete removes session immediately
- (Optional) Undo restores deleted session within window (if implemented already)

---

## Keyboard Navigation Parity (History)

If your v1.9 history supported keyboard navigation:

- ArrowDown moves selection to next row
- ArrowUp moves selection to previous row
- Home jumps to first
- End jumps to last
- Escape clears selection and returns focus appropriately
- Selected row uses:
  - aria-selected="true"
  - visible selection styling
- Selection changes should be announced via live region

Notes:
Keep this scoped to history UI and do not introduce new global shortcuts.

---

## Tests Required

### Unit Tests (Store/Service Logic)

- list → loads sessions
- create → adds session, persists
- update → updates correct session, preserves id
- delete → removes correct session
- normalization rules:
  - legacy type/value fallback behaves correctly
  - empty session ignored
  - negative values rejected/coerced

### Component Tests (Critical Flows)

- Log session form:
  - invalid sessions blocked
  - save persists and appears in history
- Sessions history:
  - sort changes order correctly
  - edit/save/cancel works
  - delete removes row
- Keyboard:
  - Arrow/Home/End move selection as expected (if applicable)

### Manual QA (Must)

- Create sessions across multiple dates
- Verify history ordering + sorting
- Edit session under active sort
- Delete session and ensure table updates immediately
- Refresh page → confirm persistence
- Log session while books search/filter active (ensure no cross-feature break)

---

## High-Risk Areas

1. Date normalization parity (YYYY-MM-DD + local timezone behavior)
2. Stable sorting (tie-breakers)
3. Legacy value/type fallback behavior
4. Keyboard navigation state + focus restore
5. Sessions referencing books:

- book deleted/renamed later (how does history display?)

---

## Out of Scope (Sprint 6+)

Do NOT implement (unless already present in v2 scope):

- Analystics/charts wiring
- Badges
- Snapshot export
- Import/export improvements
- Service worker update flow

Sprint 5 is Sessions parity only.

---

## Acceptance Criteria

Sprint 5 is complete when:

- Sessions link correctly to books
- Logging, history, sort, edit, delete work like v1.9
- Keyboard navigation parity works (if applicable)
- UI patterns reused (no one-off hacks)
- Persistence confirmed (refresh test)
- No console errors

---

## Definition of Done

- Sessions feature is complete and stable
- History view is usable and predictable
- Ready for Sprint 6 (Hardening & Accessibility)
