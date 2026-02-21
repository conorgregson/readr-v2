# Sprint 3 Blueprint — Books List + Search Parity

**Readr v2.1**

Objective:
Rebuild the **core Readr loop** in React with full parity to v1.9 search + filter behavior.

This sprint focuses on:

- Books list rendering
- Filters
- Search engine port
- Looser search behavior
- Keyboard interactions (where applicable)

No CRUD yet.
Read-only behavior first.

---

## Sprint 3 Goal

At the end of this sprint:

- Books page behaves like v1.9 (search + filters fully working)
- No-results and looser search work correctly
- Search semantics match legacy
- No regressions in filter behavior
- Search engine locked with unit tests

This is a **parity milestone**, not a feature sprint.

---

## Non-Negotiable Parity Rules

These must not change from v1.9:

- Search uses strict AND semantics across tokens
- Fuzzy matching uses Damerau–Levenshtein
- Phrase bonus (+10) preserved
- Word-start scoring bonus preserved
- Filters applied BEFORE search
- Looser search only modifies fuzzy distance
- Typing resets looser search override
- No-results state distinct from empty state

Do NOT:

- Simplify scoring
- Switch to OR search
- Remove highlight logic
- Reorder pipeline

---

## Architecture Plan

### Folder Structure

```bash
features/books/
  filters.ts
search/
  search.engine.ts
  highlight.ts
store/
  book.store.ts
  page.tsx
components/
  BookList.tsx
  BookCard.tsx
  NoResultsState.tsx
```

Search logic must remain pure.
No search math inside components.

---

## Search Engine Port Plan

Port from v1:

- tokenize()
- editDistance() (Damerau-Levenshtein)
- fuzzyTokenMatch()
- smartSearch()
- highlightText()

### Required Options

- fields: { title, author, series/blob, notes }
- weights preserved
- fuzzyMaxDistance default preserved
- limit preserved (500)

### Engine Output

Return:

- sorted matches
- original reference object
- score
- highlight tokens

No UI code inside engine.

---

## Unit Tests Required (Before UI Wiring)

Create:
`search.engine.test.ts`

Must include:

### Tokenization

- `"har pot"` = single token
- `har pot` = two tokens
- diacritics normalized
- hyphens converted to spaces

### AND Semantics

- Query with 2 tokens requires both match

### Fuzzy

- `"hobbot"` matches `"hobbit"`

### Phrase Bonus

- Quoted phrase ranks above split tokens

### Ranking

- Word-start bonus affects order

### Limit

- Respect max results

Sprint 3 can't be marked complete without these passing.

---

## Filter Parity Plan

Create `filters.ts`:
`applyFilters(books, filters) => filteredBooks`

Filters mush match v1 behavior exactly:

- Status multi-select
- Author multi-select
- Genre multi-select
- Series multi-select
- Clear All resets immediately
- Filters combine with AND logic

Important:
Search runs on filteredBooks, not allBooks.

Pipeline:

`allBooks`
→ `applyFilters()`
→ `smartSearch()`
→ `render`

---

## Derived Selector Plan (Zustand)

In books.store.ts:

visibleBooks = derived from:

- books
- filters
- searchQuery

Implementation order:

1. filtered = applyFilters(books, filters)
2. if no query → return filtered
3. else → return smartSearch(filtered).map(ref)

No search inside components.

---

## UI Behavior Parity

### Search Input

- Debounced preview (200ms equivalent)
- `Enter` executes immediately
- `Escape` clears query only
- `ArrowDown` activates first result
- Search button hidden when no-op
- Live region status text preserved

### No Results

- Appears only when:
  - books exist
  - filtered + searched results empty
- Must show:
  - "Try looser search" CTA
- Clicking CTA:
  - increases fuzzyMaxDistance
- Typing resets override

---

## Acceptance Criteria

Sprint 3 is complete when:

- Search results match v1.9 for:
  - fuzzy typo cases
  - partial token cases
  - multi-token AND cases
- Filters update list predictably
- No-results state behaves correctly
- Looser search increases matches
- Highlight rendering works
- Unit tests for search engine pass
- No console errors

---

## Common Mistakes to Avoid

- Running search before filters
- Refactoring scoring constants
- Using simple Levenshtein instead of Damerau
- Removing phrase bonus
- Making search OR-based
- Recomputing search inside component body every render

---

## Out of Scope (Sprint 4)

Do NOT implement yet:

- Add/Edit book
- Validation logic
- Undo
- Bulk edit
- Sessions
- Analystics

Sprint 3 is read-only behavior parity.

---

## Definition of Done

- Books list behaves like v1.9
- Search parity locked
- Filters parity locked
- No-results + looser search working
- Search engine fully unit tested
- Ready to demo read-only **Books** page
