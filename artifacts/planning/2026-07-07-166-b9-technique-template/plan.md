# #166 B9 — Normative technique template + lint

**Date:** 2026-07-07 · **Branches:** `workflow/166-b9-technique-template` (content, PR #179) + `feat/166-b9-technique-template` (server, PR #180) · **Scope:** content sweep + new guard · **Risk:** none (mechanical, loader-inert except one defect fix)

## Objective

From the epic (#166): codify the modal technique-file shape the 2026-07-03 structural census found (section order, `###` id casing, front-matter minimalism, `{$var}` sigil rules, Outputs-before-Protocol) as a lint (`check:technique-template`), fix the corpus deviations, document the sigil. Evidence base: [technique-structural-census.md](../2026-07-03-schema-technique-disclosure-review/technique-structural-census.md) §6 (template already 95/179 exact within its scope), [evaluation-report.md](../2026-07-03-schema-technique-disclosure-review/evaluation-report.md) B9 row.

## Scope findings that reshaped the plan

- **The sigil-documentation half was already done.** Spec §3.3 (declare-once `{$name}` model, branch-binding caveat, unbound-local/dead-binding defect classes) and content-side AP-54/55/58/59 landed in the B3/B6-era passes. Verified coverage; no new prose needed. B9 reduced to lint + sweep.
- **The census counts were 3-workflow-scoped.** The issue's "16 ordering + 40 front-matter" covered meta/work-package/ponytail (206 files); the full 14-workflow corpus (460 technique-dir files) carried **80 ordering + 242 front-matter** deviations, 25 H1 titles, and 1 genuine casing defect. All fixed — the guard ships hard-zero, no baseline/ratchet.
- **One real parser hazard surfaced by the id-casing rule:** `substrate-node-security-audit/techniques/write-report.md` held an unfenced finding-format template inside `#### finding_block_format`; its `### Issue {number}: {title}` line parsed as a bogus Outputs entry and detached the two following `####` components (`finding_block_note`, `affected_files_hyperlink`) from `audit_report`. Fenced as a `markdown` code block (inner per-token backticks dropped — inside a fence they would render literally in the copyable skeleton). This is the sweep's only delivered-payload change.

## Design

### Guard — `scripts/check-technique-template.ts` (+ `tests/technique-template.test.ts`, npm `check:technique-template`)

Walks `<workflow>/techniques/**/*.md` under the `resolveWorkflowsRoot` corpus root (`--root` / `WORKFLOWS_DIR` aware, like the other corpus guards). Per file, hard-zero:

- **Frontmatter** carries `metadata.version` and nothing else (`frontmatter-missing` / `frontmatter-extra-key` / `version-missing`). The loader reads no other key; identity comes from the path.
- **No H1** (`h1-title`) — the loader discards everything before the first H2, and several group-contract H1s had drifted from their slug (`design-philosophy` titled "Classify Problem").
- **H2 sections** are the canonical five, each at most once, in canonical order Capability → Inputs → Outputs → Protocol → Rules (`unknown-section` / `duplicate-section` / `section-order`). Outputs-before-Protocol: the interface reads as a whole before the procedure.
- **`###` entry ids** under Inputs/Outputs are snake_case, with lowerCamelCase allowed as the external-tool parameter mirror class (spec §3.2 — 24 Atlassian ids like `cloudId`/`issueIdOrKey`; statically indistinguishable from ordinary ids, so the casing class is admitted rather than an exemption list maintained). Rule names under Rules are kebab-case, optionally dot-grouped (`commit.signed`) (`entry-id-casing` / `rule-name-casing`).
- **`{$name}` sigil bindings** are snake_case (`sigil-casing`). Deeper sigil semantics (unbound-local / dead-binding) stay `check:binding`'s business — no overlap.
- **Exemptions:** `techniques/README.md` navigation docs (8 workflows carry one; they are docs, not techniques) and fenced code blocks (illustrative content).

Spec §9 and `docs/development.md` register the guard; the Vitest test makes `npm test` fail on any template deviation (10 cases: conformant template + one per rule + corpus hard-zero).

### Content sweep (mechanical script, 250 files)

- Frontmatter rewritten to the canonical three lines preserving `version` (242 files — legacy `ontology`/`kind`/`order`/`legacy_id` under `metadata:`, read by nothing).
- Canonical H2 stable-sort where out of order (80 files; fence-aware; refuses files with non-canonical H2s — none exist outside READMEs). Section moves are loader-inert: parsing is section-name keyed, and delivery order is field-structural.
- H1 line (+ trailing blank) removed from 25 group/root `TECHNIQUE.md` contracts.
- Anchor safety: H2 heading text is unchanged by reordering, so `.md#anchor` links are unaffected (`check:anchors` confirms).

## Execution log

1. Census re-measured against the live corpus (scan script) — deviation inventory above; loader verified to consume only `metadata.version` and level-2+ sections (H1 and extra keys inert; GitNexus: no indexed symbols touched, additive files only).
2. Guard + tests written on `feat/166-b9-technique-template`; first run against the pristine corpus reproduced the inventory exactly (847 extra-key hits / 80 order / 25 H1 / 1 casing).
3. Sweep applied on `workflow/166-b9-technique-template`; write-report template fenced by hand; guard hard-zero.
4. Gates: suite 477/0 (`npx vitest run`) against the swept corpus with e2e snapshots unchanged; typecheck clean; `check:binding` 267 baselined / 0 new / 0 fixed; anchors, identifiers, site all green.
5. Merged: content PR #179 first (workflows tip `cf185d25`), then server PR #180 (merge `65f5b456`, includes submodule pin bump `663fb6d6`→`cf185d25`; no CI checks applied to the branch, `--admin` as usual). B9 ticked on #166 (table row + tracking entry) via `gh api` PATCH.

## Environment gotchas (worktree test runs)

- The e2e harness hard-codes `../../workflows` (`tests/e2e/harness.ts`) and ignores `WORKFLOW_DIR`/`WORKFLOWS_DIR` — a server worktree needs the content tree present at `./workflows`.
- A **symlink is not enough**: `reference-delivery.test.ts` `cpSync`s `../workflows` and refuses to copy a symlink over its mkdtemp target (`ERR_FS_CP_NON_DIR_TO_DIR`). Use a real copy (strip its `.git`).
- A prior failed run can leave an empty `./workflows` directory behind, which silently swallows a subsequently created symlink (`workflows/<name>` instead of `workflows`).

## Deferred / follow-ups

- The `### N. Title` protocol-block form vs flat numbered list (census §3: 58 vs 120 files) is left free — both are canonical (spec §3.3); no order/casing rule applies to protocol block titles.
- Version variance (census class 11) is not a defect class; not linted.
- The census's two placeholder-drift stragglers (`create-session.md` `{client_planning_slug}`, `review-existing-feedback.md` bare `{owner}`/`{repo}`) are binding-resolution items (AP-49/58, `check:binding` domain), noted in the B3 follow-ups — not template-shape concerns.
