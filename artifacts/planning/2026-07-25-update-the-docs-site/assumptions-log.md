# Assumptions Log

> Update the Docs Site · updated 2026-07-25

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence
(DP-1, RE-1, RS-1, IA-1, PL-1) or task number (1.1, 2.3).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | Primary deliverable is accuracy/currency of published docs (markdown + `site/`), not a redesign of the MCP product or a new docs platform — request names “update the docs site” and the repo already has a documentation system. | User stakeholder transcript 2026-07-25: comprehensive accuracy/IA/UX under existing two-layer system; explicit out-of-scope for new SSG/platform and product redesign | Confirmed |
| DP-2 | Design Philosophy | Complexity Assessment | L | Moderate complexity is correct: multi-surface content work without architectural product change — matches multi-area docs layout and absence of defect/incident framing. | Code: `docs/documentation-system.md` two-layer model; `package.json` `build:site`/`check:site`; `site/{guide,specs,api,design}` | Validated |
| DP-3 | Design Philosophy | Workflow Path | M | Elicitation-only path is sufficient; in-repo docs patterns and generators replace external research — domain is local and established. | User checkpoint `classification-and-path-confirmed` / `elicitation-only` | Confirmed |
| DP-4 | Design Philosophy | Workflow Path | L | Codebase comprehension remains required before plan even when research is skipped — workflow path rules mandate `needs_comprehension=true` on every path. | Code: design-philosophy `determine-path` protocol (needs_comprehension always true); later user set `needs_comprehension=false` after comprehension activity | Validated |
| DP-5 | Design Philosophy | Problem Interpretation | M | “Docs site” work in this repo is two-layer: markdown canonical + hand-authored `site/` HTML mirror — not HTML-only or markdown-only by default. | User stakeholder transcript: reconcile markdown and site; both in scope inventory; SITE_ROUTES and generators | Confirmed |
| RE-1 | Requirements Elicitation | Requirement Interpretation | H | Analysis deliverables A–G are mandatory gates before implementation edits land — stakeholder §9–10 order analysis then implement after review. | User brief §9 Required analysis deliverables; §10 “After the analysis is reviewed” | Confirmed |
| RE-2 | Requirements Elicitation | Scope Boundaries | M | Filenames and public URLs stay stable unless a change is demonstrably necessary — heavy cross-linking and stakeholder path-stability rule. | User brief Repository context + Implementation requirements | Confirmed |
| RE-3 | Requirements Elicitation | Implicit Requirements | M | Product documentation voice is present-tense current behavior only; historical “formerly/previously/now/no longer/replaces” belongs only in planning artifacts. | User brief Repository context; `.engineering/AGENTS.md` documentation voice | Confirmed |
| RE-4 | Requirements Elicitation | Success Criteria Interpretation | M | Package is not complete when only automated checks pass — manual golden-path walk as a new user is required. | User brief §11 Validation and Acceptance criteria | Confirmed |
| RE-5 | Requirements Elicitation | Scope Boundaries | L | Implementation batch order is fixed priority 1–7 (facts → onboarding → duplication → plain language → examples → a11y → automation). | User brief §9G / §10 | Confirmed |
| RE-6 | Requirements Elicitation | Requirement Interpretation | M | Stakeholder transcript fully substitutes for agent-led domain interview; five domains answered at specification depth without further Q&A before confirmation. | User checkpoint `elicitation-complete` / `complete` | Confirmed |
| IA-1 | Implementation Analysis | Current Behavior | L | Worktree docs baseline is valid for analysis even though main has a newer site regen commit — gaps are structural and will re-verify after rebase. | `git log HEAD..main -- site`; tool-count issues present on both | Validated |
| IA-2 | Implementation Analysis | Gap Identification | M | Closing C-01–C-09 in Batch 1 is sufficient to restore factual trust before large editorial rewrites. | Contradiction register severity mix; SC-1 priority | Validated (plan) |
| IA-3 | Implementation Analysis | Baseline Interpretation | L | SITE_ROUTES↔HTML equality means route registry is healthy; drift is content/claims not missing pages. | Python set equality on worktree | Validated |
| IA-4 | Implementation Analysis | Dependency Understanding | M | Hand-authored site design/specs pages will not auto-sync from markdown — parity is a manual Batch 1–4 duty. | documentation-system.md; no md→html compiler for specs | Validated |
| IA-5 | Implementation Analysis | Gap Identification | L | Adding new site pages (rationale, internals, orchestra HTML) is optional; prefer retargeting claims and hub links to preserve URL stability. | Requirements path-stability; C-07/C-08 | Confirmed (agent position for plan) |
| PL-1 | Plan & Prepare | Design Approach | M | Seven-batch plan on existing two-layer system is the right implementation shape versus platform rewrite or HTML-only polish. | User checkpoint `approach-confirmed` / `confirmed` (2026-07-25) | Confirmed |
| PL-2 | Plan & Prepare | Task Breakdown | L | Single PR #293 with batch-labeled commits is preferable to seven PRs for this docs package. | User checkpoint `approach-confirmed` / `confirmed` (2026-07-25) | Confirmed |
| PL-3 | Plan & Prepare | Test Strategy | L | Site automated tests + manual golden path suffice; no new MCP server unit suite required unless Batch 7 adds a check script. | tests/site.test.ts; docs-only scope | Validated (plan) |
| PL-4 | Plan & Prepare | Scope Decisions | M | Batches 3–6 may be trimmed after Batch 1–2 if review wants a minimal ship; Batch 1–2 are non-negotiable for SC-1/SC-2. | User checkpoint `approach-confirmed` / `confirmed` (2026-07-25); full plan accepted | Confirmed |
| AR-1 | Assumptions Review | Scope Decisions | L | No significant residual assumptions ([reason]) — pre-implement residue empty after plan-prepare close-out; DP/RE/IA/PL all Confirmed or Validated; Open Assumptions empty; out-of-scope items live only in deferred-items (D-1–D-5), not as open assumptions. | Code: assumptions-log Open empty; session `has_open_assumptions=false`; deferred-items.md | Validated |
| IM-2 | Implement | Scope Decisions | M | Root `README.md` rewrite is **out of scope** for this package — stakeholder reverted the journey-spine rewrite; onboarding spine remains `setup.md` / site guide / transport docs only. | User direction 2026-07-25 (“i reverted the readme.md changes. that is out of scope”) | Confirmed |
| IM-1 | Implement | Editorial Standard | M | Fixed inventory counts (tool totals, “sixteen tools”, registrar tool counts) must be **removed** from product docs, not corrected to a new number — they go stale and are not useful. Prefer “registered MCP tools” + link to generated catalog. | User direction 2026-07-25 (“counts should be removed… unless absolutely necessary”) | Confirmed |

## Open Assumptions

_None. Residual collect and analyse-challenge left no stakeholder-dependent opens._

## Wrap-Up

22 assumptions — all validated/confirmed (incl. IM-2 README out of scope). AR-1 null residual at assumptions-review (no interview/batch). No deferred assumptions this activity. IM-2 confirmed after Batch 2 README rewrite was reverted. See [work-package-plan.md](work-package-plan.md), [deferred-items](deferred-items.md).
