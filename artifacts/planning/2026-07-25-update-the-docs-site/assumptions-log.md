# Assumptions Log

> Update the Docs Site · updated 2026-07-25

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | Primary deliverable is accuracy/currency of published docs (markdown + `site/`), not a redesign of the MCP product or a new docs platform — request names “update the docs site” and the repo already has a documentation system. | — | Open (stakeholder may want platform or IA overhaul in scope) |
| DP-2 | Design Philosophy | Complexity Assessment | L | Moderate complexity is correct: multi-surface content work without architectural product change — matches multi-area docs layout and absence of defect/incident framing. | Code: `docs/documentation-system.md` two-layer model; `package.json` `build:site`/`check:site`; `site/{guide,specs,api,design}` | Validated |
| DP-3 | Design Philosophy | Workflow Path | M | Elicitation-only path is sufficient; in-repo docs patterns and generators replace external research — domain is local and established. | User checkpoint `classification-and-path-confirmed` / `elicitation-only` | Confirmed |
| DP-4 | Design Philosophy | Workflow Path | L | Codebase comprehension remains required before plan even when research is skipped — workflow path rules mandate `needs_comprehension=true` on every path. | Code: design-philosophy `determine-path` protocol (needs_comprehension always true) | Validated |
| DP-5 | Design Philosophy | Problem Interpretation | M | “Docs site” work in this repo is two-layer: markdown canonical + hand-authored `site/` HTML mirror — not HTML-only or markdown-only by default. | Code: `docs/documentation-system.md` (“Markdown is canonical” / “HTML site renders it”); generators tie routes to site pages | Partially Validated (system design pairs layers; package may still descope one surface in elicitation) |

## Open Assumptions

### DP-1: Scope of “docs site update”
**Assumption:** Primary deliverable is accuracy/currency of published docs (markdown + `site/`), not a redesign of the MCP product or a new docs platform.  
**Decision space:** (A) Content/fidelity refresh under the existing system — preferred for speed and risk; (B) Include navigation/IA redesign within `site/`; (C) Expand to a new static-site generator or docs platform.  
**Why not code-resolvable:** Stakeholder intent for breadth of change is not encoded in a ticket (issue skipped).  
**Technical context:** `docs/documentation-system.md` and `npm run build:site` / `check:site` already support (A) and limited (B). No in-repo mandate for (C).  
**Agent's position:** Prefer (A) with optional light nav cleanup only if pages moved; defer (C) unless elicitation demands it.  
**Reversibility:** path-committing if (C) is chosen; easily-reversible for (A)/(B) page-level edits.

### DP-5: Breadth across markdown vs site HTML (residual after partial validation)
**Assumption:** This package should keep both layers in lockstep unless elicitation explicitly descopes one.  
**Decision space:** (A) Both surfaces — default from documentation system; (B) `site/` HTML only; (C) markdown/`docs/*` only, site later.  
**Why not code-resolvable:** User may prioritize only the public GitHub Pages surface or only agent-facing markdown for this PR.  
**Technical context:** System design pairs layers; `generate-site-data.ts` and `check:site` enforce site integrity against routes.  
**Agent's position:** (A) both, with prioritization during elicitation of which pages matter first.  
**Reversibility:** easily-reversible if one surface is later descoped.

## Wrap-Up

5 assumptions at design-philosophy — 2 open residue (DP-1, DP-5), 1 user-confirmed (DP-3), 1 code-validated (DP-2), 1 partially validated (DP-4 validated; DP-5 partial). Challenge (stakeholder-gap, rejected-paths, evidence-strength): no additional agent-resolvable items; residue is stakeholder scope for elicitation.
