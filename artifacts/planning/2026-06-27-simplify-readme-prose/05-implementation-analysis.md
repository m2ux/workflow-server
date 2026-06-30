# Implementation Analysis - Simplify workflow-server README prose

**Date:** 2026-06-29
**Work Package:** Simplify workflow-server README prose
**Status:** Complete

> **Note:** This is a prose-only, single-file work package. The "implementation" under analysis is the repository-root `README.md` document — specifically its prose sections — not server source. Baselines here are readability/density measurements of the prose, and "gaps" are the specific simplification moves needed. This analysis builds on the prior comprehension artifact (`../../comprehension/readme-prose.md`) and KB research (`04-kb-research.md`); it does not redo them.

---

## Implementation Review

### Existing Location

The single artifact under change. (`target_path` = the work-package worktree; `README.md` there is byte-identical to the `reference_path` checkout, branch `chore/simplify-readme-prose`.)

| Component | Path | Description |
|-----------|------|-------------|
| README (edit target) | `README.md` (152 lines) | Repository-root onboarding doc; pure Markdown, no compile/runtime dependents |
| Comprehension artifact | `.engineering/artifacts/comprehension/readme-prose.md` | Section map, density hotspots, accuracy traces, link/anchor contract, glossary |
| KB research | `04-kb-research.md` | Plain-language conventions + portfolio synthesis mapped to the four hotspots |

### Section Map (current order — frozen)

The work package freezes sections, headings, and order. The eight prose-bearing units, in order:

| Loc (README) | Heading / unit | Kind | Prose to simplify? |
|--------------|----------------|------|--------------------|
| L8 | Tagline | Prose | **Yes — hotspot** |
| L12 | Nav bar | Links | No (links verbatim) |
| L16–18 | `## 🎯 Overview` paragraph | Prose | Yes — light |
| L20–25 | `### How It Works` (4 numbered steps) | Numbered prose | **Yes — primary hotspot (steps 2 & 3)** |
| L27–36 | `### Architecture` (diagram + 4 bullets) | Diagram + bullets | Yes — light (diagram verbatim) |
| L38–49 | `### MCP Tools at a Glance` (intro + table) | Prose + table | **Yes — intro hotspot (count); table verbatim** |
| L53–138 | `## 🚀 Quick Start` (prereqs … execute) | Mixed | Prose glue only; command/JSON blocks verbatim |
| L140–148 | `## Engineering layout` | Prose + bullets | Yes — light |
| L150–152 | `## 📜 License` | Prose | No meaningful prose |

### Dependencies

**The README's prose depends on (must stay accurate to):** `docs/architecture.md`, `docs/ide-setup.md`, `docs/api-reference.md`, `docs/workflow-fidelity.md`, `SETUP.md`, `docs/development.md`, and the `src/tools/` registrations (16 tools). These are read-only references for accuracy, not edit targets.

**Depended on by:** human readers and Markdown tooling only. The nav anchor `#-quick-start` (→ `## 🚀 Quick Start`) and external GitHub deep-links depend on heading text staying byte-identical.

### Architecture (of the README)

Top-of-funnel onboarding doc: badges → tagline → nav → progressively detailed Overview (what → how → architecture → tool inventory) → actionable Quick Start → reference pointers. **Known issue:** the prose escalates from a plain tagline to highly technical "How It Works" steps 2–3 too quickly — a density cliff between the Overview paragraph and the dotted-field jargon in the numbered steps. That cliff is the accessibility problem this work package targets.

---

## Effectiveness Evaluation

### What's Working Well ✅

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Factual accuracy | Comprehension Q1/Q3/Q4/Q5 resolved: "16 tools" matches `src/tools/`; "Technique" is canonical; all links/anchors resolve on disk; zero "TOON" references | HIGH |
| Structure & coverage | Eight prose units in a logical funnel; nav bar + anchors + external deep-links intact | HIGH |
| Reference precision | Exact tool names, dotted field paths (`techniques.workflow`, `techniques.activity`, `techniques[]`), `initialActivity`, and command/JSON blocks are correct and present | HIGH |

### What's Not Working ❌

| Issue | Evidence | Impact |
|-------|----------|--------|
| Density cliff at How It Works steps 2–3 | L23 packs `session token` + `get_workflow` + `techniques.workflow`/`techniques`/`rules` + `initialActivity` into one sentence; L24 chains `next_activity` + `get_activity` + a `techniques.activity`+`techniques[]` em-dash clause + `get_resource` lazy-load — 3+ ideas per sentence (comprehension hotspot #2) | HIGH (core accessibility failure) |
| Jargon-before-gloss in the tagline | L8 fronts "structured", "fidelity-enforced", and the discover/navigate/execute triple before the reader knows what a workflow is (hotspot #1) | MEDIUM |
| Count wrinkle in Tools intro | L40 says "across **five** concerns" above a **six-row** table (Q2) | LOW (correctness wrinkle; edit deferred, see Gaps) |
| Light density in Overview / Architecture / Engineering prose | Accurate but compressible; lower priority than the cliff | LOW |

### Workarounds in Place

None. The prose is the source of truth; no rendering or tooling workaround masks the density.

---

## Baseline Metrics

Density is measured as **ideas-per-sentence** (the operative definition from research RS-3), not word length. A "shorter words" rewrite would leave the cliff intact. Measurement method: manual sentence-level enumeration of the current `README.md` prose units; reproducible by re-reading the same lines.

| Metric | Current Value | Measurement Method | Date |
|--------|---------------|--------------------|------|
| Max ideas-per-sentence (How It Works step 2, L23) | 4 (tool name + bundle field path + bundle target fields + `initialActivity`) | Sentence enumeration of L23 | 2026-06-29 |
| Max ideas-per-sentence (How It Works step 3, L24) | 4–5 (two tool names + em-dash `techniques.activity`+`techniques[]` clause + `get_resource` lazy-load) | Sentence enumeration of L24 | 2026-06-29 |
| Tagline loaded terms before first gloss (L8) | 3 ("structured", "fidelity-enforced", discover/navigate/execute) | Term enumeration of L8 | 2026-06-29 |
| Prose hotspots needing rework | 3 primary (tagline, How-It-Works 2–3, Tools intro) + 3 light (Overview, Architecture bullets, Engineering) | Section map vs. comprehension hotspot list | 2026-06-29 |
| Factual accuracy guards established | 5 (Q1 tools=16, Q3 term=Technique, Q4 links valid, Q5 no TOON, terminology consistency) | Comprehension Open Questions table | 2026-06-29 |
| Structure invariants to preserve | Headings + order, nav anchor `#-quick-start`, external deep-links, all relative links, code/JSON/command blocks | Comprehension link/anchor integrity map | 2026-06-29 |

### Key Findings

- The density problem is **concentrated**: two sentences (How It Works steps 2 and 3) carry the bulk of it. They are the highest-leverage edit in the file.
- "Simplify" must be measured as **ideas-per-sentence reduced to ~1 per sentence (target 15–20 words)** with **each loaded term glossed in plain words before it is named** — both verifiable by re-reading, not by word-length heuristics.
- Every density fix is a **wording transform over an already-accurate model** — no fact is wrong (per comprehension), so the rewrite never re-derives content, it only restates it.

---

## Gap Analysis

Gaps are the concrete simplification moves. Each maps a prose unit → the move → the success criterion it satisfies. Priorities follow the density-cliff finding.

| ID | Gap (prose unit) | Current State | Desired State | Move | Priority |
|----|------------------|---------------|---------------|------|----------|
| G1 | How It Works step 2 (L23) | One sentence, 4 ideas; dotted `techniques.workflow`/`techniques`/`rules` jargon | Several one-idea sentences; bundle softened to "along with the techniques and rules it needs"; tool names + `initialActivity` kept | Sentence-split + soften the dotted-field clause **in place** (do not delete field facts; api-reference link already holds exact paths) | **HIGH** |
| G2 | How It Works step 3 (L24) | One sentence, 4–5 ideas; em-dash `techniques.activity`+`techniques[]` clause | Several one-idea sentences; em-dash clause collapsed to "plus the techniques that activity uses"; keep `next_activity`, `get_activity`, `get_resource`, "(steps, checkpoints, transitions)" | Sentence-split + collapse the bundle clause **in place** | **HIGH** |
| G3 | Tagline (L8) | 3 loaded terms before any gloss | Two short sentences; introduce "workflow" before qualifying it; gloss "fidelity-enforced" in plain words (or plain paraphrase) | Term-before-gloss reordering; split into two sentences | MEDIUM |
| G4 | Overview paragraph (L16–18) | Accurate, mildly dense | One idea per sentence; lead with what the server does | Light reword; active voice | MEDIUM |
| G5 | Architecture bullets (L33–36) | Compact bullet glosses | Plainer bullet wording; diagram untouched | Light reword of the 4 bullets | LOW |
| G6 | Tools intro (L40) | "across **five** concerns" over a six-row table | Factually "six"; table verbatim | **Edit decision deferred to plan-prepare (Q2)** — see Deferred Decisions | LOW |
| G7 | Engineering layout prose (L142) | One compact sentence | Plainer phrasing; bullets untouched | Light reword | LOW |
| G8 | Quick Start prose glue (L93, L97, L104, L108, L112, L138) | Short connective sentences around code blocks | One idea per sentence where dense | Light reword of prose only; **all command/JSON blocks verbatim** | LOW |

**Out-of-scope (not gaps in this WP):**
- **Q6** — `docs/api-reference.md` documents 15 tools (missing only `dispatch_child`); the README (16) is the accurate one. The fix lives in another file, outside this single-file scope. Deferred to plan-prepare as a separate follow-up decision.
- Repo-root `CLAUDE.md` "Skill" terminology lag — not a README concern.

---

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)
1. **Split How-It-Works steps 2 & 3 into one-idea sentences (G1, G2):** the two-sentence cliff is ~80% of the perceived density. Highest impact for least surface area.
   - Expected impact: removes the primary accessibility barrier a newcomer hits.
   - Effort: small (two list items).

### Structural Improvements (Higher Effort)
*None.* Restructuring is forbidden by the work-package constraint; the only sanctioned lever is sentence-level density + term ordering **within** each existing section.

### Optimization Opportunities
1. **Term-before-gloss across the tagline and Overview (G3, G4):** introduce each loaded term in plain words before naming it.
   - Expected impact: smooths the on-ramp before the reader reaches How It Works.
   - Effort: small.

### Cleanup
1. **Light reword of Architecture bullets, Engineering prose, Quick Start glue (G5, G7, G8):** lower priority; apply the same one-idea-per-sentence rule.

---

## Success Criteria

### Quality Targets (the measurable definition of "simplified")
- [ ] **Ideas-per-sentence:** Reduce every prose sentence to ~1 idea (target 15–20 words). Baseline: How-It-Works steps 2 & 3 carry 4–5 ideas each. Validation: re-enumerate ideas per sentence in the rewritten prose.
- [ ] **Term-before-gloss:** Every loaded term ("workflow", "fidelity-enforced", "technique", the bundle concept) is introduced in plain words before it is named. Baseline: tagline fronts 3 ungloss­ed terms. Validation: trace each loaded term's first appearance.
- [ ] **Fact preservation:** All tool names, dotted field paths, `initialActivity`, the "16 tools" count, links, anchors, and code/JSON/command blocks survive verbatim. Validation: diff confirms no fact, link, anchor, or code block removed or altered.

### Functional Requirements (addressing gaps)
- [ ] G1, G2 — How-It-Works steps 2 & 3 rewritten as one-idea sentences with bundle clauses softened in place.
- [ ] G3, G4 — Tagline and Overview apply term-before-gloss.
- [ ] G5, G7, G8 — Architecture bullets, Engineering prose, Quick Start glue lightly reworded.

### Structure-Preserving Constraint (hard invariants — non-negotiable)
- [ ] Sections, headings, and their order are byte-identical (nav anchor `#-quick-start` + external deep-links depend on this).
- [ ] No section is split, merged, reordered, added, or dropped (no newcomer-vs-reference audience split — that is a forbidden restructure).
- [ ] No fact is added or removed; the README still tells the full story.

### Deferred Decisions (flag to plan-prepare — do NOT auto-edit)
- [ ] **Q2 (G6):** "five concerns" is factually one short (table has six rows). Decide whether the one-word "five"→"six" correction is in scope for a fact-freezing work package. Default if out of scope: leave verbatim, note the wrinkle.
- [ ] **Q6:** `docs/api-reference.md` omits `dispatch_child` (documents 15 vs. README's correct 16). Decide whether to expand scope to patch that doc or file a separate follow-up. Lives outside the single-file (`README.md`) scope.

### Measurement Strategy (validation phase)
- **Density:** re-enumerate ideas-per-sentence for the rewritten prose units; confirm ~1 idea/sentence at the hotspots.
- **Accuracy/coverage:** `git diff` the README; confirm only prose changed — no tool name, field path, count, link, anchor, or code/JSON/command block touched; headings + order unchanged.
- **Render/link:** Markdown render + link-check pass unchanged; `#-quick-start` still resolves.

---

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| `.engineering/artifacts/comprehension/readme-prose.md` | Comprehension | Section map, four density hotspots, load-bearing terms, link/anchor contract, Q1–Q6 resolutions, deferred Q2/Q6 |
| `04-kb-research.md` | Research | Plain-language conventions (one idea/sentence, term-before-gloss, active voice) mapped to the hotspots; risk register (silent fact relocation) |
| `14-portfolio-synthesis.md` (+ pedagogy / rejected-paths) | Portfolio lenses | Convergent CF1–CF3 guidance; rejected "fixes" that trade a visible problem for a hidden one |
| `02-assumptions-log.md` | Assumptions | DP-1..DP-3, RS-1..RS-4 — all confirmed; structure-preserving scope accepted |
| `README.md` (worktree, branch `chore/simplify-readme-prose`) | Source doc | Current prose, verbatim line map; byte-identical to reference checkout |
| `src/tools/` registrations | Source | Ground-truth tool count = 16 (README accurate; api-reference one short) |

---

**Status:** Ready for plan-prepare activity
