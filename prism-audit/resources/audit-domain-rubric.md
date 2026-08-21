---
name: audit-domain-rubric
description: The audit domains a security audit groups a target's characteristics into, and the risk levels each domain is calibrated against.
---

# Audit Domain Rubric

## Domains

A domain groups a target's observed characteristics into one area of security concern. A domain enters an audit only where the target holds code for it.

| Domain | Covers |
|--------|--------|
| Cryptographic Correctness | Hashing, signing, commitments, proofs |
| Value/Token Conservation | Balance equations, minting, burning, transfer integrity |
| Transaction Safety | Ordering, atomicity, replay protection |
| Execution Safety | VM, interpreter, cost model |
| Storage Integrity | Merkle trees, state transitions, garbage collection |
| Serialisation Safety | Parsing, type confusion, malformed input |
| Network/API Security | HTTP, RPC, CORS, denial of service |
| Error Handling | Panic safety, silent degradation, error recovery |
| Feature Flag Discipline | Test features, mock gates |

These are the domains recurring often enough to be worth a name. A target whose concerns fall outside them takes a domain named for what its own code does.

## Risk Levels

A domain's risk is calibrated against what a flaw in it would reach — its exposure, and its blast radius.

| Level | A flaw in this domain |
|-------|-----------------------|
| `CRITICAL` | Directly compromises system integrity or user assets |
| `HIGH` | Degrades a security guarantee, or enables privilege escalation |
| `MEDIUM` | Has limited blast radius, or needs specific conditions to reach |
| `LOW` | Is informational, or a defence-in-depth improvement |

A domain holding code that crosses a trust boundary takes an elevated level, since a flaw there is reachable from outside the boundary it crosses.

These levels calibrate the prompt an audit hands to its analysis. The severity a finding carries afterwards is the one its source analysis assigned.
