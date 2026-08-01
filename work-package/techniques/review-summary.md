---
metadata:
  version: 1.9.0
---

## Capability

Consolidated review summary in the consolidated review format.

## Inputs

### classified_findings

The findings gathered and classified across code review, test review, validation, and strategic review — the content the summary renders.

### prior_feedback_triage

The triage of prior PR feedback — each prior comment dispositioned Confirmed / Refuted / Superseded — rendered as the summary's Prior Feedback Triage section.

### review_ticket_ref

*(optional)* The tracker ticket the reviewed PR addresses, named in the summary so the review is traceable to the work it judges.

### rating_cap

The ceiling the Overall Rating may not exceed, derived from the prior-feedback triage. When set to the request-changes tier (an unaddressed external blocker), the rendered Overall Rating is held at or below Request Changes unless the rating-cap carve-in lifts it.

### changed_files

The authored surface — the PR's changed-files set. Used to enforce the findings-constraint at consolidation.

### artifact_publish_ref

*(optional)* The engineering checkout's branch name, the ref engineering-artifact hyperlinks resolve against; empty when no publish ref has been produced.

### reviewed_code_base_url

*(optional)* Permanent blob-URL prefix for citing the reviewed code at the commit the review verified — repository host, owner, name, `blob`, and the full head sha; empty when the review produced no baseline.

### host_repo_path

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

## Outputs

### review_summary

The structured consolidated review summary text, organized per the Review Comment Template — executive summary, per-category findings, action items, and severity definitions — verbatim source for the posting step.

### summary_budget_overruns

Every slot in `{review_summary}` whose measured size exceeds its budget in the format's Reference-Don't-Restate table, as `{ slot, measured, budget }` entries. Empty when every slot is within budget.


## Protocol

### 1. Load the Format

- Read the whole-document skeleton from [Review Comment Template](../resources/review-mode.md#review-comment-template). Read each category's findings fragment from that category's own section as it is populated (e.g. [#prior-feedback-triage](../resources/review-mode.md#prior-feedback-triage), [#code-review](../resources/review-mode.md#code-review), [#test-review](../resources/review-mode.md#test-review), [#documentation-review](../resources/review-mode.md#documentation-review), [#validation](../resources/review-mode.md#validation), [#branch-hygiene](../resources/review-mode.md#branch-hygiene), [#strategic-review](../resources/review-mode.md#strategic-review)).

### 2. Resolve the Two Refs

- Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`.
- Resolve `{$eng_publish_ref}`: `{artifact_publish_ref}` when it is non-empty; otherwise `git -C {eng_git_dir} branch --show-current` — never hardcode `main`. This is a branch, so the linked tree carries every artifact the run writes after this render.
- Resolve `{$reviewed_code_base}`: `{reviewed_code_base_url}` when it is non-empty; otherwise compose it from `gh api repos/{owner}/{repo}/pulls/{pr_number} --jq '{headRefOid:.head.sha,headRepository:.head.repo.name,headRepositoryOwner:.head.repo.owner.login}'`.
- Supply `{eng_publish_ref}` as the ref in every engineering-artifact hyperlink and `{reviewed_code_base}` as the prefix of every reviewed-code citation, per the ref split in [Header Fields](../resources/review-mode.md#header-fields) — that section owns the URL shapes and their slots; this step supplies only the two refs.

### 3. Render the Summary

- Enforce the findings-constraint: every rendered finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` render as the PR's findings; findings on other files render under a separate "pre-existing" grouping.
- Populate the template from `{classified_findings}`: executive summary, per-category findings (code, test, documentation, validation, branch hygiene, strategic review), what the change gets right, action items, and severity definitions.
- Reference, don't restate: each finding renders as its item designator, `@` locus link, one-line title, and severity only. The designator links to that finding's section in its associated report (the artifact named in the `Reports` header) when one exists, else it renders as plain text; the `@` cell is a hyperlinked `>` onto the pertinent locus — reviewed code under `{reviewed_code_base}` with a line anchor, or the test, document, CI run, or commit the category declares. Descriptions, evidence, and suggestions stay in the linked report artifacts.
- Render the Strategic Review section from the run's cleanup and scope-fit recommendations as a findings table on the shared format, and carry each recommendation into the Action Items tier its severity assigns.
- Render `What This Change Gets Right` between Strategic Review and Action Items, one bullet per specific strength with its `@` locus link; omit the section when the review found none.
- Hold every prose passage to the format's prose register and caveat form: plain language, one claim per sentence, at most one hedge, at most one symbol and one location per sentence, and each caveat one line plus a link to the report section holding its basis.
- Render the header fields in order — `PR`, then `Plan` on its own line immediately after `PR` (linking the planning folder's `README.md`, the work package's canonical home, via the engineering-artifacts base URL with `{eng_publish_ref}`), then `Reviewers`, `Reports`, and `Date`. Every `Plan`, `Reports`, and reviewer hyperlink is mandatory — the posting step posts them verbatim.
- Render the `Reports` field — one hyperlinked entry per report this run produced, each linking the report name to its artifact under the engineering-artifacts base URL with `{eng_publish_ref}`. Include an entry only for a report actually produced this run; omit categories with no report. Each report's concrete artifact filename and content are owned by the technique that produced it — this step iterates over whatever reports were produced, it does not enumerate them.
- Render the Reviewers field: list each contributing review *activity* once and hyperlink it to its section in the activities README, using the base URL from the [Header Fields](../resources/review-mode.md#header-fields) sub-section of the Review Comment Template — never link a reviewer to a technique file or to an activity's raw `.yaml`, and never split one activity into per-technique entries. The activity-to-anchor mapping is supplied by the rendering step at runtime (e.g. Post-Implementation Review → `#10-post-implementation-review`, Validate → `#11-validate`, Strategic Review → `#12-strategic-review`).
- Render the Prior Feedback Triage section from `{prior_feedback_triage}`: one row per prior comment with its Confirmed / Refuted / Superseded disposition, and carry each Confirmed blocker-class entry into the Action Items as a blocking item.
- Apply `{rating_cap}` to the Overall Rating per the rating-cap carve-in below.
- Render the attribution footer that closes the format template — resolving `{user}` and `{sha}` per the format's instruction — so `{review_summary}` carries it and the posted comment reaches the PR with it intact.
- Produce `{review_summary}` as the rendered text.
- Follow the loaded format exactly — do not invent a parallel structure; the review-mode resource is the authoritative owner of the format. `{review_summary}` is the verbatim source the posting step (`update-pr::post-review-comment`) emits — the bytes bound here are the bytes posted.

### 4. Measure Against the Budget

- Measure each budgeted slot of `{review_summary}` against the table in [Reference, Don't Restate](../resources/review-mode.md#reference-dont-restate): every `Finding` cell, every category section's prose outside its table, the Executive Summary, every Action Items entry, and the whole-summary line count.
- Record every slot over its budget as a `{summary_budget_overruns}` entry with its measured size and its budget.
- Cut each overrun by moving the absorbed content to the report section that owns it and leaving the link, then re-measure — a shorter paraphrase of report content is still restatement.
- Emit `{summary_budget_overruns}` so the binding activity can gate on it; leave it empty when every slot is within budget.

## Rules

### rating-cap-carve-in

When `{rating_cap}` is the request-changes tier because a prior blocker-class concern was dispositioned Confirmed during triage, but this review's own findings refute that concern (the consolidated analysis shows the mechanism does not fail as claimed, with evidence in `{classified_findings}` or a Refuted disposition backed by this review's independent analysis), lift the cap — the Overall Rating follows `{classified_findings}` only. When the cap is not lifted, hold the Overall Rating at or below Request Changes — never Approve or Comment Only — even if the review's own findings are light.
