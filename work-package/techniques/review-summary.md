---
metadata:
  version: 1.13.0
---

## Capability

Consolidated review summary in the consolidated review format.

## Inputs

### classified_findings

The findings gathered and classified across code review, test review, validation, and strategic review — the content the summary renders. Each carries the severity it renders at and the `action_tier` it is delivered under.

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

### pr_number

*(optional)* PR number used to compose `{reviewed_code_base_url}` when `{reviewed_code_base_url}` is empty.

## Outputs

### review_summary

The structured consolidated review summary text, organized per the Review Comment Template — executive summary, per-category findings, action items, and severity definitions — verbatim source for the posting step.

### summary_budget_overruns

Every slot in `{review_summary}` whose measured size exceeds its budget in the format's Reference-Don't-Restate table, as `{ slot, measured, budget }` entries. Empty when every slot is within budget.

### summary_completeness_findings

Every way `{review_summary}` disagrees with the reports it renders from, as `{ check, detail }` entries — a designator sequence with a gap, a row whose link resolves to no heading in the report it names, a stated total that differs from the rows counted, a finding with no Action Items entry, a blocking entry naming a finding whose reachability keeps it out of that tier. Empty when the summary accounts for every finding its sources hold.


## Protocol

### 1. Load the Format

- Read the whole-document skeleton from [Review Comment Template](../resources/review-mode.md#review-comment-template). Read each category's findings fragment from that category's own section as it is populated (e.g. [#prior-feedback-triage](../resources/review-mode.md#prior-feedback-triage), [#code-review](../resources/review-mode.md#code-review), [#test-review](../resources/review-mode.md#test-review), [#documentation-review](../resources/review-mode.md#documentation-review), [#validation](../resources/review-mode.md#validation), [#branch-hygiene](../resources/review-mode.md#branch-hygiene), [#strategic-review](../resources/review-mode.md#strategic-review)).

### 2. Read the Merge State

- Apply [view-pr](../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{host_repo_path}`) and read the pull request's merge state before composing anything.
- Where it merged while this review ran, the deliverable is advice on a change already in the base branch, not a request against a change awaiting one. Frame the summary as post-merge advisory and say so in it, so a reader is not asked to act on a decision that has already been taken. A review that discovers this after composing has written the wrong document and rewrites it by hand.

### 3. Resolve the Two Refs

- Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`.
- Resolve `{$eng_publish_ref}`: `{artifact_publish_ref}` when it is non-empty; otherwise `git -C {eng_git_dir} branch --show-current` — never hardcode `main`. This is a branch, so the linked tree carries every artifact the run writes after this render.
- Resolve `{$reviewed_code_base}`: `{reviewed_code_base_url}` when it is non-empty; otherwise Apply [view-pr](../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{component_git_dir}`) and take `{reviewed_code_base_url}` from the op.
- Supply `{eng_publish_ref}` as the ref in every engineering-artifact hyperlink and `{reviewed_code_base}` as the prefix of every reviewed-code citation, per the ref split in [Header Fields](../resources/review-mode.md#header-fields) — that section owns the URL shapes and their slots; this step supplies only the two refs.

### 4. Render the Summary

- Enforce the findings-constraint: every rendered finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` render as the PR's findings; findings on other files render under a separate "pre-existing" grouping.
- Populate the template from `{classified_findings}`: executive summary, per-category findings (code, test, structural analysis, lean-coding audit, documentation, validation, branch hygiene, strategic review), what the change gets right, action items, and severity definitions.
- **Every row of every section comes from `{classified_findings}` and nothing else.** One finding is one row, under the designator its own report defines, in ascending designator order per [Designators](../resources/findings-report.md#designators). A section drawing its order from a second enumeration — a priority list, a remediation order — renders siblings inconsistently, and a row standing for a group of findings hides each of them from the totals and from the Action Items.
- Reference, don't restate: each finding renders as its item designator, `@` locus link, one-line title, and severity only. The designator links to that finding's section in its associated report (the artifact named in the `Reports` header) when one exists, else it renders as plain text; the `@` cell is a hyperlinked `>` onto the pertinent locus — reviewed code under `{reviewed_code_base}` with a line anchor, or the test, document, CI run, or commit the category declares. Descriptions, evidence, and suggestions stay in the linked report artifacts.
- Render the Strategic Review section from the run's cleanup and scope-fit recommendations as a findings table on the shared format.
- Render each Action Items tier from `{classified_findings.action_tier}`, the tier each finding is delivered under per [Action Items](../resources/review-mode.md#action-items).
- Render `What This Change Gets Right` between Strategic Review and Action Items, one bullet per specific strength and no source pointer beside it, per [What This Change Gets Right](../resources/review-mode.md#what-this-change-gets-right); omit the section when the review found none.
- Hold every prose passage to the [Prose Register](../resources/review-mode.md#prose-register) and every caveat to the [Caveat Form](../resources/review-mode.md#caveat-form).
- Render the header fields in order — `PR`, then `Plan` on its own line immediately after `PR` (linking the planning folder's `README.md`, the work package's canonical home, via the engineering-artifacts base URL with `{eng_publish_ref}`), then `Activities`, `Reports`, and `Date`. Every `Plan`, `Reports`, and `Activities` hyperlink is mandatory — the posting step posts them verbatim.
- Render the `Reports` field — one hyperlinked entry per report this run produced, each linking the report name to its artifact under the engineering-artifacts base URL with `{eng_publish_ref}`. Include an entry only for a report actually produced this run; omit categories with no report. Each report's concrete artifact filename and content are owned by the technique that produced it — this step iterates over whatever reports were produced, it does not enumerate them.
- Render the `Activities` field: list each contributing review activity once and hyperlink it to its section in the activities README, using the base URL from the [Header Fields](../resources/review-mode.md#header-fields) sub-section of the Review Comment Template — never link an entry to a technique file or to an activity's raw `.yaml`, and never split one activity into per-technique entries. The activity-to-anchor mapping is supplied by the rendering step at runtime (e.g. Post-Implementation Review → `#10-post-implementation-review`, Validate → `#11-validate`, Strategic Review → `#12-strategic-review`).
- Render the Prior Feedback Triage section from `{prior_feedback_triage}`: one row per prior comment, its `Disposition` cell holding one of the three values that column admits and nothing else, and carry each Confirmed blocker-class entry into the Action Items as a blocking item.
- Apply `{rating_cap}` to the Overall Rating per the rating-cap carve-in below.
- Render the attribution footer that closes the format template — Apply [viewer-login](../../meta/techniques/github-cli-protocol/viewer-login.md) and substitute `{viewer_login}` for `{user}`; Apply [view-pr](../../meta/techniques/github-cli-protocol/view-pr.md)(*repo_path*=`{component_git_dir}`) and use the short form of `{head_sha}` for `{sha}` — so `{review_summary}` carries it and the posted comment reaches the PR with it intact.
- Produce `{review_summary}` as the rendered text.
- Follow the loaded format exactly — do not invent a parallel structure; the review-mode resource is the authoritative owner of the format. `{review_summary}` is the verbatim source the posting step (`update-pr::post-review-comment`) emits — the bytes bound here are the bytes posted.

### 5. Measure Against the Budget

- Measure each budgeted slot of `{review_summary}` against the table in [Reference, Don't Restate](../resources/review-mode.md#reference-dont-restate): every `Finding` cell, every category section's prose outside its table, the Executive Summary, every Action Items entry, and the whole-summary line count.
- Record every slot over its budget as a `{summary_budget_overruns}` entry with its measured size and its budget.
- Cut each overrun by moving the absorbed content to the report section that owns it and leaving the link, then re-measure — a shorter paraphrase of report content is still restatement.
- Emit `{summary_budget_overruns}`, empty when every slot is within budget.

### 6. Check the Summary Against Its Sources

Five checks, each mechanical against the reports the summary renders from, and each catching a class a reader would otherwise catch after publication.

- **Each section's designator sequence is complete and gapless.** Enumerate the designators the section's report defines and compare the sets, per [Delivery Completeness](../resources/findings-report.md#delivery-completeness) — a missing designator is a finding that reached no reader, and a range read off the rows cannot see one.
- **Each row's link resolves to a heading that exists in the report the row names.** Resolve the anchor against that report's headings on disk, per [Anchor Integrity](../resources/findings-report.md#anchor-integrity). Generating the designator and its destination from one value cannot see a mismatch, so the destination is checked against the file.
- **Every total stated in prose equals the rows counted.** Re-derive each from the rendered table rather than from the figure the source report asserts.
- **Every finding in a table has an Action Items entry**, and every Action Items entry names a designator a table holds.
- **Every `Must Address (Blocking)` entry names a finding whose reachability admits that tier** — `reachable` or `conditional`, per [Action Items](../resources/review-mode.md#action-items). Read the value off the finding in the report the entry names.
- Record each disagreement as a `{summary_completeness_findings}` entry naming the check and what it found; repair the summary and re-run the checks. Emit the list, empty when every check passes.

## Rules

### rating-cap-carve-in

When `{rating_cap}` is the request-changes tier because a prior blocker-class concern was dispositioned Confirmed during triage, but this review's own findings refute that concern (the consolidated analysis shows the mechanism does not fail as claimed, with evidence in `{classified_findings}` or a Refuted disposition backed by this review's independent analysis), lift the cap — the Overall Rating follows `{classified_findings}` only. When the cap is not lifted, hold the Overall Rating at or below Request Changes — never Approve or Comment Only — even if the review's own findings are light.

The cap also lifts where the review found no code defect and every action it asks for is something the author says rather than something the author changes — a confirmation, a rationale, an operator check. Request Changes names a change the author must make, so a review asking for none states Comment Only directly instead of reaching a tier it does not mean and relying on the approval gate to be overridden back.
