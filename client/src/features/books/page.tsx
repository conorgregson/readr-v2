import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/ui/Button";

import { LoadingState } from "../../shared/ui/states/LoadingState";
import { EmptyState } from "../../shared/ui/states/EmptyState";
import { ErrorState } from "../../shared/ui/states/ErrorState";
import { NoResultsState } from "../../shared/ui/states/NoResultsState";

import { useBooksStore } from "./store/books.store";
import { BookList } from "./components/BookList";
import { BooksToolbar } from "./components/BooksToolbar";
import { BooksFiltersPanel } from "./components/BooksFilters";
import { AddBookPanel } from "./components/AddBookPanel";
import {
  captureFocusToken,
  restoreFocus,
  focusFirstMatch,
} from "../../shared/a11y/focus";

export function BooksPage() {
  const loadBooks = useBooksStore((s) => s.loadBooks);
  const isBootstrapped = useBooksStore((s) => s.isBootstrapped);

  const error = useBooksStore((s) => s.page.error);
  const setError = useBooksStore((s) => s.setError);

  const books = useBooksStore((s) => s.books);
  const addBook = useBooksStore((s) => s.addBook);

  const undo = useBooksStore((s) => s.undo);
  const undoLast = useBooksStore((s) => s.undoLast);
  const clearUndo = useBooksStore((s) => s.clearUndo);

  const filters = useBooksStore((s) => s.filters);
  const setFilters = useBooksStore((s) => s.setFilters);
  const clearFilters = useBooksStore((s) => s.clearFilters);

  const searchQuery = useBooksStore((s) => s.searchQuery);
  const setSearchQuery = useBooksStore((s) => s.setSearchQuery);
  const enableLooserSearch = useBooksStore((s) => s.enableLooserSearch);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const undoBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<ReturnType<typeof captureFocusToken>>({
    kind: "none",
  });

  const getVisibleBooks = useBooksStore((s) => s.visibleBooks);
  const visibleBooks = isBootstrapped ? getVisibleBooks() : [];

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const resultsId = "books-results";

  const [isAddOpen, setIsAddOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isBootstrapped) return;
    void loadBooks();
  }, [isBootstrapped, loadBooks]);

  // When an Undo banner appears, move focus to the Undo action for keyboard parity.
  // This prevents "focus loss" after a delete (especially if the deleted row contained the focused button).
  useEffect(() => {
    if (!undo) return;
    // Defer so the button exists in the DOM.
    window.setTimeout(() => {
      undoBtnRef.current?.focus();
    }, 0);
  }, [undo]);

  const focusResultsAndSelectFirst = () => {
    const list = document.getElementById(resultsId);
    if (!list) return;
    (list as HTMLElement).focus();
    setActiveIndex(0);
  };

  const focusResultsAndSelectBook = (bookId: string) => {
    const list = document.getElementById(resultsId) as HTMLElement | null;
    if (!list) return false;
    list.focus();
    const idx = visibleBooks.findIndex((b) => b.id === bookId);
    if (idx >= 0) {
      setActiveIndex(idx);
      return true;
    }
    return false;
  };

  // --- derived UI states ----------------------------------

  if (!isBootstrapped) {
    return <LoadingState label="Loading books…" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error.message ?? "Unknown error"}
        action={<Button onClick={() => setError(undefined)}>Dismiss</Button>}
      />
    );
  }

  if (books.length === 0) {
    return (
      <>
        <EmptyState
          title="No books yet"
          description="Add your first book to start tracking your reading."
          action={
            <Button
              ref={addBtnRef}
              onClick={() => {
                lastFocusRef.current = captureFocusToken();
                setError(undefined);
                setIsAddOpen(true);
              }}
              data-focus-id="book:add"
            >
              Add book
            </Button>
          }
        />

        {isAddOpen ? (
          <AddBookPanel
            onClose={() => {
              setIsAddOpen(false);
              window.setTimeout(() => {
                restoreFocus(lastFocusRef.current, {
                  fallbackSelectors: [`[data-focus-id="book:add"]`],
                  deferMs: 0,
                });
              }, 0);
            }}
            onSubmit={async (data) => {
              const created = await addBook(data);
              if (created) {
                setIsAddOpen(false);
                window.setTimeout(() => {
                  restoreFocus(lastFocusRef.current, {
                    fallbackSelectors: [`[data-focus-id="book:add"]`],
                    deferMs: 0,
                  });
                }, 0);
              }
            }}
          />
        ) : null}
      </>
    );
  }

  const showNoResults = books.length > 0 && visibleBooks.length === 0;

  return (
    <div className="space-y-4">
      <BooksToolbar
        books={books}
        booksTotal={books.length}
        visibleCount={visibleBooks.length}
        filters={filters}
        searchQuery={searchQuery}
        onCommitQuery={(q) => {
          setActiveIndex(-1);
          setSearchQuery(q);
        }}
        onFocusResults={focusResultsAndSelectFirst}
        searchInputRef={searchRef}
        onAddBook={() => {
          lastFocusRef.current = captureFocusToken();
          setError(undefined);
          setIsAddOpen(true);
        }}
        addButtonRef={addBtnRef}
      />

      <BooksFiltersPanel
        books={books}
        filters={filters}
        onChange={(next) => {
          setActiveIndex(-1);
          setFilters(next);
        }}
        onClear={() => {
          setActiveIndex(-1);
          clearFilters();
        }}
      />

      {isAddOpen ? (
        <AddBookPanel
          onClose={() => {
            setIsAddOpen(false);
            // Sprint 8: defer focus restore until after panel unmount.
            window.setTimeout(() => {
              restoreFocus(lastFocusRef.current, {
                fallbackSelectors: [`[data-focus-id="book:add"]`],
                deferMs: 0,
              });
            }, 0);
          }}
          onSubmit={async (data) => {
            const created = await addBook(data);
            if (created) {
              setIsAddOpen(false);
              // Sprint 8: defer focus restore until after list rerender.
              window.setTimeout(() => {
                restoreFocus(lastFocusRef.current, {
                  fallbackSelectors: [`[data-focus-id="book:add"]`],
                  deferMs: 0,
                });
              }, 0);
            }
          }}
        />
      ) : null}

      {showNoResults ? (
        <NoResultsState
          query={searchQuery}
          action={
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  enableLooserSearch();
                  setActiveIndex(-1);
                  // Keep keyboard users in the search flow.
                  const el = searchRef.current;
                  el?.focus();
                  if (el) {
                    const v = el.value;
                    el.setSelectionRange?.(v.length, v.length);
                  }
                }}
              >
                Try looser search
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery("");
                  setActiveIndex(-1);
                  // Sprint 8: search clear must restore focus to search input.
                  const el = searchRef.current;
                  el?.focus();
                  if (el) {
                    const v = el.value;
                    el.setSelectionRange?.(v.length, v.length);
                  }
                }}
              >
                Clear search
              </Button>
            </div>
          }
        />
      ) : null}

      {undo ? (
        <div
          className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="min-w-0 truncate text-sm text-slate-600">
            {undo.label}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              ref={undoBtnRef}
              onClick={async () => {
                // Capture current focus before undo.
                lastFocusRef.current = captureFocusToken();
                const ok = await undoLast();
                if (ok) {
                  // Sprint 8: restore focus + selection to the restored row when possible.
                  const restoredId = undo?.meta?.bookId;
                  if (restoredId) {
                    const did = focusResultsAndSelectBook(restoredId);
                    if (!did) focusResultsAndSelectFirst();
                  } else {
                    focusResultsAndSelectFirst();
                  }
                } else {
                  // If undo fails, keep focus in a safe place.
                  focusFirstMatch([
                    `#${resultsId}`,
                    'input[type="search"]',
                    "input",
                    "button",
                  ]);
                }
              }}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearUndo();
                // After dismissing undo, keep focus in the results flow.
                focusFirstMatch([
                  `#${resultsId}`,
                  'input[type="search"]',
                  "input",
                  "button",
                ]);
              }}
              aria-label="Dismiss undo"
              title="Dismiss"
            >
              ✕
            </Button>
          </div>
        </div>
      ) : null}

      <BookList
        id={resultsId}
        books={visibleBooks}
        searchQuery={searchQuery}
        activeIndex={activeIndex}
        onActiveIndex={setActiveIndex}
        onEscapeToSearch={() => {
          setActiveIndex(-1);
          const el = searchRef.current;
          el?.focus();
          if (el) {
            const v = el.value;
            el.setSelectionRange?.(v.length, v.length);
          }
        }}
      />
    </div>
  );
}
