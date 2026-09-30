# PR 1 — claim table

Branch `workflow/work-package-lean-templates`. Specimen `work-package-registers-conformance`.

Run record: MCP `http://127.0.0.1:32772/mcp` · image `workflow-server:exp-lean-templates` · engine pin `a59870c7-dirty` (untracked `node_modules` link only). First walk: corpus `fef39440`, MVW `GSFUX3`, specimen `JOJCZT` (planning folder `…/2026-09-30-work-package-registers-conformance`). Walk after the canon audit's fixes: corpus `b9f77e0e`, MVW `TL5UPS`, specimen `QFDSY7` (planning folder `…/2026-09-30-work-package-registers-conformance-2`).

| # | Claim | Evidence | Case | Result |
|---|---|---|---|---|
| 1 | Appending deferrals writes `deferred-items.json`, one JSON entry per item, `issue` null | sidecar walk | `record-deferrals` append | held — delivered artifact `deferred-items.json`, audience `agent`, template and rules sections bundled |
| 2 | Recording a raised issue fills that entry's `issue` | sidecar walk | `record-deferrals` raise | held — record bound `deferred_items_register` from append's output and the three renamed inputs |
| 3 | Collecting with no register yields an empty set and `false`, not a fault | sidecar walk | `negative-case` | held — input fell back to its default; outputs `[]` / `false` |
| 4 | Collecting returns only entries whose `issue` is null | sidecar walk | `positive-case` | held — `[D-2]` / `true` |
| 5 | The borrowed techniques deliver with their JSON guides resolvable | sidecar walk | every activity | held — `work-package/deferred-items#template` and `#rules` served |
| 6 | Entry IDs follow a declared scheme, and an entry names where it was deferred | sidecar walk | `record-deferrals` append | held — the served rules carry `D-<n>` in append order and the template's `deferred_at` names the origin |
| 7 | No activity's artifact contract names a method record, a `.md` register or the `.md` comprehension log | walk snapshot diff | every commit | held |
| 8 | Guards stay at the base's result | `check-all` diff against base | every commit | held — one pre-existing `activity-variables` failure |
| 9 | The case report fills every column of the case report template | sidecar walk | `report-cases` | held |

## Found by the walk and the audit

- The register output binds straight into the next technique's input, which names the register by bare filename, while the output and activity-variable descriptions called it the register's contents. Descriptions now say bare filename.
- The assumptions log and strategic-review findings named a register entry ID that append assigns only afterwards. The entry now names its origin, and the origin says Deferred.
- Requirements elicitation wrote the register with no declared output. It now emits its deferrals and binds the append before the document that points at them.
- The register guide says the register is unprefixed, while the server offers the activity's `artifact_prefix` and the walk snapshot records a prefixed filename. Pre-existing; carried to PR 3.

## Pre-existing, fixed on #1006

- The strategic-review `finding-categories` rule names three categories; the resource vocabulary names five.
- The complete activity's `has_unraised_deferred_items` mirrors whether `open_deferred_items` is empty, and it declares `public_api_symbols` twice.
- Declared inputs no protocol reads: `create-complete-doc` (`finalized_adr`, `finalized_test_plan`, `documented_apis`) and `findings-classification` (`ticket_disposition`).
- The retrospective writes the follow-ups register without a declared output.
- The comprehension log has no field for the classification the challenge pass writes.
- Phase headings with articles or over four words in `raise-deferred-items`.
- Locals read before their bind, or never read, in `create-adr` and `review-diff`.
- Stage-bound wording in the codebase-comprehension group, and a resource backlink in `complete-wp-guide`.
- remediate-vuln borrows the complete activity, whose raise loop opens GitHub issues against its isolation rule.
