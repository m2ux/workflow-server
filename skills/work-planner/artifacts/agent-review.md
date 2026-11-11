# Agent Review

Published evidence of an agent's review of one integration diff, an epic's review pull request or a [kind-tagged](#review-record) pull request, and its acceptance evidence.

## Operations

### Produce Agent Review

A review record for the exact integration revision.

#### 1. Review Complete Integration Diff

- Read the complete target-to-head diff, affected definitions and callers, and every criterion’s verification evidence using the [Review Inputs](#review-inputs). Inspect behavior and failure paths; test counts alone do not establish review completion.
- Classify each observed problem using [Review Scope](#review-scope).

#### 2. Resolve Review Findings

- Record findings with severity and disposition. A nonblocking deferred finding names its ticket.
- For each excluded observation, Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ") for a new arising issue with no agent-engineering prefix, placed as the artifact of its [registered kind](work-kind.md#registration) states, then record the exclusion in the [Review Record](#review-record) `scope`, outside the findings collection.
- An observation with an unresolved classification, missing scope evidence or an unsaved arising issue remains a finding with its required disposition.

- When a blocking finding, or a finding the [kind review rule](#review-record) holds to a fix, requires one:
- Fix every required finding on the reviewed branch.
- Run appropriate regression checks.
- Apply [Produce Agent Review](#produce-agent-review "ƒ") for the resulting head with fresh metadata and updated validation evidence, then provide its review record to the requester and stop.

- Blocking findings, and each finding a kind review rule holds to a fix, must be fixed and reviewed at the recorded head. Every finding has a completed disposition before handoff.

#### 3. Write Revision Review Record

Write a JSON list containing the [Review Record](#review-record), with the full reviewed head and target SHAs, each field a kind review rule adds, the scope actually inspected, findings and validation results. An empty findings list states that the review found no in-scope defect.

#### 4. Provide Review Evidence

Provide the record for publication on the engineering branch. Evidence lives outside the reviewed branch, so publishing it does not change the head it identifies.

## Commands

### Validate Agent Review

Check published review evidence against a freshly fetched integration pull request and provide [Review Eligibility](#review-eligibility "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/agent_review.py &#92;
  --pr '[**&lt;pull-request-json-file&gt;**](#pull-request-record "○")' &#92;
  --agent-reviews '[**&lt;review-records-file&gt;**](#published-reviews "○")'
</pre></big>

- Missing or stale evidence, an incomplete record or an unresolved finding blocks handoff.
- Refresh both pull request tips immediately before ready, board and user-handoff actions. A tip change that invalidates [Review Record](#review-record) requires another review.

## Fields

### Review Record

Each record contains `pull_request` (the full GitHub URL), `head` and `base` (full commit SHAs), `url` (the published HTTPS record URL), `reviewer`, `reviewed_at`, `scope`, `criteria`, `validation` and `findings`. The scope describes the full integration diff, inspected callers and each excluded observation with its scope evidence and arising issue link; criteria and validation describe the evidence inspected and its results. The pull request body links the published record.

Each finding contains `description`, `severity` (`blocking` or `nonblocking`) and `disposition` (`open`, `fixed` or `deferred`). A fixed finding has an HTTPS `evidence` link; a deferred finding has an HTTPS `ticket` link. A pull request is kind-tagged when its title opens with the tag of a [registered kind](work-kind.md#registration). A record is current while it names the pull request's head and base SHAs. A kind-tagged pull request takes the kind review rule its kind's Review Before Merge operation states: the record fields that hold its record current, in place of the head and base SHAs, and the findings it holds to a fix beside blocking ones. The last record for the same revision is authoritative.

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

## Guidance

### Review Scope

Findings cover defects introduced by the change, change-related defects and risks that compromise affected callers. A pre-existing defect remains in scope when the change exposes it or depends on its faulty behavior.

An unrelated pre-existing observation is outside findings only when evidence establishes its earlier existence and independence from changed behavior and affected callers. That evidence identifies the observed problem, source revisions and relevant call-path comparison; it accompanies a linked arising issue in the record's `scope`, outside findings.
