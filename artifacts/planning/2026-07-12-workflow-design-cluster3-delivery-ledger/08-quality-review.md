# Quality Review — Cluster 3 Design Spec

> #189 · updated 2026-07-12

The deliverable is a **markdown design spec**, not drafted workflow YAML, so the workflow's YAML audits (expressiveness, conformance, rule-hygiene, rule-enforcement) are **N/A — 0 findings** (no schema constructs, naming conventions, or rules to audit). In their place: a correctness review of the spec against the code read during impact analysis.

## Findings

| Severity | Finding | Location | Disposition |
|----------|---------|----------|-------------|
| Low | Block-dedup helper should operate on the **projected `Record<string,unknown>`** (`projectTechnique` output), not the typed `Technique` — substituting a marker for a typed `{note,items}`/rules block otherwise fights TS types, and the projected record is the exact shape get_activity already spreads at `workflow-tools.ts:685`. | 06-design-spec.md §2.6 | **Fixed** — helper signature + wire-in points updated to project → maybe-dedup → stringify. |

## Correctness checks (passed)

- **Marker serialization:** `projectTechnique` (technique-loader.ts:33-54) assigns each block value through as-is; `stringifyForResponse` is a plain YAML stringify with no field allowlist → a marker object serializes correctly at a block position. ✓
- **No schema change:** markerization runs after `safeValidateTechnique` (composeLoaded:556) and after `projectTechnique`; the schema/typed projection never sees a marker. ✓
- **Whole-vs-block layering:** whole-technique hash computed on the pre-marker full projection (unchanged from today) and recorded regardless, so exact refetch still collapses whole. ✓
- **Channel isolation:** new keys namespaced `technique:<block>:<hash>` / `workflow_bundle:<hash>`, no cross-reference to the `bundle:*` channel. ✓
- **Content-keying:** annotated `inherited_inputs` variants hash differently → deliver full; no false dedup. ✓

## Verdict

No Critical or High findings. One Low finding fixed. Spec is internally consistent and accurate against the current delivery-engine code. **Blocker-gate: no critical → proceed to validate-and-commit.**
