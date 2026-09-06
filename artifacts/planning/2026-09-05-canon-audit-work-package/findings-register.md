# Findings Register — `work-package`

**Date:** 2026-09-05 · **Mode:** Review
**Base ref:** `75777ca2453d788acf52d8ab69778c9491686436` (corpus HEAD) · **Targets:** `workflows/work-package` (170 definition files)
**Change surface:** 0 files (touched: 0 whole files · I/O-contract closure: 0 · consumers: 0)

Standalone audit of the target at HEAD with no change under audit, so every Origin below is `pre-existing` relative to this base ref. Two findings nonetheless arrived with the merge that produced HEAD; that attribution is in [previous-pass-comparison.md](./previous-pass-comparison.md) and is not restated here.

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 2 | 0 |
| High     | 3 | 0 |
| Medium   | 7 | 0 |
| Low      | 1 | 0 |

**Coverage:** divergences 3 · per-unit walked/not-applicable tally not kept — see Coverage

**Guards:** `npm run check:all` 36 of 36 pass. `npm run test:coverage-walk` FAILS — 2 of 2 tests, exit 1, findings C1 and C2 below.

## Findings

| ID | Severity | Entry | Location | Evidence | Origin | Fix |
|----|----------|-------|----------|----------|--------|-----|
| C1 | Critical | guard failure — `option-coverage` | `workflow.yaml:59-64` (fragment `assumption-decision`), bind at `activities/04-research.yaml:224-226` | `tests/e2e/option-coverage.test.ts` "takes every declared option some walk can reach" fails: `checkpoint:research:research-assumption-decision#{current_assumption.id}=correct-assumption` — no walk reaches it and `tests/e2e/option-coverage.json` states no reason. The option was added to the shared fragment by `efcc3a97`, whose body records it: "It takes the fragment, which gains the correction option the copy had" | pre-existing | Give some walk a path to the option, or place it in the `option-coverage.json` group whose stated reason covers it — matching the reason is the work |
| C2 | Critical | guard failure — `option-coverage` stamp | `tests/e2e/__snapshots__/corpus-sha.json` | "was recorded against the corpus commit now checked out" fails: stamp holds `corpusSha 69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6`, checkout is `75777ca2453d788acf52d8ab69778c9491686436`. Corpus-wide, not work-package-scoped. Same sha the `binding-fidelity` ledger carries, so neither baseline was adopted for the current corpus | pre-existing | Confirm the corpus change is intended, re-record the expectation, and run `npm run baseline:stamp` in the same commit |
| 1 | High | `unproduced-value-read` | `activities/11-validate.yaml:39-41,67-72,82-92` | `validation_results` (`type: object`, no `defaultValue`) has one first producer — `run-suite`, gated `project_type == 'rust-substrate' && run_local_validation == true`. Two readers reach it off that path: `document-failures` binds `"{validation_results.failed_checks}"` gated only `is_review_mode == true`; `fix-revalidate-cycle.continueWhile` compares `validation_results.validation_passed == false` (equality) gated only on `is_review_mode != true` + `run_local_validation == true`. `project_type` takes `other` per `techniques/project-type-detection.md:32` | pre-existing | Use `exists`/`notExists` for definedness, or add the complementary producer arm so the gates are exhaustive |
| 2 | High | `operative-criteria-need-a-home` | `techniques/manage-artifacts/TECHNIQUE.md:17-34`; bind at `activities/12-strategic-review.yaml:114` | The 12-row canonical-home map (fact category → artifact) lives only in a technique `## Rules` entry; no resource holds it. At the bind site `canonical_home_map: work-package/techniques/manage-artifacts#canonical-home-map` does not resolve — `parseResourceRef` yields id `techniques/manage-artifacts`, `findResourceSkillMd` looks for `resources/techniques/manage-artifacts.md` (`resources/` has no subdirectories) then scans flat `resources/*.md` for a name/slug match (none). Sibling `guide_map: work-package/README#planning-artifact-to-guide-map` resolves | pre-existing | Migrate the map into a resource with its own id; repoint the bind and the five citers |
| 3 | High | `bind-site-is-orchestration-truth` | `REVIEW-MODE.md:45,52,143,144,149` | Per-activity checkpoint inventory not generated from the YAML. Three named constructs exist nowhere else in the tree: `analysis-confirmed` (05-implementation-analysis declares no such checkpoint), `switch-model-*` (08-implement declares none), `rationale-confirmed` (no option of that id). Line 45 states `file-index-table` is hard — correct, it declares no `defaultOption`/`autoAdvanceMs` — while line 149 says it auto-advances | pre-existing | Delete the inventory or generate it from the binds; point readers at the activity YAML |
| 4 | Medium | `cited-home-owns-claim` | `techniques/README.md:11` | "For the full technique-to-activity table with capability summaries, see the [workflow README](../README.md#overview)." `README.md` `## Overview` holds `\| # \| Activity \| Required \| Description \|` — no technique-to-activity table, no capability summaries | pre-existing | Stop attributing the table to the README, or author it there |
| 5 | Medium | `bind-site-is-orchestration-truth` | `techniques/README.md:17-24` | "Technique groups by area" names eight local groups absent from `techniques/`: `start-work-package/`, `implement/`, `post-impl-review/`, `lean-coding-audit/`, `validate/`, `submit-for-review/`, `complete/`, plus meta `cargo-operations/` listed as local; omits `analyse-challenge/`, `conduct-retrospective/`, `dco-provenance/`, `raise-deferred-items/`, `update-pr/`, `validate-build/` | pre-existing | Delete the table; folder contents are the membership |
| 6 | Medium | `stale-restatement-after-change` | `README.md:99` | "A detection step in `start-work-package` recognizes review intent …, confirms with the user, and sets `is_review_mode = true`" — the `review-mode-detection` checkpoint is gated `review_mode_ambiguous == true` (`activities/01-start-work-package.yaml:223-229`), and sibling tier `REVIEW-MODE.md:73` states clear intent skips the confirm | pre-existing | Update the surviving occurrence to the gated behaviour |
| 7 | Medium | `bind-site-is-orchestration-truth` | `README.md:108` | Review-mode flow omits `codebase-comprehension`, which `graph.design-philosophy.done` enters on every run; `activities/README.md:60` states "Always transitions to codebase-comprehension" | pre-existing | Regenerate from the graph, or replace with a pointer to it |
| 8 | Medium | `avoidance-voice-in-definitions` | `resources/readme-deprecated-notice.md` | Whole file is supersession narration: frontmatter "has been merged into"; H1 "— Consolidated"; `:10` "Consolidated into [readme] as of v2.0.0"; `:12` "(previously `START-HERE.md`)"; `:14` "there is no longer a separate navigation document". Its only reference anywhere is its own index row at `resources/README.md:11` | pre-existing | Delete the resource and its index row |
| 9 | Medium | `technique-stage-agnostic` | `techniques/create-issue.md:58,73` | Protocol names activity checkpoints and their timing relative to itself: "`{issue_platform}` carries the choice made at the `platform-selection` gate, which the activity presents before this technique runs"; "the `jira_project` chosen at the `jira-project-selection` gate" | pre-existing | Rewrite as bind contract on the input; drop the gate and its position |
| 10 | Medium | `link-named-artifacts` | `activities/10-post-impl-review.yaml:93` | Checkpoint `file-index-table` message interpolates `{change_block_index}` — declared "Absolute path to the index …" — as a bare path. Four siblings use the linked form: `15-codebase-comprehension.yaml:60`, `06-plan-prepare.yaml:148`, `14-complete.yaml:148`, `04-research.yaml:105` | pre-existing | Interpolate `[label]({change_block_index})` |
| 11 | Low | `value-set-in-prose` | `activities/01-start-work-package.yaml:142-144` | `project_type` declares `type: string` with no `values`, description "Detected project type (e.g. rust-substrate)". The closed set is enumerated in prose at `techniques/project-type-detection.md:24,32`, `techniques/codebase-comprehension/TECHNIQUE.md:14`, `techniques/codebase-comprehension/survey.md:14,60`, `techniques/review-code.md:22`, and gated on at `activities/11-validate.yaml:54,65`. Seven sibling variables in this workflow carry `values` | pre-existing | Declare `values: [rust-substrate, other]`; cut the roster from the prose |

Withdrawn on adversarial re-derivation, recorded so a later pass does not re-raise them:

| Candidate | Why it fell |
|---|---|
| `assumptions-review` `needs-comprehension` exit is a dead edge | `codebase-comprehension` is `required: false`, so a run that stands it down leaves `needs_comprehension` at its `true` default and the exit is reachable |
| `guide_map` is a broken reference | `work-package/README#planning-artifact-to-guide-map` resolves through `findResourceSkillMd` step 1 to `resources/README.md`, whose `## Planning artifact to guide map` is the section `scripts/check-artifact-guides.ts` also reads |

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — governs authoring `anti-patterns.md`; the audited surface does not edit the catalog |
| Anti-Patterns | Entries whose Detect requires whole-file reading of technique/resource bodies | `blocked` — 19 YAML/README files read whole; the 151 technique and resource files covered by Detect-derived sweeps and targeted reads, not whole-file walks |
| Guards | `binding-fidelity` triage currency | `blocked` — ledger stamps `corpusSha 69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6`; 41 work-package files have changed since, `techniques/review-summary.md` (2 entries, line 96) among them, so those verdicts are unre-affirmed |

The `option-coverage` walk ran to completion in 1,466s and is no longer a divergence — it is findings C1 and C2. Its wrapper reported exit 0 because the compound's last command was an `echo`; the walk's own exit was 1, captured separately as `WALK_EXIT=1`. Read the check's exit before anything filters it.

No per-unit walked / not-applicable tally was kept across the criteria homes, so this register cannot certify a complete walk. The YAML and README layer is fully covered; the technique and resource bodies are not.

## Sources

| Label | Path |
|---|---|
| Guard suite run | `npm run check:all` at base ref — 36 pass, 0 fail, 0 unmeasured |
| Option-coverage walk | `npm run test:coverage-walk` at base ref — exit 1, 2 of 2 tests failed (findings C1, C2) |
| Corpus stamp | `tests/e2e/__snapshots__/corpus-sha.json` |
| Resource resolver | `src/utils/resource-ref.ts`, `src/loaders/resource-loader.ts` — settles findings 2 and the withdrawn `guide_map` candidate |
| Guide-map consumer | `scripts/check-artifact-guides.ts:56` |
| Previous-pass attribution | [previous-pass-comparison.md](./previous-pass-comparison.md) |
