# Structural Inventory — work-package

**Workflow:** Work Package Implementation Workflow
**ID:** `work-package`
**Version:** 3.35.3 (branch worktree) — catalog serves 3.35.0
**Initial activity:** `start-work-package`
**Catalog source:** committed workflow catalog (`list_workflows`) for identity; counts measured on the branch worktree (see Baseline)
**Mode:** update

## Baseline

The MCP catalog is served from `/home/mike1/projects/dev/workflow-server/workflows/` (`work-package` 3.35.0), which is one checkout behind the branch under change. The authoritative target for this session is the branch worktree:

- Worktree: `/home/mike1/projects/work/workflows/2026-07-09-workflow-design-doc-voice`
- Branch: `workflow/work-package-review-mode-friction-271` (tip `ab5388a5`, rebased onto `origin/workflows` base `d9b30234`)
- PR: [#274](https://github.com/m2ux/workflow-server/pull/274) (base `workflows`), MERGEABLE, `REVIEW_REQUIRED`, no CI configured

All counts below are measured on the worktree tip, so they include this branch's delivered changes.

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 15 |
| Technique leaf files (`.md`, excl. containers/README) | 92 |
| Technique container `TECHNIQUE.md` files | 17 |
| Resource files (excl. README) | 31 |
| Total files under workflow tree | 161 |

Remaining 5 files: `activities/README.md`, `techniques/README.md`, `resources/README.md`, `README.md`, `REVIEW-MODE.md`.

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 15 |
| Techniques (leaf) | 92 |
| Resources | 31 |
| Checkpoints (incl. nested in loops) | 44 |
| Transitions | 27 |
| Decisions | 2 |
| Workflow variables | 121 |
| Workflow rules (activity partition) | 0 |

`rules` carries a `workflow` partition only (9 entries, one a `ref:` into `fragments`); there is no `activity` partition. `techniques.activity` inherits one operation (`variable-binding`).

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 166 |
| checkpoint | 44 |
| action | 28 |
| loop | 15 |

## Activities

| # | Activity ID |
|---|-------------|
| 01 | `start-work-package` |
| 02 | `design-philosophy` |
| 03 | `requirements-elicitation` |
| 04 | `research` |
| 05 | `implementation-analysis` |
| 06 | `plan-prepare` |
| 07 | `assumptions-review` |
| 08 | `implement` |
| 09 | `lean-coding-audit` |
| 10 | `post-impl-review` |
| 11 | `validate` |
| 12 | `strategic-review` |
| 13 | `submit-for-review` |
| 14 | `complete` |
| 15 | `codebase-comprehension` |

## Update scope

This session finishes in-flight work already committed on the branch; it does not restart it.

- **In scope — 8 binding-fidelity drifts**, all introduced by this branch's #270 Pass B (verified against an `origin/workflows` baseline, so they are the branch's own drift, not inherited): orphan own-input `reference_path` on `techniques/publish-review-artifacts.md` and on `techniques/review-summary.md`; unresolvable `{ARTIFACT_PUBLISH_REF}` in `techniques/review-summary.md` (lines 55 x2, 62, 63); unresolvable `{ENG_REPO_NAME}` / `{ENG_REPO_OWNER}` in `techniques/review-summary.md:38`. All four sites confirmed still present at worktree tip.
- **In scope — the A-9 and A-10 Gate 2 judgements**, which PR #274's body records as pending final Gate 2 in the session.
- **Frozen — already delivered on the branch, must not be redone**: the rebase onto latest `workflows`; `workflow-design/activities/06-scope-and-draft.yaml` repairs (YAML parse error from a mis-indented `decisions:` inside `steps:`, duplicate `draft-attestation` / `batch-review-attested` step ids, and the two undeclared variables `principle_finding_count` / `anti_pattern_finding_count`, now derived in the classify and reassess actions); the one-level-too-high `review-mode.md#header-fields` link in `techniques/review-summary.md`; and untracking `.idea/`.
- **Frozen — sibling workflows changed on this branch, out of this session's change surface**: `meta` (`techniques/version-control/TECHNIQUE.md`, `workflow-engine` dispatch-activity / commit-and-persist / match-target-workflow / present-checkpoint-to-user / respond-checkpoint / verify-outcomes), `ponytail` (`techniques/*`, `resources/README.md`), `workflow-design` (`activities/06-scope-and-draft.yaml`, `resources/README.md`, `resources/design-principles.md`).
- **Not this session's drift — do not adopt as work**: three broken resource anchors identical on the `origin/workflows` baseline (`dispatch-activity.md#accumulate-trace-tokens`, `assumptions-review.md#open-assumptions`, `test-suite-review.md#test-suite-review-report-template`), and a `duplicate-checkpoint` fragments violation in `activities/04-research.yaml` also present on baseline.

The governing tension for the in-scope drifts: UPPERCASE `{...}` placeholders are an established convention in *resource* files (`resources/review-mode.md` uses `{ENG_REPO_OWNER}` / `{ENG_REPO_NAME}` in a URL template), but Pass B moved them into a *technique* file, where the binding checker resolves `{...}` as session variables. The repo's own "reference, don't restate" rule bears directly on how that is best resolved.
