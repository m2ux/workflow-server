# Hoist Mode

Brings the tracker's standalone issues into the agent-engineering structure: each one the user chooses joins an existing initiative, epic or task, or a new one. Every open issue with no agent-engineering prefix is a candidate, in two groups:

- **Orphans.**  No open initiative, epic or task links them.
- **Cited standalone issues.**
  - Open agent-engineering issues link them, as a reference or in prose, yet they sit outside the structure. An investigation an epic cites is one.
  - When the citing epic's criteria already carry its work, the investigation is subsumed into that epic.

## Placements

A placement is the choice of where an orphan's work goes. The table states what that work becomes and whether the orphan issue is kept, subsumed, or left open.

| Placement | The orphan's work becomes | The orphan issue |
| --- | --- | --- |
| **Existing task** | criteria and design in a task that has its own issue | subsumed |
| **New task** | a row in an existing epic, with its criteria | kept as the task's issue, or subsumed |
| **New epic** | an epic in an existing initiative | kept as the epic's issue, or subsumed |
| **New initiative** | an initiative, raised in [Plan Mode](plan-mode.md) | kept as the initiative's issue, or subsumed |
| **Leave** | nothing; the orphan is not initiative work | stays open, in the standalone layout |

- **Kept.**
  - The orphan becomes the new task, epic or initiative issue.
  - It takes every formatting rule of that kind: the title form, the labels, its template, and the scheme's rules for bodies, code references and succinct items.
  - An initiative row links its epic issue. Task rows follow [Task ids](work-breakdown.md#task-delivery); a task issue's Development field links its delivery pull request.
- **Original body.**
  - A kept or left orphan's body is rewritten, so its body before the rewrite goes to a comment on the orphan first.
  - The comment opens with a line naming the layout it took: `The body before this issue took the [I07:E01:W04] layout:`, or `the standalone layout:` for a left orphan.
  - Take the body live with [Fetch Body](commands.md#fetch-body), since `issues.json` can be stale by the time the orphan is applied. The comment file is the lead line, a blank line, then that body word for word, posted with [Comment on Issue](commands.md#comment-on-issue).
  - A subsumed orphan closes with its body as it is.
- **Subsumed.**
  - The orphan's work folds into the issue that takes it: its outcomes become criteria of one invariant each, kept as the [Verifiable](review-criteria.md#verifiable) rule defines, and its design goes into the Proposal.
  - That issue's References cite the orphan for the detail it holds, so nothing it recorded is lost.
  - The orphan is then closed with a comment naming the issue that took it.
- **Keep or subsume.**
  - An orphan that already references a [planning record](commands.md#add-planning-record), such as workflow-server's `2026-09-10-activity-representation`, is subsumed: the taking issue's References cite that folder beside the orphan, and the orphan closes.
  - Otherwise keep the orphan when its work needs discussion or evidence of its own, as a task with its own issue does.
  - Subsume it when its detail fits in rows, criteria and a reference.
- **Left.**
  An orphan left in place keeps no agent-engineering prefix, and takes the formatting rules of a standalone issue: the title form, the [issue template](../templates/issue.md), and the scheme's rules for bodies, code references and succinct items.
- **Bodies state the result.**
  - No body says work was hoisted, migrated or subsumed, or names where it came from.
  - A reference to the orphan says what detail it holds (`The evidence walks and the carve-outs.`).
  - A kept orphan's body reads as if it had always been its task, epic or initiative.
  - What the orphan said before lives in the original-body comment, never in the body.

## Procedure

1. **Fetch.**  Fetch every issue with [Fetch All Issues](commands.md#fetch-all-issues).
2. **List candidates.**  Run [List Orphans](commands.md#list-orphans). It prints:
   - The orphans;
   - The cited standalone issues, each with its labels, the agent-engineering issues citing it and any planning folder it links;
   - The open initiatives and epics a placement can name.
3. **Triage.**
   Read each orphan whole, with its comments from [Fetch Comments](commands.md#fetch-comments), and the bodies of the initiatives and epics whose themes and criteria it touches. Note any planning folder it references, in its body or its comments. For each orphan, draft:
   - The placements that fit, best first, each naming its target and whether the orphan is kept or subsumed;
   - For a placement in an existing epic, the row it would add (Description, criteria, Depends on, Joins), or the existing task that already delivers it;
   - Leave, when no initiative's goal covers it, or when it is not planned work.

   A candidate whose work an existing criterion already states follows this mode's Already stated rule.
4. **Offer.**
   - Offer each orphan as an [Interview](interview.md). The grounding paragraph says what the orphan asks and where it fits. Leave is last.
   - Placing an orphan in another initiative's issue needs that answer as its approval.
5. **Apply.**  Apply each choice in turn:
   - **Existing task.**
     - Add the orphan's outcomes to the task issue's criteria and its design to the Proposal.
     - Where they reach past the epic's criteria, add epic criteria too, cited by the task's row.
     - Subsume the orphan.
   - **New task.**
     - Draft the row and its criteria in the epic.
     - Number it where it can start, with [Renumber Tasks](commands.md#renumber-tasks) when a task no pull request names must move.
     - Keep or subsume the orphan.
   - **New epic.**
     - Draft the epic from the [epic template](../templates/epic.md) and its row in the initiative, with the initiative criteria it serves.
     - Follow [Plan Mode](plan-mode.md)'s steps for creating and linking an epic.
     - Keep or subsume the orphan.
   - **New initiative.**  Run [Plan Mode](plan-mode.md) with the orphan as its input. Keep or subsume the orphan.
   - **Kept.**
     Post the original-body comment, then rewrite the orphan by its kind's rules with [Retitle Issue](commands.md#retitle-issue), [Add Labels](commands.md#add-labels) and [Patch Body](commands.md#patch-body), carrying its evidence into Problem and its design into Proposal.
   - **Leave.**
     - Run [Check Format](commands.md#check-format) on the orphan.
     - When its body needs rewriting, post the original-body comment, then rewrite it by a standalone issue's rules with [Patch Body](commands.md#patch-body), carrying its content into the template's sections.
   - **Subsumed.**
     - Cite the orphan under the taking issue's References (`- **Rn.** [Element Shape](…/issues/874) — The operations surveyed and their prose entries.`), and any planning it references as its own entry.
     - Close it: [Comment on Issue](commands.md#comment-on-issue) with `Tracked in [I07:E01](…/issues/937) W04.`, then [Close as Not Planned](commands.md#close-as-not-planned).
     - The work stays planned in the taking issue, which is where that work is tracked.
6. **Review.**
   - Run [Check Format](commands.md#check-format) on every issue the hoist changed or created.
   - Run [Check Dependencies](commands.md#check-dependencies) on each initiative that gained a task or epic.
   - Fold every finding in.
7. **Report.**
   Report each orphan's placement, the issues changed, created or closed, and the orphans left.

## Rules

- **Already stated.**
  A candidate whose work an existing criterion already states is subsumed into the issue holding that criterion, with no new row. For a cited standalone issue, that issue is usually the one citing it.
