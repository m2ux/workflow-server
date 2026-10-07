# Work Planner Skill Requirements Specification

## 1. Executive Summary

The Work Planner skill plans and maintains agent-engineering work on GitHub. It turns a body of work into initiatives, epics and tasks that follow one house format; keeps those issues in conformance as the format evolves; reconciles them with the pull requests that deliver them; places work raised outside the structure into it; reports progress to people who do not read the tracker; and starts agent sessions on the work a board makes available.

The skill exists because the same planning operations were being performed by hand, session after session, with the conventions held only in the memory of whoever was doing them. Written down, those conventions become checkable, and a tracker of several hundred issues can be held to them at once.

## 2. Requirements Sources

Requirements derive from twelve recorded working sessions in which the skill was directed, reviewed and extended. Each session is held as a redacted transcript in the engineering artifacts' meetings folder.

### 2.1 Product and Solution Documents

None.

### 2.2 Meeting Transcripts

**SRC-MTG001**: [Skill genesis, house scheme and board sync](../../meetings/2026-09-27-b8c47927.md) — MC
**SRC-MTG002**: [Hoisting standalone issues into epics](../../meetings/2026-09-28-52f3fc03.md) — MC
**SRC-MTG003**: [Progress mode](../../meetings/2026-09-28-8d61d701.md) — MC
**SRC-MTG004**: [Management summary and status emoji](../../meetings/2026-09-28-9b7d2432.md) — MC
**SRC-MTG005**: [Skill rename, header and layout](../../meetings/2026-09-29-a0b1179e.md) — MC
**SRC-MTG006**: [Hoist to a new initiative](../../meetings/2026-09-29-e08b3d64.md) — MC
**SRC-MTG007**: [Initiative integration branches](../../meetings/2026-09-30-2a2c8d9b.md) — MC
**SRC-MTG008**: [Theme boards and the shared skills guide](../../meetings/2026-09-30-6f5a01ac.md) — MC
**SRC-MTG009**: [Epic planning and branch creation](../../meetings/2026-10-05-6b3a029b.md) — MC
**SRC-MTG010**: [Criterion instruments and source alignment](../../meetings/2026-10-06-14f0f12f.md) — MC
**SRC-MTG011**: [Deliver mode](../../meetings/2026-10-06-3abee13a.md) — MC
**SRC-MTG012**: [Normative sources in review mode](../../meetings/2026-10-06-b11a33ec.md) — MC

### 2.3 Vendor Documents

None.

### 2.4 Source Reference Format

- Each cited source is a markdown hyperlink to the file listed for it in section 2.
- Participant initials may follow the list.

### 2.5 Reference Documents

None.

## 3. Use Case Definition

**Primary use case.** An engineer directs an agent to plan a body of work, to bring the tracker back into conformance after a rule changes, to reconcile the plan with what has been delivered, to report where things stand, or to start the work that is ready.

**Personas.**

- *The planning engineer* holds the intent behind the work, answers the questions planning raises, and ticks what only a person can confirm.
- *The planning agent* runs the skill: it reads the tracker, drafts and applies the house format, runs the checks, and asks rather than guesses where meaning is at stake.
- *The dispatched agent* receives one task and its brief, plans it and implements it.
- *The report reader* is outside the work and meets it only as a progress message in a channel.

**User journey.** Work is raised, either as a proposal or as an issue outside the structure. Plan mode settles its goals and creates its issues; Hoist mode places what was raised outside. Review mode holds those issues to the house format as the format evolves. Deliver mode advances the board and starts a session per available task. As pull requests merge, Update mode links them, ticks the criteria they satisfy, and closes what is complete. Progress mode reports the result.

No success criterion is recorded: the sources settle the skill's behaviour through the requirements in sections 4 to 7 and state no separate measure of the skill's own success.

## 4. Functional Requirements

### 4.1 Modes

🕒 **REQ-F001: The skill SHALL provide a Plan mode that settles a body of work's goal clauses with the user, writes a planning record, and creates the initiative, epic and task issues from the house templates**

Planning is the entry point: nothing else in the skill has anything to act on until the work exists as issues shaped the house way. Settling the goals with the user before any issue is written is what keeps the structure answerable to the intent behind it. [[1](../../meetings/2026-09-27-b8c47927.md#054238--skillinitiative-planning), [2](../../meetings/2026-09-30-2a2c8d9b.md#161614), [3](../../meetings/2026-09-30-2a2c8d9b.md#034438), [4](../../meetings/2026-09-30-2a2c8d9b.md#035141), [5](../../meetings/2026-09-30-6f5a01ac.md#144316), [6](../../meetings/2026-09-30-6f5a01ac.md#144837), [7](../../meetings/2026-09-30-6f5a01ac.md#145720), [8](../../meetings/2026-09-30-6f5a01ac.md#150233), [9](../../meetings/2026-10-05-6b3a029b.md#045103), [10](../../meetings/2026-10-05-6b3a029b.md#074830), [11](../../meetings/2026-10-05-6b3a029b.md#074933), [12](../../meetings/2026-10-05-6b3a029b.md#093645), [13](../../meetings/2026-10-06-14f0f12f.md#122545)] (MC)

🕒 **REQ-F002: The skill SHALL provide a Review mode that checks an open initiative, epic or task issue against the house format, fixes mechanical defects without asking, puts content defects to the user, renames template-aliased section names, and asks about sections the template does not define**

Format drifts as the house rules evolve, and a body that no longer matches them is unreadable to the scripts and to the next agent. Splitting defects by kind keeps the cheap corrections automatic while the ones that change meaning stay the user's. Closed issues are left alone, their bodies being a record rather than a plan. [[1](../../meetings/2026-09-27-b8c47927.md#052908--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#052958--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#053010--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#053019--skillinitiative-planning), [5](../../meetings/2026-09-27-b8c47927.md#071703--skillinitiative-planning)] (MC)

🕒 **REQ-F003: The skill SHALL provide an Update mode that matches merged pull requests to task rows by title convention and then by search, records each match, ticks every criterion that is delivered and verified, and closes an issue once every criterion it carries is met**

An issue that does not track what was delivered stops being a plan and becomes a guess. Finding the pull request by convention first makes the common case free and the search the fallback rather than the rule. [[1](../../meetings/2026-09-27-b8c47927.md#054425--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#054533--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#054540--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#075730--skillinitiative-planning), [5](../../meetings/2026-09-29-e08b3d64.md#041846), [6](../../meetings/2026-09-30-6f5a01ac.md#153627--skilltheme-boards)] (MC)

🕒 **REQ-F004: The skill SHALL provide a Hoist mode that finds orphan issues and standalone issues other issues cite, proposes for each a placement as an existing task, a new task, a new epic, a new initiative, or left standalone, and takes the user's choice per candidate**

Work raised outside the structure still has to be planned, and an investigation another issue already cites is not an orphan in spirit even though nothing contains it. Proposing rather than deciding keeps the judgement with the person who knows what the issue is for. [[1](../../meetings/2026-09-27-b8c47927.md#122425--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#123001--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#124125--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#124240--skillinitiative-planning), [5](../../meetings/2026-09-27-b8c47927.md#130800--skillinitiative-planning), [6](../../meetings/2026-09-28-52f3fc03.md#042306), [7](../../meetings/2026-09-28-52f3fc03.md#042634), [8](../../meetings/2026-09-28-52f3fc03.md#042643), [9](../../meetings/2026-09-28-52f3fc03.md#042657), [10](../../meetings/2026-09-29-e08b3d64.md#035539), [11](../../meetings/2026-09-29-e08b3d64.md#035750)] (MC)

🕒 **REQ-F005: The skill SHALL provide a Progress mode that reports what was completed, what is in progress and what is next, as Slack-formatted markdown that pastes into a channel unaltered**

The report's purpose is to be read by people who are not in the tracker, in the place they already are. Producing the destination's own format removes the step where a human reformats it and introduces errors. [[1](../../meetings/2026-09-28-8d61d701.md#045444)] (MC)

🕒 **REQ-F006: The skill SHALL provide a Deliver mode that brings a board to the correct positions and statuses and then starts an agent session per available task to plan and implement it**

A board that says what is ready is only half the value; the other half is starting that work. Making delivery one mode means the board state a dispatch depends on is always current at the moment of dispatch. [[1](../../meetings/2026-10-06-3abee13a.md#143933)] (MC)

🕒 **REQ-F007: The skill SHALL hold each mode in its own file, loaded only when the request selects that mode**

Every mode's instructions in one document is a cost paid on every invocation for content most invocations never read. [[1](../../meetings/2026-09-27-b8c47927.md#053513--skillinitiative-planning), [2](../../meetings/2026-09-30-6f5a01ac.md#140542--skillcanon-modes)] (MC)

### 4.2 Issue Identity and Body Shape

🕒 **REQ-F008: An issue title SHALL carry its house prefix with colon separators, as `[Ixx]`, `[Ixx:Eyy]` or `[Ixx:Eyy:Wzz]`, and references inside bodies SHALL keep the plain form the scripts read**

The colon makes the levels one token to a reader and to a title parser. Bodies keep the plain form because the scripts that read dependency cells are written against it. [[1](../../meetings/2026-09-27-b8c47927.md#052200--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#052212--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#052226--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#052635--skillinitiative-planning)] (MC)

🕒 **REQ-F009: An issue title SHALL read as a name of two or three words, a colon, and a subtitle of at most ten words, in title case; a standalone issue SHALL carry no prefix and no `type:*` label**

A fixed shape makes a list of titles scannable: the name says which thing, the subtitle says what about it. A standalone issue carries no house identity, so it carries none of the house marks either. [[1](../../meetings/2026-09-27-b8c47927.md#121455--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#162106)] (MC)

🕒 **REQ-F010: An epic's title SHALL agree with the Description its initiative's Work Breakdown table carries for that epic**

Two names for one epic is two things to keep current, and a reader who meets the second one has no way to know it is the same work. [[1](../../meetings/2026-09-27-b8c47927.md#121056--skillinitiative-planning)] (MC)

🕒 **REQ-F011: Every issue body SHALL carry Overview, Problem, Proposal, Acceptance Criteria, Open questions and References, with the design-stage section named Proposal at both initiative and epic level**

At the point an epic is written the design is a proposal, not a solution, and naming the section for what it holds stops it reading as settled. One section set across the kinds means a reader finds the same thing in the same place. [[1](../../meetings/2026-09-27-b8c47927.md#052733--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#052808--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#052635--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning)] (MC)

🕒 **REQ-F012: An initiative's Work Breakdown table SHALL be `Epic | Description | Depends on` and an epic's SHALL be `Task | Description | Depends on | Join`; a task warranting its own issue SHALL follow the epic body shape without a table**

Each level's table carries exactly the columns that level's rows can answer. A task issue has no rows beneath it, so it takes the shape without the table rather than a shape of its own. [[1](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#162106)] (MC)

🕒 **REQ-F013: A Description cell SHALL be at most eight words and SHALL end by citing the criteria that row delivers, as `→ AC1, AC3`**

The cell's job is to say which row this is, not to restate the work; detail belongs in a criterion that can be tested and ticked. The citation is what lets an agent read off which criteria a given task is expected to satisfy. [[1](../../meetings/2026-09-27-b8c47927.md#053513--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#053546--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#053610--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#112607--skillinitiative-planning), [5](../../meetings/2026-09-27-b8c47927.md#115833--skillinitiative-planning), [6](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning), [7](../../meetings/2026-09-27-b8c47927.md#162106)] (MC)

🕒 **REQ-F014: An epic row's identifier SHALL link its epic issue, and a task row's identifier SHALL link the pull request that delivered it or, where the task has its own issue, that issue, which in turn tracks the pull request**

One link per row, carried by the identifier, retires the column that repeated it. Where a task has its own issue, that issue is the thing to open, and it already holds the delivery link. [[1](../../meetings/2026-09-27-b8c47927.md#060749--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#060832--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning)] (MC)

🕒 **REQ-F015: A Depends on cell SHALL hold hyperlinked references only, in colon notation, free of prose and duplicates; an initiative's Depends on SHALL name epics and never tasks; Join SHALL mean neither task depends on the other**

The cell is read by a dependency checker, so prose in it is noise that the checker must either parse or ignore. An initiative's dependencies are between epics because that is the grain at which an initiative is planned. [[1](../../meetings/2026-09-27-b8c47927.md#061859--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning)] (MC)

🕒 **REQ-F016: Non-goals SHALL appear at initiative level only, as a bulleted list of one succinct sentence each, naming no initiative, epic, task, issue or owner**

A non-goal that names another piece of work couples two plans that will drift apart, and ownership is a routing fact rather than a boundary. Stating the boundary once, at the level that owns it, keeps the epics free of a section they would only repeat. [[1](../../meetings/2026-09-27-b8c47927.md#065958--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#070129--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#070244--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#115212--skillinitiative-planning), [5](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning)] (MC)

🕒 **REQ-F017: An initiative and an epic SHALL each carry Acceptance Criteria in which every criterion states one invariant, is specific, measurable, achievable, relevant and time-bound, is local to its own issue, carries no count unless the count is itself the target, and names no initiative, epic, task or issue**

A criterion holding two conditions cannot be ticked honestly, and one carrying a measured count goes stale the moment the system moves. Keeping each criterion local means it can be read and verified without opening anything else. An initiative's criteria say what the initiative must achieve rather than repeating its epics'. [[1](../../meetings/2026-09-27-b8c47927.md#054238--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#064712--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#065100--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#065151--skillinitiative-planning), [5](../../meetings/2026-09-27-b8c47927.md#065216--skillinitiative-planning), [6](../../meetings/2026-09-27-b8c47927.md#065246--skillinitiative-planning), [7](../../meetings/2026-09-27-b8c47927.md#065749--skillinitiative-planning), [8](../../meetings/2026-09-27-b8c47927.md#111544--skillinitiative-planning), [9](../../meetings/2026-09-27-b8c47927.md#112607--skillinitiative-planning), [10](../../meetings/2026-09-27-b8c47927.md#115212--skillinitiative-planning), [11](../../meetings/2026-09-27-b8c47927.md#115833--skillinitiative-planning), [12](../../meetings/2026-09-27-b8c47927.md#124834--skillinitiative-planning), [13](../../meetings/2026-09-27-b8c47927.md#131144--skillinitiative-planning), [14](../../meetings/2026-09-27-b8c47927.md#131233--skillinitiative-planning), [15](../../meetings/2026-09-27-b8c47927.md#162106), [16](../../meetings/2026-09-29-e08b3d64.md#035948), [17](../../meetings/2026-09-30-6f5a01ac.md#144837), [18](../../meetings/2026-10-06-14f0f12f.md#151935)] (MC)

🕒 **REQ-F018: An initiative criterion SHALL name in its own sentence the instrument that verifies it — an end-to-end walk, a smoke run, a live check, or the user's confirmation — and where no such instrument exists the skill SHALL recommend building it as a task or as a test-infrastructure epic whose row cites the criteria it verifies**

A criterion without a named instrument is ticked on judgement, which is the thing the criterion was meant to replace. Recommending the missing instrument as planned work is what stops the gap being carried indefinitely. [[1](../../meetings/2026-09-27-b8c47927.md#160707), [2](../../meetings/2026-09-27-b8c47927.md#161655), [3](../../meetings/2026-09-27-b8c47927.md#161725), [4](../../meetings/2026-09-27-b8c47927.md#162106), [5](../../meetings/2026-10-06-14f0f12f.md#143046), [6](../../meetings/2026-10-06-14f0f12f.md#145813)] (MC)

> The sources do not state what happens when a named instrument runs and fails.

🕒 **REQ-F019: Update mode SHALL run a criterion's named instrument once every citing epic is delivered and tick the criterion on a pass, SHALL leave a criterion with no automated instrument for the user to tick, and SHALL close an initiative once every criterion is ticked**

Running the instrument before the work that satisfies it is complete only produces a failure that means nothing. Closing on a full set of ticks makes the initiative's end a consequence of its criteria rather than a separate decision. [[1](../../meetings/2026-09-27-b8c47927.md#065216--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#160707), [3](../../meetings/2026-09-27-b8c47927.md#162106)] (MC)

🕒 **REQ-F020: A task SHALL be one pull request's worth of work, and a task delivering more than three criteria no other task delivers SHALL be split**

A task that spans several pull requests cannot be marked delivered against any one of them. Counting only the criteria no other task delivers measures the task's own load rather than the overlap it shares. [[1](../../meetings/2026-09-27-b8c47927.md#111544--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#112415--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#112752--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#113129--skillinitiative-planning), [5](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning), [6](../../meetings/2026-10-05-6b3a029b.md#093645)] (MC)

🕒 **REQ-F021: An epic's open questions SHALL be resolved before the epic starts**

An open question is unfinished planning, and its answer may reshape the epic, so work begun before it is answered may be work on the wrong shape. [[1](../../meetings/2026-09-27-b8c47927.md#071459--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#131233--skillinitiative-planning)] (MC)

🕒 **REQ-F022: An issue body SHALL carry no change narrative, no section recording where the work stands, and no narration of delivery order or mechanics, those conventions being held in the skill's Work Breakdown guide**

A body states the plan as it is; an account of how it came to be that way is history that goes stale and that a reader has to discount. Where things stand is implicit in the ticked criteria and linked pull requests once the issue is updated. [[1](../../meetings/2026-09-27-b8c47927.md#061059--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#111544--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning)] (MC)

🕒 **REQ-F023: Renumbering SHALL leave the identifier of delivered work unchanged**

A delivered identifier is cited by merged pull requests and by anything written against them, and those citations cannot be revised. [[1](../../meetings/2026-09-27-b8c47927.md#075510--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#113129--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning)] (MC)

🕒 **REQ-F050: The skill SHALL hold a reusable body template for each issue kind — initiative, epic, task and standalone issue — and SHALL create from and check against those templates**

The format rules only hold if one artifact states them; a template is both the thing a new issue is built from and the thing an existing issue is checked against. [[1](../../meetings/2026-09-27-b8c47927.md#050612), [2](../../meetings/2026-09-27-b8c47927.md#052635--skillinitiative-planning)] (MC)

### 4.3 Boards

🕒 **REQ-F027: Work SHALL be organised by theme, each initiative belonging to exactly one theme, each epic carrying its initiative's theme label, and each theme having one board that holds its initiatives and epics**

One board per theme gives each body of related work a view at the size a person can read. Tying an epic's theme to its initiative's removes the second place a theme could be decided, and so the second place it could disagree. [[1](../../meetings/2026-09-27-b8c47927.md#104434--skillinitiative-planning), [2](../../meetings/2026-09-29-e08b3d64.md#035806), [3](../../meetings/2026-09-30-6f5a01ac.md#151303), [4](../../meetings/2026-09-30-6f5a01ac.md#151444), [5](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F028: A board SHALL be titled `<Theme>: <short description>` and SHALL be linked to the repository**

The title carries the theme and what it covers, which is what a reader picking a board needs. The repository is the context already, so naming it in the title says nothing. A board not linked to the repository is invisible from it. [[1](../../meetings/2026-09-30-6f5a01ac.md#152958--skilltheme-boards), [2](../../meetings/2026-09-30-6f5a01ac.md#154559--skilltheme-boards), [3](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F029: An issue outside the initiative structure SHALL sit on no board**

A board tracks planned work through its positions. An issue with no place in the structure has no position to hold, and putting it on a board makes the board report something it is not measuring. [[1](../../meetings/2026-09-30-6f5a01ac.md#151522), [2](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F030: An issue's board status SHALL be derived from its recorded state alone — open or closed, tasks delivered, pull requests in flight, open questions, and epic dependencies — with an open draft pull request reading as In Progress and one ready for review reading as In Review**

Derivation from recorded facts makes the status reproducible and removes the judgement call that would otherwise differ between runs. A draft pull request is explicitly not ready for review, so the work behind it is still being built. [[1](../../meetings/2026-09-27-b8c47927.md#170935), [2](../../meetings/2026-09-27-b8c47927.md#172245--skillinitiative-board-sync)] (MC)

> The sources do not state which column an issue closed as not planned takes.

🕒 **REQ-F031: An issue at Ready or beyond SHALL be assigned to the user, and an issue in Backlog SHALL carry no assignee**

Assignment marks what someone has picked up. Work still in the backlog has not been picked up by anyone, and an assignee there would claim otherwise. [[1](../../meetings/2026-09-30-6f5a01ac.md#153204--skilltheme-boards), [2](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F032: Update mode SHALL find an initiative's board by its theme, ask the user when none is found, add every initiative, epic and task issue the board is missing, and report each board and assignee change it makes**

A board that misses issues under-reports the work, and a board found by guesswork may be the wrong one. Reporting the changes is what lets the user see what the pass did without re-reading the board. [[1](../../meetings/2026-09-27-b8c47927.md#170851), [2](../../meetings/2026-09-27-b8c47927.md#170906), [3](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

### 4.4 Progress Reporting

🕒 **REQ-F033: A progress summary SHALL cover one theme's board or each board in turn, SHALL include every initiative holding reported work, SHALL list each epic with its tasks, SHALL limit the items reported as next to the five highest-priority ready items, and SHALL report work merged out of order against the work it belongs to**

An epic alone does not say which piece of work moved, which is what a standup is for. Capping what is next keeps the message readable when many items are ready at once. [[1](../../meetings/2026-09-28-8d61d701.md#045444), [2](../../meetings/2026-09-28-8d61d701.md#050405), [3](../../meetings/2026-09-28-8d61d701.md#050506), [4](../../meetings/2026-09-28-8d61d701.md#050525), [5](../../meetings/2026-09-28-8d61d701.md#061336--skillprogress-repositories), [6](../../meetings/2026-09-28-8d61d701.md#062043--skillprogress-repositories)] (MC)

> The sources do not state what sets an item's priority for that ranking.

🕒 **REQ-F034: A progress summary SHALL carry a single plain-language paragraph stating what was accomplished, placed below the line naming the period and above the board line**

A reader outside the work needs one paragraph in their own words before the itemised detail means anything. [[1](../../meetings/2026-09-28-9b7d2432.md#063148)] (MC)

🕒 **REQ-F035: A progress summary SHALL mark each item's status with a distinct symbol in place of the status word, SHALL carry a legend for those symbols, and SHALL close with a key expanding the house initials**

A symbol per status reads at a glance down a column where a repeated word does not. The legend and key are what make the compression readable by someone who does not know the scheme. [[1](../../meetings/2026-09-28-9b7d2432.md#064219--skillprogress-management-summary), [2](../../meetings/2026-09-28-9b7d2432.md#064434--skillprogress-management-summary), [3](../../meetings/2026-09-28-9b7d2432.md#064504--skillprogress-management-summary), [4](../../meetings/2026-09-28-9b7d2432.md#071333--skillprogress-management-summary)] (MC)

### 4.5 Dispatch

🕒 **REQ-F036: Deliver mode SHALL bring the board to its correct positions and statuses before it dispatches anything**

A dispatch decides what to start from what the board says is available, so a stale board starts the wrong work. [[1](../../meetings/2026-10-06-3abee13a.md#144228)] (MC)

🕒 **REQ-F037: Work a dispatch starts SHALL be moved to In Progress, task issues included**

A dispatched piece of work is being worked on, and the board should say so; leaving it available invites a second dispatch of the same work. [[1](../../meetings/2026-10-06-3abee13a.md#143933), [2](../../meetings/2026-10-06-3abee13a.md#144607)] (MC)

🕒 **REQ-F038: On dispatch a work item SHALL be given a hyperlink to its planning folder, that link reserving the work against a further dispatch, the folder named `<date>[-<ref>]-<slug>` with the reference falling back to the epic issue where the task has no issue of its own**

The reservation has to be visible to another agent reading the tracker, so it is written where that agent already looks rather than held in a session's own state. The fallback reference gives a folder a stable name where the task carries no issue number. [[1](../../meetings/2026-10-06-3abee13a.md#143933), [2](../../meetings/2026-10-06-3abee13a.md#144701)] (MC)

🕒 **REQ-F039: A dispatched session's prompt SHALL instruct it to invoke the skill and then implement, following the brief the skill holds for a dispatched session**

The dispatched session starts with no context, so the prompt has to put it on rails. Holding the brief in the skill keeps what a dispatched session does in one place rather than in each dispatch. [[1](../../meetings/2026-10-06-3abee13a.md#144747), [2](../../meetings/2026-10-06-3abee13a.md#144814)] (MC)

🕒 **REQ-F040: Once a dispatched session has planned, the epic's work items SHALL point at the planning artifacts rather than at the reserved folder**

The reservation link exists to hold the work; once real artifacts exist they are what a reader wants to open. [[1](../../meetings/2026-10-06-3abee13a.md#143933)] (MC)

### 4.6 Source Alignment

🕒 **REQ-F041: Review mode SHALL treat a marked subset of an initiative's References entries as normative requirement sources, SHALL align the acceptance criteria against them, SHALL accept any URL as a marked source, and SHALL report a fetch that fails as a finding**

Criteria written without the documents that state the requirement drift from it silently. Marking a subset keeps incidental references out of the alignment. A source that cannot be read is a gap in the alignment, so passing over it would make the pass report a confidence it does not have. [[1](../../meetings/2026-10-06-14f0f12f.md#151356), [2](../../meetings/2026-10-06-14f0f12f.md#151935), [3](../../meetings/2026-10-06-b11a33ec.md#150608), [4](../../meetings/2026-10-06-b11a33ec.md#150800), [5](../../meetings/2026-10-06-b11a33ec.md#150833)] (MC)

> The sources do not state how a References entry is marked as normative.

### 4.7 Hoist Outcomes

🕒 **REQ-F042: A hoisted candidate SHALL be kept as its own issue, subsumed, or left standalone; a candidate whose detail already lives in a planning folder SHALL be closed after migration with the receiving epic's References citing that detail and the close carrying a comment naming where the work now lives; no body SHALL record the migration**

An issue is worth keeping only where its complexity needs tracking separately. Citing the detail from the receiving epic is what makes closing it lossless, and the comment is where a person arriving at the closed issue finds the work. The migration itself is history, which bodies do not carry. [[1](../../meetings/2026-09-27-b8c47927.md#122425--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#130737--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#162106)] (MC)

🕒 **REQ-F043: Where hoist rewrites an issue's body, the existing body SHALL first be posted as a comment opening with a lead line saying what it is**

The rewrite replaces content a person wrote, so it is preserved where it can still be read. The lead line tells a reader why a long comment repeats the issue's own history; the rule that bodies state the result governs bodies, not comments. [[1](../../meetings/2026-09-27-b8c47927.md#162106), [2](../../meetings/2026-09-29-a0b1179e.md#050340--skillinitiative-planning-header), [3](../../meetings/2026-09-29-a0b1179e.md#050432--skillinitiative-planning-header), [4](../../meetings/2026-09-29-a0b1179e.md#050501--skillinitiative-planning-header)] (MC)

### 4.8 Skill Shape

🕒 **REQ-F044: The skill SHALL declare name and description only in its frontmatter, and the description SHALL be succinct and carry at least one trigger phrase for each mode**

Only those fields affect whether a request reaches the skill, and the listing that carries the description is budgeted, so every word in it competes. A mode nothing triggers is a mode that is never used. [[1](../../meetings/2026-09-29-a0b1179e.md#045151), [2](../../meetings/2026-09-30-6f5a01ac.md#140648--skillcanon-modes), [3](../../meetings/2026-09-30-6f5a01ac.md#142036), [4](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F045: Every command the skill runs SHALL be specified once in a commands file, one specification per operation named for what that operation does, with mode files linking to it by name**

A command repeated across mode files is several places to correct when it changes. Naming a specification for the operation rather than the script makes the calling prose say what happens. [[1](../../meetings/2026-09-29-a0b1179e.md#052756--skillinitiative-planning-header), [2](../../meetings/2026-09-29-a0b1179e.md#052805--skillinitiative-planning-header), [3](../../meetings/2026-09-30-6f5a01ac.md#140932), [4](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F046: The skill's markdown SHALL place each paragraph and list item on one line, SHALL use markdown links rather than bare URLs, and SHALL write a bold lead as a label followed by a full sentence**

Fixed-width wrapping makes the breaks arbitrary and every edit a reflow. A bold lead that is the first words of its own sentence is not a label, and leaves a fragment behind when the layout is applied. [[1](../../meetings/2026-09-29-a0b1179e.md#045151), [2](../../meetings/2026-09-29-a0b1179e.md#050002--skillinitiative-planning-header), [3](../../meetings/2026-09-29-a0b1179e.md#051536--skillinitiative-planning-header), [4](../../meetings/2026-09-29-a0b1179e.md#052214--skillinitiative-planning-header), [5](../../meetings/2026-09-30-6f5a01ac.md#140743--skillcanon-modes), [6](../../meetings/2026-09-30-6f5a01ac.md#140827--skillcanon-modes), [7](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F047: The skill's mode summary SHALL name on its own line what each mode does, with that mode's capabilities as a bulleted list, and the skill SHALL carry a Rules section holding the statements that bind every mode**

A summary that describes a mode's machinery without naming its outcome leaves a reader unable to pick it. A statement that binds every mode is a rule, and reads as one only where the rules are gathered. [[1](../../meetings/2026-09-29-a0b1179e.md#050131--skillinitiative-planning-header), [2](../../meetings/2026-09-29-a0b1179e.md#050227--skillinitiative-planning-header), [3](../../meetings/2026-09-29-a0b1179e.md#050938--skillinitiative-planning-header), [4](../../meetings/2026-09-29-a0b1179e.md#051225--skillinitiative-planning-header), [5](../../meetings/2026-09-29-a0b1179e.md#051253--skillinitiative-planning-header), [6](../../meetings/2026-10-06-3abee13a.md#150059--skilldeliver-mode)] (MC)

🕒 **REQ-F048: The skill SHALL carry scripts that check and apply the house rules — title shape, description width, one invariant per criterion, counts, references, change-narrative wording, dependency and join consistency, and board and assignee calls — each reached through a named operation**

A rule that is only prose is enforced by whoever remembers it. A check makes conformance measurable across every open issue at once, which is what makes a rule change applicable to the whole tracker. [[1](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning), [2](../../meetings/2026-09-27-b8c47927.md#124819--skillinitiative-planning), [3](../../meetings/2026-09-27-b8c47927.md#124834--skillinitiative-planning), [4](../../meetings/2026-09-27-b8c47927.md#162106), [5](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-F049: The skill SHALL be named Work Planner, SHALL consolidate the repeated planning operations into one place, SHALL trigger on requests to plan the work and similar phrasings, and SHALL use one vocabulary across its instructions, references and scripts**

The name says what the skill is for and is what a request will match. A term the instructions no longer define but the references and scripts still use leaves the reader with a vocabulary the skill does not explain. [[1](../../meetings/2026-09-27-b8c47927.md#050612), [2](../../meetings/2026-09-27-b8c47927.md#052635--skillinitiative-planning), [3](../../meetings/2026-09-29-a0b1179e.md#045658--skillinitiative-planning-header), [4](../../meetings/2026-09-29-a0b1179e.md#050620--skillinitiative-planning-header)] (MC)

## 5. Non-Functional Requirements

### 5.1 Authoring and Integration Constraints

🕒 **REQ-NF001: The conventions binding every skill in the repository SHALL live in one shared guide, and a skill's own reference guide SHALL hold only what is specific to that skill**

A convention copied into each skill is corrected in one of them and drifts in the rest. Separating the shared guide from the skill's own is what lets a second skill adopt the layout without adopting the first skill's subject matter. [[1](../../meetings/2026-09-30-6f5a01ac.md#135247), [2](../../meetings/2026-09-30-6f5a01ac.md#140148--skillcanon-modes), [3](../../meetings/2026-09-30-6f5a01ac.md#140542--skillcanon-modes), [4](../../meetings/2026-09-30-6f5a01ac.md#140648--skillcanon-modes), [5](../../meetings/2026-09-30-6f5a01ac.md#140743--skillcanon-modes), [6](../../meetings/2026-09-30-6f5a01ac.md#140827--skillcanon-modes), [7](../../meetings/2026-09-30-6f5a01ac.md#140932), [8](../../meetings/2026-09-30-6f5a01ac.md#142036), [9](../../meetings/2026-09-30-6f5a01ac.md#142325), [10](../../meetings/2026-09-30-6f5a01ac.md#142334), [11](../../meetings/2026-09-30-6f5a01ac.md#155429)] (MC)

🕒 **REQ-NF002: The skill SHALL reach GitHub over REST, using GraphQL only where the user grants an explicit one-off exception for an operation REST cannot perform**

REST is the interface the house holds to. The exception exists because a few project-board operations have no REST equivalent at all, and it is granted per operation rather than standing. [[1](../../meetings/2026-09-30-6f5a01ac.md#151506)] (MC)

## 6. Performance Requirements

The sources state no throughput, latency or capacity target for the skill.

## 7. Project and Process Requirements

### 7.1 Delivery

🕒 **REQ-F024: A pull request delivering initiative work SHALL open its title with the epic reference, as `[Ixx:Eyy] Purpose`, and SHALL leave task identifiers out**

The epic reference is what links the pull request to the plan and lets a later pass match the two. Task identifiers make the title long enough that the purpose stops being readable. [[1](../../meetings/2026-09-27-b8c47927.md#115808--skillinitiative-planning), [2](../../meetings/2026-09-29-e08b3d64.md#035539)] (MC)

🕒 **REQ-F025: Initiative work SHALL target that initiative's integration branch — `iNN/main`, `iNN/workflows` or `iNN/workspace` — created when none exists, with continuous integration treating the paired branches as one change**

An initiative's changes land together or not at all, and an integration branch is where they accumulate until they do. Changes split across the engine and the corpus are one change in effect, so measuring them apart reports a failure neither of them has. [[1](../../meetings/2026-09-29-e08b3d64.md#035539), [2](../../meetings/2026-09-29-e08b3d64.md#035824), [3](../../meetings/2026-09-30-2a2c8d9b.md#033845), [4](../../meetings/2026-09-30-2a2c8d9b.md#034001), [5](../../meetings/2026-10-05-6b3a029b.md#091216)] (MC)

🕒 **REQ-F026: Where an epic's tasks build on one another, their pull requests SHALL be delivered as a stack, each based on the one before**

Each pull request then shows only its own work, and a reviewer sees the task rather than everything underneath it. [[1](../../meetings/2026-09-30-2a2c8d9b.md#035631)] (MC)

---

*Status: 🕒 pending · 💬 under review · ✅ accepted · 🗑️ deprecated*
