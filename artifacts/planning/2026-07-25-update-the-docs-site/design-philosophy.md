# Design Philosophy

> design-philosophy · Update the Docs Site · 2026-07-25

## Problem Statement

Published workflow-server documentation (markdown sources and the hand-authored `site/` HTML) drifts from the product, so readers cannot reliably find accurate setup, workflow, and day-to-day guidance. Drift wastes onboarding time, drives misconfiguration, and erodes trust in official material. The work is a content and site-structure refresh under the existing documentation system — not investigation of a runtime defect.

### System Context

- **Canonical prose:** root `README.md`, setup/transport docs, and `docs/*` (architecture, API, fidelity, IDE setup, engineering storage, model specs).
- **Published site:** hand-authored `site/` (`guide/`, `specs/`, `api/`, `design/`), shared `nav.js` / `style.css`, plus generators and CI (`build:site`, `check:site`, deploy-docs).
- **Workflow data:** separate `workflows` worktree/branch content that the site and docs must stay aligned with.
- **Consumers:** human operators and AI agents following IDE bootstrap rules into MCP discovery and session navigation.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium |
| Scope | Onboarding, configuration, and correct use of workflow-server via docs site and markdown |
| Business Impact | Continued drift increases support burden, failed setups, and distrust of official guidance |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** Nothing is broken or failing; the work improves the published docs site and aligned markdown so guidance stays accurate and current. Drift is the known condition; the path is content and structure refresh under the existing documentation system (markdown canonical, hand-authored `site/` HTML, `build:site` / `check:site` / deploy-docs), not root-cause investigation of a defect. Complexity is moderate: multiple surfaces (README/setup/transport, `docs/*`, `site/guide|specs|api|design`, generators and CI) and content-prioritization trade-offs, without new product architecture. Scope is open enough that elicitation should pin success criteria before plan/implement.

## Workflow Path Decision

**Selected Path:** Elicitation only

**Activities Included:**
- [x] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Domain and tooling are well understood in-repo; external KB/web research is not required. Requirements are still open (which pages and fidelity bar matter most, what “done” means for the site update). Path gates: `needs_elicitation=true`, `needs_research=false`, `skip_optional_activities=false`, `needs_comprehension=true`. Codebase comprehension remains mandatory before planning. Confirmed at checkpoint `classification-and-path-confirmed` option `elicitation-only`.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Agentic planning + implementation within a single work-package PR cycle |
| Technical | Prefer existing docs system; avoid inventing a new site stack unless elicitation demands it |
| Dependencies | Align markdown, `site/` HTML, generators, and CI deploy path; workflows branch content as needed |
| Resources | Branch `docs/update-the-docs-site`, worktree, draft PR #293; issue skipped |

## Success Criteria

Success criteria: [requirements](requirements-elicitation.md#success-criteria) once elicited.

## Notes

- Issue creation was skipped; tracking is PR #293.
- Planning folder: `2026-07-25-update-the-docs-site` under engineering artifacts.
