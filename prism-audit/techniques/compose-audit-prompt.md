---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Analyse a codebase to identify security-relevant characteristics and compose a detailed, self-contained audit prompt tailored to its architecture, language, and trust boundaries

## Inputs

### target_path

Path to the codebase or directory to audit

### audit_description

User's description of what to audit, focus areas, and specific concerns

### output_path

Directory to write the audit prompt artifact

## Protocol

### 1. Survey Structure

- List files and directories at the top level of target_path
- Identify the build system: Cargo.toml (Rust), package.json (JS/TS), go.mod (Go), pyproject.toml (Python), etc.
- For workspace/monorepo projects, enumerate all packages/crates/modules from the build configuration
- Count lines of code per module (excluding tests, docs, generated files)
- Identify test directories and test file patterns
- If GitNexus is available (check via gitnexus_list_repos): use gitnexus_query to discover functional areas, execution flows, and community clusters — these produce better module boundaries and dependency maps than directory layout alone
- If GitNexus is available: use gitnexus_context on high-risk modules to check fan-in (number of callers) — high fan-in modules have larger blast radius and should be elevated in risk classification
- Record: language, build_system, modules (array of { name, path, line_count, purpose, fan_in (if GitNexus available) }), total_loc, gitnexus_available (boolean)

### 2. Scan Security Characteristics

- Search for cryptographic imports and usage: hashing (SHA, Blake, Poseidon), signing (Ed25519, ECDSA, Schnorr), encryption (AES, ChaCha), key derivation, commitment schemes, zero-knowledge proof systems
- Search for authentication/authorisation patterns: password handling, token validation, session management, role/permission checks, access control
- Search for network-exposed surfaces: HTTP servers/handlers, RPC endpoints, WebSocket listeners, gRPC services
- Search for state management: database connections, cache layers, persistent storage, Merkle trees, state machines
- Search for serialisation of untrusted input: custom deserialisation, binary parsing, protobuf/JSON with external input, tagged encoding
- Search for unsafe code: unsafe blocks (Rust), FFI/native bindings, raw pointer manipulation, transmute
- Search for WASM compilation targets: wasm-bindgen, wasm-pack, WASM-specific modules
- Search for feature flags that gate security behaviour: test-only features, mock verification, debug modes, feature-gated bypass
- Search for custom VMs or interpreters: bytecode execution, instruction dispatch, gas/cost metering
- Record each characteristic: { category, location (file:line), description, severity_relevance }

### 3. Map Trust Boundaries

- If GitNexus is unavailable (gitnexus_available is false), skip this step entirely.
- Use gitnexus_cypher to find cross-community call edges: MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(callee), (caller)-[:CodeRelation {type: 'MEMBER_OF'}]->(c1:Community), (callee)-[:CodeRelation {type: 'MEMBER_OF'}]->(c2:Community) WHERE c1 <> c2 RETURN c1.heuristicLabel, c2.heuristicLabel, caller.name, callee.name. These edges represent trust boundary crossings where validation may be absent.
- Use gitnexus_impact(direction: upstream) on each security-critical symbol identified in scan-security-characteristics to map its blast radius — every upstream caller is a potential attack vector. Record: security_blast_radii (map of symbol to { direct_callers, affected_processes, affected_modules, risk }).
- Record: trust_boundaries (array of { from_community, to_community, crossing_symbols }). Domains containing trust-boundary-crossing code will receive elevated risk in map-domains.

### 4. Map Domains

- Group characteristics into audit domains. Common domain patterns: Cryptographic Correctness (hashing, signing, commitments, proofs), Value/Token Conservation (balance equations, minting, burning, transfer integrity), Transaction Safety (ordering, atomicity, replay protection), Execution Safety (VM, interpreter, cost model), Storage Integrity (Merkle trees, state transitions, garbage collection), Serialisation Safety (parsing, type confusion, malformed input), Network/API Security (HTTP, RPC, CORS, DoS), Error Handling (panic safety, silent degradation, error recovery), Feature Flag Discipline (test features, mock gates)
- Only include domains that have corresponding code in the target codebase
- Assign risk levels based on exposure and blast radius: CRITICAL — flaws directly compromise system integrity or user assets. HIGH — flaws degrade security guarantees or enable privilege escalation. MEDIUM — flaws have limited blast radius or require specific conditions. LOW — informational findings or defence-in-depth improvements
- If trust boundary data is available: domains containing trust-boundary-crossing code get elevated risk. Include specific cross-community call edges as patterns to examine within those domains.
- For each domain, list specific patterns and code paths to examine
- Integrate the user's audit_description: if the user mentions specific concerns, elevate those areas in the relevant domains

### 5. Identify Cross Cutting

- Error handling patterns: how the codebase handles errors across modules (panic vs Result, unwrap usage, silent error swallowing)
- Feature flag discipline: which features gate security-critical behaviour, risk of test/mock code in production
- Trust boundary consistency: where trust transitions occur and whether they are consistently enforced
- Dependency risk: third-party dependencies with known vulnerabilities or unmaintained status

### 6. Compose Prompt

- Structure the prompt document with clear sections
- Section 1: Codebase Overview — architecture summary, language, total LOC, module layout table (name, path, lines, purpose)
- Section 2: Audit Domains — one subsection per domain with: Domain Name, Risk Level, Scope (which modules/files), Focus Areas (specific patterns to examine), Key Questions (what the audit should answer)
- Section 3: Trust Boundary Map (if GitNexus data available; omit section if unavailable) — cross-community call edges with from/to community labels and crossing symbols, security-critical symbol blast radii with direct caller counts and affected process counts
- Section 4: Cross-Cutting Concerns — error handling, feature flags, trust boundaries, dependencies
- Section 5: Output Requirements — 'Produce findings with: ID, severity (using Impact x Feasibility rubric), description, location (file:line), impact, recommendation. Organise by domain and severity.'
- The prompt must be self-contained: readable and actionable without additional context beyond the codebase path

### 7. Build Scopes

- For most audits: create a single scope entry covering the entire codebase
- Single scope: { target: target_path, output_subdir: 'analysis', pipeline_mode: 'full-prism', analysis_focus: <composed prompt summary> }
- For very large codebases (>100K LOC) with clearly separable security boundaries: consider multiple scopes, each focused on a distinct trust domain
- Set analysis_focus for each scope to a focused description derived from the prompt, NOT the literal string 'security audit'

## Outputs

### audit-prompt

The composed [audit prompt document](../resources/audit-prompt-template.md#audit-prompt-template)

#### artifact

`audit-prompt.md`

#### overview

Codebase architecture and structure

#### domains

Audit domains with risk levels and focus areas

#### cross_cutting

Cross-cutting security concerns

#### output_requirements

Expected deliverable format

### audit-scopes

Array of scope objects for triggering prism workflows

#### scopes

Array of { target, output_subdir, pipeline_mode, analysis_focus }

## Errors

### empty_codebase

**Cause:** Target path contains no analysable source files

**Recovery:** Verify the path is correct. Check if submodules need initialisation.

### no_security_characteristics

**Cause:** No security-relevant patterns found in the codebase

**Recovery:** The codebase may be purely presentational or data-only. Report this finding and ask the user whether to proceed with a generic structural analysis instead.

### oversized_codebase

**Cause:** Codebase exceeds 200K LOC, making single-scope analysis impractical

**Recovery:** Split into multiple scopes by trust domain or module group. Each scope gets a focused prompt.
