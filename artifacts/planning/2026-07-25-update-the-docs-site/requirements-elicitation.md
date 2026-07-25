# Requirements Elicitation: Update the Docs Site

> 2026-07-25 · Confirmed

## Problem Statement

Prospective and current users of Workflow Server encounter documentation that is dense, fragmented, inconsistent, or stale relative to the product. That friction confuses install and onboarding choices, obscures terminology and mental models, duplicates conflicting instructions, and discourages adoption. The work is a documentation product and onboarding improvement — accuracy, information architecture, plain language, and UX of markdown and the static site — not a superficial wording pass and not a redesign of the MCP server product.

## Goal

Make documentation trustworthy, approachable, and useful so a prospective user can understand the product, choose an install path, complete a first successful workflow, and find deeper material without reading implementation code. Every recurring fact has a canonical owner; markdown and `site/` agree; generated references stay current; validation and a manual golden-path walk pass before the package is marked complete.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Prospective user / operator | Clear value, install choice, golden path, verification, troubleshooting | As a prospective user, I want to install and run a first workflow without implementation knowledge so that I can evaluate and adopt Workflow Server. |
| Integrator / MCP client author | Accurate transport, config, bootstrap rule, API index | As an integrator, I want correct MCP and transport guidance so that my client connects and stays reliable. |
| Workflow author | Authoring model, specs with plain-language orientation, stable paths | As a workflow author, I want precise but approachable authoring docs so that I can define workflows correctly. |
| Contributor | Contributor docs separated from onboarding | As a contributor, I want development and maintenance docs that do not clutter the new-user path. |
| AI agent consumer | Stable paths, bootstrap rules, AGENTS/CLAUDE examples, accurate tool/schema refs | As an agent, I want consistent rules and references so that I can discover and execute workflows correctly. |

### Secondary Stakeholders

- Product maintainers — trust in published material and reduced support burden from drift
- PR reviewers (#293) — reviewable batches and clear acceptance evidence

## Context

### Integration Points

- Canonical markdown: `README.md`, `setup.md`, `http.md`, `stdio.md`, `docs/**/*.md`, `schemas/README.md`, example/workspace `AGENTS.md` / `CLAUDE.md`, `.cursor/` and `.claude/rules/` copyable configs
- Static site: `site/**/*.html`, `site/README.md`, `SITE_ROUTES`, `nav.js` / shared chrome, generated regions via `scripts/generate-site-data.ts`
- Package scripts and CI: `build:site`, `check:site`, `check:svg`, deploy-docs, documentation-related tests
- Implementation evidence: code, schemas, tests, scripts, live tool/route registration (source of behavioral truth)
- Planning artifacts under `.engineering/artifacts/` — historical only; not product docs
- PR #293 / branch `docs/update-the-docs-site`

### Dependencies

- Existing two-layer documentation system (markdown canonical; hand-authored site presentation)
- Generators for API/schema regions (must regenerate, not hand-edit generated bodies)
- Ability to verify claims against repo implementation and package scripts

### Constraints

- **Technical:** Preserve existing filenames and public document paths unless change is demonstrably necessary (heavy cross-linking). Keep generated vs hand-authored regions separate. Do not narrate obsolete designs in product docs (“formerly,” “previously,” “now,” “no longer,” “replaces”); present tense for current behavior. Avoid unrelated source-code changes. Do not redesign visual identity unless required for usability/accessibility.
- **Process:** Produce required analysis deliverables (A–G) and obtain review before implementation within approved scope. Implementation in small reviewable batches (factual correctness → onboarding → duplication → plain language → examples → a11y → automation).
- **Resources:** Single work-package PR cycle; issue skipped; tracking via PR #293.

## Scope

### In Scope

1. Establish current product truth (git history/baseline, verify claims against implementation; register contradictions and multi-location facts).
2. Audit documentation by user journey (understand product, MCP minimum, transport choice, install, target repo prep, install vs deploy vs `init-repo.sh`, MCP client + bootstrap rule, verify, start/resume workflow, `repo` binding, storage locations, update/reload, diagnose errors, API reference access, author workflows, contribute).
3. Improve information architecture (one canonical owner per recurring topic; progressive disclosure; duplication treatment patterns).
4. Apply plain-language editorial standard for user-facing guidance (outcomes first, steps, examples, troubleshooting near failure points; preserve normative precision).
5. Terminology and conceptual consistency (canonical vocabulary aligned with tools/schemas/implementation).
6. Reconcile markdown and site (sources, SITE_ROUTES, nav/breadcrumbs/pagination, generated regions, edit rules).
7. Prospective-user onboarding (landing/README Q1–Q10 order; setup decision guide; glossary; copy-ready MCP configs; golden-path example; verification output; troubleshooting from real failure modes).
8. Accessibility and presentation review of the static site (semantic structure, keyboard/focus, contrast, responsive code/tables, landmarks — no brand redesign unless needed).
9. Required analysis deliverables before implementation: A executive summary; B inventory; C accuracy register; D duplication map; E journey gaps; F proposed IA; G prioritized plan (batches 1–7).
10. Implementation within approved scope after analysis review; regenerate generated content via repo scripts; update all known repetitions or replace with links; add automated drift checks where mechanical.
11. Validation: `npm run build:site`, `check:site`, `check:svg`, relevant docs/site tests, `typecheck`, link/anchor checks, stale-term search, tool vs docs comparison, schema vs generated docs, route registry vs HTML, final diff review for accidental generated-region edits, manual golden-path walk.

### Out of Scope

1. MCP server product redesign or new workflow engine features — documentation/onboarding only.
2. New static-site generator or wholesale docs platform migration — stay on existing two-layer system unless a later package explicitly expands.
3. Treating `.engineering/artifacts/` as current product documentation (read-only for intent/history).
4. Superficial wording-only pass without accuracy, IA, journey, and validation work.
5. Unrelated application source changes outside documentation, generators, and doc validation automation.
6. Visual identity redesign beyond fixes required for documentation usability or accessibility.

### Deferred

Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | Recent product behavior is accurately reflected across all in-scope user-facing documentation | Accuracy register closed or residual limitations listed; spot-check claims against code/schemas/tests/scripts |
| SC-2 | A prospective user can understand the product and complete a successful first workflow without implementation knowledge | Manual golden-path walk of docs; journey gap analysis shows no blocking gaps on install→first workflow |
| SC-3 | Setup has one clear shared sequence; transport-specific differences isolated to HTTP/stdio guides | Inventory + IA map; reader walk of setup vs http.md/stdio.md |
| SC-4 | Every recurring fact has an identified canonical owner; intentional summaries link instead of competing | Duplication/consolidation map; spot-check duplicated subjects |
| SC-5 | Terminology is consistent with implementation and schemas | Canonical vocabulary applied; tool/schema name comparison |
| SC-6 | Dense beginner-facing prose rewritten, layered, or moved; formal specs remain precise with plain-language intros | Editorial review of onboarding and normative pages |
| SC-7 | Markdown and site pages agree; all site pages reachable and correctly registered; generated content current | `build:site`, `check:site`, route-registry vs HTML, generator freshness, source/site fact checks |
| SC-8 | Commands, links, anchors, and examples validate; automated checks and relevant tests pass | `check:site`, `check:svg`, link/anchor checks, docs/site tests, `typecheck` as applicable |
| SC-9 | Analysis deliverables A–G exist and implementation follows approved prioritized batches | Artifacts present under planning folder; PR batches match plan |
| SC-10 | Final report lists remaining limitations, deferred work, and unverified claims | COMPLETE.md / close-out content |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | What problem and primary goal? | Comprehensive accuracy, IA, and UX review so docs are trustworthy and useful; not a superficial wording pass. Dense prose, fragmentation, unexplained terms, duplication, stale content discourage install/use. |
| Problem | Conceptual model and docs architecture? | Goal → Workflow → Activities → Techniques → Tools. Markdown canonical; `site/` hand-authored HTML; some regions from `generate-site-data.ts`; `SITE_ROUTES` for nav. Generated API/schema not hand-edited. Stable paths. Present-tense product docs; history only in planning artifacts. Progressive disclosure before specs. |
| Stakeholders | Who is affected? | Prospective users, operators, integrators, workflow authors, contributors, AI agents; maintainers and reviewers secondary. |
| Context | Surfaces and constraints? | Full inventory of user-facing docs/configs/scripts; exclude `.engineering/artifacts/` as product docs. Evidence = code/schemas/tests/scripts. Preserve URLs; no unrelated code changes; a11y without brand redesign. |
| Scope | In / out / process? | Nine analysis workstreams + analysis deliverables A–G before implement; then approved-scope implementation and validation suite + manual golden path. Out: product redesign, new SSG/platform, engineering artifacts as docs, wording-only, unrelated code, brand redesign. |
| Success | How do we know done? | Acceptance criteria SC-1–SC-10: accuracy, golden path, setup IA, canonical ownership, terminology, editorial quality, md/site agreement, automated+manual validation, analysis then batched implement, residual limitations reported. |

### Clarifications Made

- **Analysis before implementation:** Required deliverables A–G must be produced and reviewed before doc rewrites land in approved scope.
- **Two-layer lockstep:** Both markdown and `site/` are in scope; facts must agree; generators for generated regions.
- **Voice:** Product docs describe current system only; planning artifacts may record history/evolution.
- **Evidence hierarchy:** Implementation evidence beats repeated documentation statements; duplication is not corroboration.
- **Batching:** Implementation priority order fixed: (1) factual correctness/safety, (2) onboarding/navigation, (3) duplication reduction, (4) plain-language, (5) examples/troubleshooting, (6) a11y/presentation, (7) automated drift prevention.

### Open Questions Resolved

- **Breadth of “docs site update”:** Full documentation product improvement (accuracy + IA + UX + onboarding), not HTML-only and not a new docs platform.
- **Markdown vs site:** Both surfaces; reconcile and keep SITE_ROUTES/nav correct.
- **Research activity:** Not required (`needs_research=false`); evidence is in-repo.
- **Comprehension:** Prior activity completed; `needs_comprehension=false` for remaining path gates as set by user.

### Stakeholder transcript (source of truth)

Full user brief provided 2026-07-25 (meta checkpoint `stakeholder-transcript` / `provide-transcript`). Content covers primary goal, repository context, scope inventory, workstreams 1–11 (truth, journeys, IA, editorial, terminology, md/site, onboarding, a11y, deliverables A–G, implementation rules, validation), and acceptance criteria. Stored as this document’s requirements and log; raw brief retained in session/orchestrator handoff.

## Confirmation

**Confirmed by:** user checkpoint `elicitation-complete` / option `complete`
**Date:** 2026-07-25
**Notes:** Requirements derived entirely from the stakeholder transcript; agent-led domain interview skipped as transcript covers all five domains at specification depth. Effects: `elicitation_complete=true`. Next activity: implementation-analysis (`needs_research=false`).
