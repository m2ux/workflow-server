---
metadata:
  version: 1.0.0
---

## Capability

Group observed characteristics into evidence-grounded audit domains, assign each a risk level calibrated to its exposure and blast radius, elevate trust-boundary-crossing domains, and integrate the user's stated concerns as focus areas.

## Protocol

### 1. Map Domains

- Group characteristics into audit domains. Common domain patterns: Cryptographic Correctness (hashing, signing, commitments, proofs), Value/Token Conservation (balance equations, minting, burning, transfer integrity), Transaction Safety (ordering, atomicity, replay protection), Execution Safety (VM, interpreter, cost model), Storage Integrity (Merkle trees, state transitions, garbage collection), Serialisation Safety (parsing, type confusion, malformed input), Network/API Security (HTTP, RPC, CORS, DoS), Error Handling (panic safety, silent degradation, error recovery), Feature Flag Discipline (test features, mock gates)
- Only include domains that have corresponding code in the target codebase
- Assign risk levels based on exposure and blast radius: CRITICAL — flaws directly compromise system integrity or user assets. HIGH — flaws degrade security guarantees or enable privilege escalation. MEDIUM — flaws have limited blast radius or require specific conditions. LOW — informational findings or defence-in-depth improvements
- If `{trust_boundaries}` is available: domains containing trust-boundary-crossing code get elevated risk. Include specific cross-community call edges as patterns to examine within those domains.
- For each domain, list specific patterns and code paths to examine
- Integrate the user's `{audit_description}`: if the user mentions specific concerns, elevate those areas in the relevant domains
