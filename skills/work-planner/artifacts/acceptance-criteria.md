# Acceptance Criteria

The verification state of an issue's acceptance criteria: what each criterion's instrument reported, against which revision, and which criteria that evidence lets a body tick.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)
- [Initiative Issue Body](initiative-issue-body.md)

## Operations

### Verify Selected Criteria

The verification evidence for a supplied set of criteria whose delivery is ready.

#### 1. Confirm Criterion Readiness

- Confirm [Delivery Evidence](#delivery-evidence "○") establishes [Readiness](#readiness) for the [Criterion Selection](#criterion-selection "○") in the [Issue Body](#issue-body "○").
- Provide evidence that fails Readiness as a blocker for that criterion.

#### 2. Run Named Instruments

- Run each criterion's named [instrument](#instrument "○") at the delivering pull request head for an open task, or its merged revision for delivered work, meeting [Instrument Checkout](#instrument-checkout).
- Apply [Run at Revision](#run-at-revision "ƒ") with the [project checkout](#project-checkout "○"), that revision and the instrument.
- Record the result against the commit it reports, meeting [Instrument Result](#instrument-result).

#### 3. Provide Criterion Evidence

- Provide [Verification Evidence](#verification-evidence "●") identifying verified criterion ids with their evidence and each unresolved criterion with what is missing.
- Leave body publication and further planning to the caller.

### Tick Verified Criteria

The confirmed criteria and completed rows recorded in an epic or initiative body.

#### 1. Record Verified Criteria

- Record the criteria from [Issue Evidence](#issue-evidence "○"), meeting [Tick State](#tick-state "●").
- For an epic, Apply [Record Epic Criteria](epic-issue-body.md#record-epic-criteria "ƒ") with the issue JSON, pull request records, complete issue-link snapshot, [verified criterion ids](#criterion-selection "○") and [output body file](#output-body "○").
- For an initiative, Apply [Record Initiative Criteria](initiative-issue-body.md#record-initiative-criteria "ƒ") with the issue JSON, every linked epic record, verified criterion ids and output body file.

#### 2. Provide Body Disposition

Provide the [resulting body](#output-body "●") and any refused criteria to the caller for publication.

### Run at Revision

Runs one instrument at the commit a branch, tag or commit resolves to, in a detached checkout the run creates and removes.

#### 1. Run at Revision

- The instrument follows `--` and runs at the checkout’s top level.
- The first output line is `{"revision": <commit>, "checkout": <path>}`, the commit the result is recorded against. The instrument's output follows.
- The exit status is the instrument's, whatever it is. The checkout is removed after a pass or a failure; one it cannot remove is reported with its path and the instrument's status stands.
- Exit 125 is the helper's own failure, as `git bisect run` reserves it, with one standard error line naming the cause: a usage error, `revision not found:` or `checkout not created:` before any output, or `command not started:` after the first line, once the checkout exists. An instrument that itself exits 125 is told apart by that line's absence.
- Worktrees the run did not create are left as they are.
- The checkout is registered in the repository's git directory, which `sbx` leaves read-only for a linked worktree or another repository, so the helper runs outside `sbx`. An instrument that needs the sandbox carries its own `sbx` prefix.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  python3 skills/work-planner/scripts/revision-check.py \
  --project '[**&lt;checkout&gt;**](#project-checkout "○")' \
  --revision '[**&lt;revision&gt;**](#revision "○")' \
  -- [**&lt;instrument-command&gt;**](#instrument "○")
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  python3 skills/work-planner/scripts/revision-check.py \
  --project /projects/workflow-server \
  --revision i11/e16/workspace \
  -- "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 \
  -m pytest skills/work-planner/test \
  -q
</pre></big>

#### 2. Provide Executed at Revision

Provide [Instrument Result](#instrument-result "●") to the requester.

## Fields

- **Criterion.** The id of one acceptance criterion in the issue body that states it.
- **Instrument.** The command, test or check the criterion names as the thing that observes it.
- **Revision.**
  The exact commit the instrument ran against: the open task pull request head or the delivered revision in its target branch.

### Readiness

A task criterion is ready to verify when its delivering pull request, open or merged, supplies readable evidence at the revision being checked. Epic criteria require their delivering rows to be delivered. An unreadable dependency leaves a criterion unready; tracker closure requires merged delivery.

### Instrument Checkout

An instrument runs in a checkout of the project at the exact revision it is verifying, which the caller supplies. A checkout the caller is editing is not that revision, so a criterion verified against uncommitted work is unverified. A branch or tag is resolved to one commit before the run, and the checkout made for the run is removed after it whatever the instrument returns.

### Instrument Result

A criterion is verified only on a passing run of its named instrument, recorded against the tested revisions as [Coverage Reports](issue-body.md#coverage-reports) define. A failed, unavailable or inconclusive instrument leaves it unverified, and an unverified criterion is not ticked.

### Tick State

A ticked criterion carries verification evidence. Epic criteria can derive that evidence from passed checks under [Test Evidence](epic-issue-body.md#test-evidence). Done on the row or table that cites it follows [Tables](issue-body.md#tables) and [Work Breakdown](epic-issue-body.md#work-breakdown). A criterion refused as not ready to verify is provided unticked with what it is missing.

### Criterion Selection

The supplied criterion ids selected for verification or confirmed as verified for recording.

### Issue Evidence

The complete current issue JSON. For an epic it includes the complete issue-link snapshot and pull request records; for an initiative it includes every linked epic record.

### Delivery Evidence

The supplied delivery findings and delivering revisions for the selected criteria.

### Instrument

Each selected criterion's named command, test or check, with its command arguments.

### Project Checkout

The supplied checkout of the project in which the instrument is run.

### Revision

The branch, tag or commit supplied for verification.

### Verification Evidence

The selected criterion ids, their instrument results and tested revisions, with each unresolved criterion and its missing evidence.

### Output Body

The supplied local destination for the resulting body.

### Workspace

The absolute checkout holding the installed Work Planner helper.

### Issue Body

The supplied complete current issue body text containing the selected criteria.
