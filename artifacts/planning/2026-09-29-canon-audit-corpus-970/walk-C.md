# Walk C — anti-patterns.md: Overview, Creation Rules, Structural, Interaction, Schema Expressiveness, Rule Hygiene

Home: `corpus/canon/resources/anti-patterns.md` at 0d56c951 (lines 1–373). Creation Rules applied to the PR's own edits of anti-patterns.md (`git diff ba2ee7b6..HEAD`): AP-11 (intro, Detect, Fix rewritten), AP-69 Fix, AP-79 Detect and Fix, AP-114 Do not flag. Catalogue entries AP-01..AP-25 applied entry-major across all 54 surface files.

## Units

- Overview — walked (each entry applied as its Detect / Do not flag / Fix test)
- Smell not stance — walked
- Entry identity — walked
- Audit technique boundary — walked (applied to the audit technique the PR edited in lockstep with AP-79: C2)
- Entry intro — walked
- Detect triad — walked
- Keep audit signals — walked
- Resist over-fit — walked
- Succinctness — walked
- AP-01. no-inline-content — walked
- AP-02. schema-is-constraint — walked (neither PR proposes a schema change; specimen fields such as `exits[].immediate` are existing schema)
- AP-03. no-partial-implementation — walked (C3)
- AP-04. no-invented-naming — walked (`NN-<id>.yaml` with id = filename is enforced by src/loaders/workflow-loader.ts:42–48,138; `selected_exit`, `ends_activity` are established in finalize-activity / evaluate-transition and the engine)
- AP-05. atomic-checkpoints — walked
- AP-06. no-assumption-execution — walked
- AP-07. scope-reverify-completion — walked (fires on the same evidence as C3; recorded once there)
- AP-08. one-question-per-message — walked
- AP-09. checkpoint-not-prose — walked
- AP-10. loop-not-prose — walked (take-activity's "take its activities until…" repetition is declared as activity-loop's `while` at every binding site: Do not flag "A loop already declared in steps[]")
- AP-11. decision-not-prose — walked (C1)
- AP-12. artifact-not-buried — walked
- AP-13. variable-for-approval — walked
- AP-14. mode-as-state — walked
- AP-15. procedure-in-protocol — walked
- AP-16. technique-inputs-declared — walked (C4, C5; `session_index` absent from yield-checkpoint Inputs not recorded: 18 workflow-engine siblings omit it, so it is the sibling form)
- AP-17. bound-step-no-description — walked
- AP-18. no-monolith-masking-steps — walked (specimen `numeric-flag` / `numeric-count` and activity-loop's two `commit-and-persist` steps differ by `when`: Do not flag)
- AP-19. no-rule-protocol-restatement — walked (C6, C9, C11, C12)
- AP-20. rule-group-disambiguation — walked
- AP-21. grouped-rule-keys — walked (a markdown technique flattens a group into `group-<specifier>` headings, which technique-loader.ts:408–425 expands from a bare group ref; agent-conduct's prefixed keys are that grouped form; no YAML `rules` on the surface)
- AP-22. single-rule-authority — walked (C10)
- AP-23. worker-rule-reach — walked
- AP-24. no-contradictory-rules — walked
- AP-25. no-one-step-rules — walked (C7, C8)

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| C1 | Live | Medium | AP-11 decision-not-prose | corpus/workflow-design/activities/05-impact-analysis.yaml:63–65, checkpoint `impact-and-preservation-confirmed` option `revise-impact` | Option labelled "Revise impact scope" ("Impact scope is incomplete or over-inclusive") carries no `effect`; the activity declares one exit `done`, bound in workflow.yaml `graph` to `scope-and-draft`, so choosing revise proceeds to drafting exactly as `confirmed` does. The revise path the option names is declared by no exit. | pre-existing (identical at ba2ee7b6; PR touched only version, description, outcome) | Declare a revise exit, have `revise-impact` select it via `effect.exit`, and bind it in the `graph` back to `impact-analysis`. |
| C2 | Contract | Medium | Audit technique boundary (Creation Rules) | corpus/workflow-design/techniques/audit-rule-enforcement.md:13, Output `enforcement_findings` | "the recommended structural mechanism (checkpoint, condition, validate action, or exit `when`)" restates `structure-backed-constraints` Fix list; the PR rewrote it ("decision" → "exit `when`") in lockstep with its AP-79 edit, the second home that AP-79's change had to be copied into. | diff | Drop the parenthetical; name the mechanism as the one `structure-backed-constraints` Fix prescribes. |
| C3 | Hygiene | Low | AP-03 no-partial-implementation | commit 3261c0d8 body ("The remaining activity READMEs … name exits where they named transitions or decisions"); survivors in touched files: corpus/codebase-wiki/activities/README.md:43 "## Transition map"; corpus/substrate-node-security-audit/activities/README.md:5 "do not appear in the transition graph"; corpus/workflow-design/README.md:93 "fix transitions live in 08-quality-review.yaml"; corpus/workflow-design/techniques/scope-definition.md:49 "short transition note when topology changes" | Each file had a sibling line edited to "exits" by the PR; these lines still name routing as transitions, so the done claim leaves scope items unaddressed. | diff | Complete the listed items (or narrow the stated scope) before the claim stands. |
| C4 | Contract | Medium | AP-16 technique-inputs-declared | corpus/workflow-design/techniques/scope-definition.md:36, 41, 45 (Protocol phases 1–3) | `{target_path}`, `{workflow_branch}`, `{workflow_id}` and `{id}` (phase 2, rewritten by the PR from `workflow-{id}/` to `{id}/`, braces kept) are needed values; neither the technique nor the root techniques/TECHNIQUE.md (user_description, target_workflow_id, target_workflow_ids) declares them. Sibling prepare-workflow-branch.md declares `target_path`. | pre-existing | Declare each on `## Inputs` (or the root contract) and reference `{id}` consistently. |
| C5 | Contract | Medium | AP-16 technique-inputs-declared | corpus/workflow-design/techniques/impact-analysis.md:54, 61 (Protocol phases 6, 7); no `## Inputs` | Phase 6 compares "planned changes" and phase 7 links "design-specification and structural inventory" — needed artifacts with no declared input. The workflow-authoring twin declares them as `change_brief` and `structural_inventory`. | pre-existing | Declare the change source and structural-inventory inputs and reference them as `{id}` in Protocol. |
| C6 | Hygiene | Low | AP-19 no-rule-protocol-restatement | corpus/meta/techniques/workflow-engine/yield-checkpoint.md:39, rule `replay-is-continue-not-error` | Added clause "where that decision selected an exit that ends the activity, continuing is finalizing the activity at this gate" restates Phase 2's `replayed` bullet (line 33: "Where the reply carries `exit.ends_activity` … finalize the activity"), adding no invariant the phase lacks. | diff | Delete the clause; the phase carries it. |
| C7 | Hygiene | Low | AP-25 no-one-step-rules | corpus/meta/techniques/workflow-engine/yield-checkpoint.md:37–39, rule `replay-is-continue-not-error` | The rule constrains only the `replayed` branch of Phase 2 (line 33), not a cross-cutting invariant. | pre-existing | Move the guidance into the `replayed` bullet as a `>` caveat and delete the rule (subsumes C6). |
| C8 | Hygiene | Low | AP-25 no-one-step-rules | corpus/meta/techniques/workflow-engine/respond-checkpoint.md:38–40, rule `no-option-hallucination` | Recovery for one failure of the Phase 2 `respond_checkpoint` call; the phase's other failure (`no active checkpoint on session`) is already a `>` note at line 35. | pre-existing | Move it into Phase 2 as a `>` caveat beside the existing one and delete the rule. |
| C9 | Hygiene | Low | AP-19 no-rule-protocol-restatement | corpus/meta/techniques/variable-binding.md:55–57, rule `outputs-by-name-and-path` | Restates Phase 4 (line 33 "A later `when` or `condition` reads `{O}` or `{O}.field.subfield` directly … no flattening step is needed"; line 32 "Nested-object outputs land whole"); the PR had to edit both sites identically ("`when`/`condition`/`transition`" → "`when` or `condition`"). | pre-existing | Delete the rule, keeping only the residual prohibition on a prose glue step as a phase bullet or a one-line rule. |
| C10 | Contract | Medium | AP-22 single-rule-authority | corpus/meta/techniques/variable-binding.md:65–67, rule `outputs-mutate-state-only-via-sanctioned-path`, vs corpus/meta/techniques/workflow-engine/TECHNIQUE.md:38 `variable-mutation-source` | Same invariant (state mutates only through sanctioned sources, "never through ad-hoc reasoning") with two homes, bridged by "This honours the engine's `variable-mutation-source` rule"; both reach the worker (activity-worker `follow-bundled-rules`). The PR's change to the owner (two → three sources) forced the copy's edit ("one of the two sanctioned" → "one of the sanctioned"). | pre-existing | Keep `variable-mutation-source` as the home; delete the copy, folding any unique content (outputs ride the `activity_complete` `variables-changed` map) into Phase 4. |
| C11 | Hygiene | Low | AP-19 no-rule-protocol-restatement | corpus/workflow-design/techniques/impact-analysis.md:66–68, rule `content-preservation` | "Every material reduction must appear in the removals inventory with a diff-style removed-vs-preserved entry … Never silently drop content from that inventory" restates Phase 6 (line 55 "record a diff-style entry … never omit a removal from the inventory"). | pre-existing | Delete the rule; Phase 6 carries it. |
| C12 | Hygiene | Low | AP-19 no-rule-protocol-restatement | corpus/workflow-design/techniques/impact-analysis.md:70–72, rule `side-effect-detection` | "Trace the side-effects each change class implies: …" is an imperative naming work no phase states (passes the stand-as-a-phase test); the PR rewrote its content but kept the imperative. The workflow-authoring twin states the same content declaratively. | pre-existing | Move the tracing into `## Protocol` as a phase (e.g. under Classify Impact) and delete the rule. |

No High was raised, so none was withdrawn or downgraded. Considered and not recorded: Succinctness on AP-11 and AP-79 (the mechanism list recurs in Detect and Fix, but Keep audit signals keeps it as Detect's test and as Fix branches); AP-11's name `decision-not-prose` (it still names the smell, a routing decision written as prose).

## Files

- corpus/README.md — read
- corpus/canon/resources/anti-patterns.md — read (lines 1–373 and the four edited entries in full)
- corpus/canon/resources/design-principles.md — read
- corpus/canon/resources/schema-construct-inventory.md — read
- corpus/codebase-wiki/activities/README.md — read
- corpus/meta/README.md — read
- corpus/meta/activities/README.md — read
- corpus/meta/activities/patterns/README.md — read
- corpus/meta/resources/README.md — read
- corpus/meta/resources/workflow-canonical.md — read
- corpus/meta/techniques/variable-binding.md — read
- corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- corpus/meta/techniques/workflow-engine/activity-worker.md — read
- corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- corpus/meta/techniques/workflow-engine/take-activity.md — read
- corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- corpus/ponytail/activities/README.md — read
- corpus/prism-audit/README.md — read
- corpus/prism-audit/activities/README.md — read
- corpus/substrate-node-security-audit/activities/README.md — read
- corpus/work-package/activities/README.md — read
- corpus/work-packages/README.md — read
- corpus/workflow-authoring/resources/elicitation-guide.md — read
- corpus/workflow-authoring/resources/update-mode-guide.md — read
- corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- corpus/workflow-design/README.md — read
- corpus/workflow-design/activities/05-impact-analysis.yaml — read
- corpus/workflow-design/activities/README.md — read
- corpus/workflow-design/resources/design-assumptions.md — read
- corpus/workflow-design/resources/elicitation-guide.md — read
- corpus/workflow-design/resources/format-conventions.md — read
- corpus/workflow-design/resources/impact-analysis.md — read
- corpus/workflow-design/resources/pattern-analysis.md — read
- corpus/workflow-design/resources/structural-inventory.md — read
- corpus/workflow-design/resources/update-mode-guide.md — read
- corpus/workflow-design/techniques/TECHNIQUE.md — read
- corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- corpus/workflow-design/techniques/impact-analysis.md — read
- corpus/workflow-design/techniques/pattern-analysis.md — read
- corpus/workflow-design/techniques/scope-definition.md — read
- docs/README.md — read
- corpus/meta/routines/activity-loop.yaml — read
- corpus/meta/techniques/workflow-engine/resume-worker.md — read
- corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- corpus/meta/techniques/agent-conduct.md — read
- corpus/meta/techniques/workflow-engine/README.md — read
- (971) corpus/specimens/schema-hygiene-conformance/README.md — read
- (971) corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- (971) corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- (971) corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- (971) corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- (971) walks/roster.json — read
