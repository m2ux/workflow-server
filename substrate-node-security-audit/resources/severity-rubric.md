---
name: severity-rubric
description: Every finding MUST be scored on both dimensions — the full Impact/Feasibility scales, severity mapping, calibration benchmark table, crosscheck procedure, and bias correction.
metadata:
  order: 2
  legacy_id: 2
---

# Severity Scoring Rubric

## The Two Dimensions

Every finding MUST be scored on both dimensions. Do not assign severity intuitively.

### Impact (I): What happens if this is exploited?

| Score | Label | Definition | Examples |
|-------|-------|------------|----------|
| 1 | None | No direct security impact | Code style, missing comments, unused imports |
| 2 | Local | Affects local tooling or off-chain state only | Wallet state corruption, CLI crash, deployer error |
| 3 | Node | Affects node availability, correctness, or data integrity | Node crash, incorrect RPC response, state inconsistency |
| 4 | Network | Affects consensus integrity, enables fund loss, or halts the network | Consensus split, treasury drain, chain halt |

### Feasibility (F): How easy is it to trigger?

| Score | Label | Definition | Examples |
|-------|-------|------------|----------|
| 1 | Extreme | Requires physical access or multiple independent failures | Hardware fault + software bug + timing window |
| 2 | Privileged | Requires privileged access (root, validator, config control) | Env var modification, chain spec tampering, key access |
| 3 | Network | Requires only network access (RPC, p2p, public endpoint) | RPC flood, malformed transaction, peer spoofing |
| 4 | Passive | Occurs under normal operation or routine activity | Database pruning, routine block production, standard configs |

## Computing Severity

```
Average = (Impact + Feasibility) / 2

1.0 - 1.5  →  Informational
2.0 - 2.5  →  Low
3.0        →  Medium
3.5        →  High
4.0        →  Critical
```

## Availability findings: node lifecycle phase gates Impact

Crashes, panics, and fail-stops are scored by **where in the node lifecycle the failure is reachable**, because the security consequence differs sharply:

- **Startup / initialization / configuration / genesis-parse crashes** — reachable only before the node begins syncing (backend/database selection, CLI/config parsing, chain-spec/genesis decoding, offline subcommands). The operator sees the failure immediately, it is self-inflicted and self-correcting (fix the input and restart), and it has no effect on a running network. **Impact = 1 (diagnostic).** These are hardening/diagnostic improvements, not security findings — record them as low-priority issues in the node repository, not in the security report.

- **Crashes reachable while syncing or at the tip** — reachable on a running node: during block import while catching up, or during live block production / import / finalization, inherent processing, or any consensus-path execution once at the tip. A running validator or full node going down threatens network liveness and is not operator-self-correcting. **Impact = 3 (single-node availability) or 4 (network-wide deterministic halt).** These are the availability findings this audit exists to catch.

Feasibility is scored independently. A tip-reachable panic whose error path is genuinely unreachable (e.g. it fires only on already-corrupt on-chain state, proven unreachable from transaction input) still carries full Impact but low Feasibility, so it lands low on severity for the right reason — not because tip crashes are discounted.

## Required Output Format

Every finding must include:

```markdown
**Impact:** {score} — {one-sentence justification}
**Feasibility:** {score} — {one-sentence justification}
**Severity:** {level} (avg {average})
```

## Calibration Benchmark Table

From validated audit sessions benchmarked against professional audits. Use as lookup references when scoring: if a finding resembles a benchmark, use the benchmark's severity as a baseline. Target-specific benchmarks are in [target-profile](./target-profile.md) — load it during scope-setup and use its benchmark table as calibration anchors. If your scoring diverges by two or more levels from a matching benchmark, the benchmark severity is the floor.

| Finding | I | F | Severity | Note |
|---------|---|---|----------|------|
| Connection pool shared (5 conns) between RPC and consensus | 4 | 3 | High | RPC access is routine; not Medium |
| Mock data source toggled by environment variable | 4 | 2 | Medium | Requires config file control; not Critical |
| unwrap() on parent header in inherent data creation | 3 | 4 | High | Occurs under normal operation; not Low |
| Feature-gated genesis digest divergence | 4 | 2 | Medium | Heterogeneous builds operationally unlikely; not Critical |
| Fixed-seed RNG (0x42) in treasury minting | 4 | 3 | High | Seed is public constant |
| Startup/config/genesis-parse panic (bad `--database`, chain-spec, or genesis field) | 1 | 3 | Low | Diagnostic: operator-visible and self-correcting, no running-network effect — file in node repo, not security |
| Panic on the sync/import or block-finalize path (running node) | 3 | 3 | Medium | Running-node crash threatens liveness; I=4 for a deterministic network-wide halt |
| Consensus-path panic reachable only from already-corrupt state | 4 | 1 | Low | Full Impact (tip crash) but the error path is unreachable from transaction input |
| Event emission includes failed operations on partial success | 2 | 3 | Low | Off-chain data integrity; elevate if downstream triggers financial actions |
| SSL mode defaults to Prefer (plaintext downgrade) | 3 | 3 | Medium | Rate High if DB traffic crosses untrusted networks |
| i64 to u128 cast on token quantity from database | 4 | 2 | Medium | DB write access; rate High if db-sync shared/weak controls |
| Unbounded UtxoOwners state growth via missing removal on spend | 3 | 4 | High | Storage lifecycle; every insert without remove |
| Divergent StorageInit in subcommand paths | 4 | 2 | High | Subcommands are routine operational tools |
| Pagination counter off-by-one in UTXO capacity enforcement | 4 | 4 | Critical | Permanent consensus-affecting data loss |
| Incomplete Ord implementation on consensus-relevant struct | 4 | 4 | High | Consensus-relevant ordering has cascading effects |

## Severity Crosscheck (High/Critical findings)

Re-evaluate Feasibility from the attacker's perspective for all High/Critical findings.

**Threshold rules:**

- Connection pool and infrastructure findings affecting consensus paths through routinely-accessible systems (RPC, p2p): Feasibility ≥ 3.
- Panics triggered only by operator-provided invalid configuration (chain spec, config file): Feasibility = 2.
- Conditions occurring under normal operation without attacker action (pruning, routine block production, standard configs): Feasibility = 4.

**Procedure:** For each finding rated Critical or High, verify: (1) Is the affected code reachable from the production node binary? (2) What is the minimum privilege level to trigger? No privileges → F ≥ 3; Config file → F = 2; Validator key → F = 1. (3) Does the finding affect consensus, availability, or neither? Consensus → I = 4; **availability of a running node (crash while syncing or at the tip) → I = 3 (or I = 4 for a deterministic network-wide halt); a startup/config/genesis-parse crash → I = 1 (diagnostic, not a security finding — see "Availability findings: node lifecycle phase gates Impact" above);** Off-chain → I ≤ 2. If I + F < 6, not Critical. If I + F < 5, not High.

## Bias Correction

Correct by comparing against the calibration benchmark table above — do not rely on narrative rules alone.

### Under-Rating (AI agent tendency)

Infrastructure findings (pool sharing, SSL, genesis consistency, config invariants) and running-node availability findings (panics reachable while syncing or at the tip) are systematically under-rated. Compare against the benchmark entries for connection pool, the sync/import-path panic, parent-header panic, and StorageInit divergence.

- Rating RPC-accessible DoS as Medium when exploitation requires only public network access (F=3)
- Rating availability crashes as Low when the trigger condition occurs under normal operation (F=4)
- **Connection pool starvation:** When `max_connections < number_of_concurrent_consumers` AND at least one consumer is RPC-accessible (F=3), the finding is **at minimum High**. If pool exhaustion blocks consensus-critical paths, it is **Critical**.
- **Runtime-path panics (syncing or at the tip):** Database/state inconsistency encountered while syncing or at the tip is normal operation (pruning, reorgs, incomplete sync), so a panic on that path is a genuine availability finding — **I = 3–4, and F >= 3** when the trigger can occur without an attacker. (Startup/config/genesis-parse panics are the *opposite* case: they are diagnostic, **I = 1** — see "Availability findings: node lifecycle phase gates Impact" above — so do not inflate them to Medium/High.)
- **Operational hazards:** If the finding involves a SHARED RESOURCE with concurrent consumers, a SORTED COLLECTION in consensus, or a CONFIGURATION VALUE without invariant enforcement, Feasibility is AT LEAST F=3. These conditions occur under normal operation, not only under attack.
- **Unconditional defects:** If a code defect triggers on **every invocation** of the affected code path (e.g., deterministic deadlock, always-panicking unwrap on a valid config variant, guaranteed integer overflow), Feasibility is at minimum **F=3** (if the code path is reachable from external input) or **F=4** (if the code path executes during normal operation). The words "unconditional", "every invocation", "guaranteed", or "deterministic" in agent evidence are signals to apply this floor. A deadlock that fires on every call to a function is F=4, not F=2.

### Over-Rating (AI agent tendency)

Configuration/toggle findings (mock data source, feature flags, InMemory keystore) and **startup/config/genesis-parse crashes** are systematically over-rated. A node that fails to start on bad operator input is a diagnostic improvement (I = 1), not a security finding — do not score it Medium/High on worst-case reasoning. Compare against the benchmark entries for mock data source, feature-gated genesis, and the startup/config/genesis-parse panic.

- Rating config toggles as Critical based on worst-case impact, ignoring that exploitation requires privileged access (F=2)
- Rating feature-flag divergence as Critical when heterogeneous builds are operationally unlikely (F=2)
- **Toolkit/helper code blast radius:** Findings in off-chain tooling (helpers, CLI, deployers) affect local state only unless the output enters on-chain state. Impact ceiling is I=2 for most toolkit findings. Elevate to I=3 only when the toolkit produces artifacts (transactions, genesis state, signed messages) consumed by the production node.
