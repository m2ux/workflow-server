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
 * Ordering by cost is what makes the set weighable: the first four account for most of the time the
 * fourteen take between them, so an addition goes near the top only knowingly.
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
