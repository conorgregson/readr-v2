import { useEffect } from "react";
import { Card } from "../../../shared/ui/Card";
import type { Book } from "../types";
import { BookCard } from "./BookCard";
import { useBooksStore } from "../store/books.store";

export function BookList({
  id,
  books,
  searchQuery,
  activeIndex,
  onActiveIndex,
  onEscapeToSearch,
}: {
  id: string;
  books: Book[];
  searchQuery: string;
  activeIndex: number;
  onActiveIndex: (i: number) => void;
  onEscapeToSearch: () => void;
}) {
  const clamp = (i: number) => Math.max(0, Math.min(i, books.length - 1));

  const selectedIds = useBooksStore((s) => s.selectedIds);
  const toggleSelected = useBooksStore((s) => s.toggleSelected);
  const activeOptionId =
    activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (books.length === 0) {
      if (activeIndex !== -1) onActiveIndex(-1);
      return;
    }
    if (activeIndex >= books.length) onActiveIndex(books.length - 1);
  }, [books.length, activeIndex, onActiveIndex]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const root = document.getElementById(id);
    const el = root?.querySelector(
      `[data-result-index="${activeIndex}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, id]);

  return (
    <ul
      id={id}
      tabIndex={0}
      role="listbox"
      aria-label="Books results"
      aria-activedescendant={activeOptionId}
      data-active-index={activeIndex}
      className="space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-slate-300 rounded-md"
      onKeyDown={(e) => {
        const keys = [
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "PageDown",
          "PageUp",
          "Escape",
        ];
        if (!keys.includes(e.key)) return;
        e.preventDefault();

        if (books.length === 0) {
          if (e.key === "Escape") onEscapeToSearch();
          return;
        }

        const current = activeIndex;

        if (e.key === "ArrowDown")
          onActiveIndex(clamp(current < 0 ? 0 : current + 1));
        else if (e.key === "ArrowUp") {
          if (current <= 0) onEscapeToSearch();
          else onActiveIndex(clamp(current - 1));
        } else if (e.key === "Home") onActiveIndex(0);
        else if (e.key === "End") onActiveIndex(books.length - 1);
        else if (e.key === "PageDown")
          onActiveIndex(clamp((current < 0 ? 0 : current) + 5));
        else if (e.key === "PageUp") {
          if (current <= 0) onEscapeToSearch();
          else onActiveIndex(clamp(current - 5));
        } else if (e.key === "Escape") onEscapeToSearch();
      }}
    >
      {books.map((b, i) => {
        const active = i === activeIndex;
        const selected = selectedIds.includes(b.id);

        return (
          <li
            key={b.id}
            id={`${id}-option-${i}`}
            role="option"
            aria-selected={active}
            data-result-index={i}
            data-book-result-id={b.id}
          >
            <Card
              className={[
                active ? "ring-2 ring-slate-300" : "",
                selected ? "ring-2 ring-blue-200 bg-blue-50/40" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <BookCard
                book={b}
                searchQuery={searchQuery}
                isSelected={selected}
                onToggleSelected={() => toggleSelected(b.id)}
              />
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
