# Agent Review

Published evidence of an agent's review of one integration diff, an epic's review pull request or a hot-fix's delivering pull request, and its acceptance evidence.

## Operations

### Produce Agent Review

A review record for the exact integration revision.

#### 1. Review Complete Integration Diff

Read the complete target-to-head diff, affected definitions and callers, and every criterion’s verification evidence using the [Review Inputs](#review-inputs "○"). Inspect behavior and failure paths; test counts alone do not establish review completion.

#### 2. Resolve Review Findings

- Record findings with severity and disposition. A nonblocking deferred finding names its ticket.

- When the findings require fixes under [Review Record](#review-record "●"):
- Fix every required finding on the reviewed branch.
- Run appropriate regression checks.
- Apply [Produce Agent Review](#produce-agent-review "ƒ") with fresh pull request metadata for the resulting head, the same checkout, criteria, updated validation evidence and planning destination, and provide that review’s record.

#### 3. Write Revision Review Record

Write a JSON list containing the [Review Record](#review-record "●"), with the full reviewed head and target SHAs, the `base_ref` a hot-fix's record carries, the scope actually inspected, findings and validation results. An empty findings list states that the review found no defect.

#### 4. Provide Review Evidence

Provide the record for publication on the engineering branch. Evidence lives outside the reviewed branch, so publishing it does not change the head it identifies.

### Check Agent Review

The current review's handoff eligibility.

#### 1. Validate Published Review Evidence

Apply [Validate Agent Review](#validate-agent-review "ƒ") with the [Pull Request Record](#pull-request-record "○") and [Published Reviews](#published-reviews "○"). Missing or stale evidence, an incomplete record or an unresolved finding blocks handoff.

#### 2. Provide Checked Revision

Provide [Review Eligibility](#review-eligibility "●") and the head and target SHAs checked. Refresh both tips immediately before ready, board and user-handoff actions; a tip change that invalidates the record under [Review Record](#review-record) requires another review.

### Validate Agent Review

Checks published review evidence against a freshly fetched integration pull request.

#### 1. Validate Agent Review

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/agent_review.py \
  --pr '[**&lt;pull-request-json-file&gt;**](#pull-request-record "○")' \
  --agent-reviews '[**&lt;review-records-file&gt;**](#published-reviews "○")'
</pre></big>

#### 2. Provide Validated Agent Review

Provide [Review Eligibility](#review-eligibility "●") to the requester.

## Fields

### Review Record

Each record contains `pull_request` (the full GitHub URL), `head` and `base` (full commit SHAs), `url` (the published HTTPS record URL), `reviewer`, `reviewed_at`, `scope`, `criteria`, `validation` and `findings`. The scope describes the full integration diff and inspected callers; criteria and validation describe the evidence inspected and its results. The pull request body links the published record.

Each finding contains `description`, `severity` (`blocking` or `nonblocking`) and `disposition` (`open`, `fixed` or `deferred`). A fixed finding has an HTTPS `evidence` link; a deferred finding has an HTTPS `ticket` link. Blocking findings, and every finding on a hot-fix's delivering pull request, must be fixed and reviewed at the recorded head. Every finding has a completed disposition before handoff. A record on a hot-fix's delivering pull request also carries `base_ref`, the name of its base branch. A record is current while it names the pull request's head and base SHAs. One on a hot-fix's delivering pull request is current while it names its head SHA and its base branch: its reviewed change is the head against its target, which a target moving on leaves as it was and a retarget does not. The last record for the same revision is authoritative.

### Review Inputs

The fresh pull request metadata, checkout, delivered criteria, validation evidence and planning-record destination supplied for review.

### Pull Request Record

One freshly fetched complete REST pull request JSON record, at its supplied local file path.

### Published Reviews

The JSON list of published review records fetched from the linked planning record, at its supplied local path.

### Review Eligibility

The validation result, checked head and target SHAs, and any missing, stale or unresolved evidence.

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.
