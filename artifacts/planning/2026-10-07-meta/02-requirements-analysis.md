# Requirements Analysis Report

## Sources
**Analysis Date**: 2026-10-07

- **Source ID**: SRC-MTG001 · **Title**: Skill genesis, house scheme and board sync · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-27-b8c47927.md`
- **Source ID**: SRC-MTG002 · **Title**: Hoisting standalone issues into epics · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-28-52f3fc03.md`
- **Source ID**: SRC-MTG003 · **Title**: Progress mode · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-28-8d61d701.md`
- **Source ID**: SRC-MTG004 · **Title**: Management summary and status emoji · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-28-9b7d2432.md`
- **Source ID**: SRC-MTG005 · **Title**: Skill rename, header and layout · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-29-a0b1179e.md`
- **Source ID**: SRC-MTG006 · **Title**: Hoist to a new initiative · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-29-e08b3d64.md`
- **Source ID**: SRC-MTG007 · **Title**: Initiative integration branches · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-30-2a2c8d9b.md`
- **Source ID**: SRC-MTG008 · **Title**: Theme boards and the shared skills guide · **Attribution**: MC · **Source Path**: `../../meetings/2026-09-30-6f5a01ac.md`
- **Source ID**: SRC-MTG009 · **Title**: Epic planning and branch creation · **Attribution**: MC · **Source Path**: `../../meetings/2026-10-05-6b3a029b.md`
- **Source ID**: SRC-MTG010 · **Title**: Criterion instruments and source alignment · **Attribution**: MC · **Source Path**: `../../meetings/2026-10-06-14f0f12f.md`
- **Source ID**: SRC-MTG011 · **Title**: Deliver mode · **Attribution**: MC · **Source Path**: `../../meetings/2026-10-06-3abee13a.md`
- **Source ID**: SRC-MTG012 · **Title**: Normative sources in review mode · **Attribution**: MC · **Source Path**: `../../meetings/2026-10-06-b11a33ec.md`

## Requirements Changes

### New Requirements

The specification is created from scratch, so every requirement below is new. Each entry gives the identifier, the title, the statement, its target section, and the contributing passages as Source ID plus the verbatim heading above the passage.

**Modes** — target section 3.1.

- **REQ-F001. Plan Mode.** The skill plans a body of work: it settles goal clauses with the user, writes a planning record, and creates the initiative, epic and task issues from the templates. [SRC-MTG001 "054238 — skill/initiative-planning"; SRC-MTG007 "161614", "034438", "035141"; SRC-MTG008 "144316", "144837", "145720", "150233"; SRC-MTG009 "045103", "074830", "074933", "093645"; SRC-MTG010 "122545"]
- **REQ-F002. Review Mode.** The skill evaluates an open initiative, epic or task issue for format compliance and corrects it: mechanical defects are fixed without asking, content defects are put to the user, template-aliased section names are renamed and unrecognised sections are asked about. Closed issues are not reviewed. [SRC-MTG001 "052908 — skill/initiative-planning", "052958 — skill/initiative-planning", "053010 — skill/initiative-planning", "053019 — skill/initiative-planning", "071703 — skill/initiative-planning"]
- **REQ-F003. Update Mode.** The skill reconciles issues with delivered work: it matches merged pull requests to task rows, records the match, ticks each criterion that is delivered and verified, and closes an issue once every criterion is met. A pull request is found by title convention first, then by search. [SRC-MTG001 "054425 — skill/initiative-planning", "054533 — skill/initiative-planning", "054540 — skill/initiative-planning", "075730 — skill/initiative-planning"; SRC-MTG006 "041846"; SRC-MTG008 "153627 — skill/theme-boards"]
- **REQ-F004. Hoist Mode.** The skill reviews the tracker for orphan issues and for standalone issues other issues cite, proposes a placement for each — an existing task, a new task, a new epic, a new initiative, or left standalone — and the user chooses per candidate. [SRC-MTG001 "122425 — skill/initiative-planning", "123001 — skill/initiative-planning", "124125 — skill/initiative-planning", "124240 — skill/initiative-planning", "130800 — skill/initiative-planning"; SRC-MTG002 "042306", "042634", "042643", "042657"; SRC-MTG006 "035539", "035750"]
- **REQ-F005. Progress Mode.** The skill produces a standup-style summary — what was completed, what is in progress, what is next — as Slack-formatted markdown that can be pasted into a channel unaltered. [SRC-MTG003 "045444"]
- **REQ-F006. Deliver Mode.** The skill delivers the work a board makes available: it brings the board to the correct positions and statuses, then starts an agent session per available task to plan and implement it. [SRC-MTG011 "143933"]
- **REQ-F007. Lazily Loaded Modes.** Each mode is a separate markdown file loaded only when the user's request selects that mode. [SRC-MTG001 "053513 — skill/initiative-planning"; SRC-MTG008 "140542 — skill/canon-modes"]

**Issue identity and body shape** — target section 3.2.

- **REQ-F008. Title Prefix.** An issue title carries its house prefix with colon separators — `[Ixx]`, `[Ixx:Eyy]`, `[Ixx:Eyy:Wzz]`. The colon form applies to titles only; references inside bodies keep the plain form the scripts read. [SRC-MTG001 "052200 — skill/initiative-planning", "052212 — skill/initiative-planning", "052226 — skill/initiative-planning", "052635 — skill/initiative-planning"]
- **REQ-F009. Title Shape.** A title reads as a two-to-three-word name, a colon, and a subtitle of at most ten words, in title case. A standalone issue carries no prefix and no `type:*` label. [SRC-MTG001 "121455 — skill/initiative-planning", "162106"]
- **REQ-F010. Title Agrees With Its Row.** An epic's title agrees with the Description its initiative's Work Breakdown table carries for that epic. [SRC-MTG001 "121056 — skill/initiative-planning"]
- **REQ-F011. Body Sections.** Every issue body carries Overview, Problem, Proposal, Acceptance Criteria, Open questions and References. The design-stage section is named Proposal at both initiative and epic level. [SRC-MTG001 "052733 — skill/initiative-planning", "052808 — skill/initiative-planning", "052635 — skill/initiative-planning", "115808 — skill/initiative-planning"]
- **REQ-F012. Work Breakdown Tables.** An initiative's table is `Epic | Description | Depends on`; an epic's is `Task | Description | Depends on | Join`. A task that warrants its own issue follows the epic body shape without a table. [SRC-MTG001 "115808 — skill/initiative-planning", "162106"]
- **REQ-F013. Description Cell.** A Description cell is at most eight words and ends by citing the criteria that row delivers, as `→ AC1, AC3`. Detail that will not fit becomes a single-invariant criterion; the row cites the criterion rather than restating it. [SRC-MTG001 "053513 — skill/initiative-planning", "053546 — skill/initiative-planning", "053610 — skill/initiative-planning", "112607 — skill/initiative-planning", "115833 — skill/initiative-planning", "115808 — skill/initiative-planning", "162106"]
- **REQ-F014. Row Identifier Links.** An epic row's identifier links the epic issue; a task row's identifier links the pull request that delivered it, or, where the task has its own issue, that issue, which in turn tracks the pull request. A column repeating a link the identifier already carries is dropped. [SRC-MTG001 "060749 — skill/initiative-planning", "060832 — skill/initiative-planning", "115808 — skill/initiative-planning"]
- **REQ-F015. Dependency Cells.** A Depends on cell holds hyperlinked references only — no prose, no duplicates — in the colon notation. An initiative's Depends on names epics and never tasks. Join means neither task depends on the other. [SRC-MTG001 "061859 — skill/initiative-planning", "115808 — skill/initiative-planning"]
- **REQ-F016. Non-Goals.** Non-goals appear at initiative level only, as a bulleted list of one succinct sentence each, naming no initiative, epic, task, issue or owner. [SRC-MTG001 "065958 — skill/initiative-planning", "070129 — skill/initiative-planning", "070244 — skill/initiative-planning", "115212 — skill/initiative-planning", "115808 — skill/initiative-planning"]
- **REQ-F017. Acceptance Criteria.** Both an initiative and an epic carry Acceptance Criteria. Each criterion states one invariant, is SMART, is local to its issue, carries no count unless the count is itself the target, and names no initiative, epic, task or issue. An initiative's criteria are high-level and are not a copy of its epics'. [SRC-MTG001 "054238 — skill/initiative-planning", "064712 — skill/initiative-planning", "065100 — skill/initiative-planning", "065151 — skill/initiative-planning", "065216 — skill/initiative-planning", "065246 — skill/initiative-planning", "065749 — skill/initiative-planning", "111544 — skill/initiative-planning", "112607 — skill/initiative-planning", "115212 — skill/initiative-planning", "115833 — skill/initiative-planning", "124834 — skill/initiative-planning", "131144 — skill/initiative-planning", "131233 — skill/initiative-planning", "162106"; SRC-MTG006 "035948"; SRC-MTG008 "144837"; SRC-MTG010 "151935"]
- **REQ-F018. Named Instrument.** An initiative criterion names in its own sentence the instrument that verifies it — an end-to-end walk, a smoke run, a live check, or the user's confirmation. Where no such instrument exists, the skill recommends building it, as a task or as a discrete test-infrastructure epic whose row cites the criteria it verifies. [SRC-MTG001 "160707", "161655", "161725", "162106"; SRC-MTG010 "143046", "145813"]
- **REQ-F019. Ticking.** Update mode runs a criterion's named instrument once every citing epic is delivered and ticks it on a pass; a criterion with no automated instrument is ticked by the user. An initiative closes once every criterion is ticked. [SRC-MTG001 "065216 — skill/initiative-planning", "160707", "162106"]
- **REQ-F020. Task Grain.** A task is one pull request's worth of work. A task delivering more than three criteria no other task delivers is split. [SRC-MTG001 "111544 — skill/initiative-planning", "112415 — skill/initiative-planning", "112752 — skill/initiative-planning", "113129 — skill/initiative-planning", "115808 — skill/initiative-planning"; SRC-MTG009 "093645"]
- **REQ-F021. Open Questions.** An epic's open questions are resolved before the epic starts, and their resolution may reshape the epic. [SRC-MTG001 "071459 — skill/initiative-planning", "131233 — skill/initiative-planning"]
- **REQ-F022. Bodies State The Plan As It Is.** A body carries no change narrative, no "Where it stands" section, and no narration of delivery order or mechanics. Those conventions live in the skill's Work Breakdown guide. [SRC-MTG001 "061059 — skill/initiative-planning", "111544 — skill/initiative-planning", "115808 — skill/initiative-planning"]
- **REQ-F023. Delivered Work Keeps Its Number.** Renumbering leaves the identifier of delivered work untouched. [SRC-MTG001 "075510 — skill/initiative-planning", "113129 — skill/initiative-planning", "115808 — skill/initiative-planning"]

**Delivery** — target section 3.3.

- **REQ-F024. Pull Request Title.** A pull request delivering initiative work opens its title with the epic reference, as `[Ixx:Eyy] Purpose`; task identifiers are left out. [SRC-MTG001 "115808 — skill/initiative-planning"; SRC-MTG006 "035539"]
- **REQ-F025. Integration Branches.** Initiative work targets that initiative's integration branch — `iNN/main`, `iNN/workflows` or `iNN/workspace` — created when none exists, with continuous integration treating the paired branches as one change. [SRC-MTG006 "035539", "035824"; SRC-MTG007 "033845", "034001"; SRC-MTG009 "091216"]
- **REQ-F026. Stacked Delivery.** Where an epic's tasks build on one another, their pull requests are delivered as a stack, each based on the one before. [SRC-MTG007 "035631"]

**Boards** — target section 3.4.

- **REQ-F027. One Board Per Theme.** Work is organised by theme: each initiative belongs to exactly one theme, each epic carries its initiative's theme label, and each theme has one board holding its initiatives and epics. [SRC-MTG001 "104434 — skill/initiative-planning"; SRC-MTG006 "035806"; SRC-MTG008 "151303", "151444", "155429"]
- **REQ-F028. Board Title.** A board is titled `<Theme>: <short description>` and is linked to the repository. The title carries no repository-name prefix. [SRC-MTG008 "152958 — skill/theme-boards", "154559 — skill/theme-boards", "155429"]
- **REQ-F029. Standalone Issues Have No Board.** An issue outside the initiative structure sits on no board. [SRC-MTG008 "151522", "155429"]
- **REQ-F030. Derived Status.** An issue's board status is derived from the facts already read — open or closed, tasks delivered, pull requests in flight, open questions, epic dependencies — and never from a judgement call. An open draft pull request reads as In Progress; a pull request ready for review reads as In Review. [SRC-MTG001 "170935", "172245 — skill/initiative-board-sync"]
- **REQ-F031. Assignment.** An issue at Ready or beyond is assigned to the user; an issue in Backlog carries no assignee. [SRC-MTG008 "153204 — skill/theme-boards", "155429"]
- **REQ-F032. Board Reconciliation.** Update mode finds an initiative's board by its theme, asking the user when none is found, adds every initiative, epic and task issue the board is missing, and reports each board and assignee change it makes. [SRC-MTG001 "170851", "170906"; SRC-MTG008 "155429"]

**Progress reporting** — target section 3.5.

- **REQ-F033. Summary Scope And Grain.** A progress summary covers one theme's board, or each board in turn, listing each epic with its tasks. Items that are next are limited to the five highest-priority ready items. Every initiative holding reported work appears, and work merged out of order is reported against the work it belongs to. [SRC-MTG003 "045444", "050405", "050506", "050525", "061336 — skill/progress-repositories", "062043 — skill/progress-repositories"]
- **REQ-F034. Management Paragraph.** A single plain-language paragraph stating what was accomplished sits below the "Progress since" line and above the Board line. [SRC-MTG004 "063148"]
- **REQ-F035. Status Symbols And Key.** Distinct emoji replace the status words on each item, with a legend, and a Key closes the summary block expanding the house initials. [SRC-MTG004 "064219 — skill/progress-management-summary", "064434 — skill/progress-management-summary", "064504 — skill/progress-management-summary", "071333 — skill/progress-management-summary"]

**Dispatch** — target section 3.6.

- **REQ-F036. Deliver Runs Advance First.** Deliver mode performs the board advance before it dispatches anything. [SRC-MTG011 "144228"]
- **REQ-F037. Dispatched Work Moves.** Work a dispatch starts is moved to In Progress, task issues included. [SRC-MTG011 "143933", "144607"]
- **REQ-F038. Reservation By Link.** On dispatch the work item is given a hyperlink to its planning folder, and that link reserves the work against a second dispatch. The folder is named `<date>[-<ref>]-<slug>`, the reference falling back to the epic issue where the task has no issue of its own. [SRC-MTG011 "143933", "144701"]
- **REQ-F039. Dispatch Brief.** The dispatched session's prompt puts it on rails: invoke the skill, then implement, following the Deliver-mode brief written for a dispatched session. [SRC-MTG011 "144747", "144814"]
- **REQ-F040. Artifacts Replace The Reservation.** Once the dispatched session has planned, the epic's work items point at the planning artifacts rather than at the reserved folder. [SRC-MTG011 "143933"]

**Source alignment** — target section 3.7.

- **REQ-F041. Normative Sources.** Review mode treats a marked subset of an initiative's References entries as normative requirement sources and aligns the acceptance criteria against them. A marked source may be any URL, and a fetch that fails is reported as a finding rather than passed over. [SRC-MTG010 "151356", "151935"; SRC-MTG012 "150608", "150800", "150833"]

**Hoist outcomes** — target section 3.8.

- **REQ-F042. Hoist Outcomes.** A hoisted candidate is kept as its own issue, subsumed, or left standalone. A candidate whose detail already lives in a planning folder is closed after migration, with the epic's References citing that detail so nothing is lost, and the close carries a tracking comment naming where the work now lives. No body records the migration. [SRC-MTG001 "122425 — skill/initiative-planning", "130737 — skill/initiative-planning", "162106"]
- **REQ-F043. Body Preserved As A Comment.** Where hoist rewrites an issue's body — a kept orphan taking a house template, or a left orphan taking the standalone layout — the existing body is first posted as a comment opening with a lead line saying what it is. [SRC-MTG001 "162106"; SRC-MTG005 "050340 — skill/initiative-planning-header", "050432 — skill/initiative-planning-header", "050501 — skill/initiative-planning-header"]

**Skill shape** — target section 3.9.

- **REQ-F044. Frontmatter.** The skill declares name and description only. The description is succinct and carries at least one trigger phrase for each mode. [SRC-MTG005 "045151"; SRC-MTG008 "140648 — skill/canon-modes", "142036", "155429"]
- **REQ-F045. Commands File.** Every command the skill runs is specified once in `references/commands.md`, one specification per operation named for what the operation does, and mode files link to it by name. No bare command appears ad hoc in prose. [SRC-MTG005 "052756 — skill/initiative-planning-header", "052805 — skill/initiative-planning-header"; SRC-MTG008 "140932", "155429"]
- **REQ-F046. Layout.** Each paragraph and list item occupies one line; links are proper markdown URLs rather than bare links; a bold lead is a label followed by a full sentence. [SRC-MTG005 "045151", "050002 — skill/initiative-planning-header", "051536 — skill/initiative-planning-header", "052214 — skill/initiative-planning-header"; SRC-MTG008 "140743 — skill/canon-modes", "140827 — skill/canon-modes", "155429"]
- **REQ-F047. Mode Summary And Rules.** The mode summary names, for each mode on its own line, what that mode does, with its capabilities as a bulleted list. A Rules section holds the statements that bind every mode. [SRC-MTG005 "050131 — skill/initiative-planning-header", "050227 — skill/initiative-planning-header", "050938 — skill/initiative-planning-header", "051225 — skill/initiative-planning-header", "051253 — skill/initiative-planning-header"; SRC-MTG011 "150059 — skill/deliver-mode"]
- **REQ-F048. Checking Scripts.** The skill carries scripts that check and apply the house rules — title shape, description width, one invariant per criterion, counts, references, change-narrative wording, dependency and join consistency, board and assignee calls — and each is reached through a named operation. [SRC-MTG001 "115808 — skill/initiative-planning", "124819 — skill/initiative-planning", "124834 — skill/initiative-planning", "162106"; SRC-MTG008 "155429"]
- **REQ-F049. Skill Identity.** The skill is named Work Planner, consolidates the repeated planning operations into one place, and triggers on requests to plan the work and similar phrasings. Its own vocabulary is consistent across SKILL.md, its reference files and its scripts. [SRC-MTG001 "050612", "052635 — skill/initiative-planning"; SRC-MTG005 "045658 — skill/initiative-planning-header", "050620 — skill/initiative-planning-header"]
- **REQ-F050. Reusable Templates.** The issue body for each kind — initiative, epic, task and standalone issue — is a reusable template the skill creates from and checks against. [SRC-MTG001 "050612", "052635 — skill/initiative-planning"]

**Non-functional** — target section 4.

- **REQ-NF001. Shared Skills Guide.** The conventions that bind every skill in the repository live in one shared guide, and a skill's own reference guide holds only what is specific to it. [SRC-MTG008 "135247", "140148 — skill/canon-modes", "140542 — skill/canon-modes", "140648 — skill/canon-modes", "140743 — skill/canon-modes", "140827 — skill/canon-modes", "140932", "142036", "142325", "142334", "155429"]
- **REQ-NF002. REST Only.** The skill reaches GitHub over REST. GraphQL is used only where the user grants an explicit one-off exception for an operation REST cannot perform. [SRC-MTG008 "151506"]

### Updated Requirements

None. The target specification does not yet exist.

### Deprecated Requirements

None.

## Source Coverage Matrix

| Source | Source section | Normative? | Covered by |
|--------|----------------|-----------|------------|
| SRC-MTG001 | 2026-09-27 — session b8c47927 | no | out of scope |
| SRC-MTG001 | 050612 | yes | REQ-F049, REQ-F050 |
| SRC-MTG001 | 052200 — skill/initiative-planning | yes | REQ-F008 |
| SRC-MTG001 | 052212 — skill/initiative-planning | yes | REQ-F008 |
| SRC-MTG001 | 052226 — skill/initiative-planning | yes | REQ-F008 |
| SRC-MTG001 | 052635 — skill/initiative-planning | yes | REQ-F008, REQ-F011, REQ-F049, REQ-F050 |
| SRC-MTG001 | 052733 — skill/initiative-planning | yes | REQ-F011 |
| SRC-MTG001 | 052808 — skill/initiative-planning | yes | REQ-F011, REQ-F002 |
| SRC-MTG001 | 052908 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 052958 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 053010 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 053019 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 053513 — skill/initiative-planning | yes | REQ-F007, REQ-F013 |
| SRC-MTG001 | 053546 — skill/initiative-planning | yes | REQ-F013 |
| SRC-MTG001 | 053610 — skill/initiative-planning | yes | REQ-F013 |
| SRC-MTG001 | 054238 — skill/initiative-planning | yes | REQ-F017, REQ-F001 |
| SRC-MTG001 | 054425 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 054533 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 054540 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 060749 — skill/initiative-planning | yes | REQ-F014 |
| SRC-MTG001 | 060832 — skill/initiative-planning | yes | REQ-F014 |
| SRC-MTG001 | 061059 — skill/initiative-planning | yes | REQ-F022 |
| SRC-MTG001 | 061859 — skill/initiative-planning | yes | REQ-F015 |
| SRC-MTG001 | 064712 — skill/initiative-planning | yes | REQ-F017 |
| SRC-MTG001 | 065100 — skill/initiative-planning | yes | REQ-F017 |
| SRC-MTG001 | 065151 — skill/initiative-planning | yes | REQ-F017 |
| SRC-MTG001 | 065216 — skill/initiative-planning | yes | REQ-F017, REQ-F019 |
| SRC-MTG001 | 065246 — skill/initiative-planning | yes | REQ-F017 |
| SRC-MTG001 | 065749 — skill/initiative-planning | yes | REQ-F017 |
| SRC-MTG001 | 065958 — skill/initiative-planning | yes | REQ-F016 |
| SRC-MTG001 | 070129 — skill/initiative-planning | yes | REQ-F016 |
| SRC-MTG001 | 070244 — skill/initiative-planning | yes | REQ-F016 |
| SRC-MTG001 | 071459 — skill/initiative-planning | yes | REQ-F021 |
| SRC-MTG001 | 071703 — skill/initiative-planning | yes | REQ-F002, REQ-F003 |
| SRC-MTG001 | 072401 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 072729 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 073204 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 073343 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 074909 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 074946 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 075021 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 075140 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 075510 — skill/initiative-planning | yes | REQ-F002, REQ-F023 |
| SRC-MTG001 | 075730 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 080246 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 080251 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 104434 — skill/initiative-planning | yes | REQ-F027 |
| SRC-MTG001 | 104611 — skill/initiative-planning | yes | REQ-F002 |
| SRC-MTG001 | 104810 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 104906 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 110153 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 110323 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 110453 — skill/initiative-planning | yes | REQ-F003 |
| SRC-MTG001 | 111127 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 111544 — skill/initiative-planning | yes | REQ-F017, REQ-F020, REQ-F022 |
| SRC-MTG001 | 112415 — skill/initiative-planning | yes | REQ-F020 |
| SRC-MTG001 | 112607 — skill/initiative-planning | yes | REQ-F013, REQ-F017 |
| SRC-MTG001 | 112752 — skill/initiative-planning | yes | REQ-F020 |
| SRC-MTG001 | 113129 — skill/initiative-planning | yes | REQ-F020, REQ-F023 |
| SRC-MTG001 | 115212 — skill/initiative-planning | yes | REQ-F016, REQ-F017 |
| SRC-MTG001 | 115808 — skill/initiative-planning | yes | REQ-F011, REQ-F012, REQ-F013, REQ-F014, REQ-F015, REQ-F016, REQ-F017, REQ-F020, REQ-F022, REQ-F023, REQ-F024, REQ-F048 |
| SRC-MTG001 | 115833 — skill/initiative-planning | yes | REQ-F013, REQ-F017 |
| SRC-MTG001 | 120237 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 120258 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 120319 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 121056 — skill/initiative-planning | yes | REQ-F010 |
| SRC-MTG001 | 121455 — skill/initiative-planning | yes | REQ-F009 |
| SRC-MTG001 | 122425 — skill/initiative-planning | yes | REQ-F004, REQ-F042 |
| SRC-MTG001 | 123001 — skill/initiative-planning | yes | REQ-F004 |
| SRC-MTG001 | 124125 — skill/initiative-planning | yes | REQ-F004 |
| SRC-MTG001 | 124240 — skill/initiative-planning | yes | REQ-F004 |
| SRC-MTG001 | 124819 — skill/initiative-planning | yes | REQ-F048 |
| SRC-MTG001 | 124834 — skill/initiative-planning | yes | REQ-F017, REQ-F048 |
| SRC-MTG001 | 125832 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 125900 — skill/initiative-planning | no | out of scope |
| SRC-MTG001 | 130737 — skill/initiative-planning | yes | REQ-F042 |
| SRC-MTG001 | 130800 — skill/initiative-planning | yes | REQ-F004 |
| SRC-MTG001 | 131144 — skill/initiative-planning | yes | REQ-F017 |
| SRC-MTG001 | 131233 — skill/initiative-planning | yes | REQ-F017, REQ-F021 |
| SRC-MTG001 | 160707 | yes | REQ-F018, REQ-F019 |
| SRC-MTG001 | 161655 | yes | REQ-F018 |
| SRC-MTG001 | 161725 | yes | REQ-F018 |
| SRC-MTG001 | 162022 | no | out of scope |
| SRC-MTG001 | 162106 | yes | REQ-F009, REQ-F012, REQ-F013, REQ-F017, REQ-F018, REQ-F019, REQ-F042, REQ-F043, REQ-F048 |
| SRC-MTG001 | 170851 | yes | REQ-F032 |
| SRC-MTG001 | 170906 | yes | REQ-F032 |
| SRC-MTG001 | 170935 | yes | REQ-F030 |
| SRC-MTG001 | 172245 — skill/initiative-board-sync | yes | REQ-F030 |
| SRC-MTG002 | 2026-09-28 — session 52f3fc03 | no | out of scope |
| SRC-MTG002 | 144212 | no | out of scope |
| SRC-MTG002 | 164642 | no | out of scope |
| SRC-MTG002 | 095309 | no | out of scope |
| SRC-MTG002 | 143317 | no | out of scope |
| SRC-MTG002 | 042306 | yes | REQ-F004 |
| SRC-MTG002 | 042634 | yes | REQ-F004 |
| SRC-MTG002 | 042643 | yes | REQ-F004 |
| SRC-MTG002 | 042657 | yes | REQ-F004 |
| SRC-MTG003 | 2026-09-28 — session 8d61d701 | no | out of scope |
| SRC-MTG003 | 045444 | yes | REQ-F005, REQ-F033 |
| SRC-MTG003 | 050405 | yes | REQ-F033 |
| SRC-MTG003 | 050506 | yes | REQ-F033 |
| SRC-MTG003 | 050525 | yes | REQ-F033 |
| SRC-MTG003 | 061336 — skill/progress-repositories | yes | REQ-F033 |
| SRC-MTG003 | 062043 — skill/progress-repositories | yes | REQ-F033 |
| SRC-MTG004 | 2026-09-28 — session 9b7d2432 | no | out of scope |
| SRC-MTG004 | 063148 | yes | REQ-F034 |
| SRC-MTG004 | 064219 — skill/progress-management-summary | yes | REQ-F035 |
| SRC-MTG004 | 064434 — skill/progress-management-summary | yes | REQ-F035 |
| SRC-MTG004 | 064504 — skill/progress-management-summary | yes | REQ-F035 |
| SRC-MTG004 | 071333 — skill/progress-management-summary | yes | REQ-F035 |
| SRC-MTG005 | 2026-09-29 — session a0b1179e | no | out of scope |
| SRC-MTG005 | 045151 | yes | REQ-F044, REQ-F046 |
| SRC-MTG005 | 045658 — skill/initiative-planning-header | yes | REQ-F049 |
| SRC-MTG005 | 050002 — skill/initiative-planning-header | yes | REQ-F046 |
| SRC-MTG005 | 050131 — skill/initiative-planning-header | yes | REQ-F047 |
| SRC-MTG005 | 050227 — skill/initiative-planning-header | yes | REQ-F047 |
| SRC-MTG005 | 050340 — skill/initiative-planning-header | yes | REQ-F043 |
| SRC-MTG005 | 050432 — skill/initiative-planning-header | yes | REQ-F043 |
| SRC-MTG005 | 050501 — skill/initiative-planning-header | yes | REQ-F043 |
| SRC-MTG005 | 050620 — skill/initiative-planning-header | yes | REQ-F049 |
| SRC-MTG005 | 050938 — skill/initiative-planning-header | yes | REQ-F047 |
| SRC-MTG005 | 051225 — skill/initiative-planning-header | yes | REQ-F047 |
| SRC-MTG005 | 051253 — skill/initiative-planning-header | yes | REQ-F047 |
| SRC-MTG005 | 051536 — skill/initiative-planning-header | yes | REQ-F046 |
| SRC-MTG005 | 052214 — skill/initiative-planning-header | yes | REQ-F046 |
| SRC-MTG005 | 052756 — skill/initiative-planning-header | yes | REQ-F045 |
| SRC-MTG005 | 052805 — skill/initiative-planning-header | yes | REQ-F045 |
| SRC-MTG006 | 2026-09-29 — session e08b3d64 | no | out of scope |
| SRC-MTG006 | 035539 | yes | REQ-F004, REQ-F024, REQ-F025 |
| SRC-MTG006 | 035750 | yes | REQ-F004 |
| SRC-MTG006 | 035806 | yes | REQ-F027 |
| SRC-MTG006 | 035824 | yes | REQ-F025 |
| SRC-MTG006 | 035948 | yes | REQ-F017 |
| SRC-MTG006 | 041846 | yes | REQ-F003 |
| SRC-MTG007 | 2026-09-30 — session 2a2c8d9b | no | out of scope |
| SRC-MTG007 | 161614 | yes | REQ-F001 |
| SRC-MTG007 | 033845 | yes | REQ-F025 |
| SRC-MTG007 | 034001 | yes | REQ-F025 |
| SRC-MTG007 | 034438 | yes | REQ-F001 |
| SRC-MTG007 | 035141 | yes | REQ-F001 |
| SRC-MTG007 | 035145 | no | out of scope |
| SRC-MTG007 | 035631 | yes | REQ-F026 |
| SRC-MTG008 | 2026-09-30 — session 6f5a01ac | no | out of scope |
| SRC-MTG008 | 135247 | yes | REQ-NF001 |
| SRC-MTG008 | 140148 — skill/canon-modes | yes | REQ-NF001 |
| SRC-MTG008 | 140542 — skill/canon-modes | yes | REQ-F007, REQ-NF001 |
| SRC-MTG008 | 140648 — skill/canon-modes | yes | REQ-F044, REQ-NF001 |
| SRC-MTG008 | 140743 — skill/canon-modes | yes | REQ-F046, REQ-NF001 |
| SRC-MTG008 | 140827 — skill/canon-modes | yes | REQ-F046, REQ-NF001 |
| SRC-MTG008 | 140932 | yes | REQ-F045, REQ-NF001 |
| SRC-MTG008 | 142036 | yes | REQ-F044, REQ-NF001 |
| SRC-MTG008 | 142325 | yes | REQ-NF001 |
| SRC-MTG008 | 142334 | yes | REQ-NF001 |
| SRC-MTG008 | 144316 | yes | REQ-F001 |
| SRC-MTG008 | 144837 | yes | REQ-F001, REQ-F017 |
| SRC-MTG008 | 144920 | no | out of scope |
| SRC-MTG008 | 145122 | no | out of scope |
| SRC-MTG008 | 145720 | yes | REQ-F001 |
| SRC-MTG008 | 150233 | yes | REQ-F001 |
| SRC-MTG008 | 151303 | yes | REQ-F027 |
| SRC-MTG008 | 151444 | yes | REQ-F027 |
| SRC-MTG008 | 151506 | yes | REQ-NF002 |
| SRC-MTG008 | 151522 | yes | REQ-F029 |
| SRC-MTG008 | 152958 — skill/theme-boards | yes | REQ-F028 |
| SRC-MTG008 | 153204 — skill/theme-boards | yes | REQ-F031 |
| SRC-MTG008 | 153627 — skill/theme-boards | yes | REQ-F003 |
| SRC-MTG008 | 154559 — skill/theme-boards | yes | REQ-F028 |
| SRC-MTG008 | 155429 | yes | REQ-F027, REQ-F028, REQ-F029, REQ-F031, REQ-F032, REQ-F044, REQ-F045, REQ-F046, REQ-F048, REQ-NF001 |
| SRC-MTG009 | 2026-10-05 — session 6b3a029b | no | out of scope |
| SRC-MTG009 | 045103 | yes | REQ-F001 |
| SRC-MTG009 | 074830 | yes | REQ-F001 |
| SRC-MTG009 | 074933 | yes | REQ-F001 |
| SRC-MTG009 | 075031 | no | out of scope |
| SRC-MTG009 | 091216 | yes | REQ-F025 |
| SRC-MTG009 | 093645 | yes | REQ-F001, REQ-F020 |
| SRC-MTG010 | 2026-10-06 — session 14f0f12f | no | out of scope |
| SRC-MTG010 | 122545 | yes | REQ-F001 |
| SRC-MTG010 | 122958 | no | out of scope |
| SRC-MTG010 | 123318 | no | out of scope |
| SRC-MTG010 | 143046 | yes | REQ-F018 |
| SRC-MTG010 | 145813 | yes | REQ-F018 |
| SRC-MTG010 | 151356 | yes | REQ-F041 |
| SRC-MTG010 | 151401 | no | out of scope |
| SRC-MTG010 | 151935 | yes | REQ-F041, REQ-F017 |
| SRC-MTG011 | 2026-10-06 — session 3abee13a | no | out of scope |
| SRC-MTG011 | 143933 | yes | REQ-F006, REQ-F037, REQ-F038, REQ-F040 |
| SRC-MTG011 | 144228 | yes | REQ-F036 |
| SRC-MTG011 | 144607 | yes | REQ-F037 |
| SRC-MTG011 | 144701 | yes | REQ-F038 |
| SRC-MTG011 | 144747 | yes | REQ-F039 |
| SRC-MTG011 | 144814 | yes | REQ-F039 |
| SRC-MTG011 | 150059 — skill/deliver-mode | yes | REQ-F047 |
| SRC-MTG012 | 2026-10-06 — session b11a33ec | no | out of scope |
| SRC-MTG012 | 150608 | yes | REQ-F041 |
| SRC-MTG012 | 150800 | yes | REQ-F041 |
| SRC-MTG012 | 150833 | yes | REQ-F041 |

## Document Updates Required

- **Section 2.2 Meeting Transcripts** — twelve new source references, one per source, each pointing at its copy in the meetings folder: SRC-MTG001 `../../meetings/2026-09-27-b8c47927.md`, SRC-MTG002 `../../meetings/2026-09-28-52f3fc03.md`, SRC-MTG003 `../../meetings/2026-09-28-8d61d701.md`, SRC-MTG004 `../../meetings/2026-09-28-9b7d2432.md`, SRC-MTG005 `../../meetings/2026-09-29-a0b1179e.md`, SRC-MTG006 `../../meetings/2026-09-29-e08b3d64.md`, SRC-MTG007 `../../meetings/2026-09-30-2a2c8d9b.md`, SRC-MTG008 `../../meetings/2026-09-30-6f5a01ac.md`, SRC-MTG009 `../../meetings/2026-10-05-6b3a029b.md`, SRC-MTG010 `../../meetings/2026-10-06-14f0f12f.md`, SRC-MTG011 `../../meetings/2026-10-06-3abee13a.md`, SRC-MTG012 `../../meetings/2026-10-06-b11a33ec.md`.
- **Section 3 Functional Requirements** — nine new subsections, 3.1 Modes through 3.9 Skill Shape, holding REQ-F001 to REQ-F050.
- **Section 4 Non-Functional Requirements** — REQ-NF001 and REQ-NF002.

## Quality Issues Identified

- **The initiative-level criteria section changed name twice.** SRC-MTG001 "065151 — skill/initiative-planning" renames Acceptance Criteria to Goals with `G` designators; "162106" records the later reversal back to Acceptance Criteria with `AC` designators, a title-only change. REQ-F017 states the settled name. The `G` form survives nowhere.
- **The second table column changed name twice.** SRC-MTG001 "053513 — skill/initiative-planning" names it Outcomes; "115808 — skill/initiative-planning" records the rename to Description. REQ-F013 states the settled name.
- **Pull request title form was decided more than once.** SRC-MTG001 "115808 — skill/initiative-planning" records `[Ixx:Eyy] Purpose` superseding a form carrying task identifiers. REQ-F024 states the settled form; the task-bearing form is not a requirement.
- **Board membership for standalone issues was reversed within one session.** SRC-MTG008 "151522" settles board 2 as standalone-only, and "155429" records the later directive that standalone issues have no board home and board 2 closes. REQ-F029 states the settled rule.
- **The reservation link and the planning-artifact link are the same field at different times.** SRC-MTG011 "143933" asks for both. REQ-F038 and REQ-F040 split them into two states of one link; the specification should say explicitly that the second replaces the first.
- **"Orphan" is defined twice.** SRC-MTG001 "162106" records that the first definition excluded cited investigations and was widened to include them. REQ-F004 carries the wider definition.

## Implementation Notes

- Every source is a session transcript of one user directing the skill's evolution, so a requirement's authority is the user's own typed instruction or a decision recorded against it. Subagent hand-back reports inside the transcripts are model output and carry no obligation; the coverage matrix marks them out of scope.
- The skill was called initiative-planning before SRC-MTG005 "050620 — skill/initiative-planning-header" renamed it Work Planner. The specification uses the current name throughout and does not record the former one.
- Several sections carry decisions about particular issues rather than about the skill — which epic holds a piece of work, which branch a pull request targets. They are marked normative where the decision also fixes a rule the skill applies, and out of scope where it settles one issue alone.

