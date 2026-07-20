---
metadata:
  version: 1.0.0
---

## Capability

Turn a research `{goal}` into parallel research questions as `{work_units}` — the plan half of lead-researcher.

## Inputs

### goal

Research question or brief.

### context

*(optional)* Scope limits, sources to prefer/avoid, deadline hints.

### effort_cap

*(optional)* Maximum number of parallel research questions.

## Outputs

### work_units

Ordered research units `{ id, brief, tools_hint? }` suitable for parallel fan-out. Each brief is one research question with return-format instructions for structured findings.

## Protocol

1. Derive breadth-first research questions that cover `{goal}` with minimal overlap.
2. Honour `{effort_cap}` when set (prefer fewer sharper questions over exceeding the cap).
3. Emit `{work_units}` with briefs that demand structured findings (claims + sources), not open-ended essays.
