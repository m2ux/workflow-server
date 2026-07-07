---
metadata:
  version: 1.0.0
---

## Capability

Scan the codebase for security-relevant patterns — cryptography, authentication/authorisation, network-exposed surfaces, state management, untrusted-input deserialisation, unsafe code, WASM targets, security-gating feature flags, and custom VMs — and record each characteristic with its location and severity relevance.

## Outputs

### security_characteristics_count

Count of security-relevant patterns found in the target. `0` signals a codebase with no security surface.

## Protocol

### 1. Scan Security Characteristics

- Search for cryptographic imports and usage: hashing (SHA, Blake, Poseidon), signing (Ed25519, ECDSA, Schnorr), encryption (AES, ChaCha), key derivation, commitment schemes, zero-knowledge proof systems
- Search for authentication/authorisation patterns: password handling, token validation, session management, role/permission checks, access control
- Search for network-exposed surfaces: HTTP servers/handlers, RPC endpoints, WebSocket listeners, gRPC services
- Search for state management: database connections, cache layers, persistent storage, Merkle trees, state machines
- Search for serialisation of untrusted input: custom deserialisation, binary parsing, protobuf/JSON with external input, tagged encoding
- Search for unsafe code: unsafe blocks (Rust), FFI/native bindings, raw pointer manipulation, transmute
- Search for WASM compilation targets: wasm-bindgen, wasm-pack, WASM-specific modules
- Search for feature flags that gate security behaviour: test-only features, mock verification, debug modes, feature-gated bypass
- Search for custom VMs or interpreters: bytecode execution, instruction dispatch, gas/cost metering
- Record each characteristic: `{ category, location (file:line), description, severity_relevance }`
- Set `{security_characteristics_count}` to the number of characteristics found. When it is 0, the codebase appears purely presentational or data-only; record that observation.
