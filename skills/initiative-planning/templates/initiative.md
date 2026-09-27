## Overview

{{One paragraph: what the initiative achieves, stated as the end state. Name the goal the reviews will test against.}}

## Problem

{{One sentence on the gap, then one bullet per facet. Each bullet is bolded, carries measured evidence (counts, paths, file:line), and says why it matters.}}

- **{{Facet}}.** {{Evidence and consequence.}}

## Proposal

- **{{Move}}.** {{What is done, in one or two sentences.}}

## Work Breakdown

| Epic | Description | Depends on |
| --- | --- | --- |
| [E00](https://github.com/{{OWNER}}/{{REPO}}/issues/{{EPIC_ISSUE}}) | {{The epic's title name, the part before the colon}} → AC{{n}}, AC{{m}} | {{[Exx](…), the other epics this epic's tasks depend on}} |

## Acceptance Criteria

- [ ] **AC1.** {{A SMART criterion stating one invariant, a single condition that holds or does not: specific, measurable by a named check or against a named baseline, achievable, and relevant to the Problem. It carries no counts or figures, which go stale, unless the figure is its own target, such as a bound it holds to. It is local and solution-agnostic: it states what holds, names no initiative, epic, task or issue, and the Description column says which epics serve it. Where a release tag or another named milestone outside this work bounds it, it ends with that. The epics' criteria together make it true; it restates none of them. It ends by naming its instrument: the automated test that verifies it where one can exist, an end-to-end walk, smoke run, live check, or a guard or check continuous integration runs (as the all-workflows walk shows), or else how the user confirms it (as the user confirms from a production run). A test it names that does not exist yet is work in this initiative. Update mode ticks it once that test passes, and the user ticks one that names no test.}}

## Non-goals

- {{One succinct sentence on what this initiative does not do. It names no initiative, epic, task or issue, and no owner.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there.}}
