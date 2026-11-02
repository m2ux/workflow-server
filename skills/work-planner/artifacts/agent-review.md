# Agent Review

Published evidence of an agent's review of one integration diff, an epic's review pull request or a hot-fix's delivering pull request, and its acceptance evidence.

## Operations

### *Produce* Agent Review

A review record for the exact integration revision.

**Inputs:** Fresh pull request metadata, checkout, the criteria the pull request delivers, validation evidence and the planning record destination.

1. Read the complete diff from the target to the integration head, the affected definitions and callers, and every criterion's verification evidence. Inspect behavior and failure paths; test counts alone do not establish review completion.
2. Record findings with severity and disposition. Fix each finding [Review Record](#review-record) requires fixed on the reviewed branch, run appropriate regression checks, and repeat the review against the resulting head. A nonblocking deferred finding names its ticket.
3. Write a JSON list containing the [Review Record](#review-record), with the full reviewed head and target SHAs, the `base_ref` a hot-fix's record carries, the scope actually inspected, findings and validation results. An empty findings list states that the review found no defect.
4. Return the record for publication on the engineering branch. Evidence lives outside the reviewed branch, so publishing it does not change the head it identifies.

### *Check* Agent Review

The current review's handoff eligibility.

**Inputs:** Fresh REST pull request JSON and the published JSON review records fetched from the linked planning record.

1. Run [Validate Agent Review](#validate-agent-review) with those files. Missing or stale evidence, an incomplete record or an unresolved finding blocks handoff.
2. Return the result and the head and target SHAs checked. Refresh both tips immediately before ready, board and user-handoff actions; a tip change that leaves the record no longer current, as [Review Record](#review-record) states, requires another review.

## Fields

### Review Record

Each record contains `pull_request` (the full GitHub URL), `head` and `base` (full commit SHAs), `url` (the published HTTPS record URL), `reviewer`, `reviewed_at`, `scope`, `criteria`, `validation` and `findings`. The scope describes the full integration diff and inspected callers; criteria and validation describe the evidence inspected and its results. The pull request body links the published record.

Each finding contains `description`, `severity` (`blocking` or `nonblocking`) and `disposition` (`open`, `fixed` or `deferred`). A fixed finding has an HTTPS `evidence` link; a deferred finding has an HTTPS `ticket` link. Blocking findings, and every finding on a hot-fix's delivering pull request, must be fixed and reviewed at the recorded head. Every finding has a completed disposition before handoff. A record on a hot-fix's delivering pull request also carries `base_ref`, the name of its base branch. A record is current while it names the pull request's head and base SHAs. One on a hot-fix's delivering pull request is current while it names its head SHA and its base branch: its reviewed change is the head against its target, which a target moving on leaves as it was and a retarget does not. The last record for the same revision is authoritative.

## Commands

### Validate Agent Review

Checks published review evidence against a freshly fetched integration pull request.

**Inputs:** REST pull request JSON and a JSON list of published review records.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/agent_review.py --pr '<pull-request-json-file>' --agent-reviews '<review-records-file>'
```
