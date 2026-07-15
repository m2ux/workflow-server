# Portfolio Lens — Pedagogy

> Review midnight-node PR #1807 · codebase-comprehension · 2026-07-15 · target: PR #1807's from-genesis local-env design

Lens applied independently to the from-genesis bring-up design (`run.ts` `runFromGenesis` + well-known compose files + node seed import).

## Explicit choices and their invisibly-rejected alternatives

1. **Warn-don't-fail on unset compose vars.** Chosen: `collectUnsetComposeVars` prints a warning and proceeds. Rejected: hard-fail (exit non-zero) when a required var is unset.
2. **Detect absence, not inertness.** Chosen: check that a var *reference* is *satisfied* in `env`. Rejected: check that a var is *effective* — that its value flows to a consumer.
3. **Base compose is the source of truth for real inputs.** Chosen: `runFromGenesis` mocks nothing and trusts the compose file to wire every node input. Rejected: a provisioning step that translates developer-supplied seeds into the form the node consumes (`*_SEED_FILE`).
4. **Regex extraction of var names.** Chosen: a lightweight `\$\{?([A-Z][A-Z0-9_]*)` scan. Rejected: `docker compose config` resolution (which would expand `${VAR:-default}` and honor `$$` escapes authoritatively).

## New artifact by someone who internalized these patterns

A developer who absorbed "warn-don't-fail + presence-not-effect" builds a second bring-up mode (say `--from-checkpoint`) the same way: it lists env vars that are unset and proceeds. They unconsciously resurrect the rejected "check effectiveness" path's absence — because the pattern taught them that *presence of a reference* is the safety bar. Concretely: their new mode sets `CHECKPOINT_URI` in compose, the node reads `RESTORE_FROM`, and the warning stays silent while nothing restores — an exact structural replay of the `SEED_PHRASE` / `*_SEED_FILE` gap.

## Which transferred patterns create silent vs. visible problems

- **Silent:** "presence-not-effect" validation. A set-but-unwired var passes every check and fails only at runtime as a non-producing chain — no error, no exit code.
- **Visible:** "warn-don't-fail" alone is visible (a warning is printed), *if* the var is actually unset. It degrades to silent the moment the var is set-but-inert.

## Pedagogy law

**The constraint "a referenced variable is a satisfied requirement" is transferred as the assumption "a set variable is a working input."** The validator checks the wrong side of the producer/consumer contract — it verifies the producer emitted *something*, never that the consumer's expected name is what got emitted.

## Prediction — which invisible transferred decision fails first, slowest to discover

The seed-wiring inertness fails first and is discovered slowest: a from-genesis network starts cleanly, containers report healthy (the healthcheck probes the RPC port, not block height), and only minutes-to-hours later does the developer notice block height is stuck at 0. Nothing in the tool's output points at seeds — the developer suspects networking or main-chain data-source config before the (inert-but-present) `SEED_PHRASE`.
