# Audit Mode

Reviews existing definitions through independently verified change-surface matrices, evidence-backed evaluation, finding confirmation and a complete coverage gate. A single canon question is answered at the procedure's first step.

## Prerequisites

Read the [canon prerequisites](canon-context.md#prerequisites), then its [terms](canon-context.md#terms).

## Procedure

1. **Answer a canon question.**
   For a single question about an entry, locate its [canon home](canon-context.md#homes), [fetch the entry](#fetch-unit) with its required context, answer and stop. The steps below run when the request calls for a conformance judgment over definitions.
2. **Scope the surface.**
   - Read the [criteria context](canon-context.md#criteria).
   - Resolve [scope](canon-context.md#scope), its construct ids included.
   - Run [List Units for a Construct](#list-units-for-a-construct) for each resolved id. The union of its results is the unit set the walk carries, under [file kinds](canon-map.md#file-kinds).
   - Follow the shared [change-surface lifecycle](change-surface.md).
3. **Run the checks first.**
   - Select the project's [checks](canon-context.md#checks), preferring a delta run when it can compare the base and candidate under equivalent conditions.
   - Capture structural check outcomes now for inventory review; submit their typed observations during the obligations phase after the map is verified. AP/DP evaluation waits for that gate.
4. **Map and verify.**
   - Capture the full inventory and four section matrices, decide applicability and independently verify every decision through the shared lifecycle. Resolve all discrepancies before evaluation.
5. **Evaluate.**
   - Use [bounded assignments](audit-dispatch.md#phases) for the verified applicable cells and supporting obligations. The coordinator reconciles typed returns and preserves pending work.
6. **Attribute.**  Give each finding its origin per [Attribution](#attribution).
7. **Verify findings.**
   - Dispatch independent confirmation through the [obligations phase](audit-dispatch.md#phases). Only confirmed findings drive fixes.
8. **Report.**
   - Read [Report Context](reporting.md#report-context) for bands, severity, row fields and coverage.
   - Report in the layout [Which Report](reporting.md#which-report) names.
9. **File a mechanised Detect.**
   - A Detect applied by pattern is a guard candidate. Name what it keys on and record it against the registry in the report; external filing follows existing user authority.
   - The threshold is the second occurrence: twice in one walk, or once in each of two consecutive walks. A `fix` finding counts.

## Reference

### Attribution

- **`diff`**
  A touched file, or a break that exists because an I/O contract on the change surface changed, including a stale bind or Apply in an untouched referencer or consumer.
- **`pre-existing`**
  The same construct and evidence at the base ref, independent of an I/O contract change on this surface.
- **`known`**  A prior pass accepted this key. Keep the row. Leave it out of the decision surface.
- **`fix`**
  Text written in this pass to close a finding. Closed within the pass by [Author](author-mode.md), never reported open.

## Rules

- **Remediation.**
  Confirmed findings go to [Author](author-mode.md) when fixing them is within the user's request. A review-only request reports the finding and any criterion correction without editing definitions, canon entries or exemption surfaces.
- **Continue.**
  Reconcile each return and continue the required residual through [dispatch](audit-dispatch.md#phases). An empty findings list is not coverage evidence.
- **Stop.**
  Use the shared [completion predicate](change-surface.md#completion). A user stop preserves an incomplete, resumable run.

## Commands

### List Units for a Construct

Prints every canon unit that fires on one construct id, with its file and line.

- The id is a construct a draft writes: a bare kind, a field path, `resource`, `readme`, or `*`.
- A unit is listed when it declares that id, a prefix of it, its bare kind, or `*`.
- Runs in the server checkout. `--root` names the corpus tree. The listing is printed and not stored.

```bash
npx tsx guards/list-fires-on.ts 'activity.steps[].when' --root <corpus>
```

### Fetch Unit

Reads one section or entry of a home.

- **On disk.**
  [List units](canon-context.md#list-units) for the range, then Read it. For one entry, list the `###` lines and read that block.
- **In a workflow session.**  `get_resource` with `canon/<home>#<heading>`.
