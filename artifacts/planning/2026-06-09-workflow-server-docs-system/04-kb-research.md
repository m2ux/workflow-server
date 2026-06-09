# Knowledge Base Research — Workflow-Server Documentation System

**Date:** 2026-06-09
**Work Package:** #132 — Coherent documentation system for workflow-server (`2026-06-09-workflow-server-docs-system`)
**Status:** Complete
**Context scope:** `mixed` — both repository and external sources informed this phase. External web sources (official MkDocs / Material for MkDocs docs and plugin repos) informed the tooling decisions, and codebase analysis of the worktree and the concept-rag reference confirmed the codebase-side premises the assumptions rest on (see the reconciliation passes in [02-assumptions-log.md](02-assumptions-log.md)). The bulk of the codebase facts were established in the prior comprehension phase ([documentation-system.md](../../comprehension/documentation-system.md)).

This research de-risks the four planning decision points the comprehension surfaced (DP-6 ADR surfacing, DP-8 toolchain depth, nav-sync policy, link-preservation policy). It does **not** re-establish the concept-rag structure or the workflow-server doc inventory — those are settled in the comprehension artifact and are referenced, not repeated.

---

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|----------------|-----------------|
| `identify-best-practices` / `identify-patterns` (concept-rag activity index) | concept-rag `concept_search` | **No relevant content** — the indexed library is general (Rust book, systems-engineering texts); it has no MkDocs / docs-as-code / static-site tooling material. KB gap recorded; findings rely on web research. |
| Web research (focus areas 1–4) | `WebSearch` + `WebFetch` against official MkDocs & Material for MkDocs docs and first-party plugin repos | Authoritative answers for nav management, `--strict`/`validation` orphan & link detection, `mkdocs-redirects`, no-CI adoption layering, `mike` versioning, and external-file inclusion. |

> **KB gap note:** `concept-rag` returned only `The Rust Programming Language` for "code documentation" and a zero-chunk systems-engineering hit for "single source of truth". The knowledge base holds no documentation-tooling or MkDocs material, so this phase is web-anchored by necessity, not preference. Per the research rules, the gap is noted and multiple web sources were cross-referenced.

---

## Relevant Concepts Discovered (web)

### MkDocs 1.6 `validation:` block — mechanical orphan & broken-link detection
**Source:** [MkDocs Configuration guide](https://www.mkdocs.org/user-guide/configuration/)
**Relevance:** Directly resolves the comprehension's headline "fidelity/sync drift" risk and the nav-sync policy decision (Q10). The comprehension noted that a default `mkdocs build` catches *nav → missing file* but **not** *file → missing nav* (orphans), and that anchor links break silently on heading renames (Q11).
**Key Insight:** MkDocs 1.6 adds a `validation:` config with two groups, each setting taking `warn` | `info` | `ignore`:
- `validation.nav.omitted_files` — flags pages present in `docs/` but absent from `nav` (**the orphan tripwire** the comprehension said the default build lacks).
- `validation.nav.not_found` — nav entries pointing at non-existent files.
- `validation.nav.absolute_links` — absolute paths in nav.
- `validation.links.not_found` — broken in-page links.
- `validation.links.anchors` — **links to non-existent heading anchors** (catches the `state_management_model.md#5-persistence` / `SETUP.md#deploying-to-projects` fragility from Q11).
- `validation.links.unrecognized_links` / `absolute_links` (with the `relative_to_docs` value).
- `not_in_nav` — an allow-list of glob patterns that are intentionally excluded from nav, suppressing the `omitted_files` warning for them.
- `strict: true` (equivalently `mkdocs build --strict`) **promotes every `warn` to a fatal error** — so a CI build with `validation` set to `warn` + `--strict` fails on orphaned pages, broken links, and dead anchors.

### Navigation management: manual nav vs. plugins
**Source:** [Material — Setting up navigation](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/); [mkdocs-literate-nav](https://github.com/oprypin/mkdocs-literate-nav); [mkdocs-awesome-nav](https://github.com/lukasgeiter/mkdocs-awesome-nav)
**Relevance:** Resolves the nav-sync policy decision — whether to adopt the exemplar's manual nav or an autodiscovery plugin.
**Key Insight:** Three approaches exist:
- **Manual YAML `nav`** (the concept-rag choice, confirmed in comprehension Q10): full explicit control, hand-written human titles, no autodiscovery. Best when the page set is curated and titles matter (e.g. `"ADR-0050: MkDocs Site"`).
- **`mkdocs-awesome-nav`** (successor to `awesome-pages`): `.nav.yml` files per directory give ordering/glob/section control without hand-writing the whole tree — reduces the manual-edit burden when files are added/moved.
- **`mkdocs-literate-nav`**: nav expressed as Markdown lists in a `SUMMARY.md`-style file; pairs with `section-index` and `gen-files`.
For a curated ~25-page site that mirrors concept-rag, **manual nav matches the exemplar and keeps titles deliberate**; the `validation` block (above) supplies the safety net that the comprehension worried manual nav lacks.

### `mkdocs-redirects` — URL preservation on rename/move
**Source:** [mkdocs/mkdocs-redirects](https://github.com/mkdocs/mkdocs-redirects/blob/master/README.md) ([PyPI](https://pypi.org/project/mkdocs-redirects/))
**Relevance:** Resolves the link-preservation policy decision (Q11) for the *site-internal* case if any docs are renamed (e.g. normalizing the `snake_case_model.md` vs `kebab-specification.md` inconsistency).
**Key Insight:** Configure `redirect_maps` with `old.md: new.md` pairs; at build time the plugin emits a small `.html` redirect at each old path so old site URLs keep resolving. It is keyed on the **original markdown filename** (relative to `docs_dir`), honours `use_directory_urls`, and can target external URLs. **Caveat — scope:** redirects only cover the *built site's* URLs. They do **not** fix `.md`-to-`.md` links rendered on GitHub (README/AGENTS browsing), and they cannot rescue harness-path files (`AGENTS.md`/`CLAUDE.md`/`.claude/rules/`) or repo/npm landing files (`README.md`/`SETUP.md`) — those still cannot move (comprehension Q11 constraint).

### Including files outside `docs/` — symlink vs. snippets vs. plugin
**Source:** [mkdocs-include-markdown-plugin](https://github.com/mondeja/mkdocs-include-markdown-plugin); [MkDocs writing-your-docs](https://www.mkdocs.org/user-guide/writing-your-docs/); [MagicSpace include tutorial](https://mkdocs-magicspace.alnoda.org/tutorials/extra-features/include/)
**Relevance:** Resolves *how* to surface agent-guidance (`AGENTS.md`, `.claude/rules/`) and the existing `.engineering/artifacts/adr/` ADRs in the docs nav **without moving the source files** (comprehension DR-3/DR-4, Q5, Q6). concept-rag already demonstrates the symlink pattern (`docs/prompts -> ../prompts`).
**Key Insight:** Three inclusion mechanisms, in increasing power:
- **Symlink** into `docs/` (concept-rag's choice for `prompts`): simplest; the linked tree is treated as if it lived in `docs/`. Works for whole directories; the source stays canonical at its real path.
- **`pymdownx.snippets`** (already a Material-default extension): include file *content* via `--8<-- "path"`, with a `base_path` rooted at the repo (not just `docs/`) — good for pulling a fragment of an external file inline.
- **`mkdocs-include-markdown-plugin`**: most powerful — relative-link rewriting, heading-offset, start/end delimiters to include a *section* of an external file. Best when you want to surface part of `AGENTS.md` inside a docs page without duplicating it.

### `mike` versioning — not needed here
**Source:** [Material — Setting up versioning](https://squidfunk.github.io/mkdocs-material/setup/setting-up-versioning/); [jimporter/mike](https://github.com/jimporter/mike)
**Relevance:** Listed in the research focus "if relevant." Assessing relevance.
**Key Insight:** `mike` deploys multiple doc versions to `gh-pages` (a frozen build per version). It is justified only when multiple supported releases need concurrent docs. concept-rag does **not** use it, the workflow-server has no released-version-skew documentation need, and the Material docs note it is "rarely seen … too non-trivial to set up" for small projects. **Recommendation: omit `mike`** — it would diverge from the exemplar and add ceremony without a need.

### GitHub Actions deploy for a repo with no existing CI
**Source:** [Material — Publishing your site](https://squidfunk.github.io/mkdocs-material/publishing-your-site/); [MkDocs — Deploying your docs](https://www.mkdocs.org/user-guide/deploying-your-docs/)
**Relevance:** Resolves toolchain-depth DP-8 — adopting the deploy Action is the repo's *first* `.github/workflows/` file and first Python dependency (comprehension Q8), and is CI-approval-gated (`file-sensitivity-cicd-approval`).
**Key Insight:** The official Material `ci.yml` triggers on push to `main`, sets `permissions: contents: write`, configures the actions bot Git identity, uses `actions/setup-python@v5` (Python 3.x) with a weekly date-based `~/.cache` cache, then runs **`mkdocs gh-deploy --force`** — which builds and pushes to a `gh-pages` branch (the same `gh-deploy`-to-branch model concept-rag uses, **not** the newer `actions/deploy-pages` artifact model). **First-time setup is a one-time manual step**: in repo Settings → Pages, set the publishing source branch to `gh-pages` (and ensure Actions has read/write workflow permission). This matches concept-rag's `.github/workflows/docs.yml` (comprehension Q8), so faithful mirroring is straightforward — but it remains an approval-gated CI change.

---

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Manual YAML `nav` + `validation` safety net | [Material nav](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/), [MkDocs config](https://www.mkdocs.org/user-guide/configuration/) | Mirror concept-rag's manual nav; add a `validation:` block (orphans + dead anchors → `warn`) so the manual-sync risk is mechanically guarded | HIGH |
| `mkdocs build --strict` in CI | [MkDocs config](https://www.mkdocs.org/user-guide/configuration/) | Promote validation `warn`s to fatal in the deploy Action so orphaned/broken nav cannot ship | HIGH |
| Symlink external dir into `docs/` | concept-rag `docs/prompts -> ../prompts` ([MagicSpace](https://mkdocs-magicspace.alnoda.org/tutorials/extra-features/include/)) | Surface `.engineering/artifacts/adr/` and/or rule content in nav while leaving source files canonical at their harness/engineering paths | HIGH |
| `mkdocs-redirects` on rename | [mkdocs-redirects](https://github.com/mkdocs/mkdocs-redirects) | If any movable doc is renamed for consistency, preserve old *site* URLs | MEDIUM (only if renames happen; doesn't cover GitHub `.md` links) |
| `gh-deploy --force` Action | [Material publishing](https://squidfunk.github.io/mkdocs-material/publishing-your-site/) | Faithful copy of concept-rag's deploy half; the CI-approval-gated layer of DP-8 | HIGH |
| Layered adoption (structure → local build → deploy) | derived from comprehension Q8 + [MkDocs deploying](https://www.mkdocs.org/user-guide/deploying-your-docs/) | Land `mkdocs.yml`+pages first (builds locally, zero CI), then `requirements.txt`/npm scripts, then the Action — each independently approvable | HIGH |

---

## Best Practices Found

### Guard manual nav with `validation` rather than a sync plugin
**Source:** [MkDocs Configuration](https://www.mkdocs.org/user-guide/configuration/)
**Description:** Set `validation.nav.omitted_files: warn`, `validation.nav.not_found: warn`, `validation.links.not_found: warn`, and `validation.links.anchors: warn`; run the deploy build with `--strict`.
**Application:** Keeps the deliberate, exemplar-matching manual nav while converting the comprehension's "manual sync is only half-guarded" risk into a build-time failure. Pages intentionally outside nav (e.g. a symlinked README used only as a section index source) go under `not_in_nav`.

### Preserve fixed-path files; redirect only what you rename
**Source:** [mkdocs-redirects README](https://github.com/mkdocs/mkdocs-redirects/blob/master/README.md) + comprehension Q11 constraints
**Description:** Treat `README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/rules/*` as immovable. Prefer keeping every existing `docs/*` filename (zero link rot). Only if a rename is chosen, add `redirect_maps` entries.
**Application:** The lowest-risk path (comprehension Q11 option (a)) is "keep filenames, add only the site frame" — `index.md`, `mkdocs.yml`, and section grouping expressed purely through nav *paths* (no file moves). Redirects are a fallback for the consistency-rename option, with the explicit caveat that they don't fix GitHub-rendered `.md` links.

### Keep ADRs in `.engineering/`, surface via a link or symlink (don't relocate under the docs voice)
**Source:** comprehension DR-4 / Q5 + [symlink inclusion](https://mkdocs-magicspace.alnoda.org/tutorials/extra-features/include/)
**Description:** The workflow-server already has an ADR series in the voice-exempt `.engineering/artifacts/adr/`. Mirroring concept-rag's *in-`docs/`* ADRs would pull them under the describe-as-it-is voice rule (the conflict). Instead, add an Architecture-hub *link* to the ADR directory, or symlink it into `docs/` for nav presence while it stays canonical in `.engineering/`.
**Application:** Resolves DP-6 toward the low-risk option: ADR *presence* in nav without a voice exemption and without relocating the series.

### Adopt the toolchain in independently-approvable layers
**Source:** [MkDocs deploying](https://www.mkdocs.org/user-guide/deploying-your-docs/) + comprehension Q8
**Description:** (a) `mkdocs.yml` + pages (builds locally, no CI, no new repo-wide deps beyond a dev tool); (b) `requirements.txt` + `package.json` `docs:serve`/`docs:build`; (c) `.github/workflows/docs.yml` deploy Action (the first GitHub Action — CI approval required).
**Application:** Lets planning/stakeholder approve the publishing half (c) separately from the structural mirror (a)/(b), satisfying `file-sensitivity-cicd-approval`.

---

## Risks and Anti-Patterns

| Risk / Anti-Pattern | Source | Mitigation |
|---------------------|--------|------------|
| Manual nav drifts from files (orphans ship silently) | comprehension Q10 + [MkDocs config](https://www.mkdocs.org/user-guide/configuration/) | `validation.nav.omitted_files: warn` + `--strict` in CI |
| Heading rename breaks anchor links silently | comprehension Q11 | `validation.links.anchors: warn` + `--strict`; preserve the two known anchors (`#5-persistence`, `#deploying-to-projects`) |
| Renaming for filename consistency causes repo-wide link rot | comprehension Q11/rejected-paths lens | Prefer keep-filenames; if renaming, add `mkdocs-redirects` **and** fix GitHub `.md` links (redirects don't cover those) |
| Mirroring concept-rag's *in-docs* ADRs violates the describe-as-it-is voice rule | comprehension DR-4/Q5 | Keep ADRs in `.engineering/` (already voice-exempt); surface via link/symlink, not relocation |
| Authoring FAQ/Troubleshooting from thin seeds invents behavior (fidelity violation) | comprehension Q9 | Defer or author only from real seeds (SETUP gotchas, ide-setup "Verifying" notes, fidelity failure modes); don't fabricate parity |
| Deploy Action is the repo's first CI + first Python dep | comprehension Q8 | Layer adoption; gate layer (c) on explicit CI approval; pin `mkdocs-material>=9` in `requirements.txt` |
| Landing page duplicates README (low-value, double maintenance) | comprehension Q2 (cr ADR-0052) | Author a unique grid-card `index.md`; do not paste README |
| `mike` versioning added without a multi-version need | [Material versioning](https://squidfunk.github.io/mkdocs-material/setup/setting-up-versioning/) | Omit `mike`; matches the exemplar and avoids ceremony |
| Duplicating rule content into docs creates a second drifting source | comprehension DR-3 (AGENTS/CLAUDE lockstep) | Reference/symlink/snippet-include the canonical file; don't copy its body into a docs page |

---

## Recommended Approach

Based on research findings (feeds plan-prepare):

1. **Primary pattern:** Mirror concept-rag's MkDocs Material structure (manual `nav`, grid-card `index.md`, section-index pages, architecture hub) — **but** harden it against the workflow-server-specific fidelity/sync risks the exemplar leaves to author discipline.
   - Rationale: the structure is a working exemplar (transfers cleanly); the danger is the sync/fidelity obligations it imposes (comprehension cross-lens finding).

2. **Key practices to apply:**
   - Manual YAML `nav` (matches exemplar) + a `validation:` block (`omitted_files`/`not_found`/`anchors` → `warn`) and `--strict` in CI — the mechanical guard the exemplar lacks.
   - Keep every fixed-path and `docs/*` filename; add only the site frame. Use `mkdocs-redirects` *only* if a rename is chosen, knowing it doesn't cover GitHub `.md` links.
   - Surface the existing `.engineering/artifacts/adr/` series via an Architecture-hub link or a symlink into `docs/` — keep it canonical in `.engineering/` (no voice exemption needed).
   - Surface agent guidance via a docs Overview page that links/symlinks/snippet-includes the canonical `AGENTS.md`/`.claude/rules/` — never relocate or copy-paste them.
   - Adopt the toolchain in three approvable layers; gate the deploy Action on CI approval.
   - Omit `mike`.

3. **Risks to monitor:**
   - Nav-to-file / anchor drift → mitigated by `validation` + `--strict`.
   - ADR/voice-rule conflict → avoided by leaving ADRs in `.engineering/`.
   - FAQ/Troubleshooting invention → defer or seed from real content only.
   - First-CI / first-Python-dep introduction → layered, approval-gated.

---

## Synthesis — mapping to work-package requirements

| Planning decision (from comprehension) | Research finding that de-risks it | Resulting recommendation |
|----------------------------------------|-----------------------------------|--------------------------|
| **Nav-sync policy** (Q10) | MkDocs 1.6 `validation:` + `--strict` mechanically catch orphans, broken links, dead anchors | Manual nav (exemplar parity) **+** `validation` block **+** `--strict` in CI |
| **Link-preservation** (Q11) | `mkdocs-redirects` covers *site* URLs only; fixed-path files can't move | Keep filenames + site-frame-only (zero rot); redirects as rename fallback |
| **DP-6 ADR surfacing** | Symlink/link inclusion lets `.engineering/` ADRs appear in nav without relocation | Link/symlink the existing ADR series from the Architecture hub; no voice exemption |
| **DP-8 toolchain depth** | Official Material `ci.yml` = `gh-deploy --force` to `gh-pages` (matches cr); decomposes into 3 layers | Layered adoption; deploy Action approval-gated; omit `mike` |
| Agent-guidance surfacing (Q6/DR-3) | snippets / include-markdown / symlink surface external files without moving them | Docs Overview page references canonical files; no copy/relocate |
| FAQ/Troubleshooting (Q9) | (no tooling fix — a fidelity matter) | Defer or seed from real content only |

**No further research required** — all four planning decisions now have concrete, cited tooling answers; what remains for each is a scope/depth *judgement* for plan-prepare, not a knowledge gap.

---

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| [MkDocs — Configuration](https://www.mkdocs.org/user-guide/configuration/) | `validation:` block, `strict`, `not_in_nav` | validation.nav / validation.links / strict |
| [MkDocs — Deploying your docs](https://www.mkdocs.org/user-guide/deploying-your-docs/) | `gh-deploy` mechanics, gh-pages branch | gh-deploy, GitHub Pages |
| [Material — Publishing your site](https://squidfunk.github.io/mkdocs-material/publishing-your-site/) | Official `ci.yml` deploy workflow, first-time Pages setup | GitHub Pages with Actions |
| [Material — Setting up navigation](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/) | Manual nav, navigation.indexes, prune/depth | Navigation |
| [Material — Setting up versioning](https://squidfunk.github.io/mkdocs-material/setup/setting-up-versioning/) | `mike` relevance assessment | Versioning |
| [mkdocs/mkdocs-redirects](https://github.com/mkdocs/mkdocs-redirects/blob/master/README.md) | `redirect_maps`, site-URL scope | redirect_maps |
| [mkdocs-literate-nav](https://github.com/oprypin/mkdocs-literate-nav) | Nav-plugin alternative | Overview |
| [mkdocs-awesome-nav](https://github.com/lukasgeiter/mkdocs-awesome-nav) | Nav-plugin alternative (awesome-pages successor) | Overview |
| [mkdocs-include-markdown-plugin](https://github.com/mondeja/mkdocs-include-markdown-plugin) | Section-level external-file inclusion | User guide |
| [MagicSpace — include external docs](https://mkdocs-magicspace.alnoda.org/tutorials/extra-features/include/) | Symlink inclusion pattern | Symlinks |
| [jimporter/mike](https://github.com/jimporter/mike) | Versioning tool internals | README |

---

**Status:** Ready for plan-prepare activity
