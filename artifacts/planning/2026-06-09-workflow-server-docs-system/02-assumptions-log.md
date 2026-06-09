# Assumptions Log

**Work Package:** Workflow-Server Documentation System
**Issue:** #132 - Coherent documentation system for workflow-server
**Created:** 2026-06-09
**Last Updated:** 2026-06-09

---

## Summary

| Phase/Task | Assumptions | Confirmed/Resolved | Corrected | Deferred | Open |
|------------|-------------|--------------------|-----------|----------|------|
| Design Philosophy | 6 | 6 (DP-1,2,3,5 reconciled; DP-4 resolved inline; DP-6 resolved by user — ADRs excluded from docs) | 0 | 0 | 0 |
| Research | 5 | 5 (R-1,2,4,5 reconciled; R-3 resolved inline) | 0 | 0 | 0 |
| Implementation Analysis | 4 | 4 (IA-1,2,3,4 reconciled via filesystem inspection) | 0 | 0 | 0 |
| **Total** | **15** | **15** | **0** | **0** | **0** |

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
(DP-4, DP-6, R-3) one assumption at a time. All three are now resolved; resolutions
are recorded below. DP-6 and R-3 originally inherited DP-4's response via shared-checkpoint
replay (see the replay note) and were flagged for explicit confirmation at plan-prepare.
**DP-6 has since been decided explicitly by the user at the implementation-analysis review —
ADRs are excluded from the docs system** (no link, no symlink, no nav section); see the DP-6
block below. R-3 remains carried for explicit confirmation at plan-prepare.

#### DP-4 — Resolved (research-only path confirmed)

**Status:** Resolved — confirmed  
**Resolution mechanism:** `resolve-inline`  
**Decision:** The research-only workflow path is correct. Requirements are externally anchored
by the concept-rag reference; the open work is pattern-level/mechanical and is resolved by
research rather than elicitation.  
**Resolved by:** User confirmation at the `research-assumption-interview` checkpoint
(2026-06-09).  
**Server-applied effect:** `assumption_resolved_inline = true`.

#### DP-6 — Resolved (user decision at analysis review) — ADRs EXCLUDED from docs

**Status:** Resolved — excluded by user decision  
**Resolution mechanism:** explicit user decision at the implementation-analysis review  
**Decision:** Do **not** surface ADRs from the docs system **at all** — no GitHub link, no
symlink, no ADR section in the docs nav. The `.engineering/artifacts/adr/` series stays
solely under engineering artifacts and is **not** referenced from the docs site. This
supersedes the earlier replayed inline position (which had favored surfacing via
link/symlink, the position also carried by the coupled research assumption **R-2**). DP-6
("whether to introduce / surface an ADR series in docs") is therefore answered **no ADR
section in the docs nav**.  
**Rationale:** Every surfacing approach couples the describe-as-it-is docs voice (or the
docs build) to engineering decision-history that lives on a separate branch in an
uninitialised submodule (see the `05-implementation-analysis.md` submodule finding); the
user elected to keep the two surfaces fully separate.  
**Effect on R-2:** R-2's surfacing-mechanism recommendation (link/symlink) is **withdrawn** —
no surfacing mechanism is adopted. R-2's other premise (do not create a *new* ADR series;
do not relocate the existing one under the docs voice) still holds.  
**Resolved by:** User decision at the implementation-analysis `analysis-confirmed` review
(2026-06-09).

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
not by independent user decisions. They were therefore originally recorded using the
**agent's recommended positions** and flagged for explicit confirmation. **DP-6 has now been
decided independently by the user at the implementation-analysis review (ADRs excluded —
see the DP-6 block), superseding the replayed position; the coupled R-2 surfacing
recommendation is withdrawn accordingly.** R-3 remains carried for explicit confirmation at
plan-prepare. No open or deferred assumptions remain after the loop:
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
link/symlink surfacing route is technically proven to work. The surfacing-mechanism
*decision* is a documentation-design judgement (it is the substance of DP-6). **DP-6 has
since been resolved by the user as "do not surface ADRs from docs at all" — so R-2's
surfacing recommendation is withdrawn; no symlink/link route is adopted.** Reclassified
not-code-resolvable for the (now-moot) decision.

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

## Implementation Analysis

**Date:** 2026-06-09

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| IA-1 | Dependency Understanding | M | The ADRs at `.engineering/artifacts/adr/` can be surfaced into the docs site via a `docs/adr -> ../.engineering/artifacts/adr` symlink (the concept-rag `docs/prompts -> ../prompts` pattern), as research R-2/DP-6 assumed. | Research established symlink-into-`docs/` as the ADR-surfacing mechanism, modeled on the exemplar's `prompts` symlink. |
| IA-2 | Current Behavior | L | Every existing `docs/*` filename can be kept and the section structure expressed purely through `mkdocs.yml` `nav` paths, yielding zero link rot (R-4 keep-filenames path). | R-4 selected keep-filenames; this analysis assumes it is mechanically achievable with manual nav. |
| IA-3 | Baseline Interpretation | L | The worktree carries no `mkdocs.yml`, `requirements.txt`, `package.json docs:*` scripts, or `.github/` — so the docs system is greenfield scaffolding, and the deploy Action is the repo's first CI + first Python dep. | Comprehension Q8 asserted this baseline; the analysis re-confirms it against the worktree. |
| IA-4 | Dependency Understanding | L | `docs/architecture.md` is already hub-shaped and its body can be reused verbatim as the Architecture section index without rewrite (DR-2). | DR-2 established the hub already exists; the analysis assumes the content transfers as-is. |

**Categories:** Dependency Understanding, Current Behavior, Baseline Interpretation

### Reconciliation — Implementation Analysis Phase

All four assumptions are code-resolvable by filesystem inspection of the worktree at `target_path` and the exemplar at `~/projects/dev/concept-rag`. One pass was performed during this activity.

**IA-1 — Invalidated (CORRECTED).**
Evidence: `.gitmodules` declares `.engineering` as a git **submodule** on branch `engineering`; in the worktree the `.engineering/` directory is **empty** (`ls` shows no contents), and the ADR files (`0001…0005`) exist only in the *main* checkout, not at `target_path/.engineering/artifacts/adr/`. A `docs/adr -> ../.engineering/artifacts/adr` symlink would point at an uninitialised submodule path, and the ADRs are on a different branch from the `main`-branch tree the docs site/deploy build from. **The symlink mechanism is not viable as-described.** Resolution: the user decided at the analysis review to **not surface ADRs from the docs system at all** — no GitHub link, no symlink, no nav section (Q-IMPL-1 in `05-implementation-analysis.md`). This resolves DP-6 as *excluded by user decision*.

**IA-2 — Validated.**
Evidence: `docs/` holds 12 files; the ~50 inbound links (comprehension Q11) target those exact filenames; manual `nav` in MkDocs maps section labels to file paths without requiring file moves. Keeping filenames + nav-path-only structure is achievable → zero link rot. Assumption holds.

**IA-3 — Validated.**
Evidence: worktree has no `mkdocs.yml`, `requirements.txt`, `pyproject.toml`, `package.json docs:*` scripts (read this pass), and no `.github/` directory (`ls` → absent). `package.json` is a pure-TypeScript dependency set. The docs system is greenfield scaffolding and the deploy Action is the first CI + first Python dep. Assumption holds.

**IA-4 — Validated.**
Evidence: `docs/architecture.md` (read this pass) is a numbered prose hub linking all 6 model/spec docs plus Tool Reference and Development pointers — structurally a section-index/overview. Its body is reusable as-is (optionally adding a repo-structure table to match the exemplar). Assumption holds.

### Convergence

All four implementation-analysis assumptions are resolved by code/filesystem inspection (3 validated, 1 invalidated-and-corrected). No code-resolvable assumptions remain → convergence. `has_resolvable_assumptions = false`. IA-1's correction is folded into Q-IMPL-1, which the user resolved at the analysis review as **ADRs excluded from docs** — this also settles DP-6 (excluded by user decision). No *new* stakeholder-dependent assumptions surfaced → `has_open_assumptions = false` for this phase. Of the Research-phase plan-prepare confirmations, **DP-6 is now resolved**; only R-3 remains carried to plan-prepare.

### Updated Counts

Total: 15 — Validated: 6 (DP-1, DP-2, DP-5, IA-2, IA-3, IA-4) — Partially Validated: 5 (DP-3, R-1, R-2, R-4, R-5) —
Invalidated/Corrected: 1 (IA-1) — Resolved non-code-resolvable: 3 (DP-4, DP-6, R-3 — all resolved inline; DP-6 decided by user at this review, R-3 carried for explicit confirmation at plan-prepare) — Open: 0 — Open code-resolvable: 0.

---
