---
name: review-mode
description: Reference content for a structured pull-request review — the review comment template, and one section per review category carrying that category's findings fragment and population rules. Organized for per-section delivery.
metadata:
  version: 1.18.0
  order: 24
  legacy_id: 24
---


# Overview

The reference content for a structured pull-request review, organized by review category.

Each **Review Category** has its own section under [Review Categories](#review-categories) carrying that category's findings fragment and population rules, so the technique that renders the category can fetch only its section. The [Review Comment Template](#review-comment-template) holds the whole-document skeleton with per-category placeholders, the shared header/table rules, and the cross-category scales (severity, review-type, category reference) for the consolidating step.

## Review Comment Template

This section is the creation guide for the consolidated review comment posted to the PR. It carries the whole-document skeleton — header, per-category `{placeholder}` markers, Action Items, attribution footer — plus the rules for filling each part. The consolidating step fills each `{category}` placeholder from that category's own section; category techniques fetch only their own category section, not this template.

The sub-sections decompose the rules so a consumer fetches only the one it needs:

- [Header Fields](#header-fields) — the `PR` / `Plan` / `Activities` / `Reports` / `Date` header and the link conventions that govern it
- [Table Format](#table-format) — the shared findings-table shape across all categories
- [Reference, Don't Restate](#reference-dont-restate) — findings cited by ID, never reproduced, within a declared budget
- [Prose Register](#prose-register) — where the summary's prose passages take their sentence-level register from
- [Caveat Form](#caveat-form) — the one-line claim-plus-link shape for caveats
- [Action Items](#action-items) — the prioritized checklist consolidation
- [Skeleton](#skeleton) — the whole-document template itself
- [Attribution Footer](#attribution-footer) — the posted-verbatim footer and its variable resolution

### Header Fields

The summary header carries `PR`, `Plan`, `Activities`, `Reports`, and `Date` fields.

**Findings constraint:** every finding names a file within the authored surface (the PR's changed-files list). Findings on files in that set form the PR's findings; findings on other files form a separate "pre-existing" grouping.

**Reports list:** The header includes a `Reports` field naming each report the summary links to, as hyperlinks. It is the summary's single home for those links: a findings section carries no `Details:` line of its own, because the reader has already met the list in the header and reads a repeat as a different link worth following. Each entry links the report by name to its artifact, under the engineering-artifacts base URL:

```
https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/{ARTIFACT_PUBLISH_REF}/{ENG_PLANNING_PATH}/{PLANNING_FOLDER}/
```

`{ARTIFACT_PUBLISH_REF}` is the **branch** the linked artifacts are published on, so the linked tree carries whatever the run adds after the link is written — close-out, retrospective, session trace and follow-ups all land on that branch and resolve from the same URL. Resolve `{ENG_REPO_OWNER}` and `{ENG_REPO_NAME}` from the engineering checkout's remote; never hardcode `main`. `{ENG_PLANNING_PATH}` is relative to the root of the checkout that ref belongs to: `artifacts/planning` when `.engineering/` is itself a checkout, and `.engineering/artifacts/planning` when the artifacts live directly in the product checkout. The set of reports and their artifact filenames are supplied by the rendering step — one entry per review category the run produced — not fixed by this template.

**Ref split — engineering artifacts by branch, reviewed code by sha:** every engineering-artifact link (`Plan`, `Reports`, a designator's report anchor) carries `{ARTIFACT_PUBLISH_REF}`. Every citation of the reviewed code carries the reviewed head sha instead, as a permanent blob URL under the reviewed repository:

```
{REVIEWED_CODE_BASE_URL}/{path}#L{line}
```

`{REVIEWED_CODE_BASE_URL}` is the permanent blob-URL prefix at the PR head commit the review verified, supplied by the rendering step. A code citation resolved against a branch moves under the reader; an engineering-artifact link pinned to a sha goes stale as soon as the run writes another report.

Section titles (a per-category findings heading) must NOT be hyperlinks — the report links live in the header instead.

**Plan link:** Immediately after the `PR` line, the header carries a `Plan` field linking the planning folder's `README.md` — the work package's canonical home — built from the same engineering-artifacts base URL as the `Reports` field, with `README.md` appended.

**Activities list:** The `Activities` field lists each review activity that contributed findings, with each name hyperlinked to that activity's section in the activities README. The field names activities rather than people: the summary is posted into a pull request, where a reader takes `Reviewers` to mean the people whose approval the change waits on, and these entries resolve into a workflow-definition repository instead. When one activity runs several review techniques it appears once; never split it into per-technique entries, never link an entry to a technique file, and link to the activity's README section rather than its raw `.yaml`. The activities README lives in the workflows repository (a submodule), so these links use the workflow repo base URL:

```
https://github.com/{WORKFLOW_REPO_OWNER}/{WORKFLOW_REPO_NAME}/blob/{WORKFLOW_BRANCH}/work-package/activities/README.md
```

Resolve `{WORKFLOW_REPO_OWNER}`, `{WORKFLOW_REPO_NAME}`, and `{WORKFLOW_BRANCH}` from the `.gitmodules` entry for the workflows submodule (typically `.engineering/workflows`). Each entry links to its activity's heading anchor; the rendering step supplies the activity-to-anchor mapping for the activities it links.

### Table Format

Every findings table, across all categories, follows one shape — four columns in this order:

| Column | Holds |
|--------|-------|
| `#` | The item designator (the category's prefix plus its number). Hyperlinked to the finding's own heading anchor within its report when the category has a report in the `Reports` header; plain text when it has none. |
| `Finding` | One line naming the finding, within the [Reference, Don't Restate](#reference-dont-restate) budget. |
| `Severity` | A value from [Severity Definitions](#severity-definitions). |
| `@` | The source locus, rendered as a hyperlinked ASCII `>` and nothing else. Final position, so the designator and the finding text a reader scans down sit side by side. |

Tables list only non-passing findings — positive items belong in [What This Change Gets Right](#what-this-change-gets-right).

**A table opens with one line naming its subject** — what part of the change it examines, not how many rows it holds or which designators fall in it. The rows sit beneath the line, so a count restates them and goes stale on the next one added.

The `@` cell is `[>](url)`, never the filename, path, test name, or run label as link text: filename link text sets the column to the width of the longest path and wraps every other cell on the row. The link target is whatever locus the category declares (code blob URL, test, document, CI run, commit) and every one resolves at the ref the ref-split assigns it under [Header Fields](#header-fields). Validate each `@` target against the actual source at that ref before inclusion; line numbers carried over from earlier analysis are re-read, not trusted.

The item column header is `Finding` in every category's table. Prior Feedback Triage is the one carve-out on shape: its `#` links the prior comment thread rather than a report section, it carries no `@` column, and it keeps a `Disposition` column as its right-most column. No other table carries `Disposition` — the [Action Items](#action-items) tiers already express it.

**One free-prose column per table.** A posted review body renders in a narrow fixed-width column, so two columns of prose compete for the same width and both wrap on every row. `Finding` is that column. Every other column holds a short closed value — a designator, a link glyph, a severity, a classification, an author login — and a column whose values grow into phrases has stopped being a column: state the qualification in the linked report, which has room for it.

### Reference, Don't Restate

The summary references each finding by designator, one-line title, `@` link, and severity ONLY. Descriptions, evidence, reproduction and suggestions live in the linked report artifacts (`Reports` header).

Budget, so the rule is checkable rather than aspirational:

| Slot | Budget |
|------|--------|
| A `Finding` cell | one line, at most 15 words, no sentence-ending punctuation, no code fence, no line-number list |
| A category section's prose outside its table | at most one line of scope; the report is reached from the `Reports` header |
| Executive Summary | at most 2 sentences, plus the `Overall Rating` line |
| An Action Items entry | one line naming the fix and its designator |
| The whole summary | at most 120 lines |

A passage that exceeds its budget is over-budget because it has absorbed content a report already owns; the fix is the link, never a shorter paraphrase of the same content.

### Prose Register

Every prose passage — Executive Summary, section scope lines, Action Items entries, caveats — holds to [Prose](../../meta/resources/writing-register.md#prose) in the Artifact Writing Register.

### Caveat Form

A caveat is one line: the claim, then a link to the report section holding its basis and any procedure that would confirm or refute it. The basis stays in the report — [Reference, Don't Restate](#reference-dont-restate) governs caveats exactly as it governs findings.

```markdown
- Storage growth is bounded only while the close path runs — [basis and confirmation procedure]({report-url}#storage-growth).
```

### What This Change Gets Right

Findings tables carry only non-passing items, so this section is the home for what the change does well. It sits between Strategic Review and Action Items.

One bullet per item: what the change gets right, in the [Prose Register](#prose-register). Specific, not generic — "the close path clears the storage record it opened" earns a bullet; "code is well structured" does not. Omit the section when the review found nothing above that bar.

The bullets carry no source pointer: each claim is about the change's design rather than about a line, and stands on its own at that altitude.

```markdown
### What This Change Gets Right

- The governance-close path clears every record it opened
- Migration is idempotent, so a partial upgrade re-runs safely
```

### Action Items

A separate Action Items section at the end consolidates all actionable findings from every table into prioritized tiers with interactive checkboxes. Every non-passing finding from every table must appear as a checklist item. Cross-reference findings using the category prefixes to avoid GitHub auto-linking `#N` as issue references.

**`Must Address (Blocking)` admits a finding whose `Reachability` is `reachable` or `conditional`**, on the value set under [Reachability](./findings-report.md#reachability). At `parameter-gated`, `privileged-action`, or `unreachable`, a finding is a hardening recommendation whatever its impact, and enters no tier above `Should Address (Recommended)`. Severity places a finding within the tiers reachability leaves open to it.

An item carrying no finding block tiers on its severity alone: a validation diagnostic is a failure already observed rather than a state predicted, and a Confirmed blocker-class entry reaches Blocking on its disposition, per [Prior Feedback Triage](#prior-feedback-triage).

### Category Reference

Review mode produces review-specific variants of the standard planning artifacts. The rendering and persist steps name the concrete artifacts they write; this table summarizes the content difference per review category, not the authoritative filenames.

| Review Category | Standard Mode | Review Mode |
|-----------------|---------------|-------------|
| Design Philosophy | Problem classification | + Ticket completeness assessment |
| Implementation Analysis | Current state | **Pre-change** baseline state |
| Work-package plan | Implementation tasks | Retrospective plan (reference only) |
| Code Review | Review findings | Same format, external PR focus |
| Test Review | Test quality | Same format, document gaps |
| Strategic Review | Cleanup applied | Cleanup **recommendations** |

### Severity Definitions

This is the render scale for the summary and for every report that states findings; the constraints on using it are under [Severity](./findings-report.md#severity).

| Severity | Merge Blocker? | Expectation |
|----------|----------------|-------------|
| Critical | Yes | Must fix before merge |
| High | Recommended | Should fix before merge |
| Medium | No | Can be follow-up PR |
| Low | No | Nice to have |

Findings are classified on the classification scale (Critical / Major / Minor / Nit / Informational) and rendered on the summary scale above. The render map preserves the classified severity end to end — a finding classified above "safe" renders above "safe":

| Classified severity | Renders as |
|---------------------|------------|
| Critical | Critical |
| Major | High |
| Minor | Medium |
| Nit | Low |
| Informational | (omitted from the tables — recorded in the report only) |

A correct-but-harmful finding (one classified Major or Critical on an impact axis such as unbounded state growth, economic/spam, liveness/halt, or migration/upgrade) therefore renders at High or Critical, and reaches the Action Items at the tier [Action Items](#action-items) admits for that severity and its reachability.

### Review Type Selection

The Overall Rating rendered in the summary maps to the posted review type:

| Overall Rating | Review Type |
|----------------|-------------|
| Request Changes | `request-changes` |
| Comment Only | `comment` |
| Approve | `approve` |


### Skeleton

```markdown
## PR Review

**PR**: #XXX - Title  
**Plan**: [work package README](.../planning/{PLANNING_FOLDER}/README.md)  
**Activities**: [each contributing review activity linked to its section in the activities README under `{workflow_base}/activities/README.md`]  
**Reports**: `{reports}` — one hyperlinked entry per report the run produced, supplied by the rendering step  
**Date**: YYYY-MM-DD

### Executive Summary

[1-2 sentence overall assessment, naming what the change does and where it stands — no finding counts and no severity tallies, which the tables below already hold]

**Overall Rating**: [Approve / Request Changes / Comment Only]

---

{prior_feedback_triage}

---

{code_review_findings}

---

{test_review_findings}

---

{structural_analysis_findings}

---

{lean_coding_audit_findings}

---

{documentation_review}

---

{validation_findings}

---

{branch_hygiene}

---

{strategic_review}

---

{what_this_change_gets_right}

---

### Action Items

**Must Address (Blocking)**:
- [ ] [blocking finding] (PF-1)

**Should Address (Recommended)**:
- [ ] [recommended finding] (DR-1)

**Could Address (Suggested)**:
- [ ] [suggested finding] (CR-2)

**Nice to Have (Optional)**:
- [ ] [optional finding] (VF-1)

---

*Posted by an automated review agent on behalf of @{user}. The recommendation reflects an independent re-verification at head `{sha}`; the maintainers retain full discretion over disposition.*
```

### Attribution Footer

The attribution footer is the last block of the rendered summary and is posted verbatim as part of the review comment. `{user}` is the authenticated viewer's login and `{sha}` the short form of the reviewed head's commit hash.

# Review Categories

## Design Philosophy

**Prefix:** — (narrative; no findings table)

Review-mode design philosophy adds a ticket-completeness assessment to the standard problem classification. This category is narrative, not a findings table — it feeds the Executive Summary rather than a per-category section of the consolidated comment.

**Population:** assess whether the ticket requirements are complete and unambiguous enough to judge the PR against; note gaps that force assumptions. Carries forward into the Implementation Analysis baseline.

## Implementation Analysis

**Prefix:** — (narrative; baseline reference, no findings table in the comment)

Review-mode implementation analysis documents the **pre-change** baseline state and the expected changes against requirements. It is the yardstick the other categories evaluate the PR against; it does not render a findings table in the comment.

### Expected Changes Document

Create a mental model of what the ideal implementation would look like:

```markdown
## Expected Changes (Review Mode)

Based on ticket [PM-XXXXX] requirements:

### Files Expected to Change
- `src/module/component.rs` - Add new handler for XYZ
- `tests/module_test.rs` - Add coverage for new behavior

### Expected Behavior Changes
1. System should now support [capability] when [condition]
2. Error handling for [edge case] should return [specific error]

### Expected Test Coverage
- Unit tests for new handler
- Integration test for end-to-end flow
- Edge case coverage for [scenarios]
```

## Prior Feedback Triage

**Prefix:** `PF`

Disposition of every prior comment and review on the PR (human and bot), determined before independent analysis. The `#` column links the prior comment thread (each row is a prior comment, not a finding with a report section). A Confirmed blocker-class entry caps the Overall Rating unless the review's own findings refute it (the rating-cap carve-in).

**Population:** one row per prior comment carrying its disposition; carry each Confirmed blocker-class entry into Action Items as blocking. This table is the [Table Format](#table-format) carve-out: no `@` column, and `Disposition` right-most.

`Disposition` is a classification with exactly three values — `Confirmed`, `Refuted`, `Superseded` — and carries no qualifying phrase. The reasoning behind each disposition, and any qualification of it, lives in the prior-feedback triage report the `Reports` header links; a Confirmed blocker-class entry additionally reaches Action Items, where it has room to be stated properly. The `Author` column is the aggravating factor for width — a bot login is long and unbreakable — so `Finding` is the only column here that may hold prose.

```markdown
### Prior Feedback Triage

Disposition of every prior comment and review on the PR (human and bot), determined before independent analysis.

| # | Finding | Author | Disposition |
|---|---------|--------|-------------|
| [1](pr-comment-url) | Storage record never cleared on close | reviewer | Confirmed |
| [2](pr-comment-url) | Naming nit on handler | bot | Refuted |
```

## Code Review

**Prefix:** `CR`

**Population:** `@` links a permanent blob URL at the reviewed sha, anchored to the line or line range, per the ref split in [Header Fields](#header-fields). Designator links to the finding's section in the code-review report when one exists.

```markdown
### Code Review Findings

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| [CR-1]({report-url}#cr-1) | Missing null check in handler | High | [>]({REVIEWED_CODE_BASE_URL}/src/file.rs#L42) |
| [CR-2]({report-url}#cr-2) | N+1 query pattern in loop | Medium | [>]({REVIEWED_CODE_BASE_URL}/src/handler.rs#L78) |
```

## Test Review

**Prefix:** `TR`

**Population:** `@` links the test method at the reviewed sha, per the ref split in [Header Fields](#header-fields). Designator links to the finding's section in the test-suite review report when one exists.

```markdown
### Test Review Findings

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| [TR-1]({report-url}#tr-1) | Missing edge case coverage | Medium | [>]({REVIEWED_CODE_BASE_URL}/tests/module_test.rs#L88) |
| [TR-2]({report-url}#tr-2) | No error path tests | High | [>]({REVIEWED_CODE_BASE_URL}/tests/module_test.rs#L210-L240) |
```

## Structural Analysis

**Prefix:** `SA`

Structural analysis states what the change's shape makes possible, and the conservation law it holds or breaks.

**Population:** one row per structural finding. `@` links the locus the finding turns on at the reviewed sha. Designator links to the finding's section in the structural-analysis report. Where a child workflow raised the finding, the row carries the designator that workflow assigned it, unchanged — per [Designators](./findings-report.md#designators).

```markdown
### Structural Analysis

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| [SA-1]({report-url}#sa-1) | Governance record has no clearer on the error path | High | [>]({REVIEWED_CODE_BASE_URL}/src/governance.rs#L212) |
```

## Lean-Coding Audit

**Prefix:** `LC`

The lean-coding audit states what the change carries that a simpler construct would do, each finding with the lines it would save.

**Population:** one row per audit finding, never an aggregate standing for several — an aggregate hides each finding inside it from the totals and from the Action Items. `@` links the construct at the reviewed sha. Designator links to the finding in the audit's own report.

```markdown
### Lean-Coding Audit

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| [LC-1]({report-url}#lc-1) | Trait wrapper restates the stdlib conversion it calls | Low | [>]({REVIEWED_CODE_BASE_URL}/src/convert.rs#L18) |
```

## Documentation Review

**Prefix:** `DR`

**Population:** `@` links the document. No associated report — the designator renders as plain text.

```markdown
### Documentation Review

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| `DR-1` | Change file missing | High | [>]({REVIEWED_CODE_BASE_URL}/CHANGELOG.md) |
```

## Validation

**Prefix:** `VF`

**Population:** `@` links the CI run. No associated report — the designator renders as plain text.

```markdown
### Validation Findings

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| `VF-1` | Lint — 3 clippy warnings | Low | [>](ci-run-url) |
```

## Branch Hygiene

**Prefix:** `BH`

**Population:** `@` links the branch or commit. No associated report — the designator renders as plain text.

```markdown
### Branch Hygiene

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| `BH-1` | Branch freshness — behind main | Low | [>](commit-url) |
```

## Strategic Review

**Prefix:** `SR`

Review-mode strategic review produces cleanup and scope-fit **recommendations** rather than applied cleanup — whether the change is minimal for the problem it states, and what it carries that the problem does not need. Strategic findings are routinely deferred to the author, so they render in the comment as a findings table on the shared [Table Format](#table-format), the same as the other five categories.

**Population:** one row per recommendation. `@` links the locus the recommendation acts on at the reviewed sha. Designator links to the finding's section in the strategic-review report when one exists. Recommendations also reach the Action Items tiers by severity.

```markdown
### Strategic Review

[one line naming what part of the change this table examines]

| # | Finding | Severity | @ |
|---|---------|----------|---|
| [SR-1]({report-url}#sr-1) | Trait abstraction carries one implementor | Medium | [>]({REVIEWED_CODE_BASE_URL}/src/lib.rs#L1) |
| [SR-2]({report-url}#sr-2) | Debug scaffolding ships with the change | Low | [>]({REVIEWED_CODE_BASE_URL}/src/debug.rs#L60) |
```
