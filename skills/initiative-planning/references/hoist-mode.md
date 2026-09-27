# Hoist mode

Brings the tracker's standalone issues into the house structure: each one the user chooses joins
an existing initiative, epic or task, or a new one. Every open issue with no house prefix is a
candidate, in two groups:

- **Orphans:** no open initiative, epic or task links them.
- **Cited standalone issues:** open house issues link them, as a reference or in prose, yet they
  sit outside the structure. An investigation an epic cites is one. When the citing epic's criteria
  already carry its work, the investigation is subsumed into that epic.

The Work Breakdown guide (`work-breakdown.md`) states how rows, criteria and references are
written.

## Placements

| Placement | The orphan's work becomes | The orphan issue |
| --- | --- | --- |
| **Existing task** | criteria and design in a task that has its own issue | subsumed |
| **New task** | a row in an existing epic, with its criteria | kept as the task's issue, or subsumed |
| **New epic** | an epic in an existing initiative | kept as the epic's issue, or subsumed |
| **New initiative** | an initiative, raised in plan mode | kept as the initiative's issue, or subsumed |
| **Leave** | nothing; the orphan is not initiative work | stays open, in the standalone layout |

- **Kept.** The orphan becomes the new task, epic or initiative issue. It is retitled with its house
  prefix, labelled, and rewritten from its template, and the issue that lists it links it: a task's
  row id, or an epic's row in its initiative.
- **Subsumed.** The orphan's work folds into the issue that takes it: its outcomes become criteria of
  one invariant each, and its design goes into the Proposal. That issue's References cite the
  orphan for the detail it holds, so nothing it recorded is lost. The orphan is then closed with a
  comment naming the issue that took it.
- **Keep or subsume.** An orphan that already references detailed planning, a folder of markdown
  files such as `artifacts/planning/2026-09-10-activity-representation/`, is subsumed: the taking
  issue's References cite that folder beside the orphan, and the orphan closes. Otherwise keep the
  orphan when its work needs discussion or evidence of its own, as a task with its own issue does,
  and subsume it when its detail fits in rows, criteria and a reference.
- **Left.** An orphan left in place keeps no house prefix, and its body takes the standalone
  layout, `templates/issue.md`, when it does not already follow it.
- **Bodies state the result,** as every body does: none says work was hoisted, migrated or
  subsumed, or names where it came from. A reference to the orphan says what detail it holds
  (`The evidence walks and the carve-outs.`), and a kept orphan's body reads as if it had always
  been its task, epic or initiative.

## Procedure

1. **Fetch** every issue: `gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" >
   issues.json`.
2. **List candidates** with `scripts/orphans.py issues.json`. It prints the orphans, then the
   cited standalone issues, each with its labels, the house issues citing it and any planning
   folder it links, then the open initiatives and epics a placement can name.
3. **Triage** each orphan. Read it whole, with its comments
   (`gh api --paginate repos/{owner}/{repo}/issues/874/comments`), and the bodies of the
   initiatives and epics whose themes and criteria it touches, and note any planning folder it
   references, in its body or its comments. For each orphan, draft:
   - the placements that fit, best first, each naming its target and whether the orphan is kept or
     subsumed;
   - for a placement in an existing epic, the row it would add (Description, criteria, Depends on,
     Join), or the existing task that already delivers it;
   - **Leave** when no initiative's goal covers it, or when it is not planned work.
   A candidate whose work an existing criterion already states is subsumed into the issue holding
   that criterion, with no new row; for a cited standalone issue, that is usually the issue citing
   it.
4. **Offer** each orphan to the user, one at a time: a plain paragraph on what the orphan asks and
   where it fits, then the placements as options with the recommended one first, and Leave last.
   Placing an orphan in another initiative's issue needs that answer as its approval.
5. **Apply** each choice in turn:
   - **Existing task:** add the orphan's outcomes to the task issue's criteria and its design to the
     Proposal. Where they reach past the epic's criteria, add epic criteria too, cited by the task's
     row. Subsume the orphan.
   - **New task:** draft the row and its criteria in the epic. Number it where it can start, with
     `scripts/renumber.py` when undelivered tasks must move. Keep or subsume the orphan.
   - **New epic:** draft the epic from `templates/epic.md` and its row in the initiative, with the
     initiative criteria it serves; follow plan mode's steps for creating and linking an epic. Keep or subsume.
   - **New initiative:** run plan mode with the orphan as its input. Keep or subsume.
   - **Kept:** retitle the orphan with its house prefix and a title of the house form, label it
     with its `type:*` (and a `theme:*` for an initiative or epic), and rewrite its body from its
     template, carrying its evidence into
     Problem and its design into Proposal.
   - **Leave:** run review mode's check (`format.py`) on the orphan and bring its body into the
     standalone layout, carrying its content into the template's sections.
   - **Subsumed:** cite the orphan under the taking issue's References
     (`- **Rn.** [Element Shape](…/issues/874) — The operations surveyed and their prose entries.`),
     and any planning it references as its own entry, then close it:
     comment `Tracked in [I07:E01](…/issues/937) W04.` and
     `gh api --method PATCH repos/{owner}/{repo}/issues/874 -f state=closed -f state_reason=not_planned`.
     The work stays planned in the taking issue, which is where that work is tracked.
6. **Review.** Run review mode's check (`format.py`) on every issue the hoist changed or created,
   and `deps.py` on each initiative that gained a task or epic. Fold every finding in.
7. **Report** each orphan's placement, the issues changed, created or closed, and the orphans left.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/orphans.py issues.json
```
