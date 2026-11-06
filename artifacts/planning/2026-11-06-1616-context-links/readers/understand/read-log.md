# Bounded read log — Understand consumer

Installed workspace: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e01/workspace`.
Instruction checkout HEAD read locally: `d6be48053b4d74333d742a140df5e187e6c344d9`.
This is distinct from the scenario PR head of forty ones. No memory or historical result was consulted. No GitHub or graph service calls occurred. No repository files were written.

## Actual reads, in order

1. `skills/work-planner/SKILL.md`: lines 1–240 requested; complete file returned. Read Work Planner, Modes, Dependencies. Selected Understand because the request asks for one PR architecture overview.
2. `rules.md`: complete document, including Rules and Link Roles. `conventions.md`: complete document. `modes/understand-mode.md`: complete document, Procedure and Outcomes. These were separate batched outputs.
3. `.project` AGENTS file discovery: directory absent, exit 2; no component instructions read there.
4. `protocols/change-overview.md`: complete document including all Procedure steps, changed-head/matching-head/changed-revision/freshness branches, overview creation, registration and publication/link continuation.
5. `AGENTS.md`: complete document. `.project/main` is inapplicable because `.project` is absent and no component content was edited.
6. Heading index only for six artifacts: `pull-request.md`, `delivery-branches.md`, `repository-graph.md`, `architecture-overview.md`, `planning-record.md`, `pull-request-body.md`. Complete returned index, including headings inside fenced examples.
7. `pull-request.md:158–173`: Read Pull Request State and all subsections, stopping before Publish Pull Request.
8. `delivery-branches.md:97–136`: Create Pull Request Worktree and all eight subsections, stopping before Read Delivery Branches.
9. `repository-graph.md:7–48`: Measure Repository Change and all subsections, including When the Index Is Behind.
10. `architecture-overview.md`: complete document. Template, Diagrams, Code References, What Changed, Reading Order, Measurements, Pull Request Head, Overview File. All linked fields needed by selected work were present in this short document.
11. `planning-record.md:7–57`: Populate Planning Record (including Existing/New/Common branches) and Publish Planning Record; both complete operations, stopping before Commands.
12. `pull-request-body.md:62–92,136–139,144–151`: complete Template (including fenced markdown), Current Body, Overview URL, Output Body. Distinct ranges preserved their section boundaries.
13. `pull-request.md:174–196`: Publish Pull Request and all subsections, stopping before Merge Task Pull Requests.
14. `repository-graph.md:51–156`: Index Status, Index Repository, Change Surface, Symbol Context, Flow Trace, and complete Fields (Revision, Freshness, Changed Symbols, Symbol Relationships, Flow Traces, Review Checkout, Requested Revision, Base Branch, Symbol Identity, Flow Identity, Graph Measurements, Index State).
15. `planning-record.md:60–90,133–194`: Find Engineering Worktree, Commit Planning Record; Layout, Header, Executive Summary, Artifacts, Links, Record Selection, Planning Folder, Engineering Worktree, Project Checkout, Commit Message File, Publication Result; Guidance/Shared Worktree. Each complete selected section, excluding Add Planning Record and the new-record Template.
16. `delivery-branches.md:262–271,284–295,312–327,355–360`: Fetch Review Head, Add Review Worktree, Read Checkout Revision, Read Checkout Status, Review Worktrees. All complete selected sections.
17. `pull-request.md:343–352,449–456,525–535`: Patch Pull Request Body, Save Pull Request Snapshot, Fetch Pull Request Files. All complete selected sections.
18. Narrow heading search for Planning Records/Code References in configuration/guidelines. Only `configuration.md:27` matched Planning Records.
19. `configuration.md:27–50`: Planning Records complete, plus unnecessary adjacent Standup section (file ends early). A content search for code references/permalink in guidelines returned no matches; guidelines body was not read.
20. `git rev-parse HEAD`: read local instruction checkout identity only.

## Reuse and efficiency, separate from task correctness

- Rules/Conventions were reused when Understand and Change Overview linked them; no repeated body read. The same Architecture Overview contents supplied all of its linked sections. Planning Record contents were reused for later registration/publishing continuation. The fresh/stale cases share these reads; no reread for the stale scenario.
- All returned document/section bodies were complete. No tool truncation occurred, and no recovery from truncation was necessary. Large heading discovery was avoidable overhead (roughly 6.4k tokens); it included many unrelated headings but not their bodies.
- Whole Architecture Overview was a modest whole-document read (about 1.2k tokens). All its operative fields were relevant, but its short introduction and wrapper headings were extra. New Record subsection inside the required complete Populate Planning Record operation is unselected scenario content, not an accidental link traversal.
- `configuration.md` request overread the adjacent Standup section by four lines; no use was made of that unrelated content. The `.project` lookup and guidelines search yielded no usable context.
- A proposed local section-extraction helper was saved only under this `/tmp` folder. The bare invocation was blocked by the execution hook before running. Its suggested sandbox invocation failed because bubblewrap could not create a namespace. Safe fallback used bounded `sed` ranges; no graph action, network access or repository mutation was involved.
- A shell heredoc attempt to save the outline was blocked before execution because the hook rejected literal markdown backticks despite the quoted heredoc. Files were then saved with apply_patch. This is a tool-policy artifact, not evidence about Understand semantics. No external action remained blocked.

## Missing-context accounting

See outline's final section for fixture gaps. Existing-record reuse is selected procedurally, not falsely reported as an actual README read: no concrete record folder/README was supplied. No PR title, current body, symbol/flow query identity, source content or graph raw response was fetched or invented. A final render was not produced. The diagrams are explicitly bounded drafts within the requested outline.

## Todos

- [x] Read installed entrypoint, required shared rules and selected Understand path.
- [x] Trace relevant artifact operations and linked fields with bounded complete reads.
- [x] Prepare fresh-evidence outline and record/link continuation.
- [x] Prepare stale-evidence checks, exact selected commands and replay continuation.
- [x] Save results and separate efficiency/missing-context observations under `/tmp/linked-context-understand`.
