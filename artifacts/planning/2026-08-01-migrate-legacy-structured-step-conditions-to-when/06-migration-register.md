# Migration Register — Corpus condition-to-when step-gate migration

**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md) · [scope manifest](06-scope-manifest.md)
**Baseline:** branch `workflow/338-when-migration` @ `e2e70e68` — every row's Class and was-predicate are read from this ref
**Edit branch:** `workflow/corpus-when-migration`

Every structured step-condition site in the corpus — a `condition:` block on a step (checkpoint, technique, action or loop) — has exactly one row below. Sites that are not step conditions (workflow-level `transitions[].condition`, decision-branch conditions, and `condition` on individual `action: validate` items) are outside the 238 by the [change brief](01-change-brief.md)'s scoping and take no rows.

## Totals

| Disposition | Count |
|-------------|-------|
| Migrated to `when:` | 149 |
| Kept — checkpoint gate (dismissal seam) | 63 |
| Kept — `while`/`doWhile` continuation predicate | 17 |
| Kept — exists-shaped predicate | 8 |
| Kept — OR-shaped compound (no live `when` precedent) | 0 |
| Kept — NOT-shaped compound (no live `when` precedent) | 1 |
| **Total structured step-condition sites** | **238** |

Kept-class reasons are the [change brief](01-change-brief.md)'s Out-of-scope rulings; each row restates only its class. Checkpoint sites stay structured until server PR `feat/when-merge-rule-fragments-ap134-guard` merges (co-change constraint).

**PR [#383](https://github.com/m2ux/workflow-server/pull/383) accounting:** the four OR-shaped step gates that this register originally kept (no live `||` precedent) are now migrated to parenthesized `when:` via cherry-pick of `d891ed73` (`feat(workflows): migrate four OR step gates to parenthesized when`). Host carries the shared `when-expression` evaluator and `check:when` guard; mixed `&&`/`||` without parentheses is a hard fail. The NOT-shaped keep on `structural-analysis-inline` is unchanged.

## Reconciliation with the impact analysis

The [impact analysis](01-impact-analysis.md) estimated 152 migratable candidates and 6 exists-shaped sites; draft-time classification against each site's actual predicate resolves the same 238 sites as 145 migrated + 93 kept:

- `meta/activities/00-discover-session.yaml` — estimated 1 plain step gate; actually holds only kept-class sites (3 checkpoint gates, 2 exists action gates), so the file drops out of the edit set (30 activity files edited, not 31).
- Exists-shaped sites number 8 (6 in `work-package`, 2 in `meta`), two more than estimated; they were counted inside the 152.
- 5 compound sites were OR/NOT-shaped at first draft (4 OR + 1 NOT). After [PR #383](https://github.com/m2ux/workflow-server/pull/383), the 4 OR sites migrate to parenthesized `when:`; the NOT-shaped site stays structured.

## Dispositions

### `work-package` — 116 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/01-start-work-package.yaml` | `announce-derived-review-mode` | step gate | migrated -> `when: is_review_mode == true && review_mode_ambiguous != true` |
| 2 | `activities/01-start-work-package.yaml` | `announce-derived-review-pr` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `is_review_mode == true && review_pr_missing != true && pr_number exists` |
| 3 | `activities/01-start-work-package.yaml` | `review-mode-detection` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `review_mode_ambiguous == true` |
| 4 | `activities/01-start-work-package.yaml` | `mark-review-pr-captured` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `is_review_mode == true && review_pr_missing != true && pr_number exists` |
| 5 | `activities/01-start-work-package.yaml` | `review-pr-reference` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode == true && review_pr_missing == true` |
| 6 | `activities/01-start-work-package.yaml` | `capture-pr-reference` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `is_review_mode == true && review_pr_captured == true && branch_name notExists` |
| 7 | `activities/01-start-work-package.yaml` | `ingest-prior-feedback` | step gate | migrated -> `when: is_review_mode == true` |
| 8 | `activities/01-start-work-package.yaml` | `seed-review-mode-outcomes` | step gate | migrated -> `when: is_review_mode == true` |
| 9 | `activities/01-start-work-package.yaml` | `update-repo-submodules` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `host_repo_path exists` |
| 10 | `activities/01-start-work-package.yaml` | `issue-verification` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && issue_present == false` |
| 11 | `activities/01-start-work-package.yaml` | `verify-jira-issue` | step gate | migrated -> `when: issue_platform == 'jira'` |
| 12 | `activities/01-start-work-package.yaml` | `verify-github-issue` | step gate | migrated -> `when: issue_platform == 'github'` |
| 13 | `activities/01-start-work-package.yaml` | `search-github-issue` | step gate | migrated -> `when: issue_platform == 'jira'` |
| 14 | `activities/01-start-work-package.yaml` | `github-issue-missing` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && issue_platform == "jira" && github_issue_found == false` |
| 15 | `activities/01-start-work-package.yaml` | `create-github-issue-for-jira` | step gate | migrated -> `when: needs_github_issue_creation == true` |
| 16 | `activities/01-start-work-package.yaml` | `jira-project-selection` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `issue_platform == "jira"` |
| 17 | `activities/01-start-work-package.yaml` | `derive-issue-type` | step gate | migrated -> `when: is_review_mode != true && needs_issue_creation != true && issue_skipped != true` |
| 18 | `activities/01-start-work-package.yaml` | `issue-type-selection` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `needs_issue_creation == true || issue_type_ambiguous == true` |
| 19 | `activities/01-start-work-package.yaml` | `issue-review` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && needs_issue_creation == true` |
| 20 | `activities/01-start-work-package.yaml` | `create-issue` | step gate | migrated -> `when: needs_issue_creation == true` |
| 21 | `activities/01-start-work-package.yaml` | `platform-selection` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `needs_issue_creation == true` |
| 22 | `activities/01-start-work-package.yaml` | `assign-issue-jira` | step gate | migrated -> `when: issue_skipped != true && issue_platform == 'jira'` |
| 23 | `activities/01-start-work-package.yaml` | `transition-issue-jira` | step gate | migrated -> `when: issue_skipped != true && issue_platform == 'jira'` |
| 24 | `activities/01-start-work-package.yaml` | `assign-issue-github` | step gate | migrated -> `when: issue_skipped != true && issue_platform == 'github'` |
| 25 | `activities/01-start-work-package.yaml` | `derive-branch-name` | step gate | migrated -> `when: is_review_mode != true` |
| 26 | `activities/01-start-work-package.yaml` | `create-component-worktree` | step gate | migrated -> `when: is_review_mode != true` |
| 27 | `activities/01-start-work-package.yaml` | `create-review-worktree` | step gate | migrated -> `when: is_review_mode == true` |
| 28 | `activities/01-start-work-package.yaml` | `check-pr` | step gate | migrated -> `when: is_review_mode != true` |
| 29 | `activities/01-start-work-package.yaml` | `announce-auto-use-existing-pr` | step gate | migrated -> `when: pr_exists == true && use_existing_pr == true` |
| 30 | `activities/01-start-work-package.yaml` | `pr-check` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `pr_exists == true && use_existing_pr != true` |
| 31 | `activities/01-start-work-package.yaml` | `pr-creation` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && issue_cancelled != true && use_existing_pr != true` |
| 32 | `activities/01-start-work-package.yaml` | `create-pr` | step gate | migrated -> `when: is_review_mode != true && use_existing_pr == false && pr_skipped != true` |
| 33 | `activities/01-start-work-package.yaml` | `link-pr-to-ticket-jira` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `is_review_mode != true && pr_number exists && issue_skipped != true && issue_platform == "jira"` |
| 34 | `activities/01-start-work-package.yaml` | `link-pr-to-ticket-github` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `is_review_mode != true && pr_number exists && issue_skipped != true && issue_platform == "github"` |
| 35 | `activities/02-design-philosophy.yaml` | `classification-and-path-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true` |
| 36 | `activities/02-design-philosophy.yaml` | `assess-ticket-completeness` | step gate | migrated -> `when: is_review_mode == true` |
| 37 | `activities/02-design-philosophy.yaml` | `ticket-completeness` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode == true && ticket_gaps_documented == true` |
| 38 | `activities/02-design-philosophy.yaml` | `set-review-mode-path` | step gate | migrated -> `when: is_review_mode == true` |
| 39 | `activities/03-requirements-elicitation.yaml` | `assumption-reconciliation` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `has_resolvable_assumptions == true` |
| 40 | `activities/04-research.yaml` | `research-reconciliation` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `has_reconcilable_research == true` |
| 41 | `activities/04-research.yaml` | `research-convergence` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_reconcilable_research == false` |
| 42 | `activities/04-research.yaml` | `announce-derived-context-scope` | step gate | migrated -> `when: context_scope_uncertain != true` |
| 43 | `activities/04-research.yaml` | `context-scope-declaration` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `context_scope_uncertain == true` |
| 44 | `activities/04-research.yaml` | `record-batch-response` | step gate | migrated -> `when: has_open_assumptions == true && needs_individual_interview != true` |
| 45 | `activities/04-research.yaml` | `assumption-interview` | forEach entry gate | migrated -> `when: needs_individual_interview == true && has_open_assumptions == true` |
| 46 | `activities/05-implementation-analysis.yaml` | `review-baseline-state` | step gate | migrated -> `when: is_review_mode == true` |
| 47 | `activities/05-implementation-analysis.yaml` | `record-batch-response` | step gate | migrated -> `when: is_review_mode != true && has_open_assumptions == true && needs_individual_interview != true` |
| 48 | `activities/05-implementation-analysis.yaml` | `assumption-interview` | forEach entry gate | migrated -> `when: is_review_mode != true && needs_individual_interview == true && has_open_assumptions == true` |
| 49 | `activities/06-plan-prepare.yaml` | `update-pr` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 50 | `activities/06-plan-prepare.yaml` | `approach-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true` |
| 51 | `activities/07-assumptions-review.yaml` | `present-residual-assumptions` | step gate | migrated -> `when: is_review_mode != true && has_open_assumptions == true` |
| 52 | `activities/07-assumptions-review.yaml` | `record-batch-decision` | step gate | migrated -> `when: is_review_mode != true && has_open_assumptions == true && needs_individual_interview != true` |
| 53 | `activities/07-assumptions-review.yaml` | `assumption-interview-loop` | forEach entry gate | migrated -> `when: is_review_mode != true && needs_individual_interview == true && has_open_assumptions == true` |
| 54 | `activities/07-assumptions-review.yaml` | `assumption-decision#{current_assumption.id}` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true` |
| 55 | `activities/07-assumptions-review.yaml` | `post-summary-jira` | step gate | migrated -> `when: stealth_mode != true && is_review_mode != true && issue_platform == 'jira' && has_deferred_assumptions == true && post_jira_comment != false` |
| 56 | `activities/07-assumptions-review.yaml` | `post-summary-review` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `stealth_mode != true && is_review_mode != true && issue_platform exists && has_deferred_assumptions == true` |
| 57 | `activities/07-assumptions-review.yaml` | `post-summary-github` | step gate | migrated -> `when: stealth_mode != true && is_review_mode != true && issue_platform == 'github' && has_deferred_assumptions == true` |
| 58 | `activities/08-implement.yaml` | `symbol-provenance-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_uncertain_symbols == true` |
| 59 | `activities/08-implement.yaml` | `record-batch-response` | step gate | migrated -> `when: has_open_assumptions == true && needs_individual_interview != true` |
| 60 | `activities/08-implement.yaml` | `assumption-interview` | forEach entry gate | migrated -> `when: needs_individual_interview == true && has_open_assumptions == true` |
| 61 | `activities/09-lean-coding-audit.yaml` | `audit-findings-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true` |
| 62 | `activities/09-lean-coding-audit.yaml` | `simplification-apply-cycle` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `needs_simplification == true` |
| 63 | `activities/10-post-impl-review.yaml` | `block-interview-loop` | forEach entry gate | migrated -> `when: has_flagged_blocks == true` |
| 64 | `activities/10-post-impl-review.yaml` | `structural-analysis-inline` | step gate | kept — NOT combinator has no live `when` precedent — was `!(problem_complexity == "complex")` |
| 65 | `activities/10-post-impl-review.yaml` | `dispatch-prism` | step gate | migrated -> `when: problem_complexity == 'complex'` |
| 66 | `activities/10-post-impl-review.yaml` | `review-fix-cycle` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `needs_code_fixes == true || needs_test_improvements == true` |
| 67 | `activities/10-post-impl-review.yaml` | `architecture-summary` | step gate | migrated -> `when: skip_architecture_summary != true` |
| 68 | `activities/10-post-impl-review.yaml` | `local-validation-permission` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_critical_blocker != true` |
| 69 | `activities/11-validate.yaml` | `document-failures` | step gate | migrated -> `when: is_review_mode == true` |
| 70 | `activities/11-validate.yaml` | `assess-test-coverage` | step gate | migrated -> `when: is_review_mode == true` |
| 71 | `activities/11-validate.yaml` | `triage-reported-failures` | step gate | migrated -> `when: is_review_mode == true` |
| 72 | `activities/11-validate.yaml` | `fix-failures` | step gate | migrated -> `when: is_review_mode != true && run_local_validation == true && validation_results.validation_passed == false` |
| 73 | `activities/11-validate.yaml` | `fix-revalidate-cycle` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `run_local_validation == true && validation_results.validation_passed == false` |
| 74 | `activities/12-strategic-review.yaml` | `refresh-pr-body` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 75 | `activities/12-strategic-review.yaml` | `unsigned-commits-prompt` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && unsigned_commits_in_pr == true` |
| 76 | `activities/12-strategic-review.yaml` | `resign-unsigned-commits` | step gate | migrated -> `when: is_review_mode != true && resign_unsigned_commits_requested == true` |
| 77 | `activities/12-strategic-review.yaml` | `document-cleanup-recommendations` | step gate | migrated -> `when: is_review_mode == true` |
| 78 | `activities/12-strategic-review.yaml` | `apply-cleanup` | step gate | migrated -> `when: is_review_mode != true` |
| 79 | `activities/12-strategic-review.yaml` | `review-findings` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `strategic_findings_summary != ""` |
| 80 | `activities/13-submit-for-review.yaml` | `consolidate-review-findings` | step gate | migrated -> `when: is_review_mode == true` |
| 81 | `activities/13-submit-for-review.yaml` | `resolve-artifact-publish` | step gate | migrated -> `when: is_review_mode == true` |
| 82 | `activities/13-submit-for-review.yaml` | `commit-review-artifacts` | step gate | migrated -> `when: is_review_mode == true` |
| 83 | `activities/13-submit-for-review.yaml` | `generate-review-summary` | step gate | migrated -> `when: is_review_mode == true` |
| 84 | `activities/13-submit-for-review.yaml` | `present-summary-to-user` | step gate | migrated -> `when: is_review_mode == true` |
| 85 | `activities/13-submit-for-review.yaml` | `review-summary-approval` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode == true` |
| 86 | `activities/13-submit-for-review.yaml` | `persist-review-summary` | step gate | migrated -> `when: is_review_mode == true && review_posted == true` |
| 87 | `activities/13-submit-for-review.yaml` | `post-pr-review` | step gate | migrated -> `when: is_review_mode == true && review_posted == true` |
| 88 | `activities/13-submit-for-review.yaml` | `dco-sign-off-confirmation` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true` |
| 89 | `activities/13-submit-for-review.yaml` | `dco-sign-off` | step gate | migrated -> `when: is_review_mode != true` |
| 90 | `activities/13-submit-for-review.yaml` | `verify-push-remote` | step gate | migrated -> `when: stealth_mode == true` |
| 91 | `activities/13-submit-for-review.yaml` | `private-remote-confirmation` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `stealth_mode == true` |
| 92 | `activities/13-submit-for-review.yaml` | `verify-push-signatures` | step gate | migrated -> `when: stealth_mode == true` |
| 93 | `activities/13-submit-for-review.yaml` | `push-confirmation` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `stealth_mode == true` |
| 94 | `activities/13-submit-for-review.yaml` | `push-commits` | step gate | migrated -> `when: is_review_mode != true` |
| 95 | `activities/13-submit-for-review.yaml` | `update-description` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 96 | `activities/13-submit-for-review.yaml` | `verify-pr-body-rerender` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `body_conforms == false` |
| 97 | `activities/13-submit-for-review.yaml` | `body-non-conformant` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && stealth_mode != true && body_conforms == false` |
| 98 | `activities/13-submit-for-review.yaml` | `instruct-merge-strategy` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 99 | `activities/13-submit-for-review.yaml` | `merge-strategy-guidance` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 100 | `activities/13-submit-for-review.yaml` | `build-artifact-check` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && stealth_mode != true` |
| 101 | `activities/13-submit-for-review.yaml` | `build-artifact-handoff` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && stealth_mode != true && build_dependent_artifacts_pending == true` |
| 102 | `activities/13-submit-for-review.yaml` | `mark-ready` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 103 | `activities/13-submit-for-review.yaml` | `await-review-loop` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `awaiting_review == true` |
| 104 | `activities/13-submit-for-review.yaml` | `review-received` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && stealth_mode != true` |
| 105 | `activities/13-submit-for-review.yaml` | `process-review-comments` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 106 | `activities/13-submit-for-review.yaml` | `analyze-review-outcome` | step gate | migrated -> `when: is_review_mode != true && stealth_mode != true` |
| 107 | `activities/13-submit-for-review.yaml` | `review-outcome` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_review_mode != true && stealth_mode != true` |
| 108 | `activities/14-complete.yaml` | `create-adr` | step gate | migrated -> `when: is_review_mode != true && (problem_complexity == "moderate" \|\| problem_complexity == "complex")` — OR keep-site via [PR #383](https://github.com/m2ux/workflow-server/pull/383) / `d891ed73` |
| 109 | `activities/14-complete.yaml` | `update-adr-status` | step gate | migrated -> `when: is_review_mode != true && (problem_complexity == "moderate" \|\| problem_complexity == "complex")` — OR keep-site via [PR #383](https://github.com/m2ux/workflow-server/pull/383) / `d891ed73` |
| 110 | `activities/14-complete.yaml` | `finalize-test-plan` | step gate | migrated -> `when: is_review_mode != true` |
| 111 | `activities/14-complete.yaml` | `ensure-docs` | step gate | migrated -> `when: is_review_mode != true` |
| 112 | `activities/14-complete.yaml` | `resolve-close-out-publish` | step gate | migrated -> `when: is_review_mode == true` |
| 113 | `activities/14-complete.yaml` | `publish-close-out-artifacts` | step gate | migrated -> `when: is_review_mode == true` |
| 114 | `activities/14-complete.yaml` | `remove-worktree` | step gate | migrated -> `when: worktree_created == true` |
| 115 | `activities/15-codebase-comprehension.yaml` | `deep-dive-iteration` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `needs_comprehension == true` |
| 116 | `activities/15-codebase-comprehension.yaml` | `comprehension-sufficient` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_open_questions == true` |

### `workflow-design` — 83 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/01-intake-and-context.yaml` | `persist-structural-inventory` | step gate | migrated -> `when: operation_type == "update" \|\| operation_type == "review"` — OR keep-site via [PR #383](https://github.com/m2ux/workflow-server/pull/383) / `d891ed73` |
| 2 | `activities/01-intake-and-context.yaml` | `design-intent-batch` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `intent_needs_confirmation == true && update_seeded_from_review != true` |
| 3 | `activities/01-intake-and-context.yaml` | `announce-certain-intent` | step gate | migrated -> `when: intent_needs_confirmation == false && update_seeded_from_review != true && operation_type != 'review'` |
| 4 | `activities/01-intake-and-context.yaml` | `announce-certain-review-scope` | step gate | migrated -> `when: operation_type == 'review' && intent_needs_confirmation == false` |
| 5 | `activities/01-intake-and-context.yaml` | `announce-review-seeded-update` | step gate | migrated -> `when: update_seeded_from_review == true` |
| 6 | `activities/01-intake-and-context.yaml` | `announce-headless` | step gate | migrated -> `when: headless_mode == true` |
| 7 | `activities/01-intake-and-context.yaml` | `announce-interactive` | step gate | migrated -> `when: headless_mode == false` |
| 8 | `activities/01-intake-and-context.yaml` | `initialize-planning-folder` | step gate | migrated -> `when: operation_type != 'review'` |
| 9 | `activities/01-intake-and-context.yaml` | `persist-applicable-constructs` | step gate | migrated -> `when: operation_type == 'create'` |
| 10 | `activities/01-intake-and-context.yaml` | `present-problem-overview` | step gate | migrated -> `when: operation_type != 'review'` |
| 11 | `activities/01-intake-and-context.yaml` | `auto-confirm-literacy` | step gate | migrated -> `when: operation_type != 'review'` |
| 12 | `activities/01-intake-and-context.yaml` | `clear-review-seed-flag` | step gate | migrated -> `when: update_seeded_from_review == true` |
| 13 | `activities/03-requirements-refinement.yaml` | `design-context` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "update"` |
| 14 | `activities/03-requirements-refinement.yaml` | `synthesize-update-specification` | step gate | migrated -> `when: operation_type == 'update'` |
| 15 | `activities/03-requirements-refinement.yaml` | `dimension-elicitation-loop` | forEach entry gate | migrated -> `when: operation_type != 'update'` |
| 16 | `activities/03-requirements-refinement.yaml` | `assumption-reconciliation` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `has_resolvable_assumptions == true` |
| 17 | `activities/03-requirements-refinement.yaml` | `announce-open-judgements` | step gate | migrated -> `when: has_open_assumptions == true` |
| 18 | `activities/05-impact-analysis.yaml` | `impact-analysis` | step gate | migrated -> `when: operation_type == 'update'` |
| 19 | `activities/05-impact-analysis.yaml` | `persist-impact-analysis` | step gate | migrated -> `when: operation_type == 'update'` |
| 20 | `activities/05-impact-analysis.yaml` | `impact-no-removals` | step gate | migrated -> `when: removal_count == 0` |
| 21 | `activities/05-impact-analysis.yaml` | `impact-and-preservation-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `removal_count > 0` |
| 22 | `activities/06-scope-and-draft.yaml` | `derive-workflows-target-path` | step gate | migrated -> `when: operation_type != 'review'` |
| 23 | `activities/06-scope-and-draft.yaml` | `ensure-workflow-worktree` | step gate | migrated -> `when: operation_type != 'review'` |
| 24 | `activities/06-scope-and-draft.yaml` | `file-drafting-loop` | forEach entry gate | migrated -> `when: scope_manifest_confirmed == true` |
| 25 | `activities/06-scope-and-draft.yaml` | `file-approach-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "update"` |
| 26 | `activities/06-scope-and-draft.yaml` | `file-review` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "update"` |
| 27 | `activities/06-scope-and-draft.yaml` | `preservation-check` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type == "update" && has_unflagged_removals == true` |
| 28 | `activities/06-scope-and-draft.yaml` | `pre-attestation-audit-principles` | step gate | migrated -> `when: operation_type == 'update'` |
| 29 | `activities/06-scope-and-draft.yaml` | `pre-attestation-audit-anti-patterns` | step gate | migrated -> `when: operation_type == 'update'` |
| 30 | `activities/06-scope-and-draft.yaml` | `classify-pre-attestation-findings` | step gate | migrated -> `when: operation_type == 'update'` |
| 31 | `activities/06-scope-and-draft.yaml` | `pre-attestation-fix-cycle` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `needs_audit_fixes == true` |
| 32 | `activities/06-scope-and-draft.yaml` | `pre-attestation-findings-remain` | step gate | migrated -> `when: operation_type == 'update' && needs_audit_fixes == true` |
| 33 | `activities/06-scope-and-draft.yaml` | `pre-attestation-blocker` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_critical_finding == true` |
| 34 | `activities/06-scope-and-draft.yaml` | `draft-attestation` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "update"` |
| 35 | `activities/06-scope-and-draft.yaml` | `batch-review-attested` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type == "update"` |
| 36 | `activities/08-quality-review.yaml` | `multi-target-review-loop` | forEach entry gate | migrated -> `when: operation_type == 'review'` |
| 37 | `activities/08-quality-review.yaml` | `persist-compliance-report` | step gate | migrated -> `when: operation_type == 'review'` |
| 38 | `activities/08-quality-review.yaml` | `review-disposition` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type == "review"` |
| 39 | `activities/08-quality-review.yaml` | `audit-expressiveness` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 40 | `activities/08-quality-review.yaml` | `persist-expressiveness-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && expressiveness_finding_count > 0` |
| 41 | `activities/08-quality-review.yaml` | `expressiveness-clean` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && expressiveness_finding_count == 0` |
| 42 | `activities/08-quality-review.yaml` | `expressiveness-findings-flagged` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && expressiveness_finding_count > 0` |
| 43 | `activities/08-quality-review.yaml` | `audit-conformance` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 44 | `activities/08-quality-review.yaml` | `persist-conformance-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && conformance_finding_count > 0` |
| 45 | `activities/08-quality-review.yaml` | `conformance-clean` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && conformance_finding_count == 0` |
| 46 | `activities/08-quality-review.yaml` | `conformance-findings-flagged` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && conformance_finding_count > 0` |
| 47 | `activities/08-quality-review.yaml` | `audit-rule-hygiene` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 48 | `activities/08-quality-review.yaml` | `persist-rule-hygiene-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && rule_hygiene_finding_count > 0` |
| 49 | `activities/08-quality-review.yaml` | `rule-hygiene-clean` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && rule_hygiene_finding_count == 0` |
| 50 | `activities/08-quality-review.yaml` | `rule-hygiene-findings-flagged` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && rule_hygiene_finding_count > 0` |
| 51 | `activities/08-quality-review.yaml` | `audit-rule-enforcement` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 52 | `activities/08-quality-review.yaml` | `persist-enforcement-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && enforcement_finding_count > 0` |
| 53 | `activities/08-quality-review.yaml` | `enforcement-clean` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && enforcement_finding_count == 0` |
| 54 | `activities/08-quality-review.yaml` | `enforcement-findings-flagged` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true && enforcement_finding_count > 0` |
| 55 | `activities/08-quality-review.yaml` | `verify-high-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 56 | `activities/08-quality-review.yaml` | `persist-verified-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 57 | `activities/08-quality-review.yaml` | `classify-audit-findings` | step gate | migrated -> `when: operation_type != 'review' && scope_manifest_confirmed == true` |
| 58 | `activities/08-quality-review.yaml` | `audit-fix-cycle` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `needs_audit_fixes == true` |
| 59 | `activities/09-validate-and-commit.yaml` | `save-compliance-report` | step gate | migrated -> `when: operation_type == 'review'` |
| 60 | `activities/09-validate-and-commit.yaml` | `commit-report` | step gate | migrated -> `when: operation_type == 'review'` |
| 61 | `activities/09-validate-and-commit.yaml` | `run-schema-validation` | step gate | migrated -> `when: operation_type != 'review'` |
| 62 | `activities/09-validate-and-commit.yaml` | `validation-clean` | step gate | migrated -> `when: operation_type != 'review' && fail_count == 0` |
| 63 | `activities/09-validate-and-commit.yaml` | `validation-passed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "review" && fail_count > 0` |
| 64 | `activities/09-validate-and-commit.yaml` | `verify-scope-manifest` | step gate | migrated -> `when: operation_type != 'review'` |
| 65 | `activities/09-validate-and-commit.yaml` | `scope-complete` | step gate | migrated -> `when: operation_type != 'review' && unaddressed_count == 0` |
| 66 | `activities/09-validate-and-commit.yaml` | `scope-verified` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "review" && unaddressed_count > 0` |
| 67 | `activities/09-validate-and-commit.yaml` | `verify-planning-readme` | step gate | migrated -> `when: operation_type != 'review'` |
| 68 | `activities/09-validate-and-commit.yaml` | `readme-authoring` | step gate | migrated -> `when: operation_type != 'review'` |
| 69 | `activities/09-validate-and-commit.yaml` | `approve-to-commit` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "review"` |
| 70 | `activities/09-validate-and-commit.yaml` | `stage-and-commit` | step gate | migrated -> `when: operation_type != 'review'` |
| 71 | `activities/09-validate-and-commit.yaml` | `push-branch` | step gate | migrated -> `when: operation_type != 'review'` |
| 72 | `activities/09-validate-and-commit.yaml` | `compose-workflow-pr-description` | step gate | migrated -> `when: operation_type != 'review'` |
| 73 | `activities/09-validate-and-commit.yaml` | `create-pr` | step gate | migrated -> `when: operation_type != 'review'` |
| 74 | `activities/09-validate-and-commit.yaml` | `mark-ready` | step gate | migrated -> `when: operation_type != 'review'` |
| 75 | `activities/10-post-update-review.yaml` | `persist-post-expressiveness` | step gate | migrated -> `when: expressiveness_finding_count > 0` |
| 76 | `activities/10-post-update-review.yaml` | `persist-post-conformance` | step gate | migrated -> `when: conformance_finding_count > 0` |
| 77 | `activities/10-post-update-review.yaml` | `post-update-clean` | step gate | migrated -> `when: review_findings_count == 0` |
| 78 | `activities/10-post-update-review.yaml` | `classify-post-update-fixes` | step gate | migrated -> `when: review_findings_count > 0` |
| 79 | `activities/10-post-update-review.yaml` | `post-update-remedia-cycle` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `needs_audit_fixes == true` |
| 80 | `activities/10-post-update-review.yaml` | `remedia-still-dirty` | step gate | migrated -> `when: needs_audit_fixes == true` |
| 81 | `activities/11-retrospective.yaml` | `create-completion-doc` | step gate | migrated -> `when: operation_type != 'review'` |
| 82 | `activities/11-retrospective.yaml` | `persist-completion-doc` | step gate | migrated -> `when: operation_type != 'review'` |
| 83 | `activities/11-retrospective.yaml` | `remove-session-worktree` | step gate | migrated -> `when: worktree_created == true` |

### `prism` — 10 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/00-select-mode.yaml` | `confirm-mode` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `pipeline_mode notExists` |
| 2 | `activities/01-structural-pass.yaml` | `run-structural` | step gate | migrated -> `when: (current_unit.pipeline_mode == "single" && current_unit.lens_name == "l12") \|\| current_unit.pipeline_mode == "full-prism"` — OR keep-site via [PR #383](https://github.com/m2ux/workflow-server/pull/383) / `d891ed73` |
| 3 | `activities/01-structural-pass.yaml` | `run-single-lens` | step gate | migrated -> `when: current_unit.pipeline_mode == 'single' && current_unit.lens_name != 'l12'` |
| 4 | `activities/01-structural-pass.yaml` | `run-portfolio` | step gate | migrated -> `when: current_unit.pipeline_mode == 'portfolio'` |
| 5 | `activities/01-structural-pass.yaml` | `dispatch-behavioral-lenses` | step gate | migrated -> `when: current_unit.pipeline_mode == 'behavioral'` |
| 6 | `activities/02-adversarial-pass.yaml` | `run-adversarial` | step gate | migrated -> `when: current_unit.pipeline_mode == 'full-prism'` |
| 7 | `activities/03-synthesis-pass.yaml` | `run-synthesis` | step gate | migrated -> `when: current_unit.pipeline_mode == 'full-prism'` |
| 8 | `activities/05-behavioral-synthesis-pass.yaml` | `run-behavioral-synthesis` | step gate | migrated -> `when: current_unit.pipeline_mode == 'behavioral'` |
| 9 | `activities/12-adaptive-pass.yaml` | `run-stage-2` | step gate | migrated -> `when: adaptive_signal_quality == 'insufficient'` |
| 10 | `activities/12-adaptive-pass.yaml` | `run-stage-3` | step gate | migrated -> `when: adaptive_signal_quality == 'insufficient'` |

### `meta` — 12 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/00-discover-session.yaml` | `host-binding-mismatch` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `host_binding_mismatch == true` |
| 2 | `activities/00-discover-session.yaml` | `workflow-selection` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `workflow_match_ambiguous == true` |
| 3 | `activities/00-discover-session.yaml` | `record-match` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `matched_session exists` |
| 4 | `activities/00-discover-session.yaml` | `resume-session` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_saved_state == true` |
| 5 | `activities/00-discover-session.yaml` | `record-no-match` | step gate | kept — exists-shaped predicate: the `when` dialect has no live exists form — was `matched_session notExists` |
| 6 | `activities/02-resolve-target.yaml` | `submodule-selection` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `is_monorepo == true && component_selection_needed == true` |
| 7 | `activities/03-dispatch-client-workflow.yaml` | `client-activity-loop` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `current_activity != null` |
| 8 | `activities/04-end-workflow.yaml` | `revise-session-metrics` | step gate | migrated -> `when: client_workflow_completed == true && planning_folder_path != ''` |
| 9 | `activities/patterns/02-supervisor.yaml` | `announce-escalation` | step gate | migrated -> `when: lane_id == 'escalate'` |
| 10 | `activities/patterns/03-plan-and-execute.yaml` | `execute-steps` | forEach entry gate | migrated -> `when: plan_needs_replan != true` |
| 11 | `activities/patterns/03-plan-and-execute.yaml` | `replan-until-stable` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `plan_needs_replan == true` |
| 12 | `activities/patterns/05-lead-researcher.yaml` | `gap-followup` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `has_research_gaps == true` |

### `prism-audit` — 2 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/01-prompt-generation.yaml` | `no-security-characteristics` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `security_characteristics_count == 0` |
| 2 | `activities/01-prompt-generation.yaml` | `map-trust-boundaries` | step gate | migrated -> `when: gitnexus_available == true` |

### `substrate-node-security-audit` — 1 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/05-report-generation.yaml` | `write-report` | step gate | migrated -> `when: dispatch_complete == true && verification_complete == true && merge_complete == true` |

### `codebase-wiki` — 1 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/03-lint-wiki.yaml` | `lint-findings-confirmed` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `lint_findings_count > 0` |

### `remediate-vuln` — 3 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/01-start.yaml` | `sec-vuln-url-input` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `sec_vuln_url notExists` |
| 2 | `activities/01-start.yaml` | `private-fork-url-input` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `private_fork_url notExists` |
| 3 | `activities/01-start.yaml` | `short-id-input` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `short_id notExists` |

### `workflow-authoring` — 7 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/01-intake-and-context.yaml` | `design-intent-batch` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `intent_needs_confirmation == true && update_seeded_from_review != true` |
| 2 | `activities/01-intake-and-context.yaml` | `impact-approved` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `removal_count > 0` |
| 3 | `activities/06-scope-and-draft.yaml` | `scope-confirmed#{scope_round}` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "review"` |
| 4 | `activities/06-scope-and-draft.yaml` | `preservation-check#{current_file.path}` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_unflagged_removals == true` |
| 5 | `activities/09-validate-and-commit.yaml` | `review-disposition` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type == "review"` |
| 6 | `activities/09-validate-and-commit.yaml` | `audit-disposition#{remediation_round}` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_critical_finding == true || open_finding_count > 0` |
| 7 | `activities/09-validate-and-commit.yaml` | `approve-to-commit#{remediation_round}` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `operation_type != "review" && remediation_selected != true && review_closed != true && update_seeded_from_review != true` |

### `midnight-system-review` — 2 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/02-area-derivation.yaml` | `plan-approval-loop` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `plan_approved == false` |
| 2 | `activities/05-verdict-and-report.yaml` | `publish-decision` | checkpoint gate | kept — checkpoint gate: only structured `condition` enables `condition_not_met` dismissal — was `has_pr_surface == true` |

### `ponytail` — 1 sites

| # | File | Site | Class | Disposition |
|---|------|------|-------|-------------|
| 1 | `activities/02-apply-ladder.yaml` | `climb-until-safe` | loop continuation | kept — `while`/`doWhile` continuation predicate, not a step gate — was `safety_floor_cleared == false` |
