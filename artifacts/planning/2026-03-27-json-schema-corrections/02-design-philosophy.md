# WP-02 Design Philosophy

## Problem Classification

**Type:** Specific, known cause — schema defects identified by structural audit
**Root Cause:** Organic schema growth without a systematic validation policy; constraints were added per-schema rather than from a unified design spec.
**Complexity:** Moderate — 15 findings across 5 files with cross-schema consistency implications, but each fix is localized and independently verifiable.

## Design Rationale

### Guiding Principles

1. **Schema-as-contract:** JSON Schemas are the canonical contract between workflow authors and the runtime. Every property the runtime reads must be expressible in the schema, and every schema constraint must be enforceable by standard JSON Schema validators.

2. **Defensive defaults, explicit exceptions:** The default policy is `additionalProperties: false` for all definitions that represent stable, well-understood structures. Definitions that are intentionally extensible (e.g., skill sub-definitions used as knowledge containers for AI agents) use `additionalProperties: true` with an explicit comment documenting why.

3. **Recursive consistency:** Compound constructs (conditions, transitions, rules) must validate their children with the same rigor as their parents. `items: {}` (accept anything) in a typed array defeats the purpose of the parent schema.

4. **Minimal breakage, maximal clarity:** Prefer tightening constraints that catch real errors over loosening constraints for hypothetical use cases. Where tightening would break existing valid documents, add the new constraint alongside the old one (e.g., `oneOf` with the original type).

5. **Cross-schema coherence:** Properties with the same semantic name (e.g., `rules`) should have compatible types across schemas, or be explicitly documented as intentionally different with distinct descriptions.

### Decision Framework

For each finding:
- **Is it a correctness bug?** (schema rejects valid input or accepts invalid input) → Fix unconditionally.
- **Is it a consistency gap?** (same concept modeled differently across schemas) → Align unless there is a documented reason for divergence.
- **Is it a strictness question?** (should we allow or forbid extra properties/types?) → Apply the default policy with stakeholder input for exceptions.

## Workflow Path

**Selected path:** Skip optional activities (direct to implementation planning)

**Justification:** The problem is well-defined — each finding has a specific schema location, a concrete defect description, and a known fix pattern. There are no architectural unknowns that would benefit from prototyping or spike activities. The audit report provides sufficient analysis; additional exploration would be redundant.

## Checkpoints

- **classification-confirmed:** Auto-advanced — specific known cause, moderate complexity.
- **workflow-path-selected:** Auto-advanced — skip optional activities (no unknowns to explore).
