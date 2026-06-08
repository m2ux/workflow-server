# AI Assistance Provenance Log

**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128)
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129)

One row per implementation task: task ID, assistant, model, prompt class, context scope, and a one-line description of what was generated.

**Work-package context scope:** `web-retrieval`. The work package ran the **research-only** path, and the naming-structure convention's design rests on external web sources (Microsoft Framework Design Guidelines, John D. Cook on collection naming, OPA/Rego style, DDD ubiquitous language — see [04-kb-research.md](04-kb-research.md#sources-referenced)). The per-task `Context Scope` column below records, truthfully, which tasks actually consumed those external references: the convention-authoring tasks (T1–T3) encode the externally-validated rules and are therefore `web-retrieval`; the mechanical corpus-migration tasks (T4–T6) operate only on repo-local identifiers (grounded by repo grep, no external reference) and are `repo-only`.

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| T1 | claude | claude-opus-4-8 | docs | web-retrieval | Add AP-60 naming-structure convention (four sub-rules) to the anti-patterns catalog, cross-referencing AP-42/52/55/57 and the spec — encodes the externally-validated boolean/collection/noun-phrase/assertion rules |
| T2 | claude | claude-opus-4-8 | docs | web-retrieval | State the naming-structure convention in the technique-protocol specification (§3.2 Inputs/Output, §3.4 Rules, §8 Authoring rules), cross-referenced from AP-60 — mirrors the same externally-grounded convention into the spec |
| T3 | claude | claude-opus-4-8 | docs | web-retrieval | Add the naming-grammar audit heuristic bullet to workflow-design step 8 (sole mechanical enforcement; flags affirmative-not-prefixed) — heuristic derived from the external boolean/collection findings |
| T4 | claude | claude-opus-4-8 | refactoring | repo-only | Fix the `{lens-name}` → `{lens_name}` binding defect in prism/activities/01-structural-pass.toon (2 occurrences) — repo-local identifier fix, no external reference |
| T5 | claude | claude-opus-4-8 | refactoring | repo-only | Rename boolean technique-I/O id `squash_merge_available` → `squash_merge_supported` across all 11 binding surfaces; leave conformant `worktree_created` — repo-local rename, no external reference |
| T6 | claude | claude-opus-4-8 | refactoring | repo-only | Convert five negation-shaped rule slugs to positive-assertion form; record held-back residual with rationale — repo-local slug migration, no external reference |

---

## Attestation

- **Decision:** `certify` — Developer Certificate of Origin certified for this work package.
- **Certifier:** Mike Clay <mike.clay@shielded.io>
- **Timestamp:** 2026-06-08T05:45:25Z
- **Context scope:** web-retrieval (work-package level; per-task scope recorded in the table above)
- **Model:** claude-opus-4-8

The certifier confirms they reviewed the entire diff and understand each material change, have the right to submit this contribution under the project's license, did not include code with unclear or incompatible provenance, can explain where the solution came from, that tests and linters have been run (or will run in CI), and that they take responsibility for defects and licensing issues in this patch.
