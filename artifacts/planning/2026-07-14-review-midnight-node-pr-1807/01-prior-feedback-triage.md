Prior-feedback triage · start-work-package · 2026-07-15

Ingest and triage of every prior comment and review thread on [PR #1807](https://github.com/midnightntwrk/midnight-node/pull/1807) ("local env usability fixes", head `fix/local-env-usability`, base `main`), performed before any independent analysis so existing signal frames the review.

## Triage table

| # | Source | Author (class) | Concern | Blocker-class? | Disposition | Reasoning |
|---|---|---|---|---|---|---|
| 1 | Top-level comment | `datadog-official` (bot) | 1 pipeline job failed: `CI + E2E \| Local Environment Tests` on commit `bec726a` | Blocker-class (CI failure — runtime/build) | **Confirmed** | The `Local Environment Tests` check is red. Root cause established by finding #5 below (Debian `jq`/`libjq1` pin drift). Reported failure — tagged for downstream reported-failure triage. Comment is minimized/outdated but the underlying check is still FAILURE. |
| 2 | Top-level comment | `jina-simulation` (bot) | Review Blocked — "Insufficient credits"; no findings produced | Non-blocker (no finding) | **Refuted** | No substantive concern raised; the bot could not run. Nothing to address. |
| 3 | Top-level comment | `chatgpt-codex-connector` (bot) | "Codex usage limits reached for code reviews" | Non-blocker (no finding) | **Refuted** | Administrative notice, not a code finding. Nothing to address. |
| 4 | Review (COMMENTED) | `chatgpt-codex-connector` (bot) | Wrapper "automated review suggestions" note on commit `bec726a650` | Non-blocker (wrapper) | **Refuted** | Boilerplate wrapper; the actual Codex finding is the inline thread #6. No standalone concern in this body. |
| 5 | Review (Request Changes) | `m2ux` (human, MEMBER) | Structured review. Blocker 1: `Local Environment Tests` CI still FAILURE, root-caused to a Debian `jq : Depends: libjq1 (= 1.6-2.1+deb12u1) but ...deb12u2` pin drift in `local-environment/src/networks/local-env/configurations/contract-compiler/Dockerfile` (pre-existing, from unrelated PR #1630; would fail on `main` today). | Blocker-class (build/CI failure) | **Confirmed** | Valid and unaddressed by this PR's diff. Reported failure — tagged. Fix is a `jq`/`libjq1` pin bump in a follow-up. Not introduced by this PR but caps merge-readiness while red. |
| 5b | Review (Request Changes) | `m2ux` (human, MEMBER) | Blocker 2: from-genesis validator seed wiring gap — well-known compose files declare `SEED_PHRASE: $MIDNIGHT_NODE_..._SEED` per validator, but `node/src/command.rs` imports keys only from `AURA_SEED_FILE`/`GRANDPA_SEED_FILE`/`CROSS_CHAIN_SEED_FILE` (file paths; no inline-phrase consumer). A `--from-genesis` run starts but never produces/finalizes a block; `collectUnsetComposeVars` can't catch it (var is set but functionally inert). Docs describe from-genesis provisioning as complete without flagging the gap. | Blocker-class (functional — network never finalizes) | **Confirmed** | Re-verified against current HEAD by the reviewer. Pre-existing latent inconsistency newly *exposed* by `--from-genesis` (first mode to let `SEED_PHRASE` reach a container unmodified). Corroborated independently by inline thread #6. Unaddressed by the PR. |
| 5c | Review (non-blocking) | `m2ux` (human, MEMBER) | Prettier: new `throw new Error("--from-genesis and --from-snapshot are mutually exclusive.")` in `local-environment/src/commands/run.ts` fails `npm run lint` (needs 3-line wrap). Also: no CI job lints `local-environment` TS; package has zero automated tests; regex doesn't special-case `${VAR:-default}`/`$$VAR`; `docker inspect` bridge-IP concat would break if node1 were on >1 network (not the case today). | Non-blocker (style / latent / coverage) | **Confirmed** (non-blocking) | Valid observations, none blocker-class. Carry forward as candidate follow-ups; do not gate the verdict. |
| 6 | Inline thread — `local-environment/src/commands/run.ts:184` | `chatgpt-codex-connector[bot]` (bot) | **P2** "Wire validator seed files in from-genesis mode": containers start with empty consensus keystores; from-genesis network cannot produce/finalize blocks unless stale data already holds keys. | Blocker-class (functional — network never finalizes) | **Confirmed** | Same substance as #5b, reached independently by the bot. Valid and unaddressed. Reinforces the seed-wiring blocker. |

## Reported runtime/build failures (single ingest)

Tagged here once for downstream reported-failure triage — do not re-read the source threads:

- **`Local Environment Tests` CI check — FAILURE** (rows 1, 5). `contract-compiler` image build fails at `apt-get install`: `jq : Depends: libjq1 (= 1.6-2.1+deb12u1) but 1.6-2.1+deb12u2 is to be installed`. Debian security-repo drift against an exact pin in `local-environment/src/networks/local-env/configurations/contract-compiler/Dockerfile`. Pre-existing (PR #1630), not caused by this diff.
- **From-genesis network never produces/finalizes blocks** (rows 5b, 6). Not a captured CI log failure but an asserted runtime failure: `SEED_PHRASE` env is set but has no consumer in `node/src/command.rs`, so consensus keystores are empty.

## Rating cap

**`rating_cap` = request-changes tier.**

Two blocker-class concerns are dispositioned **Confirmed** (valid and unaddressed): the red `Local Environment Tests` CI check (#1/#5) and the from-genesis validator seed-wiring gap (#5b/#6). Per `unaddressed-blocker-caps-rating`, the Overall Rating may not exceed request-changes regardless of how light this review's own independent findings turn out to be. An "approve" or "comment only" verdict is precluded while either blocker stands.
