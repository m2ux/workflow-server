---
metadata:
  version: 1.0.0
---

## Capability

Collect and classify the assumptions made during the work against `{assumption_categories}`, appending them to the assumptions log.

## Inputs

### activity_context

The context in which assumptions are generated, used to choose the category appropriate to the current phase (supplied via `step.technique.inputs`).

### assumption_categories

The list of categories used to classify each assumption (supplied via `step.technique.inputs`).

### assumptions_log

*(optional)* The existing assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) to append to; a fresh log is started when none exists.

## Outputs

### assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) with the newly collected, classified assumptions appended — each carrying type, statement, rationale, and alternatives. This file is the record of truth for the surfaced assumptions.

### open_assumptions

The collected assumptions classified as open (stakeholder-dependent, non-code-resolvable), which downstream steps iterate for review; empty when none were identified.

### has_open_assumptions

Boolean gate — true iff `{open_assumptions}` is non-empty; gates whether the interview step is entered.

## Protocol

1. Identify all implicit decisions and assumptions made
2. Classify each by a category from `{assumption_categories}`, choosing the category appropriate to the `{activity_context}` generating them
   > Use the categories supplied for the current phase.
3. If no significant assumptions are identified, explicitly confirm with the user that no assumptions were made before proceeding
4. Append collected assumptions to the `{assumptions_log}` (or start a fresh log if none exists), recording type, statement, rationale, and alternatives for each
5. The file is the record of truth — do not restate assumption content outside it
6. Each bold-label line (Status, Resolvability, Assumption, Evidence, Risk, etc.) MUST end with two trailing spaces to produce a line break in rendered markdown. Without trailing spaces, consecutive bold lines collapse into a single paragraph. Do NOT use bullet prefixes for this — use trailing spaces only. See [assumption-reconciliation](../../resources/assumption-reconciliation.md) for correct vs incorrect examples.
