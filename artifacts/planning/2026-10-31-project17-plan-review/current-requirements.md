# Current Work Planner requirements and supersession map

## Authority and scope

This is I11's current marked requirements source, reconciled on 2026-10-31 from the user's accepted board-review decisions and the current task contracts. It states intended behavior; a requirement's inclusion is not evidence that its implementation passes. The original 52 requirement IDs remain stable. The complete [historical specification](source-reconciliation/requirements-before.md) preserves its meeting links and the earlier branch/API reconciliations. The [initial review snapshot](snapshots/requirements.md) preserves the earlier wording before those reconciliations.

For current planning and source alignment, the text below governs each listed requirement. Original text and completed epic criteria are historical provenance where this map supplies later wording. Runtime skill definitions remain implementation evidence, not authority to reverse an accepted contract. The producer-availability rule below governs cross-epic starts.

## Stable requirement register

Each entry is one source ID, its current statement and its reconciliation basis. “Retained” means the original statement remains applicable; it does not mean its criterion has been freshly verified. Current mode names are Plan, Align, Sync, Standup and Deliver for the responsibilities earlier called Plan, Review, Update, Progress and Deliver respectively; Plan also owns goal/dependency review.

### REQ-F001

Plan mode settles goal clauses with the user, maintains the planning record and creates initiatives and epics from their templates. New tasks are epic rows with linked work-item files; existing task issues retain their history.

**Basis:** Current epic-body task representation; I11 AC1, AC8 and AC17.

### REQ-F002

Align mode checks issue format and source consistency. Plan mode reviews goal coverage, dependencies and content changes. Mechanical corrections preserve meaning; unresolved content decisions follow the interview allowance. Completed issue bodies remain historical records except explicitly authorized evidence normalization.

**Basis:** Current mode responsibilities; I11 AC2, AC7 and AC11.

### REQ-F003

Sync mode matches delivery evidence to task rows, records verified matches and ticks only criteria whose named checks pass. Closure requires the issue's criteria and applicable delivery/Development-link gates; a PR merge alone does not close an epic or initiative.

**Basis:** I11 AC6 and AC25–AC28; branch-contract.md; E11 test-plan evidence contract.

### REQ-F004

Hoist mode finds orphan and cited standalone issues, proposes a placement and takes the user's decision. An issue labelled throwaway:* is a declared fixture and is excluded from both candidate groups.

**Basis:** E10 W25 / AC36–AC37; I11 AC8.

### REQ-F005

Standup mode reports completed, active and next work in the destination's Slack markdown format.

**Basis:** Current mode name; I11 AC5; retained reporting requirements F033–F035.

### REQ-F006

Deliver mode refreshes board availability and dispatches one session per available delivery unit. Mutually joined rows form one unit and share their planning folder and pull request.

**Basis:** I11 AC9 and AC13; E10 W10; joins-reconciliation.md.

### REQ-F007

Each mode has its own file. A selected mode loads according to its prerequisites and applicable citation timing; references that merely name a mode do not execute or load it.

**Basis:** I11 AC1 and AC32–AC33; E14 citation contract.

### REQ-F008

Initiative, epic and existing task issue titles use colon-separated house prefixes. Table references use the parser's qualified colon form; prose may name a task with spaces. Same-epic task edges may use bare task IDs.

**Basis:** Current table reference form; I11 AC28; active-dependency-contract.md.

### REQ-F009

An issue title SHALL read as a name of two or three words, a colon, and a subtitle of at most ten words, in title case; a standalone issue SHALL carry no prefix and no `type:*` label

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F010

An epic's title SHALL agree with the Description its initiative's Work Breakdown table carries for that epic

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F011

Bodies use the template for their issue kind. Initiatives and epics carry Overview, Problem, Proposal and Acceptance Criteria; their templates govern Work Breakdown, Non-Goals and References. Open Questions exists only while questions remain. A proposal uses Goal and its proposal template rather than an implementation issue's criterion/table shape.

**Basis:** Current body templates; I11 AC2 and AC10.

### REQ-F012

Initiative tables use Epic, Description, Coverage, Depends on, Done. Epic tables use Task, Description, Coverage, Depends on, Joins, Done. Standalone and existing task issues have no child-task table. A work-item file is a distinct planning artifact with a Component declaration, Overview, Problem, Proposal and a Part/Description Work Breakdown covering analysis, plan, implementation, review and tests.

**Basis:** Current initiative, epic and work-item templates; E10 W09; work-items/README.md. The historical E01 AC8 no-table statement does not govern current work-item files.

### REQ-F013

A Description cell is a short phrase of at most eight words. Criterion IDs belong in Coverage, including completed criteria whose task delivers them; Done records completion. Coverage contains no embedded prose and Description contains no criterion suffix.

**Basis:** User-approved coverage contract; E10 W09 / AC15. The current skill sentence clearing completed Coverage is a remaining implementation inconsistency owned by that task.

### REQ-F014

An epic identifier links its issue. An unreserved task links its lowercase work-item file; a held task links its planning folder; an opened delivery PR replaces the planning link. Joined rows link the shared PR, and a unit spanning long-lived targets records the delivery for each target. Existing task issues are linked through the PR's actual Development relation. Open PRs are not delivered evidence.

**Basis:** Current Task Delivery representation; I11 AC6, AC13 and AC28; E10 W03/W10.

### REQ-F015

Task dependencies name the producer rows whose outputs they consume, using qualified links across epics and no prose, duplicate or transitively redundant entries. Initiative whole-epic dependencies are derived only when every consumer row requires every producer row. Joins is mutual and means one PR for independent rows; each eligible separate pair has its own qualified pair decision. File contention controls scheduling, not semantic consumption.

**Basis:** active-dependency-contract.md; joins-reconciliation.md; approved-priorities.json. Cross-epic starts follow the approved producer-availability rule below.

### REQ-F016

Initiative and proposal templates may carry succinct Non-Goals describing boundaries without assigning work or owners. Epic, task and standalone bodies express any necessary boundary in Proposal.

**Basis:** Current initiative and proposal templates; I11 AC2 and AC10.

### REQ-F017

An initiative and an epic SHALL each carry Acceptance Criteria in which every criterion states one invariant, is specific, measurable, achievable, relevant and time-bound, is local to its own issue, carries no count unless the count is itself the target, and names no initiative, epic, task or issue

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F018

An initiative criterion SHALL name in its own sentence the instrument that verifies it — an end-to-end walk, a smoke run, a live check, or the user's confirmation — and where no such instrument exists the skill SHALL recommend building it as a task or as a test-infrastructure epic whose row cites the criteria it verifies

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F019

Sync runs an initiative criterion's named instrument once its covering delivery is available and ticks only a pass. A failed, missing or unreadable instrument leaves the criterion unverified and reports the gap. Human-only criteria await user verification. Initiative closure also requires its epics complete; epic closure requires all delivery bases merged and its criteria verified.

**Basis:** I11 AC6, AC25–AC26; branch-contract.md. F16 evidence verification remains outstanding.

### REQ-F020

A task is one PR's worth of work for each long-lived target its unit changes, with a named implementation component and accompanying tests. More than three criteria requires a split. Joined independent rows share a unit. Validation failures keep the affected task open; a later audit does not take ownership of an implementation task's tests.

**Basis:** Current task grain; E16 task-boundary decision; work-items/README.md.

### REQ-F021

An epic's open questions SHALL be resolved before the epic starts

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F022

Issue bodies state the current plan. Planning records hold decision history and delivery evidence; dependencies and completion cells carry ordering and state. Delivery mechanics are defined by their owning artifacts and protocols.

**Basis:** Current modes/protocols/artifacts structure; I11 AC2 and AC29.

### REQ-F023

Renumbering preserves every identifier already named by a pull request, including delivered work. Proposed maps are checked against current PR records before publication.

**Basis:** E10 W02 / AC8; final-skill-verification.md numbering evidence.

### REQ-F024

A pull request delivering initiative work SHALL open its title with the epic reference, as `[Ixx:Eyy] Purpose`, and SHALL leave task identifiers out

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F025

Task PRs target the corresponding epic base iNN/eNN/<long-lived-branch>. Each completed epic base integrates independently into its configured long-lived target after validation, current-head-and-base agent review and required human approval. Every base must merge before epic closure; initiative closure has its own completion gate.

**Basis:** branch-contract.md; I11 AC12, AC34 and AC36; E10 W02; E17.

### REQ-F026

Within an epic, dependent tasks start from the epic base after prerequisite delivery into that base. Task PRs target the epic base and do not form a stack on preceding task branches. A cross-epic consumer starts only when its named producer rows are delivered and their required outputs are verified available at the pinned consumer-base commit. Record the producer row, delivery evidence, output identity and consumer commit; a merge into a separate producer base alone is insufficient. Unrelated producer rows and producer-epic closure are not additional start gates. Whole-epic dependencies exist only where the task graph establishes the all-rows relationship. Existing integration, review and human-approval requirements still apply.

**Basis:** branch-contract.md; active-dependency-contract.md; producer-availability/README.md; approved-priorities.json.

### REQ-F027

Work SHALL be organised by theme, each initiative belonging to exactly one theme, each epic carrying its initiative's theme label, and each theme having one board that holds its initiatives and epics

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F028

A board SHALL be titled `<Theme>: <short description>` and SHALL be linked to the repository

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F029

Theme delivery boards contain planned initiatives and epics and any managed task issues. Proposals use the separate proposal board. Unplaced standalone issues have no theme-delivery position.

**Basis:** I11 AC4 and AC10; current proposal/board artifacts.

### REQ-F030

Status derives from current initiative membership, reservations, delivery PRs, completion and review evidence. An active task reservation or open delivery PR supports In Progress; an inactive integration draft alone does not. In Review requires completion plus passing current-head-and-base agent review without blocking findings. Ready requires a Ready or In Progress parent and met planning/delivery prerequisites. Backlog cascades only to unstarted descendants; Done is retained and active/review descendants require reconciliation. There is no single-active-initiative limit.

**Basis:** status-contract.md; E09 AC2–AC5; I11 AC34/AC36; E17.

### REQ-F031

Ready and active work is assigned as the board contract requires; unstarted Backlog work is unassigned. A parent Backlog action preserves completed descendants and reports active/review descendants for reconciliation rather than automatically clearing their assignments.

**Basis:** status-contract.md; E09 W04 / AC5.

### REQ-F032

Sync finds the theme board, reports a missing board for user resolution, adds missing managed initiatives, epics and existing task issues, and reports board and assignee changes. Creating a task row does not create a separate task issue.

**Basis:** Current Sync/board and epic-body contracts; I11 AC4.

### REQ-F033

A standup covers the named theme board or each requested board, includes initiatives containing reported work and identifies their epics/tasks. Next work is limited to the five highest-priority ready items. Numeric priority is a queue rank with larger values first; priority never bypasses dependencies or reservations. Out-of-order delivery is reported under its owning work.

**Basis:** I11 AC5; approved-priorities.json; current board queue.

### REQ-F034

A progress summary SHALL carry a single plain-language paragraph stating what was accomplished, placed below the line naming the period and above the board line

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F035

A progress summary SHALL mark each item's status with a distinct symbol in place of the status word, SHALL carry a legend for those symbols, and SHALL close with a key expanding the house initials

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F036

Deliver mode SHALL bring the board to its correct positions and statuses before it dispatches anything

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F037

Work a dispatch starts SHALL be moved to In Progress, task issues included

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F038

On dispatch a work item SHALL be given a hyperlink to its planning folder, that link reserving the work against a further dispatch, the folder named `<date>[-<ref>]-<slug>` with the reference falling back to the epic issue where the task has no issue of its own

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F039

A dispatched session's prompt SHALL instruct it to invoke the skill and then implement, following the brief the skill holds for a dispatched session

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F040

A reservation retains the planning-folder link while the session holds the unit, including after planning completes. The folder README links its work-item file. Explicit release restores the file link; opening a delivery PR replaces the planning link with that PR. Planning completion alone does not release a hold.

**Basis:** I11 AC13; E15 reservation evidence; E10 W10; current Task Delivery contract.

### REQ-F041

Align reads initiative References entries explicitly marked Source as normative. Current requirements and their supersession map govern alignment; historical sources establish provenance. Any source URL is allowed, and unreadable sources are reported as findings. Review compares criteria and source requirements in both directions and does not infer delivery from a source statement.

**Basis:** I11 AC11; current source selection and this map.

### REQ-F042

A hoisted candidate SHALL be kept as its own issue, subsumed, or left standalone; a candidate whose detail already lives in a planning folder SHALL be closed after migration with the receiving epic's References citing that detail and the close carrying a comment naming where the work now lives; no body SHALL record the migration

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F043

Where hoist rewrites an issue's body, the existing body SHALL first be posted as a comment opening with a lead line saying what it is

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F044

The skill SHALL declare name and description only in its frontmatter, and the description SHALL be succinct and carry at least one trigger phrase for each mode

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F045

Commands have one specification under the skill's declared structure. Execution callers are procedure steps that run the command; required citation reach is measured separately. Subject-owned artifact commands remain with their artifact where the structure declares keeps_commands. Modes/protocols/artifacts preserve their call boundaries; a shared catalog is not imposed. Calling prose names the owning operation.

**Basis:** caller-retrieval-contract.md; E12 historical layout; E10 W21/W23; I11 AC19 and AC29.

### REQ-F046

The skill's markdown SHALL place each paragraph and list item on one line, SHALL use markdown links rather than bare URLs, and SHALL write a bold lead as a label followed by a full sentence

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F047

The skill's mode summary SHALL name on its own line what each mode does, with that mode's capabilities as a bulleted list, and the skill SHALL carry a Rules section holding the statements that bind every mode

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F048

The skill SHALL carry scripts that check and apply the house rules — title shape, description width, one invariant per criterion, counts, references, change-narrative wording, dependency and join consistency, and board and assignee calls — each reached through a named operation

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F049

The skill SHALL be named Work Planner, SHALL consolidate the repeated planning operations into one place, SHALL trigger on requests to plan the work and similar phrasings, and SHALL use one vocabulary across its instructions, references and scripts

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-F050

The skill holds and checks body templates for proposals, initiatives, epics, existing task issues and standalone issues. New tasks use epic rows and separate work-item records rather than newly created task issues.

**Basis:** Current body/work-item templates; I11 AC2 and AC10.

### REQ-NF001

The conventions binding every skill in the repository SHALL live in one shared guide, and a skill's own reference guide SHALL hold only what is specific to that skill

**Basis:** Retained from the historical specification and its linked meeting provenance.

### REQ-NF002

Use REST for supported operations and current GraphQL for capabilities REST cannot provide, including reads and writes, without a one-off exception. Specifications identify the REST capability gap. Project operations use Projects V2; deprecated Projects classic fields, types and mutations are excluded.

**Basis:** Explicit user instruction; api-contract.md; I11 AC24; E10 W05; E16.

## Later requirements and ownership

These clauses cover later accepted scope that the original register does not fully state. They supplement its stable IDs without renumbering initiative or epic criteria.

| Clause | Current requirement | Delivery and verification ownership |
| --- | --- | --- |
| CUR-01 | Project-specific mandatory criteria are declared by the project; the generic skill reads the trigger, criterion text, matching phrase and delivering-row name. Missing declarations are unevaluable without project defaults. | E13 W01–W03; I11 AC31; configuration-authority.md. |
| CUR-02 | Branch and required-criteria configuration comes from the resolved evaluated commit, with repository, commit and path recorded. Epic checks use the pinned epic base and merged-delivery checks use the merged commit. Missing, empty and unreadable sources name skipped checks; dirty worktrees and other refs do not supply fallback. | E09 W06/W07 and E13 W02; configuration-authority.md. |
| CUR-03 | Citation timing binds the consuming step/rule, section anchors delimit reads, whole-file conditions lead their sentence, and later-step prerequisites sit at their consumer. Descriptive mode names remain plain text. | E14 W01–W09; I11 AC32/AC33. |
| CUR-04 | Every skill has a generated citation manifest tied to the settled prose. Final efficacy and retrieval follow all contributing edits and final manifest generation. | E14 W10/W11; e14-evidence-order.md. |
| CUR-05 | The final no-increase verdict compares every matched scenario against 04de875a8517dcf229462e3b939099e16ffe3e63 using one pinned instrument and identical frozen inputs. Count distinct required instruction files transitively, including specification citations; every per-case delta must be nonpositive. Missing or incomparable cases block a pass. | E14 W11 / I11 AC30 is the sole verdict owner; E10 W23 supplies measurements; retrieval-baseline.md. |
| CUR-06 | Final conformance verification covers every repository skill with no exclusions or accepted baseline failures and records the revision, inventory, command, output and exit status. Later changes to its inputs invalidate the final evidence. | E10 W26; final-skill-verification.md. |
| CUR-07 | A merged PR's passed, readable test plan verifies only the criteria its checks actually observe. Earlier plan shapes are aligned, unreadable plans reported, and private references in public issues diagnosed. Task identity is parsed independently of the row link target. | E11; I11 AC25–AC28. Initiative-level verification remains F16 work. |
| CUR-08 | Complete Development captures cover every supplied issue/PR and every relation page. Unread subjects are reported with nonzero exit, rather than empty evidence. Closure sweeps report unticked criteria/unmerged linked PRs and state reasons. Revision helpers resolve a commit, run the instrument there and clean up after success or failure. | E16 W01–W05; I11 AC35; e16 task-boundary record. |
| CUR-09 | Epic handoff requires a published agent review identifying both integration head and base, scope, findings, dispositions and validation. Missing/stale evidence or an unresolved blocker prevents In Review. Changed head or base requires review of the new comparison. Human merge approval is a separate requirement. | E17 W01/W02; I11 AC34/AC36; status-contract.md. Historical E15 completion signals are necessary but insufficient. |
| CUR-10 | Every unfinished task has a work-item record with an implementation component, supporting file changes and validation. Scheduling includes instruction/test/write overlap; separate PR decisions do not imply parallel safety. | work-items/README.md and approved-priorities.json. |

## Source discrepancies with existing owners

- **Completed Coverage:** The current skill's epic-body artifact says a completed task's Coverage is empty. REQ-F013 and accepted E10 AC15 retain the criteria a completed row delivers. E10 W09 owns the definition and format-check correction. Current planning retains Coverage; this source reconciliation does not claim the runtime instruction is already fixed.
- **Work-item tables:** Historical closed E01 AC8 describes a work file without a table. REQ-F012 governs current files: their Part/Description table records implementation work, while the epic retains criterion coverage and dependency/Joins ownership. The closed historical epic is preserved.
- **Reservation lifetime:** Historical REQ-F040 releases the folder link merely because planning finished. Current REQ-F040 retains it while the session holds the work, in agreement with I11 AC13 and the actual reservation representation.
- **Review identity:** E17's current issue uses head-only wording in several places. CUR-09 and I11 AC36 require both head and base. The active issue wording is aligned by this reconciliation; its implementation and validation remain E17 delivery work.

## Cross-epic prerequisite availability

A cross-epic consumer starts only when its named producer rows are delivered and their required outputs are verified available at the pinned consumer-base commit. Record the producer row, delivery evidence, output identity and consumer commit; a merge into a separate producer base alone is insufficient. Unrelated producer rows and producer-epic closure are not additional start gates. Whole-epic dependencies exist only where the task graph establishes the all-rows relationship. Existing integration, review and human-approval requirements still apply.

Delivery evidence proves availability at the actual consumer revision, including any required generated artifact or configuration. Missing, stale, inaccessible or untraceable evidence leaves the consumer blocked and identifies the missing producer output. Refreshing the consumer base requires rechecking availability. The user-approved serial epic order remains in force; eligibility does not automatically change queue priority or authorize parallel dispatch.

## Verification boundary

All 52 original requirement IDs occur once; each has a retained or reconciled statement. CUR-01 through CUR-10 trace later scope to existing owners. Original requirement/meeting text is preserved. Source-reference publication and exact issue readbacks are recorded separately. No criterion is ticked and no completed epic is reopened by this edit. F14's source/version map and cross-epic start rule are reconciled at plan level. Implementation belongs to existing delivery tasks; F16 remains a separate evidence task.
