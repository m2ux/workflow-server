# Requirements-Refinement Design Fixes — July 2026

> Update · Created 2026-07-27 · **Status:** Complete — closed out in [11-completion.md](11-completion.md); [PR #318](https://github.com/m2ux/workflow-server/pull/318) open against `workflows` awaiting human review and merge

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

The `requirements-refinement` workflow (v1.1.0) has never been audited against the workflow-design canon, so design-principle violations and schema anti-patterns have accumulated across its five activities, six techniques, and four resources. This session audits the workflow end to end and fixes every violation in place, leaving its purpose and lifecycle unchanged. The result is a workflow whose activity, checkpoint, and technique shapes are conformant, so future changes start from a clean baseline instead of propagating the same defects.

## Problem Overview

This project keeps a library of reusable "workflows" — written procedures that an AI assistant follows step by step to get a job done consistently. One of them, requirements refinement, takes a meeting transcript or a rough document and turns it into a tidy, formal list of requirements. Like any set of written instructions, a workflow can drift out of line with the house style over time: a question asked in the wrong place, a choice offered to the person in charge that quietly leads nowhere, a counter the instructions rely on that nothing ever actually counts. The requirements-refinement workflow has never been checked against the house standards since it was written.

The practical consequence is that the workflow behaves less predictably than it looks. Some of the gaps are cosmetic, but others are real: a safety limit meant to stop the workflow retrying forever is written as a loose number in one place while the setting that was supposed to control it sits unused elsewhere, and at least one option offered to the user has no defined effect. This work reads the whole workflow against the project's written design standards, lists every place it departs from them, and corrects each one — without changing what the workflow is for or the order in which it does its job. Afterwards, the people who rely on it get the same result every time, and the next person to change it starts from a clean, consistent baseline.

## Solution Overview

The fix touches sixteen of the workflow's twenty-one files, and it changes only how the instructions are written down — not what the workflow does or the order it does it in. Three kinds of correction account for almost all of it. Where the workflow pauses to ask the person in charge a question, it now states plainly what is on the table and puts the actual choice in the buttons, with a working link to the document being decided on, so nobody is asked to approve something they cannot see. Where the workflow announces that it has produced a file, it now links the real file under the real name the reader will find on disk, instead of a name typed in by hand that no longer matches. And the safety limit that stops the workflow retrying forever now lives in exactly one place — the rule the software actually checks — so the limit that is written down is the limit that is enforced. The full list of goals is in the [design specification](03-design-specification.md); the file-by-file breakdown is in the [scope manifest](06-scope-manifest.md).

Three questions are deliberately left open for a human to settle rather than decided here, because each is a matter of preference rather than correctness: whether a run that ends in failure should require someone to click "acknowledged", where a "needs revision" choice should send the run back to, and whether three unused internal settings should be deleted or given a job. The workflow has been written so that any of those answers can still be applied without redoing this work. Everything else is settled, which means that after this change the workflow enforces the limits it claims to enforce, every choice offered to a user has a defined consequence, every file it announces can be opened from the message that announces it, and its documentation describes the workflow that actually exists.

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Target, mode, planning folder | 15-30m | ✅ |
| 2 | 01 | [Format conventions](01-format-conventions.md) | Authoring literacy notes | 5-10m | ✅ |
| 3 | 03 | [Design specification](03-design-specification.md) | Change goals and constraints | 20-40m | ✅ |
| 4 | 03 | [Assumptions log](03-assumptions-log.md) | Open and settled assumptions | 10-15m | ✅ |
| 5 | 04 | Pattern analysis | Applicable patterns and practices | 20-40m | ⊘ |
| 6 | 05 | [Impact analysis](05-impact-analysis.md) | Blast radius and preservations | 20-40m | ✅ |
| 7 | 06 | [Scope manifest](06-scope-manifest.md) | File-level change inventory | 15-30m | ✅ |
| 8 | 06 | [Drafting plan](06-drafting-plan.md) | Draft order and blocks | 10-20m | ✅ |
| 9 | 06 | [Draft attestation](06-draft-attestation.md) | Batch review attestation | 5-10m | ✅ |
| 10 | 06 | [File review note](06-file-review-note.md) | Removals and draft highlights | 5-10m | ✅ |
| 11 | 08 | [Quality review](08-verified-findings.md) | Principle and anti-pattern audits | 30-60m | ✅ |
| 12 | 08 | Principle findings | Review-mode satellite; update mode audits at row 16 | 10-20m | ⊘ |
| 13 | 08 | Anti-pattern findings | Review-mode satellite; update mode audits at row 17 | 10-20m | ⊘ |
| 14 | 09 | Validate and commit | Schema check, commit, PR | 20-40m | ✅ |
| 15 | 10 | [Post-update review](10-post-update-review.md) | Follow-up after merge path | 15-30m | ✅ |
| 16 | 10 | [Principle findings](10-principle-findings.md) | Principles audit satellite | 10-20m | ✅ |
| 17 | 10 | [Anti-pattern findings](10-anti-pattern-findings.md) | Anti-pattern audit satellite | 10-20m | ✅ |
| 18 | 11 | Retrospective | Session close-out | 15-30m | ✅ |
| 19 | 11 | [Close-out](11-completion.md) | Deliverables and limitations | 10-20m | ✅ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/requirements-refinement/` |
| Pull request | [#318](https://github.com/m2ux/workflow-server/pull/318) |
| Workflow branch | `workflow/requirements-refinement` |
| Structural inventory | [structural-inventory.md](01-structural-inventory.md) |
| Format conventions | [format-conventions.md](01-format-conventions.md) |
| Design specification | [design-specification.md](03-design-specification.md) |
| Assumptions log | [assumptions-log.md](03-assumptions-log.md) |
| Follow-ups | [follow-ups.md](03-follow-ups.md) |
| Impact analysis | [impact-analysis.md](05-impact-analysis.md) |
| Scope manifest | [scope-manifest.md](06-scope-manifest.md) |
| Drafting plan | [drafting-plan.md](06-drafting-plan.md) |
| File review note | [file-review-note.md](06-file-review-note.md) |
| Draft attestation | [draft-attestation.md](06-draft-attestation.md) |
| Verified findings | [verified-findings.md](08-verified-findings.md) |
| Expressiveness findings | [expressiveness-findings.md](08-expressiveness-findings.md) |
| Conformance findings | [conformance-findings.md](08-conformance-findings.md) |
| Rule-hygiene findings | [rule-hygiene-findings.md](08-rule-hygiene-findings.md) |
| Enforcement findings | [enforcement-findings.md](08-enforcement-findings.md) |
| Post-update review | [post-update-review.md](10-post-update-review.md) |
| Principle findings | [principle-findings.md](10-principle-findings.md) |
| Anti-pattern findings | [anti-pattern-findings.md](10-anti-pattern-findings.md) |
| Close-out and retrospective | [completion.md](11-completion.md) |

## Design Decisions

Each row points at its canonical home; the statement of the decision lives there.

| Decision | Home |
|----------|------|
| Seven change goals (G1–G7) and the out-of-scope boundary for this update | [design specification](03-design-specification.md#purpose) |
| The correction cap lives in the transition condition, and the parallel `max_correction_iterations` variable is removed | [design specification](03-design-specification.md#rules) |
| Activity files are not renumbered — the `02` gap stays | [design specification](03-design-specification.md#purpose) |
| Technique-surface changes are in scope though the update dimension set omits them | [assumptions log](03-assumptions-log.md) |
