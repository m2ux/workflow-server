# Work Planner Common Context

## Scope

Apply the shared section-reading and common-prerequisite guidelines to Work Planner's command catalog, mode callers and supporting guides. Preserve its work-management procedures and explicit whole-document requirements.

## Tasks

- [x] Inspect the catalog, callers and revision guidelines.
- [x] Structure common prerequisites and update caller routes.
- [x] Check all affected mode paths, existing tests and fresh-agent behavior; preserve disclosure failures.
- [x] Commit, push and link the results from PR 1295.

## Structure and Regression

- All 294 existing Work Planner tests pass in 6.635 seconds. Skill metadata and whitespace checks pass.
- All 647 local links and anchors across 28 Markdown files resolve. Three deliberate ellipsis placeholders in templates are excluded from link validation.
- All ten modes link command conventions once before their procedures. Their supporting sections inherit those prerequisites; supporting guides also name the conventions for whole-guide callers.
- Conventions includes its Execution subsection and ends before Issues. Graph Conventions ends before Index Status; Delivery State ends before Match Pull Requests. None of these common sections contains a command block.
- Understand links Graph Conventions before graph operations. Align, Plan, Sync and Deliver link Delivery State before matching or syncing epics; the Work Breakdown Guide shares that link. Individual operation links remain at their points of use.
- All 72 executable command blocks are byte-for-byte identical to the prior revision. The shared report meanings retain their text in Delivery State. This revision changes guidance and reading paths, not scripts or command interfaces.
- Rules precedes Dependencies. Revise explicitly reads both authoring guides and requires shared progressive-disclosure and disclosure-verification checks.

## Live Results

**Result: Partial.** Three independent fresh agents receive realistic tasks and authority limits, without expected reading choices or earlier findings. Understand and Sync produce local execution plans only. Revise performs a one-placeholder template edit in an isolated worktree and runs local checks. Actual tool calls and returned content are audited; private reasoning and raw traces are not published.

| Scenario | Common context observed | Task result | Disclosure limitation |
| --- | --- | --- | --- |
| Understand | Complete Conventions and Graph Conventions, once each | Plan preserves missing graph evidence and revision identity | Range 551–647 includes the unrelated Create Task Worktree operation; one batch is truncated |
| Sync | Complete Conventions and Delivery State, once each in returned content | Plan distinguishes merged work from verified criteria and completion | Attempts the whole catalog, then broad recovery ranges; unrelated issue, graph and dispatch operations enter context; two batches are truncated |
| Revise | Complete Conventions, once; both authoring guides whole | Exact placeholder edit; all 294 tests pass | Two batches are truncated, including a required guide read; complete receipt across recovery ranges is not established |

The isolated revision preserves all 18 prepared baseline files by SHA-256, changes only the requested placeholder in planning-readme.md, and produces no untracked files. Consumer-mode reads in that revision are relevant to its shared planning template and are not automatically classified as unrelated.

The common sections can be retrieved without their neighboring operations. These trials do not establish consistent compliance: broad reads, ordering and recovery still need improvement in observed agent behavior. Each scenario ran once; no repeated-run reliability or context-token savings are claimed. Standup and the other mode routes received structural inspection rather than fresh-agent execution. The explicit whole-Work-Breakdown-Guide requirement remains part of the supported reading path.

## Evidence

The [measured evidence](planner-disclosure-evidence.json) records the 18 tested file hashes on base 015b225272e6e8bfc0b87874dae878940b4e1213, structural results, delivered sections, tool-call identifiers and fixture checks.

| Scenario | Session |
| --- | --- |
| Understand | 01a12674-f1f4-7ad3-95d8-6e65845dc65c |
| Sync | 01a12675-0ab6-73d3-9ea1-f9c9ed95bcbe |
| Revise | 01a12675-235d-7480-a3f9-06602179b718 |

## Delivery

The skill revision is [02ed1bc909b21fdb6d80484f8dc6afabc2cb38c8](https://github.com/m2ux/workflow-server/commit/02ed1bc909b21fdb6d80484f8dc6afabc2cb38c8), published on skill/work-designer in [PR 1295](https://github.com/m2ux/workflow-server/pull/1295). Its Test Plan links T13 to Structure and Regression and T14 to Live Results, retaining Partial outcomes and the table-only format.
