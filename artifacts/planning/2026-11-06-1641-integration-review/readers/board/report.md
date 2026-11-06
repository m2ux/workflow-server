# Work Planner board-route consumer check

Read-only consumer check passed at c3d4f5b7bafba00096f71c8f53f213e57a264cba. No introduced instruction regression was found in these three routes. The checkout was clean at the completion of the route review. A later receipt verification observed concurrent repository edits, listed below; this reviewer made no repository edits.

## Case 1: Advance an automatic ask for I09

- Recommend priority 6, joining the highest running set; the re-prioritisation allowance permits taking that decision.
- Record the decision, ensure priority: 6 exists, save the initiative label and confirm the saved issue. Refresh board items and recompute using retained PR/link snapshots and resolved issue evidence.
- Recording alone does not complete the existing queue. Status/assignee calls wait until no order, ask or unresolved reference remains; invalid Lane assignments also prevent completeness.
- After applying calls, refresh and recompute until the queue is complete and emits no further call.
- Evidence: modes/advance-mode.md:51-90; artifacts/board-queue.md:157-163; artifacts/issue.md:23-57.

## Case 2: Align joined Lane conflicts and an entire-epic task dependency

- Investigate current bodies, initiative context, registered work-item files, marked sources and the actual producer outputs consumed.
- Joined rows require one identical Lane value or all unlaned. Propose a confirmed common assignment or unjoin them; the scenario supplies no evidence for choosing a particular Lane.
- A task dependency must name consumed producer rows. Naming an entire epic is a finding, even though the graph reader retains that reach for diagnosis. An initiative-level whole-epic gate is justified only by complete task reach.
- These are content decisions: present evidenced options and obtain approval before applying them. Mechanical formatting permission does not authorize those choices.
- Validate revised local bodies and dependencies, repeat graph checks until clear, preserve PR-fixed numbering, then save, read back and rerun affected checks. Do not publish failed renumbering.
- Evidence: artifacts/lane.md:110-112; artifacts/dependency-graph.md:17-38,119-139; modes/align-mode.md:50-119,201-207.

## Case 3: Sync a merged task with one unverified epic criterion

- Match and link the delivery, verify task criteria, save the task body and record the merged PR. Task closure still requires its own fresh delivery and Development-link gates.
- Record epic delivery without asserting verification. The unverified criterion stays unticked; its covering row cannot be Done while that criterion remains unticked.
- Run the named instrument at the delivered revision. Missing, failed or inconclusive evidence leaves the criterion unverified. Plan a further task only when further work is confirmed necessary.
- The epic cannot pass integration readiness or close with that criterion unverified. The initiative epic row remains incomplete until the epic closes as completed.
- Continue initiative and board reconciliation from saved evidence. Sync reports queue decisions unevaluated; it does not choose subsequent work.
- Evidence: modes/sync-mode.md:58-69,186-238,282-335; artifacts/acceptance-criteria.md:11-45; artifacts/epic.md:41-55; protocols/issue-closure.md:19-77.

## Attribution and findings

- No introduced instruction regression or contradiction requiring an E01 correction was found.
- Automatic-decision wording and broader selected-context/graph diagnostics remain E02 #1615 concerns, as confirmed by the parent and captured E02 plan. The automatic decision leaves a stale queue that the procedure explicitly recomputes; this was not identified as a new contradiction.
- Hot-fix draft restoration and epic merge refusal/retry remain E04 #1654 concerns, as confirmed by the parent. Neither behavior was exercised or reclassified as an E01 defect.

## Actual source reads

All skill paths below are relative to skills/work-planner/ in the reviewed checkout.

- Complete entry/routing reads: SKILL.md, rules.md, conventions.md, modes/advance-mode.md, modes/align-mode.md, modes/sync-mode.md.
- Relevant operations/fields read: artifacts/plan-change.md, artifacts/board-queue.md, artifacts/lane.md, artifacts/dependency-graph.md, artifacts/epic-issue-body.md, artifacts/issue-body.md, artifacts/issue.md, artifacts/acceptance-criteria.md, artifacts/task-body.md, artifacts/initiative-issue-body.md, artifacts/epic.md, artifacts/board-delivery.md, artifacts/goal-trace.md, artifacts/review-finding.md.
- Protocol/reference reads: protocols/issue-closure.md, protocols/epic-integration.md, guidelines.md Modes section, references/requirement-characteristics.md.
- Supporting reads: checkout AGENTS.md, sandbox launcher, head diff/stat and log, repository HEAD/status, worktree discovery, captured E02 scope in the engineering worktree. A memory registry search supplied discovery context only; live source governed the review.

## Limits, unrelated context and truncation

- This was a semantic instruction-route check. No executable fixtures, criterion instruments, workers, network commands, GitHub writes, repository edits, merges or publication ran.
- No actual captured board/issue/PR records were supplied. The result establishes instruction-route usability, not live tracker correctness, correct concrete Lane selection or concrete producer identification.
- Two batched skill reads truncated. Decisive sections were reread successfully, including Align continuation, Sync selection/recording, Dependency Graph and Epic operations.
- Subsequent worktree/planning discovery produced unrelated truncated output; it supplied no correctness evidence. Full Lane and graph reads exposed admission/renumbering material beyond the immediate cases.
- The initial sbx invocation could not create a namespace without escalation. The escalated sbx reads succeeded. One dynamic-shell batch was blocked before execution and replaced by literal read commands.
- The reviewed checkout had no local .engineering/artifacts/planning; registered engineering-worktree discovery supplied the E02 captured plan. E04 attribution came from the parent, not an inspected E04 body.
- Artifact creation after the check is limited to this report and its JSON receipt under /tmp/e01-board-route-review. An initial report-write command containing Markdown code delimiters was blocked by the shell-composition hook before execution; a literal-text command succeeded.

## Concurrent state at receipt verification

The later status read showed modified artifacts/issue-body.md, modes/propose-mode.md, protocols/issue-closure.md and protocols/issue-delivery.md under skills/work-planner/. These changes were not made by this reviewer. The route verdict describes the source read earlier at the requested head and does not review those later working-tree changes.
