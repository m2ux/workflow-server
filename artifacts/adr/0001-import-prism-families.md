# ADR-0001: Import Prism Families from agi-in-md

> **Date**: 2026-03-13
> **Status**: Accepted
> **Issue**: [#53](https://github.com/m2ux/workflow-server/issues/53)
> **PR**: [#54](https://github.com/m2ux/workflow-server/pull/54)

## Context

The prism workflow supported 12 analytical lenses (L12 pipeline + 6 portfolio lenses). The upstream agi-in-md project added ~21 new lenses spanning structural SDL, behavioral pipeline, domain-neutral variants, compressed variants, and hybrid/specialized lenses. Users could not access these through the workflow.

## Decision

### Resource organization

Import 21 new resources numbered sequentially from index 12, grouped by family: SDL (12-18), behavioral (19-23), domain-neutral (24-26), compressed (27-28), hybrid/specialized (29-32). Resource indexing is by filename prefix — safe to have gaps (03-05 deleted).

### Deprecate resources 03-05

The general L12 variants (03-05) were deleted upstream as redundant. The code L12 lenses (00-02) work for all target types. Resources 03-05 are deleted, and all skills/activities updated to use 00-02 universally.

### Behavioral pipeline as 4th mode

The behavioral pipeline is a new `behavioral` pipeline mode (not a special portfolio variant). It is structurally distinct: 4 independent lenses run in parallel, followed by 1 synthesis lens that reads all 4 outputs with fixed labels (ERRORS, COSTS, CHANGES, PROMISES). This coupling is by design — the synthesis lens's analytical operations reference the specific cognitive dimensions.

### Behavioral composition follows behavioral_synthesis.md

The pipeline uses error_resilience + optim + evolution + api_surface → behavioral_synthesis, following the synthesis prompt's internal language. The upstream prism.py implementation (rec + ident) diverges and was not adopted.

### Behavioral pipeline is code-only

No optim_neutral variant exists. The pipeline is restricted to code targets. Individual neutral variants (24-26) are available in portfolio mode for non-code analysis.

### Static index tables maintained

The hardcoded index lookup tables in skills were expanded (not replaced with dynamic registry). At 30 resources, static tables are manageable. Dynamic registry would require MCP server source changes (out of scope).

## Consequences

- Resource catalog grows from 12 to 30 (with gap at 03-05)
- Portfolio lens catalog grows from 6 to 24
- Goal-mapping matrix grows from 12 to 24 entries
- Activity chain gains behavioral-synthesis-pass (6 activities total)
- Skill set gains behavioral-pipeline (6 skills total)
- Adding future lenses requires updating 3+ skills with hardcoded indices
- Front matter inconsistency: resources 00-11 lack YAML front matter; 12-32 include it
