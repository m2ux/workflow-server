# Validation — Canonical Naming Convention (#128)

**Activity:** validate (v3.1.0) · **Session:** VPOXEX · **Date:** 2026-06-08
**Target worktree:** `/home/mike1/projects/work/workflow-server/2026-06-07-issue-128`
**Branch:** `chore/128-canonical-naming-convention` · **PR:** [#129](https://github.com/m2ux/workflow-server/pull/129)

---

## Verdict

**validation_passed = true · has_failures = false**

---

## Project type and applicable model

`project_type` is **not** `rust-substrate` — this is the TypeScript/Node MCP-server repo (vitest, tsc).
The `preflight` and `run-suite` cargo steps in the validate activity are gated
`when: project_type == 'rust-substrate'` and therefore **do not apply**.

The diff touches only definition/doc files — no `.ts` or schema source:

- Parent repo (feature branch `1757e019`): `docs/technique-protocol-specification.md` (spec §3.2/§3.4/§8) + the `workflows` submodule pointer bump.
- Workflows submodule (`3512c65`, vs base `12e76a9`): 13 `.md`/`.toon` files.

Validation model = **grep-parity** (renamed ids fully retired, zero orphaned evaluated references)
+ **TOON structure validator** (`scripts/validate-activities.ts`) + `tsc`/`vitest` as advisory
regression signals on the unchanged `src/`.

---

## Checks run

### 1. TOON structure validation — PASS (real signal)

Ran `scripts/validate-activities.ts` (imports `activity.schema.js` + `toon.js`; no `skill.schema`
dependency, so it runs cleanly on `main`) from the reference checkout
(`/home/mike1/projects/main/workflow-server`, `node_modules` present), pointed at the **worktree's**
changed workflow dirs:

| Workflow | Result | Changed files covered |
|----------|--------|-----------------------|
| `work-package` | 14 passed, 0 failed | `01-start-work-package.toon`, `12-submit-for-review.toon` (`squash_merge_supported` rename) |
| `prism` | 13 passed, 0 failed | `01-structural-pass.toon` (`{lens_name}` fix) |
| `cicd-pipeline-security-audit` | 7 passed, 0 failed | (rule-slug change is in a technique `.md`, not an activity) |

### 2. Grep-parity — PASS

Every renamed identifier is fully retired across the whole `workflows` tree (zero orphaned references),
and the new identifier is present at every former site:

| Old → New | Old survivors | New present |
|-----------|---------------|-------------|
| `squash_merge_available` → `squash_merge_supported` | 0 evaluated; 1 intentional (the AP-60 bad-name *example*) | declaration `workflow.toon:296`, producer `01:86`, evaluated consumer condition `12:156`, technique output, docs |
| `{lens-name}` → `{lens_name}` | 0 | `01-structural-pass.toon:14,118` |
| `no-false-positives` → `confirmed-flow-only` | 0 | `write-cicd-report.md` |
| `no-context-leakage` → `isolated-context` | 0 | `full-prism.md` |
| `no-reassignment` → `severities-inherited` | 0 | `generate-report.md` |
| `no-analysis` → `dispatch-only` | 0 | `orchestrate-prism.md` |
| `no-narration` → `synthesize-directly` | 0 | `research-knowledge-base.md` |

Referential integrity for the cross-activity `squash_merge_supported` variable confirmed end-to-end:
producer (`01-start-work-package` set action + `context_to_preserve`) → declaration (`workflow.toon`
variable + `detect-merge-strategy` output) → evaluated consumer (`12-submit-for-review` condition +
checkpoint message slot). No evaluated reference orphaned.

Note: the two `{lens_name}` occurrences in `prism/techniques/portfolio-analysis.md:71` and
`orchestrate-prism.md:80` are NOT in the diff because they were **already** snake-case in the base
commit `12e76a9` — verified via `git show`. The change only had to fix the kebab `{lens-name}` in
`01-structural-pass.toon`, which it did. No missed rename.

### 3. Count consistency — PASS

Exactly one `AP-60` entry in `anti-patterns.md`; the `workflow-design` step-8 heuristic correctly reads
"currently 60 entries" (bumped from 59) and the new AP-60 audit bullet was added to step 8.

### 4. Spec coherence — PASS

`docs/technique-protocol-specification.md` adds the "Naming structure" subsection (§3.2), the rule-name
positive-assertion paragraph (§3.4), and the §8 authoring-rules summary bullet — all cross-referencing
AP-60. Internally consistent with the AP-60 entry.

### 5. Advisory regression signals (reference checkout, unchanged `src/`)

- `npm run typecheck` (`tsc --noEmit`) — **PASS** (clean, no output).
- `npm test` (`vitest --run`) — **PASS**: 19 files, 371 passed / 2 skipped, 0 failed.

These exercise the reference checkout's `src/`, which this PR does not modify; advisory for this PR but
confirm no source regression in the surrounding tree.

---

## Environment notes (honest record)

- `scripts/validate-workflow-toon.ts` **cannot run** anywhere available: it imports
  `src/schema/skill.schema.js` + `safeValidateSkill`, which exist only on the post-migration branch
  (`feat/125-…`). Reference `main`/`52521005` lacks `skill.schema.ts` — confirmed by direct attempt
  (`ERR_MODULE_NOT_FOUND`) and by listing `src/schema/`. This matches the carried IMPL-3 note. The
  lighter `validate-activities.ts` (used above) provides the equivalent structure signal without that
  dependency.
- `scripts/smoke/` is a **live agent smoke-run harness** (orchestrator/worker briefs + MCP template),
  not a deterministic walker; it dispatches sub-agents against a running server and is not appropriate
  to fire autonomously from a validate worker. Not run.

---

## Variables

- `validation_passed = true`
- `has_failures = false`
- `test_results` = 371 passed / 2 skipped / 0 failed (advisory, reference `src/`)
- `build_status` = typecheck clean (advisory, reference `src/`)
