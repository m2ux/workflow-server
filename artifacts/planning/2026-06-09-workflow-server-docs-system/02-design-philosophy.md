# Design Philosophy

**Work Package:** Workflow-Server Documentation System
**Issue:** #132 - Coherent documentation system for workflow-server
**Created:** 2026-06-09

---

## Problem Statement

The workflow-server is an MCP server that lets AI agents discover and run structured
workflows. Its documentation has accumulated organically across several disconnected
locations — a top-level `README.md`, a `SETUP.md`, a flat `docs/` folder of model and
specification documents (`architecture.md`, `api-reference.md`, `workflow-fidelity.md`,
`technique-protocol-specification.md`, `orchestra-specification.md`, several `*_model.md`
files), a `schemas/README.md`, and IDE/rule files. Each document was written at a
different time for a different reason. Nothing ties them together: there is no single
discoverable entry point, no navigation map, no consistent section grouping, and no
published documentation site.

A reader arriving at the project — a new contributor, an integrator wiring the server
into their tooling, or an agent following a workflow — has no clear starting point and
no map indicating which document answers which question. As documents proliferate
without a defined home, they drift apart from one another and from the system they
describe, eroding trust in the documentation as a whole and raising the ongoing cost of
understanding and maintaining the project.

### System Context

- **Subject system:** workflow-server, a TypeScript/Node.js MCP server (Goal → Activity → Technique → Tool model).
- **Current documentation surface (target repo, read at `reference_path`):**
  - Root: `README.md`, `SETUP.md`, `AGENTS.md`, `CLAUDE.md`, `LICENSE`.
  - `docs/`: `api-reference.md`, `architecture.md`, `development.md`, `ide-setup.md`,
    `workflow-fidelity.md`, `technique-protocol-specification.md`,
    `orchestra-specification.md`, `artifact_management_model.md`, `checkpoint_model.md`,
    `dispatch_model.md`, `resource_resolution_model.md`, `state_management_model.md`.
  - `schemas/`: `README.md` plus JSON schema files.
  - No `mkdocs.yml`, no `docs/index.md` landing page, no section index pages, no
    architecture overview hub, no ADR collection.
- **Style/shape reference:** the concept-rag documentation system at
  `~/projects/dev/concept-rag`. It is an MkDocs Material site driven by `mkdocs.yml`,
  with: a grid-card landing `docs/index.md`; task-oriented top-level guides
  (`getting-started.md`, `how-it-works.md`, `troubleshooting.md`, `faq.md`,
  `api-reference.md`); an `architecture/` folder containing an overview `README.md`,
  component deep-dives, and a numbered ADR series; and section `index.md`/`README.md`
  overview pages grouped under a structured `nav`.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — no functional defect; degraded discoverability, onboarding cost, and documentation trust. |
| Scope | All documentation consumers: new contributors, integrators, and agents. No server source or workflow behavior affected. |
| Business Impact | Rising cost of onboarding and integration; growing risk of doc/system drift and contradictory documents as the project grows. |

---

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:**

Nothing is broken — the server works and every document is individually valid. The work
package improves an existing capability (the documentation) by giving every document a
defined purpose, audience, and home under a single discoverable entry point with
navigable cross-links. That makes this an **inventive improvement goal**, not a specific
problem.

Complexity is **moderate**, not simple, because the work is broader than a single
well-scoped edit:

- It restructures a documentation system spanning ~15+ existing files plus new
  scaffolding (landing page, section indexes, navigation config, possibly an
  architecture overview hub and ADR conventions).
- The target shape is well-understood — concept-rag is a concrete, working exemplar to
  mirror — which removes inventive uncertainty and keeps this below "complex."
- It requires judgement on how to map workflow-server's specific document set onto the
  concept-rag structure (which docs become top-level guides, which group under an
  architecture section, how the existing `*_model.md` and `*-specification.md` files are
  organized, whether ADRs are introduced). This mapping is the substantive design work.
- Trade-offs exist (adopt MkDocs Material wholesale vs. lighter cross-linking; how
  aggressively to reorganize vs. preserve existing files and links) but are
  conventional, not contradictions requiring inventive principles.

This sits squarely in the moderate band: more than a trivial fix, but with a known
target pattern and no architectural contradictions to resolve.

---

## Workflow Path Decision

**Selected Path:** Research only (skip elicitation)

**Activities Included:**
- [ ] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis (codebase comprehension — mandatory)
- [x] Plan & Prepare

**Rationale:**

Requirements are clear from the work package statement and the reference exemplar:
reproduce the *shape and style* of the concept-rag documentation system for
workflow-server. The "what" and the success bar are concrete and externally anchored, so
**elicitation is not needed** — the desired outcome is "documentation organized like
concept-rag's, adapted to workflow-server's content."

**Research is valuable.** The dominant unknowns are mechanical and pattern-level: the
exact MkDocs Material conventions used by the reference (`mkdocs.yml` structure, nav
grouping, grid-card landing page, admonitions, mermaid, ADR numbering and template), and
how to map workflow-server's specific documents (the `*_model.md` and
`*-specification.md` set, schema docs, fidelity guide) onto that structure. A focused
research pass over the concept-rag system and MkDocs Material conventions de-risks the
plan and produces a faithful adaptation rather than an approximate one.

Codebase comprehension remains mandatory (set by the workflow) — here it means
inventorying the existing documentation surface and the server's public concepts so the
new structure accurately reflects the system as it is.

This maps to the **research-only** path: skip elicitation, run research and the mandatory
comprehension, then plan.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Documentation-only work package; agentic implementation estimated 1–4h plus human review. |
| Technical | Mirror the concept-rag documentation shape/style (MkDocs Material). Documentation-only — no changes to `src/` or `schemas/` (server source/JSON schemas) per work-package scope and repo boundaries. |
| Dependencies | concept-rag system at `~/projects/dev/concept-rag` is the read-only style reference; edits land in the worktree at `target_path`. |
| Resources | Single-agent execution against issue #132 / PR #133 on branch `chore/132-coherent-documentation-system`. |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Single discoverable entry point | A landing page mirroring concept-rag's grid-card `docs/index.md` exists and links to every major doc area. | Present and complete |
| Defined home for every document | Every existing doc is reachable from the navigation structure with a clear section and purpose. | 100% of current docs placed |
| Navigable structure | A `mkdocs.yml` (or equivalent) nav groups docs into coherent sections (e.g. Getting Started, How It Works, Agent Guidance, API, Architecture) matching the reference shape. | Nav builds without orphan/broken entries |
| Consistent style | New/restructured docs follow the reference's voice and conventions (admonitions, section indexes, cross-links). | Reviewer confirms shape/style parity |
| No drift introduced | Restructured content stays faithful to the current system (describe-as-it-is; no behavior claims invented). | Reviewer confirms accuracy |

---

## Design Decisions (preliminary — refined in research/planning)

| Decision | Options Considered | Chosen (preliminary) | Rationale |
|----------|-------------------|----------------------|-----------|
| Documentation framework | MkDocs Material (match reference) vs. plain cross-linked markdown | MkDocs Material | The work package asks to match concept-rag's shape/style; concept-rag is an MkDocs Material site. Defer final confirmation to planning. |
| Reorganization depth | Full restructure into sectioned nav vs. minimal landing-page + cross-links over existing flat `docs/` | Sectioned structure mirroring reference | Reference uses grouped nav + section indexes + architecture hub; matching the shape requires grouping, not just a landing page. |
| ADR adoption | Introduce an ADR series (as concept-rag has) vs. omit | Defer to planning | concept-rag's ADRs document a long decision history; workflow-server has its own `*_model.md`/spec docs that may serve a similar role. Whether to add ADRs is a mapping decision for planning. |

---

## Notes

- The concept-rag reference shape comprises: `mkdocs.yml` nav; grid-card landing
  `docs/index.md`; task guides (`getting-started`, `how-it-works`, `troubleshooting`,
  `faq`, `api-reference`); an `architecture/` folder with overview `README.md`, component
  deep-dives, and a numbered ADR series; and per-section index pages.
- Open mapping questions (carried to research/planning, tracked in the assumptions log):
  how workflow-server's `*_model.md` and `*-specification.md` documents map onto the
  reference's Architecture/ADR sections; whether to introduce an ADR series; whether to
  adopt the full MkDocs Material toolchain or a lighter equivalent; and how much of the
  existing flat `docs/` layout to preserve vs. reorganize.
- Boundary reminder: this work package edits documentation only. Server source (`src/`)
  and JSON schemas (`schemas/*.json`) are out of scope.
