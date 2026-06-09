# Implementation Analysis — Workflow-Server Documentation System

**Date:** 2026-06-09
**Work Package:** #132 — Coherent documentation system for workflow-server (`2026-06-09-workflow-server-docs-system`)
**Status:** Complete
**Scope:** Documentation only. No `src/` or `schemas/*.json` (server source) changes. This analysis names exactly WHAT files/dirs to create or change in the worktree to stand up an MkDocs Material docs system mirroring the concept-rag exemplar, how existing root/`docs/` files map into the site nav, and the layering/sequencing for plan-prepare. ADRs are **not** surfaced from the docs site (user decision — see DP-6 / Q-IMPL-1 below); the `.engineering/artifacts/adr/` series stays solely under engineering artifacts and is not referenced from the site.

> This is a documentation/structure work package, so the "implementation" under analysis is the **documentation surface** (files, nav, tooling), not runtime code. There are no runtime performance baselines; baselines below are structural counts and presence/absence facts. The codebase facts here are anchored to direct filesystem inspection of the worktree at `target_path` and the exemplar at `~/projects/dev/concept-rag` (read 2026-06-09), building on the comprehension artifact and `04-kb-research.md` rather than re-deriving them.

---

## Implementation Review

### Existing Location — what the worktree contains today

| Component | Path (in worktree) | State |
|-----------|--------------------|-------|
| Project landing / root docs | `README.md` (5.6 KB), `SETUP.md` (4.7 KB), `AGENTS.md` (5.1 KB), `CLAUDE.md` (5.1 KB, byte-identical to AGENTS.md except H1), `LICENSE` | Present; fixed-path (cannot move) |
| Docs folder | `docs/` — 12 flat `.md` files, **no `index.md`** | Present, flat, no site frame |
| Architecture hub | `docs/architecture.md` (4.5 KB) — numbered prose hub linking the 6 model/spec docs + Tool Reference + Development pointers | Present; already hub-shaped (DR-2) |
| Component deep-dives | `docs/{dispatch,checkpoint,state_management,artifact_management,resource_resolution}_model.md` (5 model docs) + `docs/{technique-protocol,orchestra}-specification.md` (2 specs) | Present |
| Task/reference guides | `docs/{api-reference,development,ide-setup,workflow-fidelity}.md` | Present |
| Schema reference | `schemas/README.md` (52 KB) + `schemas/schema-header.md` | Present; `*.schema.json` are OUT OF SCOPE (server source) |
| Agent guidance | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/{concept-rag,workflow-server}.md` | Present; fixed-path (harness reads them in place) |
| Site tooling | `mkdocs.yml`, `docs/index.md`, `requirements.txt`, `.github/` | **ABSENT** — the headline gap |

Confirmed counts: `docs/` holds exactly **12 files** (no `index.md`); naming is mixed (`snake_case_model.md` ×5, `kebab-specification.md` ×2, `kebab.md` task guides). `package.json` has **no `docs:*` scripts** and is a pure-TypeScript dependency set (no Python). `.gitignore` ignores `dist/`, `coverage/`, `node_modules/` but has **no `site/` entry** (the MkDocs build output dir) — a gap to close.

### Finding — the `.engineering` submodule is NOT checked out in this worktree

This discovery shaped the original ADR-surfacing analysis (research R-2 / DP-6). The user has since **decided to exclude ADRs from the docs site entirely** (see DP-6 / Q-IMPL-1 below), so the finding is now recorded as context rather than as a constraint on a surfacing mechanism that is no longer pursued.

- `.gitmodules` declares `.engineering` as a **git submodule** on branch `engineering` (and `workflows` likewise on branch `workflows`), URL `git@github.com:m2ux/workflow-server.git`.
- In the worktree the `.engineering/` directory is **empty** (`ls` shows no contents). The ADR series `0001-import-prism-families.md … 0005-canonical-identifier-naming-convention.md` exists in the **main** checkout's `.engineering/artifacts/adr/`, but is **not present at `target_path/.engineering/artifacts/adr/`**.
- Bearing on the decision: a `docs/adr -> ../.engineering/artifacts/adr` symlink (the concept-rag `docs/prompts -> ../prompts` pattern) would have pointed at an **empty/uninitialised submodule path** in the worktree, and the ADR files live on a **different branch in a separate submodule** — they are not part of the `main`-branch tree that the docs site and the deploy Action build from. The symlink-into-`docs/` mechanism research assumed was therefore never viable as-described, and even a plain GitHub link would couple the docs voice to engineering decision-history. The user has resolved this by **not surfacing ADRs from the docs system at all** (no GitHub link, no symlink, no ADR nav section). The ADR series stays solely under `.engineering/artifacts/adr/`. This closes Q-IMPL-1 and resolves DP-6 as *excluded by user decision* — there is no ADR section in the docs nav.

### Exemplar reference — concept-rag toolchain (every file inspected, 2026-06-09)

| Concern | Exemplar file | What it contains (to mirror) |
|---------|---------------|------------------------------|
| Site config + nav | `mkdocs.yml` (8.1 KB) | `theme: material`; 9 feature flags incl. `navigation.tabs/sections/expand/top/indexes`, `toc.integrate`; **14 markdown extensions** (admonition, pymdownx.details/superfences+mermaid/highlight/inlinehilite/snippets/tabbed/emoji, tables, attr_list, md_in_html, toc permalink); a **fully manual `nav`** tree; `plugins: - search` |
| Landing | `docs/index.md` (1.6 KB) | One `<div class="grid cards" markdown>` block, 7 cards, each `:material-*:{ .lg .middle }` icon + bold title + `---` + one-line desc + `[:octicons-arrow-right-24: …](target.md)` CTA. No custom CSS. |
| Architecture hub | `docs/architecture/README.md` | Repo-structure table (dir → contents) + bulleted **Key Components** links + one pointer into the ADR series |
| Python deps | `requirements.txt` | `nltk>=3.8` (its runtime) + `mkdocs-material>=9.0` (docs) |
| Dev scripts | `package.json` | `"docs:serve": "mkdocs serve"`, `"docs:build": "mkdocs build"` |
| Deploy CI | `.github/workflows/docs.yml` (955 B) | `on: push: branches:[main], paths:[docs/**, mkdocs.yml, .github/workflows/docs.yml]` + `workflow_dispatch`; `concurrency` cancel-in-progress; `permissions: contents: write`; steps: checkout `fetch-depth:0` → `setup-python@v5` 3.11 (`cache: pip`) → `pip install mkdocs-material` → `mkdocs gh-deploy --force` |
| Section-index mechanism | `navigation.indexes` + per-section `index.md`/`README.md` | In the exemplar, ADRs live **inside** `docs/architecture/` (under the docs voice) and `docs/prompts` is a **symlink** to `../prompts`. workflow-server **diverges on ADRs**: they are not surfaced from the site at all (DP-6 / Q-IMPL-1). The symlink mechanism is still used for in-tree files like `schemas/README.md` (Q-IMPL-3). |

### Dependencies / integration points

- **Depends on (new):** Python 3.x + `mkdocs-material>=9` (a new dependency surface in an otherwise pure-TypeScript repo); GitHub Pages + a `gh-pages` branch (publishing target) for the deploy layer.
- **Depended on by:** ~50 inbound `.md` links across `README.md`, `SETUP.md`, `AGENTS.md`/`CLAUDE.md`, `docs/*`, `schemas/README.md` (comprehension Q11). Highest fan-in (link-rot blast radius): `docs/ide-setup.md` (8), `docs/api-reference.md` (5), `README.md` (5), `SETUP.md` (4), `schemas/README.md` (3). Two **anchor-fragment** links (`state_management_model.md#5-persistence`, `SETUP.md#deploying-to-projects`) break on heading rename too.
- **Architecture pattern already present:** `docs/architecture.md` is already a hub (numbered prose pointers to all 6 model/spec docs) — structurally analogous to the exemplar's `architecture/README.md` (DR-2). The new work is the site *frame*, not rewriting the hub content.

---

## Effectiveness Evaluation

### What's working (no change needed) ✅

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Every existing doc is individually valid and current | Comprehension DP-2 validated; 12 `docs/` files inspected, none broken/contradictory | HIGH |
| Architecture hub-and-spoke already exists | `docs/architecture.md` numbered pointers to the 6 component docs (read this pass) | HIGH |
| README already carries How-It-Works + Architecture + Tools-at-a-glance | `README.md` lines 16–50 (read this pass) | HIGH |
| Inbound links currently resolve | ~50 `.md` links enumerated in comprehension Q11; no current build to break | HIGH |

### What's missing (the work) ❌

| Gap | Evidence | Impact |
|-----|----------|--------|
| No single discoverable entry point | No `docs/index.md` in worktree | HIGH — headline success criterion |
| No navigation map / single nav source | No `mkdocs.yml` | HIGH — headline success criterion |
| No section grouping / section indexes | `docs/` is flat, 12 files, zero `index.md` | MEDIUM |
| No published-site toolchain | No `requirements.txt`, no `package.json docs:*` scripts, no `.github/` | MEDIUM (publishing half) |
| `site/` not git-ignored | `.gitignore` read this pass — no `site/` entry | LOW (housekeeping) |

### Workarounds in place

- README acts as the de-facto entry point with an inline "•"-separated top link bar (line 12). Readers browse `docs/` as a flat GitHub file list. No site, no search.

---

## Baseline Metrics (structural)

| Metric | Current value | Measurement method | Date |
|--------|---------------|--------------------|------|
| Landing page present | No (0) | `ls docs/index.md` → absent | 2026-06-09 |
| Nav config present | No (0) | `ls mkdocs.yml` → absent | 2026-06-09 |
| Section index pages | 0 | `ls docs/**/index.md` → none | 2026-06-09 |
| `docs/` files | 12 | `ls docs/` | 2026-06-09 |
| `docs/` files reachable from a nav | 0 (no nav exists) | inspection | 2026-06-09 |
| Docs build scripts in `package.json` | 0 | read `package.json` (no `docs:*`) | 2026-06-09 |
| Python deps | 0 | no `requirements.txt`/`pyproject.toml` | 2026-06-09 |
| GitHub Actions workflows | 0 | `.github/` absent | 2026-06-09 |
| Inbound `.md` links to preserve | ~50 | comprehension Q11 grep | 2026-06-09 |

---

## What to Create / Change — concrete file manifest

Organized by the three approvable layers (research Recommended Approach). Paths are relative to the worktree root `target_path`.

### Layer A — Structure (builds locally; no CI, no Python in repo deps)

**CREATE:**

| File | Purpose / content |
|------|-------------------|
| `mkdocs.yml` | Site config mirroring the exemplar: `site_name`/`site_description`/`site_url` (workflow-server values), `repo_url: https://github.com/m2ux/workflow-server`; `theme: material` + the 9 feature flags; the 14 markdown extensions verbatim from the exemplar; `plugins: - search`; a **manual `nav`** (mapped below); **plus** a `validation:` block (`nav.omitted_files: warn`, `nav.not_found: warn`, `links.not_found: warn`, `links.anchors: warn`) — the mechanical orphan/dead-anchor guard the exemplar omits (research R-1). |
| `docs/index.md` | Grid-card landing, authored fresh (NOT pasted from README — cr ADR-0052 precedent). Proposed cards: **How It Works** → `how-it-works.md` (thin linking page, Q-IMPL-6), **Getting Started** → `getting-started.md`/`SETUP.md`, **API Reference** → `api-reference.md`, **Architecture** → `architecture.md` (kept in place, Q-IMPL-2), **Agent Guidance** → guidance overview, **Schemas** → `schemas/README.md` (symlinked into `docs/`, Q-IMPL-3), **GitHub** → repo. No ADR card (DP-6 / Q-IMPL-1 — ADRs excluded). Card count/targets to be finalized at plan-prepare. |
| `docs/how-it-works.md` (NEW, thin) | Thin "How It Works" page that **links** to the README "How It Works" section rather than duplicating it (Q-IMPL-6 accepted — avoids README/docs drift). |
| Section overview pages as needed | If a "Getting Started" and/or "Agent Guidance" nav section is adopted, author one Overview page each (e.g. `docs/getting-started.md` summarizing/​linking SETUP + ide-setup; an agent-guidance overview linking `docs/ide-setup.md` and referencing — not moving — `AGENTS.md`/`.claude/rules/`). Single-page sections (API Reference) need no index. |

**CHANGE:**

| File | Change |
|------|--------|
| `.gitignore` | Add `site/` (MkDocs build output) so a local `mkdocs build` does not dirty the tree. |

> **`docs/architecture.md` stays in place** (Q-IMPL-2 accepted): keep the filename and nav-point to it as the Architecture section index — **zero link rot**, since it carries inbound links. It is not relocated into a `docs/architecture/` folder. The exemplar's folder shape is not mirrored here; the hub is referenced by nav path.

**DECISION — keep all existing `docs/*` filenames** (research R-4, comprehension Q11 option (a)): express the section structure purely through `nav` *paths* in `mkdocs.yml`, not file moves. This yields **zero link rot** across the ~50 inbound links and the two anchor-fragment links. No renames; therefore **no `mkdocs-redirects` needed** (it is only a fallback if a consistency-rename is later chosen, and it does not fix GitHub-rendered `.md` links anyway).

### Layer B — Local build tooling (adds Python dep + npm scripts; no CI) — ADOPTED NOW

> **Q-IMPL-4 accepted:** adopt **Layer A (structure) + Layer B (local build tooling) now**. Layer C (deploy Action) is deferred and gated on explicit CI approval at plan-prepare.

**CREATE:**

| File | Content |
|------|---------|
| `requirements.txt` | `mkdocs-material>=9.0` (workflow-server has no Python runtime, so — unlike the exemplar — there is no `nltk` line; this file is docs-only). |

**CHANGE:**

| File | Change |
|------|--------|
| `package.json` | Add `"docs:serve": "mkdocs serve"` and `"docs:build": "mkdocs build --strict"` to `scripts` (mirroring the exemplar; `--strict` promotes the `validation` warnings to fatal so orphans/dead-anchors fail the build). |

### Layer C — Deploy Action (DEFERRED — APPROVAL-GATED: repo's first CI + first Python dep in CI)

**CREATE:**

| File | Content |
|------|---------|
| `.github/workflows/docs.yml` | Faithful copy of the exemplar: `on: push: branches:[main], paths:[docs/**, mkdocs.yml, .github/workflows/docs.yml]` + `workflow_dispatch`; `concurrency` cancel-in-progress; `permissions: contents: write`; checkout `fetch-depth:0` → `setup-python@v5` 3.11 `cache: pip` → `pip install mkdocs-material` → `mkdocs gh-deploy --force`. |

> Layer C is the repo's **first** `.github/workflows/` file and is gated by `file-sensitivity-cicd-approval` — it MUST NOT be created without explicit user approval at plan-prepare. First-time GitHub Pages setup (Settings → Pages → source = `gh-pages`; Actions read/write) is a one-time manual step the user performs, documented in the plan but not automatable here.

---

## Nav mapping — existing files → site sections

Manual `nav` (matches exemplar; guarded by `validation` + `--strict`). Proposed mapping (final grouping confirmed at plan-prepare):

| Nav section | Source file(s) (kept in place) | Mapping note |
|-------------|--------------------------------|--------------|
| Home | `docs/index.md` (NEW) | Grid-card landing |
| How It Works | `docs/how-it-works.md` (NEW, thin linking page) | Q-IMPL-6 accepted — links to the README "How It Works" section rather than duplicating it (avoids README/docs drift) |
| Getting Started | `SETUP.md` (root, symlinked into `docs/`), `docs/ide-setup.md`, `docs/development.md` | Scattered across 3 files; an Overview page can knit them |
| Agent Guidance | Overview (NEW) + `docs/ide-setup.md`; references `AGENTS.md`/`.claude/rules/` | Do NOT relocate harness files (DR-3) |
| API Reference | `docs/api-reference.md` | 1:1 match; single page (no index) |
| Architecture | Overview = `docs/architecture.md` (kept in place — Q-IMPL-2) + the 5 `*_model.md` + 2 `*-specification.md` as siblings + `schemas/README.md` (symlinked into `docs/`) as schema ref | Component deep-dives (Q4); hub already exists |

**No ADRs section** (DP-6 / Q-IMPL-1): ADRs are excluded from the docs nav by user decision — no link, no symlink, no section. The Architecture hub does **not** point at the ADR series.

**FAQ / Troubleshooting — DEFERRED** (Q-IMPL-5 accepted): no FAQ/Troubleshooting page is authored in this work package (no speculative content; authoring without real seeds risks a fidelity violation).

Files included by `nav` from **outside** `docs/` (root `SETUP.md`, `schemas/README.md`): MkDocs requires nav targets under `docs_dir`. **Q-IMPL-3 accepted** — symlink the specific in-tree files into `docs/` (the exemplar's `docs/prompts -> ../prompts` pattern): `schemas/README.md` and, where surfaced, `SETUP.md`. Both are on the same branch and present in the worktree, so the symlinks resolve. (This mechanism is **not** used for the ADR dir — ADRs are excluded entirely per Q-IMPL-1.)

---

## Gap Analysis

| ID | Gap | Current | Desired | Impact | Priority |
|----|-----|---------|---------|--------|----------|
| G1 | No landing page | absent | `docs/index.md` grid-card | HIGH | HIGH |
| G2 | No nav / single source of nav truth | absent | `mkdocs.yml` manual nav + `validation` | HIGH | HIGH |
| G3 | No section indexes | flat | per-section Overview pages | MEDIUM | MEDIUM |
| G4 | No local build toolchain | absent | `requirements.txt` + `docs:*` scripts | MEDIUM | MEDIUM |
| G5 | No published site | absent | deploy Action (Layer C, deferred — approval-gated) | MEDIUM | LOW (gated) |
| G7 | `site/` not git-ignored | not ignored | add to `.gitignore` | LOW | LOW |
| G8 | Nav/anchor drift can ship silently | n/a (no nav) | `validation` + `--strict` | MEDIUM | MEDIUM |

> The former G6 (ADRs unreachable from docs) is **withdrawn**: surfacing ADRs from the docs site is excluded by user decision (DP-6 / Q-IMPL-1), so it is no longer a gap this work package addresses. Gap IDs are otherwise unchanged.

---

## Opportunities

- **Quick wins:** `.gitignore += site/`; `validation:` block + `--strict` (one config block, kills the dominant sync-drift risk for free); reuse the existing `docs/architecture.md` hub body verbatim (no rewrite).
- **Structural:** the manual-nav + grid-card + section-index frame is the bulk of the value and is Layer-A-only (no CI, no approval gate) — it can land and be reviewed independently of publishing.
- **Deferred (decided):** FAQ/Troubleshooting is **not** authored in this work package (Q-IMPL-5 accepted) — no real seed content, and authoring would risk inventing behavior (fidelity violation against the "no drift" success criterion).

---

## Success Criteria (measurement methodology)

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Single discoverable entry point | `docs/index.md` grid-card landing exists, links every major area | Present |
| Defined home for every doc | Each of the 12 `docs/*` + `schemas/README.md` appears in `mkdocs.yml` `nav` | 100% placed (0 orphans) |
| Navigable structure builds clean | `mkdocs build --strict` exits 0 (no missing files, no broken links, no dead anchors, no `omitted_files` orphans) | Pass |
| Zero link rot | All ~50 inbound `.md` links and the 2 anchor links still resolve (no filenames moved/renamed) | 0 broken |
| Style parity | Reviewer confirms grid-card landing, section indexes, admonitions, manual nav match the exemplar | Confirmed |
| No drift introduced | Reviewer confirms restructured/new pages describe the system as-is (no invented behavior; describe-as-it-is voice on all `docs/` pages) | Confirmed |

Validation tool: `npm run docs:build` (= `mkdocs build --strict`) is the mechanical gate for criteria 2, 3, and 4 (orphans, broken links, dead anchors).

---

## Impacted / At-Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| `docs/architecture.md` | Relocating to a folder would break inbound links | Q-IMPL-2 accepted: keep in place, nav-point to it (zero rot) |
| Fixed-path files (`README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/rules/*`) | Cannot move (harness/GitHub/npm entry points) | Surface via nav paths / symlink; never relocate or copy bodies |
| `.engineering` submodule (empty in worktree) | ADR-surfacing approaches all couple the docs site to a separate branch / submodule | Resolved: ADRs are **not** surfaced from the docs site (DP-6 / Q-IMPL-1) — no link, no symlink |
| `package.json` | Build-script edit touches a core config file | Add-only (`docs:*` scripts); approval per `file-sensitivity` if needed |
| `.github/workflows/docs.yml` | First CI + first Python dep in CI | Layer C only (deferred); explicit user approval gate (`file-sensitivity-cicd-approval`) |
| Manual nav drift | Orphans/dead anchors ship silently | `validation` block + `--strict` in `docs:build` |
| `AGENTS.md`/`CLAUDE.md` lockstep | Already a latent drift hazard | Out of scope here; reference both, edit neither in this WP |

---

## Implementation Decisions (resolved by user at analysis review)

All six implementation questions raised during this analysis were reviewed and decided by the user. They are recorded here as settled decisions carried into plan-prepare.

- **Q-IMPL-1 (ADR surfacing) — RESOLVED: do NOT surface ADRs at all.** No GitHub link, no symlink, no ADR section in the docs system. The ADR series stays solely under `.engineering/artifacts/adr/` and is not referenced from the docs site. This also resolves **DP-6**: there is no ADR section in the docs nav (DP-6 = excluded by user decision). The `.engineering` submodule discovery (separate branch, empty in worktree) remains recorded as the context that made every surfacing approach undesirable.
- **Q-IMPL-2 (Architecture hub placement) — RESOLVED: keep `docs/architecture.md` in place** and nav-point to it (zero link rot). Not relocated into a `docs/architecture/` folder.
- **Q-IMPL-3 (including root/`schemas` files in nav) — RESOLVED: symlink the in-tree files into `docs/`** (the concept-rag `prompts` pattern): `schemas/README.md`, and `SETUP.md` where surfaced. Both are on the same branch and present in the worktree.
- **Q-IMPL-4 (which layers to adopt now) — RESOLVED: adopt Layer A (structure) + Layer B (local build tooling) now.** Layer C (deploy Action) is deferred and gated on explicit CI approval at plan-prepare.
- **Q-IMPL-5 (FAQ/Troubleshooting) — RESOLVED: defer.** No FAQ/Troubleshooting page is authored in this work package (no speculative content).
- **Q-IMPL-6 (How It Works page) — RESOLVED: thin linking page.** Author a `docs/how-it-works.md` that points at the README "How It Works" section rather than duplicating it.

---

## Sources of Evidence

| Source | Type | What it showed |
|--------|------|----------------|
| Worktree `ls`/reads (`docs/`, `.gitmodules`, `.gitignore`, `package.json`, `README.md`, `docs/architecture.md`) | Filesystem | 12 flat docs, no site frame; `.engineering` submodule empty in worktree; no `site/` ignore; no `docs:*` scripts |
| `~/projects/dev/concept-rag` reads (`mkdocs.yml`, `docs/index.md`, `docs/architecture/README.md`, `.github/workflows/docs.yml`, `requirements.txt`, `package.json`) | Filesystem | Exact exemplar shape to mirror (config, landing, hub, deploy, deps, scripts) |
| `02-design-philosophy.md`, `02-assumptions-log.md`, `04-kb-research.md`, comprehension `documentation-system.md` | Prior artifacts | Mapping decisions, validated assumptions, MkDocs conventions, layering — carried forward, not re-derived |

---

**Status:** Ready for plan-prepare activity
