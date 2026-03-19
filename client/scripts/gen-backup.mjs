import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUTPUT_DIR = path.resolve(process.cwd(), "scripts", "out");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "readr-backup-v2.2-seed.json");

// Change these counts anytime
const BOOKS_COUNT = 500;
const SESSIONS_COUNT = 500;

// --- helpers -------------------------------------------------

function isoNow() {
  return new Date().toISOString();
}

function yyyyMmDd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Deterministic-ish “random” from a seed (so you can regen the same dataset)
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function chance(rng, p) {
  return rng() < p;
}

function intBetween(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// --- data pools ----------------------------------------------

const AUTHORS = [
  "Brandon Sanderson",
  "Agatha Christie",
  "Toni Morrison",
  "George Orwell",
  "Ursula K. Le Guin",
  "Stephen King",
  "Neil Gaiman",
  "Octavia E. Butler",
  "Haruki Murakami",
  "Jane Austen",
  "James Baldwin",
  "Donna Tartt",
  "Andy Weir",
  "RF Kuang",
  "Sally Rooney",
];

const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Thriller",
  "Romance",
  "Nonfiction",
  "Biography",
  "History",
  "Literary",
  "Horror",
];

const SERIES = [
  "Stormlight Archive",
  "Mistborn",
  "The Expanse",
  "Lord of the Rings",
  "Dune",
  "Harry Potter",
  "Discworld",
  "Standalone",
];

const FORMAT_PARENT = ["digital", "physical"];
const FORMAT_SUBTYPE = ["Hardcover", "Paperback", "ebook", "Audiobook", "PDF"];

// --- generators ----------------------------------------------

function genBook(rng, idx) {
  const now = isoNow();

  const title = `Seed Book ${idx + 1}`;
  const author = pick(rng, AUTHORS);

  const statusRoll = rng();
  const status =
    statusRoll < 0.55 ? "planned" : statusRoll < 0.85 ? "reading" : "finished";

  // optional metadata
  const genre = chance(rng, 0.75) ? pick(rng, GENRES) : undefined;

  const seriesName = pick(rng, SERIES);
  const isStandalone = seriesName === "Standalone";
  const series = !isStandalone && chance(rng, 0.55) ? seriesName : undefined;

  const seriesType = series
    ? "series"
    : chance(rng, 0.7)
      ? "standalone"
      : undefined;

  const format = chance(rng, 0.85) ? pick(rng, FORMAT_PARENT) : undefined;
  const formatSubtype = format ? pick(rng, FORMAT_SUBTYPE) : undefined;

  const plannedMonth = chance(rng, 0.35)
    ? `2026-${String(intBetween(rng, 1, 12)).padStart(2, "0")}`
    : undefined;

  // timestamps parity-ish
  const createdAt = now;
  const updatedAt = now;

  let startedAt;
  let finishedAt;

  if (status === "reading" || status === "finished") {
    startedAt = now;
  }
  if (status === "finished") {
    finishedAt = now;
  }

  return {
    id: crypto.randomUUID(),
    title,
    author,
    status,
    createdAt,
    updatedAt,
    startedAt,
    finishedAt,
    genre,
    series,
    seriesType,
    format,
    formatSubtype,
    isbn: chance(rng, 0.2)
      ? String(intBetween(rng, 1000000000, 9999999999))
      : undefined,
    plannedMonth,
  };
}

function genSession(rng, bookId) {
  const now = isoNow();

  // random date within last ~180 days
  const daysAgo = intBetween(rng, 0, 180);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);

  const pages = chance(rng, 0.6) ? intBetween(rng, 5, 60) : undefined;
  const minutes = pages
    ? chance(rng, 0.25)
      ? intBetween(rng, 10, 90)
      : undefined
    : intBetween(rng, 10, 90);

  return {
    id: crypto.randomUUID(),
    bookId,
    date: yyyyMmDd(d),
    pages,
    minutes,
    notes: chance(rng, 0.35) ? "Seed session notes." : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

// --- main ----------------------------------------------------

function main() {
  const rng = mulberry32(1337);

  const books = Array.from({ length: BOOKS_COUNT }, (_, i) => genBook(rng, i));
  const bookIds = books.map((b) => b.id);

  const sessions = Array.from({ length: SESSIONS_COUNT }, () => {
    const bookId = pick(rng, bookIds);
    return genSession(rng, bookId);
  });

  const backup = {
    app: "readr",
    version: "2.2",
    exportedAt: isoNow(),
    books,
    sessions,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(backup, null, 2), "utf8");

  console.log(`[OK] Wrote ${OUTPUT_FILE}`);
  console.log(`[OK] Books: ${books.length}, Sessions: ${sessions.length}`);
}

main();
