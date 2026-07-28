---
name: completion-artifact
description: Creation guide for COMPLETE.md — the run's single terminal record, with the retrospective as a section.
metadata:
  version: 1.0.0
  order: 14
---

# Close-Out Guide

`COMPLETE.md` is the **single terminal artifact** of a run. It answers what was delivered, what was decided, and what is left open. There is no separate retrospective document: the retrospective on the run itself is a section here.

## Template

~~~~markdown
# Workflow Authoring: [workflow-id] — Complete

> [Create | Update] · [date]

## Summary

[2–3 sentences: what was created or what changed, and why it matters.]

## What Was Delivered

- **Activities:** [created / modified]
- **Techniques:** [created / modified]
- **Resources:** [created / modified]
- **Variables and rules:** [notable additions]

[On an update run, frame each as added, modified or removed against the prior version.]

## Design Decisions

[Link the artifacts holding this run's decisions. Record here only a drafting-time
decision with no other home — context, decision, rationale, alternatives — and keep it
short.]

## Scope Outcome

[Exception-only against the confirmed manifest. A manifest delivered exactly is one
line. Rows appear only for drift: a file changed that nothing planned, or an entry
left undelivered.]

## Known Limitations and Deferrals

<!-- Canonical home. Other artifacts link here; this list is not duplicated elsewhere. -->
- **[Limitation]** — [caveat about what was delivered]
- **[Deferred]** — [reason, and what would close it]

## Run Retrospective

[Prioritized, specific observations about the run itself: what cost more than it
should have, what a gate caught or missed, what would change next time. Omit the
section when nothing rises above noise.]
~~~~

## Rules

- **What Was Delivered is concrete** — name the files produced or changed, not a summary of the kind of work done.
- **Link, don't restate.** Decisions, scope and findings live in their own homes; this stays a short close-out.
- **Exception-only Scope Outcome.** A table whose every row passes carries no information; only drift earns rows.
- **Omit a null section** rather than writing that it does not apply.
- **Line budget:** ~70 lines. A longer close-out is a sign a section belongs in its own home.
