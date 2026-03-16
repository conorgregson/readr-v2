import { normalizeText, tokenize } from "./search.engine";

export type HighlightPart = {
  text: string;
  match: boolean;
};

export function getHighlightTokens(rawQuery: string): string[] {
  return tokenize(rawQuery).filter(Boolean);
}

export function getHighlightParts(
  text: string,
  rawTokens: string[],
): HighlightPart[] {
  if (!text) return [{ text: "", match: false }];

  const tokens = rawTokens.map((t) => normalizeText(t)).filter(Boolean);
  if (!tokens.length) return [{ text, match: false }];

  const map: number[] = [];
  let norm = "";

  for (let i = 0; i < text.length; i++) {
    let ch = text[i].toLowerCase();
    ch = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/[-‐-‒–—―]/.test(ch)) ch = " ";

    if (/\s/.test(ch)) {
      if (norm.endsWith(" ")) continue;
      ch = " ";
    }

    norm += ch;
    map.push(i);
  }

  const ranges: Array<[number, number]> = [];

  for (const token of tokens) {
    let start = 0;
    while (true) {
      const idx = norm.indexOf(token, start);
      if (idx === -1) break;

      const end = idx + token.length - 1;
      const origStart = map[idx] ?? 0;
      const origEnd = map[end] ?? text.length - 1;

      ranges.push([origStart, origEnd + 1]);
      start = idx + token.length;
    }
  }

  if (!ranges.length) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    if (!merged.length || r[0] > merged[merged.length - 1][1]) {
      merged.push([...r]);
    } else {
      merged[merged.length - 1][1] = Math.max(
        merged[merged.length - 1][1],
        r[1],
      );
    }
  }

  const parts: HighlightPart[] = [];
  let last = 0;

  for (const [start, end] of merged) {
    if (start > last) {
      parts.push({ text: text.slice(last, start), match: false });
    }
    parts.push({ text: text.slice(start, end), match: true });
    last = end;
  }

  if (last < text.length) {
    parts.push({ text: text.slice(last), match: false });
  }

  return parts;
}
