# Readr v1.4–v1.9 Parity Must-Haves

Short Operational Checklist for React Rebuild

> Progress snapshot (as of 2026-02-26)
>
> ✅ Done:
>
> - Inline editing (save/cancel) and canonical status values
> - Smarter search + looser search CTA behavior (core semantics)
>
> ⏳ Next to lock:
>
> - Undo (~6s) for books + sessions
> - Search highlighting + autocomplete
> - Sessions keyboard navigation + live region parity

This checklist extracts the **non-negotiable parity requirements**
from roadmap versions **v1.4 through v1.9**.

If any item here regresses in v2.x, parity is broken.

Use this for:

- Sprint exit criteria
- PR review
- Manual QA before marking milestones complete

---

# 🔁 v1.4 — Power-User Features

## Undo System

- [ ] Delete/finish actions support Undo (~6s window).
- [ ] Undo restores exact previous object state.
- [ ] Undo works for both books and sessions.
- [ ] Undo does not break filters/sort/search order.

## Inline Editing

- [ ] Books editable in place.
- [ ] Save persists without re-adding.
- [ ] Cancel restores original values.
- [ ] Inline editing does not break keyboard navigation.

## Smarter Search

- [ ] Fuzzy/typo tolerance works ("Hobbot" → Hobbit).
- [ ] Partial token matching works ("har pot" → Harry Potter).
- [ ] “Looser search” expands results correctly.
- [ ] No-results state renders correctly.

## Session History

- [ ] Inline edit/save/delete flows work.
- [ ] Undo restores deleted session.
- [ ] Rendering remains stable (no flicker/jump).

---

# 📚 v1.5 — Book Enhancements

- [ ] Series / Standalone flag persists.
- [ ] Digital / Physical flag persists.
- [ ] ISBN optional but stored if provided.
- [ ] Status flow: Planned → Reading → Finished works correctly.
- [ ] Bulk edit updates multiple books safely.
- [ ] Bulk edit respects active filters.

---

# 🔎 v1.6 — Search & Filters

- [ ] Dedicated Search button works alongside instant search.
- [ ] Autocomplete suggestions appear correctly.
- [ ] Multi-select filters behave correctly.
- [ ] Saved favorite filters can be reapplied.
- [ ] Clear All filters resets immediately.
- [ ] Performance acceptable with 1,000+ books.

---

# 🎯 v1.7 — Goals & Layout (If In Scope)

- [ ] Goal inputs + progress render correctly.
- [ ] Past goals browsing works.
- [ ] Streak indicators update correctly.
- [ ] Screen reader announcements present.

---

# 📊 v1.8 — Sessions & History

- [ ] Search highlighting works in titles and notes.
- [ ] ArrowUp/Down/Home/End navigation works.
- [ ] Live region updates on selection/filter changes.
- [ ] Long notes truncated + tooltip visible.
- [ ] Sorting stable and deterministic.
- [ ] Sessions import/export supported.
- [ ] Safe merge & dedupe works.

---

# 🏆 v1.9 — Visualization & Motivation

## Charts

- [ ] Per-book progress chart works.
- [ ] Per-day/weekly trend chart works.
- [ ] Charts update automatically after session changes.
- [ ] Trend ranges (weekly/monthly/yearly) function.
- [ ] Percent change math matches v1.9.
- [ ] Chart themes persist.

## Badges

- [ ] Badge unlock rules unchanged.
- [ ] Toast on unlock.
- [ ] Badges view renders correctly.
- [ ] ARIA labels present.

## Keyboard Shortcuts

- [ ] `N` opens New Session.
- [ ] Shortcut toggle persists.
- [ ] No new shortcut conflicts introduced.

## Shareable Snapshot

- [ ] Snapshot image exports correctly.
- [ ] Snapshot includes streak + progress + badges.
- [ ] Accessible text-based equivalent exists.

---

# Parity Lock Rule

Before marking any milestone complete:

- [ ] Manual walkthrough confirms no regressions.
- [ ] All parity-critical behaviors behave identically to v1.9.
