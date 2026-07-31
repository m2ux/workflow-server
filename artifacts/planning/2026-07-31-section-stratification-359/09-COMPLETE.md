# Workflow Authoring: workflow-design — Complete

> Update · 2026-07-31

## Summary

PR2 for [#359](https://github.com/m2ux/workflow-server/issues/359) closed the section-stratification / framing audit after the #358 citation tail in [#370](https://github.com/m2ux/workflow-server/pull/370). Canon now states that content a section-scoped reader depends on lives in a section (principles 30/32) and records AP-134b `framing-outside-any-section`; three cross-section deps are anchored; framing path-pins ship on the corpus branch.

## What Was Delivered

- **Activities:** none (topology unchanged)
- **Techniques:** none
- **Resources (modified):**
  - `workflow-design/resources/design-principles.md` — principle 30/32 section-scoped-reader clause
  - `workflow-design/resources/anti-patterns.md` — AP-134b `framing-outside-any-section`
  - `meta/resources/planning-readme.md` — cross-section anchor + `## Index role`
  - `work-package/resources/architecture-summary.md` — cross-section anchor
  - `work-package/resources/pr-description.md` — glyph key under `#link-row-forms`
  - `work-package/resources/complete-wp-guide.md` — duplicate framing deleted
  - `workflow-design/resources/schema-construct-inventory.md` — `## Universal obligation`
  - `work-package/resources/workflow-retrospective.md` — `## Host nesting`
  - `prism/resources/definitive-findings-template.md` / `final-output-template.md` — H1 + `## Artifact contract`
- **Variables and rules:** none

Published as [PR #371](https://github.com/m2ux/workflow-server/pull/371) (`workflow/workflow-design-section-stratification-359` → `workflows`, tip `d320e74b`).

## Design Decisions

- [Change brief](01-change-brief.md) — purpose and open judgements
- [Impact analysis](01-impact-analysis.md) — blast radius, integrity, removals
- [Scope manifest](06-scope-manifest.md) · [framing classification](06-framing-classification.md) — file rows and classify arithmetic
- [Findings register](08-findings-register.md) — audit record

Variant C (`src/` delivery) was not taken: orientation dominates (81/87). One duplicate framing removal was approved and committed.

## Scope Outcome

Manifest delivered exactly (11/11 path-pins; 10 unique definition paths). No drift rows.

## Known Limitations and Deferrals

- **Delivery variant C deferred** — orientation-dominated arithmetic; no `src/` slice this pass. Revisit only if section-scoped delivery pressure rises.
- **#358 citation tail** — separate PR [#370](https://github.com/m2ux/workflow-server/pull/370); not re-done here.
- **CI on PR** — local `check:all` 19/19 and `check-resource-anchors` green; GitHub CI pending on [#371](https://github.com/m2ux/workflow-server/pull/371).

## Run Retrospective

- Framing classify at full corpus scale (87 sites) was the cost centre; path-pins were few once orientation vs operative was decided.
- Guard suite on the worktree caught nothing new after drafting — anchors and check:all stayed green through commit waves.
- Branch tip already held the three definition commits at publish time; validate-and-commit was push-verify + PR open only.
