# Recovery reader B

Read-only consumer interpretation, 2026-11-06. The assigned scenarios supplied states and responses, but no expected action choices. I did not execute a tracker command, validation script, branch update, review publication, merge, or restoration. Operation names below describe selections derived from the documents, not real execution. No subagents or memory sources were used.

## Source verification

- Hot-fix checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e04/w01-confirm-draft-state-after`, HEAD `814eab99c949cc81b8c87c0a901e262c348e78b0`.
- Merge/epic checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e04/w02-explicit-merge-outcomes-and`, HEAD `011ef0e7c3e95aed5624aaa90b3b9436520466a3`.
- Both initial `git status --short` and final `git status --porcelain=v1 --untracked-files=all` were empty; both HEADs matched the pins at the initial and final checks. Final commands used `login:false`, exited 0, and returned only each SHA.
- Initial login-shell reads printed `Failed to create stream fd: Operation not permitted` before successful command output. Switching to `login:false` eliminated these warnings. No sandbox escalation was needed: only shell builtins and read-only git/cat/rg/sed were used for source inspection. The only write was this report under `/tmp`.

## Actual reading route and completeness

All paths in this section are relative to `skills/work-planner/` in the specified pinned checkout. Heading inventories were navigation only; they were not treated as reading section bodies.

Hot-fix source:

1. `SKILL.md`, complete; then `rules.md` and `conventions.md`, complete, before selecting Deliver.
2. `modes/deliver-mode.md`, initially requested whole in an oversized batch. The aggregate tool output was truncated. Recovered with an individual whole-file read (5,532 source-output tokens), complete. Additionally read lines 231–269 and 211–268 while locating the selected `Run Delivery Session / 9. Review a Hot-Fix` path; the second slice includes all three readiness/restoration/repair subsections. Complete whole-file recovery supplies its enclosing headings and all continuation context.
3. `artifacts/pull-request.md`: heading inventory; complete `Read Pull Request State` (158–173), `Save Pull Request Snapshot` (449–456), `Mark Review Ready` (552–570), `Mark Review Draft` (571–578), `Published Reviews`, `Epic Readiness`, `Review State`, `Node Metadata`, `Query File` (729–748), `Failure` (769–772), and `Merge Task Pull Requests` (197–222).
4. `artifacts/agent-review.md`: heading inventory; complete `Validate Agent Review` (36–49) and fields (58–73), followed by a complete whole-file read. This supplies exact-head/base eligibility, the hot-fix `base_ref` rule, review production and findings dispositions.

Merge/epic source:

1. `SKILL.md`, `rules.md`, `conventions.md`, and `modes/deliver-mode.md` initially requested in the same oversized batch. `SKILL.md`, rules and conventions were recovered completely in smaller calls; Deliver was recovered by an individual whole-file read (5,135 source-output tokens), complete. Both revisions were read independently rather than assuming their content identical.
2. Heading inventories of `artifacts/pull-request.md` and `protocols/task-merge.md`. An attempted inventory of `protocols/epic-review.md` returned a file-not-found error; the actual Deliver → Task Merge link identified `review-pull-request.md` and `epic-integration.md`. This was a navigation error, not missing operative evidence.
3. `protocols/task-merge.md`, complete. Its Review and Complete When Ready steps lead to `protocols/review-pull-request.md` and `protocols/epic-integration.md`; both were read completely.
4. `artifacts/pull-request.md`: complete `Merge Delivery Pull Request` (7–46), `Merge Pull Request` (326–342), `Submit Epic Merge` and `Read Merge Result` (361–385), fields `Verified Head` through `Merge State` (609–640), `Failure` and `Merge Permission` (777 through end); then complete `Merge Task Pull Requests`, `Fetch Merge Readiness`, `Hold Epic Review` (194–269), `Read Pull Request State` (155–170), and `Save Pull Request Snapshot` (449–456). `Mark Review Ready` and `Mark Review Draft` (552–578) were also read completely.
5. `artifacts/agent-review.md / Validate Agent Review` (36–49), complete at this revision.
6. `artifacts/board-delivery.md`: heading inventory and complete `Record Epic Review` (7–33). This confirms that board status is read back, with a discrepancy or absent item reported rather than silently asserted.
7. Heading-only discovery in `artifacts/issue.md` (`Confirm Repository Auto-Close`, `Auto-Close Setting`) and `artifacts/delivery-branches.md` (`Update Epic Base`, `Update Task Branch`, protection/rules commands). Their bodies were not read, because the captured scenarios begin with admitted readiness/target evidence and do not require actual prerequisite or branch mutation execution.

No selected controlling section remains truncated. Complete previously read sections at a given revision were reused across cases; no cross-revision content equivalence was assumed. The two whole Deliver recoveries, smaller duplicate section reads, and one nonexistent-path lookup are real reading overhead. No measured model-token or elapsed-time accounting is claimed; the two token counts above are the command tool's source-output counts, not total trial consumption.

## Selected operation sequences

### 1. Review A; ready write succeeds; readback ready at B; restoration succeeds

1. `Read Pull Request State`: open draft at A. `Validate Agent Review`: the published A review passes.
2. `Mark Review Ready` using the fetched node id: stated success.
3. `Read Pull Request State`: open ready at B. `Validate Agent Review` with that fresh metadata and the same published records: A evidence is stale for B. Retain this finding.
4. Enter `Restore Hot-Fix Draft`. `Read Pull Request State` again before selecting restoration: still open ready at B under the scenario's latest-state rule.
5. Select `Mark Review Draft` for that PR identity. After the stated successful write, `Read Pull Request State`: confirmed open draft at B.
6. Only now enter `Repair Hot-Fix Findings`. Resolve the revision/review finding at the current branch state and repeat from `Produce Agent Review`, including current validation, publication and both readiness checks. A source fix is not automatically necessary merely because review evidence is stale; a new complete review of B is necessary. Any defect found must be fixed and reviewed.

Captured terminal result: draft restoration is confirmed and the repair/review continuation is admissible. The scenario supplies no resulting B review, repair or merge evidence, so I cannot claim that continuation completed. If it cannot be completed within allowance, return the hold, confirmed draft readback and outstanding finding before merge. Justified claim: “Open draft at B; review A is stale; current review is required.” No merge, ready-handoff or delivery claim.

### 2. Same mismatch, but restoration fails and readback remains ready

Steps 1–4 are the same as case 1. Select `Mark Review Draft`; retain its failure. Perform the required subsequent `Read Pull Request State` even though that write failed: still open ready at B. Provide `Failure` describing unsuccessful restoration and ready readback. Stop before repair and merge.

Terminal result: unresolved restoration discrepancy. Justified claim: “The PR remains open and ready at B, its A review is stale, and draft restoration failed.” Do not describe it as draft, reviewed at B, or merged; do not silently repair in the ready state or retry restoration in a loop. The held work remains unresolved.

### 3. Matching review; successful ready write and matching readback

`Read Pull Request State` → `Validate Agent Review` passes → for the draft, `Mark Review Ready` → fresh `Read Pull Request State` → `Validate Agent Review` again with that metadata and published records passes → retain confirmed open/ready `Review State` → continue to Deliver's `10. Merge`.

That next step publishes check results and selects `Merge Task Pull Requests`, which confirms repository/base and obtains merge readiness before invoking the merge operation. Readiness alone does not execute or establish a merge, and target review requirements remain relevant. Captured terminal result: ready-state verification succeeds and the merge procedure is the next authorized procedure; no merge outcome was supplied. No restoration or repair is selected on this path.

### 4. Epic ready evidence; target requires a person's approval

Route: Deliver → task-merge recording → `Epic Integration`. At its merge boundary retain current epic/readiness evidence, refresh metadata and validate the published review, then apply `Merge Delivery Pull Request` with delivery kind epic. Its first step reads the target requirements and verified head/authorization. The required-person boundary selects `Merge Result.outcome = human-handoff` and returns without selecting a mutation. `Epic Integration / Human Handoff` provides that result to the reviewer and returns.

Terminal result: human handoff, PR open. No merge attempt, no merged-success readback, no alternate-account or administrative/protection workaround. A current ready/verified handoff is justified; In Review may be claimed only for an actually confirmed board write, with absence/discrepancy reported separately. The supplied captured case does not itself establish a board write. A default-branch target would independently require the same handoff.

### 5. Agent-authorized target; harness refuses execution

With authorization, repository prerequisite and current head/target readiness established, `Merge Delivery Pull Request` selects `Submit Epic Merge` for kind epic. The harness refuses to execute the command, so retain that observed permission-layer refusal; there is no GitHub response. Select `Merge Result.outcome = harness-denial` with verified head/target, refusal and missing permission. Return through `Epic Integration / Harness Denial`.

Terminal result: harness denial, PR open. Report ready-and-verified state only while the evidence remains current. No same-run retry, approval request, GitHub-refusal classification, or merged-success readback. This terminal classified result does not take the unclassified-failure withdrawal path. Existing confirmed review/board state can remain, but neither state may be invented from the command refusal.

### 6. GitHub refuses twice; fresh admissible evidence between attempts

1. With current admitted epic evidence, `Merge Delivery Pull Request` selects `Submit Epic Merge`. GitHub refuses: retain its exact attempted head/target and response as `github-refusal`; do not run the success readback.
2. `Epic Integration / GitHub Refusal`: apply `Hold Epic Review` (read state, mark an open ready PR draft, read back to confirm). Apply `Record Epic Review` requesting In Progress using fresh PR records and an empty review-record list, except for confirmed board absence. Report actual readback/discrepancy.
3. Repeat the entire `Refresh and Validate` step: update the epic base, obtain current criterion verification, refresh delivery records, check epic readiness; repeat review-body/overview work when branch content changes; complete current published agent review/handoff evidence, ready write if draft, fresh metadata and review validation, confirmed In Review request, and exact-head merge readiness. Stated fresh admissible evidence lets this reach the merge boundary. Refresh metadata and validate again for that boundary.
4. Make the single permitted further merge attempt. GitHub refuses again: retain second `github-refusal` and its exact evidence.
5. For that refusal, again hold/confirm draft and request/confirm In Progress as above. Return the refusal. No third attempt and no merged-success readback.

Terminal result: repeated GitHub refusal, PR open; readiness is withdrawn via the owning protocol. Draft and In Progress are justified only by the corresponding successful state confirmations (board absence is reported). The case supplies no cleanup-failure outcome, so the selected cleanup operations are clear, but their successful effects cannot be claimed as real execution in this trial.

For a task rather than the epic context, the same merge artifact has a different owning retry: `Merge Task Pull Requests` updates the task branch and fetches readiness once, then makes one further merge attempt. It does not inherit the epic board-withdrawal protocol merely from sharing the mutation artifact.

### 7. `merged: true` and matching readbacks

`Merge Delivery Pull Request` receives the selected mutation's `{merged:true, message, sha}` response. It then runs `Read Merge Result` for the same identity; confirm merged=true, exact verified head, exact target branch, nonempty merge commit matching the mutation's `sha`. Only then provide `Merge Result.outcome = confirmed-merge` with that head/target/commit.

`Epic Integration / Confirmed Merge` selects `Confirm the Result`: `Read Pull Request State` for the same PR and compare merged state, head, target and merge commit against that result. The supplied matching readbacks permit returning a confirmed integration merge.

Terminal result: confirmed merge at the verified head into the specified target, with the matching merge commit. This supports a merge assertion in the captured interpretation. It does not prove epic/initiative issue closure or final board reconciliation: Task Merge's later closure/sync steps require their own refreshed evidence. No actual merge happened during this reader trial.

## Uncertainties and limits

- Cases 1–3 stop at their captured evidence. Future repair, publication, allowance decisions, repository conditions and mutation outcomes are not fabricated.
- Cases 4–7 are interpreted in the epic integration context supplied by the assignment. Shared artifact behavior and the separate task retry route are identified where relevant.
- “Latest stated state until a stated write/change” governs every additional metadata read: in cases 1–2 the extra pre-restoration read remains ready at B; a read alone does not restore draft or repair stale review evidence.
- Board-item presence, concrete IDs, exact refusal text, criteria files and credentials were not supplied or fetched. Claims about actual board status, actual command success, or real source/issue mutation are outside this evidence.
- The trial establishes document-consumer interpretation and observed read coverage. It is not an end-to-end execution or acceptance test of tracker operations.
