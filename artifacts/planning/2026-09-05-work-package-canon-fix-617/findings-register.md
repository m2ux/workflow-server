# Findings Register — `work-package`

**Date:** 2026-09-05 · **Mode:** Review, then Update
**Base ref:** `677ca0445cfb1283d4b103d7697f29ce393c8b74` · **Targets:** `workflows/work-package` (171 definition files)
**Change surface at audit time:** 1 file (touched: 1 whole file · I/O-contract closure: 0 · consumers: 0)

A standalone audit of the target, followed in the same session by remediation of every surviving finding. The change surface was the single corpus file that had moved since the last adoption; every other finding is `pre-existing` relative to that base.

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 (13 raised, 11 fixed, 2 withdrawn) | 0 |
| Medium   | 0 (17 raised, 17 fixed) | 0 |
| Low      | 1 (3 raised, 3 fixed; 1 raised at re-audit, open) | 0 |

**Coverage:** divergences 9 — see Coverage. No per-unit walked tally was kept, so this register cannot certify a complete walk.

**Guards:** `npx tsx scripts/check-all.ts --root <worktree> --corpus-only` — 32 of 32 pass at the final commit. `npm run test:coverage-walk` — **not run against the fix**; the walk has no root override and the shared checkout was in use. A pre-fix baseline run passed its coverage assertion and failed only its stamp-freshness assertion.

## Change surface

| Path | How it joined |
|------|----------------|
| `work-package/techniques/implement-task.md` | touched (whole file) |

The touched file's diff is prose inside one Protocol phase; its Inputs and Outputs are unchanged, so contract closure pulls in nothing.

## Findings

Numbered as the audit reported them. Disposition records where each closed.

| ID | Severity | Entry | Location | Evidence | Origin | Disposition |
|----|----------|-------|----------|----------|--------|-------------|
| F1 | High | `session-interaction-in-technique` | `techniques/implement-task.md` Protocol §2 | "surface that level and the symbols it names before editing" — no tool or op owns the channel. The base ref read "record … in `{task_implementation}`" | diff | Fixed — reverted to the record form |
| F3 | High | Action Types (`validate`) | `activities/09-lean-coding-audit.yaml` | Loop body validates `safety_floor_cleared == true`; the only writer in the corpus is a checkpoint in `ponytail/activities/02-apply-ladder.yaml`, an activity this graph never includes. Workflow default is `false`, so the gate fails every iteration | pre-existing | Fixed — cycle closes on its own safety-floor checkpoint; the verdict is the option picked |
| F4 | High | Action Types (`validate`) | `activities/08-implement.yaml` | `target: branch` — declared by neither the activity nor the workflow, so the check cannot evaluate | pre-existing | Fixed — deleted; the check has a home in 01 |
| F5 | High | Loop / Checkpoint Effects | `activities/08-implement.yaml` | `breakCondition: has_uncertain_symbols == true`; the gate's second option sets it true and nothing outside the loop resets it, so choosing it abandons every remaining task and advances the run | pre-existing | Fixed — self-review and its gate moved into a bounded `doWhile` |
| F6 | High | `no-valueless-control-set` | 6 sites across `01`, `04`, `09`, `13` | `kind: action` steps whose `set` carries a target and prose with no `value:`, the prose holding the derivation for a domain payload | pre-existing | Fixed — two became values, two became declared outputs of `research/synthesize`, two named values no operation produces and were retired |
| F8 | High | Checkpoint fragment | `activities/07-assumptions-review.yaml` | Three activities reach the individual-assumption gate by `ref`; this one inlines a divergent body with a different option set | pre-existing | Fixed — takes the fragment, which gained the option the copy had |
| F9 | High | `atomic-checkpoints` | `activities/10-post-impl-review.yaml` | `file-index-table` asks for block numbers and rationale corrections in one gate, with neither carried by an option | pre-existing | Fixed — split into two gates. **Introduced D1** |
| F10 | High | `link-named-artifacts` | `15`, `02`, `09`, `13` | Messages naming durable artifacts with no `[label]({path})` | pre-existing | Fixed |
| F11 | High | `link-named-artifacts` | `activities/02-design-philosophy.yaml` | `[assumptions log]({assumptions_log})` where the variable is declared `type: object` | pre-existing | Fixed |
| F12 | High | `technique-stage-agnostic` | 14 technique files | "for the binding activity to surface", "at the residual batch checkpoint", "if the binding activity wraps this op in a `while`" | pre-existing | Fixed |
| F13 | High | `session-interaction-in-technique` | `research/reconcile.md`, `apply-review-fixes.md`, `manage-git/create-worktree.md` | "Present … in the session", "surface HIGH or CRITICAL risk to the user", "offer to choose" | pre-existing | Fixed |
| F14–F18 | Medium | `readme-orients-not-transcribes`, `bind-site-is-orchestration-truth`, `no-delivery-mechanism-narration`, `avoidance-voice-in-definitions` | `README.md` | Stale version against `workflow.yaml`; a per-activity override table encoding gating and exit re-routing; a prose inventory of the gates a review run pauses at; loader and `get_activity` narration; framing against a schema list the design does not use | pre-existing | Fixed |
| F19 | Medium | Graph | `workflow.yaml`, `activities/14-complete.yaml` | The close-out is the only activity with no `exits:` and the graph names no destination; siblings declare `__terminal__` | pre-existing | Fixed — exit declared and bound in both including workflows |
| F20 | Medium | `statement-not-question` | 14 messages across 7 activities | "Select whether…", "Select the…", restating the option labels beneath | pre-existing | Fixed |
| F21 | Medium | `no-next-step-narration` | `13`, `10`, `workflow.yaml` | "after the … loop's two iterations", "re-presented until review arrives", "— then the next flagged block" | pre-existing | Fixed |
| F22 | Medium | Checkpoint Effects | `12`, `15`, `10` | Options whose labelled consequence is wired to no effect and whose routing is identical to a sibling's | pre-existing | Fixed |
| F23 | Medium | `no-rationale-in-description` | 9 sites across 6 activities | Consumer, producer and gate tails on variable declarations; four terminated mid-sentence | pre-existing | Fixed |
| F24 | Medium | `no-bind-mechanics-as-prose` | `techniques/TECHNIQUE.md`, `workflow.yaml`, `01` | "Bound into github-cli-protocol ops by name-match", restated on the workflow variable; "carried in the bag" | pre-existing | Fixed |
| F25 | Medium | `procedure-in-io-contract` | `techniques/TECHNIQUE.md`, `review-test-suite.md` | Filename-numbering rule and optionality note on an input; a tracing duty on another | pre-existing | Fixed |
| F26 | Medium | `platform-semantics-in-capability` | `techniques/TECHNIQUE.md` | Capability names the categories the loader merges, three of which the file does not declare | pre-existing | Fixed |
| F27 | Medium | `no-rule-protocol-restatement` | `techniques/review-test-suite.md` | Rule `coverage-relative` restates Protocol phase 2 | pre-existing | Fixed |
| F28 | Medium | `constraint-as-blockquote` | `techniques/review-test-suite.md` | Conditional branches as peer bullets rather than notes | pre-existing | Fixed |
| F29 | Medium | `no-resource-caller-backlink` | `resources/review-mode.md`, `readme.md`, `readme-seed.md` | A bind recipe naming two ops; "Seed via [create-readme] with `seed_profile:`"; "Fill data for [create-readme]" | pre-existing | Fixed |
| F30 | Medium | `no-duplicate-technique-steps` | `activities/11-validate.yaml` | Two steps bind `review-test-suite` with identical `when` and no input deviation | pre-existing | Fixed |
| F31 | Low | Action step | `01`, `13` | Mid-sequence `kind: action` steps with `actions: []`, one naming a delivery it does not perform | pre-existing | Fixed |
| F32 | Low | `no-rationale-in-description` | `08`, `07` | `current_assumption` cites `task_assumptions`, declared nowhere; the loops iterate `open_assumptions` | pre-existing | Fixed |
| F33 | Low | `no-rationale-in-description` | `activities/10-post-impl-review.yaml` | `triggers[].description` narrates the other branch, which the two steps' `when` gates encode | pre-existing | Fixed |
| G1 | Low | `readme-orients-not-transcribes` | `README.md` | The activity index keeps a `Required` column whose values restate graph gating | pre-existing | **Open** — left as a judgement call against the entry's index-table carve-out |

### Defects this pass introduced

Raised by the passes that followed. Recorded here because they are this pass's to own.

| ID | Entry | Location | Evidence | Closed |
|----|-------|----------|----------|--------|
| D1 | `link-named-artifacts` | `activities/10-post-impl-review.yaml` | The F9 split dropped the `[label]({path})` form; a declared path is interpolated bare. The same entry this pass fixed at four other sites | [2026-09-05 pass](../2026-09-05-canon-audit-work-package/findings-register.md) finding 10 |
| D2 | `bind-site-is-orchestration-truth` | `REVIEW-MODE.md` | The F9 split deleted option `rationale-confirmed` while a document this pass never opened still names it | [2026-09-05 pass](../2026-09-05-canon-audit-work-package/findings-register.md) finding 3 |
| D3 | `option-coverage` | `workflow.yaml` fragment `assumption-decision` | The F8 fix added a `correct-assumption` option no walk reaches. This pass did not run the walk | [2026-09-06 remediation](../2026-09-06-work-package-canon-remediation/previous-pass-reconciliation.md) C1 |

### Withdrawn on adversarial re-derivation

Both were confirmed by the verify pass and refuted by the guards during remediation.

| Candidate | Why it fell |
|---|---|
| F2 — `cited-home-owns-claim` on a `guide_map` input resolving to no anchor | Every sibling workflow passes the same form, and `scripts/check-artifact-guides.ts` resolves the map from the resources README rather than as a markdown anchor. A claim about resolution, argued from the citing file |
| F7 — Workflow variable second home, for 11 variables declared in both `workflow.yaml` and the producing activity | Removing the workflow-file copies produced ten `unreachable-read` findings and three stale review-mode acceptances: those declarations seed the values at session entry. The construct inventory's wording invited the reading |

The withdrawal of F2 was generalised to its neighbour without testing it. `canonical_home_map`, on the line above, resolves to nothing and stood for another day as [2026-09-05](../2026-09-05-canon-audit-work-package/findings-register.md) finding 2.

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — governs authoring `anti-patterns.md`, which this pass does not edit |
| Anti-Patterns | Interaction and Execution families, session-conduct entries | `not-applicable` — they key on an authoring session's conduct, not on definition content |
| Anti-Patterns | Technique Protocol Anti-Patterns | `blocked` — the 115 technique files were reached by targeted pattern scan; the whole-file entries were not applied |
| Anti-Patterns | Output Economy, resource-side | `blocked` — the 37 resource bodies were not read |
| Anti-Patterns | Canon Hygiene Anti-Patterns | `blocked` — same bound |
| Anti-Patterns | All families, on `activities/03`, `05`, `06` | `blocked` — reached by `grep` only, and edited on that basis |
| Design Principles | 1, 2, 3, 4, 7, 8, 23, 28, 33 | `not-applicable` — they govern an authoring session rather than the artefact |
| Guards | `option-coverage` walk | `blocked` — no root override; the shared checkout was in use. D3 is what it would have caught |
| Guards | `binding-fidelity` triage currency | `walked` — the ledger stamps `69a01ca1c3b5`; the drift inside the target was one file, cited by no entry |

## File coverage

read 18 · swept 25 · unread 128 — summing to the target surface of 171.

| Disposition | Paths |
|-------------|-------|
| `read` | `workflow.yaml`, `README.md`, `resources/README.md`, `techniques/TECHNIQUE.md`, `techniques/review-test-suite.md`, `techniques/research/synthesize.md`, and activities `01`, `02`, `04`, `07`, `08`, `09`, `10`, `11`, `12`, `13`, `14`, `15` |
| `swept` | Activities `03`, `05`, `06`; `resources/readme.md`, `readme-seed.md`, `review-mode.md`; 19 technique files under `techniques/`, including `analyse-challenge/run-loop.md`, `apply-review-fixes.md`, `implement-task.md`, `manage-git/{create-worktree,instruct-merge-strategy,remove-worktree}.md`, `naming-conventions.md`, `research/{reconcile,triage,TECHNIQUE}.md`, `respond-to-pr-review.md`, `review-{assumptions/interview,code,diff,mode-detection,summary}.md`, `project-type-detection.md`, `codebase-comprehension/deep-dive.md`. Scans: fixed pattern sets for stage-locus phrases, present/surface verbs, resource caller backlinks, `Apply [` invocations, `Select`-opener messages, empty action steps, and value-less `set` actions |
| `unread` | The remaining 128 paths under `work-package/` |

Every `swept` path in the second row was **edited** on the strength of its scan hit, without its contents being read. That is 25 of the 42 files this pass changed.

Findings of absence in this register hold only over the 18 `read` paths. No claim here that a construct is unreferenced, or that a name is declared nowhere, was resolved against the full enumeration.

## Sources

| Label | Path |
|---|---|
| Guard suite, fix branch | `npx tsx scripts/check-all.ts --root <worktree> --corpus-only` — 32 of 32 at the final commit |
| Coverage-walk baseline, pre-fix | `npm run test:coverage-walk` — coverage assertion passed; stamp-freshness assertion failed against `corpus-sha.json` |
| Guide-map consumer | `scripts/check-artifact-guides.ts` — settles the F2 withdrawal |
| Activity variable contract | `scripts/check-activity-variables.ts` — settles the F7 withdrawal |
| Sibling terminal convention | `meta/workflow.yaml`, `ponytail/workflow.yaml` — settle F19 |
| Following pass | [2026-09-05 register](../2026-09-05-canon-audit-work-package/findings-register.md) and its comparison document |
