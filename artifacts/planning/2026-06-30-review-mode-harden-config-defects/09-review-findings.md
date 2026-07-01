# Lean-Coding Audit — Over-Engineering Review Findings

**Activity:** `lean-coding-audit` (work-package) · **Session:** CF5LX4 · **Date:** 2026-06-30
**Change under review:** commit `c6e10666` — review-mode hardening (#145). 9 definition files (markdown + YAML), `+190 / -3` lines.
**Lens:** ponytail over-engineering taxonomy (delete / stdlib / native / yagni / shrink). Applied to DEFINITION content — redundant prose, over-specified protocol, duplication across techniques, unnecessary new abstractions.
**Out of scope (safety floor):** the five #145 augmentations' required behavior, schema validity, bound-step purity (AP-64), AP conformance, documentation voice, E2E harness staying green. These are never tagged here.

---

## Findings

`<file>:<loc>: <tag> <what>. <replacement>.`

- `review-code.md:L43-49` + `structural-analysis.md:L50-57`: **yagni** the "Associated-type / trait-impl swap" sub-check duplicates the producer/clearer ledger's core procedure. Both enumerate every create/produce site against every clear site across *unchanged upstream* code and trace *every* termination path for an unmatched-clearer imbalance. Two techniques now carry the same set-wide lifecycle-balance walk. Collapse `review-code`'s body to the trigger + a pointer at the structural lens's ledger (the canonical owner per DD-2), keeping only the `Config`/associated-type *trigger condition* and the severity-routing sentence local. Saves ~5 lines of restated procedure and removes the second copy of the conservation walk. **(Net effect: behavior preserved — review-code still fires on a Config swap; it just delegates the "how" to the ledger instead of re-specifying it.)**

- `review-existing-feedback.md:L60-72` (Rules block): **shrink** four rules largely restate protocol steps already written above them. `ingest-before-analysis` restates Protocol §1's "before any independent analysis"; `every-prior-finding-dispositioned` restates §2's Confirmed/Refuted/Superseded; `unaddressed-blocker-caps-rating` restates §3; `single-ingest-of-reported-failures` restates the §2 reported-failure tag + the Output note. The rules add enforcement emphasis but no new constraint. Could shrink to the one rule that is genuinely load-bearing and non-obvious from the protocol (`single-ingest-of-reported-failures`, the DD-4 double-count guard) and drop the three that echo their own steps. Saves ~9 lines. **(Judgment: KEEP — see recommendation; rules carry normative weight in this codebase's technique grammar and the redundancy is conventional, not accidental.)**

- `review-code.md:L48`: **shrink** the "Treat the unchanged upstream code as in-scope evidence — the imbalance often lives in code the diff never touched" bullet restates the point already made in the sub-check's opening sentence ("the blast radius extends beyond the changed line … including unchanged upstream code that now resolves to the swapped type"). One of the two statements of "look at unchanged upstream code" is redundant. Saves 1 line. **(Subsumed by the first finding if review-code is collapsed to a pointer.)**

- `review-mode.md:L380` (correct-but-harmful render paragraph): **shrink** the sentence re-enumerates the four impact axes ("unbounded state growth, economic/spam, liveness/halt, or migration/upgrade") that `findings-classification.md` already defines as the canonical list. The render-boundary prose only needs "a finding classified Major or Critical on an impact axis renders at High or Critical" — the axis list belongs to the classifier, not the render doc. Replace the parenthetical enumeration with "on an impact axis (see findings-classification)". Saves ~1 line, removes a second maintenance site for the axis list. **(Borderline: the enumeration aids a reader of review-mode.md in isolation; low-value either way.)**

---

## Scoreboard

`net: -6 lines possible` (across the genuinely-actionable findings: ~5 from the aug-2/aug-3 collapse + ~1 from the upstream-evidence dedup, which is subsumed by it).

The change is **not over-engineered in substance** — every one of the five augmentations maps to a distinct required behavior in #145, none introduces an abstraction without a concrete present caller, and no dead/unused construct exists. The findings above are prose-leanness candidates within otherwise-warranted content, not structural bloat. The single material candidate is the aug-2/aug-3 procedural duplication.
