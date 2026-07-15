# Portfolio Lens — Rejected-Paths

> Review midnight-node PR #1807 · codebase-comprehension · 2026-07-15 · target: PR #1807's from-genesis local-env design

Lens applied independently to the from-genesis bring-up design.

## Concrete problems and the decisions that enabled them

1. **From-genesis network never finalizes (empty keystores).** Enabled by the decision to make `runFromGenesis` a pure pass-through that trusts the base compose to wire consensus seeds, combined with the compose files setting the inert `SEED_PHRASE` rather than `*_SEED_FILE`.
2. **The unset-var warning gives false assurance.** Enabled by validating reference-satisfaction rather than consumer-effectiveness.
3. **Prettier/lint gap on the new `throw` line goes uncaught.** Enabled by the decision to leave `local-environment` TS unlinted in CI.

## Rejected path that would have prevented problem 1 — and its new invisible danger

**Rejected path:** `runFromGenesis` provisions seeds — write each `MIDNIGHT_NODE_0N_0_SEED` phrase to a file and set `*_SEED_FILE` to that path (or invoke the node's `insert-key`/keystore path) before `docker compose up`.

- **Visible problem that vanishes:** the never-finalizing chain — validators now get keys.
- **Invisible danger that emerges:** the tool now writes secret material (seed phrases) to disk on the developer's host and into container-visible mounts. Secret-handling surface, cleanup obligations, and the risk of committing/leaking a seed file appear where before the tool touched no secrets. It also couples the local-env tool to the node's exact keystore/seed-file contract, so a node-side change to seed intake silently breaks the tool.

## Design taking all rejected paths (hard-fail + effectiveness-check + provision + config-based extraction + CI lint)

Concretely: from-genesis would (a) resolve compose via `docker compose config`, (b) assert each *consumer-expected* var (`*_SEED_FILE`) is set to a readable path, hard-failing otherwise, (c) materialize seeds from developer phrases, and (d) be gated by a `local-environment` lint job.

- **Visible problems that vanish:** never-finalizing chain; false-assurance warning; lint drift.
- **Invisible dangers that emerge:** secret-on-disk exposure; tight coupling to the node's seed contract (tool breaks when the node changes intake); hard-fail brittleness (a developer intentionally running a partial/observer setup is now blocked); and slower bring-up (config resolution + provisioning steps).

## Law — which class of problem migrates between visible and hidden

**Trust-boundary problems migrate between "silent runtime incorrectness" and "explicit secret-handling / coupling burden."** Pushing seed provisioning *into* the tool converts an invisible correctness gap into a visible security-and-coupling cost; leaving it *out* (this PR) converts that cost into an invisible correctness gap. The total problem is conserved; only its visibility moves.

## Prediction — which migration a practitioner discovers first under pressure

Under pressure (a developer needs a working from-genesis network *now*), they discover the **correctness gap first** (chain stuck at block 0) because it blocks their immediate goal. The security/coupling costs of the provisioning path are discovered only later, in review or incident retrospective — which is precisely why the minimal pass-through design shipped: its cost is deferred and invisible at authoring time, while the provisioning path's cost is visible and objected-to at authoring time.
