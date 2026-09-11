---
metadata:
  version: 2.0.0
---

## Capability

Propose a tier-appropriate mitigation for a single finding — a correction, a reframing, a novel mechanism, or an acknowledgement — preserving the author's intent.

## Outputs

### proposed_mitigation

The mitigation proposed for the finding: its tier, the target location it addresses, the replacement or new text, and the reasoning that ties the text to the finding's critique.

## Protocol

### 1. Read the Finding

- Read `{current_finding}` — its critique, the claim it disputes, and the tier that fixes the mitigation's shape.

### 2. Compose the Mitigation

- Compose `{proposed_mitigation}` in the shape the finding's tier prescribes (`t1-correction`, `t2-reframing`, `t3-novel-mechanism`, `t4-acknowledgement`), carrying the target location, the text, and the reasoning.  
  > When the run reaches this operation again for a finding already proposed on, the context gathered since supersedes the earlier proposal's wording.

## Rules

### t1-correction

A `T1` mitigation names the incorrect text, gives the corrected replacement, and cites the source establishing the correction.

### t2-reframing

A `T2` mitigation names the claim, states why it needs qualification, and gives replacement text that holds the claim's intent under honest scoping, shown against the original in context.

### t3-novel-mechanism

A `T3` mitigation gives a mechanism, architectural addition, or content section that answers the critique without striking the claim, with the full proposed text and the reasoning that connects it to the critique.

### t4-acknowledgement

A `T4` mitigation states why the target cannot resolve the finding within itself, and gives acknowledgement language for the constraint and the target's relation to it.
