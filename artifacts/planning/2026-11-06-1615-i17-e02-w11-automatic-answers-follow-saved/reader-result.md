# Independent Advance procedural reading

Candidate: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/w11-automatic-answers-follow-saved`, HEAD `29e85bae7d4008b75fe9526edf523b8540a92215`.

Before using fixtures I read `candidate.txt` and `reader-packet.md`, checked HEAD against the candidate, and ran `sha256sum -c /tmp/e02-w11/packet-manifest.sha256`: observe.py, scenarios.json and reader-packet.md all passed. Initial tracked/untracked status was empty.

## Context actually read

- Candidate `AGENTS.md`; attempted `.project/main/AGENTS.md`, which does not exist in this checkout.
- Installed `skills/work-planner/SKILL.md`, `rules.md`, `conventions.md`, and `modes/advance-mode.md`.
- `artifacts/plan-change.md`: Check Plan Change Autonomy, Record Plan Change, allowance/change kinds/list/details/result, and Held Change.
- `artifacts/board-queue.md`: Compute Board Queue, priority sets, report lines, result/input fields, activity/handoff/dependencies, and Completeness. The initially truncated end was recovered with a separate read.
- `guidelines.md`, including a separate complete read of its Modes section and interview rules after the first combined output was truncated. The first combined read exposed other guideline sections, but supplied no scenario answers.
- `artifacts/repository-labels.md`: Ensure Repository Labels and its linked label commands/contracts.
- `artifacts/issue.md`: Save Tracker Issue and surrounding first 130 lines; heading index of its commands/fields. `artifacts/board.md`: Read Board State and heading index.
- `/home/mike1/projects/dev/md-composer/scripts/sbx`; packet scenarios and operation adapter. The combined scenarios print was truncated, so each actual start receipt and refreshed board receipt was read separately, including the supplied issue bodies, labels, statuses and PR/unplanned captures.

I did not read test implementation, validation.md, expected-observations.md, or another agent's analysis. The adapter imports `queue_run` from the test support and executes it; I did not inspect that imported implementation. I chose the operations from the installed procedure, not from that helper.

## Execution

Every operation ran as `/home/mike1/projects/dev/md-composer/scripts/sbx python3 /tmp/e02-w11/observe.py <case> <operation> [answer]`, with escalation for bubblewrap namespaces, from `/tmp`. This gives the candidate source a read-only mount and isolates network access. Every operation process returned exit 0; computed queue exit codes were also 0. Independent cases were batched, while each case's dependent operations remained sequential.

Below, `start` establishes the supplied initial queue. `Record(answer)` supplies that answer; `Record(held)` supplies no answer argument. For order lines with a single listed initiative, answer `1` means the map `o/r#1 -> 1`, not an answer about its epic. The available adapter does not encode an applied/held marker or recommendation separately, so this report supplies those meanings.

| Case | Recommended / selected answer | Ordered operations actually observed | Terminal / next continuation and step 7 eligibility |
| --- | --- | --- | --- |
| A | Order: recommend and select `o/r#1 -> 1`; #1 is already In Progress. | start → Check Plan Change Autonomy → Record(1) → Ensure Repository Labels → Save Tracker Issue → Read Board State → Compute Board Queue | Save succeeds; refreshed #1 has `priority: 1`; recomputation has no order/ask/unresolved/invalid. Step 7 is eligible: proposed #2 Backlog → Ready and assignee calls await it. Stop before those writes. |
| B | Ask #1: recommend and select `3`, joining #4's highest existing running set. | start → Check Plan Change Autonomy → Record(3) → Ensure Repository Labels → Save Tracker Issue → Read Board State → Compute Board Queue | Refreshed #1 has `priority: 3`, as does #4. Complete queue; step 7 eligible for #2 Ready and assignee calls. |
| C | Order recommendation `o/r#1 -> 1`; no selected answer. | start → Check Plan Change Autonomy → Record(held) | Task creation allowance does not cover re-prioritisation. Record/report held change to caller; supplied nonempty allowance means this dispatched run does not ask the user. Queue pending; step 7 ineligible. |
| D | Order has no recommended answer and no selected answer. | start → Check Plan Change Autonomy → Record(held) | #1 is Backlog, there are no PRs, and no initiative qualifies for the automatic recommendation. Although re-prioritisation is allowed, the unanswered line follows Held Change: report held to caller without asking under the allowance. Step 7 ineligible. |
| E | Recommend and select `o/r#1 -> 1`. | start → Check Plan Change Autonomy → Record(1) → Ensure Repository Labels → Save Tracker Issue | Save returns `saved: false`, `write refused`. Provide failure with pending queue and stop this continuation. No board readback or recomputation; step 7 ineligible. |
| F | Recommend and select `o/r#1 -> 1`. | start → Check Plan Change Autonomy → Record(1) → Ensure Repository Labels → Save Tracker Issue → Read Board State | Save succeeds, but `board_items` is null. Provide unavailable-readback discrepancy and pending queue; stop before recomputation. Step 7 ineligible. |
| G | Recommend and select `o/r#1 -> 1`. | start → Check Plan Change Autonomy → Record(1) → Ensure Repository Labels → Save Tracker Issue → Read Board State | Save succeeds, but refreshed #1 labels remain empty. The intended `priority: 1` addition is unconfirmed. Provide discrepancy and pending queue; stop before recomputation. Step 7 ineligible. |
| H | First order: recommend/select `o/r#1 -> 1`. After refresh, next ask #4 would recommend `1`; no second answer selected in this bounded exercise. | start → Check Plan Change Autonomy → Record(1) → Ensure Repository Labels → Save Tracker Issue → Read Board State → Compute Board Queue | Refreshed #1 confirms priority 1, but newly supplied In Progress #4 has no label. Recomputed queue prints `ask #4 ... priority` alongside proposed #2 calls. Next continuation is step 6 again, beginning Check Plan Change Autonomy for #4; step 7 ineligible while ask remains. Packet explicitly stops after first recomputation; no second decision resolution performed. |
| I | Recommend and select `o/r#1 -> 1`. | start → Check Plan Change Autonomy → Record(1) → Ensure Repository Labels → Save Tracker Issue → Read Board State → Compute Board Queue | Refreshed #1 confirms priority 1 but its E00 link now names absent issue #99. Recompute prints `unresolved: #1 ... E00: its issue is not given`. Next continuation is step 5 Read Tracker Issue for o/r#99, retaining snapshots/resolved files, then recompute. Step 7 ineligible even though footer says “the queue is current”; Completeness makes unresolved evidence controlling. No Read Tracker Issue response exists in the offered operations, and packet stops here. |
| J | Ask #1 recommendation is `3`; no selected answer. | start → Check Plan Change Autonomy → Record(held) | No allowance: held decision reaches user under interview rules. Packet supplies that the question was received and no answer followed. Remain pending; recommendation supplies no answer. No labels/save/readback/recompute; step 7 ineligible. |

## Evidence and boundaries

- A/B final recomputations print #2 Ready/assign calls, `next #1 ... E00`, and `unit I01:E00:W01: unlaned`, with no pending-decision or unresolved-reference lines. Those are eligible next writes, not applied state or board convergence.
- C/D/J journals have no selected answer and no save operations. E has no readback; F/G have no recomputation. This preserves the procedure's explicit stop boundaries.
- H demonstrates that the refreshed queue controls continuation even when it also contains otherwise runnable proposed calls. I demonstrates that an unresolved reference controls completeness even with a reassuring footer and exit 0.
- No relevant conflicting prose was needed to route these cases. The missing `.project/main/AGENTS.md` is an unavailable workspace instruction file, not evidence supplied for a queue decision.
- The `none` answer path, multi-initiative order maps, label creation failures, retained off-board issue captures, changing PR/link snapshots, and actual tracker save/readback behavior were not exercised. Fixtures supplied empty PR and unplanned snapshots here. J's interview receipt is supplied by the packet, not a live question sent by this reader.
- Actual evidence journals: `/tmp/e02-w11/reader-journal-A.json`, `/tmp/e02-w11/reader-journal-B.json`, `/tmp/e02-w11/reader-journal-C.json`, `/tmp/e02-w11/reader-journal-D.json`, `/tmp/e02-w11/reader-journal-E.json`, `/tmp/e02-w11/reader-journal-F.json`, `/tmp/e02-w11/reader-journal-G.json`, `/tmp/e02-w11/reader-journal-H.json`, `/tmp/e02-w11/reader-journal-I.json`, `/tmp/e02-w11/reader-journal-J.json`.
- This is an independent fresh-context procedural reading with actual selected-operation journals and actual installed queue computations against fixture board snapshots. It is not a live tracker acceptance run. No source edits or tracker/network writes occurred.
- Final verification repeated the manifest checks (all OK), confirmed the same HEAD, and read empty `git --no-optional-locks status --porcelain`; candidate source remains clean. Git reads emitted environment stream-fd warnings while returning exit 0 and the expected SHA/status output.
