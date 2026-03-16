import type { Book } from "../types";

export type SearchField =
  | "title"
  | "author"
  | "series"
  | "genre"
  | "isbn"
  | "format"
  | "formatSubtype";

// Resolved weights must include all fields
export type FieldWeights = Record<SearchField, number>;

export type SmartSearchOptions = {
  fuzzyMaxDistance?: number; // v1.9 override (e.g., 2 for looser search)
  limit?: number; // v1.9: 500
  fields?: Partial<FieldWeights>; // allow callers to override a subset
};

type ResolvedSmartSearchOptions = {
  fuzzyMaxDistance: number;
  limit: number;
  fields: FieldWeights;
};

export type SearchResult<T> = {
  ref: T;
  score: number;
};

const DEFAULT_LIMIT = 500;
const DEFAULT_FUZZY_MAX = 1;

const PHRASE_BONUS = 10;

// Small word-start / prefix nudge so “dun…” ranks Dune first
const WORD_START_BONUS = 2;

// --- Normalization ----------------------------------------------------------

export function normalizeText(input: string): string {
  // v1.9 behavior requirements:
  // - diacritics normalized
  // - hyphens converted to spaces
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining marks
    .replace(/[-‐-‒–—―]/g, " ") // hyphen variants -> space
    .toLowerCase()
    .trim();
}

/**
 * Tokenize like v1.9 expectations:
 * - quoted phrases become a single token without quotes
 * - unquoted: split on whitespace
 * - normalized (diacritics removed, hyphens to spaces)
 */
export function tokenize(rawQuery: string): string[] {
  const q = normalizeText(rawQuery);
  if (!q) return [];

  const tokens: string[] = [];
  const re = /"([^"]+)"|(\S+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(q))) {
    const phrase = m[1];
    const word = m[2];

    const value = (phrase ?? word ?? "").trim();
    if (!value) continue;

    tokens.push(value);
  }

  return tokens;
}

// --- Damerau–Levenshtein (optimal string alignment) ------------------------

export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const dp: number[][] = Array.from({ length: al + 1 }, () =>
    Array(bl + 1).fill(0),
  );

  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;

  for (let i = 1; i <= al; i++) {
    const ca = a[i - 1];
    for (let j = 1; j <= bl; j++) {
      const cb = b[j - 1];

      const cost = ca === cb ? 0 : 1;

      let best = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );

      // transposition
      if (i > 1 && j > 1 && ca === b[j - 2] && a[i - 2] === cb) {
        best = Math.min(best, dp[i - 2][j - 2] + 1);
      }

      dp[i][j] = best;
    }
  }

  return dp[al][bl];
}

function wordStartBonus(fieldText: string, token: string): number {
  if (!token) return 0;
  const re = new RegExp(`(^|\\s)${escapeRegExp(token)}`);
  return re.test(fieldText) ? WORD_START_BONUS : 0;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- Matching / Scoring -----------------------------------------------------

function getFieldText(b: Book, field: SearchField): string {
  const raw = b[field];
  return normalizeText(String(raw ?? ""));
}

/**
 * Match a single token against a string:
 * - exact substring match is strongest
 * - else fuzzy match against individual words with Damerau distance <= maxDist
 */
function scoreTokenInField(
  fieldText: string,
  token: string,
  maxDist: number,
): number {
  if (!token) return 0;

  // Exact / contains
  if (fieldText.includes(token)) {
    return 6 + wordStartBonus(fieldText, token);
  }

  // Fuzzy: compare against words
  const words = fieldText.split(/\s+/).filter(Boolean);
  let best = 0;

  for (const w of words) {
    const d = editDistance(token, w);
    if (d <= maxDist) {
      const s = maxDist - d + 1 + wordStartBonus(fieldText, token);
      if (s > best) best = s;
    }
  }

  return best;
}

/**
 * AND semantics across tokens:
 * every token must match at least one field.
 */
function scoreBook(
  b: Book,
  tokens: string[],
  rawQuery: string,
  opts: ResolvedSmartSearchOptions,
): number | null {
  const fields = Object.entries(opts.fields) as Array<[SearchField, number]>;

  // Normalize once
  const normalizedQuery = normalizeText(rawQuery);
  const normalizedTokens = tokens.map((t) => normalizeText(t));

  let total = 0;

  for (const token of normalizedTokens) {
    let tokenBest = 0;

    for (const [field, weight] of fields) {
      if (weight <= 0) continue;
      const text = getFieldText(b, field);
      const s = scoreTokenInField(text, token, opts.fuzzyMaxDistance) * weight;
      if (s > tokenBest) tokenBest = s;
    }

    // AND semantics: if any token fails to match, reject book
    if (tokenBest <= 0) return null;
    total += tokenBest;
  }

  // Phrase bonus:
  const phraseMatches = extractQuotedPhrases(normalizedQuery);
  if (phraseMatches.length) {
    for (const phrase of phraseMatches) {
      let hit = false;
      for (const [field, weight] of fields) {
        if (weight <= 0) continue;
        const text = getFieldText(b, field);
        if (text.includes(phrase)) {
          hit = true;
          break;
        }
      }
      if (hit) total += PHRASE_BONUS;
    }
  }

  return total;
}

function extractQuotedPhrases(q: string): string[] {
  const phrases: string[] = [];
  const re = /"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(q))) {
    const p = (m[1] ?? "").trim();
    if (p) phrases.push(p);
  }
  return phrases;
}

// --- Public API -------------------------------------------------------------

export function smartSearch(
  items: Book[],
  rawQuery: string,
  options: SmartSearchOptions = {},
): Array<SearchResult<Book>> {
  const tokens = tokenize(rawQuery);
  if (!tokens.length) {
    // no query -> everything, score 0
    return (items ?? [])
      .slice(0, options.limit ?? DEFAULT_LIMIT)
      .map((ref) => ({
        ref,
        score: 0,
      }));
  }

  const opts: ResolvedSmartSearchOptions = {
    fuzzyMaxDistance: options.fuzzyMaxDistance ?? DEFAULT_FUZZY_MAX,
    limit: options.limit ?? DEFAULT_LIMIT,
    fields: {
      title: 3,
      author: 2,
      series: 1,
      genre: 1,
      isbn: 1,
      format: 1,
      formatSubtype: 1,
      ...(options.fields ?? {}),
    },
  };

  const results: Array<SearchResult<Book>> = [];

  for (const b of items ?? []) {
    const score = scoreBook(b, tokens, rawQuery, opts);
    if (score == null) continue;
    results.push({ ref: b, score });
  }

  results.sort((a, b) => {
    // higher score first
    if (b.score !== a.score) return b.score - a.score;

    // tie-break: prefer title prefix matches like v1.9 did
    const needle = normalizeText(rawQuery);
    const at = normalizeText(a.ref.title ?? "");
    const bt = normalizeText(b.ref.title ?? "");
    const aa = normalizeText(a.ref.author ?? "");
    const ba = normalizeText(b.ref.author ?? "");

    const ap = at.startsWith(needle) ? 0 : 1;
    const bp = bt.startsWith(needle) ? 0 : 1;
    if (ap !== bp) return ap - bp;

    const aap = aa.startsWith(needle) ? 0 : 1;
    const bbp = ba.startsWith(needle) ? 0 : 1;
    if (aap !== bbp) return aap - bbp;

    return String(a.ref.title || "").localeCompare(String(b.ref.title || ""));
  });

  return results.slice(0, opts.limit);
}
