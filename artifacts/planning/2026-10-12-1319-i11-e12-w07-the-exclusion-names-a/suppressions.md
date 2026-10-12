# The Twenty Suppressions

Every command specification the exclusion drops at base `67fe12ad`, with the section of its own file that cites it and the one procedure elsewhere that runs it. Measured by reading each self-citation against the heading trail it sits under, over `skills/work-planner`, `skills/workflow-canon`, `skills/gitnexus` and `skills/server-in-the-loop`.

## What each file is

- **`work-planner/references/commands.md`.**
  A catalog. Its h1 is `Commands` and every section beneath it is a command listing, so it holds no Procedure and every citation inside it comes from a sibling specification.
- **`workflow-canon/references/canon-context.md`.**
  A reference context. Its h1 is `Canon Context` and its sections state terms, criteria, scope, homes, checks and conventions before an h2 `Commands` listing. It carries no Procedure: the modes that read it run the commands.
- **`workflow-canon/references/change-surface.md`.**
  A reference for the audit surface. Its h1 is `Change Surface` and its sections state capture, identity, applicability, evaluation, completion, freshness and artifacts before an h2 `Commands` listing. It carries no Procedure either; `audit-dispatch.md` and the audit modes hold the steps.

## The table

| # | Specification | Held in | Cited from | Kind | Run by |
| --- | --- | --- | --- | --- | --- |
| 1 | Fetch All Issues | commands.md | List Orphans | Sibling specification | hoist-mode.md |
| 2 | Development Access | commands.md | Capture Issue Development, Fetch Pull Request Issue Links, Link Pull Request to Issue | Sibling specification | SKILL.md |
| 3 | Capture Issue Development | commands.md | Close as Completed, Check Issue Closure | Sibling specification | work-breakdown.md |
| 4 | Fetch All Initiative Pull Requests | commands.md | Plan Queue, Find Available Work, Summarise Progress | Sibling specification | board.md |
| 5 | Merge Pull Request | commands.md | Update Epic Base, Update Task Branch | Sibling specification | work-breakdown.md |
| 6 | Update Epic Base | commands.md | Fetch Merge Readiness | Sibling specification | work-breakdown.md |
| 7 | Fetch Merge Readiness | commands.md | Merge Epic Pull Request | Sibling specification | work-breakdown.md |
| 8 | Merge Epic Pull Request | commands.md | Update Epic Base | Sibling specification | work-breakdown.md |
| 9 | Change Surface | commands.md | Symbol Context, Flow Trace | Sibling specification | understand-mode.md |
| 10 | Renumber Epics | commands.md | Renumber Tasks | Sibling specification | review-passes.md |
| 11 | Match Pull Requests | commands.md | Fetch Pull Request | Sibling specification | sync-mode.md |
| 12 | Resolve Ref | canon-context.md | `## Scope` | Reference prose | walk-rules.md |
| 13 | Run Option Coverage | canon-context.md | `## Checks` | Reference prose | coverage.md |
| 14 | Run Guard Suite | canon-context.md | `## Checks` | Reference prose | coverage.md |
| 15 | Fetch Unit | canon-context.md | `## Criteria` | Reference prose | audit-mode.md |
| 16 | List Units | canon-context.md | Fetch Unit | Sibling specification | canon-map.md |
| 17 | Plan Audit Assignments | change-surface.md | `## Freshness and Resume` | Reference prose | audit-dispatch.md |
| 18 | Write Audit Packet | change-surface.md | `## Freshness and Resume` | Reference prose | audit-dispatch.md |
| 19 | Reset Audit Cells | change-surface.md | `### Cell Verification`, `## Freshness and Resume` | Reference prose | audit-dispatch.md |
| 20 | Retry Audit Assignment | change-surface.md | `## Freshness and Resume` | Reference prose | audit-dispatch.md |

Twelve citations are a sibling specification naming another specification of the same listing. Eight are reference prose naming the command the passage describes. None is a procedure step: neither `canon-context.md` nor `change-surface.md` carries a Procedure section, and a catalog carries none by construction. All twenty are therefore reported, and each names the single procedure elsewhere that runs it.

## The citation the rule keeps suppressing

`revise-mode.md#check-skill-summaries` in `skills/workflow-canon/references` is cited from `revise-mode.md:23`, step 5 of the file's h2 `Procedure`, and from `coverage.md:130`. The Procedure citation counts, so the specification has two callers and draws no finding. That is the case the exclusion exists for, and it is the only shape of citation the narrowed rule still counts.

## Citations the rule drops without changing a count

These self-citations also stop counting, and none of them changes a finding, because each specification has either several other callers or none.

- `canon-context.md` — Find the Server Checkout and Check the Corpus Tree from `## Homes`, Run Guards on the Delta from `## Checks`, Run the Edit Guard from `## Edit Hook`, Provision the Corpus from the Check the Corpus Tree specification.
- `change-surface.md` — Initialize Audit Surface from `## Capture`, Check Audit Status and Refresh Audit Surface from `## Applicability`, `## Completion` and `## Freshness and Resume`.
- `coverage.md` — twelve citations from its coverage sections, each naming a specification of its own Commands listing.
- `review-mode.md` — Abort Review Merge from `## Rules`, and Create Review Worktree from the Prepare Integration Result specification; its ten other self-citations are Procedure steps and still count.
- `revise-mode.md` in `workflow-canon` — Check Skill Files from the Run Skill Checks specification; its seven others are Procedure steps and still count.
- `commands.md` — the remaining forty self-citations, each to a specification several files run or none does.
