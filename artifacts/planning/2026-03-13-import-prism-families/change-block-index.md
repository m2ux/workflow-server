# Change Block Index

> **Branch**: `enhancement/53-import-prism-families`
> **Base**: `workflows`
> **Commits**: 8
> **Total**: 39 files changed, 1011 insertions, 201 deletions

## File Index

| Row | Path | Type | Category |
|-----|------|------|----------|
| 1 | `prism/workflow.toon` | M | Workflow definition |
| 2 | `prism/activities/00-select-mode.toon` | M | Activity |
| 3 | `prism/activities/01-structural-pass.toon` | M | Activity |
| 4 | `prism/activities/02-adversarial-pass.toon` | M | Activity |
| 5 | `prism/activities/03-synthesis-pass.toon` | M | Activity |
| 6 | `prism/activities/04-deliver-result.toon` | M | Activity |
| 7 | `prism/activities/05-behavioral-synthesis-pass.toon` | A | Activity (new) |
| 8 | `prism/skills/01-full-prism.toon` | M | Skill |
| 9 | `prism/skills/02-portfolio-analysis.toon` | M | Skill |
| 10 | `prism/skills/03-plan-analysis.toon` | M | Skill |
| 11 | `prism/skills/04-orchestrate-prism.toon` | M | Skill |
| 12 | `prism/skills/05-behavioral-pipeline.toon` | A | Skill (new) |
| 13 | `prism/resources/03-l12-general-structural.md` | D | Resource (deprecated) |
| 14 | `prism/resources/04-l12-general-adversarial.md` | D | Resource (deprecated) |
| 15 | `prism/resources/05-l12-general-synthesis.md` | D | Resource (deprecated) |
| 16 | `prism/resources/12-deep-scan.md` | A | Resource — SDL |
| 17 | `prism/resources/13-sdl-trust.md` | A | Resource — SDL |
| 18 | `prism/resources/14-sdl-coupling.md` | A | Resource — SDL |
| 19 | `prism/resources/15-sdl-abstraction.md` | A | Resource — SDL |
| 20 | `prism/resources/16-rec.md` | A | Resource — SDL |
| 21 | `prism/resources/17-ident.md` | A | Resource — SDL |
| 22 | `prism/resources/18-73w.md` | A | Resource — SDL |
| 23 | `prism/resources/19-error-resilience.md` | A | Resource — Behavioral |
| 24 | `prism/resources/20-optim.md` | A | Resource — Behavioral |
| 25 | `prism/resources/21-evolution.md` | A | Resource — Behavioral |
| 26 | `prism/resources/22-api-surface.md` | A | Resource — Behavioral |
| 27 | `prism/resources/23-behavioral-synthesis.md` | A | Resource — Behavioral |
| 28 | `prism/resources/24-error-resilience-neutral.md` | A | Resource — Neutral |
| 29 | `prism/resources/25-api-surface-neutral.md` | A | Resource — Neutral |
| 30 | `prism/resources/26-evolution-neutral.md` | A | Resource — Neutral |
| 31 | `prism/resources/27-error-resilience-compact.md` | A | Resource — Compressed |
| 32 | `prism/resources/28-error-resilience-70w.md` | A | Resource — Compressed |
| 33 | `prism/resources/29-evidence-cost.md` | A | Resource — Hybrid |
| 34 | `prism/resources/30-reachability.md` | A | Resource — Hybrid |
| 35 | `prism/resources/31-fidelity.md` | A | Resource — Hybrid |
| 36 | `prism/resources/32-state-audit.md` | A | Resource — Hybrid |
| 37 | `prism/resources/README.md` | M | Documentation |
| 38 | `prism/skills/README.md` | M | Documentation |
| 39 | `prism/README.md` | M | Documentation |

## Summary

| Type | Count |
|------|-------|
| Added (A) | 23 |
| Modified (M) | 13 |
| Deleted (D) | 3 |
| **Total** | **39** |

## Estimated Review Time

~20 minutes (39 files × 30 sec/file)
