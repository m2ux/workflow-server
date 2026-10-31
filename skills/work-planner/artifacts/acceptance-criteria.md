# Acceptance Criteria

The verification state of an issue's acceptance criteria: what each criterion's instrument reported, against which revision, and which criteria that evidence lets a body tick.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)
- [Initiative Issue Body](initiative-issue-body.md)

## Operations

### *Verify* Selected Criteria

The verification evidence for a supplied set of criteria whose delivery is ready.

**Inputs:** Criterion ids, current issue body, delivery findings, delivery revisions, named instruments and the project checkout to run them in.

1. Confirm the supplied delivery findings establish [Readiness](#readiness) for each selected criterion.
   - Return evidence that fails Readiness as a blocker for that criterion.
2. Check out the delivering pull request head for an open task, or its merged revision for delivered work, in an isolated project checkout, meeting [Instrument Checkout](#instrument-checkout).
   - Run each criterion's named instrument there.
   - Record the result against the tested revisions, meeting [Instrument Result](#instrument-result).
3. Return verified criterion ids with their evidence and each unresolved criterion with what is missing.
   - Leave body publication and further planning to the caller.

### *Tick* Verified Criteria

The confirmed criteria and completed rows recorded in an epic or initiative body.

**Inputs:** Issue JSON, verified criterion ids, output body file, and the pull request records with the complete issue-link snapshot for an epic or every linked epic record for an initiative.

1. Record the criteria, meeting [Tick State](#tick-state).
   - For an epic, run [Record Epic Criteria](epic-issue-body.md#record-epic-criteria) with the issue JSON, pull request records, complete issue-link snapshot, verified criterion ids and output body file.
   - For an initiative, run [Record Initiative Criteria](initiative-issue-body.md#record-initiative-criteria) with the issue JSON, every linked epic record, verified criterion ids and output body file.
2. Return the resulting body and any criteria refused as not ready to verify. The artifact operations return the updated bodies for publication.

## Fields

- **Criterion.** The id of one acceptance criterion in the issue body that states it.
- **Instrument.** The command, test or check the criterion names as the thing that observes it.
- **Revision.**
  The exact commit the instrument ran against: the open task pull request head or the delivered revision in its target branch.

### Readiness

A task criterion is ready to verify when its delivering pull request, open or merged, supplies readable evidence at the revision being checked. Epic criteria require their delivering rows to be delivered. An unreadable dependency leaves a criterion unready; tracker closure requires merged delivery.

### Instrument Checkout

An instrument runs in a checkout of the project at the exact revision it is verifying, which the caller supplies. A checkout the caller is editing is not that revision, so a criterion verified against uncommitted work is unverified.

### Instrument Result

A criterion is verified only on a passing run of its named instrument, recorded against the tested revisions as [Coverage Reports](issue-body.md#coverage-reports) define. A failed, unavailable or inconclusive instrument leaves it unverified, and an unverified criterion is not ticked.

### Tick State

A ticked criterion carries verification evidence. Done on the row or table that cites it follows [Tables](issue-body.md#tables) and [Work Breakdown](epic-issue-body.md#work-breakdown). A criterion refused as not ready to verify is returned unticked with what it is missing.
