# Audit Dispatch

The coordinator plans and reconciles bounded work; host agents read captured evidence and return judgments. Apply the [change-surface lifecycle](change-surface.md) before using these phases.

## Procedure

### Dispatch Route

1. **Plan the assignments.**
   Use [Plan Audit Assignments](#plan-audit-assignments).
2. **Bind the agent.**
   Use [Bind Audit Agent](#bind-audit-agent), binding the actual host agent identity.
3. **Write the packet and dispatch.**
   Use [Write Audit Packet](#write-audit-packet), give the agent the packet and [return contract](#returns), and dispatch through the host.

## Reference

### Phases

| Phase | Required Work | Independent Role |
| --- | --- | --- |
| `inventory` | Source enumeration, closure, every proposed row and complete canon inventory | Agent other than the inventory author |
| `map` | Every row × AP/DP cell | Mapping author recorded per cell |
| `verify` | Every settled mapping, including `N` | Agent other than that cell's mapper |
| `evaluate` | Every independently verified `A` cell | Audit worker with full source and relationship context |
| `obligations` | Whole-file reads, supplemental units, selected checks and finding confirmation | Finding confirmer differs from its author |

#### Phase Order

Inventory and mapping can proceed together. Verification requires all mapping decisions settled. Evaluation and audit obligations require the complete independently verified map. Plan finding confirmations after findings return. Critical and High findings are re-derived, Mediums spot-confirmed; downgrades state the resulting severity and band.

#### Packets

Inventory packets carry proposed rows, AP/DP and supplemental criteria, required checks, diagnostics and corpus manifest slices; captured bytes for unselected sources remain inspectable.

### Sizing

#### Budget Input

Record actual host context/output limits, available child slots, prompt/tool reserve, safety reserve and work limit in the [budget input](../templates/audit-budgets.json). Reserve the coordinator and occupied slots once. The input contains estimates, never a promise of runtime capacity.

#### Calibration

Calibrate each phase separately with a bounded pilot from its required work. Record measured packet/output sizes and elapsed time; retain useful pilot results. A pilot's maximum input and output must already fit the declared host limits. Unknown host limits block dispatch. Use the host tokenizer when available; the CLI's explicit bytes-per-token proxy requires a conservative ratio and safety reserve.

#### Slice Fit

For each slice, the planner counts the serialized packet, including source/canon context, identifiers, mapping reasons and assignment metadata. Verification and evaluation include the exact source spans cited by their mappings, merged with required row and criterion context. It estimates output and elapsed work from the recorded phase calibration. It requires input + output ≤ context − prompt/tool reserve − safety reserve, output ≤ output limit, and work ≤ work limit. Output is counted once in the context equation. Use an effective combined context limit consistent with the host's input/output accounting.

#### Batched Reads

Read packet fields and source excerpts in batches within the host's tool-return limit. Retain all owned identifiers, reasons and relationship context across those batches. Reuse source bytes already read at the same hash; retrieve every missing portion of a truncated return before making a judgment.

#### Bundles and Waves

Bundles group criterion, source and section, with relationship context retained. Oversized bundles split into bounded item groups; a single item that cannot fit blocks dispatch. Largest bundles are packed first within their criterion or obligation kind, preferring shared context. This keeps an entry's walk together and bounds the planner's packing search. Each phase's assignments are disjoint and exactly cover its unassigned residual. The final list determines agent count `N`; free slots `K` determine concurrency `min(K,N)` and a lower bound of `ceil(N/K)` waves. Zero slots blocks dispatch. Lower concurrency changes elapsed time, never coverage.

#### Observed Work

The coordinator observes actual work. When a worker exceeds its calibrated cost, retain accepted evidence, retire its unfinished assignment, recalibrate and plan the remaining work. Shared source context may overlap; primary items and file write ownership do not. Inventory closure is partitioned by manifest source so a large surface can fan out without one whole-corpus input packet.

### Returns

Return a JSON file following the [receipt example](../templates/audit-receipt.json). The coordinator [submits it](change-surface.md#submit-audit-results); workers do not edit the canonical ledger.

- **Identity.**
  Copy the assignment ID, captured snapshot and host-bound actor. Give each attempt a unique safe name. Return only owned item IDs, once each. Group IDs only when the same source facts and reason hold for every member.
- **Evidence.**
  Each record has a status, substantive reason and source spans `{source,start,end}`. Mapping, verification and evaluation cite every source in each assigned `row.sources` plus `criterion.source`, including exclusions. Evidence must overlap the named row and criterion. Absence claims and whole-file reads account for the complete relevant source. Inventory discrepancies name missing rows, clauses, references or criteria; the coordinator corrects scope and refreshes.
- **Statuses.**
  Mapping uses `A`, `N`, `U`; verification uses `verified`, `disputed`; evaluation uses `pass`, `finding`, `blocked`. Reads use `read` or `blocked`. Supplemental units use `walked`, `not-applicable`, `finding`, `blocked`. Selected checks use `pass`, `finding`, `blocked`. Finding confirmation uses `confirmed`, `downgraded`, `withdrawn`, `blocked`.
- **Findings.**
  A `finding` record carries a nonempty `findings` array; each member has `band`, `severity`, `origin`, `summary` and `fix`. Before returning findings, read [bands](reporting.md#bands), [severity](reporting.md#severity), [finding rows](reporting.md#finding-rows) and [attribution](audit-mode.md#attribution). A cell can expose several violations. Evidence spans sit on the record. `entry` and `location` default from the cell, and the finding id digests them with the summary, so supplying them by hand keeps them consistent across cells detecting the same violation or the report stops deduplicating it. Duplicate reports retain their classification; conflicting band, severity or origin requires independent reconciliation. A downgrade also supplies `severity` and `band` on the confirmation record; withdrawal states what did not reproduce.
- **Check observations.**
  A measured check includes `check: {command: [program, arguments], cwd, exit_code, output}` where `output` names the captured output file. `pass` requires exit 0; a measured finding requires exit 1 and structured attribution. Exit 2 or unavailable execution remains blocked. The coordinator captures the output bytes alongside source evidence.
- **Partial work.**
  A valid partial return keeps accepted items and leaves the residual incomplete. Failed or invalidated assignments cannot return; a new attempt cannot replace a previously returned item. Correction of an accepted decision uses [reset](change-surface.md#reset-audit-cells). [Retry](change-surface.md#retry-audit-assignment) releases residual ownership for a new bounded assignment.

## Rules

- **Scripts establish structure, agents establish accuracy.**
  Scripts do not create agents or turn simulated judgments into semantic validation.

## Commands

Read [Audit Command Conventions](change-surface.md#audit-command-conventions) first.

### Plan Audit Assignments

Compute disjoint residual assignments under declared budgets.

- Select `inventory`, `map`, `verify`, `evaluate` or `obligations`. Unknown limits, unmet gates or indivisible oversized context refuse dispatch.

```bash
python3 <skill-root>/scripts/audit_surface.py plan --run <run> --phase <phase> --budgets <budgets.json>
```

### Bind Audit Agent

Bind an assignment to its actual host agent identity.

- Independent roles cannot own their authored work; retired assignments require a new residual plan.

```bash
python3 <skill-root>/scripts/audit_surface.py bind --run <run> --assignment <id> --actor <host-agent-id>
```

### Write Audit Packet

Write captured context and ownership for one agent.

- Give the packet and [return contract](#returns) to the bound host agent. Serialized size must fit the plan.

```bash
python3 <skill-root>/scripts/audit_surface.py packet --run <run> --assignment <id> --out <packet.json>
```
