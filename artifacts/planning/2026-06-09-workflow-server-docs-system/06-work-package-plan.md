# Workflow-Server Documentation System — Implementation Plan

**Date:** 2026-06-09
**Priority:** MEDIUM
**Status:** Ready
**Estimated Effort:** 1–4h agentic + ~1h review

---

## Overview

### Problem Statement

The workflow-server's documentation has accumulated across disconnected locations — a root `README.md`, `SETUP.md`, a flat `docs/` folder of 12 model/specification/guide files, and `schemas/README.md` — with no single discoverable entry point, no navigation map, and no published-site frame. A reader (new contributor, integrator, or agent) has no starting point and no map of which document answers which question, and undocumented pages drift apart over time. This raises onboarding/integration cost and erodes trust in the documentation.

### Scope

**In Scope:**
- Stand up an MkDocs Material documentation **frame** over the existing docs, mirroring the concept-rag exemplar's shape and style.
- **Layer A (structure):** `mkdocs.yml` (Material theme, feature flags, markdown extensions, manual `nav`, `validation:` block), grid-card `docs/index.md` landing page, a thin `docs/how-it-works.md`, section overview pages where a multi-page section is adopted, symlinks of in-tree files (`schemas/README.md`; `SETUP.md` where surfaced) into `docs/`, and `.gitignore += site/`.
- **Layer B (local build tooling):** `requirements.txt` (`mkdocs-material>=9.0`) and `package.json` `docs:serve` / `docs:build --strict` scripts.
- Keep all existing `docs/*` filenames and fixed-path root files in place; express structure purely through nav paths (zero link rot).

**Out of Scope:**
- **Layer C (deploy GitHub Action / `gh-deploy`)** — DEFERRED, gated on explicit CI approval (see *Decision Checkpoint: Layer C*). Not in the active task list.
- **ADRs** — excluded from the docs system entirely: no link, no symlink, no nav section (DP-6 / Q-IMPL-1). They stay solely under `.engineering/artifacts/adr/`.
- **FAQ / Troubleshooting page** — deferred; no speculative content (Q-IMPL-5).
- **`mike` multi-version docs tooling** — out of scope; no concurrent-release need, not used by the exemplar (R-3).
- Server source (`src/`), JSON schemas (`schemas/*.schema.json`), and workflow TOON files — untouched (DP-5).
- File renames / moves — none; no `mkdocs-redirects` (R-4).

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Design Philosophy:** [`02-design-philosophy.md`](02-design-philosophy.md)
- **KB & Web Research:** [`04-kb-research.md`](04-kb-research.md)
- **Implementation Analysis:** [`05-implementation-analysis.md`](05-implementation-analysis.md)
- **Comprehension:** [`documentation-system.md`](../../comprehension/documentation-system.md)

### Key Findings Summary

**From KB / Web Research:**
- The concept-rag exemplar is an MkDocs Material site driven by a **manual `nav`**; mirror that rather than a nav-autodiscovery plugin (R-1).
- MkDocs 1.6 `validation:` block (`nav.omitted_files`, `nav.not_found`, `links.not_found`, `links.anchors`) + `mkdocs build --strict` is the mechanical guard against orphan pages and dead anchors (R-1, G8).
- Keeping every existing filename and expressing structure via nav paths is the lowest-link-rot path (R-4).

**From Implementation Analysis (structural baseline):**
- **Baseline:** `docs/` = 12 flat files, **0** `index.md`, **0** section indexes; **no** `mkdocs.yml`, **no** `requirements.txt`, **no** `docs:*` scripts, **no** `.github/`; `site/` not git-ignored.
- **Gap:** No single entry point (G1, HIGH), no nav / single source of nav truth (G2, HIGH), no section grouping (G3), no local build toolchain (G4), nav/anchor drift ships silently (G8), `site/` not ignored (G7).
- **Opportunity:** `docs/architecture.md` is already hub-shaped (numbered pointers to the 6 model/spec docs) and reusable as the Architecture section index without rewrite (IA-4).
- **Constraint:** ~50 inbound `.md` links plus 2 anchor-fragment links must keep resolving; highest fan-in is `docs/ide-setup.md` (8), `docs/api-reference.md` (5), `README.md` (5), `SETUP.md` (4), `schemas/README.md` (3).

---

## Proposed Approach

### Solution Design

Add the MkDocs Material **site frame** around the existing, individually-valid documents without moving or renaming any of them. Structure is expressed entirely through a hand-written `nav` in `mkdocs.yml`; the 14 markdown extensions, 9 theme feature flags, and `plugins: - search` are mirrored from the concept-rag exemplar. A fresh grid-card `docs/index.md` is the single discoverable entry point. In-tree files that must appear in nav but live outside `docs/` (`schemas/README.md`, and `SETUP.md` where surfaced) are symlinked into `docs/` (the exemplar's `docs/prompts -> ../prompts` pattern). Drift is caught mechanically by the `validation:` block promoted to fatal via `mkdocs build --strict` in the `docs:build` script. Layer A + Layer B land now; Layer C (publish Action) is deferred behind an explicit approval checkpoint.

### Nav mapping (manual `nav`, guarded by `validation:` + `--strict`)

| Nav section | Source (kept in place) | Note |
|-------------|------------------------|------|
| Home | `docs/index.md` (NEW) | Grid-card landing |
| How It Works | `docs/how-it-works.md` (NEW, thin) | Links to README "How It Works"; no duplication (Q-IMPL-6) |
| Getting Started | `docs/getting-started.md` (NEW overview) → `SETUP.md` (symlinked), `docs/ide-setup.md`, `docs/development.md` | Overview knits the 3 scattered sources |
| Agent Guidance | `docs/agent-guidance.md` (NEW overview) + `docs/ide-setup.md`; references `AGENTS.md` / `.claude/rules/` | Do NOT relocate harness files |
| API Reference | `docs/api-reference.md` | 1:1; single page, no index |
| Architecture | `docs/architecture.md` (kept in place — Q-IMPL-2) + 5 `*_model.md` + 2 `*-specification.md` siblings + `schemas/README.md` (symlinked) | Hub already exists (IA-4) |

No ADR section (DP-6 / Q-IMPL-1). No FAQ/Troubleshooting (Q-IMPL-5).

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Manual nav + keep all filenames + `validation`/`--strict` | Zero link rot; exemplar parity; mechanical drift guard | Nav must be hand-maintained | **Selected** |
| Nav-autodiscovery plugin (`awesome-nav`/`literate-nav`) | No manual nav upkeep | Diverges from exemplar; loses deliberate titles/order | Rejected (R-1) |
| Rename `docs/*` for naming consistency + `mkdocs-redirects` | Uniform filenames | Breaks ~50 inbound + 2 anchor links; redirects don't fix GitHub-rendered `.md` links | Rejected (R-4) |
| Relocate `architecture.md` into `docs/architecture/` (exemplar folder shape) | Literal exemplar mirror | Breaks inbound links to `architecture.md` | Rejected (Q-IMPL-2) |
| Adopt Layer C (deploy) now | Published site immediately | Repo's first CI + first Python-in-CI dep; needs CI approval | Deferred (Q-IMPL-4) |

### Assumptions

- `schemas/README.md` and `SETUP.md` are present in the worktree on the build branch, so symlinks into `docs/` resolve (IA-2; confirmed by worktree inspection).
- `docs/architecture.md` body transfers as-is as the Architecture section index; an optional repo-structure table may be added to match the exemplar, with no behavior claims invented (IA-4).
- All 12 `docs/*` filenames stay; structure is nav-path-only (IA-2) — verified achievable with manual nav.
- The local toolchain assumes Python 3.x + `mkdocs-material>=9` available to the developer running `npm run docs:build`; this is a local prerequisite, not a CI dependency (Layer B).

---

## Implementation Tasks

Ordered leaf-first: create the pages and symlinks that `nav` references **before** the `mkdocs.yml` that references them, so the first `--strict` build (run automatically by the implement task-cycle) has all targets present and passes clean.

### Task 1: Author the grid-card landing page `docs/index.md` (20–30 min)
**Goal:** Single discoverable entry point mirroring the exemplar's grid-card landing (G1).
**Deliverables:**
- `docs/index.md` — one `<div class="grid cards" markdown>` block with cards: **How It Works** → `how-it-works.md`, **Getting Started** → `getting-started.md`, **API Reference** → `api-reference.md`, **Architecture** → `architecture.md`, **Agent Guidance** → `agent-guidance.md`, **Schemas** → `README.md` (symlinked schema ref), **GitHub** → repo URL. Each card: `:material-*:{ .lg .middle }` icon + bold title + `---` + one-line description + `[:octicons-arrow-right-24: …]` CTA. No ADR card. Describe-as-it-is voice; no invented behavior.

### Task 2: Author the thin `docs/how-it-works.md` (10–15 min)
**Goal:** A How It Works page that links to the README "How It Works" section rather than duplicating it (Q-IMPL-6), avoiding README/docs drift.
**Deliverables:**
- `docs/how-it-works.md` — short intro sentence + link to the README "How It Works" section anchor; no copied prose.

### Task 3: Author section overview pages (20–30 min)
**Goal:** Section index pages for the multi-page nav sections (G3), mirroring the exemplar's section-index shape.
**Deliverables:**
- `docs/getting-started.md` — overview that summarizes/links `SETUP.md` (symlinked), `docs/ide-setup.md`, `docs/development.md`.
- `docs/agent-guidance.md` — overview that links `docs/ide-setup.md` and references (does not move/copy) `AGENTS.md` and `.claude/rules/*`.
- (Architecture uses the existing `docs/architecture.md` as its index — no new page; API Reference is single-page — no index.)

### Task 4: Symlink in-tree nav targets into `docs/` (5–10 min)
**Goal:** Make out-of-`docs/` files reachable by nav under `docs_dir` (Q-IMPL-3), using the exemplar's symlink pattern.
**Deliverables:**
- `docs/README.md` symlink → `../schemas/README.md` (schema reference target; final in-`docs/` symlink name to be set so the nav path and the `index.md` Schemas-card CTA agree).
- `docs/SETUP.md` symlink → `../SETUP.md` *where surfaced in the Getting Started nav*.
- Symlinks only; never relocate or copy bodies of fixed-path files.

### Task 5: Create `mkdocs.yml` (30–45 min)
**Goal:** Single source of nav truth + drift guard (G2, G8), mirroring the exemplar config.
**Deliverables:**
- `mkdocs.yml` — `site_name`/`site_description`/`site_url` (workflow-server values), `repo_url: https://github.com/m2ux/workflow-server`; `theme: material` + the 9 feature flags; the 14 markdown extensions verbatim from the exemplar; `plugins: - search`; the **manual `nav`** per the mapping table above (every one of the 12 `docs/*` + the symlinked schema ref placed; 0 orphans); **plus** a `validation:` block (`nav.omitted_files: warn`, `nav.not_found: warn`, `links.not_found: warn`, `links.anchors: warn`).

### Task 6: Add Layer B local build tooling (10–15 min)
**Goal:** Local build/serve toolchain (G4) without CI.
**Deliverables:**
- `requirements.txt` — `mkdocs-material>=9.0` (docs-only; no `nltk`/runtime line, unlike the exemplar).
- `package.json` — add `"docs:serve": "mkdocs serve"` and `"docs:build": "mkdocs build --strict"` to `scripts` (add-only; `--strict` promotes `validation` warnings to fatal).

### Task 7: Add `site/` to `.gitignore` (5 min)
**Goal:** Keep a local `mkdocs build` from dirtying the tree (G7).
**Deliverables:**
- `.gitignore` — add `site/` under the build-output section.

---

## Decision Checkpoint: Layer C (Deploy Action) — DEFERRED, approval-gated

Layer C is **not** in the task list above. It is the repo's **first** `.github/workflows/` file and its **first Python-in-CI dependency**, so it is gated by `file-sensitivity-cicd-approval` and must not be created without explicit user approval.

If approved, Layer C adds `.github/workflows/docs.yml` — a faithful copy of the exemplar: `on: push: branches:[main], paths:[docs/**, mkdocs.yml, .github/workflows/docs.yml]` + `workflow_dispatch`; `concurrency` cancel-in-progress; `permissions: contents: write`; checkout `fetch-depth: 0` → `setup-python@v5` (3.11, `cache: pip`) → `pip install mkdocs-material` → `mkdocs gh-deploy --force`. First-time GitHub Pages setup (Settings → Pages → source `gh-pages`; Actions read/write) is a one-time manual user step.

**Also confirm at this checkpoint:** research assumption **R-3** — `mike` multi-version docs tooling stays **out of scope** unless the user says otherwise.

---

## Success Criteria

*Based on the structural baselines and gap analysis in `05-implementation-analysis.md`.*

### Functional Requirements
- [ ] Single discoverable entry point: `docs/index.md` grid-card landing exists and links every major area (addresses G1).
- [ ] Defined home for every doc: each of the 12 `docs/*` + the symlinked schema ref appears in `mkdocs.yml` `nav` (addresses G2/G3) — **0 orphans**.
- [ ] Thin How It Works page links the README section without duplication (Q-IMPL-6).
- [ ] No ADR section, FAQ, or `mike` config introduced (DP-6/Q-IMPL-1, Q-IMPL-5, R-3).

### Structural Targets
- [ ] **Landing page:** 0 → 1 present.
- [ ] **Nav config:** 0 → 1 present (single source of nav truth).
- [ ] **Section indexes:** 0 → ≥2 (Getting Started, Agent Guidance) plus the reused Architecture hub.
- [ ] **Docs reachable from nav:** 0 → 100% (all 12 `docs/*` + schema ref).
- [ ] **Local build toolchain:** `requirements.txt` + `docs:*` scripts present (0 → present).
- [ ] **`site/` git-ignored:** no → yes.

### Quality Requirements
- [ ] `mkdocs build --strict` exits 0 — no missing files, no broken links, no dead anchors, no `omitted_files` orphans (mechanical gate for the entry-point, all-docs-placed, and zero-link-rot criteria).
- [ ] Zero link rot: all ~50 inbound `.md` links and the 2 anchor links still resolve (no filenames moved/renamed).
- [ ] Style parity: reviewer confirms grid-card landing, section indexes, admonitions, and manual nav match the exemplar.
- [ ] No drift: reviewer confirms new/overview pages describe the system as-is (no invented behavior).

### Measurement Strategy
- `npm run docs:build` (= `mkdocs build --strict`) is the mechanical gate for the entry-point, 100%-placement, broken-link, and dead-anchor criteria.
- Reviewer pass confirms style parity and describe-as-it-is voice on the new/overview pages.
- `git diff --stat` confirms no `src/`, `schemas/*.schema.json`, or workflow TOON files changed.

---

## Testing Strategy

This is a documentation/tooling work package with no runtime code; validation is build-based and review-based rather than unit/integration test code. See [`06-test-plan.md`](06-test-plan.md) for the case-level plan.

- **Build validation:** `mkdocs build --strict` — fails on missing nav targets, broken intra-site links, dead anchors, and `omitted_files` orphans.
- **Link-rot validation:** confirm the high-fan-in inbound links (`docs/ide-setup.md`, `docs/api-reference.md`, `README.md`, `SETUP.md`, `schemas/README.md`) and the 2 anchor-fragment links still resolve (no filenames changed).
- **Style-parity review:** reviewer compares the landing page, section indexes, admonitions, and nav grouping against the concept-rag exemplar.
- **Voice review:** reviewer confirms new/overview pages are describe-as-it-is with no invented behavior.
- **Boundary check:** `git diff --stat` shows only docs + docs-tooling files changed.

---

## Dependencies & Risks

### Requires (Blockers)
- [ ] Python 3.x + `mkdocs-material>=9` available locally to run `mkdocs build --strict` (Layer B local prerequisite; not CI).
- [ ] Explicit user approval before any Layer C / `.github/` work (gate; not a blocker for Layers A+B).

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Manual nav omits a `docs/*` file (orphan) | MEDIUM | MEDIUM | `validation: nav.omitted_files` + `--strict` fails the build |
| A nav target or cross-link is wrong (broken link / dead anchor) | MEDIUM | MEDIUM | `validation: nav.not_found`/`links.not_found`/`links.anchors` + `--strict` |
| Symlink into `docs/` doesn't resolve (target missing on branch) | LOW | LOW | Worktree inspection confirms `schemas/README.md` + `SETUP.md` present; build catches a dangling target |
| `index.md` card CTA and nav path for the schema ref disagree | LOW | MEDIUM | Decide the in-`docs/` symlink name once (Task 4) and use it consistently in both `index.md` and `nav` |
| Accidental scope creep into `src/`/schemas | LOW | LOW | `git diff --stat` boundary check; doc-only task list |
| Layer C added without approval | LOW | LOW | Layer C kept out of the task list, behind an explicit checkpoint |

---

**Status:** Ready for implementation
