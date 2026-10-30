# Original Issue

> Alignment Gaps: Plan Repair, Diagnosis and Public References · issue #1246 · opened 2026-10-08 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E11:W02] Alignment Gaps: Plan Repair, Diagnosis and Public References` |
| Labels | `bug`, `type:task`, `theme:planning` |
| Opened | 2026-10-08 |
| State | open |
| Assignee | none |

## Body

## Overview

This task closes three gaps around the test plan: an alignment that brings no plan to the shape the skill states, a diagnosis that names the wrong cause when a plan cannot be read, and a reference that may carry a private repository's URL into a public ticket.

## Problem

- **Alignment has no test-plan step.**
  The step that repaired a pull request's test plan, and the rule behind it, went with the two-structure mismatch they policed. Nothing replaced them, so a pull request carrying the retired checked list and `Test | Criteria` table is never brought current.
- **The gap is silent and it accumulates.**
  Twelve merged pull requests on one private initiative carried the retired shape. No check reported them, and each was converted by hand.
- **An unreadable plan reads as an untested criterion.**
  A plan no parser can read yields no claims, and no claims reports as a criterion no test observes. The message names the wrong cause, and the repair it implies is the wrong repair.
- **A reference can cross a visibility boundary.**
  A References section copied from a private repository's planning record reaches a ticket anyone can read, and nothing compares the entry's repository with the issue's.

## Proposal

- **Alignment repairs a plan written to an earlier shape.**
  Align mode converts a retired checked list and `Test | Criteria` table into the one table of Test, Description, Coverage and Pass, and reports each pull request it converted.
- **An unreadable plan is diagnosed as unreadable.**
  A plan that yields no claims is reported as a plan nothing can read, distinct from a criterion no test observes, so the two findings call for their own repairs.
- **A reference is checked against the repository that will hold it.**
  A References entry citing a private repository is a finding when the issue is public.

## Acceptance Criteria

- [ ] **AC1.** Align mode converts a pull request carrying the retired checked list and `Test | Criteria` table into the one table, and names each pull request it converted, as the skill's fixture suite shows.
- [ ] **AC2.** A test plan no parser can read is reported as unreadable rather than as a criterion no test observes, as the skill's fixture suite shows against a malformed plan.
- [ ] **AC3.** A References entry citing a private repository is reported when the issue is public, as the skill's fixture suite shows.

## References

- **R1.** [Test Plan Evidence](https://github.com/m2ux/workflow-server/issues/1249) — I11 E11, the epic this task belongs to.
- **R2.** [The commit that retired the repair step](https://github.com/m2ux/workflow-server/commit/2d596fecaf00bcb29e317e1afbd3b916f43e971c) — The step and the rule that went with the two-structure mismatch.


## Comment 1

> m2ux · 2026-10-08

The body before this issue took the [I11:E11:W02] layout:

## Overview

Three gaps around the test plan. An alignment brings no pull request's test plan to the shape the skill states, so a pull request written against an earlier shape keeps a plan nothing can read. A plan nothing can read reports as a criterion nothing tested, so the message names the wrong cause. And a reference section may carry a private repository's URL into a ticket anyone can read. This issue closes all three.

## Problem

The change that made the test plan one table left no path from the old shape to it, and no way to tell an unreadable plan from an untested criterion.

- **Alignment has no test-plan step.**
  The step that repaired a pull request's test plan, and the rule behind it, were [removed](https://github.com/m2ux/workflow-server/commit/2d596fecaf00bcb29e317e1afbd3b916f43e971c) with the two-structure mismatch they policed. Nothing replaced them, so a pull request carrying the retired checked list and `Test | Criteria` table is never brought current.
- **The gap is silent and it accumulates.**
  Twelve merged pull requests on one private initiative carried the retired shape. No check reported them, and each was converted by hand.
- **An unreadable plan reads as an untested criterion.**
  [`plan_claims`](https://github.com/m2ux/workflow-server/blob/f0412b1b/skills/work-planner/scripts/sync.py#L372-L381) answers with empty sets when [`plan_rows`](https://github.com/m2ux/workflow-server/blob/f0412b1b/skills/work-planner/scripts/sync.py#L353-L370) finds no readable table, so a pull request with no Test Plan, and one whose table is in the retired shape, each report every covered criterion as named by no test.
- **The wrong cause sends the reader to the wrong fix.**
  Those twelve pull requests produced fourteen such lines across two epics. Each epic had one cause per pull request, an unreadable table, and the lines pointed at missing tests instead.
- **A public ticket may carry a private link.**
  Nothing stops a References entry, or a code permalink, from naming a repository only some readers can open. The skill's own repository is public and the work it plans is often not, so a reference written without that in mind discloses a private repository's name, its issue numbers and its board.

## Proposal

- **Alignment brings each test plan to the stated shape.**
  For every pull request that delivers an aligned epic's tasks, open or merged, the alignment rewrites a plan that does not carry the stated columns, and writes it back. A check that passed keeps its mark, and the alignment marks none.
- **The retired shape converts rather than being discarded.**
  A checked list and its companion table hold the same facts the one table holds: the box gives the mark, the bullet gives the description, and the companion row gives the coverage. The rewrite moves them and keeps the section's prose.
- **An unreadable plan is its own finding.**
  A pull request whose Test Plan section is absent, and one whose table lacks the stated columns, each report that, and the comparison of coverage against the plan is not run for it. A criterion is reported as named by no test only where a readable plan omits it.
- **A reference names only what its reader can open.**
  An entry under References, and a permalink supporting a statement, name a repository at least as visible as the issue carrying them. A ticket in a public repository therefore cites no private repository, no issue or pull request in one, and no board that is not public.
- **Private evidence is stated without its link.**
  Where the evidence for a problem lives in a private repository, the body states the measurement and leaves the identifiers out, so the claim stands without disclosing what the reader cannot open.

## Acceptance Criteria

- [ ] **AC1.** The alignment rewrites a test plan that lacks the stated columns into them, for an open pull request and for a merged one, as a run over each shows.
- [ ] **AC2.** A rewritten plan carries one row per check of the retired list, with that check's description, its coverage and its mark, as a read of the rewritten body shows.
- [ ] **AC3.** The alignment changes no mark on a check, as a comparison of the marks before and after a run shows.
- [ ] **AC4.** The alignment leaves a test plan already in the stated columns unchanged, as a run over one shows.
- [ ] **AC5.** The sync reports a linked pull request whose Test Plan section is absent as that, and names no criterion as untested for it, as a run over such a pull request shows.
- [ ] **AC6.** The sync reports a linked pull request whose test plan lacks the stated columns as that, and names no criterion as untested for it, as a run over such a pull request shows.
- [ ] **AC7.** No file under the work-planner skill states that a reference may name a repository less visible than the issue carrying it, as a search over its references and templates shows.
- [ ] **AC8.** The skill states that an issue in a public repository cites no private repository, issue, pull request or board, as a read of the rule it carries shows.

