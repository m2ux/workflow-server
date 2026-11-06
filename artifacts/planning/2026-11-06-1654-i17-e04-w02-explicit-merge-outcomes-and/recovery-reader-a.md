# Independent consumer trial: reader A

This report interprets captured scenarios against source. No tracker command, review validator, merge mutation, source edit, commit or push was executed. Only source reads, git identity/status reads, and this temporary report were performed. No subagents were used. No expected choices or answer key was supplied to this reader.

## Revision receipts

- Hot-fix checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e04/w01-confirm-draft-state-after`. `git rev-parse HEAD` returned `814eab99c949cc81b8c87c0a901e262c348e78b0`; `git status --short` returned no entries.
- Merge/epic checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e04/w02-explicit-merge-outcomes-and`. `git rev-parse HEAD` returned `011ef0e7c3e95aed5624aaa90b3b9436520466a3`; `git status --short` returned no entries.
- Commands returned exit 0 except one exploratory `rg` combining an existing file and nonexistent `protocols/epic-handoff.md`, which returned exit 2. The actual route is `protocols/epic-integration.md`, discovered from `protocols/task-merge.md`.
- Shell initialization repeatedly printed `Failed to create stream fd: Operation not permitted`; requested read commands still returned their contents and exit 0. No escalation or sandbox workaround was needed for these reads.

## Actual reading route and limits

Each route began at that checkout's `skills/work-planner/SKILL.md`. Read Rules and Conventions before selecting Deliver. The selected hot-fix procedure is Deliver → Run Delivery Session → Review a Hot-Fix. The selected epic procedure is Deliver → Merge Task Pull Requests / Task Merge → Epic Integration → Merge Delivery Pull Request.

Complete whole-document reads at the hot-fix revision:

- `SKILL.md`, `rules.md`, `conventions.md`.
- `modes/deliver-mode.md`, recovered by a later separate full `cat` after a batch output was truncated.
- `artifacts/agent-review.md`.

Complete selected-section reads at the hot-fix revision:

- `artifacts/pull-request.md`: Read Pull Request State; Hold Epic Review; Mark Review Ready; Mark Review Draft; Published Reviews; Epic Readiness; Review State; Node Metadata; Failure; Merge Task Pull Requests; Merge Delivery Pull Request (last step recovered separately).
- Deliver's Review a Hot-Fix and Merge sections were also reread with bounded `sed` after the initial batch truncation.

Complete whole-document reads at the merge/epic revision:

- `SKILL.md`, `rules.md`, `conventions.md`. These were reread together because the first broad batch's aggregate output truncated.
- `modes/deliver-mode.md`, recovered through a separate full `cat`.
- `protocols/task-merge.md`, `protocols/epic-integration.md`.

Complete selected-section reads at the merge/epic revision:

- `artifacts/pull-request.md`: Merge Delivery Pull Request; Merge Task Pull Requests; Fetch Merge Readiness; Hold Epic Review; Merge Pull Request; Submit Epic Merge; Read Merge Result; Identity; Kind; Verified Head; Target Requirements; Readiness Evidence; Repository Prerequisite; Merge Authorization; Merge Result; Merge Response; Merge State; Merge Permission.
- `artifacts/board-delivery.md`: Record Epic Review.

Partial/discovery reads:

- Heading-only `rg` scans of the hot-fix pull-request and agent-review documents, and the merge/epic pull-request and board-delivery documents. These are navigation aids, not claims of complete document consumption.
- Some `sed` ranges included the next heading without its body (for example Commands, Guidance, Query File, Link Request); those next sections were not consumed as complete sections.
- The first six-file batch exceeded the aggregate output budget. Its missing content was not treated as read; Rules/Conventions and both Deliver documents were recovered separately as above.
- Whole Deliver reads exposed coordinator, dispatch, planning and arising-issue material unrelated to the captured readiness/merge decisions. Hold Epic Review at the hot-fix revision was contextual overlap; the hot-fix recovery route itself owns restoration.
- I did not recursively consume every nested board-write implementation, branch-update implementation, planning-publication implementation or issue-closure protocol. Those calls are identified below at their owning operation/protocol level; this is a scenario interpretation, not a full execution rehearsal. No script behavior is claimed to have been tested.

## Fixture clarification

The coordinator clarified during this trial: every additional metadata read returns the most recently stated tracker state until the next stated write/change. Accordingly the additional pre-restoration read in scenarios 1 and 2 returns open/ready at head B. This supplies a fixture response, not an expected operation choice.

## Selected scenario sequences

### 1. Hot-fix head changes after ready; restoration succeeds

Source: hot-fix revision, Deliver / Review a Hot-Fix / Verify Hot-Fix Readiness, Restore Hot-Fix Draft, Repair Hot-Fix Findings; Agent Review / Validate Agent Review and Review Record.

1. Read Pull Request State at head A; Validate Agent Review against the published head-A record passes.
2. Mark Review Ready using the fresh node id; write succeeds.
3. Read Pull Request State again: open/ready at head B.
4. Validate Agent Review again using this metadata and the same published records. A head-A record is stale for B, so retain the changed-revision finding and select Restore Hot-Fix Draft.
5. Read Pull Request State again before selecting restoration: open/ready at B under the fixture clarification.
6. Mark Review Draft for the same PR identity; write succeeds.
7. Read Pull Request State again: open/draft at B. Only this readback establishes restored draft state.
8. Continue to Repair Hot-Fix Findings. Resolve each finding on the task branch and repeat from Produce Agent Review, then populate/publish planning evidence, link the published record, and repeat readiness validation. The scenario supplies no replacement review or subsequent readiness result.

Captured endpoint: restoration is confirmed and repair is the selected continuation. The whole delivery session is not complete. Claims justified: PR is confirmed open/draft at B; head-A review is stale; the hot-fix remains held while the finding is repaired. Ready-for-merge or merged claims are unjustified. If repair is outside the allowance, stop before merge and report the hold, confirmed draft readback and finding.

### 2. Hot-fix head changes; restoration write fails and readback stays ready

Steps 1–5 match scenario 1. Mark Review Draft fails. Despite that failure, Read Pull Request State is still selected afterward and returns open/ready at B. Retain both the stale-review finding and restoration failure. Provide Failure with the unresolved restoration discrepancy and stop before repair or merge.

Terminal result: failed restoration, held hot-fix, current PR open/ready with stale review evidence. A draft-state claim is forbidden because readback confirms ready. There is no automatic repeated restoration write in this route, and no successful readiness or merge claim.

### 3. Matching hot-fix evidence; ready write and readback succeed

Read Pull Request State → Validate Agent Review passes → Mark Review Ready succeeds → Read Pull Request State confirms open/ready at the reviewed head → Validate Agent Review against that metadata and the same records passes → provide confirmed Review State → continue to Merge.

Merge begins with Publish Pull Request carrying check results, then Merge Task Pull Requests using current target requirements and merge evidence. A confirmed merge would select Task Merge; the captured scenario supplies no merge result. Thus the captured endpoint is confirmed review readiness and entry into the merge procedure, not completed delivery. Target-required human review can still stop a merge. No restoration or repair is selected for these passing inputs.

### Epic route common preparation for scenarios 4–7

Source: merge/epic revision, Task Merge / Complete When Ready → Epic Integration (whole protocol).

The protocol initially holds review draft and records In Progress; confirms repository auto-close; refreshes review body and overview; checks head/target; updates the epic base; obtains fresh criterion and delivery evidence; checks epic readiness; refreshes body/overview when content changes; produces current agent-review handoff evidence; validates that evidence; marks ready when draft; reads and validates again; records In Review; fetches exact-head target/check/review readiness. Before the merge decision it refreshes review metadata and validates again.

The scenarios supply passing preparation evidence. Board status claims additionally need a present board item and the Record Epic Review operation's confirmed status; an absent board is reported and does not block integration. No scenario grants an actual successful board write beyond its fixture premises.

### 4. All readiness evidence; target requires a person's approval

Merge Delivery Pull Request first reads target requirements and checks authorization. It selects `human-handoff` with verified head and target requirements and returns before any mutation. Epic Integration selects Human Handoff: provide the result to the reviewer and return. No later merge attempt or merged-success readback occurs.

Terminal result: finished human handoff for this merge attempt; PR remains open and ready with current passing agent evidence, awaiting the reviewer who owns approval and merge. The board can remain In Review when its write was confirmed. Do not claim merged, invent a harness refusal, use another account, bypass protection or treat readiness as permission to merge.

### 5. Agent merge permitted; harness declines command execution

After target/authorization/prerequisite checks, select Submit Epic Merge at the exact verified head. The harness refuses to execute the mutation. Merge Delivery Pull Request retains the observed permission-layer refusal, provides `harness-denial` with head/target, refusal and missing permission, and returns. GitHub supplies no response. Epic Integration selects Harness Denial, provides the refusal and current verified readiness, and returns.

Terminal result: open PR; ready-and-verified claim is permitted only while evidence remains current. Keep the verified handoff state rather than selecting the preparation-failure draft/In Progress route for this classified result. No same-run retry, approval request, or merged-success readback is selected. This is neither GitHub refusal nor required human approval.

### 6. GitHub refusal, then another refusal after fresh admissible evidence

1. Select Submit Epic Merge with exact verified head; GitHub refuses. Merge Delivery Pull Request classifies `github-refusal`, retaining attempted head/target and response, and returns without its merge-success readback.
2. Epic Integration selects GitHub Refusal: Hold Epic Review (fresh read, draft write when open/ready, confirming read) and Record Epic Review requesting In Progress with fresh pull records and an empty review-record list. Skip only the board withdrawal if absence is confirmed.
3. Repeat the whole Refresh and Validate step with fresh branch, criteria, head, target, review and check evidence. That includes current review/overview refresh as applicable, readiness revalidation, ready write/readback when appropriate, confirmed In Review recording and fresh merge-readiness fetch. Refresh/validate metadata again at Merge or Hand Off.
4. Make exactly one further merge attempt with this fresh admissible evidence. GitHub refuses again; classify and retain the second `github-refusal`.
5. For this refusal, hold the review in draft and request/confirm In Progress again, with the same confirmed-board-absence exception. Then provide the refusal and return.

Terminal result: PR remains open; review is held in draft if holding succeeds; board is In Progress if the withdrawal is confirmed. There is no third attempt or merged-success readback. Readiness was temporarily regained before attempt 2, but that does not justify leaving the final refusal reported as a current ready handoff. If withdrawal fails, report that discrepancy rather than asserting draft or board status.

### 7. `merged: true`; current readback matches head, target and merge SHA

Submit Epic Merge returns Merge Response `{merged: true, ... sha: M}` for verified head H and target T. Only this success selects Merge Delivery Pull Request / Confirm Delivery Merge: Run Read Merge Result for the same identity, compare merged state, H, T and merge commit M, and provide `confirmed-merge` with that commit when all match.

Epic Integration then selects Confirmed Merge → Confirm the Result: Apply Read Pull Request State for the same identity, compare merged state/head/target/merge commit again, and provide the confirmed result. The clarified fixture makes this additional read preserve the last matching state. Thus this route contains an operation-level merge-state readback and a separate protocol-level full-state confirmation; neither may be skipped by treating the mutation response alone as success.

Terminal result: confirmed epic integration merge at H into T with M. This permits a merged assertion for that PR. Returning Task Merge still has its post-integration refresh, Sync Epic, eligible Issue Closure and Sync Initiative to do; this scenario alone does not establish issue closure, Done board status, initiative completion or complete board delivery.

## Remaining uncertainties and interpretive limits

- Scenario 1 becomes deterministic with the explicit fixture clarification; without it the mandatory pre-restoration read could have selected a different branch or stopped on unreadable/closed state.
- Scenarios 1 and 3 end at continuation boundaries because no subsequent repair or merge outputs are supplied. I have not invented those outputs.
- Scenario 6 concerns the epic protocol; the task wrapper also bounds GitHub-refusal refresh to one retry, but uses Update Task Branch plus Fetch Merge Readiness rather than the full epic readiness refresh.
- Scenario 7's singular supplied readback is sufficient under the clarification because additional metadata reads repeat current state. Real execution needs both selected confirmations to succeed independently.
- This report establishes source-following choices, not executable-command success, validator correctness, actual GitHub state or fresh live acceptance evidence.
