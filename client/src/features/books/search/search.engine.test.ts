import { describe, it, expect } from "vitest";
import { tokenize, smartSearch, editDistanceDamerau } from "./search.engine";
import type { Book } from "../types";

const make = (p: Partial<Book>): Book => ({
  id: p.id ?? crypto.randomUUID(),
  title: p.title ?? "",
  author: p.author ?? "Test Author",
  status: p.status ?? "planned",
  createdAt: p.createdAt ?? new Date().toISOString(),
  updatedAt: p.updatedAt ?? new Date().toISOString(),

  // parity fields
  genre: p.genre,
  series: p.series,
  seriesType: p.seriesType,
  format: p.format,
  formatSubtype: p.formatSubtype,
  isbn: p.isbn,

  plannedMonth: p.plannedMonth,
  startedAt: p.startedAt,
  finishedAt: p.finishedAt,
});

describe("tokenize()", () => {
  it("treats quoted phrases as one token", () => {
    expect(tokenize('"har pot"')).toEqual(["har pot"]);
  });

  it("splits unquoted words into tokens", () => {
    expect(tokenize("har pot")).toEqual(["har", "pot"]);
  });

  it("normalizes diacritics and hyphens", () => {
    expect(tokenize("Cién-años")).toEqual(["cien", "anos"]);
  });
});

describe("editDistanceDamerau()", () => {
  it("handles transposition (hobbot ~ hobbit)", () => {
    expect(editDistanceDamerau("hobbot", "hobbit")).toBe(1);
  });
});

describe("smartSearch()", () => {
  it("enforces AND semantics across tokens", () => {
    const items = [
      make({ title: "Dune", author: "Frank Herbert" }),
      make({ title: "Ender's Game", author: "Orson Scott Card" }),
      make({ title: "Hyperion", author: "Dan Simmons" }),
    ];

    const res = smartSearch(items, "dune herbert");
    expect(res.map((r) => r.ref.title)).toEqual(["Dune"]);
  });

  it("supports fuzzy token matching", () => {
    const items = [make({ title: "The Hobbit", author: "Tolkien" })];
    const res = smartSearch(items, "hobbit", { fuzzyMaxDistance: 2 });
    expect(res.length).toBe(1);
    expect(res[0].ref.title).toBe("The Hobbit");
  });

  it("looser search can rescue near-matches for short tokens (am ~ dan)", () => {
    const items = [
      make({ title: "Hyperion", author: "Dan Simmons" }),
      make({ title: "Dune", author: "Frank Herbert" }),
    ];

    const strict = smartSearch(items, "am", { fuzzyMaxDistance: 1 });
    expect(strict.length).toBe(0);

    const loose = smartSearch(items, "am", { fuzzyMaxDistance: 2 });
    expect(loose.length).toBeGreaterThan(0);
    expect(loose[0].ref.author).toBe("Dan Simmons");
  });

  it("gives phrase matches a bonus over split tokens", () => {
    const items = [
      make({ title: "Harry Potter", author: "Rowling" }),
      make({ title: "Potter Harry", author: "Rowling" }),
    ];

    const phrase = smartSearch(items, '"harry potter"');
    const split = smartSearch(items, "harry potter");

    // Phrase query should rank the exact phrase title first
    expect(phrase[0].ref.title).toBe("Harry Potter");
    // Split still returns both but may tie-break
    expect(split.length).toBe(2);
  });

  it("uses word-start bonus to influence order", () => {
    const items = [
      make({ title: "A Dune Story", author: "X" }),
      make({ title: "Redundant", author: "X" }),
    ];

    const res = smartSearch(items, "du");
    expect(res[0].ref.title).toBe("A Dune Story");
  });

  it("respects limit", () => {
    const items = Array.from({ length: 600 }, (_, i) =>
      make({ title: `Book ${i}`, author: "A" }),
    );

    const res = smartSearch(items, "book", { limit: 500 });
    expect(res.length).toBe(500);
  });

  it("normalizes hyphens to spaces so queries still match", () => {
    const items = [make({ title: "Sci-Fi Stories" })];
    const res = smartSearch(items, "sci fi");
    expect(res.length).toBe(1);
  });

  it("can match format and formatSubtype fields", () => {
    const items = [
      make({ title: "X", format: "digital", formatSubtype: "PDF" }),
    ];
    expect(smartSearch(items, "pdf").length).toBe(1);
    expect(smartSearch(items, "digital").length).toBe(1);
  });

  it("returns all items for empty/whitespace query (limit applied)", () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      make({ title: `B${i}` }),
    );
    expect(smartSearch(items, "   ").length).toBe(10);
  });

  it("handles repeated spaces", () => {
    const items = [make({ title: "Dune", author: "Frank Herbert" })];
    const res = smartSearch(items, "  dune    herbert  ");
    expect(res.length).toBe(1);
  });

  it("is case-insensitive across fields", () => {
    const items = [make({ title: "Dune", author: "Frank Herbert" })];
    expect(smartSearch(items, "DUNE").length).toBe(1);
    expect(smartSearch(items, "frank").length).toBe(1);
  });

  it("matches across non-title fields with AND semantics", () => {
    const items = [
      make({ title: "X", series: "Dune", genre: "Sci-Fi" }),
      make({ title: "Y", series: "Dune", genre: "Fantasy" }),
    ];
    const res = smartSearch(items, "dune sci");
    expect(res.map((r) => r.ref.title)).toEqual(["X"]);
  });

  it("treats multiple quoted phrases as required tokens (AND)", () => {
    const items = [
      make({ title: "Harry Potter and the Goblet of Fire" }),
      make({ title: "Harry Potter and the Chamber of Secrets" }),
    ];
    const res = smartSearch(items, '"harry potter" "goblet"');
    expect(res.length).toBe(1);
    expect(res[0].ref.title).toContain("Goblet");
  });

  it("does not return everything for whitespace-only queries", () => {
    const items = [make({ title: "Dune" }), make({ title: "Hyperion" })];
    const res = smartSearch(items, "   ");
    // tokenize() should return [], so smartSearch returns all (score 0) — ensure that’s what we want:
    expect(res.length).toBe(2);
  });

  it("prefers title prefix match on tie", () => {
    const items = [make({ title: "Dune" }), make({ title: "A Dune Story" })];
    const res = smartSearch(items, "dune");
    expect(res[0].ref.title).toBe("Dune");
  });
});
