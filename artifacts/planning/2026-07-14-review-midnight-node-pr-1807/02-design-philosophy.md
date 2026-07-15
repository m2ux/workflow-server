# Design Philosophy

> design-philosophy · Review midnight-node PR #1807 (local env usability fixes) · #1468 Fork chosen network in CI and test node/runtime upgrade · 2026-07-15

## Problem Statement

PR #1807 ("local env usability fixes", head `fix/local-env-usability`, base `main`, +161/-9 across 7 root-level files) must be reviewed for correctness, safety, and completeness before merge. It adds a `--from-genesis` start mode, stale-data and unset-compose-var warnings, and a `fork-network` CI-hang fix to the `local-environment` developer tooling. Two prior-raised blocker-class concerns are already Confirmed unaddressed — a red `Local Environment Tests` CI check (pre-existing `jq`/`libjq1` pin drift) and a `--from-genesis` seed-wiring gap where `SEED_PHRASE` is set but never consumed, so a from-genesis network starts yet never finalizes blocks — and cap merge-readiness at request-changes.

### System Context

- **Target:** `local-environment` TypeScript package (`src/commands/run.ts`, `src/index.ts`, `src/lib/types.ts`, `README.md`) plus `.github/workflows/fork-network.yml`, `changes/node/added/local-env-from-genesis.md`, and `docs/fork-testing.md`. Developer tooling, not production consensus code.
- **Spec source:** issue #1468 carries an empty feature-request template; the operative specification is rsporny's comment [#issuecomment-4767302657](https://github.com/midnightntwrk/midnight-node/issues/1468#issuecomment-4767302657) listing five usability concerns (fork-network dispatch failing, unclear fork-network image inputs, PR #1676 TODO incomplete, missing snapshot-acquisition docs, well-known-network from-genesis regression).
- **Drift:** prior human (`m2ux`) and bot (`chatgpt-codex-connector`) reviews were against commit `bec726a650`; current PR head is `98dd8e11`. GitNexus index is keyed at the stale head `bec726a650`. Findings reconcile against current head.
- **Cross-boundary claim:** the seed-wiring blocker spans the TS tooling (`collectUnsetComposeVars`, `run.ts`, compose `SEED_PHRASE` vars) and the Rust node (`node/src/command.rs` seed imports from `AURA_SEED_FILE`/`GRANDPA_SEED_FILE`/`CROSS_CHAIN_SEED_FILE`).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — capped at request-changes by two Confirmed unaddressed blockers |
| Scope | Every developer using local-env from-genesis; the red CI check; no production/consensus surface |
| Business Impact | Developer velocity and trust in local tooling; a from-genesis network that silently never finalizes is a latent time-sink |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** This is a review task — assess an existing change for merge-readiness, not repair a defect — so it classifies as an inventive-improvement goal (quality gate that enhances/validates existing developer tooling) rather than a specific problem. Complexity is moderate: the diff is small and confined to dev tooling, but the review must reconcile two Confirmed blocker-class concerns against a drifted head (`bec726a650` → `98dd8e11`), and one blocker is a cross-boundary functional claim (`SEED_PHRASE` reaching containers vs. its consumers in `node/src/command.rs`) that spans TypeScript tooling and Rust node code. No architectural decisions or contradictory requirements are involved, which keeps it below complex. A GitNexus complexity-signal probe would be marginal given the small tooling diff and the stale index, so classification rests on the issue/PR text.

## Workflow Path Decision

**Selected Path:** Review track (headless-after-activation) — direct to implementation-analysis

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** In review mode the path is fixed to the review track and proceeds headlessly to implementation-analysis to establish the PR's pre-change baseline. Codebase comprehension is mandatory on every path to reconcile the two Confirmed blockers against current head `98dd8e11`. Elicitation adds no value — the spec (rsporny's five-point comment) and prior findings are already in hand — and research adds none for a small, well-scoped dev-tooling PR. `needs_elicitation`, `needs_research` = false; `skip_optional_activities` = true; `needs_comprehension` = true.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Review-scoped; agentic assist plus separate human review time |
| Technical | GitNexus index keyed at stale head `bec726a650`; target worktree detached at PR head `98dd8e11`; squash-merge supported |
| Dependencies | Seed-wiring verification depends on Rust node code outside the PR diff (`node/src/command.rs`); the red CI check depends on a pre-existing dependency pin (`jq`/`libjq1`) from unrelated PR #1630 |
| Resources | `rating_cap` = request-changes — two Confirmed blockers preclude an approve/comment verdict |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Blocker reconciliation | Both Confirmed blockers re-checked against current head `98dd8e11` | Each blocker confirmed present/absent with head-anchored evidence |
| Independent verification | PR's own changes assessed for correctness, safety, completeness | Findings graded; the five rsporny concerns each mapped to a disposition |
| Merge-readiness verdict | Overall rating produced under the cap | Clear verdict (ready / ready-with-follow-ups / needs-changes), Overall Rating ≤ request-changes |

## Notes

- The path-confirmation checkpoint is skipped in review mode; `problem_complexity` is taken from classification (`moderate`), not from a checkpoint effect.
- Reported failures already tagged in `01-prior-feedback-triage.md`: the red `Local Environment Tests` CI check and the from-genesis never-finalizes runtime claim — do not re-ingest the source threads downstream.
