# Dispatch Batch

The admitted units selected for the currently free worker slots of one authorized delivery run.

## Prerequisites

Read these files first.

- [Delivery Plan](delivery-plan.md)

## Operations

### *Plan* Dispatch Batch

One batch from current delivery and execution evidence.

**Inputs:** Run authorization, machine-readable delivery plan, the board and requested lane used for that survey, observed session inventory, currently free harness slots and this run's admitted preparations awaiting capacity.

1. Run [Compute Dispatch Batch](#compute-dispatch-batch) with the supplied evidence.
2. Return its batch and continuation, meeting [Selection](#selection), or the named evidence error.

### *Validate* Dispatch Start

One selected unit's readiness to execute.

**Inputs:** Selected batch, unit identity, publication and reservation evidence, current observed session inventory and currently free harness slots.

1. Run [Check Dispatch Start](#check-dispatch-start) with the supplied evidence.
2. Return the validated unit or the named blocker, meeting [Start Readiness](#start-readiness).

## Fields

### Authorization

One run records its board identity, scope selectors and requested lane in a JSON object. The scope is the selected board (`["*"]`), or a list of repository-qualified initiative, epic, task or hot-fix identities, such as `o/r#I07`, `o/r#I07:E00`, `o/r#I07:E00:W01` or `o/r#F02`. Every row of a joined unit must fall within that scope. An explicit joined selector, `o/r#I07:E00:W01+W02`, authorizes both rows. A lane is its opaque decimal string, or `null` when none is requested.

```json
{"board": "users/o/projectsV2/7", "scope": ["o/r#I07"], "lane": null}
```

### Survey Evidence

The input is the [dispatch export](delivery-plan.md#dispatch-export) from a current survey of the authorized board and requested lane. Eligibility and ordering belong to [Work Units](delivery-plan.md#work-units). A different board or requested lane is an evidence error. An export is valid only with its current survey invocation and complete supporting snapshots. Row findings can accompany independently verified units; an interrupted survey supplies no reusable prior export.

### Session Inventory

The harness supplies each observed session's `unit`, `session` identity and `state`: `preparing`, `running`, `review`, `blocked` or `completed`. Every state except `completed` holds its rows against another start. Only observed execution changes justify a state update. Free capacity is the harness's actual available worker slots, accounting for the coordinator, other sessions and component contributors; a review or blocked label alone frees no slot.

```json
[{"unit": "o/r#I07:E00:W01", "session": "worker-1", "state": "running"}]
```

### Selection

The batch retains authorized, unoccupied units in survey order, bounded by free capacity. Overlapping joined rows are selected once. Its `units` carry each selected export entry, and `pending` counts the other eligible units. Its `action` is `dispatch` when units fit, `wait` while scoped workers execute or admitted work awaits capacity, and `stop` when neither remains. Holds, blockers and required human review remain in the delivery evidence returned alongside the batch.

### Preparations

A preparation is this run's selected unit with its published record, captured component context, confirmed hold, prepared worktrees and complete brief, awaiting an execution slot. It retains the selected batch for start validation and creates no worker session. The coordinator owns its continuation and supplies it for another call with current queue and hold evidence. Only preparations still admitted by the current queue contribute to capacity waiting; another run's held record supplies none.

### Start Readiness

The start names one selected unit, has a currently free harness slot and overlaps no held or running session. Its supplied evidence names that unit, the planning record confirmed on the remote engineering branch, and the record associated with its confirmed hold. For rows, that association is read from every live row reservation; for a hot-fix it is the run's record for the unit whose board hold was confirmed. The evidence is gathered in that order before execution; any missing, mismatched or unverified evidence blocks the start.

```json
{"unit": "o/r#I07:E00:W01", "published_record": "2026-11-05-943-i07-e00-w01-work", "reserved_record": "2026-11-05-943-i07-e00-w01-work", "reservation_verified": true}
```

## Commands

### Compute Dispatch Batch

Selects the next batch without tracker writes or worker execution.

**Inputs:** Authorization, dispatch export and session-inventory JSON files, current survey board, optional requested lane, free-slot count and optional admitted-preparations JSON file.

- Supply `--lane '<lane-index>'` only when that lane was used by the survey.
- Supply `--preparations '<preparations-file>'` for this run's admitted preparations awaiting capacity.
- The JSON result goes to the supplied batch file. A nonzero exit leaves the batch unverified.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/dispatch.py batch --authorization '<authorization-file>' --plan '<dispatch-export-file>' --sessions '<session-inventory-file>' --capacity '<free-slot-count>' --board '<survey-board>' > '<batch-file>'
```

### Check Dispatch Start

Checks one selected unit immediately before execution.

**Inputs:** Batch JSON, repository-qualified unit identity, start-evidence JSON, current session-inventory JSON and free-slot count.

- Exit 0 returns the selected unit; exit 1 names the blocking condition.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/dispatch.py start --batch '<batch-file>' --unit '<unit-identity>' --evidence '<start-evidence-file>' --sessions '<session-inventory-file>' --capacity '<free-slot-count>'
```
