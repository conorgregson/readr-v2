import { useEffect } from "react";
import { Card } from "../../../shared/ui/Card";
import type { Book } from "../types";
import { BookCard } from "./BookCard";

export function BookList({
  id,
  books,
  activeIndex,
  onActiveIndex,
  onEscapeToSearch,
}: {
  id: string;
  books: Book[];
  activeIndex: number;
  onActiveIndex: (i: number) => void;
  onEscapeToSearch: () => void;
}) {
  const clamp = (i: number) => Math.max(0, Math.min(i, books.length - 1));

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
      data-active-index={activeIndex}
      className="space-y-3 outline-none"
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
        return (
          <li
            key={b.id}
            role="option"
            aria-selected={active}
            data-result-index={i}
          >
            <Card className={active ? "ring-2 ring-slate-300" : ""}>
              <BookCard book={b} />
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
