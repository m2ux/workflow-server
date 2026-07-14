# Design Philosophy

> design-philosophy · Audience Attribute on Technique Output Declarations · #224 Epic: work-package planning-artifact verbosity reduction · 2026-07-14

## Problem Statement

Technique output and `#### artifact` declarations in the workflow protocol cannot state whether an artifact's intended reader is a human or an agent, so artifact format cannot follow function — a human-facing document and an agent-only state artifact are declared identically. That ambiguity forces every artifact to be authored as prose, which is verbose and awkward for an agent to read back reliably, and it blocks converting agent-state artifacts to compact structured data.

### System Context

Output declarations are read from technique/activity markdown frontmatter by the loader (`src/loaders/markdown-technique-loader.ts::parseFrontmatter`), projected into the worker-delivered technique bundle via `src/loaders/technique-loader.ts::projectTechnique` / `projectTechniqueToYaml`, validated against the definitions in `schemas/` (`src/schema/`), surfaced in the `get_activity` artifacts contract, and checked by the corpus lint scripts (`scripts/check-binding-fidelity.ts`, `scripts/check-all-refs.ts`). An `audience` attribute must thread through all of these surfaces plus the protocol spec in `docs/technique-protocol-specification.md`.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium |
| Scope | Protocol spec, schema, loader, both delivery paths (get_technique / get_activity), JSON serialization conventions, corpus lint — no user-visible behaviour change on its own |
| Business Impact | Without it, artifact format stays ambiguous and the downstream RC4 verbosity-reduction work (converting agent-state artifacts to structured JSON) cannot proceed |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** Nothing is currently broken or failing — this adds a new capability (an `audience` attribute) to an existing, working protocol, so it is an inventive *improvement* goal (enhance/optimize), not a fix/restore. Complexity is *moderate* because the change spans coordinated surfaces — protocol spec, schema validation, loader parsing, two delivery-projection paths, JSON serialization conventions under `artifactPrefix`, and corpus lint — yet each surface is well-understood and the change is additive and backward-compatible (declarations without `audience` stay valid). The GitNexus complexity signal corroborates this: a broad-but-shallow fan-out across the Loaders module, schema, and lint scripts with no single high-blast-radius hotspot and no architectural contradictions. The moderate rating reflects implementation *breadth*, not requirement or approach uncertainty — requirements are fully specified by epic #224.

## Workflow Path Decision

**Selected Path:** Direct to planning (skip optional activities — elicitation and research skipped; comprehension retained)

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Codebase Comprehension (mandatory on every path)
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Epic #224 fully specifies the six V4 sub-deliverables (spec, parser/schema, projection, `get_activity` carry-through, JSON conventions, corpus lint), so there is no requirement ambiguity for elicitation to resolve. It is an additive internal protocol change in a familiar domain, so there is no external best-practice question for research. The moderate complexity is implementation breadth across subsystems, which downstream comprehension and planning handle directly. The user confirmed the `skip-optional` path at the classification-and-path-confirmed checkpoint. `needs_comprehension` stays `true` — codebase comprehension is mandatory before planning on every path.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | PR #1 of a multi-PR epic; scoped to the V4 enabler only |
| Technical | Additive and backward-compatible only — existing output declarations without `audience` must remain valid; no corpus adoption required in this PR |
| Dependencies | RC4 enabler: downstream verbosity-reduction work depends on this attribute existing, but this PR ships independently |
| Resources | Single implementer; workflow-server repo is GitNexus-indexed and squash-merge supported |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Protocol spec documents `audience` | `docs/technique-protocol-specification.md` describes the `audience` attribute (`human \| agent`) on output / `#### artifact` declarations | Documented |
| Loader parses and schema-validates `audience` | Loader (`src/`) reads `audience`; schema (`schemas/`) accepts `human`/`agent` and rejects other values | Parsed + validated |
| Projected into delivered bundle | `audience` surfaces in the technique bundle via get_technique / get_activity so artifact format is known at write time | Present in projection |
| `get_activity` artifacts-contract carry-through | `audience` surfaces in the `get_activity` artifacts contract | Carried through |
| JSON conventions under `artifactPrefix` | Agent-audience artifacts serialized as JSON per stated conventions | Convention documented |
| Corpus lint coverage | A lint check validates `audience` across the workflows corpus | Check added, corpus passes |
| Backward compatibility | Existing declarations without `audience` still load and validate | No regression |

## Notes

No ADR is produced by this activity — the activity defines no ADR step, and the moderate classification carries no ADR gate. Design rationale for the implementation surfaces is deferred to plan-prepare. Assumptions surfaced in this activity are recorded in `01-assumptions-log.md` (the record of truth); they are not restated here.
