# Portfolio Synthesis — `README.md` simplification

**Lenses applied:** pedagogy (06), rejected-paths (09)
**Target:** `/home/mike1/projects/main/workflow-server/README.md`
**Date:** 2026-06-29
**Per-lens artifacts:** [`14-portfolio-pedagogy.md`](14-portfolio-pedagogy.md), [`14-portfolio-rejected-paths.md`](14-portfolio-rejected-paths.md)

Two independent lenses examined the README. Pedagogy asked *which of this README's habits a simplifier will unconsciously repeat*; rejected-paths asked *which "fixes" trade a visible problem for a hidden one*. They were executed independently; this synthesis maps where they converge (high confidence) and where each found something unique (the value-add).

---

## Convergent findings (both lenses, independently — high confidence)

| Finding | Pedagogy framing | Rejected-paths framing |
|---------|------------------|------------------------|
| **CF1 — "Simplify" must not become "drop or relocate facts."** The single densest fragment (dotted field paths in How-It-Works steps 2–3) is the prime target, and the prime hazard. | The writer "keeps the jargon because removing it feels like dropping coverage," conflating wording with facts (C1) | The first move under pressure is to push step 2–3 mechanics to the API reference and delete the field names — silently migrating completeness from visible to hidden (P1) |
| **CF2 — Leave the "five concerns" count alone in the rewrite; escalate, don't silently edit.** | Writer simplifies *around* the number and propagates the 5-vs-6 inaccuracy in cleaner prose (C4) | Dropping the count fixes the contradiction but loses an at-a-glance scale cue and edits a frozen fact (P2) |
| **CF3 — The structure/coverage freeze is the safety rail; the real lever is sentence-level density + term ordering.** | The freeze "leaks" from structure to phrasing — but phrasing is exactly what should move (the pedagogy law) | The freeze forbids the cheap restructure fix, forcing simplification *within* prose where over-correction becomes a visible regression (the law) |

These three are the load-bearing guidance for the implementation activity. Because two independent operations reached them, confidence is high.

## Divergent / unique findings (each lens alone — the portfolio value-add)

| Lens | Unique finding |
|------|----------------|
| Pedagogy | **U1 — Term-before-gloss is the failure that ships looking successful.** Render + diff both pass; the only symptom is a newcomer who still can't orient — the slowest signal to attribute back to phrasing. Mitigation: introduce each term in plain words *before* naming it (esp. "fidelity-enforced", "techniques", in the tagline/Overview). |
| Pedagogy | **U2 — Density is ideas-per-sentence, not word length.** A "shorter words" rewrite leaves three facts per sentence and feels improved while the cliff remains. Mitigation: one idea per sentence; let the numbered list carry sequence. |
| Rejected-paths | **U3 — The most dangerous rejected "fix" is splitting audiences — that *is* restructuring** and would break the nav anchor `#-quick-start` and external deep-links. Names a concrete hidden contract (anchors/links) the prose reviewer won't think to check. |
| Rejected-paths | **U4 — `session_index` vs "session token" is a genuine fork**, not just imprecision: precision improves correctness but meets the newcomer with an opaque identifier sooner. Recommendation: keep the README's existing "session token" wording (safest under a prose-only freeze) rather than introducing a new term. |
| Rejected-paths | **U5 — Tool-roster drift (README 16 vs api-reference 15, missing `dispatch_child`) tempts a "single source of truth" fix that escapes the single-file scope** (`src/`/build). Out of scope; record as a follow-up. |

## Summary table — all findings with attribution

| ID | Finding | Lens(es) | Convergent / Unique | Actionable guidance for implementation |
|----|---------|----------|--------------------|----------------------------------------|
| CF1 | Reword dense step 2–3 in place; never delete/relocate the field facts | pedagogy + rejected-paths | Convergent | Keep tool names + a plain gloss; lean on the linked API reference for exact paths |
| CF2 | Don't silently edit the "five concerns" count | pedagogy + rejected-paths | Convergent | Flag 5-vs-6 to plan-prepare; leave verbatim unless planning rules a one-word fix in scope |
| CF3 | Freeze = structure & coverage; lever = density & term order | pedagogy + rejected-paths | Convergent | Reword within each section only; preserve headings, order, links, anchors, code blocks |
| U1 | Term-before-gloss ships looking successful | pedagogy | Unique | Introduce terms in plain words before naming them |
| U2 | Density = ideas/sentence, not word length | pedagogy | Unique | One idea per sentence; lean on the numbered list |
| U3 | Audience-split = forbidden restructure; breaks anchors/links | rejected-paths | Unique | Do not split sections; verify `#-quick-start` + relative links survive |
| U4 | `session_index` vs "session token" is a real fork | rejected-paths | Unique | Keep existing "session token" wording under the prose-only freeze |
| U5 | Tool-roster drift tempts out-of-scope fix | rejected-paths | Unique | Out of scope; follow-up only (touches `docs/`/`src/`) |

## Bottom line for downstream activities

Simplification = **reduce ideas-per-sentence and introduce terms in plain language before naming them**, applied *within* each existing prose section. Keep every tool name, count, link, anchor, and code/command block verbatim. The two dense How-It-Works steps are the highest-value targets; reword them, do not relocate their facts. Treat the "five concerns" count and the api-reference tool-roster drift as flag-to-planning / out-of-scope, not silent edits.

---
*Cross-lens synthesis. Source lenses: pedagogy (06), rejected-paths (09).*
