# E01 planning consumer check

## Result

- Initial evaluated head: `c3d4f5b7bafba00096f71c8f53f213e57a264cba`.
- Post-fix head: `00a1d092855fee3b20ad735b8721bbcc8a970d13`.
- Checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e01/workspace`.
- All three offline cases can be explained from the installed instruction links. One introduced Proposal discovery gap was found and is closed by the post-fix source reread. No remaining introduced instruction gap was confirmed in these selected cases.
- This is a document-consumer check, not tracker execution or empirical validator acceptance. No GitHub/network calls, repository edits, publication, merge, worker dispatch, or validator/dependency-script execution occurred. Scratch output is this report only.

## Case 1: proposal for inconsistent queue placement

Select Propose because the goal is to scope a problem for which nothing is planned yet (SKILL.md:26-29). Confirm the actual friction, boundary, and observable goal clauses; confirmed defect evidence does not by itself settle the boundary or goal. Ask one decision at a time with context, multiple choices, a recommended answer and a pending unanswered decision (rules.md:5-6; guidelines.md:93-130). No broad sweep is required for an already bounded evidence set, and no workers were used.

The body is Overview, Problem, Goal, Non-Goals, then References when populated (proposal-body.md:21-72). Problem states today's friction, with one bold facet and its evidence per bullet. Counts and pinned code links support the claim; the goal states observable outcomes, not a proposed implementation. Non-goals state the confirmed boundary without naming planned work or owners. Design, acceptance criteria and Work Breakdown belong to later planning (propose-mode.md at original head:35-37).

An illustrative title shape is `[Pnn] Queue Placement: Consistent Results Across Supported Queue States`. The name has two words; the outcome subtitle is title case and at most ten words. `Pnn` comes from the next unused P number across every issue state, beginning at 00, not an invented current number (issue.md:116-134). Metadata includes `type:proposal` and the applicable `bug` label for the confirmed defect; any other labels must be justified and exist. No theme label is required merely because the problem concerns a theme (proposal-body.md:48-52; issue-body.md:188-200).

Keep the draft file as source, construct the draft issue-shaped JSON, validate, resolve findings, and repeat until clear. Ensure required repository labels, then save the unassigned issue and read back body/title/labels. Ask whether to place it on Proposals. On decline report only its URL; on acceptance locate the open exact-title Proposals board, copy the Proposals Template and link the repository if absent, read the saved issue id, add/place it at Suggested, confirm the saved item, and leave it unassigned (propose-mode.md at original head:39-76; board.md:23-73,142-150,361-373). An unanswered placement question stays pending. The explicit selection is proposals, so the theme lookup alternative is not selected here.

## Case 2: next epic of an existing initiative

Read the existing initiative body; it supplies scope and does not require another proposal (plan-mode.md:11-17). Use its approved scope, existing goal clauses, marked requirements, current epic bodies and planning record. Preserve prior content and record creation date, add draft bodies and work items to the README inventory, and publish the record on engineering so links resolve (planning-record.md:7-57,109-194).

No lane decision was supplied. First check the recorded initiative decision; if absent, ask once whether it uses lanes. Recommend from the actual parallel-delivery map. For only a same-component pair with no independent delivery streams established, a reasonable recommendation is no lanes, but the answer must come from the user. If lanes are chosen, ask for confirmation of the task-to-index map. Joined rows must share the exact lane string, or both be unlaned; `02` and `2` differ and `0` is valid. Never silently choose empty lanes as the answer (plan-mode.md:32-33; lane.md:60-67,110-113).

The epic owns acceptance criteria, Coverage, Depends on, Joins and Lane. New tasks are epic rows, not separate task issues. Each row is one PR's worth, covers at least one and at most three criteria, and owns only the invariant it delivers. A criterion cited by several rows must be split into each row's invariant; required tests accompany that task (epic-issue-body.md:245-286). Initiative criteria express the whole initiative and trace to the approved goal; the epic criteria provide their detailed realization (initiative-issue-body.md:199-235; goal-trace.md:7-99).

Each task has a lowercase work-item file such as `w01.md`. It begins with one `Component: <long-lived-branch>:<file-path>` declaration, then Overview, Problem, Proposal and a Part/Description table covering analysis, plan, implementation, review and test. A component is one file, not a directory; multiple implementation components require task splitting. Criteria, Coverage, dependencies and Joins are not copied into that file (work-item.md:7-78). Unreserved task cells link those files, with every file inventoried in the record (epic-issue-body.md:320-340).

The two rows declaring the same component in one epic form a candidate joined unit. Decide and record either mutual Joins for one PR or an exact-row-set record line explaining separate PRs. A join drops direct dependencies between members because commit order supplies that order. It is barred by more than six covered criteria or an outside-row path between members; such rule splits need no discretionary split record (dependency-graph.md:145-158). Do not automatically join simply because the component is shared. With no supplied allowance, a discretionary plan decision is put to the user; confirmed join/split, lane, unresolved design questions and proposed epic priority are distinct decisions handled one at a time.

Dependencies name the producing rows for outputs consumed, including implied consumption. Cross-epic task edges name rows, not whole epics. An initiative whole-epic edge exists only where every dependent task/unit requires every prerequisite task; narrow dependencies stay in task tables. Cross-epic output availability is measured at the consumer base, and producer closure is not itself the gate. Number only movable work into start order; preserve PR-named row numbers. Check all draft bodies/work items/split records, resolve findings, rerun after changes, and retain chains/contention evidence and the proposed epic-priority map (dependency-graph.md:7-72,119-158; delivery-branches.md:491-505).

Review the goal trace, marked sources and outside consumers; resolve content/structural findings before creating issues. Ask for the proposed positive-integer epic-priority map, ensure `type:epic`, the initiative's theme, the confirmed priority label and applicable shared labels, save the new epic in dependency order, save the existing initiative's new epic row, resolve publication placeholders, validate the saved epic and initiative, save corrections, and publish the updated record. The existing-initiative save continuation is an inherited ambiguity described below, not a new E01 finding. Do not claim board placement or start delivery from this planning-only case; delivery-base preparation is a later selected continuation.

## Case 3: orphan to hot-fix on workspace

Hoist fetches all issues, lists candidates, and reads the selected orphan's body/discussion with possible destinations (hoist-mode.md:9-32). The case supplies a confirmed defect on the declared long-lived `workspace` branch. A hot-fix must repair that branch as it stands and require no open initiative/epic/task work (hotfix-body.md:36-39). Confirm the theme board and target. A hot-fix is outside every automatic allowance; the user must select it unless this placement was already settled before Hoist (plan-change.md:19-27; hoist-mode.md:38-50).

Keep the original issue as destination and leave it open. Select its F number across every state, ensure the required labels, and rewrite that same identity (hoist-mode.md:90-97). Title: `[Fnn] Name: Subtitle`, with shared title conditions. Labels: `type:hot-fix`, the chosen board's `theme:*`, `priority:10`, plus applicable `bug`; preserve unrelated existing metadata unless a selected change requires otherwise (hotfix-body.md:12-16; issue.md:23-57).

Body outline:

- Overview: what is fixed and why; a separate line reads ``Target: `workspace` ``.
- Problem: the current defect and pinned evidence.
- Proposal: the confirmed design.
- Acceptance Criteria: one invariant per AC, each ending in its observing instrument; a regression reproduces the confirmed expected queue behavior.
- Open Questions: only unresolved prerequisites; settle and remove them before work starts.
- References: relevant sources when present, meeting shared reference conditions.

There is no Work Breakdown, initiative/epic membership, Depends on or Joins. Priority 10 does not rank the hot-fix in sibling priority sets (hoist-mode.md:119-149; standalone-body.md:26-52). Check the full edited body against shared and hot-fix conditions, resolve findings, save the same issue's body/title/labels, and read it back before placement.

Then Settle Hot-fix Board Status reads current issue/board evidence. Place a newly open hot-fix with no delivering PR or active prior status at Ready; a qualifying open draft delivering PR gives In Progress, and a qualifying review-ready PR gives In Review. An existing In Progress/In Review status keeps it In Progress under the otherwise-open rule. The delivering PR must match prefix/repository, target base and Development link. Add it to the confirmed theme board after saving, use current field/option ids, and confirm the saved item/status. Closed completed work is Done and other closed work leaves the board (hotfix.md:7-38,80-89,149-156; placement.md:95-104; board-delivery.md:189-209).

Retain the saved identity and settled board item; review changed issues, apply confirmed corrections, validate again, and report the placement/change list (hoist-mode.md:151-208). Hot-fix selection does not run the transfer branch. Only when another issue is selected to take the work does Hoist place design and singular outcomes in the taking issue, cite the source, publish the one closure comment, close the original as not planned while retaining its body, and read back state/reason (hoist-mode.md:159-187).

## Introduced finding and verification

At original head, Propose Draft linked shared Titles and Problem/Proposal, plus proposal-local Fields (propose-mode.md:26-29). Shared Titles now contains title rules only (issue-body.md:188-194). The moved applicable-label rule is at Labels:196-200, and pinned code/prose/body rules are at Body:252-279. Proposal validation called Validate Issue Body with local proposal fields; generic validation reviewed only supplied conditions (proposal-body.md:11-15; original issue-body.md:41-55). No selected link guaranteed discovery of the moved shared Labels or Body rules. I saw Labels incidentally in a wider read, so my correct case answer must not be treated as proof the original narrow route supplied it.

This is genuinely new against merge-base `03d353300ca4804194fd50d316d73e3bf1270d1d`: proposal-body.md:5-9 required reading all Issue Body, and the old Titles section itself contained body/code/prose requirements and applicable labels (baseline issue-body.md:102-132). The minimal repair is direct Body/Labels obligations at drafting plus shared Fields in central validation.

At `00a1d092855fee3b20ad735b8721bbcc8a970d13`, Propose:27 now explicitly calls Body and Labels, while Validate Issue Body:51 explicitly reviews shared Fields as well as supplied kind conditions. Following those links supplies the applicable `bug` label, pinned code references, section/body rules, and validation of those shared conditions. The identified gap is closed. No source edit was made by this consumer.

An inherited ambiguity remains in Plan publication: saving epics is written under the new-initiative branch (current plan-mode.md:68-74; baseline:70-75), before validation requiring saved epics/context. Explicitly saving a new epic and the updated existing initiative would make this continuation clearer, but the omission predates E01 and is not counted as an introduced failure.

The parent supplied that E02 #1615 owns selected-context boundaries/graph cleanup/retained preparation, and E04 #1654 owns draft restoration/merge refusal. Those issue bodies were not read here. Neither scope excuses the newly lost shared requirements. Retained preparation, draft restoration and merge refusal were not selected or tested.

## Original read receipt

All paths in this subsection are under `skills/work-planner/` at the original checkout/head unless noted. `whole` means complete file output was received; numeric ranges are the actual received line spans, not a claim to have read the complete file.

- Whole: SKILL.md; rules.md; conventions.md; modes/propose-mode.md; modes/plan-mode.md; modes/hoist-mode.md; artifacts/proposal-body.md; artifacts/hotfix-body.md; artifacts/work-item.md; artifacts/dependency-graph.md (its operation excerpt was recovered separately); artifacts/plan-change.md; artifacts/review-finding.md; references/requirement-characteristics.md; configuration.md.
- guidelines.md:93-130.
- artifacts/standalone-body.md:26-74.
- artifacts/issue-body.md:7-56,90-101,132-155,188-279,284-332,383-EOF.
- artifacts/epic-issue-body.md:7-67,200-353,382-385,422-425.
- artifacts/initiative-issue-body.md:59-78,167-235.
- artifacts/planning-record.md:7-57,60-106,109-EOF (overlapping reads included 190-191 and 190-EOF).
- artifacts/goal-trace.md:7-99.
- artifacts/hotfix.md:7-38,80-89,97-156.
- artifacts/placement.md:18-104.
- artifacts/lane.md:18-41,60-67,110-113.
- artifacts/board.md:23-196,198-282,361-374; line75 heading was separately recovered.
- artifacts/delivery-branches.md:330-341,361-376,491-EOF.
- artifacts/board-queue.md:55-62.
- artifacts/pull-request-body.md:162-EOF.
- artifacts/board-delivery.md:189-EOF.
- artifacts/repository-labels.md:7-53,56-63.
- Heading-only indexes: guidelines; proposal-body; issue-body; epic-issue-body; work-item; dependency-graph; planning-record; hotfix-body; hotfix; placement; issue; board; initiative-issue-body; goal-trace; plan-change; lane; repository-labels; standalone-body; delivery-branches; board-queue; board-delivery; pull-request-body; review-finding; requirement-characteristics. Board's index was repeated separately to recover the combined-index truncation.
- Issue operations/fields actually read: artifacts/issue.md:7-58,116-154,446-453,486-EOF.
- Outside the installed skill: read `/home/mike1/projects/dev/md-composer/scripts/sbx` fully to determine launcher behavior.
- Local git evidence: HEAD; five-entry log; diff stat against local origin/workspace merge-base; full received diffs of Plan/Propose and Proposal/Hot-fix bodies; exploratory combined Board/Issue Body diff (truncated); origin/workspace ref; merge-base. Exact complete baseline excerpts were then read at merge-base 03d3533: issue-body:100-141, proposal-body:1-31, plan-mode:70-88. Earlier equivalent origin/workspace excerpts were read at e25ecb7: issue-body:90-150, proposal-body:1-38, propose-mode:1-48.
- A search for `artifacts/planning/2026-11-06-*` found no matching path and returned no planning context.

## Post-fix read receipt

- Confirmed HEAD `00a1d092855fee3b20ad735b8721bbcc8a970d13`.
- Read modes/propose-mode.md whole, artifacts/proposal-body.md:7-18, artifacts/issue-body.md:41-56 and then whole.
- The whole Issue Body read is broader than the selected Fields section; it is recorded as actual receipt, not an expected reading requirement. No additional mode or command execution followed.
- The post-fix output was complete with no truncation. The bounded reread confirms the added drafting links and central validation obligation; it does not rerun all three scenarios at the new head or claim fresh script results.

## Missing, unrelated and truncated context

- Domain inputs absent from the offline prompt: actual issue/initiative bodies, reproduction details/counts/code links, current marked-source contents, label definitions, issue-prefix inventory, tracker/board snapshots, PR links, fetched target declaration evidence, and record identities. Consequently titles/numbers/body details above are illustrative shapes, not publishable validated issues or live placements. The supplied facts of approved scope, confirmed defect and declared workspace target were treated as scenario assumptions.
- No memory files, hidden expected route, worker output, network source, or E02/E04 issue body informed the original route. Parent scope guidance arrived only after the original findings.
- Unrelated/incidental receipt: whole-mode reading exposed later delivery/sync branches; whole Dependency Graph included unused renumber commands; whole Configuration included theme/standup settings; guidelines Modes contains skill-maintenance rules alongside Interview; selected broad reads included extra board/hot-fix delivery fields. The post-fix whole Issue Body also included unrelated repair and visibility command definitions. None was executed.
- Truncation was separate from task correctness: (1) combined heading index truncated in Board headings; recovered with Board's full heading index. (2) combined artifact output truncated about 80 tokens in Dependency Graph's operation; recovered its complete operation at 7-39. (3) exploratory combined Board/Issue Body diff was truncated; exact baseline excerpts supporting every attribution were recovered completely, but the entire nonessential combined diff was not reread. No selected instruction section or finding rests on its missing bytes.
- The first sbx call failed because the default sandbox could not create namespaces. The same read-only sbx command succeeded with approved escalation; subsequent reads retained the launcher. No auto-review rejection occurred.
