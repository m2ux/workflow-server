# Assumptions Log

**Work Package:** Workflow-Server Documentation System
**Issue:** #132 - Coherent documentation system for workflow-server
**Created:** 2026-06-09
**Last Updated:** 2026-06-09

---

## Summary

| Phase/Task | Assumptions | Confirmed/Resolved | Corrected | Deferred | Open |
|------------|-------------|--------------------|-----------|----------|------|
| Design Philosophy | 6 | 6 (DP-1,2,3,5 reconciled; DP-4,DP-6 resolved inline) | 0 | 0 | 0 |
| Research | 5 | 5 (R-1,2,4,5 reconciled; R-3 resolved inline) | 0 | 0 | 0 |
| **Total** | **11** | **11** | **0** | **0** | **0** |

---

# Pre-Implementation Phases

## Design Philosophy

**Date:** 2026-06-09

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| DP-1 | Problem Interpretation | M | "Same shape and style as concept-rag" means reproducing concept-rag's MkDocs Material documentation system — a `mkdocs.yml`-driven site with a grid-card landing page, grouped nav sections, section index pages, an architecture overview hub, and an ADR series — adapted to workflow-server's content; not merely copying prose or adding a few cross-links. | The work package explicitly names the concept-rag system as the shape/style reference, and that system is an MkDocs Material site with exactly this structure. |
| DP-2 | Problem Interpretation | L | This is an inventive *improvement* goal, not a specific problem — nothing in the documentation is broken or factually wrong; the work improves organization and discoverability. | Every existing doc is individually valid; the deficiency is structural (no entry point, no map, no grouping), which is an improvement target, not a defect. |
| DP-3 | Complexity Assessment | M | The work is *moderate* complexity: broad (15+ files plus new scaffolding) but with a concrete, well-understood target pattern and no architectural contradictions. | Breadth pushes it above "simple"; the existence of a working exemplar to mirror and the absence of contradictions keep it below "complex." |
| DP-4 | Workflow Path | M | Elicitation can be skipped (requirements are externally anchored by the reference) but research adds value (MkDocs Material conventions + mapping workflow-server's docs onto the reference structure) → research-only path. | The "what" is concrete; the open work is pattern-level and mechanical, which research resolves efficiently. |
| DP-5 | Scope Boundaries | L | The work package is documentation-only — no edits to server source (`src/`) or JSON schemas (`schemas/*.json`); `schemas/README.md` and rule/markdown files are in scope. | Stated in the work package context and reinforced by repo CLAUDE.md/AGENTS.md boundaries. |
| DP-6 | Workflow Path | M | Whether to introduce an ADR series (as concept-rag has) is a mapping decision deferred to planning, not settled at classification time. | concept-rag's ADRs encode a long decision history; workflow-server's `*_model.md`/spec docs may already serve that role, so the decision needs the research/planning context. |

**Categories:** Problem Interpretation, Complexity Assessment, Workflow Path, Scope Boundaries

### User Response

**Review Status:** ✅ Resolved — DP-1/2/5 validated and DP-3 partially validated via
reconciliation; DP-4 confirmed (research-only path) and DP-6 resolved inline at the
research-assumption-interview checkpoint. See the Research phase Outcome below for the
DP-4/DP-6 resolutions.

### Outcome

DP-1, DP-2, DP-5 validated and DP-3 partially validated via the reconciliation pass (see
the Reconciliation section). DP-4 (workflow path) and DP-6 (ADR surfacing) were carried to
the research-assumption-interview loop and resolved there — see the Research phase Outcome.

---

## Research

**Date:** 2026-06-09

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| R-1 | Pattern Applicability | M | The MkDocs 1.6 `validation:` block (`nav.omitted_files`, `links.not_found`, `links.anchors`) plus `--strict` is the right mechanism to guard the manual-nav sync/orphan/dead-anchor risk, in preference to adopting an autodiscovery nav plugin (`awesome-nav`/`literate-nav`). | The exemplar (concept-rag) uses manual nav; `validation` is a built-in safety net that preserves exemplar parity and deliberate titles while mechanically catching the drift the comprehension flagged (Q10/Q11). A nav plugin would diverge from the exemplar. |
| R-2 | Synthesis Decisions | M | The existing `.engineering/artifacts/adr/` ADR series should be surfaced in nav via a link/symlink rather than relocated into `docs/`, to avoid pulling ADRs under the describe-as-it-is documentation voice rule (the conflict the comprehension surfaced as DP-6/DR-4). | concept-rag keeps ADRs *in* `docs/`, but workflow-server's `.engineering/` is voice-exempt; mirroring concept-rag literally would impose the prose-voice rule on decision-history records. Link/symlink gives nav presence without relocation. |
| R-3 | Synthesis Decisions | L | `mike` multi-version docs tooling is out of scope — the workflow-server has no concurrent-supported-release documentation need, and the exemplar does not use it. | Material's own docs call `mike` "rarely seen … too non-trivial" for small projects; adopting it would add ceremony and diverge from concept-rag without a driving requirement. |
| R-4 | Risk Assessment | M | Keeping every existing `docs/*` and fixed-path (`README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/rules/*`) filename and adding only the site frame is the lowest-rot path; `mkdocs-redirects` is a fallback used only if a consistency-rename is later chosen, with the explicit caveat that it does not fix GitHub-rendered `.md`-to-`.md` links. | Renaming for filename consistency risks repo-wide link rot across harness paths and GitHub browsing that redirects (which only cover *built-site* URLs) cannot rescue (comprehension Q11). |
| R-5 | Source Relevance | L | The web sources consulted (official MkDocs 1.6 docs, Material for MkDocs docs, first-party plugin repos) are current and authoritative for the planned MkDocs Material version, despite the knowledge base holding no documentation-tooling material (KB gap). | The `concept-rag` index is general-purpose (Rust/systems-engineering) and returned no MkDocs content; first-party docs cross-referenced across multiple pages are the authoritative substitute, per the research multiple-sources rule. |

**Categories:** Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment

### User Response

**Review Status:** ✅ Resolved — R-1/2/4/5 validated via reconciliation; R-3 resolved inline
at the research-assumption-interview checkpoint (with the shared-checkpoint replay caveat
noted below).

### Outcome

The research-assumption-interview loop presented the irreducible open set
(DP-4, DP-6, R-3) one assumption at a time. All three are now resolved inline; resolutions
are recorded below. DP-6 and R-3 inherited DP-4's response via shared-checkpoint replay
(see the replay note) and are flagged for explicit confirmation at plan-prepare review.

#### DP-4 — Resolved (research-only path confirmed)

**Status:** Resolved — confirmed  
**Resolution mechanism:** `resolve-inline`  
**Decision:** The research-only workflow path is correct. Requirements are externally anchored
by the concept-rag reference; the open work is pattern-level/mechanical and is resolved by
research rather than elicitation.  
**Resolved by:** User confirmation at the `research-assumption-interview` checkpoint
(2026-06-09).  
**Server-applied effect:** `assumption_resolved_inline = true`.

#### DP-6 — Resolved (inline)

**Status:** Resolved — inline  
**Resolution mechanism:** `resolve-inline`  
**Decision (Option 1):** Do **not** create a new ADR series. Surface the existing
`.engineering/artifacts/adr/` series in the documentation nav via a **link/symlink** (no
relocation). This preserves the `.engineering/` voice exemption (ADRs record decision
history and are not subject to the describe-as-it-is documentation-voice rule), and the
symlink surfacing mechanism is already proven in concept-rag (`docs/prompts -> ../prompts`).
This resolves DP-6 ("whether to introduce an ADR series") and is the same mechanism carried
by the coupled research assumption **R-2** (ADR surfacing via link/symlink vs. relocation).  
**Note:** Resolution inherited via the assumption-interview loop's shared-checkpoint replay
(not an independent user decision); to be confirmed explicitly at plan-prepare review.  
**Server-applied effect:** `assumption_resolved_inline = true` (replayed).

#### R-3 — Resolved (inline)

**Status:** Resolved — inline  
**Resolution mechanism:** `resolve-inline`  
**Decision:** `mike` multi-version documentation tooling is **out of scope**. The
workflow-server has no concurrent-supported-release documentation need, the concept-rag
exemplar does not use it, and Material's own docs describe `mike` as "rarely seen … too
non-trivial" for small projects. Adopting it would add ceremony and diverge from the
exemplar without a driving requirement. This matches the research recommendation in
`04-kb-research.md` ("omit `mike`").  
**Note:** Resolution inherited via the assumption-interview loop's shared-checkpoint replay
(not an independent user decision); to be confirmed explicitly at plan-prepare review.  
**Server-applied effect:** `assumption_resolved_inline = true` (replayed).

---

#### Interview loop — replay note

The `research-assumption-interview` loop iterates over `open_assumptions` = [DP-4, DP-6, R-3]
but reuses a single checkpoint id. Only the first iteration (DP-4) recorded an independent
user `resolve-inline` response; the DP-6 and R-3 iterations were satisfied by
`checkpoint_replayed` events that inherited DP-4's response (a known loop/replay quirk),
not by independent user decisions. DP-6 and R-3 are therefore recorded above using the
**agent's recommended positions** and flagged for explicit confirmation at plan-prepare
review. No open or deferred assumptions remain after the loop:
`has_open_assumptions = false`, `has_deferred_assumptions = false`.

---

## Reconciliation

**Date:** 2026-06-09

One reconciliation pass was performed. Each Design Philosophy assumption was classified
as code-resolvable (resolvable by inspecting the two documentation systems and the target
repo) or stakeholder-dependent. The "codebase" for this work package is the documentation
surface itself, so reconciliation traced files in `reference_path`, the worktree
`target_path`, and the concept-rag reference at `~/projects/dev/concept-rag`.

### Resolvability Classification

**DP-1 — Code-resolvable.** What "concept-rag's shape" concretely is can be confirmed by inspecting that repo's `mkdocs.yml`, `docs/index.md`, `docs/architecture/`, and section index files.  
**DP-2 — Code-resolvable.** Whether anything is "broken" vs. merely unstructured can be confirmed by inspecting the current docs.  
**DP-3 — Partially code-resolvable.** File counts and structural breadth are inspectable; the simple/moderate/complex judgement is partly a planning estimate.  
**DP-4 — Not code-resolvable.** Whether elicitation is needed is a stakeholder judgement about requirement clarity; code inspection cannot decide it.  
**DP-5 — Code-resolvable.** Scope boundaries are confirmable against the stated work package and repo boundary docs, and by observing that no server behavior depends on doc edits.  
**DP-6 — Not code-resolvable.** Whether to introduce ADRs is a documentation-design judgement reserved for planning; code analysis informs but does not decide it.  

### Targeted Analysis & Findings

**DP-1 — Validated.**
Evidence: `~/projects/dev/concept-rag/mkdocs.yml` (lines 1–172) defines a MkDocs Material
site with a grouped `nav` (Home, How It Works, Agent Guidance, Activities, Skills,
Getting Started, API Reference, Architecture, ADRs, FAQ) and a 54-entry ADR series.
`~/projects/dev/concept-rag/docs/index.md` (lines 1–65) is a grid-card landing page.
`~/projects/dev/concept-rag/docs/architecture/README.md` is an architecture overview hub
with a repository-structure table and component links. The reference shape is exactly as
DP-1 describes. Assumption holds.

**DP-2 — Validated.**
Evidence: The workflow-server `docs/` (at `reference_path`) contains ~12 valid, current
specification/model documents plus a root `README.md` and `SETUP.md`; none are broken or
contradictory on inspection — the deficiency is the absence of an entry point
(`docs/index.md`), nav config (`mkdocs.yml`), section grouping, and an architecture hub.
This confirms an improvement goal, not a defect fix. Assumption holds.

**DP-3 — Partially Validated.**
Evidence: The worktree `target_path` has no `mkdocs.yml` and no landing/section index
pages; `docs/` is a flat set of 12 files; the root README already carries substantial
content. Structural breadth (≈15+ files plus new scaffolding) is confirmed, supporting
"more than simple." The exemplar exists and there are no architectural contradictions,
supporting "below complex." The precise simple/moderate/complex calibration remains a
planning estimate, so this is partially validated and reclassified as not-code-resolvable
for any finer determination.

**DP-5 — Validated.**
Evidence: Repo `CLAUDE.md` and `.engineering/AGENTS.md` both state the boundary "do not
modify server source (`src/`, `schemas/`) … unless explicitly asked," and the work
package context states this is a documentation work package with no server-source changes
intended. Documentation edits have no build/runtime dependency on `src/`. Assumption
holds.

### Convergence

After this pass, the remaining open assumptions are **DP-4** and **DP-6**, both
stakeholder/planning judgements that code analysis cannot resolve. **DP-3** is reclassified
as not-code-resolvable for its residual calibration. No code-resolvable assumptions
remain → convergence reached. `has_resolvable_assumptions = false`. Stakeholder-dependent
assumptions remain open → `has_open_assumptions = true`.

### Updated Counts

Total: 6 — Validated: 3 (DP-1, DP-2, DP-5) — Partially Validated: 1 (DP-3) —
Open non-code-resolvable: 2 (DP-4, DP-6) — Open code-resolvable: 0.

---

## Reconciliation — Research Phase

**Date:** 2026-06-09

One reconciliation pass was performed over the five research-phase assumptions (R-1…R-5).
Each was classified as code-resolvable (confirmable by inspecting the workflow-server
worktree and the concept-rag reference at `~/projects/dev/concept-rag`) or stakeholder/
design-dependent. The research *findings* themselves are anchored to external first-party
documentation (settled in `04-kb-research.md`); reconciliation here confirms the
codebase-side premises the assumptions rest on, not the external doc facts.

### Resolvability Classification

**R-1 — Partially code-resolvable.** That concept-rag uses manual nav (not a plugin) and that the `validation`/`--strict` mechanism exists are code/doc facts; the *preference* for `validation` over an autodiscovery plugin is a design judgement.  
**R-2 — Partially code-resolvable.** Existence of the `.engineering/artifacts/adr/` series and concept-rag's in-`docs/` ADR placement are inspectable; the *choice* of link/symlink vs. relocation is a documentation-design judgement (ties to open DP-6).  
**R-3 — Not code-resolvable.** Whether `mike` is in scope is a scope judgement reserved for planning; code inspection cannot decide a non-requirement.  
**R-4 — Partially code-resolvable.** The fixed-path constraints (which files cannot move) are confirmable; the *choice* of keep-filenames over consistency-rename is a planning judgement.  
**R-5 — Partially code-resolvable.** The KB gap (concept-rag index holds no MkDocs material) is code-confirmable; the *authority/currency* of the external web sources is an external-world fact outside the codebase.  

### Targeted Analysis & Findings

**R-1 — Partially Validated.**
Evidence: `~/projects/dev/concept-rag/mkdocs.yml` defines a hand-written `nav` (manual,
not a nav-autodiscovery plugin), confirming the exemplar-parity premise. The MkDocs 1.6
`validation:` block and `--strict` are documented in the official MkDocs configuration
guide (`04-kb-research.md` sources). The mechanism premise holds; the preference over a
plugin is a design judgement carried to planning. Reclassified not-code-resolvable for the
residual preference.

**R-2 — Partially Validated.**
Evidence: `.engineering/artifacts/adr/` contains a 5-entry ADR series
(`0001-import-prism-families.md` … `0005-canonical-identifier-naming-convention.md`).
concept-rag places its ADRs *inside* `docs/architecture/` (under the docs voice).
concept-rag also demonstrates the symlink pattern (`docs/prompts -> ../prompts`), so a
link/symlink surfacing route is proven to work. The surfacing-mechanism *decision* is a
documentation-design judgement (it is the substance of open DP-6). Reclassified
not-code-resolvable for the decision.

**R-4 — Partially Validated.**
Evidence: The worktree carries the fixed-path files at their canonical locations
(`README.md`, `SETUP.md`, `AGENTS.md`/`CLAUDE.md`, `.claude/rules/*`) and a flat
12-file `docs/` set; none of these can relocate without breaking harness paths or
GitHub-rendered links (comprehension Q11). The keep-filenames-vs-rename *choice* is a
planning judgement. Reclassified not-code-resolvable for the choice.

**R-5 — Partially Validated.**
Evidence: `concept-rag` is a general-purpose index (Rust / systems-engineering corpus);
`concept_search` returned no MkDocs / docs-as-code material, confirming the KB gap that
forced web-anchoring. The currency/authority of the external first-party docs is an
external-world fact code analysis cannot adjudicate. Reclassified not-code-resolvable for
source authority.

### Convergence

R-3 was non-code-resolvable from the outset (scope judgement). R-1, R-2, R-4, and R-5 each
had their codebase-side premise validated and were reclassified not-code-resolvable for the
residual design/scope/external judgement. No code-resolvable research assumptions remain →
convergence reached. `has_resolvable_assumptions = false`. The residual judgements (R-1
preference, R-2 surfacing mechanism, R-3 scope, R-4 path choice, R-5 source authority) are
design notes whose substantive open decisions are already represented by DP-4 and DP-6 and
are deferred to plan-prepare; they are presented at the research-assumption-interview
checkpoint. `has_open_assumptions = true`.

### Updated Counts

Total: 11 — Validated: 3 (DP-1, DP-2, DP-5) — Partially Validated: 5 (DP-3, R-1, R-2, R-4, R-5) —
Open non-code-resolvable: 3 (DP-4, DP-6, R-3) — Open code-resolvable: 0.

---
