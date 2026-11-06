# Dispatch Batch

The admitted units selected for the currently free worker slots of one authorized delivery run.

## Commands

### Compute Dispatch Batch

Select the next batch without tracker writes or worker execution and provide [Batch](#batch "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/dispatch.py batch &#92;
  --authorization '[**&lt;authorization-file&gt;**](#authorization "○")' &#92;
  --plan '[**&lt;dispatch-export-file&gt;**](#survey-evidence "○")' &#92;
  --sessions '[**&lt;session-inventory-file&gt;**](#session-inventory "○")' &#92;
  --capacity [**&lt;free-slot-count&gt;**](#free-slots "○") &#92;
  --board [**&lt;survey-board&gt;**](#survey-board "○") &#92;
  &gt; '[**&lt;batch-file&gt;**](#batch "○")'
</pre></big>

- Honor [Requested Lane](#requested-lane "○") when selecting units.

- Supply `--lane '<lane-index>'` only when that lane was used by the survey.
- Supply `--preparations '<preparations-file>'` for this run's admitted [preparations](#preparations "○") awaiting capacity.
- The JSON result goes to the supplied batch file. A nonzero exit leaves the batch unverified.

### Check Dispatch Start

Check one selected unit immediately before execution and provide [Validated Unit](#validated-unit "●") to the requester, or [Failure](#failure "●") if the operation fails. The start names one selected unit, has a currently free harness slot and overlaps no held or running session. Its supplied evidence names that unit, the planning record confirmed on the remote engineering branch, and the record associated with its confirmed hold. For rows, that association is read from every live row reservation; for a hot-fix it is the run's record for the unit whose board hold was confirmed. The evidence is gathered in that order before execution; any missing, mismatched or unverified evidence blocks the start.

Exit 0 returns the selected unit; exit 1 names the blocking condition.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/dispatch.py start &#92;
  --batch '[**&lt;batch-file&gt;**](#batch "○")' &#92;
  --unit [**&lt;unit-identity&gt;**](#unit-identity "○") &#92;
  --evidence '[**&lt;start-evidence-file&gt;**](#start-evidence "○")' &#92;
  --sessions '[**&lt;session-inventory-file&gt;**](#session-inventory "○")' &#92;
  --capacity [**&lt;free-slot-count&gt;**](#free-slots "○")
</pre></big>

## Fields

### Authorization

One run records its board identity, scope selectors and requested lane in a JSON object. The scope is the selected board (`["*"]`), or a list of repository-qualified initiative, epic, task or hot-fix identities, such as `o/r#I07`, `o/r#I07:E00`, `o/r#I07:E00:W01` or `o/r#F02`. Every row of a joined unit must fall within that scope. An explicit joined selector, `o/r#I07:E00:W01+W02`, authorizes both rows. The requested lane must meet [Index](lane.md#index), represented as `null` when none is requested. eg `{"board": "users/o/projectsV2/7", "scope": ["o/r#I07"], "lane": null}`

### Survey Evidence

The input is the [dispatch export](delivery-plan.md#dispatch-export) from a current survey of the authorized board and requested lane. Eligibility and ordering belong to [Work Units](delivery-plan.md#work-units). A different board or requested lane is an evidence error. An export is valid only with its current survey invocation and complete supporting snapshots. Row findings can accompany independently verified units; an interrupted survey supplies no reusable prior export.

### Session Inventory

The harness supplies each observed session's `unit`, `session` identity and `state`: `preparing`, `running`, `review`, `blocked` or `completed`. Every state except `completed` holds its rows against another start. Only observed execution changes justify a state update. Free capacity is the harness's actual available worker slots, accounting for the coordinator, other sessions and component contributors; a review or blocked label alone frees no slot. eg `[{"unit": "o/r#I07:E00:W01", "session": "worker-1", "state": "running"}]`

### Selection

The batch retains authorized, unoccupied units in survey order, bounded by free capacity. Overlapping joined rows are selected once. Its `units` carry each selected export entry, and `pending` counts the other eligible units. Its `action` is `dispatch` when units fit, `wait` while scoped workers execute or admitted work awaits capacity, and `stop` when neither remains. Holds, blockers and required human review remain in the delivery evidence provided alongside the batch.

### Preparations

A preparation is this run's selected unit with its published record, captured component context, confirmed hold, prepared worktrees and complete brief, awaiting an execution slot. It retains the selected batch for start validation and creates no worker session. The coordinator owns its continuation and supplies it for another call with current queue and hold evidence. Only preparations still admitted by the current queue contribute to capacity waiting; another run's held record supplies none.

### Survey Board

The board identity used by the current survey.

### Requested Lane

The optional lane used by the current survey, meeting [Index](lane.md#index); represented as `null` when none is requested.

### Free Slots

The harness-supplied current worker-slot count, governed by [Session Inventory](#session-inventory).

### Batch

The selected units and continuation defined by [Selection](#selection), stored in the supplied batch file.

### Unit Identity

The repository-qualified identity of one selected unit.

### Start Evidence

A JSON object with `unit` (the repository-qualified selected unit id), `published_record` and `reserved_record` (planning-folder identity strings), and `reservation_verified` (a boolean). It records confirmed remote publication and the associated live hold. eg `{"unit": "o/r#I07:E00:W01", "published_record": "2026-11-05-943-i07-e00-w01-work", "reserved_record": "2026-11-05-943-i07-e00-w01-work", "reservation_verified": true}`

### Validated Unit

The selected unit provided when its immediate start check succeeds.

### Workspace

The checkout holding the installed skill, its scripts and tests.

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.
