---
name: audit-domain-rubric
description: The audit domains a security audit groups a target's characteristics into, and the risk levels each domain is calibrated against.
---

# Audit Domain Rubric

## Security Characteristics

A characteristic is a security-relevant pattern a codebase actually contains. These are what a scan looks for, and what it finds is what grounds the domains below in evidence rather than in a checklist.

| Category | Patterns |
|----------|----------|
| Cryptography | Hashing (SHA, Blake, Poseidon), signing (Ed25519, ECDSA, Schnorr), encryption (AES, ChaCha), key derivation, commitment schemes, zero-knowledge proof systems |
| Authentication and authorisation | Password handling, token validation, session management, role and permission checks, access control |
| Network-exposed surface | HTTP servers and handlers, RPC endpoints, WebSocket listeners, gRPC services |
| State management | Database connections, cache layers, persistent storage, Merkle trees, state machines |
| Untrusted-input deserialisation | Custom deserialisation, binary parsing, protobuf or JSON carrying external input, tagged encoding |
| Unsafe code | Unsafe blocks, FFI and native bindings, raw pointer manipulation, transmute |
| WASM target | wasm-bindgen, wasm-pack, WASM-specific modules |
| Security-gating feature flag | Test-only features, mock verification, debug modes, feature-gated bypass |
| Custom VM or interpreter | Bytecode execution, instruction dispatch, gas or cost metering |

A codebase in which none of these appears has no security surface, and the count of characteristics found is what says so.

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
