# Simplify workflow-server README prose — Implementation Plan

**Date:** 2026-06-29
**Priority:** LOW (accessibility/clarity improvement; no defect, no behavioural risk)
**Status:** Ready
**Estimated Effort:** 30-60m agentic + ~30-45m human review (tone/voice is the longer pole)

---

## Overview

### Problem Statement

The repository-root `README.md` is the first document most people read, but its prose sections pack several facts into each sentence. A newcomer who is not already fluent in the project's terminology has to absorb too much at once to get oriented. The information is accurate; the wording is the barrier. This work package rewords the prose so a general reader can follow each section quickly, while keeping every section, heading, and their order exactly as they are.

### Scope

**In Scope:**
- Reword the prose inside the README's existing sections to reduce ideas-per-sentence and introduce loaded terms before naming them.
- Apply the change within the frozen structure: same sections, same headings, same order.
- Preserve every fact, tool name, dotted field path, count, link, anchor, and code/JSON/command block verbatim.

**Out of Scope (with reasons):**
- Server source (`src/`, `schemas/`), workflow YAML, and any other doc under `docs/` — the work package is single-file (`README.md`) and prose-only.
- Restructuring: no section may be split, merged, reordered, added, or dropped (e.g. no newcomer-vs-reference audience split). Restructuring would change the deliverable, add review risk, and break the `#-quick-start` nav anchor and external deep-links.
- Editing the README's diagram, tables, or code/command blocks — these are content, not prose.
- **Q6** (`docs/api-reference.md` missing `dispatch_child`) — another file; recommended as a separate follow-up (see Deferred Decisions).

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Comprehension:** [`../../comprehension/readme-prose.md`](../../comprehension/readme-prose.md) — section map, density hotspots, accuracy traces, link/anchor contract, glossary.
- **Knowledge Base Research:** [`04-kb-research.md`](04-kb-research.md) — plain-language conventions mapped to the hotspots.
- **Implementation Analysis:** [`05-implementation-analysis.md`](05-implementation-analysis.md) — prose-unit → simplification-move map, density baselines, gaps G1–G8.
- **Portfolio lenses:** [`14-portfolio-synthesis.md`](14-portfolio-synthesis.md) — convergent guidance and rejected "fixes".

### Key Findings Summary

**From KB Research (the plain-language checklist this plan is built on):**
- **One idea per sentence (15–20 words).** "Density" is ideas-per-sentence, not word length — a "shorter words" rewrite would leave the cliff intact.
- **Term-before-gloss.** Introduce each loaded term ("workflow", "fidelity-enforced", "technique", the bundle concept) in plain words before naming it. This is term-ordering *inside* prose, not a restructure.
- **Lead with the main point; active voice; keep subject and verb close.**
- **Progressive disclosure within the frozen structure** — the only sanctioned lever is sentence-level density plus term ordering applied within each existing section.
- **Preserve all facts** — soften the prose *around* the jargon; lean on the already-linked `docs/api-reference.md` for exact field paths without deleting them from the README.

**From Implementation Analysis (baselines and gaps):**
- **Baseline:** How-It-Works steps 2 & 3 each carry ~4–5 ideas per sentence (the density cliff); the tagline fronts 3 loaded terms before any gloss; every other prose unit is "light".
- **Gap:** The density is *concentrated* in two sentences (steps 2 & 3) — the highest-leverage edit.
- **Opportunity:** Splitting those two sentences into one-idea sentences removes ~80% of the perceived density for the least surface area.

---

## Proposed Approach

### Solution Design

Apply one technique uniformly across the prose: **reduce ideas-per-sentence and order terms before their gloss, in place, within each existing section.** Work highest-leverage first (the two How-It-Works sentences), then the tagline/Overview term ordering, then light rewording of the remaining prose units. No section, heading, ordering, table, diagram, link, anchor, or code block changes. The dotted-field jargon in steps 2–3 is softened to a plain gloss while its field facts stay in the sentence and the already-present `docs/api-reference.md` link continues to hold the exact paths.

This is a **wording transform over an already-accurate model** (comprehension confirmed every fact is correct), so the rewrite never re-derives content — it restates it.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Reword prose in place within frozen structure | Only lever compatible with the structure/coverage freeze; directly targets the density cliff | Requires careful per-sentence judgement | **Selected** |
| Prose + restructure (e.g. split newcomer vs. reference audience) | Could separate onboarding from reference | Forbidden restructure; breaks `#-quick-start` anchor and external deep-links; changes the deliverable | Rejected |
| "Shorter words" pass only | Trivial to apply | Leaves 3+ ideas per sentence; feels improved but the cliff remains (RS-3 / portfolio U2) | Rejected |
| Relocate steps 2–3 mechanics to the API reference, delete field names | Shortest onboarding sentence | Silent coverage loss — the prime anti-pattern (CF1/P1); migrates completeness from visible to hidden | Rejected |

### Assumptions

The approach rests on the assumptions already surfaced and confirmed/validated in [`02-assumptions-log.md`](02-assumptions-log.md) (DP-1..DP-3, RS-1..RS-4, IA-1..IA-4 — all confirmed or validated, none open). In particular: density is concentrated in steps 2–3 (IA-1), the bundle-field jargon can be softened in place because the linked api-reference holds the exact paths and the README's own field facts are not deleted (IA-3), and the README's only consumers are humans and Markdown tooling so the enumerated link/anchor/code-block invariants are complete (IA-4). Planning-phase assumptions are recorded in the same log under the Planning section.

---

## Implementation Tasks

Tasks are ordered by leverage (highest-density edit first) and grouped so each is independently committable. Each task names the README prose unit it changes, the move from the plain-language checklist, and the success criterion (gap ID from the analysis) it satisfies. Line references are to the current `README.md` and are approximate anchors, not edit instructions — the edit target is the named prose unit.

### Task 1: Rewrite How-It-Works steps 2 & 3 (G1, G2)

**Goal:** Remove the density cliff — the two highest-density sentences in the file.
**Prose units:** `### How It Works` step 2 (L23) and step 3 (L24).
**Move:** Split each numbered step into several one-idea sentences (15–20 words). Soften the dotted-field clauses *in place*: step 2's `techniques.workflow` bundled under `techniques`/`rules` to a plain gloss such as "along with the techniques and rules it needs"; step 3's em-dash `techniques.activity` + `techniques[]` clause to "plus the techniques that activity uses". Lead each sentence with what the tool does.
**Preserve:** Tool names `start_session`, `get_workflow`, `next_activity`, `get_activity`, `get_resource`; `initialActivity`; the parenthetical "(steps, checkpoints, transitions)"; the four-step numbered structure; the existing "session token" wording (do not introduce `session_index`).
**Success criterion:** Steps 2 & 3 each read as one-idea sentences (~1 idea/sentence) with the bundle clauses softened but no field fact, tool name, or `initialActivity` removed.

### Task 2: Apply term-before-gloss to the tagline and Overview (G3, G4)

**Goal:** Smooth the on-ramp so the reader meets each loaded term in plain words before it is named.
**Prose units:** Tagline (L8) and the `## 🎯 Overview` paragraph (L16–18).
**Move:** Split the tagline into two short sentences; introduce "workflow" in plain words before qualifying it; gloss "fidelity-enforced" in plain words (or a plain paraphrase). Reword the Overview paragraph to one idea per sentence in active voice, leading with what the server does.
**Preserve:** The load-bearing terms "MCP server", "workflow", "fidelity-enforced" (kept, with a plain gloss); the `## 🎯 Overview` heading and the `[IDE rule](docs/ide-setup.md)` link; the discover/navigate/execute relationship to the How-It-Works verbs.
**Success criterion:** Each loaded term's first appearance is preceded by a plain-words introduction; tagline and Overview sentences carry ~1 idea each; no link or fact dropped.

### Task 3: Light reword of Architecture bullets, Engineering layout prose, and Quick Start prose glue (G5, G7, G8)

**Goal:** Apply the same one-idea-per-sentence and active-voice rule to the remaining lighter prose, so simplification is consistent across the file.
**Prose units:** `### Architecture` four bullets (L33–36); `## Engineering layout` intro sentence (L142); Quick Start connective prose (around L93, L97, L104, L108, L112, L138).
**Move:** Plainer bullet wording for the four Architecture bullets; plainer phrasing for the Engineering layout sentence; one-idea-per-sentence rewording of the short connective sentences in Quick Start where dense.
**Preserve (verbatim):** The `User Goal → Workflow → Activities → Techniques → Tools` diagram; the Architecture bullet structure; the Engineering layout directory-structure bullets; every command, JSON, and `curl` block in Quick Start; all relative and external links; the `#-quick-start` nav anchor (heading text byte-identical).
**Success criterion:** Reworded prose reads at ~1 idea/sentence; the diagram, bullets' directory entries, and all code/JSON/command blocks are unchanged; canonical term "Technique" retained.

### Task 4: Disposition of the "five concerns" count wrinkle (G6 / Q2) — see Deferred Decisions

**Goal:** Resolve the one deferred in-file fact decision explicitly rather than silently.
**Prose unit:** `### MCP Tools at a Glance` intro (L40) — "registers 16 MCP tools across **five** concerns" above a six-row table.
**Disposition:** This is a deferred decision, not an unconditional edit. The recommended disposition (below) is the one-word "five"→"six" correction, contingent on the `approach-confirmed` checkpoint. If approved, the *only* change is the single word; the count "16" and the table stay verbatim. If not approved, leave "five" verbatim and the wrinkle stands as noted. **No other prose in this unit changes** (the intro is otherwise already plain; the table is content).
**Success criterion:** Either the single word reads "six" (if approved) or "five" is left untouched (if not); in both cases "16" and the table are byte-identical.

> **Note on verification:** Per the plan's task rules, verification (Markdown render, link-check, diff confirmation that only prose changed) is **not** a separate task — it runs in the validation activity against the test plan ([`06-test-plan.md`](06-test-plan.md)). No "verify render", "check links", or command-running task appears here.

---

## Deferred Decisions (surfaced from comprehension/analysis; resolved here)

Both items were factually settled in comprehension (correct values known and source-verified). What remained was a **scope/edit decision**, which is this activity's responsibility. Each carries a clear recommendation; the in-file one (Q2) is also gated behind the `approach-confirmed` checkpoint so the user can override.

### Q2 — "five concerns" should read "six" (in-file, one-word fact correction)

- **Fact (settled):** The tools table has **six** category rows (Bootstrap, Session, Workflow/activity navigation, Checkpoint flow, Techniques+resources, Trace; tool counts 3+3+3+4+2+1 = 16). The prose word "five" (L40) is one short. The "16" is correct.
- **Tension:** The work package nominally freezes facts. This is the lone case where the freeze would block correcting a genuine inaccuracy in-pass.
- **Recommendation: APPLY the one-word "five"→"six" correction.** Rationale: it is a factual *correction*, not a fact *change* — the table (six rows) is the ground truth and the prose simply miscounts it; a README simplification pass that leaves a visibly wrong count over its own table undercuts the accessibility goal; the edit is one word, fully reversible, and touches no structure, link, count ("16"), or table. The "freeze facts" constraint is meant to prevent *adding/removing* information, not to preserve a typo. This is captured as Task 4 and is gated behind the `approach-confirmed` checkpoint, so the user can decline.
- **Default if declined:** Leave "five" verbatim; the 5-vs-6 wrinkle stands and is noted in the artifacts.

### Q6 — `docs/api-reference.md` documents 15 tools, omitting `dispatch_child` (out of file)

- **Fact (settled):** `docs/api-reference.md` documents 15 tools; `dispatch_child` is the only one missing (its natural home is the Session Tools table). The README (16) is correct and source-aligned (`src/tools/` registers 16). The delta is exactly one tool.
- **Recommendation: DEFER to a separate follow-up; do NOT pull into this work package.** Rationale: the corrective edit lives in `docs/api-reference.md`, **outside** this single-file (`README.md`) work package's scope. Expanding scope to a second file would change the deliverable and add review surface for an unrelated doc. The recommended follow-up is a small, standalone doc-accuracy change: add a `dispatch_child` row to the Session Tools table in `docs/api-reference.md` (bringing it from 15 to 16, matching the README and source). This plan records it as a follow-up; it is not a task here.
- **Scope statement:** This work package is NOT expanded to include `docs/api-reference.md`.

---

## Success Criteria

### Quality Targets (the measurable definition of "simplified")
- [ ] **Ideas-per-sentence:** every reworked prose sentence carries ~1 idea (target 15–20 words). Baseline: How-It-Works steps 2 & 3 carry 4–5 ideas each. Validated by re-enumerating ideas per sentence in the rewritten prose.
- [ ] **Term-before-gloss:** every loaded term ("workflow", "fidelity-enforced", "technique", the bundle concept) is introduced in plain words before it is named. Baseline: tagline fronts 3 unglossed terms. Validated by tracing each loaded term's first appearance.
- [ ] **Fact preservation:** all tool names, dotted field paths, `initialActivity`, the "16 tools" count, links, anchors, and code/JSON/command blocks survive verbatim. Validated by diffing the README — no fact, link, anchor, or code block removed or altered (the single sanctioned exception is the Task 4 "five"→"six" word, if approved).

### Functional Requirements (addressing gaps)
- [ ] G1, G2 (Task 1) — How-It-Works steps 2 & 3 rewritten as one-idea sentences with bundle clauses softened in place.
- [ ] G3, G4 (Task 2) — Tagline and Overview apply term-before-gloss.
- [ ] G5, G7, G8 (Task 3) — Architecture bullets, Engineering prose, and Quick Start glue lightly reworded.
- [ ] G6 / Q2 (Task 4) — count-wrinkle disposition applied per the checkpoint outcome.

### Structure-Preserving Constraint (hard invariants — non-negotiable)
- [ ] Sections, headings, and their order are byte-identical (the `#-quick-start` nav anchor and external deep-links depend on this).
- [ ] No section is split, merged, reordered, added, or dropped.
- [ ] No fact is added or removed (single sanctioned exception: the Task 4 word, if approved).

### Measurement Strategy (run in the validation activity, not here)
- **Density:** re-enumerate ideas-per-sentence for the rewritten prose units; confirm ~1 idea/sentence at the hotspots.
- **Accuracy/coverage:** diff the README; confirm only prose changed — no tool name, field path, count, link, anchor, table, diagram, or code/JSON/command block touched; headings and order unchanged.
- **Render/link:** Markdown render and link-check pass unchanged; `#-quick-start` still resolves.

---

## Testing Strategy

See [`06-test-plan.md`](06-test-plan.md) for the full test plan. In summary, validation for a prose-only, structure-preserving change is three checks rather than code tests:
- **Density check** — ideas-per-sentence re-enumeration of each reworked prose unit.
- **Fact/structure diff** — `git diff` confirms only prose changed; headings, order, tables, diagram, links, anchors, and code blocks are byte-identical (modulo the one approved word).
- **Render/link check** — Markdown renders and all links/anchors resolve, including `#-quick-start`.

---

## Dependencies & Risks

### Requires (Blockers)
- [ ] None. No code or schema depends on README prose; no external systems are involved. All prior artifacts (comprehension, KB research, analysis, assumptions) are complete.

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| "Simplify" silently becomes "drop or relocate facts" (push steps 2–3 mechanics to api-reference, delete field names) | HIGH | MEDIUM | Keep tool names + a plain gloss in place; rely on the already-linked api-reference for exact paths without deleting them (Task 1) |
| Term-before-gloss failure ships looking successful (render + diff pass; only symptom is a still-disoriented newcomer) | MEDIUM | MEDIUM | Explicitly verify each loaded term is introduced in plain words before it is named (density check, Task 2) |
| "Shorter words" rewrite that leaves 3+ ideas per sentence — feels improved, cliff remains | MEDIUM | LOW | Measure density as ideas-per-sentence; enforce one idea per sentence (success criteria) |
| Accidental structure change breaks the `#-quick-start` anchor or external deep-links | MEDIUM | LOW | Heading text byte-identical; structure-preserving invariant verified by diff in validation |
| Scope creep into the out-of-file api-reference fix (Q6) | LOW | LOW | Explicitly out of scope; recorded as a separate follow-up (Deferred Decisions) |

---

**Status:** Ready for implementation
