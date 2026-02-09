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

## Required Output Format

Every finding must include:

```markdown
**Impact:** {score} — {one-sentence justification}
**Feasibility:** {score} — {one-sentence justification}
**Severity:** {level} (avg {average})
```

## Calibration Examples

These examples are derived from validated audit sessions benchmarked against professional audit reports:

| Finding | I | F | Avg | Severity | Key Insight |
|---------|---|---|-----|----------|-------------|
| Shared connection pool (5 conns, RPC + consensus) | 4 | 3 | 3.5 | **Critical** | When pool size < consumer count AND RPC consumers share the pool, RPC access (F=3) can exhaust all connections. LA rates Critical. Do not downgrade based on "contention is probabilistic." |
| Mock data source via env var toggle | 4 | 2 | 3.0 | **Medium** | Requires config control — not Critical |
| Parent header `unwrap()` in inherent creation | 3 | 4 | 3.5 | **High** | Pruning/reorgs trigger passively — not Low |
| Feature-gated genesis digest divergence | 4 | 2 | 3.0 | **Medium** | Heterogeneous builds unlikely — not Critical |
| Fixed-seed RNG 0x42 in treasury minting | 4 | 3 | 3.5 | **High** | Seed is public constant, observation is trivial |
| Chain spec `unwrap()` on malformed properties | 3 | 3 | 3.0 | **Medium** | Attacker controls config file |
| Startup panic on chain spec `unwrap()` (pruning/CI) | 3 | 3 | 3.0 | **Medium** | Config file control is routine — CI pipelines, manual edits, distribution channels all produce malformed specs. F >= 3 when any non-attacker path triggers the condition. |
| Panic on missing parent header (pruning) | 3 | 4 | 3.5 | **High** | Database pruning and reorgs are normal operation — F=4, not F=2. The trigger does not require an attacker. |

## Common Calibration Errors

### Over-Rating (AI agent tendency)
- Rating config toggles as Critical based on worst-case impact, ignoring that exploitation requires privileged access (F=2)
- Rating feature-flag divergence as Critical when heterogeneous builds are operationally unlikely (F=2)
- **Toolkit/helper code blast radius (v4.5):** Findings in `ledger/helpers/` and `util/toolkit/` affect local tooling only (wallets, CLI, deployers) unless the toolkit output enters on-chain state. Impact ceiling is I=2 for most toolkit findings. Only elevate to I=3 if the toolkit produces artifacts (transactions, genesis state, signed messages) consumed by the production node. Group D's per-function matrix may produce many FAIL cells — aggregate them by blast radius, not by raw count.

### Under-Rating (AI agent tendency)
- Rating RPC-accessible DoS as Medium when exploitation requires only public network access (F=3)
- Rating availability crashes as Low when the trigger condition occurs under normal operation (F=4)
- **Connection pool starvation (v4.5):** When `max_connections < number_of_concurrent_consumers` AND at least one consumer is RPC-accessible (F=3), the finding is **at minimum High**. If pool exhaustion blocks consensus-critical paths (inherent data creation, authority selection), it is **Critical**. Do not assess feasibility as "requires sustained load" (F=2) — a single burst of concurrent RPC requests during block production is sufficient.

### Under-Rating Configuration-Triggered Panics (AI agent tendency)

AI agents rate `unwrap()`/`expect()` panics triggered by configuration, chain spec, or database state as Low (F=1-2, "requires config file control or DB corruption"). Professional auditors consistently rate these as Medium or High because:

1. **Chain spec distribution is not privileged.** Chain specs are shared files — CI artifacts, manual edits, operator distribution channels, and genesis ceremony tooling all produce chain specs. A malformed spec is not an exotic attack; it is a routine operational hazard. **F >= 3.**

2. **Database inconsistency is normal operation.** Pruning, reorgs, and incomplete sync are standard conditions, not attacks. A panic triggered by a missing parent header occurs during routine block production after pruning. **F = 4.**

3. **Node startup is not a recovery-safe context.** A panic during startup prevents the node from starting at all. Unlike a runtime panic (which Substrate can sometimes recover from), a startup panic causes a crash loop with no self-healing path.

**Rule of thumb:** If the trigger condition can occur without an attacker (routine ops, config errors, standard DB maintenance), the Feasibility is at least F=3 regardless of whether an attacker *could also* trigger it.
