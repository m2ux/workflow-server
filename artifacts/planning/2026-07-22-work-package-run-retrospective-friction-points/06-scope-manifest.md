# Scope Manifest — Work-Package Run Retrospective Friction Points

**Target:** `work-package` v3.34.0 · `meta` / harness-compat · `ponytail` · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-22-work-package-run-retrospective-friction-points/` ✅ · folder layout unchanged

In-place activity/technique/resource edits for nine #272 friction fixes + item 10 (README write+push) + universal planning README (drop design-context layout) + Apply-model agent techniques (prompts → techniques). Intentional removals: **8** (prior 6 + two prompt resources). Draft under open A-1–A-2, A-5, A-9 agent positions (A-3/A-4 corrected); Gate 2 settles.

`file_count` = **35** (prior + agent techniques / compose-prompt / workflow.yaml / deletes)

---

## File manifest

| # | Path (under worktree root) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `meta/activities/00-discover-session.yaml` | activity | modify | Keep `list-available-workflows` bind; permit via prompt/conduct only — no activity rule naming the step (A-1 revise) |
| 2 | `meta/resources/activity-worker-prompt.md` | resource | **delete** | Promoted to `workflow-engine::activity-worker` (Apply model) |
| 2a | `meta/techniques/workflow-engine/activity-worker.md` | technique | create | Worker entry Protocol/Rules (from former prompt) |
| 2b | `meta/techniques/workflow-engine/compose-prompt.md` | technique | modify | Minimal Apply stub from `agent_technique` + substitutions |
| 2c | `meta/workflow.yaml` | workflow | modify | Hoist `activity-worker` on `techniques.activity`; `workflow-orchestrator` on `techniques.workflow` |
| 3 | `meta/techniques/agent-conduct.md` | technique | modify | Align bundled-tools / control-plane wording with discover-session bind |
| 4 | `meta/techniques/workflow-engine/evaluate-transition.md` | technique | modify | Document evaluated-condition summary alongside `next_activity_id` for envelope fold |
| 5 | `meta/techniques/workflow-engine/finalize-activity.md` | technique | modify | Fold `next_activity_id` + evaluated condition into `activity_complete` (A-2 convention) |
| 6 | `meta/techniques/workflow-engine/dispatch-activity.md` | technique | modify | Envelope next id; Progress ◐; `agent_technique` bind (was `prompt_template`); blocked/skip call sites |
| 7 | `meta/resources/workflow-orchestrator-prompt.md` | resource | **delete** | Promoted to `workflow-engine::workflow-orchestrator` (Apply model) |
| 7a | `meta/techniques/workflow-engine/workflow-orchestrator.md` | technique | create | Orchestrator entry Protocol/Rules (from former prompt) |
| 8 | `meta/activities/03-dispatch-client-workflow.yaml` | activity | modify | Envelope `next_activity_id`; commit-and-persist; `agent_technique: workflow-engine::activity-worker` |
| 8a | `meta/techniques/workflow-engine/commit-and-persist.md` | technique | modify | Applies sync-progress-status → ✅ then engineering commit+push |
| 8g | `meta/techniques/workflow-engine/sync-progress-status.md` | technique | create | Orchestrator Progress Status writer for all icons (⬚/◐/✅/❌/⊘) |
| 8d | `meta/resources/planning-readme.md` | resource | modify | Sole universal Template + Progress Status policy; seed via readme-seed profiles |
| 8e | `work-package/resources/readme.md` | resource | modify | Thin pointer to planning-readme Template + readme-seed |
| 8e2 | `work-package/resources/readme-seed.md` | resource | create | WP Progress inventory + classifier + mode-exclusion map |
| 8f | `workflow-design/resources/design-context-readme.md` | resource | **delete** | Parallel layout guide removed — universal Template + WD readme-seed |
| 8f2 | `workflow-design/resources/readme-seed.md` | resource | create | WD Progress inventory + classifier + mode-exclusion map |
| 8f3 | `meta/techniques/workflow-engine/create-readme.md` | technique | create (hoist) | Universal seed from Template + seed_profile (from work-package manage-artifacts) |
| 8f4 | `meta/techniques/workflow-engine/verify-readme-conforms.md` | technique | create (hoist) | Drift-check against planning-readme Template (+ seed appends) |
| 8f5 | `work-package/techniques/manage-artifacts/create-readme.md` | technique | **delete** | Hoisted to meta workflow-engine |
| 8f6 | `work-package/techniques/manage-artifacts/verify-readme-conforms.md` | technique | **delete** | Hoisted to meta workflow-engine |
| 8h | `workflow-design/resources/design-principles.md` | resource | modify | §29 Cite Resource Policy; Do Not Restate It (technique cites resource policy) |
| 8b | `meta/techniques/version-control/commit-regular-files.md` | technique | modify | Post-activity hook is commit request; push required (item 10) |
| 8c | `meta/techniques/workflow-engine/finalize-activity.md` | technique | modify | Drop worker README Progress duty; envelope compile + next_activity only |
| 9 | `meta/activities/02-resolve-target.yaml` | activity | modify | `submodule-selection`: add cancel/re-list option (≥2 presentable) (A-5) |
| 10 | `meta/techniques/harness-compat/TECHNIQUE.md` | technique | modify | Abstract blocking-equivalent contract; host details out (removal 1) |
| 11 | `meta/techniques/harness-compat/spawn-agent.md` | technique | modify | Dispatch to harness-specific techniques (removal 2) |
| 12 | `meta/techniques/harness-compat/continue-agent.md` | technique | modify | Same — harness-agnostic continue (removal 3) |
| 12a | `meta/techniques/harness-compat/spawn-concurrent.md` | technique | modify | Same separation; resolves via `resolve-harness-operation` |
| 12b–e | `meta/techniques/harness-compat/{claude-code,cursor,cline,generic}.md` | technique | create | Host invoke + Cursor async+notify blocking-equivalent |
| 12f | `meta/techniques/harness-compat/resolve-harness-operation.md` | technique | create | Single authoritative `{harness_kind}` → harness technique map |
| 13 | `work-package/workflow.yaml` | workflow | modify | Hand-off vars; **deleted** worker-side README progress activity rule (item 10 single-source) |
| 13a | `workflow-design/workflow.yaml` | workflow | modify | Deleted duplicated README progress activity rule (item 10 single-source) |
| 13b | `requirements-refinement/workflow.yaml` | workflow | modify | Deleted duplicated README progress activity rule (item 10 single-source) |
| 14 | `work-package/activities/11-validate.yaml` | activity | modify | Local-run gate; Progress N/A via `{mark_progress_na}` when unavailable; suite-only (A-3 corrected) |
| 15 | `work-package/activities/13-submit-for-review.yaml` | activity | modify | Primary build-artifact check + hand-off before mark-ready (A-4); replaces validate gates + prior thin recheck |
| 16 | `work-package/activities/12-strategic-review.yaml` | activity | modify | Bind post-impl `update-pr::render` tense refresh (A-9) |
| 17 | `work-package/techniques/manage-artifacts/write-artifact.md` | technique | modify | Write-time find-or-update enforcement; mint-conflict → assumptions-log row |
| 18 | `work-package/resources/pr-description.md` | resource | modify | Post-impl tense/checklist guidance so Initial “coming next” does not linger |
| 19 | `work-package/techniques/update-pr/render.md` | technique | modify | Mid-lifecycle refresh / variant selection after implementation lands |
| 20 | `work-package/techniques/update-pr/TECHNIQUE.md` | technique | modify | Orient refresh bind sites (strategic-review + submit final) |
| 21 | `ponytail/techniques/review-over-engineering.md` | technique | modify | Hard trim: comment bulk proportional to surrounding code |
| 22 | `ponytail/resources/review-taxonomy.md` | resource | modify | Taxonomy/heuristic for comment over-verbosity |

**Out of scope this pass:**
- `meta/techniques/workflow-engine/present-checkpoint-to-user.md` single-option tolerance (A-5 assumes YAML ≥2 only unless Gate 2 chooses belt-and-suspenders)
- `work-package/activities/08-implement.yaml` PR refresh bind (A-9 prefers strategic-review)
- MCP `src/` / `schemas/` (A-2 convention-first)
- Environment/harness bugs listed as non-workflow-server in #272
- Activity add/remove/reorder
- Closing A-1–A-2, A-4–A-5, A-9 at draft time — draft under agent positions; Gate 2 confirms. A-3 corrected (Progress N/A).

---

## Structural design

```
{worktree}/                         # unchanged top-level layout
├── meta/
│   ├── activities/
│   │   ├── 00-discover-session.yaml
│   │   ├── 02-resolve-target.yaml
│   │   └── 03-dispatch-client-workflow.yaml
│   ├── resources/                 # prompts deleted (Apply model)
│   ├── workflow.yaml              # techniques.activity / .workflow hoist
│   └── techniques/
│       ├── agent-conduct.md
│       ├── harness-compat/
│       │   ├── TECHNIQUE.md
│       │   ├── spawn-agent.md
│       │   └── continue-agent.md
│       └── workflow-engine/
│           ├── activity-worker.md
│           ├── workflow-orchestrator.md
│           ├── compose-prompt.md
│           ├── evaluate-transition.md
│           ├── finalize-activity.md
│           └── dispatch-activity.md
├── work-package/
│   ├── workflow.yaml
│   ├── activities/
│   │   ├── 11-validate.yaml
│   │   ├── 12-strategic-review.yaml
│   │   └── 13-submit-for-review.yaml
│   ├── resources/
│   │   └── pr-description.md
│   └── techniques/
│       ├── manage-artifacts/write-artifact.md
│       └── update-pr/{TECHNIQUE.md,render.md}
└── ponytail/
    ├── techniques/review-over-engineering.md
    └── resources/review-taxonomy.md
```

**Flow:** Activity topology unchanged (WP 15 / meta 5). New gates are step-internal on validate / submit / submodule-selection. Dispatch loop reads worker-reported `next_activity_id` instead of inferring from prose.

| Pattern | This change |
|---------|-------------|
| Bound-step tool permit | Discover catalog stays on worker; `activity-worker` Rules make `list_workflows` permit unmistakable |
| Apply-model agent entry | Prompts → techniques; compose-prompt stub; ops-bundle inheritance |
| Worker-evaluated transition report | `finalize-activity` folds `evaluate-transition` outputs into `activity_complete` |
| Supported hand-off states | Declared vars + blocking validate checkpoint; no ad-hoc result_type |
| Presentable gates | ≥2 YAML options on `submodule-selection` |
| Blocking-equivalent dispatch | `foreground-always` intent via async+notify |
| Single logical artifact | Write-time find-or-update + assumptions-log on mint conflict |
| Lifecycle-linked PR body | `update-pr::render` at strategic-review (not only submit final) |
| Comment proportionality | Ponytail lean-coding hard trim criterion |

---

## Drafting order

1. **Meta discover + permit** — discover-session, activity-worker technique, agent-conduct (item 1)
2. **Next-activity envelope** — evaluate-transition → finalize-activity → dispatch-activity → workflow-orchestrator technique → dispatch-client-workflow (item 2)
3. **Presentable submodule gate + harness-compat** — resolve-target options; foreground-always soften (items 5–6)
4. **WP validate / submit / variables** — workflow.yaml vars; validate suite-only + Progress N/A; submit owns build-artifact hand-off (items 3–4)
5. **Artifact write + PR tense + lean comments** — write-artifact; pr-description + update-pr + strategic-review bind; ponytail (items 7–9)

**Rationale:** Meta routing/permit first so dispatch envelope is coherent; WP hand-offs next; shared write/PR/comment polish last.
