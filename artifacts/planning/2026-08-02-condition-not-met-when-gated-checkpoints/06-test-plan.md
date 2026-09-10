# Test Plan: when-merge dismissal, activity-rule fragments, AP-134 guard

> **ADR:** _(none yet)_ · **Ticket:** [#358](https://github.com/m2ux/workflow-server/issues/358) / [#338](https://github.com/m2ux/workflow-server/issues/338) · **PR:** [#373](https://github.com/m2ux/workflow-server/pull/373)

## Overview

This test plan validates the three PR #373 server deliverables: dismissibility parity for when-gated checkpoints, activity-file rule fragment materialization, and the AP-134 citation-grain hard-zero guard.

Key symbols to cover (link to source after implementation):

1. `respond_checkpoint` / `condition_not_met` branch — present-gate legality
2. `materializeRuleEntries` / `materializeActivityFragments` — activity `rules` refs
3. Citation-grain collector — bare + `#section` co-citation per technique file

## Test Cases

| <div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div> |
|---|---|---|---|---|
| PR373-TC-01 | Verify `condition_not_met` rejects an unconditional checkpoint | 1. Start session and yield an unconditional checkpoint  <br>2. Call `respond_checkpoint` with `condition_not_met: true`  <br>3. Read error text | Error states the checkpoint has no dismissible gate / no condition or when field; active checkpoint handling stays consistent with today | Unit |
| PR373-TC-02 | Verify `condition_not_met` accepts a structured-`condition` checkpoint | 1. Yield a checkpoint that has `condition` only  <br>2. Dismiss with `condition_not_met`  <br>3. Inspect response | `dismissed: true`; no option effects applied; sentinel option id recorded | Unit |
| PR373-TC-03 | Verify `condition_not_met` accepts a when-only checkpoint | 1. Yield a checkpoint with non-empty `when` and no `condition`  <br>2. Dismiss with `condition_not_met`  <br>3. Inspect response | `dismissed: true`; same session clear semantics as TC-02 | Unit |
| PR373-TC-04 | Verify empty/`when: ""` does not count as a gate if that shape can appear | 1. If schema allows empty when, attempt dismiss  <br>2. Else document N/A | Reject or schema-prevent; only non-empty `when` is dismissible | Unit |
| PR373-TC-05 | Verify activity-file `{ ref }` materializes to plain rule strings on load | 1. Build lookup with a named rule fragment  <br>2. Activity.rules includes `{ ref: name }`  <br>3. Run materializeActivityFragments (or loadWorkflow fixture) | `rules` is `string[]` with fragment text spliced in order | Unit |
| PR373-TC-06 | Verify unresolved activity-file rule ref fails loudly | 1. Activity.rules `{ ref: missing }`  <br>2. Materialize / load | FragmentResolutionError (or load exclusion) with clear message | Unit |
| PR373-TC-07 | Verify fragments guard resolves activity-file rule refs and tracks usage | 1. Fixture workflow with fragments.rules + activity rules ref  <br>2. Run collect violations | No unresolved-ref; fragment not flagged unused | Integration |
| PR373-TC-08 | Verify validate-activities accepts RuleEntry on activity rules | 1. Activity YAML with string + `{ ref }` rules  <br>2. Run schema validate path | Valid | Integration |
| PR373-TC-09 | Verify citation-grain collector is empty on live corpus | 1. Run collectCitationGrainViolations against worktree workflows | Zero findings | Unit |
| PR373-TC-10 | Verify citation-grain flags bare + section co-citation | 1. Synthetic technique text citing `foo` and `foo#bar`  <br>2. Run collector on fixture | Exactly one finding for that file/base id | Unit |
| PR373-TC-11 | Verify citation-grain does not flag section-only or bare-only | 1. Fixture with only `foo#bar`  <br>2. Fixture with only `foo` | No findings | Unit |
| PR373-TC-12 | Verify GUARDS registration surfaces the new guard | 1. Import GUARDS  <br>2. Assert citation-grain id present  <br>3. Optional: `npm run check:all` includes it | Guard listed and invoked | Integration |

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| Dismissal parity | when-gated and condition-gated checkpoints dismiss; unconditional does not | PR373-TC-01, PR373-TC-02, PR373-TC-03, PR373-TC-04 |
| Activity-rule fragment refs | Schema admits refs; materialize + guard treat activity rules like workflow partitions | PR373-TC-05, PR373-TC-06, PR373-TC-07, PR373-TC-08 |
| AP-134 citation-grain hard-zero | Guard registered; corpus green; co-cite detected | PR373-TC-09, PR373-TC-10, PR373-TC-11, PR373-TC-12 |
| Branch readiness | Implementation beyond opening chore on PR #373 | Manual / PR diff review |

## Running Tests

```bash
# From worktree root
npm run typecheck
npx vitest run tests/mcp-server.test.ts -t condition_not_met
npx vitest run tests/fragment-resolver.test.ts
npx vitest run tests/  # or specific citation-grain test file once added
npm run check:fragments
npm run check:citation-grain   # name as registered
npm run check:all
npm run test:ci
```

*Exact file paths and hyperlinked Test IDs are filled in finalize-documentation after implementation.*
