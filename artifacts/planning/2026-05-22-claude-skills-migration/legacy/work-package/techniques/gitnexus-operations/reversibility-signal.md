# reversibility-signal

Gauge how reversible a change to a symbol is, to set the reversibility flag on judgement-augmentation assumptions. (review-assumptions)

## Inputs

- **name** — the symbol the assumption touches

## Output

- **reversibility** — `path-committing` (high caller fan-out and broad process participation) or `easily-reversible` (isolated symbol)

## Procedure

- Run [context](context.md) for the symbol.
- High caller fan-out and broad process participation → path-committing; an isolated symbol → easily-reversible.

## Tools

- **mcp:** gitnexus

## Errors

- **stale_index** — Cause: the index is out of date · Recovery: run `npx gitnexus analyze`, then retry
- **symbol_unknown** — Cause: the symbol does not resolve · Recovery: gauge reversibility from the diff and surrounding code instead
