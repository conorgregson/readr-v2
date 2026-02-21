# Sprint 4 Blueprint — Books CRUD Parity

**Readr v2.1**

Objective:
Complete full Books feature parity by implementing:

- Add Book flow
- Edit Book flow
- Save / Cancel semantics
- Validation
- Keyboard parity (Enter / Escape)
- Error handling

This sprint makes the Books feature fully functional and demo-ready.

Sprint 3 delivered read-only parity.
Sprint 4 delivers interaction parity.

---

# Sprint 4 Goal

At the end of this sprint:

- Books can be added, edited, and deleted
- Validation matches v1.9 rules
- Save/Cancel behavior mirrors v1.9
- No regression in search/filter behavior
- Keyboard interactions match legacy behavior
- UI remains stable under rapid edits

This is the first **demo-ready milestone**.

---

# Non-Negotiable Parity Rules

These must match v1.9 exactly:

- Cancel discards all unsaved changes
- Save persists and survives refresh
- Partial edits never leak into non-edit view
- Enter confirms save (when valid)
- Escape cancels edit
- Editing does not break filters/search
- Editing does not break highlight rendering
- Deleting respects Undo window (if Undo already introduced)

Do NOT:

- Auto-save unless v1.9 did
- Add new validation rules
- Change status flow semantics
- Introduce modal behavior if v1.9 used inline (or vice versa)

---

# Architecture Plan

## Folder Structure

```bash
features/books/
  components/
    AddBookModal.tsx (or Drawer, match v1)
    EditBookForm.tsx
    BookCard.tsx
  store/
    books.store.ts
  service/
    books.service.ts
```

Important:

- Store calls service.
- Components call store.
- Components never write to persistence directly.

---

Store Actions Required

In `books.store.ts`:

- addBook(data)
- updateBook(id, updates)
- deleteBook(id)
- (optional) restoreBook(book) for Undo

Each action must:

- Update in-memory state
- Persist via books.service
- Handle failure cleanly (rollback if necessary)

Atomic rule:
No half-applied state.

---

## Validation Parity Plan

Match v1.9 validation rules exactly.

Typical expected rules (verify with v1 behavior):

- Title required
- Author optional or required (match legacy)
- Status must be valid enum
- ISBN optional
- Pages numeric if provided
- No negative numbers

Behavior rules:

- Validation triggers on submit (not necessarily on every keystroke)
- Invalid state prevents save
- Error messaging appears inline
- Error clears once fixed

Do NOT change validation timing unless legacy behavior demands it.

---

## UI Behavior Parity

### Add Book Flow

- Open via Add button
- Focus lands on first input
- `Enter` saves (if valid)
- `Escape` cancels
- On save:
  - Book appears in correct filtered position
  - Search re-applies automatically
  - Highlight logic preserved
- On cancel:
  - Form closes
  - No state change

---

## Edit Book Flow

- Opens in same pattern as v1 (inline or modal)
- Save updates in place (no re-add)
- Cancel restores original values
- Editing a filtered-out field:
  - If edit changes filter match, list updates immediately

Example:
If editing status from "Reading" → “Finished” and current filter = "Reading", book disappears immediately after save.

---

## Delete Book Flow

- Delete removes immediately
- If Undo exists:
  - Show undo toast
  - Undo restores original position
- Delete must not corrupt session linkage (sessions handling deferred to Sprint 5)

---

## Interaction Parity

### Keyboard

- Enter = Save (when valid)
- Escape = Cancel
- Tab order sensible
- Focus restored correctly after close
- No keyboard trap

### Focus Management

- After Add: focus new book or search input (match v1)
- After Edit save: focus returns to card or search input (match v1)
- After Delete: focus moves to next logical book

---

## Tests Required

### Unit Tests (Store Level)

- addBook adds unique ID
- updateBook preserves ID
- deleteBook removes correct book
- validation blocks invalid save
- filter + update interaction works
- search + update interaction works

### Component Tests

- Save/Cancel do not leak changes
- `Enter` triggers save
- `Escape` triggers cancel
- Invalid input blocks save
- Editing a filtered book updates visibility correctly

### Manual QA

- Rapid add → edit → delete cycles
- Add book while search active
- Edit book while filtered
- Delete while filtered
- Try invalid input + fix + save
- Refresh page → confirm persistence

---

## High-Risk Areas

1. Editing under active filters
2. Editing under active search query
3. Cancel not restoring original values
4. Validation blocking but not visually indicating why
5. Focus not restoring correctly
6. Inconsistent highlight rendering after update

---

## Out of Scope (Sprint 5+)

Do NOT implement yet:

- Sessions logging
- Analystics updates
- Goals logic
- Import/exports changes
- Bulk edit (unless already required for parity)

Sprint 4 is strictly Books CRUD parity.

---

## Acceptance Criteria

Sprint 4 is complete when:

- CRUD flows mirror v1.9 UX
- No regression in search/filter behavior
- Validtaion rules match legacy
- Keyboard interactions match legacy
- Store actions unit tested
- No console errors
- Demo-ready Books feature

---

## Definition of Done

- Books fully functional
- Search + filters remain stable
- UI stable under rapid interaction
- Persistence confirmed
- Ready to demo end-to-end books workflow
