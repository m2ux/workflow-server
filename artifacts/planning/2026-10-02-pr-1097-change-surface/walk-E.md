# Walk E — specimen slice

Tree: `.worktrees/workflow/i10-integrate`. Base: `.worktrees/workflow/pr-1097-base` (present; no `git show` fallback). Canon read on that tree: `corpus/canon/resources/design-principles.md`, `convention-conformance.md` (`## Reference Conventions`), and the anti-pattern entries cited below. Assumptions-review and contract-join are absent on the base, so every construct there is `diff`. Area and index-refresh files differ; a construct whose text is already at the base is `pre-existing`.

Paths below are under `corpus/specimens/`. Kinds: `workflow.yaml` workflow; `activities/*.yaml` activity; `techniques/*.md` technique; `resources/*.md` resource; `README.md` readme; `resources/README.md` readme.

## Files read

28.

- `gitnexus-area-comprehension-conformance/README.md`
- `gitnexus-area-comprehension-conformance/workflow.yaml`
- `gitnexus-area-comprehension-conformance/activities/01-positive-case.yaml`
- `gitnexus-area-comprehension-conformance/activities/02-negative-case.yaml`
- `gitnexus-area-comprehension-conformance/activities/03-stale-graph-case.yaml`
- `gitnexus-index-refresh-conformance/workflow.yaml`
- `work-package-assumptions-review-conformance/README.md`
- `work-package-assumptions-review-conformance/workflow.yaml`
- `work-package-assumptions-review-conformance/activities/01-take-case.yaml`
- `work-package-assumptions-review-conformance/activities/02-record-case.yaml`
- `work-package-assumptions-review-conformance/activities/03-report-cases.yaml`
- `work-package-assumptions-review-conformance/resources/README.md`
- `work-package-assumptions-review-conformance/resources/assumptions-case-report.md`
- `work-package-assumptions-review-conformance/techniques/record-case.md`
- `work-package-assumptions-review-conformance/techniques/report-cases.md`
- `work-package-contract-join-conformance/README.md`
- `work-package-contract-join-conformance/workflow.yaml`
- `work-package-contract-join-conformance/activities/01-take-case.yaml`
- `work-package-contract-join-conformance/activities/02-prepare-join.yaml`
- `work-package-contract-join-conformance/activities/03-implementation-join.yaml`
- `work-package-contract-join-conformance/activities/04-record-case.yaml`
- `work-package-contract-join-conformance/activities/05-report-cases.yaml`
- `work-package-contract-join-conformance/resources/README.md`
- `work-package-contract-join-conformance/resources/contract-join-case-report.md`
- `work-package-contract-join-conformance/techniques/merge-contract-tests-stub.md`
- `work-package-contract-join-conformance/techniques/record-case.md`
- `work-package-contract-join-conformance/techniques/report-cases.md`
- `work-package-contract-join-conformance/techniques/run-contract-tests-stub.md`

## Unread

0. No assigned path left unread. Files in these specimens that are not in the assigned list were not opened.

## Not applicable

None. Every unit's Fires-on meets at least one read file (`workflow`, `activity`, `technique`, `resource`, `readme`, or `*`).

## Evidence

Entry-major. A clean line names the field checked. A finding line is the table row.

### Principles

- **1. Workflows Ossify Patterns** — workflow, activity, technique. Each workflow `graph` binds the case activities; area and index bind `routine: gitnexus::…`; join and assumptions keep the case loop in `exits` + `graph`. Techniques stay free of activity ids. clean. Quote: area `graph.positive-case.comprehended: negative-case`.
- **2. Internalize Before Producing** — all 28. clean. Files use the specimen shape (NN-activity, kebab technique, semver). No session record of a skipped read.
- **3. Define Complete Scope Before Execution** — all 28. clean. No scope manifest or done claim in the files.
- **4. Clarify Before Assuming** — all 28. clean. No agent choice among interpretations.
- **5. Maximize Schema Expressiveness** — workflow, activity, technique. Findings where description restates structure are E21 (`no-sequence-in-description`) and the AP-41 rows. Remaining prose states the case. clean on techniques' `## Capability` product lines except E17.
- **6. One Authoritative Home** — all 28. Second homes are E11–E13 (`bind-site-is-orchestration-truth`) and E15 (`value-set-in-prose`). Elsewhere one statement.
- **7. Convention Over Invention** — all 28. clean. Ids and filenames match the reference table (see CV).
- **8. Confirm Before Irreversible Changes** — all 28. clean. No irreversible user-env mutation.
- **9. Encode Constraints as Structure** — activity steps/exits; no workflow, activity, or technique `rules` blocks. clean. Join gates are `kind: checkpoint` and `action: validate`; case order is `when` on `case_index`.
- **10. Non-Destructive Updates** — all 28. clean. Area diff drops `repo_name` binds; README states the kept outcome (`repo_name` stays unbound; the run resolves the graph from the tree path).
- **11. Complete Documentation Structure** — readmes. clean. Each readme opens with a purpose sentence and a table or filename map. Quote: assumptions resources README "One guide, for the one document a run leaves behind."
- **12. Output Economy** — technique outputs, activity steps, resources. clean. One artifact each, `#### audience` `human`. Checkpoints state the failure subject. Resources are one template plus rules.
- **13. Separate Contract from Procedure** — technique I/O, protocol, rules. E16 is the procedure sentence. Other I/O is meaning or recognition ("True only when `{case_kind}` is `pass`"). Protocol bullets are the work. No technique `## Rules`.
- **14. Single Source of Truth** — workflow variables, activity steps, technique inputs. clean. `case_index` / `case_kind` / `is_review_mode` are written together and read as distinct facts. `contract_tests_passed` is not a pure projection of `case_kind` (accept sets it true while `case_kind` stays `dispute`).
- **15. Phase by Sequenced Outcome** — technique protocol. clean. Each protocol is one `### N. Title` whose bullets are one write or one emit. Quote: assumptions `record-case.md` `### 1. Record Outcome` one bullet.
- **16. Distinguish Designators from Parameters** — technique protocol. clean. Values are `{id}`; no parenthetical technique args.
- **17. Document in Positive Present** — workflow description, activity description, outcome, option text, readme. Same spellings as E6–E10 (`avoidance-voice-in-definitions`). Other description and outcome lines are declarative present. Quote, clean: positive-case `description` "Refer to the area comprehension over a concept the graph's flows rank into."
- **18. Prefer Shared Capability** — activity steps, workflow techniques, technique. clean. `variable-binding` is `techniques.activity` on all four workflows. Area stale case binds `conformance::prepare-stale-fixture`. Join stubs are the local stand-in the shared merge/run cannot absorb (scripted pass/fail).
- **19. Name Symbols Affirmatively** — technique I/O, workflow variables, activity variables. E18 is the `_paths` proxy. Booleans are predicates (`contract_tests_passed`, `is_review_mode`, `stealth_mode`, `has_deferred_assumptions`, `needs_comprehension`). Collections are plural (`case_outcomes`, `contract_test_failures`).
- **20. Keep Orchestration in Structure** — activity steps/exits, workflow graph, technique capability/protocol. clean. Gates and the case cycle sit on activities and `graph`. Techniques do not name activities or checkpoints.
- **21. Match the Harness Surface** — technique, resource, readme. clean. No harness tool name or return-shape claim.
- **22. Modular Over Inline** — workflow, activity, technique, resource. clean. Each construct is its own file; parents bind by id or path.
- **23. Close the Loop** — all 28. clean. No recommendation left unimplemented.
- **24. Keep Session Interaction in Activities** — technique, activity steps. clean. User text is checkpoint `message` / `options` and one `action: message` on the join. Techniques do not present to a session.
- **25. Bind Sibling Techniques as Steps** — activity steps, technique protocol. clean. Each technique is its own step (`merge-contract-tests`, `run-contract-tests`, `record`, `report`). Protocol does not `Apply` another technique.
- **26. A Technique Is a Reading** — technique capability/protocol/inputs, activity steps. clean. Stubs state the scripted reading (green only on `pass`; merged path list). Record/report assemble the case row. They are not a bare tool leaflet.
- **27. State Contract Contribution** — technique capability/protocol/inputs/outputs. No container `TECHNIQUE.md`. clean. Leaf capabilities name the product (mode-branch excess is E17).
- **28. Creation Guide for Generated Documents** — resource, technique protocol. clean. Both reports have `## Template` and `## Rules`. Assumptions protocol cites `#template` and `#rules`. Join output cites `#template`; protocol orders the persist without a second layout. Filename maps sit on both resources READMEs.
- **29. Cite Resource Policy; Do Not Restate It** — resource, technique protocol. clean. Assumptions protocol cites the rules section. Resource rules are the fill constraints, not a restated protocol.
- **30. Resources Stay Abstract** — resource, technique, activity. clean. Templates use placeholders (`{the steps, in order}`, `pass/rework/dispute`). Concrete artifact filenames live on `#### artifact`.
- **31. Isolate Conditional Branches as Notes** — technique protocol. clean. No `when` / `if` / `otherwise` inside a protocol bullet. Recognition conditions sit on Outputs.
- **32. Cite Resources at Section Grain** — technique, activity, resource, readme. clean. Cites use `#template` or `#rules`. Readme links are whole-file orientation (`case-report.md`, `assumptions-case-report.md`).
- **33. Pre-Session Prose Stands Alone** — resource. clean. These guides are session artifacts, not the `discover` bootstrap. Quote: assumptions resource H1 "Assumptions Case Report Guide".
- **34. Edit the Owner** — all 28. Coupled restatements are E11–E13 and E15. No other duplicated criteria set.
- **35. Prefer Removing the Thing That Needs a Prohibition** — all 28. clean. Resource rules state the row invariant and its failure mode; they do not police a second path.
- **36. A Technique Names Only What Its Reader Holds** — technique. clean. No foreign technique or rule slug. Resource cites are the attached guide.
- **37. An I/O Contract Names the Value** — technique inputs/outputs. clean. Slots say what the value is ("Whether the suite passed", "Outcomes so far"). No caller technique or activity link. E16 is the extra duty sentence, recorded under AP-119.
- **38. A Relocation Records the Outcome It Keeps** — activity steps/exits, technique. clean. Area base had `repo_name` output maps and stale-graph step `address-graph` (`set` `repo_name`). Those are gone. README records the kept outcome: "the optional `repo_name` output stays local unless a site binds it" and "the nested area-comprehension resolves that graph from the tree path." The routine bind remains.
- **39. A Phase Heading Names the Outcome** — technique protocol. finding E20 on four one-word headings. clean: assumptions `### 1. Record Outcome`, `### 1. Write Report`.
- **40. Fan-Out Lives at the Layer That Runs the Work** — workflow graph, activity steps, technique. clean. The case cycle is a graph edge (`more-cases` → `take-case`), not a technique fan-out. No `forEach`.
- **41. A Phase States Answers the Tool Has Returned** — technique protocol. clean. No tool-response branch. Stubs emit declared ids.
- **42. A Routine Holds the Codified Path** — technique, activity. clean. Area and index activities bind `gitnexus::area-comprehension` and the index workflow's graph is the case sequence around that class of run. Local techniques are the readings (record, report, stubs), not a second copy of the routine.
- **43. A Workflow Borrows Activities** — `workflow.activities`. assumptions `activities: [work-package/07-assumptions-review.yaml]` matches `<workflow>/[activities/]…/NN-<id>.yaml` (`activities/` optional). clean. Area, index, and join have no `activities` key. The borrowed file was not opened.
- **44. A Resource Splits for Section Delivery** — resource. clean. Two sections, `## Template` and `## Rules`, each an anchor.
- **45. A Rule States One Invariant** — technique rules. Field absent on all six techniques. clean.
- **46. A Consumer Binds the Contract** — technique, activity, workflow. clean. Steps bind technique ids; routine steps pass `with` and `outputs`. Assumptions graph names the borrowed activity id `assumptions-review`.
- **47. A Calibrated Surface Extends by Wrapping** — technique, resource. clean. No schema or measured prompt being extended. Stubs wrap the join's merge and run for the specimen.

### Convention

- **Reference Conventions** — workflow, activity, technique, resource. clean. Activities `NN-name.yaml` (`id`, `version`, `name`, `description`). Techniques kebab `.md` with Capability / Inputs / Outputs / Protocol, Rules omitted. Resources kebab `.md`. Versions `X.Y.Z`. Exits use `id` / `when` / `isDefault` / `immediate` and are bound in `graph`. Join checkpoints are inline `kind: checkpoint`.

### Anti-patterns

- **AP-01 no-inline-content** — activity, technique, resource. clean. No inlined body. Binds are ids and paths.
- **AP-02 schema-is-constraint** — workflow, activity, technique. clean. No invented fields. Keys used are schema keys (`with`, `outputs`, `values`, `reads`, `writes`).
- **AP-03 no-partial-implementation** — all 28. clean. No commit, handoff, or done claim.
- **AP-04 no-invented-naming** — all 28. clean. Specimen ids, `case_index`, `case_kind`, and rule slugs `the-review-mark-is-an-absent-gate`, `a-row-names-the-log-it-read`, `a-row-names-the-exit-the-join-took` follow existing kebab / snake.
- **AP-05 atomic-checkpoints** — join `03-implementation-join.yaml` steps. clean. `contract-test-disposition` (rework vs dispute) and `contract-ambiguity` (revise implementation, revise tests, accept) are separate checkpoints. Other activities have no checkpoint.
- **AP-06 no-assumption-execution** — all 28. clean. No agent intent choice.
- **AP-07 scope-reverify-completion** — all 28. clean. No done claim.
- **AP-08 one-question-per-message** — all 28. clean. Join messages are statements with no `?`. No stacked questions.
- **AP-09 checkpoint-not-prose** — activity description/steps, technique protocol. clean. The join's two decisions are `kind: checkpoint`. Descriptions do not say ask or confirm.
- **AP-10 loop-not-prose** — activity description/steps, technique protocol. clean. Repeat is the graph edge `more-cases`, not prose. No "for each" instruction without a loop step.
- **AP-11 decision-not-prose** — activity description/exits, workflow graph. clean. Join exits `needs-rework`, `needs-contract-tests`, `done` match option `effect.exit` and `mark-done-exit`. Area exits `comprehended` match the graph.
- **AP-12 artifact-not-buried** — activity description, technique capability/protocol/outputs. clean. Both report techniques declare `#### artifact`. Record techniques do not claim a file.
- **AP-13 variable-for-approval** — activity description/steps/variables, workflow variables. clean. No prose "remember approval". Join accept uses `setVariable`.
- **AP-14 mode-as-state** — rules, variables, steps, exits. clean. `is_review_mode` and `case_kind` are variables with `values` on the join workflow. No mode skip that exists only as a rule.
- **AP-15 procedure-in-protocol** — activity steps. clean. No step `description`. Bound steps are id + technique or routine.
- **AP-16 technique-inputs-declared** — technique capability/inputs/protocol. finding E14. Other named values are declared (`case_kind`, `case_outcomes`, `assumptions_log`, `has_deferred_assumptions`, `is_review_mode`, `contract_tests_passed`, `join_exit`).
- **AP-17 bound-step-no-description** — activity steps. clean. Technique and action steps carry `kind`, `id`, `technique` or `actions`, and `when` only.
- **AP-18 no-monolith-masking-steps** — activity steps. clean. Join merge and run bind different techniques. Take-case steps differ by `when` and `value`.
- **AP-19 no-rule-protocol-restatement** — rules, technique protocol. No rules blocks. clean.
- **AP-20 rule-group-disambiguation** — rules. Field absent. clean.
- **AP-21 grouped-rule-keys** — rules. Field absent. clean.
- **AP-22 single-rule-authority** — rules. Field absent. clean.
- **AP-23 worker-rule-reach** — workflow.rules.workflow, activity rules, technique rules. Field absent. clean.
- **AP-24 no-contradictory-rules** — rules. Field absent. clean.
- **AP-25 no-one-step-rules** — technique rules/protocol. No rules. Protocol bullets are the phase's work, not a one-step rule. clean.
- **AP-26 no-rationale-in-description** — descriptions, messages, option text, protocol, rules. clean. Option text states the classification ("The failing assertions are Contract failures."). Validate message is the cause only: "Contract tests did not fail against the base tree." Sequence restatement is E21, not a why-clause.
- **AP-27 validate-message-economy** — join `confirm-base-failures` message. clean. One cause sentence, no consequence essay.
- **AP-28 no-sequence-in-description** — finding E21. Workflow descriptions name what each case measures; that text is not in `graph`. clean there. Quote: area `description` "Hold the gitnexus area-comprehension run to three cases."
- **AP-29 no-user-env-mutation** — descriptions, messages, protocol, options. clean. No global git/gh config or package install.
- **AP-30 role-rules-not-description** — descriptions, variables, rules. clean. No MUST / orchestrator / worker prescription.
- **AP-31 no-hand-authored-artifacts** — activity, technique outputs. clean. No activity `artifacts[]`.
- **AP-32 outcome-names-value** — activity outcome. clean. Outcomes name the delivered fact. Quote: assumptions take-case "Whether the next case is a review run". Join report "which case was walked, whether the suite passed, and the exit it took".
- **AP-33 no-set-of-technique-output** — steps technique/actions, technique outputs. clean. No `set` whose target is a bound technique's product. Accept `setVariable` is on a checkpoint, not on the run step.
- **AP-34 no-valueless-control-set** — activity actions. clean. Every `set` has `value:`.
- **AP-35 no-intra-step-input-set** — technique inputs, actions. clean. No step both sets a variable and interpolates it as an input.
- **AP-36 techniques-list-disjoint** — activity techniques, step technique. clean. No activity-level `techniques[]`.
- **AP-37 rule-audience-bucket** — workflow rules buckets. Field absent on all four workflows. clean.
- **AP-38 no-duplicate-technique-steps** — step technique. clean. No technique id bound twice in one activity.
- **AP-39 hoist-universal-techniques** — activity techniques, workflow techniques.activity. clean. `variable-binding` is only under `techniques.activity`.
- **AP-40 readme-orients-not-transcribes** — readmes. clean. Tables are activity name + one-line role, or resource id + purpose, or bare filename → guide. No steps, exits, variables, rules, or `resources/<id>.md` loader HOW. Pass inventories are E11–E13.
- **AP-41 avoidance-voice-in-definitions** — findings E6–E10. Other definition prose states current behaviour. Resource rules name the bad row as the failure mode of the invariant, not a prior design.
- **AP-42 io-agnostic-contract** — technique inputs/outputs. clean. No "from [technique]" or activity path.
- **AP-43 canonical-artifact-ids** — technique protocol/inputs/outputs. clean. Protocol uses `{id}`. Filenames are on `#### artifact` only. E18 covers the `_paths` id under AP-66.
- **AP-44 artifact-name-in-io** — technique protocol/inputs/outputs. clean. Protocol does not name `work-package-*-cases.md`. The merge output description `` `["tests/contract/t1.test.ts"]` `` is the stub's shape example, not a protocol filename.
- **AP-45 no-opaque-artifact-path-array** — technique inputs/protocol. clean. Nothing consumes a `*-paths` array. The merge output is produced, not consumed.
- **AP-46 no-resource-caller-backlink** — resources. clean. No "produced by", "Used by", or `Outputs:` header. Filenames inside the template fence and the guide's own artifact name are the carve-out. Quote: contract resource `description` "Case report for the contract-join conformance specimen."
- **AP-47 no-redundant-link-label** — all 28. clean. Links are `[prepare-stale-fixture](…)`, `[case report](…)`, `[Template](…#template)`, `[assumptions-case-report](…)`. No `word ([same-word](url))`.
- **AP-48 brace-output-references** — technique protocol. clean. Protocol names `{case_outcomes}`, `{assumptions_review_case_report}`, `{contract_tests_merged_paths}`, `{contract_tests_passed}`, `{contract_test_failures}`. No "the output".
- **AP-49 no-delivery-mechanism-narration** — technique protocol. clean. No `_resources` or `get_technique` delivery prose.
- **AP-50 no-tool-usage-prescription** — technique capability/protocol, resource. clean. No `get_resource` / `get_activity` / `get_workflow` call recipe.
- **AP-51 canonical-technique-reference** — technique protocol. clean. No raw harness tool where a technique wraps it.
- **AP-52 brace-declared-ids** — technique protocol/capability. clean. Declared ids in protocol are braced. Capability lines do not spell a bag id.
- **AP-53 dotted-rule-address** — technique protocol. clean. Protocol does not cite a rule. Assumptions cites the resource `#rules` anchor, not a dotted rule.
- **AP-54 anchored-protocol-references** — technique protocol. clean. I/O is `{id}`; the guide is a `#` link.
- **AP-55 hoist-shared-inputs** — technique inputs. clean. No repeated input across a container. Six leaves, no group `TECHNIQUE.md`. `case_outcomes` and `case_kind` recur on different specimens, not one container.
- **AP-56 paren-invocation-args** — technique protocol. clean. No `::op {arg}` and no bare argument name.
- **AP-57 escape-literal-dollar** — all 28. clean. No unescaped `$`.
- **AP-58 snake-case-symbols** — technique I/O/protocol, resource. clean. Symbol ids are `snake_case`. Rule slugs and filenames stay kebab.
- **AP-59 constraint-as-blockquote** — technique protocol. clean. No indented caveat sub-bullet and no if/otherwise clause in a step sentence.
- **AP-60 local-rule-as-note** — technique rules/protocol. No rules. clean.
- **AP-61 factor-repeated-paths** — technique. clean. No repeated filesystem literal. `{planning_folder_path}` appears once per report technique.
- **AP-62 bind-protocol-locals** — technique protocol/inputs/outputs. `{planning_folder_path}` is the E14 gap (not a declared I/O, and not the ambient pair `{target_path}` / `{branch_name}`). Same construct and fix as E14; not a second row. Other `{id}` tokens are declared on that technique. No dead `{$name}`.
- **AP-63 backtick-code-tokens** — all 28. clean. Designators, filenames, and `/tmp` sit in code spans or fences. YAML `defaultValue` is the binding scalar, not rendered prose.
- **AP-64 boolean-id-shape** — technique I/O, workflow/activity variables. clean. Affirmative predicates, no `_flag` / `_status` / `not_` stem.
- **AP-65 collection-id-shape** — same fields. clean. Plurals and no `_list` / `_array` suffix.
- **AP-66 io-id-shape** — technique inputs/outputs. finding E18. Other ids are not direction words or bare generics. `case_outcomes` is an input and output pass-through.
- **AP-67 rule-slug-shape** — technique rules. Field absent. Resource slugs are not this field.
- **AP-68 technique-stage-agnostic** — technique capability/protocol. clean. No activity, checkpoint, or "before the next step".
- **AP-69 no-activity-prose-rules** — activity rules. Field absent on every activity. clean.
- **AP-70 capability-group-placement** — technique, workflow techniques. clean. Stubs and record/report sit in the specimen that exercises them. `variable-binding` is the shared strategy, not a client-local primitive.
- **AP-71 no-false-resource-delivery** — technique, resource, readme. clean. No claim about a tool payload.
- **AP-72 complete-bootstrap-path** — technique, resource. clean. Not a bootstrap sequence.
- **AP-73 consistent-tool-names** — technique, resource, readme. clean. No harness tool names.
- **AP-74 no-duplicated-guidance** — technique, resource. clean. Record/report pairs differ by specimen subject. No copied checklist.
- **AP-75 describe-tool-value** — technique, resource. clean. Not an engine/bootstrap surface.
- **AP-76 no-redundant-tools** — technique, resource. clean. No tool subset recommendation.
- **AP-77 impl-before-confirmed-approach** — all 28. clean. No approach-confirmation session.
- **AP-78 follow-through-on-recommend** — all 28. clean. No recommendation deliverable.
- **AP-79 structure-backed-constraints** — rules, steps, exits. No critical rule left as text only. Join validate and checkpoints are the gates. clean.
- **AP-80 preserve-readme-content** — readmes. clean. Area README edits replace the `repo_name` address paragraph with the unbound-output paragraph; they do not shrink orientation away. Assumptions and join readmes are new.
- **AP-81 verify-format-literacy** — workflow, technique, resource. clean as a definition property: files follow the sections and keys the convention table names. Guard execution was not run in this slice.
- **AP-82 work-through-activities** — workflow activities/graph. clean. Graphs close at `report-cases` → `__terminal__`. No prose tells a worker to finish outside the graph.
- **AP-83 accept-correction** — all 28. clean. No correction dispute.
- **AP-84 single-closeout-artifact** — resource, readme. clean. One case-report resource per specimen. Readmes do not restate a close-out footer.
- **AP-85 link-dont-copy-sections** — resource. clean. Templates are the case-report skeleton, not a copy of another artifact's sections.
- **AP-86 exception-only-verdict-tables** — resource. clean. Case tables are per-case results (yes/no, exit), not an all-pass verdict grid.
- **AP-87 omit-null-sections** — resource, activity steps. clean. No "None" / "N/A" headed section. Checkpoints appear only when `contract_tests_passed != true`.
- **AP-88 one-decision-one-checkpoint** — join checkpoints. clean. The second checkpoint's options (revise implementation, revise tests, accept) are not a subset of the first (rework vs dispute).
- **AP-89 checkpoint-requires-decision** — join checkpoints. clean. Options exit differently or set `contract_tests_passed`. No acknowledge-only option and no `autoAdvanceMs`.
- **AP-90 no-guide-wrapper-ceremony** — resource. clean. Template plus operative rules. No Purpose restatement, Good/Bad pair, or quality checklist.
- **AP-91 lifecycle-row-update** — resource. clean. One row per case, no per-stage appended block, no scorecard.
- **AP-92 resource-fills-not-does** — resource. clean. Rules constrain the row ("Each Outcomes cell is read from the log the case left"). No "after each phase" cadence.
- **AP-93 canonical-fact-home** — resource. clean. Each specimen has one template. No second template mandating the same fact category.
- **AP-94 link-only-input-slots** — resource. clean. Slots are the case row's own cells, not a summary of another document.
- **AP-95 enforce-output-discipline** — workflow rules, technique rules, resource. clean. Fill rules are the guide. No output-discipline ruleset claiming a verify technique.
- **AP-96 artifact-audience-declared** — technique outputs. clean. Both artifacts declare `#### audience` `human`.
- **AP-97 link-named-artifacts** — checkpoint and action messages. clean. Messages interpolate `{contract_test_failures}` and `{contract_tests_merged_paths}`. No durable filename and no `NN-` prefix.
- **AP-98 no-next-step-narration** — messages, option descriptions. clean. No auto-advance or "next activity" narration. E19 is actor narration, not routing.
- **AP-99 statement-not-question** — checkpoint messages. clean. "Specimen join — contract tests failed against the implementation:" and "Specimen join — a contract test is disputed." No trailing `?`.
- **AP-100 runtime-rules-only** — rules. Field absent. clean.
- **AP-101 no-caption-only-message** — checkpoint messages. clean. Messages carry the failure subject and `{contract_test_failures}`.
- **AP-102 no-technique-resource-dual-home** — technique, resource. clean. Criteria stay in the resource rules. Protocol cites them or fills the template; it does not restate the detect list.
- **AP-103 cited-home-owns-claim** — technique, resource, readme. clean for cites whose target was opened. Assumptions protocol cites `#template` and `#rules`, both present in `assumptions-case-report.md`. Join output cites `#template`, present in `contract-join-case-report.md`. Area README cites `prepare-stale-fixture` and `case-report`; those targets are outside this slice and were not opened, so their claim ownership is not asserted.
- **AP-104 operative-criteria-need-a-home** — technique protocol, resource. clean. Criteria live under resource `## Rules`, not only in a protocol.
- **AP-105 no-shadow-audit-pass** — technique protocol. clean. No compressed catalog walk.
- **AP-106 canon-layer-cites-not-restates** — resource, readme. clean. Not an upper canon layer.
- **AP-107 bind-site-is-orchestration-truth** — findings E11–E13. Activity YAML and workflow `graph` do not carry a second ordered list. clean on those fields.
- **AP-108 numbered-protocol-phases** — technique protocol. clean. Two-bullet write phases are how-to for one persist (fill the row, write the file), which the entry does not flag. Single-bullet phases are one phase.
- **AP-109 technique-outputs-declared** — technique capability/protocol/outputs. clean. Emitted ids are declared: `case_outcomes`, `assumptions_review_case_report`, `contract_join_case_report`, `contract_tests_merged_paths`, `contract_tests_passed`, `contract_test_failures`.
- **AP-110 duplicate-shared-capability** — technique protocol. clean. No local Task/fan-out recipe. Stubs do not re-teach merge or test execution.
- **AP-111 contract-not-procedure** — technique protocol/outputs. clean. Protocol does not restate a decision tree for an output. "True only when `{case_kind}` is `pass`" is recognition on the output, which the entry allows. No boolean-projection phase.
- **AP-112 no-derived-state-shadow** — workflow variables. clean. `is_review_mode` is set with `case_index`, not declared as true iff `case_index` equals a constant. `contract_tests_passed` can be true while `case_kind` is `dispute`.
- **AP-113 session-interaction-in-technique** — technique capability/protocol. clean. No present/show/narrate to a user.
- **AP-114 pass-orchestration-in-technique** — technique capability/protocol. clean. No `Apply` or `::` of another technique.
- **AP-115 platform-semantics-in-capability** — technique capability, readme. clean. No inherit/merge lecture. No container `TECHNIQUE.md`.
- **AP-116 no-template-creation-guide** — technique protocol, resource. clean. See principle 28. Protocol does not embed a competing table.
- **AP-117 no-engine-mechanics-as-rules** — rules, technique protocol. No rules. Protocol does not restate bag or dispatch mechanics. clean.
- **AP-118 no-bind-mechanics-as-prose** — I/O, capability, protocol, readme, option text. clean. Protocol consumes `{id}`. It does not tell the agent how to resolve an unbound slot. E14 is the missing declaration, not a bind recipe.
- **AP-119 procedure-in-io-contract** — finding E16. Other descriptions are meaning, shape, or recognition. Quote, clean: join `record-case.md` output "The list with this case appended: which case was walked, whether the suite passed, and the exit the case took."
- **AP-120 procedure-in-capability** — finding E17. clean: assumptions `record-case.md` "The outcome list with the case just walked appended." Join merge "Stub merge of contract-test files into the implement worktree."
- **AP-121 rule-as-protocol-step** — technique protocol, resource. clean. Every protocol phase emits or writes. Resource rules are not numbered steps.
- **AP-122 prompt-restates-owned-mechanics** — resource, technique. clean. No bundling budget, begin-beat, or yield prose.
- **AP-123 capability-as-op-inventory** — technique capability. clean. Capabilities are one product sentence, not a child-op list.
- **AP-124 alternate-ops-as-protocol-sequence** — technique protocol. clean. Phases are not alternate modes of one op.
- **AP-125 technique-ref-in-io-contract** — technique inputs/outputs. clean. No markdown link to a technique file in an I/O description.
- **AP-126 cut-comment-jsdoc-verbosity** — all 28. clean. No comments or JSDoc.
- **AP-127 no-dense-prose-after-config-examples** — resource, technique, readme. clean. After each template fence, `## Rules` adds a row constraint the fence does not show.
- **AP-128 worktree-root-placeholders** — finding E1. Area workflow defaults are `"{target_path}"`. Other defaults are `.`, `main`, `contract-tests-worktree`, `implement-worktree`. `/tmp` in the area README is the throwaway root, in a code span, not a home directory.
- **AP-129 no-parallel-runbook-when-setup-covers-it** — protocol, readme, resource. clean. No clone/install/build/start runbook.
- **AP-130 variable-description-one-line** — findings E2–E5. Other workflow descriptions are one line naming the value. Quote, clean: assumptions `planning_folder_path` "Path to the session's planning folder."
- **AP-131 bag-value-as-literal** — workflow, activity, technique, resource. clean. Query strings and `workflow-server` appear as `defaultValue`, which the entry does not flag. README repeats of those strings are the case's illustration beside that declaration; the operative bind is the variable. The home path is E1, which the entry points at `worktree-root-placeholders`.
- **AP-132 unproduced-value-read** — activity steps. clean. Gated `set`s (`case_index`, `join_exit`, `is_review_mode`) have `defaultValue`. `contract_tests_passed` is produced by the run step, which has no `when`.
- **AP-133 stale-restatement-after-change** — readme, activity description/outcome, technique capability, resource, on files opened. clean. Area's "sets the address the run works under" is gone from the README and from the three activities. Unopened siblings in these specimens were not searched.
- **AP-134 artifact-name-is-filename** — technique outputs. clean. `work-package-assumptions-review-cases.md` and `work-package-contract-join-cases.md` are one segment each.
- **AP-135 resource-id-names-its-content** — resource. clean. `assumptions-case-report` and `contract-join-case-report` are nouns. Each resources folder has a single resource, so no sibling carries `-guide` or `-template`.
- **AP-136 deployment-path-in-capability** — technique capability. clean. No repo-relative or absolute directory.
- **AP-137 overlapping-rule-scopes** — rules, resource fill rules. Technique/workflow/activity rules absent. Each resource has one rule per row fact (absent gate; log cell; exit taken). clean. No two thresholds on one measure.
- **AP-138 whole-resource-for-one-section** — technique, resource. clean. Cites that name one section use `#template` or `#rules`. No bare cite beside an anchored cite of the same resource.
- **AP-139 tool-contract-restated-in-protocol** — technique protocol. clean. No tool argument schema.
- **AP-140 phase-cited-by-ordinal** — rules, I/O, capability, protocol, resource, readme. clean. No "step N" or "phase N". Headings carry the number; prose does not cite it.
- **AP-141 unowned-harness-capability** — technique. clean. No tool named in two techniques without an output.
- **AP-142 output-without-destination** — technique outputs, activity steps. clean. Report outputs have `#### artifact` and the report activity reads `planning_folder_path` or writes `contract_join_case_report`. `case_outcomes` is read by the report step. Stub outputs are read by later steps (`note-merged-paths`, disposition `message`, record inputs).
- **AP-143 framing-outside-any-section** — resource. clean. Frontmatter, then H1, then `## Template`. No prose before the first heading and no 100-character H1 essay. No anchored citer depends on leading framing.
- **AP-144 declared-input-never-read** — technique inputs/protocol. clean. Every declared id appears braced in that technique's protocol: assumptions record (`is_review_mode`, `assumptions_log`, `has_deferred_assumptions`, `case_outcomes`); both reports (`case_outcomes`); join record (`case_kind`, `contract_tests_passed`, `join_exit`, `case_outcomes`); run stub (`case_kind`).
- **AP-145 apply-omits-declared-input** — technique protocol/inputs. clean. No `Apply` or `::` site.
- **AP-146 branch-on-undeclared-threshold** — protocol, rules, activity steps. clean. No duration, size, or retry threshold. Join `when` compares declared variables (`contract_tests_passed`, `case_index`, `case_kind`, `join_exit`).
- **AP-147 inherited-rules-re-enumerated** — rules. Field absent. clean.
- **AP-148 reference-without-provenance** — technique. clean. Protocol values trace to declared inputs or outputs. No "already returned by".
- **AP-149 pre-session-prose-defers-to-the-framework** — resource. clean. Not the discover bootstrap. Relative links are creation-guide cites inside a session artifact.
- **AP-150 instruction-narrates-an-actor** — finding E19. Technique protocol is imperative to the reader ("Append", "Fill", "Emit", "Write"). README orientation describes the specimen's cases for a reader of the definition; it is not a worker instruction about a second actor. Resource `## Rules` are outside this Fires-on.
- **AP-151 rule-binds-beyond-its-operation** — technique rules. Field absent. clean.
- **AP-152 inherited-input-re-declared** — technique inputs. clean. No group or workflow-root `TECHNIQUE.md` in these four specimens. Nothing to merge.
- **AP-153 schema-semantics-restated** — technique rules/capability, resource. clean. No operator roster, default, or co-declaration lecture.
- **AP-154 engine-internals-narrated** — technique. clean. No server file, seal, or internal module.
- **AP-155 value-set-in-prose** — finding E15. `case_kind` carries `values: [pass, rework, dispute]`; its description also repeats the members, and the detect requires a declaration with no `values`, so it is not flagged. Activity-only enumerations are outside this Fires-on.
- **AP-156 one-invariant-per-rule** — technique rules. Field absent. clean.
- **AP-157 call-omits-conditionally-required-argument** — protocol, rules. clean. No tool-call signature.
- **AP-158 call-omits-required-argument** — protocol, rules. clean. No tool-call signature.
- **AP-159 call-names-an-undeclared-argument** — protocol, rules. clean. No tool-call signature.
- **AP-160 protocol-phase-as-list-item** — technique protocol. clean. Phases are `### N. Title`, not `N.` list entries or bold leads.
- **AP-161 unreachable-operation-reference** — technique capability/protocol. clean. No link or `::` to a technique that is not invoked. `gitnexus::area-comprehension` is an activity `routine:` bind, not technique prose.
- **AP-162 produce-path-without-a-reading** — technique protocol. clean. Stubs state the reading on the output (green only on `pass`; one failure string; the path list). Record/report assemble a case row. None is "call a tool and store the response".
- **AP-163 construct-folder-without-a-readme** — activity, technique, resource. clean by the entry's own wording: "A specimen, fixture, or conformance tree whose purpose is to exercise one construct." Folders measured, not opened beyond the assigned files: area `activities/` holds `01`–`03` plus `04-report-cases.yaml` (not read) and no `README.md`; assumptions and join `activities/` and `techniques/` have no `README.md`; both `resources/` folders have `README.md`. Index-refresh's activity and technique files are outside this slice.
- **AP-164 relocation-without-a-preserved-outcome** — activity steps/exits, technique, rules. clean. Same move as principle 38. The removed construct is an output map and a `set`, not a gate, exit, or rule. The README states what was kept.
- **AP-165 unproducible-declared-value** — technique outputs/protocol. clean. Each output is emitted by that technique's single phase. No later phase reassigns it.

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| E1 | Contract | Medium | AP-128 worktree-root-placeholders | `gitnexus-index-refresh-conformance/workflow.yaml` `variables[positive_repo_path].defaultValue` | `defaultValue: /home/mike1/projects/dev/workflow-server` | pre-existing | Use `{target_path}` so the positive case is not pinned to one home directory. |
| E2 | Hygiene | Low | AP-130 variable-description-one-line | `gitnexus-area-comprehension-conformance/workflow.yaml` `variables` `current_graph_name`, `positive_tree_path`, `negative_tree_path`, `positive_repo_path`, `negative_repo_path`, `negative_search_query`, `stale_graph_search_query` | `current_graph_name`: "which the positive and negative cases resolve from the tree they name, and which the report names as the source of their answers." `negative_search_query`: "so the negative case's query lands no process." | pre-existing | One line naming the value. Drop case, report, and rebuild tails. |
| E3 | Hygiene | Low | AP-130 variable-description-one-line | `gitnexus-index-refresh-conformance/workflow.yaml` `variables` `repo_name`, `positive_graph_name`, `positive_repo_path` | `positive_graph_name`: "which the positive case binds and which the report names as the source of its answers." `positive_repo_path`: "so the positive case's first read finds nothing to rebuild." | pre-existing | One line naming the value. Drop bind, report, and first-read tails. |
| E4 | Hygiene | Low | AP-130 variable-description-one-line | `work-package-assumptions-review-conformance/workflow.yaml` `variables[stealth_mode].description` | "True, so the review posts nothing to an issue tracker." | diff | Name the flag. The default already holds true. |
| E5 | Hygiene | Low | AP-130 variable-description-one-line | `work-package-contract-join-conformance/workflow.yaml` `variables[contract_tests_fail_on_base].description` | "Seeded true — suites already failed on the base tree." | diff | Name the flag. The default already holds true. |
| E6 | Hygiene | Low | AP-41 avoidance-voice-in-definitions | `gitnexus-area-comprehension-conformance/workflow.yaml` `description` | "distinct from an area the graph searched and read" | pre-existing | State the fallback the negative case records. Drop the contrast with a searched area. |
| E7 | Hygiene | Low | AP-41 avoidance-voice-in-definitions | `gitnexus-area-comprehension-conformance/README.md` | "rather than as an area read and found unconnected"; "rather than reading them as taken from a graph that was current from the start" | pre-existing | State what the report records for the empty case and for the rebuilt graph. |
| E8 | Hygiene | Low | AP-41 avoidance-voice-in-definitions | `gitnexus-area-comprehension-conformance/activities/02-negative-case.yaml` `outcome` | "the fallback the run promises rather than a failure" | pre-existing | State the empty contexts and traces as the fallback result. |
| E9 | Hygiene | Low | AP-41 avoidance-voice-in-definitions | `gitnexus-area-comprehension-conformance/activities/03-stale-graph-case.yaml` `outcome` | "distinct from an area read off a graph that was current from the start" | pre-existing | State that the ranked flows come from the graph after the rebuild. |
| E10 | Hygiene | Low | AP-41 avoidance-voice-in-definitions | `gitnexus-index-refresh-conformance/workflow.yaml` `description` | "distinct from a graph that was current all along" | pre-existing | State the recovery: first read true, rebuild, second read. |
| E11 | Hygiene | Low | AP-107 bind-site-is-orchestration-truth | `gitnexus-area-comprehension-conformance/README.md` | "iterates twice — once over the symbols those flows run, reading each one's connections, and once over the flows themselves"; "its steps — a nested run and two per-item passes among them" | pre-existing | Point at `routine: gitnexus::area-comprehension`. Delete the step inventory. |
| E12 | Hygiene | Low | AP-107 bind-site-is-orchestration-truth | `work-package-assumptions-review-conformance/README.md` | "collects the assumptions a change rests on, then settles them through one routine: convergence closes what the agent can resolve, and what stays open is assembled and put to the user at a batch gate" | diff | Point at the borrowed `work-package/07-assumptions-review.yaml`. Keep the one-line role table. |
| E13 | Hygiene | Low | AP-107 bind-site-is-orchestration-truth | `work-package-contract-join-conformance/README.md` | "merge and run against the implementation, then disposition — pass, return to implementer, or dispute"; table row "merge stub, run stub, disposition and ambiguity gates" | diff | Point at `03-implementation-join.yaml` `steps[]`. Keep activity name and one-line role. |
| E14 | Contract | Medium | AP-16 technique-inputs-declared | `work-package-assumptions-review-conformance/techniques/report-cases.md` Protocol; `work-package-contract-join-conformance/techniques/report-cases.md` Protocol | "Write `{assumptions_review_case_report}` to `{planning_folder_path}`." and "Write to `{planning_folder_path}`." Inputs declare only `case_outcomes`. | diff | Declare `planning_folder_path` on `## Inputs`. That also binds the `{planning_folder_path}` local (AP-62). |
| E15 | Contract | Medium | AP-155 value-set-in-prose | `work-package-contract-join-conformance/workflow.yaml` `variables[join_exit].description` | "Exit the join took — done, needs-rework, or needs-contract-tests." No `values`. | diff | Declare `values` for those three exits and leave the description as the exit taken. |
| E16 | Hygiene | Low | AP-119 procedure-in-io-contract | `work-package-assumptions-review-conformance/techniques/record-case.md` output `case_outcomes` | "A review run records the gate and the presentation as absent." | diff | Move that duty into the protocol bullet. Leave the output as the appended list and its fields. |
| E17 | Hygiene | Low | AP-120 procedure-in-capability | `work-package-contract-join-conformance/techniques/run-contract-tests-stub.md` Capability; `record-case.md` Capability; `report-cases.md` Capability; `work-package-assumptions-review-conformance/techniques/report-cases.md` Capability | "green on pass, red otherwise."; "Append this case's contract-test outcome."; "Write the contract-join case report."; "State what the assumptions review settled in each case." | diff | Name the product only. Leave the branch and the write in Protocol or Outputs. |
| E18 | Hygiene | Low | AP-66 io-id-shape | `work-package-contract-join-conformance/techniques/merge-contract-tests-stub.md` output `contract_tests_merged_paths` | Id ends in `_paths`, a representation proxy. | diff | Rename to the plural noun for the merged tests and bind that id from the activity. |
| E19 | Hygiene | Low | AP-150 instruction-narrates-an-actor | `work-package-contract-join-conformance/activities/03-implementation-join.yaml` options `revise-implementation.description`, `revise-tests.description`, `dispute-test.description` | "the implementer reworks the failing tasks"; "the contract-tests branch rewrites them"; "for the user to settle" | diff | Keep the classification ("The Contract holds"). Drop the other actor and the third-person user. |
| E20 | Hygiene | Low | 39. A Phase Heading Names the Outcome | `work-package-contract-join-conformance/techniques/merge-contract-tests-stub.md` `### 1. Merge`; `record-case.md` `### 1. Record`; `run-contract-tests-stub.md` `### 1. Run`; `report-cases.md` `### 1. Write` | One-word headings. The principle asks for two or three words in Title Case. | diff | Name the outcome in two or three words (`Record Outcome`, `Write Report`). |
| E21 | Hygiene | Low | AP-28 no-sequence-in-description | `work-package-contract-join-conformance/activities/01-take-case.yaml` `description`; `03-implementation-join.yaml` `description` | "pass, then rework, then dispute."; "merge and run stubs, then the disposition and ambiguity gates" | diff | Leave "Bind the next disposition case" and "Specimen join". The `when` steps and `steps[]` already hold the order. |

No High rows. Mediums E1, E14, and E15 were re-read from the cited lines and the entry text. E1 is Contract because the case still runs when that home path exists; the contract is not portable. E14 is Contract because the write destination is used and undeclared. E15 is Contract because the exit set lives only in prose.

Bands: Live 0 · Contract 3 · Hygiene 18.
