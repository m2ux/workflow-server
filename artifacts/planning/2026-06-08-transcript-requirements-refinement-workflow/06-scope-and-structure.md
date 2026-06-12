# 06 — Scope and Structure

**Activity:** scope-and-structure · **Status:** ✅ Complete · `scope_manifest_confirmed=true`, `approach_confirmed=true`.

## Worktree
- `workflows/` worktree present, branch `workflows`, clean tree. Target folder `requirements-refinement/` absent (fresh create).

## File manifest (21 files, all `create`) — root `workflows/requirements-refinement/`
| Path | Type | Description |
|------|------|-------------|
| `workflow.toon` | workflow | Metadata, executionModel (orchestrator+worker), 12 variables, rules, `artifactLocations.planning`, initialActivity |
| `README.md` | readme | Root README: description, activity table, usage |
| `activities/01-intake-sources.toon` | activity | Capture/validate paths, detect augment-vs-create, load sources |
| `activities/02-analyze-transcript.toon` | activity | Produce requirements analysis report; gate before applying |
| `activities/03-update-specification.toon` | activity | Apply analysis/correction → updated spec working version |
| `activities/04-validate-specification.toon` | activity | Validate + categorize + route (conditional transitions) |
| `activities/05-finalize-specification.toon` | activity | Stage final spec + change summary; promotion checkpoint |
| `activities/06-report-failure.toon` | activity | Markdown failure report terminal |
| `activities/README.md` | readme | Activities index |
| `techniques/TECHNIQUE.md` | technique | Root base contract: shared inputs + spec-fidelity rule |
| `techniques/analyze-transcript.md` | technique | Parse transcript + spec → analysis report |
| `techniques/update-specification.md` | technique | Apply changes (initial + correction modes) |
| `techniques/validate-specification.md` | technique | Validate + categorize issues |
| `techniques/finalize-specification.md` | technique | Assemble final spec + change summary |
| `techniques/report-failure.md` | technique | Compile failure report |
| `techniques/README.md` | readme | Techniques index |
| `resources/specification-protocol.md` | resource | SRS layout verbatim (§1–7, entry format, ID schemes, status rules) |
| `resources/requirements-analysis-report.md` | resource | Analysis report template |
| `resources/validation-rubric.md` | resource | Validation checks + severity/type categorization |
| `resources/change-summary.md` | resource | Change-summary template |
| `resources/README.md` | readme | Resources index |

## Transition map
```
intake-sources → analyze-transcript → update-specification → validate-specification
                                              ▲                      │
              (correctable & iter<max; iter++)└──────────────────────┤
                                                                     ├─[validation_passed] → finalize-specification → ∎
                                                                     └─[critical OR iter≥max] (default) → report-failure → ∎
```

## Implementation order
`workflow.toon` → `activities/01..06` → `techniques/TECHNIQUE.md` + 5 techniques → 4 resources → READMEs. Schema-validate each TOON immediately after drafting; final full-corpus validation in validate-and-commit.
