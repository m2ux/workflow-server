# Work Package Plan: Schema Documentation

**Name:** Schema Documentation  
**Date:** 2026-01-22  
**Priority:** MEDIUM  
**Status:** Ready  
**Estimated Effort:** 2-3h agentic

## Problem Statement

The `schemas/` folder contains three JSON Schema files that define the core data structures for the workflow server, but lacks any documentation. New contributors and AI agents must reverse-engineer the schema files to understand how to create valid workflows, what conditions are valid, and how workflow state is tracked. This leads to trial-and-error development and potential for invalid workflow definitions.

## Scope

### In Scope
- Create unified `schemas/README.md` covering all three schema files
- Mermaid diagram showing schema relationships and workflow execution flow
- Annotated examples for workflow, condition, and state schemas
- Validation guidance (how to validate workflows locally)
- Common patterns for phases, transitions, checkpoints

### Out of Scope
- Agent-optimized TOON format alternatives (deferred)
- Changes to the schema files themselves
- Separate documentation files per schema
- API documentation

## Research & Analysis Summary

**Implementation Analysis (01-implementation-analysis.md):**
- No documentation exists in `schemas/` folder
- Workflow schema is complex (948 lines JSON, 137 lines TypeScript)
- No JSDoc comments in TypeScript source
- Validation functions exist but are undocumented

**Research (02-kb-research.md):**
- Use Mermaid state diagrams for phase transitions (GitHub renders natively)
- Keep diagrams focused (5-10 nodes max)
- Document states/phases, transitions, events, and guards
- Include real-world examples with annotations

## Proposed Approach

Create a single comprehensive `schemas/README.md` with:

1. **Overview section** - Purpose and quick orientation
2. **Schema relationship diagram** - Mermaid state diagram
3. **Three schema sections** - Each with purpose, key properties, and examples
4. **Complete workflow example** - Minimal valid workflow with annotations
5. **Validation section** - How to validate locally

### Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Separate README per schema | Focused docs | Duplicates relationship context | Rejected - unified preferred |
| Generate docs from schema | Always in sync | Complex tooling setup | Rejected - manual is fine for now |
| Add to main README | Discoverable | Clutters main README | Rejected - local to schemas better |

## Implementation Tasks

| Task | Description | Estimate | Deliverable |
|------|-------------|----------|-------------|
| 1. Create README structure | Set up `schemas/README.md` with section headings | 10m | File with structure |
| 2. Write overview section | Purpose, quick orientation | 10m | Overview content |
| 3. Create relationship diagram | Mermaid diagram showing workflow→condition→state | 15m | Diagram renders in GitHub |
| 4. Document workflow schema | Key properties, phase structure, checkpoints | 30m | Workflow section |
| 5. Document condition schema | Operators, composition examples | 15m | Condition section |
| 6. Document state schema | Runtime tracking, history | 15m | State section |
| 7. Create complete example | Minimal valid workflow with annotations | 30m | Example validates |
| 8. Add validation section | How to run validation scripts | 10m | Validation instructions |
| 9. Review and polish | Check examples validate, fix typos | 15m | Final review |

**Total Estimate:** ~2.5 hours

## Success Criteria

| Criterion | Baseline | Target | Measurement |
|-----------|----------|--------|-------------|
| Schema documentation files | 0 | 1 | File exists |
| Annotated examples | 0 | 3+ | Count examples |
| Diagram renders | N/A | Yes | View on GitHub |
| Examples validate | N/A | 100% | Run validation script |
| New contributor can create workflow | No | Yes | Manual verification |

## Testing Strategy

### Validation Tests
- [ ] All JSON examples in README validate against their schemas
- [ ] Mermaid diagram renders correctly in GitHub preview
- [ ] All links in README are valid

### Manual Tests
- [ ] Documentation is readable and logically organized
- [ ] A reader can follow the examples to create a minimal workflow

## Dependencies & Risks

### Dependencies
- None - documentation only, no code changes required

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Examples become stale | Medium | Low | Keep examples minimal; link to full schema |
| Diagram too complex | Low | Low | Limit to 5-10 nodes |
| Missing edge cases | Low | Medium | Document common patterns, reference full schema |
