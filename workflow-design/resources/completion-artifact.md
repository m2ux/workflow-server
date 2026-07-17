---
name: completion-artifact
description: Template for the COMPLETE.md close-out document of a workflow-design session — the session's single terminal artifact.
metadata:
  order: 6
---

# Design Session Close-Out Guide

`COMPLETE.md` is the **single terminal artifact** of a workflow-design session — the counterpart of the work-package [complete-wp](../../work-package/resources/complete-wp.md) guide, with design-authoring sections in place of code/test sections. It answers "what was delivered, what was decided, and what is left open?" There is no separate retrospective or session-summary artifact: the retrospective is a section of this document.

## Template

```markdown
# Workflow Design: [Workflow ID] — Complete

> [Create / Update] · [date]

## Summary

[2-3 sentences: what workflow was created or what changed, and why it matters]

## What Was Delivered

- **Activities:** [created / modified activities]
- **Techniques:** [created / modified techniques]
- **Resources:** [created / modified resources]
- **Variables / rules:** [notable additions]

(In update mode, frame each as added / modified / removed against the prior version.)

## Design Decisions

Link the assumptions log and the planning README Design Decisions section.
Record here ONLY drafting-time decisions with no other home (Context / Decision /
Rationale / Alternatives). Keep this section short — no restated decision essay.

## Scope Outcome

[Exception-only, against the confirmed scope manifest: "All N manifest items delivered
([manifest](NN-scope-manifest.md))" is one line. List rows only for drift — changes
outside the manifest or unaddressed items — folding in the scope-discipline audit.]

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **[Limitation]** — [caveat about the delivered workflow]
- **[Deferred item]** — [reason / follow-up]

## Lessons Learned

- [Honest, specific observations — omit the section if nothing rises above noise.]

## Workflow Retrospective

[Prioritized lessons for the design workflow itself — see the [retrospective section template](../../work-package/resources/workflow-retrospective.md#output-section-template). Omitted for a trivial session.]
```

## Rules

- **What Was Delivered** is concrete — name the files produced or changed, not a vague summary.
- **Link, don't restate.** Decisions live in the assumptions log and README; scope lives in the manifest; COMPLETE stays a short close-out.
- **Exception-only Scope Outcome.** All-✅ tables carry no information; only drift earns rows.
- **Omit null sections** rather than writing "none".
- **Keep close-out short.** Delivery + links + limitations; no design-decision / alternatives essay restatement.
