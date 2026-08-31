## Summary

Two small server capabilities are the last things standing between the corpus backlog (#338) and two of its work items.

First: a checkpoint — a step where the workflow pauses for a decision — can be dismissed by the orchestrator when its guarding condition turns out not to hold. But that dismissal path only recognizes a condition written in the structured object form. A checkpoint gated by a `when` expression — the string form the schema itself now treats as the survivor of the two — cannot be dismissed at all. So the corpus cannot migrate its gated checkpoints to the surviving form without losing dismissability, and the migration debt keeps growing while it waits.

Second: rule text declared at the workflow level can reference a shared fragment — a block written once and reused by reference — and the loader materializes it when the definition loads. The same rule text declared inside an activity file cannot: activity-file rules take only literal text. Duplicated rule text therefore stays alive in activity files with no way to fold it into the fragment that already exists.

Both items were tracked in the server backlog (#365) — the tail of its `when`/`condition` merge item and the schema change its fragments row waited on — which closed with these undelivered. The pull request opened to carry them (#373) never received an implementation commit and is closed. This epic is their live home. A third item from that pull request, the citation-grain guard, already has a home as #398 W2 and is deliberately not repeated here.

## How it works today

The schema offers two ways to write "only run this step if…": a structured condition object and a `when` expression string. The merge decision has landed — the structured form is documented as legacy on ordinary steps — but one capability never moved across: only a structured condition makes a checkpoint dismissible via the condition-not-met path. That exclusivity is what holds the corpus migration (#338 W3, roughly 67 sites and growing) in place: migrating a gated checkpoint today would strand it undismissable.

Separately, the loader resolves fragment references in workflow-level rules at load time, while activity-file rules are literal-only, and the fragments guard treats them accordingly. That residual is what keeps the activity-rules bullet of #338 W2 gated.

## The work

**W1 — Dismissal under either gate form.** The condition-not-met path accepts a checkpoint gated by either construct, and the schema descriptions are updated so the legacy marking names its removal target at the next schema major. Tests cover dismissal for both gate forms.

**W2 — Fragment references in activity-file rules.** Activity-file rules accept the same reference form workflow rules already resolve, materialized at load; the fragments guard treats activity rules as reference-capable slots. Loader tests cover the new reference site.

## Why now is cheap

Both are extensions of machinery that already exists — the dismissal path and the fragment resolver — each pointed at one more input shape. And both are pure unblocks with compounding cost: the condition-migration count has already quadrupled since the debt was first measured (17 sites then, roughly 67 now), and every activity rule written as a literal copy deepens the fold-back later.

## Acceptance criteria

- [ ] A checkpoint gated by a `when` expression can be dismissed via the condition-not-met path exactly as one gated by a structured condition, with tests covering both forms.
- [ ] The schema descriptions name the legacy construct's removal target at the next schema major.
- [ ] An activity-file rule can reference a shared fragment; the loader materializes it at load and the fragments guard validates it, with loader coverage.
- [ ] The two gated items in #338 (the activity-rules bullet of W2, and W3) are unblocked when the respective work item lands.

## Non-goals

- No corpus migration — the roughly 67-site sweep stays with #338 W3 and executes once W1 lands.
- No citation-grain guard — that piece of the closed pull request is tracked as #398 W2.
- No removal of the legacy construct — removal waits for the next schema major, per the existing register.

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1 — checkpoint dismissal for either gate form, plus the schema-description update
- [ ] W2 — fragment references in activity-file rules, loader and guard

Carries the live server remainder that gated #338 after #365 closed; converted from the never-started pull request #373.

## Investigation detail

Routing and provenance for the carried items:
**[engineering/artifacts/planning/2026-08-01-backlog-pr-routing](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-01-backlog-pr-routing/README.md)**

