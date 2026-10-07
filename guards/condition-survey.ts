/**
 * The structured-condition survey — one disposition per site, hand-written.
 *
 * A step's gate can be written twice over, inline as `when` or structurally as a `condition` object,
 * and the structured form is being retired. This file is the record that says what becomes of each
 * site that carries one, and it is the input the conversion work reads.
 *
 * `check-condition-survey` re-derives the site list from the corpus on every run and grades this
 * file against it, so the record cannot quietly fall behind the tree it describes. What that guard
 * owns is the arithmetic — the enumeration, the vacuity sweep, and the option writes a dismissal
 * withholds. What this file owns is the judgement.
 *
 * The subject is ONE corpus: `i04/workflows` at `860e107b`, the definitions branch `verify.yml`
 * pairs with a change based on `i04/main`. The record is of that tree and no other, which is why the
 * guard is not enrolled in the sweep — the sweep is pointed at whatever tree is under review, and
 * `workflows` is a different one. `tests/condition-survey.test.ts` runs it against the paired corpus.
 * When `i04/workflows` takes `workflows`' later changes by merge, the sites that moved under this
 * record show up as findings, which is the record asking to be re-taken rather than drifting.
 *
 * - **`convert`**
 *   The gate is a real test, or nothing in the variable model proves it is not. It becomes the
 *   equivalent `when` expression on the same step.
 * - **`remove`**
 *   No assignment of the values its variables admit makes the gate false, so it decides nothing and
 *   comes out rather than converting.
 *
 * Every entry carries a `measurement`, which is the sweep that settled the disposition rather than a
 * claim about it: a `falsifiable` site names the assignment that falsifies the gate, an `always-true`
 * site names the size of the sweep that found none, and an `undetermined` site names the variables
 * whose declarations close no value set. The guard runs the sweep again and grades the record
 * against it, so a measurement that stops reproducing is a finding.
 *
 * A checkpoint site also carries `dismissal`, the reading of whether anything downstream reads its
 * dismissal record. A dismissal selects no option, so it applies no `setVariable`, records no reply
 * and names no exit; the only trace is the session's own response under the `__condition_not_met__`
 * sentinel, which no definition can address. The nearest a definition gets is testing a variable the
 * withheld choice would have written, and `observedWrites` is the part of that set some other gate in
 * the same activity tests.
 *
 * There is no flag that regenerates this file. A disposition is a judgement about what a gate is
 * for, and a record a command rewrites absorbs a new site silently — the failure mode the retired
 * `review-mode-gating-baseline.json` is this repository's own example of.
 */

/**
 * The sweep that settled a disposition, as `measureVacuity` reports it.
 *
 * `falsifiable` carries the witness and nothing else: the sweep stops at the first assignment that
 * reads false, so its assignment count is an artifact of iteration order, while the witness itself
 * re-evaluates the same way whatever order found it.
 */
export type SurveyMeasurement =
  | {
    verdict: 'falsifiable';
    /** An assignment under which the gate reads false. `<absent>` is an unset variable. */
    witness: Record<string, unknown>;
  }
  | {
    verdict: 'always-true';
    /**
     * Assignments evaluated, every one of which read true with no `unknown` among them. A variable
     * whose declaration closes no value set contributes one assignment standing for any value, so
     * the sweep covers the whole model whatever its size.
     */
    assignments: number;
  }
  | {
    verdict: 'undetermined';
    /** The variables whose declarations close no value set, so the sweep cannot bound the gate. */
    open: string[];
  };

/** Whether anything downstream reads a checkpoint site's dismissal record. */
export interface SurveyDismissal {
  /** Variables the withheld choice would have written, sorted. */
  optionWrites: string[];
  /** The exit a dismissal falls to, shared with every unmatched predicate of the activity. */
  defaultExit: string | null;
  /** The withheld writes some other gate in the activity tests, sorted. Empty is the strong reading. */
  observedWrites: string[];
  /** The reading itself: what reads the dismissal record, or that nothing does. */
  reads: string;
}

export interface SurveyEntry {
  /** What becomes of the site. */
  disposition: 'convert' | 'remove';
  /** One line on what the gate tests. */
  note: string;
  /** The sweep the disposition rests on. */
  measurement: SurveyMeasurement;
  /** Required where the step kind is `checkpoint`. */
  dismissal?: SurveyDismissal;
}

/**
 * The three readings the survey reached, each written once rather than at each site it applies to.
 *
 * All three say the same thing of the dismissal RECORD — nothing reads it — and differ in what the
 * site leaves for a reader to look at. The guard checks the grounds each reading rests on, so
 * picking the wrong one for a site is a finding rather than a matter of wording.
 */

/** The checkpoint sets nothing, so a dismissal and a choice leave the activity in the same state. */
export const READS_NOTHING_SET = 'none — the checkpoint writes no variable at all, so a dismissal leaves the activity exactly where a chosen option would';

/** The checkpoint sets variables, and nothing in the activity tests any of them. */
export const READS_WRITES_UNTESTED = 'none — the dismissal withholds the option writes, and no gate in the activity tests one of them';

/** The checkpoint sets variables some gate tests, and a dismissal leaves them unset like any unanswered gate. */
export const READS_WRITES_UNSET = 'none — the dismissal withholds the option writes and gates in the activity test them, but what they read is the variable left unset, which is the state any unchosen option leaves; the dismissal record itself is addressed by nothing';

/** Keyed `<file>::<definition id>::<step path>`, the key `conditionSites` writes. */
export const CONDITION_SURVEY: Record<string, SurveyEntry> = {
  'codebase-wiki/activities/03-lint-wiki.yaml::lint-wiki::lint-findings-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `lint_findings_count` is above 0.',
    measurement: { verdict: 'undetermined', open: ['lint_findings_count'] },
    dismissal: {
      optionWrites: ['needs_reingest'],
      defaultExit: 'done',
      observedWrites: ['needs_reingest'],
      reads: READS_WRITES_UNSET,
    },
  },
  'midnight-system-review/activities/07-verdict-and-report.yaml::verdict-and-report::publish-decision': {
    disposition: 'convert',
    note: 'The step runs when `has_pr_surface` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'has_pr_surface': false } },
    dismissal: {
      optionWrites: ['publish_requested'],
      defaultExit: 'report-only',
      observedWrites: ['publish_requested'],
      reads: READS_WRITES_UNSET,
    },
  },
  'plain-language/activities/01-intake-and-profile.yaml::intake-and-profile::intent-and-profile-batch': {
    disposition: 'convert',
    note: 'The step runs when `intent_needs_confirmation` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'intent_needs_confirmation': false } },
    dismissal: {
      optionWrites: ['intent_needs_confirmation', 'operation_type'],
      defaultExit: 'no-source',
      observedWrites: ['operation_type'],
      reads: READS_WRITES_UNSET,
    },
  },
  'plain-language/activities/02-source-analysis.yaml::source-analysis::analysis-reviewed': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is "audit".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': '<absent>' } },
    dismissal: {
      optionWrites: ['analysis_disposition'],
      defaultExit: 'rewrite',
      observedWrites: ['analysis_disposition'],
      reads: READS_WRITES_UNSET,
    },
  },
  'plain-language/activities/04-evaluate.yaml::evaluate::evaluate-revise-loop/count-revision-round': {
    disposition: 'convert',
    note: 'The step runs when `needs_revision` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_revision': false } },
  },
  'plain-language/activities/04-evaluate.yaml::evaluate::evaluate-revise-loop/revise-document': {
    disposition: 'convert',
    note: 'The step runs when `needs_revision` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_revision': false } },
  },
  'plain-language/activities/04-evaluate.yaml::evaluate::evaluation-gate': {
    disposition: 'convert',
    note: 'The step runs when `open_issue_count` is above 0.',
    measurement: { verdict: 'undetermined', open: ['open_issue_count'] },
    dismissal: {
      optionWrites: ['needs_revision'],
      defaultExit: 'done',
      observedWrites: ['needs_revision'],
      reads: READS_WRITES_UNSET,
    },
  },
  'prism-audit/activities/01-prompt-generation.yaml::prompt-generation::no-security-characteristics': {
    disposition: 'convert',
    note: 'The step runs when `security_characteristics_count` is 0.',
    measurement: { verdict: 'undetermined', open: ['security_characteristics_count'] },
    dismissal: {
      optionWrites: [],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'prism/activities/00-select-mode.yaml::select-mode::confirm-mode': {
    disposition: 'convert',
    note: 'The step runs when `pipeline_mode` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'pipeline_mode': 'single' } },
    dismissal: {
      optionWrites: ['pipeline_mode'],
      defaultExit: 'structural',
      observedWrites: ['pipeline_mode'],
      reads: READS_WRITES_UNSET,
    },
  },
  'remediate-vuln/activities/01-start.yaml::start::private-fork-url-input': {
    disposition: 'convert',
    note: 'The step runs when `private_fork_url` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'private_fork_url': '<any>' } },
    dismissal: {
      optionWrites: ['private_fork_url'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'remediate-vuln/activities/01-start.yaml::start::sec-vuln-url-input': {
    disposition: 'convert',
    note: 'The step runs when `sec_vuln_url` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'sec_vuln_url': '<any>' } },
    dismissal: {
      optionWrites: ['sec_vuln_url'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'remediate-vuln/activities/01-start.yaml::start::short-id-input': {
    disposition: 'convert',
    note: 'The step runs when `short_id` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'short_id': '<any>' } },
    dismissal: {
      optionWrites: ['short_id'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'requirements-refinement/activities/01-intake.yaml::intake::target-doc-named': {
    disposition: 'convert',
    note: 'The step runs when `target_doc_path` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'target_doc_path': '<any>' } },
    dismissal: {
      optionWrites: ['target_doc_path'],
      defaultExit: 'sources-confirmed',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::announce-derived-review-pr': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is true, `needs_review_pr` is not true and `pr_number` is present.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'needs_review_pr': true, 'pr_number': '<absent>' } },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::capture-pr-reference': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is true, `review_pr_captured` is true and `branch_name` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': false, 'review_pr_captured': true, 'branch_name': '<absent>' } },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::detect-provided-issue-reference': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `issue_present` is false, `needs_issue_creation` is not true, `issue_creation_declined` is not true and `issue_platform` is absent.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'issue_present': true, 'needs_issue_creation': true, 'issue_creation_declined': true, 'issue_platform': '<absent>' } },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::github-issue-missing': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `issue_platform` is "jira" and `github_issue_found` is false.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'issue_platform': '<absent>', 'github_issue_found': true } },
    dismissal: {
      optionWrites: ['needs_github_issue_creation'],
      defaultExit: 'done',
      observedWrites: ['needs_github_issue_creation'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::issue-review': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true and `needs_issue_creation` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'needs_issue_creation': true } },
    dismissal: {
      optionWrites: ['issue_cancelled'],
      defaultExit: 'done',
      observedWrites: ['issue_cancelled'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::issue-type-selection': {
    disposition: 'convert',
    note: 'The step runs when `needs_issue_creation` is true or `needs_issue_type` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_issue_creation': false, 'needs_issue_type': false } },
    dismissal: {
      optionWrites: ['issue_type', 'needs_issue_type'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::issue-verification': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true and `issue_present` is false.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'issue_present': true } },
    dismissal: {
      optionWrites: ['issue_creation_declined', 'issue_request', 'needs_issue_creation'],
      defaultExit: 'done',
      observedWrites: ['issue_creation_declined', 'needs_issue_creation'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::jira-project-selection': {
    disposition: 'convert',
    note: 'The step runs when `issue_platform` is "jira" and `needs_issue_creation` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'issue_platform': '<absent>', 'needs_issue_creation': true } },
    dismissal: {
      optionWrites: ['jira_project'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::link-pr-to-ticket-github': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `pr_number` is present, `issue_creation_declined` is not true and `issue_platform` is "github".',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'pr_number': '<absent>', 'issue_creation_declined': true, 'issue_platform': '<absent>' } },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::link-pr-to-ticket-jira': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `pr_number` is present, `issue_creation_declined` is not true and `issue_platform` is "jira".',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'pr_number': '<absent>', 'issue_creation_declined': true, 'issue_platform': '<absent>' } },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::mark-review-pr-captured': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is true, `needs_review_pr` is not true and `pr_number` is present.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'needs_review_pr': true, 'pr_number': '<absent>' } },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::platform-selection': {
    disposition: 'convert',
    note: 'The step runs when `needs_issue_creation` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_issue_creation': false } },
    dismissal: {
      optionWrites: ['issue_platform'],
      defaultExit: 'done',
      observedWrites: ['issue_platform'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::pr-check': {
    disposition: 'convert',
    note: 'The step runs when `pr_exists` is true and `use_existing_pr` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'pr_exists': true, 'use_existing_pr': true } },
    dismissal: {
      optionWrites: ['pr_number', 'use_existing_pr'],
      defaultExit: 'done',
      observedWrites: ['pr_number', 'use_existing_pr'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::pr-creation': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `issue_cancelled` is not true and `use_existing_pr` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'issue_cancelled': true, 'use_existing_pr': true } },
    dismissal: {
      optionWrites: ['pr_creation_declined'],
      defaultExit: 'done',
      observedWrites: ['pr_creation_declined'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::review-mode-detection': {
    disposition: 'convert',
    note: 'The step runs when `needs_review_mode` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_review_mode': false } },
    dismissal: {
      optionWrites: ['is_review_mode', 'needs_review_mode'],
      defaultExit: 'done',
      observedWrites: ['is_review_mode', 'needs_review_mode'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::review-pr-reference': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is true and `needs_review_pr` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': false, 'needs_review_pr': true } },
    dismissal: {
      optionWrites: ['is_review_mode', 'needs_review_pr', 'review_pr_captured'],
      defaultExit: 'done',
      observedWrites: ['is_review_mode', 'needs_review_pr', 'review_pr_captured'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/01-start-work-package.yaml::start-work-package::update-repo-submodules': {
    disposition: 'convert',
    note: 'The step runs when `host_repo_path` is present.',
    measurement: { verdict: 'falsifiable', witness: { 'host_repo_path': '<absent>' } },
  },
  'work-package/activities/02-design-philosophy.yaml::design-philosophy::classification-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'work-package/activities/02-design-philosophy.yaml::design-philosophy::ticket-completeness': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is true and `ticket_gaps_documented` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': false, 'ticket_gaps_documented': true } },
    dismissal: {
      optionWrites: ['ticket_disposition'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/02-design-philosophy.yaml::design-philosophy::workflow-path-selected': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true } },
    dismissal: {
      optionWrites: ['needs_elicitation', 'needs_research', 'optional_activities_declined', 'problem_complexity'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/06-plan-prepare.yaml::plan-prepare::approach-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'work-package/activities/06-plan-prepare.yaml::plan-prepare::context-scope-declaration': {
    disposition: 'convert',
    note: 'The step runs when `needs_context_scope` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_context_scope': false } },
    dismissal: {
      optionWrites: ['context_scope', 'needs_context_scope'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/06-plan-prepare.yaml::plan-prepare::research-reconciliation/research-convergence': {
    disposition: 'convert',
    note: 'The step runs when `has_reconcilable_research` is false.',
    measurement: { verdict: 'falsifiable', witness: { 'has_reconcilable_research': true } },
    dismissal: {
      optionWrites: ['has_reconcilable_research', 'research_direction'],
      defaultExit: 'done',
      observedWrites: ['has_reconcilable_research'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/07-assumptions-review.yaml::assumptions-review::post-summary-review': {
    disposition: 'convert',
    note: 'The step runs when `stealth_mode` is not true, `is_review_mode` is not true, `issue_platform` is present and `has_deferred_assumptions` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'stealth_mode': true, 'is_review_mode': true, 'issue_platform': '<absent>', 'has_deferred_assumptions': true } },
    dismissal: {
      optionWrites: ['post_summary_approved'],
      defaultExit: 'assumptions-approved',
      observedWrites: ['post_summary_approved'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/09-lean-coding-audit.yaml::lean-coding-audit::audit-findings-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true } },
    dismissal: {
      optionWrites: ['needs_simplification'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/10-post-impl-review.yaml::post-impl-review::local-validation-permission': {
    disposition: 'convert',
    note: 'The step runs when `has_critical_blocker` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'has_critical_blocker': true } },
    dismissal: {
      optionWrites: ['run_local_validation'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/12-strategic-review.yaml::strategic-review::findings-delivery': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is true and `strategic_findings_summary` is not "".',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': false, 'strategic_findings_summary': '<any>' } },
    dismissal: {
      optionWrites: ['raised_findings_scope', 'raised_findings_selection', 'review_passed'],
      defaultExit: 'review-failed',
      observedWrites: ['review_passed'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/12-strategic-review.yaml::strategic-review::read-live-pr-body': {
    disposition: 'convert',
    note: 'The step runs when `pr_number` is present.',
    measurement: { verdict: 'falsifiable', witness: { 'pr_number': '<absent>' } },
  },
  'work-package/activities/12-strategic-review.yaml::strategic-review::review-findings': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true and `strategic_findings_summary` is not "".',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'strategic_findings_summary': '<any>' } },
    dismissal: {
      optionWrites: ['deferral_reason', 'review_passed', 'strategic_findings_disposition', 'strategic_fix_selection'],
      defaultExit: 'review-failed',
      observedWrites: ['review_passed', 'strategic_findings_disposition'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/12-strategic-review.yaml::strategic-review::verify-pr-body': {
    disposition: 'convert',
    note: 'The step runs when `pr_number` is present.',
    measurement: { verdict: 'falsifiable', witness: { 'pr_number': '<absent>' } },
  },
  'work-package/activities/13-submit-for-review.yaml::submit-for-review::await-review-loop/review-received': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true and `stealth_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'stealth_mode': true } },
    dismissal: {
      optionWrites: ['awaiting_review'],
      defaultExit: 'review-approved',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/13-submit-for-review.yaml::submit-for-review::body-non-conformant': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `stealth_mode` is not true and `body_conforms` is false.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'stealth_mode': true, 'body_conforms': true } },
    dismissal: {
      optionWrites: ['body_conforms'],
      defaultExit: 'review-approved',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/13-submit-for-review.yaml::submit-for-review::build-artifact-check': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true, `stealth_mode` is not true and `project_type` is "rust-substrate".',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'stealth_mode': true, 'project_type': '<absent>' } },
    dismissal: {
      optionWrites: ['build_dependent_artifacts_pending'],
      defaultExit: 'review-approved',
      observedWrites: ['build_dependent_artifacts_pending'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/13-submit-for-review.yaml::submit-for-review::dco-sign-off-confirmation': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true } },
    dismissal: {
      optionWrites: ['attestation_option'],
      defaultExit: 'review-approved',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/13-submit-for-review.yaml::submit-for-review::private-push-confirmation': {
    disposition: 'convert',
    note: 'The step runs when `stealth_mode` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'stealth_mode': false } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'review-approved',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'work-package/activities/13-submit-for-review.yaml::submit-for-review::review-outcome': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true and `stealth_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'stealth_mode': true } },
    dismissal: {
      optionWrites: ['review_requires_changes'],
      defaultExit: 'review-approved',
      observedWrites: ['review_requires_changes'],
      reads: READS_WRITES_UNSET,
    },
  },
  'work-package/activities/15-codebase-comprehension.yaml::codebase-comprehension::deep-dive-iteration/comprehension-sufficient': {
    disposition: 'convert',
    note: 'The step runs when `has_open_questions` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'has_open_questions': false } },
    dismissal: {
      optionWrites: ['comprehension_scope', 'needs_comprehension'],
      defaultExit: 'comprehension-complete',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/16-prism-decision.yaml::prism-decision::full-prism-decision': {
    disposition: 'convert',
    note: 'The step runs when `problem_complexity` is "complex" and `is_review_mode` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'problem_complexity': '<absent>', 'is_review_mode': true } },
    dismissal: {
      optionWrites: ['pipeline_mode'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/activities/21-implementation-join.yaml::implementation-join::provenance-settle-cycle/provenance-retry/symbol-provenance-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `needs_symbol_confirmation` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'needs_symbol_confirmation': false } },
    dismissal: {
      optionWrites: ['needs_symbol_confirmation'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'work-package/routines/residual-assumption-interview.yaml::residual-assumption-interview::batch-gate': {
    disposition: 'convert',
    note: 'The step runs when `is_review_mode` is not true and `has_open_assumptions` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'is_review_mode': true, 'has_open_assumptions': '<absent>' } },
    dismissal: {
      optionWrites: ['assumption_outcome', 'needs_individual_interview'],
      defaultExit: null,
      observedWrites: ['needs_individual_interview'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-authoring/activities/01-intake-and-context.yaml::intake-and-context::design-intent-batch': {
    disposition: 'convert',
    note: 'The step runs when `intent_needs_confirmation` is true and `update_seeded_from_review` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'intent_needs_confirmation': true, 'update_seeded_from_review': true } },
    dismissal: {
      optionWrites: ['intent_needs_confirmation', 'operation_type', 'operation_type_ambiguous', 'review_scope_confirmed'],
      defaultExit: 'authoring',
      observedWrites: ['operation_type', 'review_scope_confirmed'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-authoring/activities/01-intake-and-context.yaml::intake-and-context::impact-approved': {
    disposition: 'convert',
    note: 'The step runs when `removal_count` is above 0.',
    measurement: { verdict: 'undetermined', open: ['removal_count'] },
    dismissal: {
      optionWrites: ['removals_approved'],
      defaultExit: 'authoring',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'workflow-authoring/activities/01-intake-and-context.yaml::intake-and-context::judgements-disposition': {
    disposition: 'convert',
    note: 'The step runs when `open_judgements_count` is above 0.',
    measurement: { verdict: 'undetermined', open: ['open_judgements_count'] },
    dismissal: {
      optionWrites: ['judgements_disposition'],
      defaultExit: 'authoring',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'workflow-authoring/activities/06-scope-and-draft.yaml::scope-and-draft::file-drafting-loop/preservation-check#{current_file.path}': {
    disposition: 'convert',
    note: 'The step runs when `has_unflagged_removals` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'has_unflagged_removals': false } },
    dismissal: {
      optionWrites: ['removal_disposition'],
      defaultExit: 'done',
      observedWrites: ['removal_disposition'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-authoring/activities/06-scope-and-draft.yaml::scope-and-draft::scope-confirmed#{scope_round}': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "review".',
    measurement: { verdict: 'undetermined', open: ['operation_type'] },
    dismissal: {
      optionWrites: ['scope_manifest_confirmed'],
      defaultExit: 'done',
      observedWrites: ['scope_manifest_confirmed'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-authoring/activities/09-validate-and-commit.yaml::validate-and-commit::approve-to-commit#{remediation_round}': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "review", `remediation_selected` is not true, `review_closed` is not true, `update_seeded_from_review` is not true and `has_critical_finding` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': '<absent>', 'remediation_selected': true, 'review_closed': true, 'update_seeded_from_review': true, 'has_critical_finding': true } },
    dismissal: {
      optionWrites: ['commit_approved', 'draft_revision'],
      defaultExit: 'committed',
      observedWrites: ['commit_approved'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-authoring/activities/09-validate-and-commit.yaml::validate-and-commit::audit-disposition#{remediation_round}': {
    disposition: 'convert',
    note: 'The step runs when `has_critical_finding` is true or `open_finding_count` is above 0.',
    measurement: { verdict: 'undetermined', open: ['open_finding_count'] },
    dismissal: {
      optionWrites: ['remediation_selected'],
      defaultExit: 'committed',
      observedWrites: ['remediation_selected'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-authoring/activities/09-validate-and-commit.yaml::validate-and-commit::review-disposition': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is "review".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': '<absent>' } },
    dismissal: {
      optionWrites: ['operation_type', 'review_closed', 'update_seeded_from_review'],
      defaultExit: 'committed',
      observedWrites: ['operation_type', 'review_closed', 'update_seeded_from_review'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-design/activities/01-intake-and-context.yaml::intake-and-context::design-intent-batch': {
    disposition: 'convert',
    note: 'The step runs when `intent_needs_confirmation` is true and `update_seeded_from_review` is not true.',
    measurement: { verdict: 'falsifiable', witness: { 'intent_needs_confirmation': true, 'update_seeded_from_review': true } },
    dismissal: {
      optionWrites: ['intent_needs_confirmation', 'operation_type', 'operation_type_ambiguous', 'review_scope_confirmed', 'review_target_correction'],
      defaultExit: 'context-established',
      observedWrites: ['intent_needs_confirmation', 'operation_type', 'review_scope_confirmed'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-design/activities/03-requirements-refinement.yaml::requirements-refinement::design-context': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "update".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'update' } },
    dismissal: {
      optionWrites: ['design_context'],
      defaultExit: 'create',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'workflow-design/activities/05-impact-analysis.yaml::impact-analysis::impact-and-preservation-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `removal_count` is above 0.',
    measurement: { verdict: 'undetermined', open: ['removal_count'] },
    dismissal: {
      optionWrites: ['impact_correction', 'preservation_required'],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_WRITES_UNTESTED,
    },
  },
  'workflow-design/activities/06-scope-and-draft.yaml::scope-and-draft::batch-review-attested': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is "update".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': '<absent>' } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'workflow-design/activities/06-scope-and-draft.yaml::scope-and-draft::draft-attestation': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "update".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'update' } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'workflow-design/activities/06-scope-and-draft.yaml::scope-and-draft::file-drafting-loop/file-approach-confirmed': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "update".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'update' } },
    dismissal: {
      optionWrites: ['file_approach_disposition'],
      defaultExit: 'done',
      observedWrites: ['file_approach_disposition'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-design/activities/06-scope-and-draft.yaml::scope-and-draft::file-drafting-loop/file-review': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "update".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'update' } },
    dismissal: {
      optionWrites: ['file_draft_correction', 'file_draft_disposition'],
      defaultExit: 'done',
      observedWrites: ['file_draft_disposition'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-design/activities/06-scope-and-draft.yaml::scope-and-draft::file-drafting-loop/preservation-check': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is "update" and `has_unflagged_removals` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': '<absent>', 'has_unflagged_removals': true } },
    dismissal: {
      optionWrites: ['removal_disposition'],
      defaultExit: 'done',
      observedWrites: ['removal_disposition'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-design/activities/06-scope-and-draft.yaml::scope-and-draft::pre-attestation-blocker': {
    disposition: 'convert',
    note: 'The step runs when `has_critical_principle_finding` is true or `has_critical_anti_pattern_finding` is true.',
    measurement: { verdict: 'falsifiable', witness: { 'has_critical_principle_finding': false, 'has_critical_anti_pattern_finding': false } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'done',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'workflow-design/activities/08-quality-review.yaml::quality-review::review-disposition': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is "review".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': '<absent>' } },
    dismissal: {
      optionWrites: ['operation_type', 'update_seeded_from_review'],
      defaultExit: 'done',
      observedWrites: ['operation_type'],
      reads: READS_WRITES_UNSET,
    },
  },
  'workflow-design/activities/09-validate-and-commit.yaml::validate-and-commit::approve-to-commit': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "review".',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'review' } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'create',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'workflow-design/activities/09-validate-and-commit.yaml::validate-and-commit::scope-verified': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "review" and `unaddressed_count` is above 0.',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'review', 'unaddressed_count': '<any>' } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'create',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
  'workflow-design/activities/09-validate-and-commit.yaml::validate-and-commit::validation-passed': {
    disposition: 'convert',
    note: 'The step runs when `operation_type` is not "review" and `fail_count` is above 0.',
    measurement: { verdict: 'falsifiable', witness: { 'operation_type': 'review', 'fail_count': '<any>' } },
    dismissal: {
      optionWrites: [],
      defaultExit: 'create',
      observedWrites: [],
      reads: READS_NOTHING_SET,
    },
  },
};
