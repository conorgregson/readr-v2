import { describe, it, expect } from "vitest";
import { applyFilters } from "./filters";
import type { Book, BooksFilters } from "./types";

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? "Untitled",
    author: overrides.author ?? "Unknown",
    status: overrides.status ?? "planned",
    createdAt: overrides.createdAt ?? "2026-03-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-01T10:00:00.000Z",
    genre: overrides.genre,
    series: overrides.series,
    seriesType: overrides.seriesType,
    format: overrides.format,
    formatSubtype: overrides.formatSubtype,
    isbn: overrides.isbn,
    plannedMonth: overrides.plannedMonth,
    startedAt: overrides.startedAt,
    finishedAt: overrides.finishedAt,
  };
}

function emptyFilters(): BooksFilters {
  return {
    status: [],
    authors: [],
    genres: [],
    series: [],
    tbrOnly: false,
    tbrMonth: "",
  };
}

describe("applyFilters()", () => {
  it("returns all books when filters are empty", () => {
    const books = [
      makeBook({ title: "Dune", status: "planned" }),
      makeBook({ title: "Hyperion", status: "reading" }),
    ];

    const res = applyFilters(books, emptyFilters());

    expect(res.map((b) => b.title)).toEqual(["Dune", "Hyperion"]);
  });

  it("filters by status multi-select", () => {
    const books = [
      makeBook({ title: "A", status: "planned" }),
      makeBook({ title: "B", status: "reading" }),
      makeBook({ title: "C", status: "finished" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      status: ["reading", "finished"],
    });

    expect(res.map((b) => b.title)).toEqual(["B", "C"]);
  });

  it("filters by author", () => {
    const books = [
      makeBook({ title: "Dune", author: "Frank Herbert" }),
      makeBook({ title: "Foundation", author: "Isaac Asimov" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      authors: ["Frank Herbert"],
    });

    expect(res.map((b) => b.title)).toEqual(["Dune"]);
  });

  it("filters by genre", () => {
    const books = [
      makeBook({ title: "Dune", genre: "Sci-Fi" }),
      makeBook({ title: "The Hobbit", genre: "Fantasy" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      genres: ["Sci-Fi"],
    });

    expect(res.map((b) => b.title)).toEqual(["Dune"]);
  });

  it("filters by series", () => {
    const books = [
      makeBook({ title: "Dune", series: "Dune" }),
      makeBook({ title: "Hyperion", series: "Hyperion Cantos" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      series: ["Dune"],
    });

    expect(res.map((b) => b.title)).toEqual(["Dune"]);
  });

  it("combines filters with AND logic", () => {
    const books = [
      makeBook({
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        status: "planned",
      }),
      makeBook({
        title: "Children of Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        status: "reading",
      }),
      makeBook({
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        status: "planned",
      }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      status: ["planned"],
      authors: ["Frank Herbert"],
      genres: ["Sci-Fi"],
    });

    expect(res.map((b) => b.title)).toEqual(["Dune"]);
  });

  it("is case-insensitive for author/genre/series filters", () => {
    const books = [
      makeBook({
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        series: "Dune Saga",
      }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      authors: ["frank herbert"],
      genres: ["sci-fi"],
      series: ["dune saga"],
    });

    expect(res.map((b) => b.title)).toEqual(["Dune"]);
  });

  it("tbrOnly keeps only books with plannedMonth", () => {
    const books = [
      makeBook({ title: "A", plannedMonth: "2026-03" }),
      makeBook({ title: "B" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      tbrOnly: true,
    });

    expect(res.map((b) => b.title)).toEqual(["A"]);
  });

  it("tbrMonth only applies when tbrOnly is enabled", () => {
    const books = [
      makeBook({ title: "A", plannedMonth: "2026-03" }),
      makeBook({ title: "B", plannedMonth: "2026-04" }),
      makeBook({ title: "C" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      tbrOnly: true,
      tbrMonth: "2026-04",
    });

    expect(res.map((b) => b.title)).toEqual(["B"]);
  });

  it("does not apply tbrMonth by itself when tbrOnly is false", () => {
    const books = [
      makeBook({ title: "A", plannedMonth: "2026-03" }),
      makeBook({ title: "B", plannedMonth: "2026-04" }),
      makeBook({ title: "C" }),
    ];

    const res = applyFilters(books, {
      ...emptyFilters(),
      tbrOnly: false,
      tbrMonth: "2026-04",
    });

    expect(res.map((b) => b.title)).toEqual(["A", "B", "C"]);
  });
});
