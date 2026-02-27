import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useBooksStore } from "./store/dev.books.store";
import type { BookStatus } from "./types";

import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";

const DRAFTS_KEY = "readr.books.drafts.v1";
const EDITING_KEY = "readr.books.editingById.v1";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function matches(haystack: string, q: string, looser: boolean) {
  if (!q) return true;
  if (!looser) return haystack.includes(q);
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}

type Draft = { title: string; author: string; status: BookStatus };

function isDraftDirty(
  book: { title: string; author?: string; status: BookStatus },
  draft?: Draft,
) {
  if (!draft) return false;

  const bookTitle = normalize(book.title);
  const draftTitle = normalize(draft.title);

  const bookAuthor = normalize(book.author ?? "");
  const draftAuthor = normalize(draft.author ?? "");

  return (
    bookTitle !== draftTitle ||
    bookAuthor !== draftAuthor ||
    book.status !== draft.status
  );
}

export function BooksDevPage() {
  const loadBooks = useBooksStore((s) => s.loadBooks);

  const books = useBooksStore((s) => s.books);
  const filters = useBooksStore((s) => s.filters);
  const searchQuery = useBooksStore((s) => s.searchQuery);
  const isLooserSearch = useBooksStore((s) => s.isLooserSearch);

  const setSearchQuery = useBooksStore((s) => s.setSearchQuery);
  const setStatusFilter = useBooksStore((s) => s.setStatusFilter);

  const addBook = useBooksStore((s) => s.addBook);
  const updateBook = useBooksStore((s) => s.updateBook);
  const deleteBook = useBooksStore((s) => s.deleteBook);

  const pendingDeleteById = useBooksStore((s) => s.pendingDeleteById);
  const undoDelete = useBooksStore((s) => s.undoDelete);

  const isLoading = useBooksStore((s) => s.isLoading);
  const isSaving = useBooksStore((s) => s.isSaving); // non-row saving (ex: Add)
  const error = useBooksStore((s) => s.error); // global error (ex: load/add)
  const clearError = useBooksStore((s) => s.clearError);

  const savingById = useBooksStore((s) => s.savingById);
  const errorById = useBooksStore((s) => s.errorById);

  // Multi-edit state
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, Draft>) : {};
    } catch {
      return {};
    }
  });

  const [editingById, setEditingById] = useState<Record<string, boolean>>(
    () => {
      try {
        const raw = localStorage.getItem(EDITING_KEY);
        return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      } catch {
        return {};
      }
    },
  );

  // True exit animation state
  const [closingById, setClosingById] = useState<Record<string, boolean>>({});
  const [justClosedById, setJustClosedById] = useState<Record<string, boolean>>(
    {},
  );

  // Focus newly opened edit row
  const [focusEditId, setFocusEditId] = useState<string | null>(null);
  const editTitleRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Temporary add form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("planned");

  // Saved flash
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  // Load books
  useEffect(() => {
    void useBooksStore.getState().loadBooks();
  }, []);

  // Persist drafts + editing
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    } catch {
      // ignore
    }
  }, [drafts]);

  useEffect(() => {
    try {
      localStorage.setItem(EDITING_KEY, JSON.stringify(editingById));
    } catch {
      // ignore
    }
  }, [editingById]);

  // Saved label timeout
  useEffect(() => {
    if (!justSavedId) return;
    const t = window.setTimeout(() => setJustSavedId(null), 1500);
    return () => window.clearTimeout(t);
  }, [justSavedId]);

  // Focus newly opened edit row title
  useEffect(() => {
    if (!focusEditId) return;

    const t = window.setTimeout(() => {
      const el = editTitleRefs.current[focusEditId];
      el?.focus();
      el?.select();
      setFocusEditId(null);
    }, 0);

    return () => window.clearTimeout(t);
  }, [focusEditId]);

  // Derived: visible books
  const visibleBooks = useMemo(() => {
    const q = normalize(searchQuery);

    const statusActive = filters.status.length > 0;

    return books
      .filter((b) => (statusActive ? filters.status.includes(b.status) : true))
      .filter((b) => {
        const hay = `${b.title} ${b.author ?? ""}`.toLowerCase();
        return matches(hay, q, isLooserSearch);
      });
  }, [books, filters.status, searchQuery, isLooserSearch]);

  // Editing helpers
  function isEditing(id: string) {
    return !!editingById[id];
  }

  function openEdit(id: string) {
    setEditingById((prev) => ({ ...prev, [id]: true }));
  }

  function closeEdit(id: string) {
    setEditingById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function isClosing(id: string) {
    return !!closingById[id];
  }

  function markJustClosed(id: string) {
    setJustClosedById((prev) => ({ ...prev, [id]: true }));
    window.setTimeout(() => {
      setJustClosedById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 160);
  }

  function beginClose(id: string) {
    setClosingById((prev) => ({ ...prev, [id]: true }));

    window.setTimeout(() => {
      setClosingById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      closeEdit(id);
      markJustClosed(id);
    }, 160);
  }

  function startEdit(b: {
    id: string;
    title: string;
    author?: string;
    status: BookStatus;
  }) {
    // init draft once (preserve typed edits if reopening)
    setDrafts((prev) => {
      if (prev[b.id]) return prev;
      return {
        ...prev,
        [b.id]: { title: b.title, author: b.author ?? "", status: b.status },
      };
    });

    openEdit(b.id);
    setFocusEditId(b.id);
  }

  function cancelEdit(id: string) {
    const book = books.find((x) => x.id === id);
    const draft = drafts[id];

    if (book && isDraftDirty(book, draft)) {
      const ok = window.confirm("Discard unsaved changes?");
      if (!ok) return;
    }

    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    beginClose(id);
  }

  async function saveEdit(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    const nextTitle = draft.title.trim();
    if (!nextTitle) return;

    try {
      await updateBook(id, {
        title: nextTitle,
        author: draft.author.trim() || undefined,
        status: draft.status,
      });

      // success: clear draft + close + saved flash
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      beginClose(id);
      setJustSavedId(id);
    } catch {
      // failure: store has rolled back and set row error; keep edit + draft open
    }
  }

  function onEditKeyDown(
    e: KeyboardEvent,
    opts: {
      id: string;
      interactionLocked: boolean;
      titleInvalid: boolean;
      isDirty: boolean;
    },
  ) {
    const { id, interactionLocked, titleInvalid, isDirty } = opts;
    if (interactionLocked) return;

    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit(id);
      return;
    }

    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target?.tagName === "SELECT") return;
      if (titleInvalid || !isDirty) return;

      e.preventDefault();
      void saveEdit(id);
    }
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    await addBook({
      title: t,
      author: author.trim() || undefined,
      status,
    });

    setTitle("");
    setAuthor("");
    setStatus("planned");
  }

  // Cancel all edits
  const openEditIds = Object.keys(editingById);
  const openEditCount = openEditIds.length;
  const anyRowSaving = Object.values(savingById).some(Boolean);

  const dirtyEditCount = openEditIds.filter((id) => {
    const book = books.find((b) => b.id === id);
    if (!book) return false;
    return isDraftDirty(book, drafts[id]);
  }).length;

  function cancelAllEdits() {
    if (openEditCount === 0) return;

    if (dirtyEditCount > 0) {
      const ok = window.confirm(
        `Discard unsaved changes in ${dirtyEditCount} row${dirtyEditCount === 1 ? "" : "s"}?`,
      );
      if (!ok) return;
    }

    // Close all (animate out)
    const ids = [...openEditIds];
    for (const id of ids) beginClose(id);

    // Clear drafts for open edits
    setDrafts((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });

    // clear persisted state now (it will re-save on next state changes anyway)
    try {
      localStorage.removeItem(DRAFTS_KEY);
      localStorage.removeItem(EDITING_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      {/* Header / Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Books</h1>
          <p className="text-sm text-slate-500">Local-first scaffold</p>
        </div>

        <div className="w-full sm:w-64">
          <label className="mb-1 block text-xs text-slate-500">Status</label>
          <Select
            value={filters.status[0] ?? "All"}
            onChange={(e) => {
              const v = e.target.value;
              setStatusFilter(v === "all" ? [] : [v as BookStatus]);
            }}
          >
            <option value="All">All</option>
            <option value="Want to Read">Planned</option>
            <option value="Reading">Reading</option>
            <option value="Finished">Finished</option>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="mb-1 block text-sm text-slate-500">Search</label>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or author..."
        />
      </div>

      {/* Cancel all edits */}
      {openEditCount > 0 ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={cancelAllEdits}
            disabled={anyRowSaving}
          >
            Cancel all edits ({openEditCount})
          </Button>
        </div>
      ) : null}

      {/* Add book (temporary) */}
      <Card className="border-slate-200 bg-white relative z-0 focus-within:z-10">
        <form onSubmit={onAdd} className="space-y-3">
          <div className="font-medium text-black">Add book (temporary)</div>

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Author (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
          >
            <option value="Want to Read">Want to Read</option>
            <option value="Reading">Reading</option>
            <option value="Finished">Finished</option>
          </Select>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={isSaving}
              disabled={isSaving || title.trim().length === 0}
            >
              Add
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={() =>
                void addBook({
                  title: "Test Book",
                  author: "Me",
                  status: "planned",
                })
              }
            >
              Debug: Add Test Book
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading / Error */}
      {isLoading ? (
        <div className="rounded border p-3 text-sm">Loading…</div>
      ) : null}

      {error ? (
        <div className="rounded border p-3 text-sm">
          <div className="font-medium">Something went wrong</div>
          <div className="opacity-75">{error}</div>
          <Button
            className="mt-2"
            variant="secondary"
            type="button"
            onClick={() => {
              clearError();
              void loadBooks();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Results */}
      {!isLoading && !error ? (
        <>
          {visibleBooks.length === 0 ? (
            <div className="text-sm text-slate-500">
              No books yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {visibleBooks.map((b) => {
                const rowIsEditing = isEditing(b.id);
                const rowIsClosing = isClosing(b.id);
                const showEditUI = rowIsEditing || rowIsClosing;

                const isSavingRow = !!savingById[b.id];
                const interactionLocked = isSavingRow || rowIsClosing;

                const rowError = errorById[b.id];
                const showSaved = justSavedId === b.id;
                const rowViewEnter = !!justClosedById[b.id];

                const draft = drafts[b.id] ?? {
                  title: b.title,
                  author: b.author ?? "",
                  status: b.status,
                };

                const titleInvalid =
                  showEditUI && draft.title.trim().length === 0;

                // Hide unsaved label while saving/closing
                const isDirty =
                  showEditUI &&
                  !interactionLocked &&
                  isDraftDirty(b, drafts[b.id]);

                return (
                  <Card
                    key={b.id}
                    className={`border-slate-200 bg-white relative z-0 focus-within:z-10 ${
                      showEditUI ? "pb-2 mb-18 edit-glow" : ""
                    }
                      ${showEditUI ? "opacity-100" : openEditCount > 0 ? "opacity-70" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* LEFT SIDE: crossfade view vs. edit */}
                      <div className="content-wrap">
                        {/* View layer */}
                        <div
                          className={`content-layer ${
                            showEditUI
                              ? "controls-exit pointer-events-none"
                              : "controls-enter"
                          }`}
                          aria-hidden={showEditUI}
                        >
                          <div className={rowViewEnter ? "row-view-enter" : ""}>
                            <div className="font-medium text-black">
                              {b.title}
                            </div>
                            <div className="text-sm text-slate-600">
                              {b.author ?? "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {b.status}
                            </div>

                            {showSaved ? (
                              <div className="mt-1 text-xs font-medium text-emerald-600 saved-fade">
                                ✓ Saved
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Edit layer */}
                        <div
                          className={`content-layer ${
                            showEditUI
                              ? "controls-enter"
                              : "controls-exit pointer-events-none"
                          }`}
                          aria-hidden={!showEditUI}
                        >
                          <div
                            className={`grid gap-2 sm:grid-cols-[1fr_220px] sm:items-start ${
                              rowIsClosing ? "row-edit-exit" : "row-edit-enter"
                            }`}
                            onKeyDown={(e) =>
                              onEditKeyDown(e, {
                                id: b.id,
                                interactionLocked,
                                titleInvalid,
                                isDirty,
                              })
                            }
                          >
                            <div className="space-y-2">
                              {isDirty ? (
                                <div className="text-xs text-amber-600 font-medium">
                                  • Unsaved changes
                                </div>
                              ) : null}

                              <Input
                                ref={(el) => {
                                  editTitleRefs.current[b.id] = el;
                                }}
                                value={draft.title}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [b.id]: { ...draft, title: e.target.value },
                                  }))
                                }
                                placeholder="Title"
                                disabled={interactionLocked}
                              />

                              {titleInvalid ? (
                                <div className="text-xs text-red-600">
                                  Title is required.
                                </div>
                              ) : null}

                              <Input
                                value={draft.author}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [b.id]: {
                                      ...draft,
                                      author: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Author (optional)"
                                disabled={interactionLocked}
                              />
                            </div>

                            <div className="sm:pt-0">
                              <Select
                                value={draft.status}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [b.id]: {
                                      ...draft,
                                      status: e.target.value as BookStatus,
                                    },
                                  }))
                                }
                                disabled={interactionLocked}
                              >
                                <option value="Want to Read">
                                  Want to Read
                                </option>
                                <option value="Reading">Reading</option>
                                <option value="Finished">Finished</option>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Invisible static layer to reserve height (prevents overlap/wobble) */}
                        {/* Static spacer: compact in view mode, tall in edit mode */}
                        <div className="content-layer--static opacity-0 pointer-events-none">
                          {showEditUI ? (
                            <div className="flex flex-col gap-2">
                              <div className="h-9" />
                              <div className="h-9" />
                              <div className="h-9" />
                              <div className="h-4" />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="h-5" />
                              <div className="h-4" />
                              <div className="h-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT SIDE: crossfade controls */}
                      <div className="controls-wrap">
                        {/* Edit/Delete layer */}
                        <div
                          className={`controls-layer ${
                            showEditUI
                              ? "controls-exit pointer-events-none"
                              : "controls-enter"
                          }`}
                          aria-hidden={showEditUI}
                        >
                          <Button
                            variant="secondary"
                            type="button"
                            disabled={interactionLocked}
                            onClick={() => startEdit(b)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            type="button"
                            loading={isSavingRow}
                            disabled={interactionLocked}
                            onClick={() => {
                              const ok = window.confirm(`Delete "${b.title}"?`);
                              if (!ok) return;
                              void deleteBook(b.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>

                        {/* Save/Cancel layer */}
                        <div
                          className={`controls-layer ${
                            showEditUI
                              ? "controls-enter"
                              : "controls-exit pointer-events-none"
                          }`}
                          aria-hidden={!showEditUI}
                        >
                          <Button
                            type="button"
                            loading={isSavingRow}
                            disabled={
                              !isDirty || titleInvalid || interactionLocked
                            }
                            onClick={() => void saveEdit(b.id)}
                          >
                            Save
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            disabled={interactionLocked}
                            onClick={() => cancelEdit(b.id)}
                          >
                            Cancel
                          </Button>
                        </div>

                        {/* Invisible static layer to reserve height */}
                        <div className="controls-layer--static opacity-0">
                          <Button type="button">Save</Button>
                          <Button type="button">Cancel</Button>
                        </div>

                        {/* Row error under controls (edit mode only) */}
                        {showEditUI && rowError ? (
                          <div className="mt-1 text-xs font-medium text-red-600">
                            {rowError}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {/* Undo delete toast stack */}
      {Object.keys(pendingDeleteById).length > 0 ? (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {Object.entries(pendingDeleteById).map(([id, entry]) => (
            <div
              key={id}
              className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2 shadow"
            >
              <div className="text-sm text-black">
                Deleted{" "}
                <span className="font-medium text-black">
                  {entry.book.title}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => undoDelete(id)}
              >
                Undo
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
