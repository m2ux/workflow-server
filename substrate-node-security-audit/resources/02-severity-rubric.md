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

Target-specific calibration examples are in **resource 06 (target-profile)**. Load the target profile during scope-setup and use its severity benchmark table as calibration anchors. If your scoring diverges by 2+ levels from the benchmark, re-evaluate.

## Common Calibration Errors

### Over-Rating (AI agent tendency)
- Rating config toggles as Critical based on worst-case impact, ignoring that exploitation requires privileged access (F=2)
- Rating feature-flag divergence as Critical when heterogeneous builds are operationally unlikely (F=2)
- **Toolkit/helper code blast radius:** Findings in off-chain tooling (helpers, CLI, deployers) affect local state only unless the output enters on-chain state. Impact ceiling is I=2 for most toolkit findings. Elevate to I=3 only when the toolkit produces artifacts (transactions, genesis state, signed messages) consumed by the production node.

### Under-Rating (AI agent tendency)
- Rating RPC-accessible DoS as Medium when exploitation requires only public network access (F=3)
- Rating availability crashes as Low when the trigger condition occurs under normal operation (F=4)
- **Connection pool starvation:** When `max_connections < number_of_concurrent_consumers` AND at least one consumer is RPC-accessible (F=3), the finding is **at minimum High**. If pool exhaustion blocks consensus-critical paths, it is **Critical**.
- **Configuration-triggered panics:** Chain spec distribution is not privileged (CI, manual edits, distribution channels). Database inconsistency is normal operation (pruning, reorgs, incomplete sync). Node startup panics cause crash loops with no self-healing. **F >= 3** when the trigger can occur without an attacker.
- **Operational hazards:** If the finding involves a SHARED RESOURCE with concurrent consumers, a SORTED COLLECTION in consensus, or a CONFIGURATION VALUE without invariant enforcement, Feasibility is AT LEAST F=3. These conditions occur under normal operation, not only under attack.