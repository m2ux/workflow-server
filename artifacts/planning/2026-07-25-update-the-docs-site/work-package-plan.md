# Update the Docs Site — Implementation Plan

> plan · HIGH · Planning · 3–6h agentic + 1–2h review · 2026-07-25

## Overview

### Problem & Scope

Problem, scope, and success criteria: [requirements](requirements-elicitation.md).

## Inputs

- [Requirements elicitation](requirements-elicitation.md#scope) — A–G before implement; batches 1–7; SC-1–SC-10
- [Implementation analysis](implementation-analysis.md#c-accuracy-and-contradiction-register) — evidence register C-01–C-14, journeys, IA, baselines
- [Design philosophy](design-philosophy.md) — elicitation-only path; two-layer docs system preserved

## Proposed Approach

### Solution Design

Execute the seven batches in [implementation-analysis §G](implementation-analysis.md#g-prioritized-implementation-plan-7-batches) on branch `docs/update-the-docs-site` (worktree `.worktrees/2026-07-25-update-the-docs-site`), after stakeholder confirms this approach. **No product/MCP server behavior changes** except documentation, generators, and doc-validation automation.

1. **Rebase/merge main** so site regen and tool drift fixes land before hand edits.
2. **Batch 1 accuracy** — close high-severity contradictions (tool counts, `session_index`, Skill→Technique, HTTP methods, ghost paths, `setup.md` link).
3. **Batch 2 onboarding** — README spine, day-two naming, deploy/init/install callout, verify smoke, specifications hub links.
4. **Batches 3–6** — duplication, plain language, troubleshooting/examples, a11y (no brand redesign).
5. **Batch 7** — mechanical drift guards + full validation + manual golden path.
6. Commit per batch (or logical sub-batch) on PR #293; regenerate `site/api/*` only via `npm run build:site`.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| A. Seven batches on existing two-layer system | Matches requirements; reviewable; low platform risk | Multi-commit PR | **Selected** |
| B. New SSG / docs platform | Cleaner long-term | Explicitly out of scope (D-1) | Rejected |
| C. HTML-only site polish | Faster | Leaves markdown drift; fails SC-7 | Rejected |
| D. Implement before analysis review | Speed | Violates SC-9 / stakeholder gate | Rejected |

### Assumptions

Assumptions underlying the approach: [assumptions log](assumptions-log.md).

## Implementation Tasks

Ordered by dependency. Each task is a docs/automation change only.

### Task 1: Sync branch with main (15–30 min)

**Goal:** Absorb latest site/tool regen and avoid double-fixing stale HTML.  
**Deliverables:**
- Worktree `docs/update-the-docs-site` rebased or merged with `main`
- Conflict resolution limited to docs/site if any

### Task 2: Batch 1 — Factual correctness (45–90 min)

**Goal:** Close C-01–C-09, C-12–C-14 accuracy items.  
**Deliverables:**
- Prose fixes: tool counts (17 / 13+4), remove false “sixteen/twelve”
- `docs/ide-setup.md` + example rules: `session_index` only
- `AGENTS.md` / `CLAUDE.md`: Goal → Workflow → Activities → Techniques → Tools
- `docs/api-reference.md`: GET/DELETE `/mcp` with POST
- `docs/documentation-system.md`: retarget ghost `site/internals/` and `rationale.html`
- `.engineering/AGENTS.md`: `setup.md` not `SETUP.md`
- `npm run build:site` committed if generated regions change

### Task 3: Batch 2 — Onboarding and navigation (45–90 min)

**Goal:** Prospective-user path without implementation knowledge (SC-2, SC-3).  
**Deliverables:**
- `README.md` journey spine + documentation map links
- `setup.md` §4 / day-two anchor aligned with `http.md` / `stdio.md` / `site/guide/getting-started.html`
- deploy vs init-repo vs install decision callout in setup
- Verify guidance prioritizes `discover` + `start_session({ repo })`
- `site/specifications.html` links to orchestra + technique protocol + schemas

### Task 4: Batch 3 — Duplication reduction (30–60 min)

**Goal:** Canonical owners per [§D](implementation-analysis.md#d-duplication-and-consolidation-map).  
**Deliverables:**
- Thin mirrors; transport files delta-only audit
- No competing full install procedures

### Task 5: Batch 4 — Plain language and voice (45–90 min)

**Goal:** SC-6 editorial standard on onboarding + plain intros on dense specs.  
**Deliverables:**
- Outcomes-first edits on README/setup/guide
- Present-tense voice scrub on worst product-doc offenders (not planning artifacts)
- Optional short intros on normative specs (content stays precise)

### Task 6: Batch 5 — Examples and troubleshooting (30–60 min)

**Goal:** Real failure modes near failure points; golden-path cues.  
**Deliverables:**
- Troubleshooting blocks in http/stdio (and links from setup)
- Expected verify outputs; examples/cursor-workspace synced to ide-setup rule

### Task 7: Batch 6 — Accessibility and presentation (30–45 min)

**Goal:** Usability/a11y without brand redesign.  
**Deliverables:**
- Landmark/focus/contrast/overflow fixes in `site/style.css` / HTML as needed
- `npm run check:svg` clean

### Task 8: Batch 7 — Drift automation and validation (30–60 min)

**Goal:** Prevent recurrence; prove SC-8.  
**Deliverables:**
- Guard for tool-count / critical claim drift (test or script)
- Full suite: `build:site`, `check:site`, `check:svg`, site tests, typecheck as applicable
- Manual golden-path walk checklist results noted in PR or COMPLETE later

## Success Criteria

Success criteria: [requirements](requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](implementation-analysis.md#baseline-metrics-reproducible).

Task-level acceptance (link to gaps):

| Item | Gap / SC |
|------|----------|
| Zero false tool-count strings | C-01, C-02 / SC-1 |
| No `session_token` in product agent docs | C-03 / SC-5 |
| No Skill-in-model-line in AGENTS/CLAUDE | C-04 / SC-5 |
| Ghost paths removed or retargeted | C-07, C-08 / SC-7 |
| day-two / §4 consistent | C-05 / SC-3 |
| Site tests + check:site/svg pass | SC-8 |
| Analysis reviewed before Batch 1 content lands | SC-9 |

## Testing Strategy

Test cases and acceptance matrix: [test plan](test-plan.md).

## Dependencies & Risks

### Requires (Blockers)

- [ ] Stakeholder **approach-confirmed** on this plan + A–G analysis (this checkpoint)
- [ ] Access to docs worktree and ability to push PR #293 branch

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Large hand-authored site/md parity scope | HIGH | MEDIUM | Batch 1–2 first; defer optional new HTML pages (D-4, D-5) |
| Merge conflicts with main site regen | MEDIUM | MEDIUM | Task 1 first; regenerate rather than hand-merge generated regions |
| Editorial scope creep into brand redesign | MEDIUM | LOW | Hard out-of-scope D-2; a11y-only in Batch 6 |
| Push/SSH failures on engineering submodule | LOW | MEDIUM | Retry with full perms; note in handoff |

**Status:** Ready for implementation after approach-confirmed
