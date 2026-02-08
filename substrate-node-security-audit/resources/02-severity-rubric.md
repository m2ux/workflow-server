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
| Shared connection pool (5 conns, RPC + consensus) | 4 | 3 | 3.5 | **High** | RPC access is routine — not Medium |
| Mock data source via env var toggle | 4 | 2 | 3.0 | **Medium** | Requires config control — not Critical |
| Parent header `unwrap()` in inherent creation | 3 | 4 | 3.5 | **High** | Pruning/reorgs trigger passively — not Low |
| Feature-gated genesis digest divergence | 4 | 2 | 3.0 | **Medium** | Heterogeneous builds unlikely — not Critical |
| Fixed-seed RNG 0x42 in treasury minting | 4 | 3 | 3.5 | **High** | Seed is public constant, observation is trivial |
| Chain spec `unwrap()` on malformed properties | 3 | 3 | 3.0 | **Medium** | Attacker controls config file |

## Common Calibration Errors

### Over-Rating (AI agent tendency)
- Rating config toggles as Critical based on worst-case impact, ignoring that exploitation requires privileged access (F=2)
- Rating feature-flag divergence as Critical when heterogeneous builds are operationally unlikely (F=2)

### Under-Rating (AI agent tendency)
- Rating RPC-accessible DoS as Medium when exploitation requires only public network access (F=3)
- Rating availability crashes as Low when the trigger condition occurs under normal operation (F=4)
