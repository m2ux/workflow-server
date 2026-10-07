# Structured-Condition Survey

The disposition of every step in the corpus carrying a structured `condition`, with the measurement behind each one. Nothing is converted here; the conversion work reads this.

## Subject

| | |
| --- | --- |
| Corpus | `i04/workflows` at `860e107b` |
| Engine | `i04/main` at `1caa9ff5` |
| Taken | 2026-10-07 |

`i04/workflows` is the definitions branch `verify.yml` checks out for a change based on `i04/main`, so it is the tree the conversion will edit and the tree this survey is of. `workflows` is a different tree: 30 of the sites below read differently there, which is why the record names its corpus.

## Method

The enumeration and the three measurements are a program, not a reading. `guards/condition-sites.ts` holds them and `guards/check-condition-survey.ts` grades the record against them on every run.

- **The site list.**
  Every activity and routine definition under each namespace of the corpus is parsed and its step list walked, loop bodies included. A site is a step carrying `condition` as its own key. An action's `condition` inside `actions:`, and a loop's `continueWhile` and `breakCondition`, are not step gates and are out of scope, as the epic states.
- **The vacuity sweep.**
  Each variable a gate tests is given the states its declaration admits: absent unless a `defaultValue` seeds it, each member of a declared `values` set, `true` and `false` for a boolean, and one state standing for any value where the declaration closes none. The gate is evaluated over the product of those states in three-valued logic, where an unpinned value yields `unknown` rather than a guess. A gate no assignment falsifies and no assignment leaves `unknown` could not be false, and is removed; any other gate converts.
- **The dismissal reading.**
  A `condition_not_met` dismissal selects no option, so `respond_checkpoint` applies no `setVariable`, records no reply and names no exit. Per site the survey records what a chosen option would have written, the exit a dismissal falls to, and which of those writes some other gate in the same activity tests.

## What the corpus holds

74 sites across 10 workflows.

| Workflow | Sites |
| --- | --- |
| `work-package` | 40 |
| `workflow-design` | 13 |
| `workflow-authoring` | 8 |
| `plain-language` | 5 |
| `remediate-vuln` | 3 |
| `codebase-wiki` | 1 |
| `midnight-system-review` | 1 |
| `prism` | 1 |
| `prism-audit` | 1 |
| `requirements-refinement` | 1 |

| Step kind | Sites |
| --- | --- |
| `checkpoint` | 63 |
| `technique` | 8 |
| `action` | 3 |

## Dispositions

| Disposition | Sites |
| --- | --- |
| convert | 74 |
| remove | 0 |

Every site converts. No gate in this corpus could not be false, and that is a measured result rather than an absence of looking: 66 sites carry an assignment that falsifies them outright, and the remaining 8 test a variable whose declaration closes no value set, so the sweep reaches `unknown` and cannot call the gate vacuous. A gate the sweep cannot bound converts, because nothing proved it could not be false.

The reason the vacuous case is empty is itself in the corpus rules. `check:variable-model` holds the corpus at zero `exists-on-defaulted` gates — a presence test on a seeded variable — and that is the one shape that makes a structured gate constant without making it obviously so. The guard that forbids it is why the survey finds none.

## What a dismissal leaves behind

Nothing downstream reads a dismissal record, at any of the 63 checkpoint sites. Two facts carry that, and both were measured rather than assumed.

- **A dismissal writes nothing a definition can see.**
  The dismissal branch of `respond_checkpoint` selects no option, so no `setVariable` is applied, no `recordReply` is written and no exit is named. The run falls to the activity's default exit, which is equally where an unmatched predicate goes.
- **Every reader of a response reads an effect a dismissal never records.**
  `projectCheckpoints`, `resume_checkpoint` and `immediateExitCut` all read `effects.variablesSet` or `effects.exit`. A dismissal records neither, only the `__condition_not_met__` sentinel under `optionId`. The sentinel is read by `present_checkpoint`, to stop a checkpoint already answered in this activity visit being presented twice, and reported by the status view — both engine bookkeeping, and neither addressable from a definition.

So the per-site question is what a dismissal withholds, and whether anything in the activity looks at it. Three readings cover the 63 sites:

| Reading | Sites | What it says |
| --- | --- | --- |
| nothing set | 10 | The checkpoint writes no variable at all, so a dismissal leaves the activity exactly where a chosen option would. |
| writes untested | 21 | The dismissal withholds the option writes, and no gate in the activity tests one of them. |
| writes read unset | 32 | The dismissal withholds the option writes and gates in the activity test them, but what those gates read is the variable left unset — the state any unchosen option leaves. The dismissal record itself is addressed by nothing. |

The third class is the one worth stating plainly, because it is the closest the corpus comes to a load-bearing dismissal. At `work-package` `review-mode-detection`, for instance, a dismissal withholds `is_review_mode` and `needs_review_mode`, and twenty-odd steps test `is_review_mode`. Those steps read an unset variable, which is what they would read had the checkpoint been reached and left unanswered by any option that sets it. Nothing reads *that it was dismissed*.

## What the conversion inherits

- Each row's gate becomes the equivalent `when` expression on the same step. The Sweep column names an assignment the gate reads false under, which is the obligation a converted gate has to keep.
- 63 of the 74 are checkpoints, and each loses its dismissibility with its `condition`. The reading above is the evidence that nothing is lost with it.
- 8 sites test a variable with no declared value set. A differential test over those sites has no finite domain to enumerate, so it samples; the sweep records which variable is unbounded at each.

## Sites

The per-site record the guard grades is `guards/condition-survey.ts` on `i04/main`. This table is that record as it stood at `860e107b`.

| File | Definition | Step | Kind | Disposition | Sweep | Dismissal reading |
| --- | --- | --- | --- | --- | --- | --- |
| `codebase-wiki/activities/03-lint-wiki.yaml` | `lint-wiki` | `lint-findings-confirmed` | checkpoint | convert | undetermined: lint_findings_count unbounded | writes read unset |
| `midnight-system-review/activities/07-verdict-and-report.yaml` | `verdict-and-report` | `publish-decision` | checkpoint | convert | falsifiable: has_pr_surface=false | writes read unset |
| `plain-language/activities/01-intake-and-profile.yaml` | `intake-and-profile` | `intent-and-profile-batch` | checkpoint | convert | falsifiable: intent_needs_confirmation=false | writes read unset |
| `plain-language/activities/02-source-analysis.yaml` | `source-analysis` | `analysis-reviewed` | checkpoint | convert | falsifiable: operation_type="<absent>" | writes read unset |
| `plain-language/activities/04-evaluate.yaml` | `evaluate` | `evaluate-revise-loop/count-revision-round` | action | convert | falsifiable: needs_revision=false | — |
| `plain-language/activities/04-evaluate.yaml` | `evaluate` | `evaluate-revise-loop/revise-document` | technique | convert | falsifiable: needs_revision=false | — |
| `plain-language/activities/04-evaluate.yaml` | `evaluate` | `evaluation-gate` | checkpoint | convert | undetermined: open_issue_count unbounded | writes read unset |
| `prism-audit/activities/01-prompt-generation.yaml` | `prompt-generation` | `no-security-characteristics` | checkpoint | convert | undetermined: security_characteristics_count unbounded | nothing set |
| `prism/activities/00-select-mode.yaml` | `select-mode` | `confirm-mode` | checkpoint | convert | falsifiable: pipeline_mode="single" | writes read unset |
| `remediate-vuln/activities/01-start.yaml` | `start` | `private-fork-url-input` | checkpoint | convert | falsifiable: private_fork_url="<any>" | writes untested |
| `remediate-vuln/activities/01-start.yaml` | `start` | `sec-vuln-url-input` | checkpoint | convert | falsifiable: sec_vuln_url="<any>" | writes untested |
| `remediate-vuln/activities/01-start.yaml` | `start` | `short-id-input` | checkpoint | convert | falsifiable: short_id="<any>" | writes untested |
| `requirements-refinement/activities/01-intake.yaml` | `intake` | `target-doc-named` | checkpoint | convert | falsifiable: target_doc_path="<any>" | writes untested |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `announce-derived-review-pr` | action | convert | falsifiable: is_review_mode=true, needs_review_pr=true, pr_number="<absent>" | — |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `capture-pr-reference` | technique | convert | falsifiable: is_review_mode=false, review_pr_captured=true, branch_name="<absent>" | — |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `detect-provided-issue-reference` | technique | convert | falsifiable: is_review_mode=true, issue_present=true, needs_issue_creation=true, issue_creation_declined=true, issue_platform="<absent>" | — |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `github-issue-missing` | checkpoint | convert | falsifiable: is_review_mode=true, issue_platform="<absent>", github_issue_found=true | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `issue-review` | checkpoint | convert | falsifiable: is_review_mode=true, needs_issue_creation=true | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `issue-type-selection` | checkpoint | convert | falsifiable: needs_issue_creation=false, needs_issue_type=false | writes untested |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `issue-verification` | checkpoint | convert | falsifiable: is_review_mode=true, issue_present=true | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `jira-project-selection` | checkpoint | convert | falsifiable: issue_platform="<absent>", needs_issue_creation=true | writes untested |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `link-pr-to-ticket-github` | technique | convert | falsifiable: is_review_mode=true, pr_number="<absent>", issue_creation_declined=true, issue_platform="<absent>" | — |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `link-pr-to-ticket-jira` | technique | convert | falsifiable: is_review_mode=true, pr_number="<absent>", issue_creation_declined=true, issue_platform="<absent>" | — |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `mark-review-pr-captured` | action | convert | falsifiable: is_review_mode=true, needs_review_pr=true, pr_number="<absent>" | — |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `platform-selection` | checkpoint | convert | falsifiable: needs_issue_creation=false | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `pr-check` | checkpoint | convert | falsifiable: pr_exists=true, use_existing_pr=true | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `pr-creation` | checkpoint | convert | falsifiable: is_review_mode=true, issue_cancelled=true, use_existing_pr=true | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `review-mode-detection` | checkpoint | convert | falsifiable: needs_review_mode=false | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `review-pr-reference` | checkpoint | convert | falsifiable: is_review_mode=false, needs_review_pr=true | writes read unset |
| `work-package/activities/01-start-work-package.yaml` | `start-work-package` | `update-repo-submodules` | technique | convert | falsifiable: host_repo_path="<absent>" | — |
| `work-package/activities/02-design-philosophy.yaml` | `design-philosophy` | `classification-confirmed` | checkpoint | convert | falsifiable: is_review_mode=true | nothing set |
| `work-package/activities/02-design-philosophy.yaml` | `design-philosophy` | `ticket-completeness` | checkpoint | convert | falsifiable: is_review_mode=false, ticket_gaps_documented=true | writes untested |
| `work-package/activities/02-design-philosophy.yaml` | `design-philosophy` | `workflow-path-selected` | checkpoint | convert | falsifiable: is_review_mode=true | writes untested |
| `work-package/activities/06-plan-prepare.yaml` | `plan-prepare` | `approach-confirmed` | checkpoint | convert | falsifiable: is_review_mode=true | nothing set |
| `work-package/activities/06-plan-prepare.yaml` | `plan-prepare` | `context-scope-declaration` | checkpoint | convert | falsifiable: needs_context_scope=false | writes untested |
| `work-package/activities/06-plan-prepare.yaml` | `plan-prepare` | `research-reconciliation/research-convergence` | checkpoint | convert | falsifiable: has_reconcilable_research=true | writes read unset |
| `work-package/activities/07-assumptions-review.yaml` | `assumptions-review` | `post-summary-review` | checkpoint | convert | falsifiable: stealth_mode=true, is_review_mode=true, issue_platform="<absent>", has_deferred_assumptions=true | writes read unset |
| `work-package/activities/09-lean-coding-audit.yaml` | `lean-coding-audit` | `audit-findings-confirmed` | checkpoint | convert | falsifiable: is_review_mode=true | writes untested |
| `work-package/activities/10-post-impl-review.yaml` | `post-impl-review` | `local-validation-permission` | checkpoint | convert | falsifiable: has_critical_blocker=true | writes untested |
| `work-package/activities/12-strategic-review.yaml` | `strategic-review` | `findings-delivery` | checkpoint | convert | falsifiable: is_review_mode=false, strategic_findings_summary="<any>" | writes read unset |
| `work-package/activities/12-strategic-review.yaml` | `strategic-review` | `read-live-pr-body` | technique | convert | falsifiable: pr_number="<absent>" | — |
| `work-package/activities/12-strategic-review.yaml` | `strategic-review` | `review-findings` | checkpoint | convert | falsifiable: is_review_mode=true, strategic_findings_summary="<any>" | writes read unset |
| `work-package/activities/12-strategic-review.yaml` | `strategic-review` | `verify-pr-body` | technique | convert | falsifiable: pr_number="<absent>" | — |
| `work-package/activities/13-submit-for-review.yaml` | `submit-for-review` | `await-review-loop/review-received` | checkpoint | convert | falsifiable: is_review_mode=true, stealth_mode=true | writes untested |
| `work-package/activities/13-submit-for-review.yaml` | `submit-for-review` | `body-non-conformant` | checkpoint | convert | falsifiable: is_review_mode=true, stealth_mode=true, body_conforms=true | writes untested |
| `work-package/activities/13-submit-for-review.yaml` | `submit-for-review` | `build-artifact-check` | checkpoint | convert | falsifiable: is_review_mode=true, stealth_mode=true, project_type="<absent>" | writes read unset |
| `work-package/activities/13-submit-for-review.yaml` | `submit-for-review` | `dco-sign-off-confirmation` | checkpoint | convert | falsifiable: is_review_mode=true | writes untested |
| `work-package/activities/13-submit-for-review.yaml` | `submit-for-review` | `private-push-confirmation` | checkpoint | convert | falsifiable: stealth_mode=false | nothing set |
| `work-package/activities/13-submit-for-review.yaml` | `submit-for-review` | `review-outcome` | checkpoint | convert | falsifiable: is_review_mode=true, stealth_mode=true | writes read unset |
| `work-package/activities/15-codebase-comprehension.yaml` | `codebase-comprehension` | `deep-dive-iteration/comprehension-sufficient` | checkpoint | convert | falsifiable: has_open_questions=false | writes untested |
| `work-package/activities/16-prism-decision.yaml` | `prism-decision` | `full-prism-decision` | checkpoint | convert | falsifiable: problem_complexity="<absent>", is_review_mode=true | writes untested |
| `work-package/activities/21-implementation-join.yaml` | `implementation-join` | `provenance-settle-cycle/provenance-retry/symbol-provenance-confirmed` | checkpoint | convert | falsifiable: needs_symbol_confirmation=false | writes untested |
| `work-package/routines/residual-assumption-interview.yaml` | `residual-assumption-interview` | `batch-gate` | checkpoint | convert | falsifiable: is_review_mode=true, has_open_assumptions="<absent>" | writes read unset |
| `workflow-authoring/activities/01-intake-and-context.yaml` | `intake-and-context` | `design-intent-batch` | checkpoint | convert | falsifiable: intent_needs_confirmation=true, update_seeded_from_review=true | writes read unset |
| `workflow-authoring/activities/01-intake-and-context.yaml` | `intake-and-context` | `impact-approved` | checkpoint | convert | undetermined: removal_count unbounded | writes untested |
| `workflow-authoring/activities/01-intake-and-context.yaml` | `intake-and-context` | `judgements-disposition` | checkpoint | convert | undetermined: open_judgements_count unbounded | writes untested |
| `workflow-authoring/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `file-drafting-loop/preservation-check#{current_file.path}` | checkpoint | convert | falsifiable: has_unflagged_removals=false | writes read unset |
| `workflow-authoring/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `scope-confirmed#{scope_round}` | checkpoint | convert | undetermined: operation_type unbounded | writes read unset |
| `workflow-authoring/activities/09-validate-and-commit.yaml` | `validate-and-commit` | `approve-to-commit#{remediation_round}` | checkpoint | convert | falsifiable: operation_type="<absent>", remediation_selected=true, review_closed=true, update_seeded_from_review=true, has_critical_finding=true | writes read unset |
| `workflow-authoring/activities/09-validate-and-commit.yaml` | `validate-and-commit` | `audit-disposition#{remediation_round}` | checkpoint | convert | undetermined: open_finding_count unbounded | writes read unset |
| `workflow-authoring/activities/09-validate-and-commit.yaml` | `validate-and-commit` | `review-disposition` | checkpoint | convert | falsifiable: operation_type="<absent>" | writes read unset |
| `workflow-design/activities/01-intake-and-context.yaml` | `intake-and-context` | `design-intent-batch` | checkpoint | convert | falsifiable: intent_needs_confirmation=true, update_seeded_from_review=true | writes read unset |
| `workflow-design/activities/03-requirements-refinement.yaml` | `requirements-refinement` | `design-context` | checkpoint | convert | falsifiable: operation_type="update" | writes untested |
| `workflow-design/activities/05-impact-analysis.yaml` | `impact-analysis` | `impact-and-preservation-confirmed` | checkpoint | convert | undetermined: removal_count unbounded | writes untested |
| `workflow-design/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `batch-review-attested` | checkpoint | convert | falsifiable: operation_type="<absent>" | nothing set |
| `workflow-design/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `draft-attestation` | checkpoint | convert | falsifiable: operation_type="update" | nothing set |
| `workflow-design/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `file-drafting-loop/file-approach-confirmed` | checkpoint | convert | falsifiable: operation_type="update" | writes read unset |
| `workflow-design/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `file-drafting-loop/file-review` | checkpoint | convert | falsifiable: operation_type="update" | writes read unset |
| `workflow-design/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `file-drafting-loop/preservation-check` | checkpoint | convert | falsifiable: operation_type="<absent>", has_unflagged_removals=true | writes read unset |
| `workflow-design/activities/06-scope-and-draft.yaml` | `scope-and-draft` | `pre-attestation-blocker` | checkpoint | convert | falsifiable: has_critical_principle_finding=false, has_critical_anti_pattern_finding=false | nothing set |
| `workflow-design/activities/08-quality-review.yaml` | `quality-review` | `review-disposition` | checkpoint | convert | falsifiable: operation_type="<absent>" | writes read unset |
| `workflow-design/activities/09-validate-and-commit.yaml` | `validate-and-commit` | `approve-to-commit` | checkpoint | convert | falsifiable: operation_type="review" | nothing set |
| `workflow-design/activities/09-validate-and-commit.yaml` | `validate-and-commit` | `scope-verified` | checkpoint | convert | falsifiable: operation_type="review", unaddressed_count="<any>" | nothing set |
| `workflow-design/activities/09-validate-and-commit.yaml` | `validate-and-commit` | `validation-passed` | checkpoint | convert | falsifiable: operation_type="review", fail_count="<any>" | nothing set |
