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

export function BooksPage() {
  const loadBooks = useBooksStore((s) => s.loadBooks);
  const isBootstrapped = useBooksStore((s) => s.isBootstrapped);

  const error = useBooksStore((s) => s.page.error);
  const setError = useBooksStore((s) => s.setError);

  const books = useBooksStore((s) => s.books);
  const addBook = useBooksStore((s) => s.addBook);

  const filters = useBooksStore((s) => s.filters);
  const setFilters = useBooksStore((s) => s.setFilters);
  const clearFilters = useBooksStore((s) => s.clearFilters);

  const searchQuery = useBooksStore((s) => s.searchQuery);
  const setSearchQuery = useBooksStore((s) => s.setSearchQuery);
  const enableLooserSearch = useBooksStore((s) => s.enableLooserSearch);

  const searchRef = useRef<HTMLInputElement | null>(null);

  const visibleBooks = useBooksStore((s) => s.visibleBooks)();

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const resultsId = "books-results";

  const [isAddOpen, setIsAddOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const focusResultsAndSelectFirst = () => {
    const list = document.getElementById(resultsId);
    if (!list) return;
    (list as HTMLElement).focus();
    setActiveIndex(0);
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
      <EmptyState
        title="No books yet"
        description="Add your first book to start tracking your reading."
        action={
          <Button
            ref={addBtnRef}
            onClick={() => {
              setError(undefined);
              setIsAddOpen(true);
            }}
          >
            Add book
          </Button>
        }
      />
    );
  }

  const showNoResults = books.length > 0 && visibleBooks.length === 0;

  return (
    <div className="space-y-4">
      <BooksToolbar
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
            addBtnRef.current?.focus();
          }}
          onSubmit={async (data) => {
            const created = await addBook(data);
            if (created) {
              setIsAddOpen(false);
              addBtnRef.current?.focus();
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
                }}
              >
                Try looser search
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery("");
                  setActiveIndex(-1);
                }}
              >
                Clear search
              </Button>
            </div>
          }
        />
      ) : null}

      <BookList
        id={resultsId}
        books={visibleBooks}
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
