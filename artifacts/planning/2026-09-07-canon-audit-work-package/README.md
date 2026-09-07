# Canon audit — work-package

**Date:** 2026-09-07
**Target:** `workflows/work-package` at `56977e2c3d664b3880a833120d1478b569b48842` — 168 definition files, all read whole
**Base ref:** `c1d07a291510eb13d9ec6e49c73a5aed55b3c538`, the target of the [2026-09-06 pass](../2026-09-06-canon-audit-work-package/README.md)
**Verdict:** 74 findings — 11 High, 43 Medium, 18 Low, no Critical. All closed: 73 remediated across 18 commits on `workflow/work-package-canon-remediation`, one withdrawn.

A standalone canon audit run with the `workflow-canon` skill, then applied. This is the first pass over this target with no coverage residual: every activity YAML, every technique operation, every group container, every resource and every README was read whole, so the register's existence claims resolve against the target rather than against a fraction of it.

| File | Holds |
|---|---|
| `README.md` | This index |
| [findings-register.md](./findings-register.md) | The 74 findings, the commit each was applied in, the withdrawn candidate, the change surface, the criteria and file coverage ledgers, and what the code branch owes |

## What the audit found

Four defects had runtime consequence rather than hygiene cost, and two of the four were introduced by the fixes the previous passes applied:

- The findings-classification step ran **after** the loop whose continuation test reads the two actionable flags it produces, so on a first pass both flags sat at their defaults and the fix cycle could never run.
- The test-plan operation read a value produced six steps later in the same activity.
- The classification pass that produces the loop's flags ran after that loop.
- One elicitation value, the question domains, had no producer anywhere in the corpus.

The dominant *pattern*, though, is not any single defect. Five separate defect classes were each fixed once by an earlier pass and left standing on their siblings, because the fix scope was the finding's file rather than the class's reach. Effectless checkpoint options, capability sections written as operation inventories, session-interaction leaking into a technique, a raw primitive where an operation existed, a criterion restated in a second home — each closed at one site and surviving at two to four others.

## What the fixes changed

Eighteen commits. The behavioural ones, in the order they landed:

| Commit | What changed |
|---|---|
| `9fa99a86` | The comprehension artifact's identity and the scope value the deep-dive reads |
| `338f429b` | Knowledge-base search reached through its operation; test-plan fill rules homed in the guide |
| `f6c8e51b` | Five contract splits, a review-summary refinement cycle, and the classification-before-loop reorder |
| `685c2f90` | Elicitation split so no operation both asks a question and records its answer |
| `ce988cac` | Issue creation split by platform, so neither operation branches on the platform it was handed |
| `2765fd9e` | Each open-work register reached through the operation that owns it |
| `74098f86` | Six values moved to the side that supplies them |
| `f0c376e0` | Each checkpoint option given an outcome that distinguishes it |

The register's Remediation status table maps every finding to its commit.

## What the guards say

All 32 corpus guards pass on the branch. Three of them found regressions my own fixes introduced, each an instance of a rule this audit itself reports:

- Adding an exit to the strategic-review activity broke `remediate-vuln`, which borrows that activity and must bind every exit in its own graph.
- Moving classification ahead of the loop turned two declared reads into internal reads.
- Hoisting the changed-files set to the workflow-root container gave all fifteen activities a read they did not need — twice, because wording the hoisted rule with a braced identifier reproduced the cascade from the Rules section.

The binding-fidelity ledger's twelve surviving work-package verdicts were re-affirmed against the remediated corpus. Four of them cite the co-author trailer rule, which the directory-scope rewrite moved down its file, so their sites name the new line; the implementation-analysis dead-output entry goes, its value now having a consumer.

## Coverage

Criteria: every unit of all four homes plus the guard registry walked, with four families recorded `not-applicable` and their reasons stated. Files: 168 read, 0 unread. The option-coverage walk is the one unit whose verdict is recorded separately, since it runs in tens of minutes against a held checkout.
