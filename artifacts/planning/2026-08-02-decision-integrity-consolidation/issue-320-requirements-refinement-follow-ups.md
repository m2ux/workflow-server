# Issue #320: Requirements-refinement follow-ups: decision gates, binding gaps, and open items left by the PR #318 design session

Captured verbatim on 2026-08-02 when the issue was consolidated into the decision-integrity epic.

---

## Summary

A `workflow-design` session — a run of the workflow that designs and revises other workflows — produced [PR #318](https://github.com/m2ux/workflow-server/pull/318), taking `requirements-refinement` from v1.1.0 to v1.2.0. The run's audit came back clean, but the machinery for turning judgements into decisions did not do its job: the session ended with questions still open and approved work still unapplied. This issue raises everything it left open, in one place.

The run's own key takeaway states the shape of the problem:

> The audit machinery worked — 29 principles and the anti-pattern catalogue produced findings that survived adversarial re-derivation — but the decision machinery did not: every gate that could have converted a held judgement into a decision was either gap-conditioned shut or effect-less, so a clean audit closed with three questions still open and twelve approved-in-principle removals unapplied.

In plainer terms: the session pauses at **gates** (checkpoints where a human is meant to decide something), and each gate either had a condition that kept it closed, or fired without actually recording any decision. The full session records — close-out, follow-up register, assumptions log, and removals inventory — are linked at the bottom under **Investigation detail**.

Delivery state: PR #318 is **open and unmerged**; the parent repo's `workflows` submodule pointer is deliberately not advanced until it merges.

## Coverage check against existing issues

Checked all 14 open issues and the 30 most recently closed. Two items were **already covered and are excluded** from the groups below:

| Excluded item | Covered by |
|---|---|
| `context-loading`'s create-mode-only `persist-format-conventions` step carries no `condition` | #319 **D-1** — identical finding |
| `persist-impact-analysis` binds `artifact_content: impact_analysis`, an output no technique declares | #319 **D-7** — identical finding |

Those two were recommendation 6 of the run's retrospective; it is closed as a duplicate of #319 and does not appear below.

Related but **not** covering, cross-referenced where relevant:

- **#317** — soft mid-flow checkpoints self-resolving without presentation, `autoAdvanceMs` unenforced. Explicitly finds that Gate 2 (`approve-to-commit`) *behaved correctly* because it reaches the user. A-1 below is the distinct defect that it reaches the user and still resolves nothing. #317's direction 4 ("audit outcome clauses that assert user consent") is the same class as A-2's outcome breakage, by a different mechanism.
- **#319** — Group 1's binding class (D-4/D-7/D-8) and its stated suggestion that "a sweep of every `artifact_content` and technique-input binding across `workflow-design`'s activities would likely find more". B-1 and B-2 below are two results of that sweep, in activities the issue does not reach.
- **#141** — flat-slug resource addressing and anchor validation. B-4 is a corpus-authoring instance of that class, not among the three missing-anchor links #141 lists.
- **#189 C9** — burning down baselined binding debt. D-7 below may be absorbable into it.
- **#189 C3** — "a lint for checkpoint messages that reference variables nothing sets". C-1 below is a checkpoint *condition* in the same family.
- **#232** — per-activity token/cost tracking. C-3 below is the adjacent mechanism (`_meta.trace_token`) rather than usage accounting, but the two share a call site.
- **#316** — `engineering` branch protection vs `commit-and-persist`. Every push in this run reported the documented admin bypass, as that issue describes; nothing new to add. Not related to B-1.

---

# Group A — `workflow-design` decision machinery (High)

The session tracked its open questions as **assumptions** (A-1 … A-10 in the assumptions log): judgements held provisionally until a gate resolves them. These two defects are why no gate ever did, and they are prerequisites for the next update-mode run being able to close its own judgements.

### A-1 — A gate documented as resolving a batch of open assumptions carries no effects that resolve them

The `approve-to-commit` gate fired and the user approved — it recorded `optionId: approved` — but with `variablesSet: {}`: choosing an option changed nothing. Three artifacts call it "the Gate 2 batch", yet its `options[]` carry no per-assumption effect, so it cannot resolve a batch. Assumptions A-3, A-5 and A-7 exited the session in exactly the state they entered it, and 12 inventoried removals stayed unapplied as a direct consequence.

Compounding it: only 1 of the 4 nominally interactive gates fired at all. `design-intent-batch` opens only when a gap is detected, and `intent_needs_confirmation` was false; `preservation-check` was gated on `has_unflagged_removals` (false); `review-disposition` on `has_critical_finding` (false). A run holding three `open` assumptions reached commit without any of them being presented.

**Direction:** give `approve-to-commit` per-assumption options (or add a dedicated batch gate), and make `has_open_assumptions: true` open `design-intent-batch` regardless of `intent_needs_confirmation`. The change lands in `workflow-design/workflow.yaml` (checkpoints) and in `activities/06-scope-and-draft.yaml` and `activities/09-validate-and-commit.yaml`.

### A-2 — Audit fixes can remove content the approval inventory never listed

The removals inventory is the record of everything the run intends to delete, and under principle 10 it is the approval basis — the user approves removals by approving the inventory. Three rule deletions were applied at `post-update-review` with no inventory row, while the inventory text still asserts that none of rows 10–21 is applied. The inventory is therefore no longer a complete record of what was removed — which falsifies `impact-analysis`'s outcome "every flagged removal is one the user consciously approved".

Root cause: `apply-audit-fixes` has no step that re-inventories a removal before applying it. The inventory is built once at `impact-analysis` but discovered continuously — it grew 15 → 21 rows across two later activities before being bypassed entirely.

**Direction:** require `apply-audit-fixes` to add an impact row for any removal it applies, or refuse the fix. The change lands in `activities/10-post-update-review.yaml` and `techniques/apply-audit-fixes.md`.

---

# Group B — `workflow-design` binding defects

A **binding** wires a step to the technique it runs and to the variables it reads and writes. When a binding names a variable nothing produces, the step cannot work as declared — these are that class.

### B-1 — `stage-and-commit` cannot commit the files this workflow edits (Medium)

The step binds `version-control::commit-regular-files`, whose capability is explicitly "a regular (**non-submodule**) directory of the parent repo" and whose protocol pushes the parent working tree. Workflow source lives in the `workflows` submodule, so the step cannot commit it. All three of its inputs (`paths`, `commit_message`, `branch`) additionally resolve UNRESOLVED — no workflow variable, prior step output, or step binding supplies them.

All three commits in this run had to be published outside the bound step. The activity outcome was met only by that workaround.

**Direction:** rebind to a submodule-aware commit operation and resolve the three inputs, in `activities/09-validate-and-commit.yaml`.

### B-2 — `apply-audit-fixes` declares `selected_findings` with `source: UNRESOLVED` (Medium)

Same input-side family as #319 D-8, in an activity that issue does not reach. Fixable alongside A-2, which touches the same step (`activities/10-post-update-review.yaml`).

### B-3 — The close-out artifact has two names (Medium)

`11-retrospective` declares `artifacts[].name: COMPLETE.md` while its write step binds `bare_filename: completion.md`. The close-out lands as `11-completion.md`, so the planning-README seed's `COMPLETE.md` link target is wrong on every run.

**Direction:** align `artifacts[].name` with the binding and correct the seed link, in `activities/11-retrospective.yaml` and the planning-README seed.

### B-4 — `create-readme` cites a bare `planning-readme#template` slug (Low)

`workflow-engine::create-readme` cites `[Template](planning-readme#template)`, which resolves only as `meta/planning-readme`. Same class as #141; not among the three links that issue lists.

**Direction:** qualify the reference.

### B-5 — Artifact templates restate counts instead of pointing at them (Low)

The scope-manifest template's removal headline is the concrete instance: `06-scope-manifest.md` restated the count as a literal 15 and went stale the moment the inventory grew to 21 — a violation of the single-source-and-link rule (state a number once, link to it everywhere else) inside the workflow-design artifact set itself.

Related pattern from the same run: every artifact write went through a `write-artifact` step whose `artifact_prefix` comes from the server, yet three READMEs and manifests hand-wrote prefixes anyway. F-10 repaired eight broken links caused by exactly that. The prefix is available; the templates invite retyping it.

---

# Group C — `meta` workflow defects (newly surfaced)

`meta` is the orchestrating workflow that discovers, dispatches and closes out client workflow runs. Three of its own defects surfaced during this session.

### C-1 — `discover-session`'s ambiguity gate can never fire

The `workflow-selection` checkpoint's condition reads `workflow_match_ambiguous`, but the bound step `match-target` (`workflow-engine::match-target-workflow`) declares its output as `match_ambiguous`, with no `outputs` remap on the step. Nothing ever sets the variable the gate reads, so **an ambiguous workflow match silently proceeds on the top scorer** instead of asking.

It did not affect this run — the match was unambiguous — but the gate is dead in every run. Same family as the lint proposed in #189 C3, applied to a checkpoint condition rather than a message.

**Direction:** add `outputs: { match_ambiguous: workflow_match_ambiguous }` to the step, or align the condition to `match_ambiguous`.

### C-2 — `end-workflow`'s three technique bindings have no producer

Both technique steps bind `outcomes: target_workflow_outcomes`, `state: client_state` and `execution_trace: client_trace`. No `meta` activity produces any of the three and none exists in the session bag, so under `variable-binding` disambiguation each falls through to a **literal string**.

The worker resolved them the way both Protocols' own tool notes mandate — outcomes from the client workflow definition's per-activity `outcome` blocks, state and trace via `inspect_session` — so the activity completed correctly in spite of the bindings.

**Direction:** either have `dispatch-client-workflow` produce the three, or drop the bindings in favour of the `inspect_session` route the Protocols already require.

### C-3 — No `_meta.trace_token` is returned on any transition, and `next_activity` has no `usage` parameter

`trace_tokens` stayed empty for the whole run because no `next_activity` response carried `_meta.trace_token`, so the mandated `resolve-trace-at-close-out` resolve was correctly skipped rather than faked — close-out had no mechanical trace and no token-usage artifact exists.

Separately, `dispatch-activity` documents an optional `usage` param on `next_activity` for relaying harness-reported per-activity token counts, but the `next_activity` tool schema declares no such property and sets `additionalProperties: false`. The documented parameter is unimplemented, so per-activity usage cannot be relayed even when the harness surfaces it. Adjacent to #232, which wants that data recorded.

**Direction:** record `_meta.trace_token` per `next_activity` or drop the close-out expectation; implement `usage` or remove it from the technique.

---

# Group D — `requirements-refinement` follow-ups

The session kept a follow-up register: numbered F-items recorded during the run for later action. Nine of thirteen are open; F-4, F-6, F-10 and F-11 were closed in-session.

| ID | Item |
|---|---|
| **F-1** | `01-format-conventions.md` line 38 says a retry limit in a transition condition reads the declared limit variable — but a `simple` condition's `value` admits only a literal scalar, so the convention as written is not expressible. Correct it to the literal-plus-single-home rule before drafting relies on it. |
| **F-2** | G6 directs `techniques/intake-sources.md` to declare the inputs its Protocol reads, but all three (`source_path`, `target_doc_path`, `planning_folder_path`) are already declared on the container `TECHNIQUE.md` — redeclaring them on the leaf is the `hoist-shared-inputs` anti-pattern. Confirm the non-redeclaration reading or direct the redeclaration. |
| **F-3** | G3's fix for the sole transition carrying both `condition` and `isDefault: true` is a Gate 2 row; dropping the `condition` would strand `analysis_confirmed` as a fifth reader-less variable, extending A-3. Arm left at baseline; shape depends on A-7. |
| **F-5** | The four effect-less gate options are unchanged, so G2 and G3 stay open on them. Depends on A-5 and A-7. |
| **F-7** | Four resource files lack the sibling frontmatter shape carried by 141 of 142 corpus resources. They load correctly by filename-derived id and sat outside the confirmed 16-file scope. |
| **F-8** | AP-124/AP-121: `techniques/update-specification.md` carries a Protocol phase whose only content is mode selection, which belongs in the binding. |
| **F-9** | The binding-fidelity guard reports 21 baselined violations no longer present. **They are not this branch's** — they belong to `work-package` (14), `meta` (3), `workflow-design` (3) and `codebase-wiki` (1), zero to `requirements-refinement`, and the guard reports the same 21 absent when scanning the pre-change tree. Pre-existing baseline staleness, not gated on PR #318. Run `check-binding-fidelity.ts --update-baseline` whenever convenient so the stale entries stop masking future regressions. Possibly absorbable into #189 C9. |
| **F-12** | `techniques/intake-sources.md` Protocol 1 bullet 1 instructs capturing `{source_path}` and `{target_doc_path}` "from the user request", but both are declared container Inputs and `required: true` workflow variables — bind mechanics closing no real gap (`no-bind-mechanics-as-prose`); the phase also carries a second distinct outcome. **Human design call:** drop the bullet, retitle the phase to the basename derivation and align Capability, or record the intake boundary as intentional. Interacts with F-2 (same file). |
| **F-13** | `activities/README.md`'s index table transcribes `transitions[]` and the server-synthesized artifact contract (`readme-orients-not-transcribes`); 4 of 6 sibling `activities/README.md` tables use a single `Role` column. **Blocked on `preserve-readme-content` (AP-80)**, which requires a preservation audit and explicit user confirmation before shrinking README content — `headless_mode` was true, so the audit could not confirm. Present the removal for approval, then collapse to `\| # \| Activity \| Role \|`. |

### Three judgements approved-as-held, not resolved

Gate 2 recorded `approved` with no variable effects (see A-1), so the approval covered the commit, not this batch. All three are preference questions, not correctness:

- **A-3 — dead-variable disposition.** Four declared variables have no structural reader. Machine-confirmed: the binding-fidelity guard independently reports `source_coverage_complete` as a still-live dead output. Removing `sources_confirmed` / `finalization_confirmed` strands the *sole* effect on `01`'s `confirmed` and `05`'s `accepted` options, so removal requires replacement effects.
- **A-5 — terminal acknowledgement gate.** Blocking gate with an effect vs a plain announcement; canon AP-89 leans to the announcement.
- **A-7 — rework destination.** Self back-edge vs `transitionTo` effect vs a dedicated hold activity.

### Twelve inventoried removals remain unapplied

Rows 10–21 of the removals inventory: the six A-3/A-5/A-7 rows, the five `rules.activity` entries, and the `validate-specification` Protocol 5 collapse. Each needs explicit approval before it can be applied. This is why `quality-review`'s "the rule set is lean and trustworthy" outcome is only partial — five `rules.activity` entries remain dual-homed or restating Protocol, with no impact row inventorying them.

### Two High findings with no in-scope fix

Both are structural limits of the current schema rather than defects this pass could close. They are flagged for reviewer attention on PR #318.

- **The correction cycle has no structural termination guarantee.** The 03⇄04 cycle is a cross-activity transition back-edge; `maxIterations` is activity-scoped to `kind: loop` and cannot bound it, and `action: set` is agent-executed so carries no stronger guarantee. The cap literal bounds the comparison; **nothing bounds the increment** — only prose advances the counter. Structural alternative inventoried as impact row 23.
- **Canonical-document integrity is prose-only.** Stated across three rule homes with zero `action: validate` anywhere in the workflow. Inventoried as impact row 22.

Two Medium enforcement gaps stay text-only for the same reason: the status-change confirmation clause across three homes, and the source-readable precondition with no failure arm.

---

## Human actions outside this issue

- Review and merge PR #318, then advance the parent repo's `workflows` submodule pointer.
- Settle A-3, A-5 and A-7, then apply the twelve approved-in-principle removals.
- Confirm the F-13 README removal so AP-80's preservation audit can complete.

## Investigation detail

Full session records: [`11-completion.md`](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-07-27-requirements-refinement-design-fixes/11-completion.md) (close-out + retrospective) · [`03-follow-ups.md`](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-07-27-requirements-refinement-design-fixes/03-follow-ups.md) (F-register) · [`03-assumptions-log.md`](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-07-27-requirements-refinement-design-fixes/03-assumptions-log.md) (A-1…A-10) · [`05-impact-analysis.md`](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-07-27-requirements-refinement-design-fixes/05-impact-analysis.md) (removals inventory).

