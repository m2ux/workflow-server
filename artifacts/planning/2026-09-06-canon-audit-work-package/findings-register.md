# Findings Register — `work-package`

**Date:** 2026-09-06 · **Mode:** Review
**Base ref:** `75777ca2453d788acf52d8ab69778c9491686436` — the base of the [2026-09-05 pass](../2026-09-05-canon-audit-work-package/findings-register.md), so this register measures the corpus as it stands after that pass's remediation · **Target:** `workflows/work-package` at `c1d07a291510eb13d9ec6e49c73a5aed55b3c538` (169 definition files)
**Change surface:** 63 files (touched: 63 whole files · I/O-contract closure: 0 beyond the touched set · consumers: 0 pulled in)

Nineteen commits across PRs #620, #622 and #623 landed between the two base refs, remediating the prior register. Origin below is `diff` where the finding sits in a file those commits touched, `pre-existing` otherwise. Which prior findings closed, which survive, and which fixes traded one entry for another is in [prior-pass-reconciliation.md](./prior-pass-reconciliation.md).

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 7 | 0 |
| Medium   | 11 | 0 |
| Low      | 3 | 0 |

Every finding below is applied on branch `workflow/work-package-canon-followups`. The **Applied** column names the commit.

**Coverage:** divergences 4 · per-unit walked tally kept only for the 23 files read whole — see Coverage

**Guards:** clean. `npm run check:all` — 36 pass, 0 fail, 0 unmeasured against the corpus `main` pins, `69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6`. `npm run test:coverage-walk` — 2 of 2 tests fail against the corpus branch at `c1d07a291510eb13d9ec6e49c73a5aed55b3c538`, pass against the pinned tree; see [Measuring the right tree](#measuring-the-right-tree).

## Measuring the right tree

The first pass of this audit ran both checks in the shared checkout, whose `workflows/` worktree sits on the `workflows` branch at `c1d07a291510eb13d9ec6e49c73a5aed55b3c538`. `main` pins `69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6`, thirty-five corpus commits behind it. So those runs measured definitions the code branch has not adopted, and three failures they reported are properties of that gap rather than of either tree:

| Reported | Against the pinned corpus |
|---|---|
| `binding-fidelity` fails — two triaged cites at `review-summary.md:96` sit at line 94 | Passes. Line 96 is correct at `69a01ca1`; the corpus branch moved the two designators |
| `binding-fidelity` — verdicts stamped 35 commits behind the checkout | Consistent. The stamp names the corpus `main` pins |
| Coverage walk — five work-package options covered but still listed unreachable, and the stamp names a different corpus | Passes. PR #621 added those five exemptions against `69a01ca1`; corpus PRs #622 and #623 made them reachable, which the pointer has not yet adopted |

A provisioned worktree checks out the pinned corpus, which is what made the distinction visible. The canon states the rule this pass initially skipped: definitions and code sit on different branches, and a guard failing on the corpus branch may be reading what the code branch has not merged — establish which before recording a finding.

None of the three is a defect in `work-package`. All three are the adoption commit this corpus change owes, recorded under [Adoption](#adoption).

## Change surface

All 63 entries joined as touched whole files; none joined by I/O-contract closure or as a consumer. Enumerated by `git diff --name-only 75777ca2453d788acf52d8ab69778c9491686436..c1d07a291510eb13d9ec6e49c73a5aed55b3c538 -- work-package/`.

| Group | Paths |
|---|---|
| Root | `README.md`, `REVIEW-MODE.md`, `workflow.yaml` |
| Activities (11 of 15) | `01-start-work-package`, `02-design-philosophy`, `04-research`, `05-implementation-analysis`, `06-plan-prepare`, `07-assumptions-review`, `08-implement`, `10-post-impl-review`, `11-validate`, `12-strategic-review`, `15-codebase-comprehension`, plus `activities/README.md` |
| Resources (11) | `README.md`, `canonical-home-map.md`, `deferred-items.md`, `github-issue-creation.md`, `jira-issue-creation.md`, `pr-description.md`, `readme-deprecated-notice.md` (deleted), `readme.md`, `requirements-elicitation.md`, `review-mode.md`, `wp-plan.md` |
| Techniques (38) | `README.md`; `analyse-challenge/` ×4 (incl. `run-loop.md`, deleted); `codebase-comprehension/` ×4; `conduct-retrospective/` ×2; `design-philosophy/` ×2; `finalize-documentation/` ×2; `implementation-analysis/` ×2; `plan-prepare/` ×2; `requirements-elicitation/` ×2; `research/` ×3; `review-assumptions/` ×5; `strategic-review/TECHNIQUE.md`; `manage-artifacts/TECHNIQUE.md`; `create-issue.md`, `respond-to-pr-review.md`, `review-code.md`, `review-diff.md`, `review-existing-feedback.md`, `review-summary.md`, `task-completion-review.md` |

Untouched, and therefore the source of every `pre-existing` origin below: activities `03`, `09`, `13`, `14`, and the technique and resource files not listed above.

## Findings

| ID | Severity | Entry | Location | Evidence | Origin | Fix | Applied |
|----|----------|-------|----------|----------|--------|-----|---------|
| 1 | High | `variable-for-approval` | `activities/12-strategic-review.yaml` checkpoint `findings-delivery` | All three options (`raise-all`, `raise-selected`, `raise-none`) set only `review_passed: true`. `raise-selected` reads "The posted review carries the findings named in the reply" — no variable holds that selection, and `techniques/review-summary.md` declares nine inputs (`classified_findings`, `prior_feedback_triage`, `review_ticket_ref`, `rating_cap`, `changed_files`, `artifact_publish_ref`, `reviewed_code_base_url`, `host_repo_path`, `pr_number`), none of which carries it. `REVIEW-MODE.md` states the gate "asks which findings the posted review carries to the author", so the documented contract has no structural backing on either side | diff | Declare the selection variable, set it from the option effects, and take it as an input on `review-summary` | `1447cbd7` |
| 2 | High | `checkpoint-requires-decision` | `activities/10-post-impl-review.yaml:103` checkpoint `rationale-attestation` | Both options carry no `effect` at all, set no variable, and fall through to the same step. Nothing records the attestation and nothing consumes the correction path ("The reply carries the corrections, which land in the manual diff review report" — the producing `manual-diff-review` step ran before the gate and no step re-runs). The activity `outcome[]` nonetheless claims "Every change block has a confirmed rationale and provenance attestation". The DCO carve-out does not reach it: `dco-sign-off-confirmation` sets `attestation_option` and is followed by `dco-provenance::record-attestation`; this gate has neither | diff | Record the certification as `dco-sign-off-confirmation` does, or demote to `action: message` | `1447cbd7` |
| 3 | High | `technique-outputs-declared` | `techniques/review-diff.md:86` | Protocol phase 5 "Populate `{flagged_block_indices}` from the flagged set, one entry per block carrying an issue". `## Outputs` declares `change_block_index`, `reviewed_code_base_url` and `manual_diff_review_report` only. `activities/10-post-impl-review.yaml:117` iterates `over: flagged_block_indices`, so a consumer binds a value no declared output produces. The `activity-variables` guard passes because `workflow.yaml:137` seeds the name; it does not read technique Outputs | diff | Declare `### flagged_block_indices` under `## Outputs` | `803746ea` |
| 4 | High | `session-interaction-in-technique` | `techniques/requirements-elicitation/discuss.md:8,22-25` | The whole operation is session interaction. Capability: "Prompt the user for the stakeholder discussion transcript before agent-led elicitation begins, offering a skip path with a noted limitation." Protocol: "Prompt user for the `{stakeholder_transcript}`", "Offer skip option with note about limitation", "If the user skips stakeholder discussion entirely, note the limitation and proceed". No tool or op owns that channel, and the bind site `activities/03-requirements-elicitation.yaml` step `stakeholder-discussion` carries no adjacent checkpoint or `action: message` | diff | Move the ask to a `kind: checkpoint` on the activity; leave the technique the produce path that consumes the answer | `2ea964b4` |
| 5 | High | `session-interaction-in-technique` | `techniques/review-diff.md:84-92` | Protocol phase 5 specifies the user's reply format ("Consume flagged rows reported as block numbers only: `3, 7, 12` … or `none`"); phase 6 runs the interview ("confirm before continuing to the next block", "Record each supplied block description verbatim", "If the response marks the block as a critical blocker", "Continue to the next flagged block until all are addressed"). `activities/10-post-impl-review.yaml` already owns all of it — checkpoint `file-index-table`, loop `block-interview-loop`, checkpoint `block-interview#{current_block_index}` | diff | Delete the reply-format and interview phases; the activity's checkpoints and loop own them | `803746ea` |
| 6 | High | `capability-as-op-inventory` | `techniques/finalize-documentation/TECHNIQUE.md:8` | Capability is an inventory of the group's child ops — "update ADRs, complete test plans, create completion document, ensure API documentation" — naming four of the five files under `finalize-documentation/`. `render-token-usage`, bound at `activities/14-complete.yaml`, is already absent, so the second home has drifted from the folder that owns the set | diff | Rewrite as a shared-domain contribution statement; leave the roster to the folder | `b8a71ea5` |
| 7 | High | `structure-backed-constraints` | `activities/08-implement.yaml:96` step `commit` | The per-task source commit binds `manage-git::artifact-commits`, whose Capability is "Commit **planning artifacts** in the engineering checkout" and whose Protocol resolves `{$eng_git_dir}` to `{host_repo_path}/.engineering`, commits `docs(work-package): {activity_name} artifacts for {issue_key}`, and pushes to `{branch}` — with none of its four declared inputs passed at the bind. `manage-git::commit-paths` is the code-commit op ("Stage and commit selected paths on the edit-side feature branch (code commits, not planning-folder artifact commits)"). The distinction survives only as rule text (`manage-git.code-commit-coauthor-trailer`, `manage-git.directory-scope`) and a prose warning at `techniques/apply-review-fixes.md:41`, neither of which can prevent the bind. The activity `outcome[]` claims "reviewable, attributable commits on the feature branch" | pre-existing | Bind `manage-git::commit-paths` with `paths` and `commit_message`; the prose warning then has nothing left to police | `803746ea` |
| 8 | Medium | `single-rule-authority` | `techniques/review-assumptions/TECHNIQUE.md` rule `residual-interview-only` | One gate, three homes: this rule ("[interview] runs only when `{has_open_assumptions}` remains true after analyse-challenge"), the activity gate `when: is_review_mode != true && has_open_assumptions == true` at `activities/07-assumptions-review.yaml`, and `techniques/review-assumptions/interview.md` Protocol phase 1 "Empty-Set Skip" | diff | Keep the activity gate; delete the rule and the skip phase | `91dcced5` |
| 9 | Medium | `no-bind-mechanics-as-prose` | `techniques/review-assumptions/interview.md:14` input `open_assumptions` | "In interview mode the current one is bound as `current_assumption`; in batch mode (default) the whole list is assembled together" — the description teaches how the value reaches the op and names the binding activity's forEach loop variable | diff | Delete; close the gap with the call-site input deviation that already exists | `91dcced5` |
| 10 | Medium | `no-rule-protocol-restatement` | `techniques/finalize-documentation/TECHNIQUE.md` rule `doc-build-goes-through-cargo-operations` | "Rust/Substrate: apply [cargo-operations]::[doc] (scope=`--workspace --no-deps`) to verify documentation builds. Other project types: run the equivalent doc command" is an imperative naming work, not a constraint on it. `ensure-docs.md` has four Protocol phases and none is the doc build, so the rule is the latent duplicate of a phase that does not exist yet | diff | Move into `## Protocol` as a phase; keep any residual invariant the phases cannot express | `b8a71ea5` |
| 11 | Medium | `technique-stage-agnostic` | `techniques/finalize-documentation/TECHNIQUE.md` rule `completion-timing` | "`COMPLETE.md` is created after implementation is complete and PR is merged" answers *where in the workflow*, which the graph already settles by placing `create-complete-doc` in `complete` | diff | Drop the timing clause; keep what the rule says about the artifact's content | `b8a71ea5` |
| 12 | Medium | `platform-semantics-in-capability` | `techniques/README.md:15,17` | Orientation prose for the container teaches loader composition: "A capability with one operation is a standalone `<op>.md` in this folder. A capability with several is a directory holding a group `TECHNIQUE.md` for the shared contract and one file per operation, which an activity binds as `<group>::<op>`. The directory listing is the membership of both sets." — a standalone-vs-group placement lecture plus folder-implied membership — followed by "declared in `activities/NN-<id>.yaml` and served by `get_activity`". The one-line "`TECHNIQUE.md` holds shared Inputs, Outputs, Rules, and Errors for every technique here" above it is corpus convention (seven workflows carry it) and is not flagged; the `## Layout` section is unique to this workflow | diff | Delete `## Layout` and the `get_activity` clause; loader composition lives in `meta/resources/workflow-canonical.md` and the schema construct inventory | `b8a71ea5` |
| 13 | Medium | `readme-orients-not-transcribes` | `README.md` activity index, `Required` column | The column transcribes each activity's `required:` field in an invented four-value vocabulary the boolean cannot supply, and has already diverged: activities `03` and `04` read "optional", `05` reads "conditional", `15` reads "no" — all four declare `required: false`. No other workflow README in the corpus carries the column | diff | Delete the column; keep the purpose sentence and the index of ids | `b8a71ea5` |
| 14 | Medium | `checkpoint-requires-decision` | `activities/13-submit-for-review.yaml:395` checkpoint `build-artifact-handoff` | Both options set `build_dependent_artifacts_pending: false` and nothing else, so the distinction they name — the user regenerated, versus the user owns regeneration — has no recorded effect. The preceding gate `build-artifact-check` set the flag this one only clears | pre-existing | Merge into `build-artifact-check`, or record the distinction the two options assert | `b8a71ea5` |
| 15 | Medium | `no-duplicate-technique-steps` | `activities/07-assumptions-review.yaml` steps `present-residual-assumptions` / `present-assumption`; same shape at `activities/08-implement.yaml` | Two binds of `review-assumptions::interview` distinguished only by the sub-mode input `assembly_mode` (`batch` / `interview`), which `interview.md` Protocol phase 3 branches on. The mutually-exclusive-`when` carve-out does not apply: a run can take the batch presentation and then choose `interview-individually`, reaching both | diff | Split into a group with one named op per mode, each declaring its own contract; gate the bind sites on the mode | `91dcced5` |
| 16 | Medium | `canonical-technique-reference` | `techniques/create-issue.md:52,54,73,75` | Protocol names raw Atlassian MCP primitives and sequences the calls — "call `getAccessibleAtlassianResources` FIRST to obtain cloudId", "THEN call `getJiraIssue`", "Do NOT call `getJiraIssue` before cloudId is resolved", "This MUST be the first Jira tool call", "list the available projects via `getVisibleJiraProjects`". `meta/techniques/atlassian-operations` wraps these, and `activities/01-start-work-package.yaml` binds `atlassian-operations::get-jira-issue`, `::user-info`, `::edit-jira-issue` and `::transition-jira-issue` as steps. The wrapper carve-out does not reach `create-issue`, which is not the op that owns the primitive | diff | Replace the raw names with the canonical hyperlinked wrapping ops; the sequencing is the wrapper's to own | `b8a71ea5` |
| 17 | Medium | `no-bind-mechanics-as-prose` | `techniques/create-issue.md:58` | "`{issue_platform}` arrives bound. Use it as given; do not re-ask." — tells the agent how the input is satisfied, and adds a session prohibition the technique cannot enforce | diff | Delete; the declared input is the contract | `b8a71ea5` |
| 18 | Medium | `io-agnostic-contract` | `techniques/review-assumptions/TECHNIQUE.md` inputs `activity_context`, `assumption_categories` | `activity_context` names a workflow-internal locus in its id and says nothing about the value it carries ("The context in which assumptions are generated"). `assumption_categories` adds "(supplied via `step.technique.inputs`)" and "Collection classifies each assumption into one of these categories", naming the sibling op that consumes it. The `identifier-qualification` guard passes both, since it tests noun-phrase shape rather than portability | diff | Rename `activity_context` to what the value is; drop the bind route and the sibling-op naming | `91dcced5` |
| 19 | Low | `backtick-code-tokens` | `activities/06-plan-prepare.yaml:67-76` step `env-prerequisites` | `run 'git worktree add ./workflows workflows'` — the only single-quoted shell command in a message anywhere in the corpus — plus `target_path`, `host_repo_path` and `planning_folder_path` bare in prose. `activities/01-start-work-package.yaml:715` uses the braced form in the same field, so the deviation is internal | diff | One backtick span per code token | `b8a71ea5` |
| 20 | Low | `one-decision-one-checkpoint` | `activities/13-submit-for-review.yaml:241,266` checkpoints `private-remote-confirmation`, `push-confirmation` | Both fire on `stealth_mode == true` with the same push-or-abort answer space. The only step between them is `verify-push-signatures`, whose `validate` already halts the run on an unsigned commit, so the second gate has nothing left for the user to settle | pre-existing | Merge into one gate whose message carries both facts | `b8a71ea5` |
| 21 | Low | `bag-value-as-literal` | `README.md`, "Appendix: Artifact Locations" | `.engineering/artifacts/comprehension` written out where the declared slot `comprehension_dir` — "Absolute path of the cumulative codebase-comprehension corpus, outside any one session's planning folder", set at `activities/15-codebase-comprehension.yaml` — carries the same meaning | diff | Reference the designator, leaving the declaration as the value's one home | `b8a71ea5` |

### Withdrawn on adversarial re-derivation

Recorded so a later pass does not re-raise them.

| Candidate | Why it fell |
|---|---|
| `one-decision-one-checkpoint` on `classification-confirmed` immediately followed by `workflow-path-selected` — the catalog entry's own exemplar names these two ids | The `decision-order` guard is the authority for a checkpoint deciding a value an earlier step already read, and it passes. On re-derivation the second gate's answer space (which discovery activities run) is not subsumed by the first's (accept or revise the classification) |
| `escape-literal-dollar` at `techniques/strategic-review/review-scope.md:41` | `{$base_branch}` sits inside an indented ```bash fence. The scan's fence pattern anchored at column zero and did not strip it — a scan defect, not a corpus one |
| `no-guide-wrapper-ceremony` on `resources/architecture-summary.md` | The `## Related Documents` heading sits inside the artifact Template fence: it is text the filler emits, not a wrapper section of the guide |
| `output-without-destination` on `discuss.md` output `stakeholder_transcript` | The group `TECHNIQUE.md` declares a same-named input, which the entry's Detect names as a destination |
| `duplicate-shared-capability` on `manage-git.code-commit-coauthor-trailer` | The trailer obligation and its harness branch are a domain invariant no shared op states, and no other file in the corpus states it |
| `pass-orchestration-in-technique` across 23 work-package techniques carrying 39 `Apply [op]` sites | Corpus form, not a local defect: `meta` itself carries 42 such sites across 38 files, and `apply-omits-declared-input` presupposes Protocol Apply sites are legitimate. A finding here is a finding against that convention, argued corpus-wide rather than against this workflow |
| `no-duplicate-technique-steps` on the three `review-assumptions::record` binds in `activities/07-assumptions-review.yaml` | The unconditional third bind is the converge-all-paths record, reached on the branch where neither of the first two fires — a distinct pipeline point |
| `resource-fills-not-does` on `## When to Create` in `resources/architecture-summary.md` | Corpus form: six resources across four workflows carry a "When to…" routing section |

## Coverage

### Divergences

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules family | `not-applicable` — its own text scopes it to authoring the catalogue; nothing here edits `anti-patterns.md` |
| Anti-Patterns | Execution family, excluding `structure-backed-constraints` | `not-applicable` — its entries key on authoring-session conduct (implementation before a confirmed approach, follow-through on a recommendation, format literacy, accepting a correction, README preservation), which a static definition tree cannot exhibit |
| Anti-Patterns | `cut-comment-jsdoc-verbosity` | `not-applicable` — the corpus holds no code |
| **All prose homes** | **every unit, over the 146 files not read whole** | `blocked` — see below |

### What the walk actually reached

Twenty-three files were read whole. The remaining 146 were reached only by Detect-derived scans, each validated against a control hit elsewhere in the corpus before its empty result on `work-package` was trusted. Those scans implement roughly twenty of the catalogue's tests. For every other entry, coverage over those 146 files is `blocked`, not clean — a `swept` path is bounded by what its scan could have found, never by what the file holds.

One demonstrated instance of that bound: the harness-tool scan enumerated the workflow-engine tool names and not the Atlassian ones, and returned a single hit across the whole target. Findings 16 and 17 were found by reading `create-issue.md`, not by the scan. A set short by one member returns the same empty result as a clean walk.

**Consequently, the remediation scope this register certifies is the 23 files read whole plus the specific scan-returned sites named above.** Fixes should not be swept across the unwalked region on the strength of this pass.

### File coverage

read 23 · swept 146 · unread 0 — summing to 169.

| Disposition | Paths |
|---|---|
| `read` | `workflow.yaml`; `README.md`; `REVIEW-MODE.md`; activities `01`, `02`, `03`, `06`, `07`, `09`, `11`, `12`, `13`, `15`; `techniques/README.md`; `techniques/TECHNIQUE.md`; `resources/README.md`; `finalize-documentation/TECHNIQUE.md`; `finalize-documentation/ensure-docs.md`; `manage-git/TECHNIQUE.md`; `manage-git/artifact-commits.md`; `review-assumptions/TECHNIQUE.md`; `review-assumptions/interview.md`; `review-assumptions/record.md`; `requirements-elicitation/discuss.md` |
| `swept` | The remaining 146. Activities `04`, `05`, `08`, `10`, `14` had their step, exit and outcome bodies read but not their variable blocks; `create-issue.md`, `review-diff.md`, `review-summary.md`, `commit-paths.md`, `apply-review-fixes.md`, `review-scope.md`, `architecture-summary.md`, `classify.md` had the cited constructs read in place. Scan terms: `Apply [` and `]::[`; Present / Surface / Show / Ask / Prompt phase openers; `## Protocol` and Overview / Purpose / Quality-Checklist headings in resources; links into `techniques/` and produced-by / Used-by / Composed-by prose in resources; unescaped `$` outside fences and code spans; workflow-engine tool names; markdown links, `{designators}` and directory paths inside `## Capability`; technique links and procedural imperatives inside `## Inputs` and `## Outputs`; checkpoint / activity / stage nouns in technique prose; README inventory counts and loader HOW; None and N/A rows; check-mark verdict rows; either-or value rosters; `step N` ordinals; environment-mutation commands; and a per-checkpoint option-effect distinctness enumeration across all 47 declared checkpoints |

## Consumer surface

Twenty-four files across ten workflows reference `work-package/` — chiefly `remediate-vuln`, which borrows work-package activities wholesale (as `tests/e2e/option-coverage.json` records in its exemption reason), plus `codebase-wiki`, `plain-language`, `prism-evaluate`, `workflow-authoring` and `workflow-design`. No I/O contract on the change surface changed in a way that reaches them, so none joined as a consumer. They were swept for cross-workflow reference resolution only; the `refs` and `resource-anchors` guards both pass over them.

## Adoption

Branch `workflow/work-package-canon-followups` carries the five fix commits. `npx tsx scripts/check-all.ts --root <worktree> --corpus-only` reports 31 of 32 corpus guards passing on it; the one failure is `binding-fidelity` reporting the two triaged cites now at `review-summary.md:99`, which no corpus edit can settle because the ledger lives in the code repo.

The code branch owes one adoption commit, and its parts move together:

| Move | Value |
|---|---|
| Submodule pointer | `workflows` to the merged corpus tip |
| Triage cites | `scripts/binding-fidelity-triage.json` — both `read-resolution` entries for `review-summary.md` to line `99` |
| Reasoned exemptions | `tests/e2e/option-coverage.json` — drop the five work-package entries PRs #622 and #623 made reachable, plus any option this change retires (`push-confirmation` merged into `private-push-confirmation`) |
| Walk baseline and stamp | re-record, then `npm run baseline:stamp` in the same commit |

The walk was re-run against the corpus branch in a provisioned worktree to establish the option set the exemption list has to shrink to; its verdict is in the [reconciliation](./prior-pass-reconciliation.md#the-walk-against-the-fix-branch).

## Sources

| Label | Path |
|---|---|
| Guard suite, pinned corpus | `npm run check:all` in a provisioned worktree at `69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6` — 36 pass, 0 fail, 0 unmeasured |
| Guard suite, corpus branch | `npx tsx scripts/check-all.ts --root <worktree> --corpus-only` — 31 of 32 pass; the failure is the ledger cite the adoption commit owns |
| Option-coverage walk | `npm run test:coverage-walk` against `c1d07a291510eb13d9ec6e49c73a5aed55b3c538` — exit 1, 2 of 2 tests failed, both corpus-ahead-of-pointer; re-run against the fix branch |
| Binding-fidelity triage ledger | `scripts/binding-fidelity-triage.json` — settles C1 and the two entries at `review-summary.md` |
| Reasoned exemption list | `tests/e2e/option-coverage.json` — records which work-package checkpoint options a walk is not required to reach, and why |
| Criteria homes | `workflows/workflow-design/resources/{design-principles,anti-patterns,schema-construct-inventory,convention-conformance}.md` |
| Guard registry | `scripts/guards.ts` |
| Prior pass | [../2026-09-05-canon-audit-work-package/findings-register.md](../2026-09-05-canon-audit-work-package/findings-register.md) |
| Prior-pass attribution | [prior-pass-reconciliation.md](./prior-pass-reconciliation.md) |
