---
metadata:
  version: 1.0.0
---

## Capability

360-degree view of one symbol — callers, callees, and the execution flows it participates in.

## Inputs

### name

the symbol to inspect

## Output

### context_report

incoming calls (callers), outgoing calls (callees), process membership with step positions

## Protocol

1. Call `gitnexus_context {name}` to assemble the {context_report} — incoming calls, outgoing calls, and process membership.
   - If the index is out of date, run `npx gitnexus analyze`, then retry.
   - If {name} does not resolve, verify the symbol name; fall back to grep when the symbol is unindexed.
2. Read the {context_report}'s caller fan-out as a blast-radius signal: many callers and broad process participation → the symbol is path-committing; an isolated symbol is low-risk to touch.
