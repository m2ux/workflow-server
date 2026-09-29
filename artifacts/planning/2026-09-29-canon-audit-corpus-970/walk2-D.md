# Walk D, second pass — anti-patterns overview, entry identity, Description Hygiene, Coupling

Home: `corpus/canon/resources/anti-patterns.md` on the #970 worktree (fix head 1df70bd2). Surface: the 37 fix-surface paths. Origin is set against each fix commit's parent (0d56c951 for #970, 8a7dc934 for #971). `known — Dn` names the first-pass walk-D finding that still fires. Entries are cited by kebab name. The AP number sits in the Units list only so it can be sorted.

## Units

- Overview (Catalog preamble, Creation Rules preamble): walked. Each entry was applied as its own Detect / Do not flag / Fix test.
- Entry identity: walked. No surface file cites an entry by number (the `AP-[0-9]` sweep found no hits). The kebab citations in backticks are in audit-rule-enforcement.md:14, 36, 42 and meta/activities/patterns/README.md:49-51. The workflow-design README's "(AP-XX + name)" at :154 and :238 describes the catalogue format and cites no entry.
- AP-26. no-rationale-in-description: walked
- AP-27. validate-message-economy: walked (no validate action on the surface)
- AP-28. no-sequence-in-description: walked
- AP-29. no-user-env-mutation: walked
- AP-30. role-rules-not-description: walked
- AP-31. no-hand-authored-artifacts: walked (no activity `artifacts[]`)
- AP-32. outcome-names-value: walked
- AP-33. no-set-of-technique-output: walked (no `set` on the surface)
- AP-34. no-valueless-control-set: walked (no `set`)
- AP-35. no-intra-step-input-set: walked (no `set`)
- AP-36. techniques-list-disjoint: walked
- AP-37. rule-audience-bucket: walked (no `rules.*` bucket)
- AP-38. no-duplicate-technique-steps: walked
- AP-39. hoist-universal-techniques: walked
- AP-40. readme-orients-not-transcribes: walked
- AP-41. avoidance-voice-in-definitions: walked
- AP-42. io-agnostic-contract: walked
- AP-43. canonical-artifact-ids: walked
- AP-44. artifact-name-in-io: walked
- AP-45. no-opaque-artifact-path-array: walked
- AP-46. no-resource-caller-backlink: walked
- AP-47. no-redundant-link-label: walked
- AP-48. brace-output-references: walked
- AP-49. no-delivery-mechanism-narration: walked
- AP-50. no-tool-usage-prescription: walked
- AP-51. canonical-technique-reference: walked
- AP-52. brace-declared-ids: walked
- AP-53. dotted-rule-address: walked
- AP-54. anchored-protocol-references: walked
- AP-55. hoist-shared-inputs: walked
- AP-56. paren-invocation-args: walked
- AP-57. escape-literal-dollar: walked
- AP-58. snake-case-symbols: walked
- AP-59. constraint-as-blockquote: walked
- AP-60. local-rule-as-note: walked
- AP-61. factor-repeated-paths: walked
- AP-62. bind-protocol-locals: walked
- AP-63. backtick-code-tokens: walked
- AP-64. boolean-id-shape: walked
- AP-65. collection-id-shape: walked
- AP-66. io-id-shape: walked
- AP-67. rule-slug-shape: walked
- AP-68. technique-stage-agnostic: walked
- AP-69. no-activity-prose-rules: walked (no activity `rules:`)
- AP-70. capability-group-placement: walked

## Findings

Paths are relative to `corpus/` on the worktree named, #970 unless marked #971.

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| D1 | Contract | Medium | `hoist-shared-inputs` | meta/techniques/workflow-engine/activity-worker.md:24-26, compose-prompt.md:20-23, resume-worker.md:24-26, resume-from-checkpoint.md:16-18 (Inputs `effects`) | The fix gave all four leaf inputs one description, "The resolved checkpoint's reply: the option taken, its effect, and the exit it selected, or its dismissal". That removes the drift. It did not hoist the input: four leaves still declare it, workflow-engine/TECHNIQUE.md declares no Inputs, and each leaf restates the shape respond-checkpoint.md:22-24 owns. The commit body says the leaves "cite respond-checkpoint's declaration", but none of them names or links it. | known — D1 (description rewritten by the fix; the leaf redeclaration is still in place) | Hoist `effects` to workflow-engine/TECHNIQUE.md `## Inputs` and delete the four leaf declarations. Keep respond-checkpoint's output. |
| D2 | Hygiene | Low | `io-id-shape` | respond-checkpoint.md:22 (Output `effects`) and the four leaf inputs in D1 | The id `effects` names one member of the value its declarations now describe. The declared value is the whole reply: `resolved_option`, `effect`, `exit` and `dismissed`. | diff (the fix aligned the four leaves to "the reply") | Rename to what the value is (e.g. `checkpoint_reply`) as part of the D1 hoist. |
| D3 | Hygiene | Low | `readme-orients-not-transcribes` | meta/activities/patterns/README.md:39 | "Each pattern declares one exit, `done`, which the borrower binds to the activity that follows it." This transcribes `exits[]` of the three pattern files. The block must be edited whenever a pattern's exits change. Step 3 of the same list reads variables "off the `.yaml`". | diff | Keep "the borrower's `graph` binds every one" and delete the exit-id sentence. |
| D4 | Hygiene | Low | `readme-orients-not-transcribes` | meta/activities/patterns/README.md:5, 63, 67 | Loader HOW "`loadActivitiesFromDir` is non-recursive"; the `plan-confirmed` gate, "`forEach` execute; `while` replan"; "`while has_research_gaps` follow-up (max 3 rounds)" | known — D15 | Delete the loader HOW and the gate and loop notes. |
| D5 | Hygiene | Low | `local-rule-as-note` | meta/techniques/workflow-engine/yield-checkpoint.md:42-44 (`replay-is-continue-not-error`) | The rule governs only the `replayed` branch of Protocol 2 (:38). The fix trimmed it but left it filed as a Rule. | known — D10 | Demote it to a `>` note under the `replayed` branch. |
| D6 | Hygiene | Low | `constraint-as-blockquote` | workflow-design/techniques/audit-rule-enforcement.md:41 | "(and technique `## Rules` when the entry's scope implies)" | known — D25 | Move it to a `>` note. |
| D7 | Hygiene | Low | `bind-protocol-locals` (b) | workflow-design/techniques/scope-definition.md:57 | "Persist `{scope_manifest}` together with `{$structural_design}` and `{$drafting_order}`" (the reads carry `$`) | known — D26 | Read them as `{structural_design}` and `{drafting_order}`. |
| D8 | Hygiene | Low | `io-id-shape` | scope-definition.md:28 (`scope_manifest_path`); audit-rule-enforcement.md:28 (`enforcement_findings_path`) | Representation-proxy `-path` ids | known — D22 | Rename to the canonical value id. |
| D9 | Hygiene | Low | `hoist-shared-inputs` | activity-worker.md:12, resume-worker.md:12 and :28, respond-checkpoint.md:12, resume-from-checkpoint.md:12, evaluate-transition.md:20 | `session_index` and `state` are still redeclared per leaf. | known — D20 | Hoist both to workflow-engine/TECHNIQUE.md `## Inputs`. |
| D10 | Hygiene | Low | `hoist-shared-inputs` | activity-worker.md:20, resume-worker.md:16 (plus commit-and-persist, dispatch-activity, sync-progress-status, take-activity, continue-batch) | `activity_id` is declared on 7 workflow-engine leaves, and the container declares none. | pre-existing | Hoist it with D9. |
| D11 | Hygiene | Low | `io-id-shape` | resume-worker.md:28; evaluate-transition.md:20 (`### state`) | A bare single-word generic id | known — D21 (evaluate-transition is a new site on this surface) | Rename it to what the value is and hoist it per D9. |
| D12 | Hygiene | Low | `no-rationale-in-description` | compose-prompt.md:14, 27, 44; finalize-activity.md:26, 60, 64, 82; resume-worker.md:46, 70; activity-worker.md:77, 85, 101; respond-checkpoint.md:48, 52; variable-binding.md:53, 57, 67 | I/O descriptions, procedure bullets and Rules explain why or name the consumer. Examples: "it goes first because its refusal is the one a worker has a remedy for"; "The envelope is the only place this answer appears again, so it is read here"; "The orchestrator dispatches a fan on it"; "a count standing higher than a limit that was never in force is a comparison the block declines to invite"; "load-bearing rather than incidental … both would be wrong". The delete test leaves each constraint intact. | pre-existing | Delete the rationale clauses and move them to planning or ADR notes. |
| D13 | Hygiene | Low | `no-rationale-in-description` | meta/activities/patterns/02-supervisor.yaml:19 (`classification_rationale`) | "carried into synthesis or escalation" names the consumer. | pre-existing | Delete the consumer clause. |
| D14 | Hygiene | Low | `no-sequence-in-description` | patterns/02-supervisor.yaml:4, 03-plan-and-execute.yaml:4, 05-lead-researcher.yaml:4 | "Classify … dispatch that lane, and synthesise or escalate"; "Plan once, gate optionally, execute steps in order, and replan"; "Plan research questions, work through them, synthesise, and follow up". Each enumerates `steps[]`. The sibling meta activities (03-dispatch-client-workflow, 04-end-workflow) carry no step sequence. | pre-existing | Keep the purpose clause ("borrowable … pattern") and delete the step sequence. |
| D15 | Hygiene | Low | `outcome-names-value` | patterns/02-supervisor.yaml:66 | "Synthesis or escalation rationale available in the bag" names the vessel. | pre-existing | State the value delivered: "Synthesis, or the escalation rationale". |
| D16 | Hygiene | Low | `readme-orients-not-transcribes` | midnight-system-review/activities/README.md:5, 15, 16; prism-update/activities/README.md:33, 41; workflow-design/README.md:13, 28, 29; substrate-node-security-audit/activities/README.md:17 | Checkpoint, loop and auto-advance transcription: "The `verdict-review` checkpoint can route back to `02`", "(non-blocking, 30s auto-advance)", "blocking amendment loop", "at a blocking checkpoint, where they can confirm the full set, adjust exclusions, or abort", "A non-blocking checkpoint surfaces the findings", "while-loop … Gate 1 … Gate 2", "bounded fix-revalidate loop (max 3) … forEach over `target_workflow_ids`", "Gate 2 `approve-to-commit`", "entered only when the dispatch, verification, and merge gates are all set". The fix touched only the orientation sentences of these files. | pre-existing | Delete the checkpoint, loop, auto-advance and exit-condition transcription. Keep purpose and connections. |
| D17 | Hygiene | Low | `avoidance-voice-in-definitions` | codebase-wiki/activities/README.md:5, 21, 29, 37; specimens/fan-conformance/activities/README.md:5; specimens/git-pin-conformance/activities/README.md:11; specimens/routine-conformance/activities/README.md:11; workflow-design/README.md:87, 93 | "There is no mode split and no review-only path"; "rather than rebuilding it"; "never silently reconciled"; "no branch, commit, or pull-request techniques"; "it is not duplicated here"; "Two fixed targets rather than a loop"; "One target rather than a list"; "Do not restate engine dispatch/checkpoint HOW here"; "do not restate that inventory here" | pre-existing (workflow-design :93 was reworded by the fix and kept the clause) | Rewrite each to the current behaviour. |
| D18 | Hygiene | Low | `no-resource-caller-backlink` | workflow-authoring/resources/impact-analysis.md:72-75 (inside the Template) | "while a file is drafted, or while an audit fix is applied … approved at the impact gate from one approved at the gate that observed it" narrates gate and stage topology. The Template carve-out covers filenames only. | pre-existing | Keep "a later reduction is a row naming the stage that raised it" and drop the gate narration. |
| D19 | Hygiene | Low | `brace-declared-ids` (c) | meta/techniques/workflow-engine/evaluate-transition.md:50 | "iterate `current_activity.exits[]`" is a declared input disguised in backticks. | pre-existing | `{current_activity}.exits[]` |
| D20 | Hygiene | Low | `io-agnostic-contract` | finalize-activity.md:68 (`#### activity_exit`) | "The exit id this activity took, from evaluate-transition" names a producer technique. | pre-existing | Drop "from evaluate-transition". |
| D21 | Hygiene | Low | `no-delivery-mechanism-narration` | meta/techniques/variable-binding.md:14 (Protocol 1) | "(… — `get_technique` returns it fully composed)". variable-binding is not a workflow-engine technique, so the carve-out does not cover it. | pre-existing | Delete the mechanism clause and keep "Load the composed `inputs[]`/`outputs[]`". |
| D22 | Hygiene | Low | `local-rule-as-note` | resume-worker.md:68-70 (`a-replacement-repeats-the-work-not-the-question`) | The rule qualifies only Protocol 4 (replace a context that is gone). | pre-existing | Demote it to a `>` note under Protocol 4. |
| D23 | Hygiene | Low | `brace-output-references` | resume-worker.md:59 (Protocol 4) | "return that identity with the replacement's envelope" | pre-existing | "return `{worker_agent_id}` and the replacement's envelope as `{worker_result}`" |
| D24 | Hygiene | Low | `backtick-code-tokens` | prism-update/activities/README.md:11 | "Diff upstream prisms/ against current resources" (a bare directory path) | pre-existing | Write `prisms/`. |

No finding was raised at High or in the Live band. D1 was weighed at High, since the fix rewrote the four copies it ships and a later change to the reply must edit five places. It stays at Medium because the copies now agree with the owner. resume-from-checkpoint reads `exit` from the `resume_checkpoint` response itself, which the engine returns (src/tools/workflow-tools.ts:2636-2681). No step is misled.

First-pass findings that no longer fire on this surface:
- D2 (principle 43 negation).
- D3 and D4 (the yield-checkpoint rationale clause and the omit-when caveat). Both were removed.
- D5 (the `local-marker` rule), which now states "`{probe_recorded}` is set by the Record step alone".
- D6: scope-definition now reads `{workflow_id}/`.
- D7 and D8 (`variables_changed` spelling).
- D9 (the yield payload consumer clause).

The other first-pass findings sit on files outside the fix surface.

Walked and not flagged, as convention or carve-out:
- `constraint-as-blockquote` on wholly conditional bullets (resume-from-checkpoint.md:39 "Where the `resume_checkpoint` response carries `exit`, hold …"; respond-checkpoint.md:30). The workflow-engine siblings carry the "When X, apply Y" bullet throughout, e.g. activity-worker.md:57.
- `constraint-as-blockquote` on yield-checkpoint.md:38. Its where/otherwise is a ladder over one choice.
- `bind-protocol-locals` on finalize-activity.md:78 `{selected_exit}`. It is declared as `#### selected_exit` under `activity_result`. Whether finalize-activity should declare the input that yield-checkpoint and resume-from-checkpoint now route to it is a signature question for another slice (`apply-omits-declared-input`).
- `no-rationale-in-description` on 02-gate-exit.yaml:25 "The activity can end here, ahead of after-gate." (#971). This is a one-line summary of what the gate decides.
- `no-sequence-in-description` and `readme-orients-not-transcribes` on the #971 specimen. The sibling specimens carry the same form, as the first pass found.
- `techniques-list-disjoint` on 01-probe.yaml:7. `hygiene-probe::local-marker` names a rule, not the step-bound technique.
- `no-duplicate-technique-steps` on 03-plan-and-execute and 05-lead-researcher. The steps are distinct pipeline points, the first pass and the follow-up loop.
- `paren-invocation-args` on the backticked `name: value` arguments in resume-worker and activity-worker. This is the engine convention.
- `dotted-rule-address` for bare `variable-mutation-source` in variable-binding. It is in-library, so a static walk cannot disprove it.
- `no-tool-usage-prescription`, `no-delivery-mechanism-narration` and `technique-stage-agnostic` in the workflow-engine checkpoint techniques. The engine carve-out applies, and their subject is the checkpoint itself.
- A scripted sweep of the surface markdown found no unescaped `$`, no brace designator outside a code span, no redundant link label, no bare `scheme://` URI, and no bare filename other than D24.

Ledger edits: neither fix commit touches a guard ledger, so no finding rests on suppression.

## Files

- corpus-schema-hygiene/corpus/canon/resources/design-principles.md: read
- corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md: read
- corpus-schema-hygiene/corpus/meta/activities/patterns/02-supervisor.yaml: read
- corpus-schema-hygiene/corpus/meta/activities/patterns/03-plan-and-execute.yaml: read
- corpus-schema-hygiene/corpus/meta/activities/patterns/05-lead-researcher.yaml: read
- corpus-schema-hygiene/corpus/meta/activities/patterns/README.md: read
- corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/finalize-activity.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md: read
- corpus-schema-hygiene/corpus/midnight-system-review/activities/README.md: read
- corpus-schema-hygiene/corpus/prism-evaluate/activities/README.md: read
- corpus-schema-hygiene/corpus/prism-update/activities/README.md: read
- corpus-schema-hygiene/corpus/specimens/fan-conformance/activities/README.md: read
- corpus-schema-hygiene/corpus/specimens/git-pin-conformance/activities/README.md: read
- corpus-schema-hygiene/corpus/specimens/gitnexus-radius-conformance/activities/README.md: read
- corpus-schema-hygiene/corpus/specimens/routine-conformance/activities/README.md: read
- corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md: read
- corpus-schema-hygiene/corpus/work-package/README.md: read
- corpus-schema-hygiene/corpus/work-packages/activities/README.md: read
- corpus-schema-hygiene/corpus/workflow-authoring/resources/impact-analysis.md: read
- corpus-schema-hygiene/corpus/workflow-design/README.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/evaluate-transition.md: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml: read
- specimen-schema-hygiene/walks/roster.json: read
