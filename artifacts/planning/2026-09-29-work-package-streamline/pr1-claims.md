# PR 1 — claim table

Branch `workflow/work-package-lean-templates`. Specimen `work-package-registers-conformance`.

Run record: MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-lean-templates` · corpus pin `fef39440` · engine pin `a59870c7-dirty` (untracked `node_modules` link only). MVW session `GSFUX3` held (one dispatch to terminal). Specimen session `JOJCZT`, planning folder `exp-projects/workflow-server/.engineering/artifacts/planning/2026-09-30-work-package-registers-conformance`.

| # | Claim | Evidence | Case | Result |
|---|---|---|---|---|
| 1 | Appending deferrals writes `deferred-items.json`, one JSON entry per item, `issue` null | sidecar walk | `record-deferrals` append | held — delivered artifact `deferred-items.json`, audience `agent`, template and rules sections bundled |
| 2 | Recording a raised issue fills that entry's `issue` | sidecar walk | `record-deferrals` raise | held — record bound `deferred_items_register` from append's output and the three renamed inputs |
| 3 | Collecting with no register yields an empty set and `false`, not a fault | sidecar walk | `negative-case` | held — input fell back to its default; outputs `[]` / `false` |
| 4 | Collecting returns only entries whose `issue` is null | sidecar walk | `positive-case` | held — `[D-2]` / `true` |
| 5 | The borrowed techniques deliver with their JSON guides resolvable | sidecar walk | every activity | held — `work-package/deferred-items#template` and `#rules` served |
| 6 | No activity's artifact contract names a method record, a `.md` register or the `.md` comprehension log | walk snapshot diff | commits 1–3 | held |
| 7 | Guards stay at the base's result | `check-all` diff against base | every commit | held — one pre-existing `activity-variables` failure |

## Found by the walk

- The register output binds straight into the next technique's input, which names the register by bare filename, while the output and activity-variable descriptions called it the register's contents. Descriptions now say bare filename.
- The register guide says the register is unprefixed, while the server offers the activity's `artifact_prefix` and the walk snapshot records `07-deferred-items.json`. Pre-existing; carried to PR 3.
