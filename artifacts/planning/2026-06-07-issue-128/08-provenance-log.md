# AI Assistance Provenance Log

**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128)
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129)

One row per implementation task: task ID, assistant, model, prompt class, context scope, and a one-line description of what was generated.

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| T1 | claude | claude-opus-4-8 | docs | repo-only | Add AP-60 naming-structure convention (four sub-rules) to the anti-patterns catalog, cross-referencing AP-42/52/55/57 and the spec |
| T2 | claude | claude-opus-4-8 | docs | repo-only | State the naming-structure convention in the technique-protocol specification (§3.2 Inputs/Output, §3.4 Rules, §8 Authoring rules), cross-referenced from AP-60 |
| T3 | claude | claude-opus-4-8 | docs | repo-only | Add the naming-grammar audit heuristic bullet to workflow-design step 8 (sole mechanical enforcement; flags affirmative-not-prefixed) |
| T4 | claude | claude-opus-4-8 | refactoring | repo-only | Fix the `{lens-name}` → `{lens_name}` binding defect in prism/activities/01-structural-pass.toon (2 occurrences) |
| T5 | claude | claude-opus-4-8 | refactoring | repo-only | Rename boolean technique-I/O id `squash_merge_available` → `squash_merge_supported` across all 11 binding surfaces; leave conformant `worktree_created` |
| T6 | claude | claude-opus-4-8 | refactoring | repo-only | Convert five negation-shaped rule slugs to positive-assertion form; record held-back residual with rationale |
