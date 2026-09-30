---
name: strategic-review
description: Strategic review artifact template, its finding categories, and the minimality and speculative-change checks.
metadata:
  version: 2.0.2
  order: 18
  legacy_id: 18
---

# Strategic Review Guide

Problem-solving commonly leaves behind speculative changes, debugging infrastructure, or exploratory code that becomes unnecessary once the root cause is understood. The strategic review finds and removes these before finalizing the PR, so PRs are clean, reviewable, and contain only intentional changes.

## Categories

- **Investigation Artifact** — changes made while understanding the problem: extra logging or print statements, verbose error messages for debugging, temporary workarounds that were superseded, exploratory test configurations.
- **Over-Engineering** — solutions that grew beyond what was needed: generic abstractions for specific problems, fallback mechanisms for cases that can't occur, unused configuration options, infrastructure for features not implemented.
- **Orphaned Infrastructure** — supporting changes that outlived their purpose: commented-out code, unused utilities, duplicate functionality, CI job dependencies added for failed approaches, environment variables for abandoned features, build steps for removed functionality, unnecessary wait/synchronization logic.
- **Scope Creep** — a change the requirements do not call for: a flow the change reaches from outside them, or an edit unrelated to them.
- **PR Body Conformance** — a divergence between what the pull request body says and what the change does.

## Field List

Designators use the prefix declared for this report's category at [Strategic Review](./review-mode.md#strategic-review). Every finding carries the fields of [Fields](./findings-report.md#fields), laid out per [Finding Layout](./findings-report.md#finding-layout). This report declares:

| Declaration | Value |
|---|---|
| `Category` vocabulary | [Categories](#categories) |

On a strategic finding, `Description` states what the change carries, `Impact` what carrying it costs the reader or the maintainer, and `Recommendation` opens with the verb it asks for — remove, simplify, or keep — followed by the argument for it.

## Speculative Changes Audit

The areas a scope review probes for changes the final solution does not need.

| Category | Questions to Ask |
|----------|------------------|
| **Infrastructure** | Were CI/CD changes, build configuration, or environment setup modified speculatively? Are they still needed for the final solution? |
| **Dependencies** | Were dependencies added, removed, or modified that aren't required by the final implementation? |
| **Debug Code** | Are there debug statements, verbose logging, or diagnostic outputs that should be removed? |
| **Fallback Logic** | Were fallback mechanisms added that are unnecessary given the final approach? |
| **Configuration** | Were configuration files modified beyond what the final solution requires? |

## Per-file necessity

For each changed file, verify: the change directly supports the solution (not a speculative attempt); it is minimal (no unnecessary additions); it doesn't include debugging artifacts; and it wasn't superseded by a simpler approach.

## Minimality Check

Five questions over the change set, each answered "No" carrying the cleanup its row names.

| Question | If "No" |
|----------|---------|
| Is every changed file necessary for the fix? | Revert unnecessary file changes |
| Is every added line of code necessary? | Remove speculative or debug code |
| Are all new dependencies required? | Remove unused dependencies |
| Are all configuration changes required? | Revert unnecessary config changes |
| Is the solution as simple as it could be? | Consider simplification |

## Changes Fragment Issue Reference

A changes fragment carries a GitHub issue reference, and the project's check-changes job accepts one of two forms: a full issue URL matching `github\.com/.+/issues/[0-9]+`, or a trailer matching `(Fixes|Closes|Resolves):?\s+#[0-9]+`. A fragment carrying neither fails that job.

## Strategic Review Artifact Template

```markdown
# Strategic Review

> strategic-review · [work package] · [base-branch] → [feature-branch] · [date] · [Agent/Human]

**Result:** [Passed / Minor Cleanup Completed / Significant Rework Needed] — [one-line reason] · [count] files, +[added] / -[removed]

**Delivery:** carried to the pull request [designators] · handed to the audit [designators] · held [designators]

## Findings

[One heading per finding, ascending by designator, no grouping heading between them. With no findings, state "all changes justified — no findings" on one line.]

### SR-1 — [one line naming the finding]

**Category:** [category]

**Severity:** [render-scale value]

**Description:** [what the change carries, opening with an inline link to the named thing]

**Impact:** [what carrying it costs]

**Recommendation:** [remove / simplify / keep, then the argument for it]

## Cleanup Actions Taken

[Omit this section if no cleanup was needed]

| Cleanup | Commit |
|---------|--------|
| [what was removed or simplified, as a short label] | [the commit's subject, linked to the commit] |
```

## Rules

- **Line budget:** ~80 lines. Each recommendation is one entry with its scope-fit reason.
- **Delivery names each designator once.** Every designator the run produced sits in exactly one class, per [Delivery Completeness](./findings-report.md#delivery-completeness); a class holding none is left off the line.
