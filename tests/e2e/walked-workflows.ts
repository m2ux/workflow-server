/**
 * Which workflows the coverage walk drives, and which it deliberately leaves to the uncovered list.
 *
 * One home, read by both consumers: the test that walks the roster and the scope resolver
 * (scripts/coverage-scope.ts), which asks whether a changed workflow is one the walk covers. Two
 * copies answer that question independently, so they answer it differently.
 */

/**
 * The workflows walked, slowest first.
 *
 * Coverage is corpus-wide, because an activity one workflow borrows from another is reached by
 * whichever of them a walk enters — so this is a means to the corpus figure, not a list of subjects.
 *
 * The roster walks at once, so its wall clock is the cost of the slowest member and not the sum:
 * `work-package` at the top is the whole of it, and the thirteen below finish inside its window.
 * Ordering by cost is what keeps that visible. An addition anywhere but the top is free, and one
 * that lands above `work-package` sets the cost of the job.
 */
export const WALKED = [
  'workflow-design',
  'work-package',
  'prism-evaluate',
  'prism',
  'workflow-authoring',
  'midnight-system-review',
  'work-packages',
  'ponytail',
  'plain-language',
  'requirements-refinement',
  'prism-update',
  'codebase-wiki',
  'prism-audit',
  'meta',
] as const;

/**
 * Declared by the corpus, and left to the uncovered list rather than walked.
 *
 * `remediate-vuln` costs six minutes on its own, more than the four most expensive walks above put
 * together, and 21 of its 60 walks die on a branch whose checkpoint or transition does not resolve —
 * so the branches past each failure go unmeasured, and a walk cannot report coverage it never
 * reached. Leaving it out costs less than that suggests: of the 99 options it declares, 92 belong to
 * work-package activities it borrows and the work-package walk covers them. The 7 that are its own
 * — five checkpoints in its `start` activity — go on the uncovered list. Both the cost and the walk
 * errors are worth fixing; neither is worth blocking this measurement on.
 *
 * The two audit workflows declare no checkpoint at all, so walking them covers nothing. They are
 * named here so the set above reads as chosen rather than as an oversight.
 */
export const NOT_WALKED = [
  'remediate-vuln',
  'cicd-pipeline-security-audit',
  'substrate-node-security-audit',
] as const;
