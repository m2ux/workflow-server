# Findings Register — `work-package`

**Date:** 2026-09-07 · **Mode:** Review, then Update
**Base ref:** `3695f3ab970cefa552cfc38329add4ecbae55e17` (corpus HEAD; no change under audit) · **Target:** `workflows/work-package`, 169 definition files
**Change surface:** 0 files at audit time (touched: 0 · I/O-contract closure: 0 · consumers: 0)

A standalone audit of the target at HEAD, so every origin is `pre-existing` relative to this base ref. Remediation followed in the same session on `workflow/work-package-canon-audit-sweep`.

**This is the first pass to read the target whole.** The three passes before it read 23, 24 and 23 files of roughly 170 and each recorded a residual near 146; none inherited the previous residual, so the same core was audited three times and the rest never. That accounts for most of what follows: 28 of the 41 findings sit wholly in files no prior pass opened, and 4 more partly.

## Summary

| Severity | Open | Applied | Held |
|----------|-----:|--------:|-----:|
| Critical | 0 | 0 | 0 |
| High     | 10 | 8 | 2 (partial) |
| Medium   | 26 | 23 | 3 |
| Low      | 5 | 5 | 0 |

**Coverage:** 0 criteria units `blocked`. Every unit of the four prose homes was walked; the divergences are recorded below with their reasons.

**File coverage:** read 169 · unread 0.

**Guards:** `npm run check:all` — 36 pass, 0 fail, 0 unmeasured at the base ref, against a triage ledger stamped at the same corpus commit. `npx tsx scripts/check-all.ts --corpus-only` — 32 of 32 pass at every commit of the fix branch. `npm run test:coverage-walk` — passes at the base ref (2 of 2 tests, 1500s); **not run against the fix branch**, see [Owed](#owed).

## Why the count is high after three passes

Four causes, in order of size.

1. **The target was never read.** Each earlier register states its own residual, and the most recent says outright that the remediation scope it certifies is the 23 files it read. Nobody picked the remainder up.
2. **Fixes landed at the cited site rather than across the tree.** Five findings are residue: session interaction fixed in one elicitation operation and left in four others; a loader clause deleted from one README and kept in its sibling; bind-mechanics prose deleted from one technique and kept in another; a delivery gate given a variable while its create-path twin was not.
3. **One earlier fix broke a contract.** Finding 1 is the product of two prior findings landing together — one declared an output, the other deleted the phases that populated it.
4. **The catalogue grew.** Seven findings key on entries appended since the earlier passes were measured, so "zero" moved while they were being written.

Guards did not hold the line because they do not reach this material: 36 guards against roughly 151 catalogue entries, and none of the 41 findings was guard-detectable.

## Findings

Severity, entry and location for each; the evidence is in the branch's commit bodies, which state what each construct now holds.

| ID | Sev | Entry | Location | Disposition |
|----|-----|-------|----------|-------------|
| 1 | High | `variable-for-approval` | post-impl-review change-block gate | Applied |
| 2 | High | `session-interaction-in-technique` | 5 techniques | Applied at 3; 2 held |
| 3 | High | `no-duplicated-guidance` | line-break rule, 4 homes | Applied |
| 4 | High | `canonical-fact-home` | ADR criteria, 3 homes, 2 disagreeing | Applied |
| 5 | High | `canonical-fact-home` | design-framework synthesis template | Applied |
| 6 | High | `structure-backed-constraints` | implement's per-task cargo bind | Applied |
| 7 | High | `no-technique-resource-dual-home` | test-plan section set | Applied |
| 8 | High | `pass-orchestration-in-technique` | implement-task self-review | Applied |
| 9 | High | `operative-criteria-need-a-home` | impact-axis vocabulary | Applied |
| 10 | High | Single Source of Truth | `review_findings`, three meanings | Partial; split held |
| 11 | Medium | `variable-for-approval` | 5 gates with indistinguishable options | Held |
| 12 | Medium | `bind-site-is-orchestration-truth` | activity diagrams naming retired gates | Applied |
| 13 | Medium | `no-next-step-narration` | submit-for-review abort option | Applied |
| 14 | Medium | Technique-Level Constructs | prose defaults, 3 operations | Applied |
| 15 | Medium | `procedure-in-io-contract` | 5 output descriptions | Applied |
| 16 | Medium | `artifact-not-buried` | the two lazy registers | Held |
| 17 | Medium | `no-duplicated-guidance` | unbound squash-merge operation | Applied |
| 18 | Medium | `readme-orients-not-transcribes` | activities README loader clause | Applied |
| 19 | Medium | `bag-value-as-literal` | README ADR path | Applied |
| 20 | Medium | `bag-value-as-literal` | assumption category roster, drifted | Applied |
| 21 | Medium | `cited-home-owns-claim` | resources index, PR-description row | Applied |
| 22 | Medium | `no-invented-naming` | two names for the reviewed-code prefix | Applied |
| 23 | Medium | `worktree-root-placeholders` | two hardcoded repository URLs | Applied |
| 24 | Medium | `no-bind-mechanics-as-prose` | changes-folder | Applied |
| 25 | Medium | `io-agnostic-contract` | changes-folder platform input | Applied |
| 26 | Medium | `no-duplicate-technique-steps` | naming-conventions bound twice | Applied |
| 27 | Medium | Single Source of Truth | the three discovery gates, two producers | Applied |
| 28 | Medium | `atomic-checkpoints` | complexity decided by the path gate | Held |
| 29 | Medium | `resource-fills-not-does` | cadence in 4 resources | Applied |
| 30 | Medium | `technique-stage-agnostic` | 2 rules naming stage and gate | Applied |
| 31 | Medium | `rule-slug-shape` | 2 slugs their bodies do not state | Applied |
| 32 | Medium | `no-rule-protocol-restatement` | naming-conventions worktree rule | Applied |
| 33 | Medium | `rule-as-protocol-step` | create-adr complexity phase | Applied |
| 34 | Medium | `duplicate-shared-capability` | commit and push recipes | Applied |
| 35 | Medium | `no-guide-wrapper-ceremony` | 3 good-bad tables | Applied |
| 36 | Medium | `artifact-name-in-io` | write-artifact naming a caller's file | Applied |
| 37 | Medium | `canonical-artifact-ids` | deferred-items register literal | Applied |
| 38 | Medium | `procedure-in-io-contract` | resign-commits outputs | Applied |
| 39 | Medium | Resources at the Abstract Level | code-review filename convention | Applied |
| 40 | Medium | `brace-declared-ids` | 3 sites | Applied at 2; 1 narrowed |
| 41 | Medium | *(no covering entry)* | assumptions-review comprehension exit | Held; PLAUSIBLE |
| 42 | Low | `avoidance-voice-in-definitions` | 2 sites | Applied |
| 43 | Low | `backtick-code-tokens` | 3 dotted rule addresses | Applied |
| 44 | Low | Reference Conventions | 3 empty input sections | Applied |
| 45 | Low | Reference Conventions | one step's field order | Applied |
| 46 | Low | `no-parallel-runbook-when-setup-covers-it` | worktree command beside its link | Applied |

### Withdrawn on adversarial re-derivation

| Candidate | Why it fell |
|---|---|
| Bare group-operation binds in seven activities, three of them sharing the name `document` | Activity-group shorthand: the resolver tries the activity's own group first, so a bare name resolves to the same-named group rather than colliding |
| A dangling guide-map reference in the strategic-review bind | The reference is a resource id and resolves to the resources index, matching every sibling workflow |
| Flat numbered protocol phases in 29 operations | Corpus form: 133 flat against 347 headed corpus-wide, the same share inside this workflow |
| Undeclared message interpolations | The variables guard reads interpolations in step and action messages and resolves bound-operation outputs |
| A trigger declaration duplicating a sub-workflow bind | Corpus form across four workflows, and the schema states the server does not act on trigger declarations |
| Framing above the first section of the review-mode resource | The section-framing guard is the authority and passes |
| Several bullets under one survey phase | The phasing principle names facets of one survey as the carve-out |
| A rule about links binding beyond its operation | The container's subject is planning-folder artifacts and their links, so the policy is about its own product |

## What the remediation changed

Four commits on `workflow/work-package-canon-audit-sweep`, 60 files.

- The change-block gate's flagged set is produced by a step, so the block interview reaches the blocks a reviewer named and the blocker route back to implement can fire.
- Techniques emit products and leave delivery to the activity that binds them.
- The ADR's shape, the test plan's section set, the line-break rule and the impact axes each have one home, with every unique clause migrated into that home before the copies were deleted.
- Cargo runs where the detected project type says it can.
- The three discovery gates and the path rationale have one producer each.
- Two guides state their anti-patterns as rules a draft is checked against, keeping every lesson and every anchor.

One regression was caught by the variables guard during remediation: converting a push-remote default from prose to a declared default would have pinned the stealth push to the public remote. The declaration was dropped and the bag variable's default carries it.

## Held

Five items are design decisions rather than mechanical fixes, and are left for a follow-up.

| ID | The decision it needs |
|----|-----------------------|
| 11 | Five gates carry options that route identically. Recording the distinction has no consumer to read it, so the compliant fix deletes options a user sees |
| 2 (partial) | Two elicitation operations run the interview. Compliance moves the asking to the activity, which adds up to five blocking gates to that activity |
| 10 (partial) | One bag name carries three declared meanings across five files; splitting it changes a contract |
| 16 | Declaring the two lazily created registers as artifacts collides with their guides' unprefixed, no-owning-activity design. One of the two gives |
| 28 | The path gate also assigns complexity. Splitting it changes the decision space |
| 41 | The comprehension exit's predicate is satisfied on no reachable path. Either something sets the variable, or the exit and its graph edge go |

## Owed

`npm run test:coverage-walk` reads the pinned corpus and takes no root override, so running it against the fix branch means moving the shared checkout mid-session. No option identifier and no option effect changed, and no change gates a checkpoint, so reachability is expected to hold — but that is reasoning rather than measurement. The walk is owed before merge.

## Coverage divergences

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — scoped by its own text to authoring the catalogue |
| Anti-Patterns | Interaction: assumed intent, scope re-verification | `not-applicable` — session conduct with no authored construct |
| Anti-Patterns | Execution, all but structure-backed constraints | `not-applicable` — authoring-session conduct |
| Anti-Patterns | Comment verbosity | `not-applicable` — the corpus holds no code |
| Design Principles | Confirm before irreversible; clarify before assuming; complete scope; internalize before producing; close the loop | `not-applicable` — session-conduct stances |

## Sources

| Label | Path |
|---|---|
| Guard suite, base ref | `npm run check:all` — 36 pass |
| Guard suite, fix branch | `npx tsx scripts/check-all.ts --corpus-only` — 32 of 32 at every commit |
| Option-coverage walk, base ref | `npm run test:coverage-walk` — 2 of 2 tests, 1500s |
| Binding-fidelity triage | `scripts/binding-fidelity-triage.json` — stamped at the audited corpus commit, holding no entry for this workflow |
| Criteria homes | `workflows/workflow-design/resources/{design-principles,anti-patterns,schema-construct-inventory,convention-conformance}.md` |
| Guard registry | `scripts/guards.ts` |
| Prior passes | [2026-09-05](../2026-09-05-canon-audit-work-package/findings-register.md), [2026-09-06 remediation](../2026-09-06-work-package-canon-remediation/findings-register.md), [2026-09-06 audit](../2026-09-06-canon-audit-work-package/findings-register.md) |
