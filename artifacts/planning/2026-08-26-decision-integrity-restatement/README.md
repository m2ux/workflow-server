# Decision integrity — restatement record

Issue [#400](https://github.com/m2ux/workflow-server/issues/400) was written on 2026-08-02 against a
snapshot of the corpus. This folder records a re-verification of every defect it names, carried out on
2026-08-26 against the `workflows` branch at `0cebc48f` and the server at `origin/main`, and it is the
citation home for the restated issue body. The body carries the finding; this folder carries the
evidence.

Read this alongside the consolidation record at
[2026-08-02-decision-integrity-consolidation](../2026-08-02-decision-integrity-consolidation/), which
holds the two source issues verbatim.

## Why a restatement was needed

The epic named `workflow-design` as the fix site for W1, most of W2, and a third of W3. That workflow
was deprecated on 2026-07-28 in commit `6cae1d88` — five days before the epic was written — in favour
of `workflow-authoring`. Two further defects the epic names had already been fixed before it was
written: the ambiguity-gate output remap landed 2026-07-28 in `cf08a1d9`, and the state and trace
bindings in meta's close-out were dropped 2026-07-30 in `e3fc1625`. The epic's own intake comments
later retargeted W1's version bump at `workflow-authoring` and recorded that "Groups A and B died with
the deprecated workflow-design", but the body was never brought into line.

Roughly half the named defects are gone. Two of the survivors are wider than first recorded, and one —
the timer — is the opposite of what the epic states.

## Verification method

Twelve parallel audits, one per defect cluster, each required to quote current text with file and line
for every verdict and to report `NOT_FOUND` rather than `ALREADY_FIXED` where it could not positively
cite the fix. Every already-fixed verdict was then re-checked by an independent pass instructed to
refute it, including a search of the `workflows` branch history for the commit that closed it.

Two audit outputs were themselves wrong and are corrected here:

- One reported that the corpus uses an `effect.exit` the schema does not declare. Both `effect.exit`
  and activity `exits[]` are declared, in `src/schema/activity.schema.ts` and both generated JSON
  schemas; they landed with PR #501.
- One read `issue_number` as resolving because it is declared. It is declared and written on the create
  path only, and the binding that reads it is bound on the review path, so the defect survives in
  narrowed form.

The external retrospective tracker the epic cites in `shieldedtech/midnight-agent-eng` returns HTTP
404 to the authenticated CLI, so items 10, 11, 12, 22, 24 and 28 were taken from the epic's own inline
summary of them rather than from the source.

## Disposition of every named defect

`Stale` means the epic's claim does not hold against the current tree. `Live` means it does. `Narrowed`
means part of it holds.

### W1 — the presentation contract

| Named defect | Verdict | Evidence |
|---|---|---|
| `present-before-any-resolution` contradicted by a per-workflow auto-resolve licence | **Live, wider** | The engine rule survives verbatim in `meta/techniques/workflow-engine/present-checkpoint-to-user.md:33-35`, and its Protocol step 4 calls presentation "MANDATORY for every checkpoint, including those with `autoAdvanceMs` set". Four licences contradict it: `workflow-authoring/workflow.yaml:19-20`, `plain-language/workflow.yaml:19-20`, `work-package/workflow.yaml:21`, `workflow-design/workflow.yaml:20`. Nine surfaces state a presentation rule in total; five agree with the engine. |
| The two named checkpoint-discipline rule ids | **Stale** | `checkpoint-discipline-workers-yield-only` and `checkpoint-discipline-meta-only-resolves` no longer exist as separate ids; they are consolidated into one rule at `meta/techniques/agent-conduct.md:34`. |
| `autoAdvanceMs` is unenforceable | **Stale, and inverted** | `src/tools/workflow-tools.ts:1917-1934` refuses `respond_checkpoint { auto_advance: true }` until the full declared interval has elapsed, and refuses it outright when either field is absent. The enforcement is unconditional, so a headless run pays the declared interval per soft gate. What is unenforced is the worker-local apply path that never makes the call — and `src/tools/workflow-tools.ts:1459-1461` now actively instructs the server-timed route in the `get_activity` payload. |
| The declared timer carries no per-gate information | **Live (new)** | 32 soft checkpoints corpus-wide. `defaultOption` and `autoAdvanceMs` are co-declared on all 32 — there is no partial-declaration case to migrate. `autoAdvanceMs` takes two values: 30000 on 31 of them, 15000 on one. |
| `blocking` overlaps the pair as a second softness signal | **Live (new)** | `schemas/activity.schema.json:373` states the server's auto-advance gate does not consult `blocking`. 31 `blocking: false` declarations are therefore redundant, and `work-package/activities/12-strategic-review.yaml:217-219` declares `blocking: true` together with the pair, which is self-contradictory. No guard catches it. `remediate-vuln/workflow.yaml:15` keys its only interaction rule on the field, so that rule is unenforceable as written. |
| `headless_mode` | **Narrowed, and ungrounded** | Declared in three workflows: `plain-language/workflow.yaml:30-33` at workflow level, `workflow-authoring/activities/01-intake-and-context.yaml:21-24` and `workflow-design/activities/01-intake-and-context.yaml:29-32` at activity level. `src/utils/variable-seed.ts:11-17` seeds workflow-level declarations only, so two of the three never reach the bag. No checkpoint anywhere carries a condition on it. `grep -rn headless src/ schemas/` returns nothing. |
| The five self-attestation gates | **Live** | `spec-confirmed`, `impact-and-preservation-confirmed`, `scope-and-structure-confirmed` and `batch-review-attested` survive in the deprecated tree; `file-index-table` survives at `work-package/activities/10-post-impl-review.yaml:88-107` with `blocking: false`, `defaultOption: rationale-confirmed`, `autoAdvanceMs: 30000`, and it is not mode-gated. `workflow-authoring` carries one surviving soft self-attestation gate, `scope-confirmed#{scope_round}`. |
| Self-attestation as a class | **Live (new)** | About 20 of the 32 soft checkpoints gate content the same activity produced. The corpus already states the discriminator twice, in `scripts/check-review-mode-gating.ts:20-24` and `:47-49`: a default that records a judgement is acceptable, a default that creates, publishes, pushes or approves is not. Applied to the 20 it splits them cleanly. |
| Outcome clauses asserting user consent | **Live** | Eight clauses assert an approval a soft default would falsify, at `workflow-design/activities/05-impact-analysis.yaml:66`, `04-pattern-analysis.yaml:46`, `06-scope-and-draft.yaml:387` and `:388`, `work-package/activities/10-post-impl-review.yaml:233`, `06-plan-prepare.yaml:153`, `03-requirements-elicitation.yaml:146`, `workflow-authoring/activities/06-scope-and-draft.yaml:172`. A ninth, `cicd-pipeline-security-audit/activities/01-scope-setup.yaml:37` and `:42`, asserts agreement with no gate at all. |
| Resolution is restricted to the orchestrator | **Stale as stated** | Recorded in the epic's own third comment and confirmed: `respond_checkpoint` takes no caller identity and performs no role check, so the restriction is error-message prose. Any agent holding the session index can resolve or dismiss. |

No guard in the suite reads rule text. `scripts/guards.ts` registers 30 guards; the five that touch
checkpoints check structure only. `check-review-mode-gating` explicitly blesses headless auto-advance
as a legitimate design in its header comment, so the contradiction is invisible from inside the suite.
The anti-pattern catalogue names the class at `workflow-design/resources/anti-patterns.md:1514-1524`
(AP-117), but AP-24 and AP-133 are both scoped to a single rules bucket and so cannot reach a
workflow-rule-versus-engine-technique conflict.

### W2 — approvals that apply

| Named defect | Verdict | Evidence |
|---|---|---|
| `approve-to-commit` fires with no effect | **Fixed in the successor** | `workflow-authoring`'s approve option sets `commit_approved: true`. The defect survives only in the deprecated tree, where `activities/03-requirements-refinement.yaml:148-160` additionally seeds an empty decision list outright. |
| The batch half — open judgements reach commit unresolved | **Live** | `open_judgements_count` is surfaced by a message-only step and gated nowhere, so any number of open judgements reaches the commit decision undecided. `workflow-authoring` deleted the whole assumption apparatus deliberately; the rebuild plan at `2026-07-28-workflow-authoring-build/01-target-architecture.md:133` lists the five variables it cut. |
| Gate conditions closed on the observed run | **Narrowed** | Three of four conditions are unchanged. The epic's instruction to widen the intent gate on an open-assumptions flag is not applicable: that gate runs in activity 01 and the flag is written in activity 03, so widening it would gate a checkpoint on a variable no earlier step produces — which `check-decision-order` exists to refuse. The condition to widen is the one that sits after the producer. |
| Audit fixes remove content the inventory never listed | **Live, in the successor** | Nothing appends an inventory row when a remediation round removes content, and nothing refuses the removal. One drafting branch's option text already promises an append that no step performs. |
| `selected_findings` resolves UNRESOLVED | **Stale** | `workflow-design`'s input is `verified_findings`, which has a producer; `workflow-authoring`'s `selected_findings` is explicitly bound. Residue: `scripts/binding-fidelity-triage.json:16` still defines a rationale key, `test-fixture-pins-the-defect`, that no entry references. |
| A reusable append mechanism | **Live** | The corpus already owns one — the deferred-items register and its `append-task-row` operation, and `manage-artifacts::write-artifact` is find-or-update on bare filename. The fix reuses these rather than inventing a primitive. |
| `assumption_decisions` unsatisfiable on the review path | **Live, wider** | It has no producer on any path. Declared at `work-package/workflow.yaml:171`, read by seven activities, and the declared input of all 15 `review-assumptions::record` bind sites — it holds an empty list on every run, not only a review run. |

A question the fix must answer, which the epic does not raise: `removals_approved` is set once, at the
intake gate, and a row appended at drafting or remediation time sits under an approval that was
answered against a smaller inventory. Either the per-row gate becomes that row's approval, with the
row's provenance recorded so the two approval events stay distinguishable, or the batch gate re-opens
whenever the inventory grows.

### W3 — the binding sweep

Already closed, and dropped from the restated body:

| Named defect | Closed by |
|---|---|
| The ambiguity gate reads a name no step writes | `outputs: { match_ambiguous: workflow_match_ambiguous }` at `meta/activities/00-discover-session.yaml:87-88`, commit `cf08a1d9`, 2026-07-28 |
| `state` and `execution_trace` bound to names nothing produces | Commit `e3fc1625`, 2026-07-30; both techniques read the session themselves through the `inspect_session` route |
| A documented `usage` parameter the tool schema rejects | Removed from the technique 2026-07-29 and from the server 2026-07-30; `record_usage` is now the accounting channel |
| `create-readme` cites a bare `planning-readme#template` slug | Qualified at the named site. A different instance survives at `retrospective.md:51` |
| Templates restate counts instead of pointing at them | The count-restating instance is gone. The prefix half inverted: the convention now mandates minted prefixes and three seed profiles omit them |
| `changed_files`, `requirements`, `validation_results`, `comprehension_dir` | Each now has a declared producer |
| `findings_to_classify` | Both bind sites supply it by deviation; never producerless |

Still live:

| Defect | Evidence |
|---|---|
| The close-out artifact has two names | The technique declares `COMPLETE.md`; both write steps bind `bare_filename: completion.md`; the seed links a third form. Live in `workflow-authoring` as well as the deprecated tree. Every sibling workflow and all six prose homes say `COMPLETE.md`, so only the two bindings disagree. |
| meta's close-out binds an outcome list nothing produces | `outcomes: target_workflow_outcomes` at `meta/activities/04-end-workflow.yaml:32`. Declared at `meta/workflow.yaml:56-58` with no default, so `src/utils/variable-seed.ts:14` never seeds it. The only writer in the corpus is `work-package/activities/01-start-work-package.yaml:309-311`, in the client session and on the review path only. Under the disambiguation rule at `meta/techniques/variable-binding.md:18` the binding takes the literal string. The declared `type: string` also disagrees with the list every reader treats it as. |
| The trace token never reaches its consumers | `src/tools/workflow-tools.ts:965-983` emits `_meta.trace_token` on every `next_activity` whose segment is non-empty, and has since 2026-03-26. No YAML in the corpus mentions it, and the dispatch step carries no output remap, so all three declared consumers take their documented skip path. Both ends are invisible to the guard: the producer end is triaged `harmless` at `scripts/binding-fidelity-triage.json:236-242`, and the consumer end is exempt because the input is marked optional. |
| The documented usage-recording signature omits a required argument | `dispatch-activity.md:72` states a call without `basis`, which the tool rejects. The same class as the parameter that was fixed, relocated to the other side of the call. |
| `default_branch` is declared and written by nothing | `work-package/workflow.yaml:113`, no default and no writer; the derivation exists only as prose in `create-worktree.md:26`. `base_branch`, which the epic offers as the name the bag holds, is not a bag variable at all. |
| The ticket reference falls through to a literal | `issue_key: issue_number` at `work-package/activities/14-complete.yaml:167` and `13-submit-for-review.yaml:126`. `issue_number` is written on the create path; these bindings are bound on the review path, which never sets it. |
| prism-evaluate's adjust option records nothing | Both scope gates now carry `effect: exit: adjust` and the activities declare the matching exit, so the routing is real. Nothing records what the user asked to change, so a second pass re-derives the original scope. The run that surfaced this took two passes. |
| `scope_summary` is shown to a user but declared nowhere | Produced by `plan-evaluation::summarize-scope`, interpolated into the gate message at `prism-evaluate/activities/00-scope-definition.yaml:61`, absent from that activity's `variables.writes`. |
| `selected_lenses` and `analysis_focus` cross into child runs undeclared | Listed under `triggers[].passContext` at `prism-evaluate/activities/02-execute-analysis.yaml:40-50`, absent from `variables.writes`. Both genuinely crossed on the run, so the omission is in the declaration. |
| Guard and triage residue | Three entries suppressing the commit-operation mismatch as `harmless`; one dead rationale key; a `corpusSha` reported 267 commits adrift. |

`target_workflow_outcomes` in `prism-evaluate`, listed in the epic's appendix as a fifth instance,
returns no hits in that workflow. It is one defect, in `meta`, not two.

The missing guard class for this whole epic is a check that reads rule text and fails a presentation
claim stated outside the engine technique — the mechanical form of AP-117.

### W4 — the source session's ledger

The epic's second intake comment already dispositioned this work item; the verification confirms it and
adds the current state of each item.

| Item | Verdict |
|---|---|
| Nine open follow-ups | Four are actionable, per the intake comment: resource frontmatter, a protocol phase whose only content is mode selection, a capture bullet closing no gap, and a README table transcribing transitions. Verified live: `techniques/update-specification.md:48-50` is the mode-selection-only phase, and `activities/README.md` still carries a "Transitions to" column. The guard baseline that F-9 measured against was retired, so F-9 is moot. |
| Three held judgements | Partly self-resolved. `sources_confirmed` and `finalization_confirmed` are gone from the corpus; `analysis_confirmed` has gained a structural reader at `activities/01-intake-and-analyze.yaml:75`; `source_coverage_complete` survives, consumed only inside its own technique. The terminal gate at `activities/05-finalize-specification.yaml:33-43` still carries two options and no effect on either, so the acknowledgement-gate judgement is unresolved. |
| Twelve unapplied removals | Rows 10–21, to be applied under the three dispositions the intake comment names. The five workflow-level activity rules are present; the validation-protocol collapse is unapplied. |
| The correction cycle has no termination guarantee | Still holds. `activities/04-validate-specification.yaml:39` carries the cap literal `correction_iteration < 3`, and the increment is still advanced by prose in `techniques/update-specification.md`. |
| Canonical-document integrity rests on prose | Still holds. `grep -rn "action: validate" activities/` returns nothing. |

PR #318 merged; `requirements-refinement` is at v1.3.0.

## Open decisions the body records but does not settle

1. Whether the deprecated workflow is repaired, retired, or left alone. Retiring it is not free: it
   hosts the design canon that its successor links back to, and the end-to-end suite still walks it.
2. Which construct owns softness — the field pair, the `blocking` directive, or one replacement field —
   and whether the declared interval should be spent on a run nobody is watching.
3. Whether the new rule-text guard is a hard zero or an allowlist carrying reasons. A hard zero forces
   the strict reading of the presentation contract; an allowlist permits the headless carve-out, and
   is the precedent the review-mode guard already set.
4. Where a judgement disposition is taken in the successor workflow, and whether it reacquires a
   resolving gate at all.
5. Whether the trace-token relay earns its keep, given that the server answers a full-session trace
   query without tokens.
