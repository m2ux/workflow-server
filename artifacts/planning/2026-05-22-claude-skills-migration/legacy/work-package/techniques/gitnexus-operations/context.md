# context

360-degree view of one symbol — callers, callees, and the execution flows it participates in.

## Inputs

### name

the symbol to inspect

## Output

### context_report

incoming calls (callers), outgoing calls (callees), process membership with step positions

## Procedure

1. Call `gitnexus_context {name}`.
2. Read caller fan-out as a blast-radius signal: many callers and broad process participation → the symbol is path-committing; an isolated symbol is low-risk to touch.

## Errors

### stale_index

**Cause:** the index is out of date

**Recovery:** run `npx gitnexus analyze`, then retry

### symbol_not_found

**Cause:** name does not resolve

**Recovery:** verify the symbol name; fall back to grep when unindexed
