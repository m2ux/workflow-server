# Walk D — anti-patterns overview, entry identity, Description Hygiene, Coupling

Home: `corpus/canon/resources/anti-patterns.md` on the #970 worktree (head 0d56c951). Entries are cited by kebab name, with the AP number beside it only so the table can be sorted.

## Units

- Overview (Catalog, Creation Rules preamble): walked. Each entry applied as its own Detect / Do not flag / Fix test.
- Entry identity: walked. Applied to citations of catalog entries across the surface.
- AP-26. no-rationale-in-description: walked
- AP-27. validate-message-economy: walked
- AP-28. no-sequence-in-description: walked
- AP-29. no-user-env-mutation: walked
- AP-30. role-rules-not-description: walked
- AP-31. no-hand-authored-artifacts: walked
- AP-32. outcome-names-value: walked
- AP-33. no-set-of-technique-output: walked
- AP-34. no-valueless-control-set: walked
- AP-35. no-intra-step-input-set: walked
- AP-36. techniques-list-disjoint: walked
- AP-37. rule-audience-bucket: walked (no `rules.*` bucket on any surface file)
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
- AP-69. no-activity-prose-rules: walked
- AP-70. capability-group-placement: walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| D1 | Contract | Medium | `hoist-shared-inputs` (AP-55) | meta/techniques/workflow-engine/respond-checkpoint.md:22-24 (Outputs `effects`); activity-worker.md:24-26, compose-prompt.md:20-23, resume-worker.md:24-26, resume-from-checkpoint.md:16-18 (Inputs `effects`) | The PR rewrote the producer's output as "The reply the server returns on clearing the active checkpoint: `resolved_option` …; `effect` …; `exit` … `ends_activity` …; and `dismissed`". Four leaf inputs still describe the same slot as "Variable updates carried by (a / the) resolved checkpoint", and workflow-engine/TECHNIQUE.md declares no Inputs. The result is one concept with two contracts across five leaves. activity-loop.yaml:182 binds the output straight into resume-worker (`effects: effects`). | diff (changed I/O contract; the per-leaf redeclaration itself is pre-existing) | Hoist `effects` to workflow-engine/TECHNIQUE.md `## Inputs` with the reply description, widened by the "present only on a continuation" clause. Delete the four leaf declarations and keep respond-checkpoint's output. |
| D2 | Hygiene | Low | `avoidance-voice-in-definitions` (AP-41) | canon/resources/design-principles.md:189 (principle 43 body) | "No construct binds or includes one activity inside another". This negates the replaced wording "may borrow, bind, or include another activity" and only reads against it. | diff | Delete the negation. Keep "a run of steps several activities share is a routine". |
| D3 | Hygiene | Low | `no-rationale-in-description` (AP-26) | meta/techniques/workflow-engine/yield-checkpoint.md:26 (Protocol 1, bullet 1) | "passing the values the steps before the gate produced as `variables_changed` so a gate message that interpolates them has them to render". The trailing clause names the consumer, and the instruction stands without it. | diff | Delete "so a gate message that interpolates them has them to render". |
| D4 | Hygiene | Low | `constraint-as-blockquote` (AP-59) | yield-checkpoint.md:26 (same bullet) | "…; omit it when those steps produced nothing." is a *when* caveat inside the step sentence. | diff | Move it to a `>` note under the bullet: "Omit `variables_changed` when those steps produced nothing." |
| D5 | Hygiene | Low | `no-rationale-in-description` (AP-26) | #971 specimens/schema-hygiene-conformance/techniques/hygiene-probe.md:24-26 (`## Rules` `local-marker`) | "A rule this workflow alone declares, so a bare reference to it resolves only against this workflow." The body is only why the rule exists. Deleting it leaves no constraint, and sibling specimen rules state one (contract-composition `pair-together`). | diff | Delete the rationale (README Cases already states it) and give `local-marker` an invariant the probe holds. |
| D6 | Hygiene | Low | `bind-protocol-locals` (AP-62 a) | workflow-design/techniques/scope-definition.md:41 (Protocol 2) | "`{id}/`, named for the workflow id". `{id}` is not a declared I/O, an ambient input or a `{$id}` bind. Protocol 3 of the same file names the same value `{workflow_id}`, which 06-scope-and-draft reads. | diff (phrase rewritten by the PR; the `{id}` token was carried over from base `workflow-{id}/`) | Write `{workflow_id}/`. |
| D7 | Hygiene | Low | `snake-case-symbols` (AP-58) | meta/techniques/workflow-engine/TECHNIQUE.md:38 (`variable-mutation-source`) | "worker `activity_complete` results (`variables-changed`), and the `variables_changed` a worker passes to `yield_checkpoint`". The rewritten rule spells one server field two ways. The field is `variables_changed` (finalize-activity.md:46; `next_activity` / `yield_checkpoint` params). | diff (rule rewritten by the PR; the kebab token is at base) | Keep the tool's spelling: `variables_changed`. |
| D8 | Hygiene | Low | `snake-case-symbols` (AP-58) | meta/techniques/variable-binding.md:67 (`outputs-mutate-state-only-via-sanctioned-path`) | "through the `variables-changed` channel of the worker's `activity_complete` result" | pre-existing | `variables_changed`. |
| D9 | Hygiene | Low | `no-rationale-in-description` (AP-26) | yield-checkpoint.md:32 (Protocol 2, `yielded` branch) | "(no payload — the active checkpoint is server-resident and is read with `present_checkpoint` by the agent that presents it)". This names the consumer. The base carried the same clause as "read by the orchestrator via `present_checkpoint`". | pre-existing (reworded by the PR) | Keep "(no payload)" and delete the consumer clause. |
| D10 | Hygiene | Low | `local-rule-as-note` (AP-60) | yield-checkpoint.md:37-39 (`replay-is-continue-not-error`) | The rule governs only the `replayed` branch of Protocol 2, and the PR extended it with that branch's ends-activity case. | pre-existing | Demote it to a `>` note under the `replayed` branch. |
| D11 | Hygiene | Low | `no-rationale-in-description` (AP-26); `io-agnostic-contract` (AP-42) | workflow-design/activities/05-impact-analysis.yaml:19 (`preservation_required`), :23 (`removal_count`) | "so drafting frames each file to keep it … the whole of the create path — that route reaches drafting without visiting this activity". The first clause names the consumer and the second restates the graph route. "inventoried by impact-analysis" names the producer. | pre-existing | Describe the value only. Drop consumer, route and producer. |
| D12 | Hygiene | Low | `role-rules-not-description` (AP-30) | meta/resources/workflow-canonical.md:7-8 (frontmatter `description`) | "Load once per session before interpreting such files." This prescribes agent behaviour in a description. | pre-existing | Drop it, or state it as a rule where the loading duty lives. |
| D13 | Hygiene | Low | `readme-orients-not-transcribes` (AP-40) | workflow-design/activities/README.md:15, 23, 31, 39 | Variables (`operation_type_ambiguous`, `change_request_clear`, `intent_needs_confirmation`), checkpoints (`design-intent-batch`, `spec-confirmed`, `patterns-confirmed` "(`defaultOption` + `autoAdvanceMs`)", `impact-and-preservation-confirmed`) and loops (`forEach`, `while has_resolvable_assumptions`) | pre-existing (line 39 touched only for the exits wording) | Delete the step, checkpoint, loop and variable enumerations. Keep purpose and connections. |
| D14 | Hygiene | Low | `readme-orients-not-transcribes` (AP-40) | ponytail/activities/README.md:13, 21, 37 | Checkpoints `intensity-and-scope-confirmed` and `safety-floor-cleared`; "The activity is `required: false` and gated in" | pre-existing | Delete the checkpoint and gate transcription. |
| D15 | Hygiene | Low | `readme-orients-not-transcribes` (AP-40) | meta/activities/patterns/README.md:5, 63-67 | Loader HOW "(`loadActivitiesFromDir` is non-recursive …)"; Pattern notes transcribe the `plan-confirmed` gate, `forEach` / `while … plan_needs_replan` and `while has_research_gaps` (max 3 rounds) | pre-existing | Delete the loader HOW and the loop and gate notes. Keep pattern purpose. |
| D16 | Hygiene | Low | `avoidance-voice-in-definitions` (AP-41) | meta/resources/README.md:7, 24-33 | "has moved into the corresponding capability techniques' techniques"; a `### Removed` table with the column "Where the content lives now" | pre-existing | Delete the move history. Index the current homes only. |
| D17 | Hygiene | Low | `avoidance-voice-in-definitions` (AP-41) | prism-audit/README.md:13, 15, 94, 114 | "Why a dedicated audit workflow rather than prompting prism directly?", "No generic checklist.", "rather than authored here", "not called inline" | pre-existing | Rewrite to current behaviour. |
| D18 | Hygiene | Low | `avoidance-voice-in-definitions` (AP-41) | meta/resources/workflow-canonical.md:57-58 | "The parser also reads a flat numbered or bulleted list, which is what a definition written before that form carries." | pre-existing | Drop the prior-form clause. |
| D19 | Hygiene | Low | `no-resource-caller-backlink` (AP-46) | workflow-design/resources/impact-analysis.md:11; format-conventions.md:10; design-assumptions.md:62 | "Human gate at impact-and-preservation."; "keep short for human skim at literacy gates"; "including when collect/record ops are borrowed from work-package" (gate and bind topology in resources) | pre-existing | Drop the gate and bind narration. State what the resource is. |
| D20 | Hygiene | Low | `hoist-shared-inputs` (AP-55) | workflow-engine take-activity.md:12, 36; resume-worker.md:12, 28; activity-worker.md:12; respond-checkpoint.md:12; resume-from-checkpoint.md:12; present-checkpoint-to-user.md:12 (plus non-surface siblings) | `session_index` is redeclared on 11 workflow-engine leaves. `state` is redeclared on 5 (continue-batch, dispatch-activity, evaluate-transition, take-activity, resume-worker). workflow-engine/TECHNIQUE.md declares neither. | pre-existing | Hoist both to workflow-engine/TECHNIQUE.md `## Inputs` and delete the leaf declarations. |
| D21 | Hygiene | Low | `io-id-shape` (AP-66) | take-activity.md:36; resume-worker.md:28 (`### state`) | A bare single-word generic id (`state`) | pre-existing | Rename to what the value is (e.g. `variable_bag`). Hoist per D20. |
| D22 | Hygiene | Low | `io-id-shape` (AP-66) | workflow-design/techniques/impact-analysis.md:16 (`impact_analysis_path`), pattern-analysis.md:24 (`pattern_analysis_path` beside `pattern_analysis`), scope-definition.md:28 (`scope_manifest_path`), audit-rule-enforcement.md:28 (`enforcement_findings_path`) | Representation-proxy `-path` ids. The twin workflow-authoring/…/impact-analysis.md:30 declares the canonical `impact_analysis` carrying `#### artifact`. | pre-existing | Rename to the canonical value id, as the twin does. |
| D23 | Hygiene | Low | `constraint-as-blockquote` (AP-59) | meta/techniques/workflow-engine/present-checkpoint-to-user.md:30 (Protocol 1) | "If this returns `no active checkpoint on session`, … re-check …" is an error path inside the step sentence. | pre-existing | Move it to a `>` note. |
| D24 | Hygiene | Low | `constraint-as-blockquote` (AP-59) | workflow-design/techniques/impact-analysis.md:40; workflow-authoring/techniques/workflow-definition/impact-analysis.md:54 (Protocol 3) | "When / Where activities are added, removed, or reordered: verify …" is a caveat inside the step sentence. The PR renamed the heading only. | pre-existing | Move the condition to a `>` note under the verify instruction. |
| D25 | Hygiene | Low | `constraint-as-blockquote` (AP-59) | workflow-design/techniques/audit-rule-enforcement.md:41 (Protocol 2) | "(and technique `## Rules` when the entry's scope implies)" | pre-existing | Move it to a `>` note. |
| D26 | Hygiene | Low | `bind-protocol-locals` (AP-62 b) | workflow-design/techniques/scope-definition.md:57 (Protocol 6) | "Persist `{scope_manifest}` together with `{$structural_design}` and `{$drafting_order}`" (reads carry `$`) | pre-existing | Read them as `{structural_design}` and `{drafting_order}`. |
| D27 | Hygiene | Low | `backtick-code-tokens` (AP-63) | work-packages/README.md:69, 184, 193, 213 | Bare filenames `START-HERE.md` and `README.md` in prose and table cells | pre-existing | Wrap each in a code span. |
| D28 | Hygiene | Low | `backtick-code-tokens` (AP-63) | canon/resources/schema-construct-inventory.md:23, 159, 217, 257, 315 (headings) | Bare `activity.schema.json`, `workflow.schema.json`, `routine.schema.json`, `technique.schema.json`, `condition.schema.json` | pre-existing | Wrap in code spans. Anchors are unchanged. |
| D29 | Hygiene | Low | `collection-id-shape` (AP-65) | meta/routines/activity-loop.yaml:104, 114, 137 | `branch_list` has a `*_list` suffix. | pre-existing | Rename to the plural item noun at its fan owner and here. |
| D30 | Hygiene | Low | `technique-stage-agnostic` (AP-68) | workflow-design/techniques/TECHNIQUE.md:70 (`canonical-home-map`) | "enforces the map at the end of `scope-and-draft`" (names an activity locus) | pre-existing | Drop the stage clause. |
| D31 | Hygiene | Low | Entry identity (overview) | canon/resources/schema-construct-inventory.md:37, 43, 103, 109, 133, 139, 151, 179, 185, 191, 271, 277, 283, 289, 295, 301, 313 | Entries are cited by number, e.g. "[AP-15. procedure-in-protocol](…)". The rule is "Cite the kebab name in backticks. Do not cite the number." | pre-existing | Cite `procedure-in-protocol` and the rest by kebab name only. |

No finding was raised at High. D1 was weighed at High, because the entry fires on the contract the change ships and the drift crosses five leaves. It was set at Medium because resume-from-checkpoint's Protocol reads `exit` from the `resume_checkpoint` response itself (engine src/tools/workflow-tools.ts:2636-2679), so the stale "Variable updates" descriptions mislead no step into a wrong action.

The following were walked and not flagged, as sibling convention or a carve-out:
- `no-sequence-in-description` on the specimen workflow and activity descriptions: github-library-conformance and gitnexus-area-comprehension 03-stale-graph-case carry the same form.
- `readme-orients-not-transcribes` on the specimen README: namespace-conformance and routine-conformance carry the same form.
- `techniques-list-disjoint` on 01-probe: the entry `hygiene-probe::local-marker` resolves to a rule, not the step-bound technique (src/schema/common.ts:14).
- `no-duplicate-technique-steps` on 02-gate-exit: none of classes (a), (b) or (c) holds.
- `paren-invocation-args` in resume-worker: the backticked `name: value` form is the meta engine convention.
- `dotted-rule-address` for bare `variable-mutation-source` and `gate-evaluation`: both are in-library, which a static walk cannot disprove.
- `no-tool-usage-prescription` and `no-delivery-mechanism-narration` in engine techniques: engine carve-out.
- A scripted sweep found no unescaped `$`, no unbackticked `{id}` and no redundant link label outside the catalogue's own exemplars.

## Files

- corpus-schema-hygiene/corpus/README.md: read
- corpus-schema-hygiene/corpus/canon/resources/anti-patterns.md: read
- corpus-schema-hygiene/corpus/canon/resources/design-principles.md: read
- corpus-schema-hygiene/corpus/canon/resources/schema-construct-inventory.md: read
- corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md: read
- corpus-schema-hygiene/corpus/meta/README.md: read
- corpus-schema-hygiene/corpus/meta/activities/README.md: read
- corpus-schema-hygiene/corpus/meta/activities/patterns/README.md: read
- corpus-schema-hygiene/corpus/meta/resources/README.md: read
- corpus-schema-hygiene/corpus/meta/resources/workflow-canonical.md: read
- corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/take-activity.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md: read
- corpus-schema-hygiene/corpus/ponytail/activities/README.md: read
- corpus-schema-hygiene/corpus/prism-audit/README.md: read
- corpus-schema-hygiene/corpus/prism-audit/activities/README.md: read
- corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md: read
- corpus-schema-hygiene/corpus/work-package/activities/README.md: read
- corpus-schema-hygiene/corpus/work-packages/README.md: read
- corpus-schema-hygiene/corpus/workflow-authoring/resources/elicitation-guide.md: read
- corpus-schema-hygiene/corpus/workflow-authoring/resources/update-mode-guide.md: read
- corpus-schema-hygiene/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md: read
- corpus-schema-hygiene/corpus/workflow-design/README.md: read
- corpus-schema-hygiene/corpus/workflow-design/activities/05-impact-analysis.yaml: read
- corpus-schema-hygiene/corpus/workflow-design/activities/README.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/design-assumptions.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/elicitation-guide.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/format-conventions.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/impact-analysis.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/pattern-analysis.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/structural-inventory.md: read
- corpus-schema-hygiene/corpus/workflow-design/resources/update-mode-guide.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/TECHNIQUE.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/impact-analysis.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/pattern-analysis.md: read
- corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md: read
- corpus-schema-hygiene/docs/README.md: read
- corpus-schema-hygiene/corpus/meta/routines/activity-loop.yaml: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md: read
- corpus-schema-hygiene/corpus/meta/techniques/agent-conduct.md: read
- corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md: read
- specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml: read
- specimen-schema-hygiene/walks/roster.json: read
