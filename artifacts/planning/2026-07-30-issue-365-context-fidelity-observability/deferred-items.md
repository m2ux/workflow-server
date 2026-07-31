# Deferred Items

> Context Fidelity and Observability · #365 · updated 2026-07-31

| ID | Deferred at | Item | Reason | Follow-up |
|----|-------------|------|--------|-----------|
| D-1 | requirements-elicitation (S2 decision) | Amend the corpus persist step (`workflows/meta/techniques/workflow-engine/commit-and-persist.md`) so staging honours the declared manifest instead of committing everything under `.engineering/artifacts/` | The stakeholder chose warn-not-block precisely because it breaks no existing run; the corpus half is a behavioural change in a separate submodule and is the corpus territory companion issue #338 already owns. Leaves the #141 failure shape reachable if the orchestrator ignores the warning — accepted knowingly. | #338 |
| D-2 | requirements-elicitation (S3 decision) | Write the per-workflow usage aggregate and cost figure into the work package's token-usage planning artifact | S3's cost estimate stops at the tool boundary in this package. The artifact record is explicitly #338 W3, the same server/corpus boundary the S2 decision kept this package inside. | #338 W3 |
| D-3 | requirements-elicitation (S4 decision) | S8 — the dedup/bundling item conditional on a measurement | Excluded from this package by the user's original scoping because it is gated on a measurement that does not exist yet. S4's `bench:dispatch --gate` arm produces that measurement, so S8 becomes decidable once S4 reports. | #365 (S8 checkbox) |
