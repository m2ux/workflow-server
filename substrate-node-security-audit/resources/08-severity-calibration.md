# Severity Calibration (Rubric Scales and Examples)

Use with **resource 02 (severity rubric)** for scoring. This resource provides the full Impact/Feasibility scales, severity mapping, calibration examples, crosscheck procedure, and bias correction.

## Scoring Rubric Scales

### Impact (1–4): How severe is the consequence if exploited?

| Score | Label | Definition |
|-------|-------|-------------|
| 1 | Informational | No direct security impact — code quality, documentation, style |
| 2 | Low | Affects local tooling or off-chain state only (wallets, CLI, deployers) |
| 3 | Medium | Affects node availability, correctness, or data integrity |
| 4 | Critical | Affects consensus integrity, enables fund loss, or halts the network |

### Feasibility (1–4): How easy is it for an attacker to trigger?

| Score | Label | Definition |
|-------|-------|-------------|
| 1 | Unlikely | Requires physical access, highly unlikely conditions, or multiple independent failures |
| 2 | Privileged | Requires privileged access (root, validator key, config file control, operator action) |
| 3 | Network | Requires only network access (RPC, p2p, public endpoint) |
| 4 | Passive | Occurs under normal operation, passive conditions, or routine network activity |

### Severity Mapping

Severity = map((Impact + Feasibility) / 2):

- 1.0–1.5 → Informational  
- 2.0–2.5 → Low  
- 3.0 → Medium  
- 3.5 → High  
- 4.0 → Critical  

## Calibration Examples

From validated audit sessions benchmarked against professional audits. Use as lookup references when scoring.

| Finding | I | F | Severity | Note |
|---------|---|---|----------|------|
| Connection pool shared (5 conns) between RPC and consensus | 4 | 3 | High | RPC access is routine; not Medium |
| Mock data source toggled by environment variable | 4 | 2 | Medium | Requires config file control; not Critical |
| unwrap() on parent header in inherent data creation | 3 | 4 | High | Occurs under normal operation; not Low |
| Feature-gated genesis digest divergence | 4 | 2 | Medium | Heterogeneous builds operationally unlikely; not Critical |
| Fixed-seed RNG (0x42) in treasury minting | 4 | 3 | High | Seed is public constant |
| Chain spec unwrap() panics on malformed properties | 3 | 3 | Medium | Attacker controls chain spec via distribution |
| Event emission includes failed operations on partial success | 2 | 3 | Low | Off-chain data integrity; elevate if downstream triggers financial actions |
| SSL mode defaults to Prefer (plaintext downgrade) | 3 | 3 | Medium | Rate High if DB traffic crosses untrusted networks |
| i64 to u128 cast on token quantity from database | 4 | 2 | Medium | DB write access; rate High if db-sync shared/weak controls |
| Unbounded UtxoOwners state growth via missing removal on spend | 3 | 4 | High | Storage lifecycle; every insert without remove |
| Divergent StorageInit in subcommand paths | 4 | 2 | High | Subcommands are routine operational tools |
| Startup panic via unchecked chain spec properties | 3 | 3 | High | Chain spec distribution is realistic attack vector |
| Pagination counter off-by-one in UTXO capacity enforcement | 4 | 4 | Critical | Permanent consensus-affecting data loss |
| Incomplete Ord implementation on consensus-relevant struct | 4 | 4 | High | Consensus-relevant ordering has cascading effects |

## Severity Crosscheck (High/Critical findings)

Re-evaluate Feasibility from the attacker's perspective for all High/Critical findings.

**Threshold rules:**

- Connection pool and infrastructure findings affecting consensus paths through routinely-accessible systems (RPC, p2p): Feasibility ≥ 3.
- Panics triggered only by operator-provided invalid configuration (chain spec, config file): Feasibility = 2.
- Conditions occurring under normal operation without attacker action (pruning, routine block production, standard configs): Feasibility = 4.

**Procedure:** For each finding rated Critical or High, verify: (1) Is the affected code reachable from the production node binary? (2) What is the minimum privilege level to trigger? No privileges → F ≥ 3; Config file → F = 2; Validator key → F = 1. (3) Does the finding affect consensus or just availability? Consensus → I = 4; Availability → I = 3; Off-chain → I ≤ 2. If I + F < 6, not Critical. If I + F < 5, not High.

## Bias Correction

Correct by comparing against the calibration examples above — do not rely on narrative rules alone.

**Under-rating pattern:** Infrastructure findings (pool sharing, SSL, genesis consistency, config invariants) and availability findings (panics under normal operation) are systematically under-rated. Compare against calibration examples for connection pool, chain spec panic, parent header panic, and StorageInit divergence.

**Over-rating pattern:** Configuration/toggle findings (mock data source, feature flags, InMemory keystore) are systematically over-rated. Compare against calibration examples for mock data source and feature-gated genesis.
