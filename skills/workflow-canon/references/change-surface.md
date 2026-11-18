# Change Surface

Author and Audit use the same captured inventory, applicability matrices and evidence gates. Scripts establish structural coverage; independent agents establish semantic accuracy.

## Prerequisites

### Audit Command Conventions

- **Runtime.**
  Use Python 3.10+ and Node with the paired engine's installed `yaml` package. Resolve `<skill-root>`, `<corpus-root>`, `<engine-root>` and the shared planning `<run>` directory to absolute paths. Apply the host's sandbox rules.
- **Ownership.**
  The coordinator invokes mutations sequentially; workers return files. Preserve failures and output in the planning record.
- **Inputs.**
  JSON files follow the [scope](../templates/audit-scope.json), [budget](../templates/audit-budgets.json) and [receipt](../templates/audit-receipt.json) contracts. Fill actual limits and measured calibration. Scope can include `base`, additional `rows` with source/address/section/start/end/context, and `relationships` with source/target/address/label/context.
- **Exit status.**
  Exit 0 means the operation succeeded; status with `--require` returns 2 when the requested gate is incomplete; exit 1 means invalid input or unavailable operation. Rendering and planning do not establish audit completion.

## Procedure

1. **Locate the record.**
   Resolve the shared [planning record](planning.md), corpus root and paired engine. Each run has its own directory beneath that record.
2. **Declare the scope.**
   Fill the [scope input](../templates/audit-scope.json) with paths relative to the corpus root, the exact base commit when comparing changes, and checks selected through [canon context](canon-context.md#checks). Include supporting resources, READMEs, routines, unchanged consumers and relationship context. The guard obligation is required. Candidate draft bytes must exist in an isolated corpus tree before capture.
3. **Capture the bytes.**
   [Initialize the surface](#initialize-audit-surface). It captures source bytes, revisions, parser/tool identities, deleted base files, all AP/DP entries and supplemental canon units. Four Markdown documents contain workflow, technique, routine and activity tables separated by source and section; empty types explicitly say so. The coordinator owns the state and generated views.
4. **Check the proposed inventory.**
   Read [Identity](#identity), then assign [independent inventory verification](audit-dispatch.md#phases). Verifiers derive expected items and relationships from captured sources and the corpus manifest. They compare the proposed rows, complete AP/DP inventory, diagnostics and unselected files against those expectations. Automated extraction is a candidate inventory, including unresolved reference candidates; it does not establish completeness.

## Reference

### Identity

- **Items.**
  Rows use the source path and native section, rule, input, output or step identifier. Nested steps retain their full ancestry and duplicate occurrences. Positional prose, paragraphs and candidate clauses use revision-bound source addresses. Independently testable constraints sharing one line need separate clause rows; verifiers add any missed boundary through the scope input's `rows` list. Whole-section, whole-element, missing-structure and relationship rows retain checks that span items.
- **Relationships.**
  Each call records its source, target, binding site, executing workflow and complete routine reference chain. Instantiations are separate from routine declarations. Check the paired engine's resolution and inheritance semantics; record ancestor sources and both endpoints explicitly. Add relationships and required context through the scope input when extraction cannot resolve them. An unresolved target can be a measured defect, but uncertainty about its actual target or context leaves inventory verification disputed.
- **Supporting material.**
  Resource and README rows belong to Workflow / Supporting Material under their actual namespace and source path. A namespace without a workflow definition remains a namespace. Shared content has one content row; referencing elements have relationship rows.
- **Criteria.**
  AP identity uses the canonical named entry; its current AP number is a display alias. DP aliases retain their numbered source headings and titles. Every row accounts for every captured AP and DP. Each unit is carried against the files of the kinds its [fires-on line](canon-map.md#file-kinds) names; absent metadata or an unavailable lookup leaves the full product. The [canon inventory](canon-map.md#unit-inventory) also supplies family, creation-rule, convention and guard obligations.

### Applicability

Use [mapping assignments](audit-dispatch.md#phases) to decide every cell in the full row × AP/DP product. Each cell links to source evidence and exactly one disposition:

| Status | Evidence |
| --- | --- |
| `A` | The criterion's scope and the construct that makes it apply |
| `N` | The criterion's excluding wording and source facts satisfying it |
| `U` | The evidence or decision still missing |

A cell pairing a unit with a row whose source kind its [fires-on line](canon-map.md#file-kinds) does not name is `N`, its evidence that line and the row's kind. The remaining cells carry the walk.

#### Shared Reasons

Shared reasons name the exact assigned row set and hold for every member. A clean result or a Do not flag exception is an evaluation under an applicable criterion; it does not by itself establish inapplicability. Blank cells are unresolved. Table pagination preserves every logical pair exactly once.

#### Cell Verification

After all decisions are `A` or `N`, independent verifiers check every cell, including every exclusion, against the original criterion and source. They cannot verify cells they mapped. The receipt binds the exact mapping reason, disposition and evidence. Disputes return to the coordinator for correction through [reset](#reset-audit-cells) or [refresh](#refresh-audit-surface), then fresh verification. Open the evaluation gate only when [status requires the map](#check-audit-status) successfully.

### Evaluation

#### Worker Obligations

Assign the verified applicable cells through [dispatch](audit-dispatch.md#phases). Workers follow the complete [walk rules](walk-rules.md), read the full source and required relationship context, and return evidence for each pass, finding or blockage. Reconcile returns through the typed [receipt](audit-dispatch.md#returns). Whole-file reads, supplemental units, selected project checks and independent finding confirmation are separate obligations. A command result carries its command, working directory, exit status and captured output; an unmeasured check stays blocked.

#### Remediation Authority

The calling mode owns remediation authority. Corrections to definitions return through Author's draft procedure. Review-only audits report findings. Workers have read authority; authorized edits are serialized by the coordinator or assigned disjoint file ownership before execution.

### Completion

#### Required Evidence

The audit is complete only when the current inventory is independently verified, every AP/DP cell has independently verified applicability, every applicable cell has an evidence-backed pass or finding, and every whole-file read, supplemental unit, required check and finding confirmation is settled. Unknown, disputed, stale, unread, unmeasured or blocked work keeps it incomplete. Every required item has one reconciled primary result; retries cannot overwrite accepted items. Use [status requiring completion](#check-audit-status) for the final claim.

#### Coverage and Conformance

Coverage completion and conformance are separate. Confirmed violations can have complete coverage; [reporting](reporting.md#report-context) determines their bands and verdict. A user stop or resource limit leaves a saved incomplete run with its residual, never a finished audit.

### Freshness and Resume

- **Inspect the run.**
  Start with [status](#check-audit-status), which returns bounded counts, generation identity and artifact paths. Locate residuals through the coverage document's headings and assignment identifiers; issue the relevant [packet](audit-dispatch.md#write-audit-packet) for source, mapping and ownership detail. The script-owned JSON ledger stores the complete dataset and is accessed through these projections.
- **Source generations.**
  Any corpus membership/byte change, scope correction, canon change, parser/engine change or audit-tool change blocks use of the captured generation. [Refresh](#refresh-audit-surface) captures the current generation and invalidates all its mapping, verification and evaluation evidence because cross-element dependency reach can exceed local source rows. An identical generation preserves its pending work. Archived state and immutable returns retain prior evidence.
- **Mapping corrections.**
  [Reset](#reset-audit-cells) invalidates a selected mapping and its verification/evaluation, including intersecting assignments. A reason or evidence edit changes the mapping fingerprint. Renewed evaluation waits for the entire current map to be verified.
- **Interrupted workers.**
  Accepted partial work remains recorded. [Retry](#retry-audit-assignment) retires an assignment and [planning](audit-dispatch.md#plan-audit-assignments) assigns its unresolved residual. A fresh agent can continue after the coordinator checks captured identities and current status.
- **Author byte agreement.**
  Before applying a verified draft, compare its captured source hashes with the bytes to write. After writing, capture the actual working tree and run its selected checks. Reuse evidence only for an identical generation; changed roots, contracts or candidate bytes require their current verification. A draft-only request makes no commit-completion claim.

### Artifacts

| Artifact | Role |
| --- | --- |
| `audit-state.json` | Coordinator-owned inventory, evidence, assignments and history |
| `change-surface-{workflow,technique,routine,activity}.md` | Section matrices, including explicit empty types |
| `audit-evidence.md` | Cell reasons, independent receipts and evidence links |
| `audit-coverage.md` | Inventory, criterion aliases, assignments and residuals |
| `sources/` | Captured source and check-output bytes |
| `worker-results/` | Immutable typed returns by assignment and attempt |
| `generations/` | Prior state when the captured generation changes |
| `audit-report.md` | Generated findings and completion status |

For a workflow-owned report, follow [Workflow Reports](reporting.md#workflow-reports) and transfer the generated counts, residuals and links into that guide's layout. The generated coverage remains authoritative.

## Commands

### Initialize Audit Surface

Capture source bytes and render all four matrices with unresolved cells.

- Paths are relative to a root containing `corpus/`. Use the actual inventory author identity and a new run directory.

```bash
python3 <skill-root>/scripts/audit_surface.py init --root <corpus-root> --engine <engine-root> --scope <scope.json> --actor <host-agent-id> --run <run>
```

### Check Audit Status

Reconcile current evidence, rendered views and outstanding obligations.

- Require `map` before evaluation and `complete` before claiming completion; omit `--require` for status only.
- Output contains bounded counts, the generation identity and artifact paths. Read the relevant coverage section or assignment packet for individual residuals.

```bash
python3 <skill-root>/scripts/audit_surface.py status --run <run> --require <map-or-complete>
```

### Render Audit Surface

Regenerate matrices, evidence and reports from canonical state.

- Changed source evidence requires refresh.

```bash
python3 <skill-root>/scripts/audit_surface.py render --run <run>
```

### Submit Audit Results

Validate a typed return and preserve its immutable receipt.

- Invalid returns cannot partially change state; valid partial results leave the residual incomplete.

```bash
python3 <skill-root>/scripts/audit_surface.py submit --run <run> --receipt <receipt.json>
```

### Reset Audit Cells

Reopen selected decisions and invalidate dependent evidence and assignments.

- Supply a JSON array of cell IDs and the correction reason.

```bash
python3 <skill-root>/scripts/audit_surface.py reset --run <run> --items <items.json> --reason '<reason>'
```

### Refresh Audit Surface

Capture current inputs and invalidate a changed generation.

- Add `--scope <scope.json>` for inventory corrections. Identical generations retain evidence; changed generations archive prior state.

```bash
python3 <skill-root>/scripts/audit_surface.py refresh --run <run>
```

### Retry Audit Assignment

Retire interrupted ownership so its unresolved work can be planned again.

- Accepted items remain settled. Record why the worker stopped and recalibrate excessive estimates.

```bash
python3 <skill-root>/scripts/audit_surface.py retry --run <run> --assignment <id> --reason '<reason>'
```

### Run Audit Script Tests

Run inventory, evidence-gate and assignment regressions with the paired parser.

- Run from the skill worktree. Synthetic judgments test coordination, not semantic corpus conformance.

```bash
CANON_TEST_ENGINE=<engine-root> python3 -m unittest discover -s skills/workflow-canon/test -p 'test_audit_*.py'
```
