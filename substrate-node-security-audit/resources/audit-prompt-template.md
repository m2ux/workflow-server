---
name: audit-prompt-template
description: The Substrate node security audit reference — the authoritative §1–§5 checklist taxonomy referenced throughout this workflow, holding the §1 Setup procedure and §4 Reporting Format in full. The methodology is target-agnostic; target-specific crate assignments, file paths, and calibration data live in target-profile. See audit-template-reference for a section index; the operative §2/§3/§5 bodies live in the techniques and resources named at each section below.
metadata:
  order: 9
  legacy_id: 9
---

# Substrate Node Security Audit - AI Agent Prompt Template

> **Purpose:** This template instructs an AI agent to perform a comprehensive security audit of a Substrate-based blockchain node codebase. It encodes vulnerability classes, static analysis strategies, and manual review patterns derived from professional audit methodology.
>
> **Applicability:** Any Rust/Substrate node with pallets, runtime, RPC layer, off-chain workers, external data source integrations, and client-side tooling.

---

## 1. Audit Setup

### 1.1 Scope Definition

Before beginning, the agent must establish:

| Variable | Description |
|----------|-------------|
| `{REPO}` | Repository path or URL |
| `{COMMIT}` | Target commit hash |
| `{IN_SCOPE}` | List of crate/module paths to audit (e.g., `node/`, `pallets/`, `runtime/`, `primitives/`) |
| `{OUT_OF_SCOPE}` | Exclusions (e.g., pallets under active rewrite, third-party deps, test harnesses) |
| `{OUTPUT_DIR}` | Directory for tool output and report artifacts |

### 1.2 Codebase Reconnaissance

Before detailed review, build a mental model of the system:

1. **Identify all crates** in the workspace (`Cargo.toml` workspace members). **Explicitly list every pallet and primitive crate found.** Do not summarize or group them (e.g., "all pallets"). The agent must acknowledge the existence of `pallets/cnight-observation`, `primitives/ics-observation`, etc., to prevent skipping them later.
2. **Map the architecture:** Which crates are runtime (on-chain/Wasm), which are native (node binary), which are shared primitives, which are off-chain tooling?
3. **Identify trust boundaries:** What data enters the system from external sources (RPC, inherent data, chain specs, config files, databases, file system)? What crosses the native/Wasm boundary?
   - **Rust safety boundary awareness:** Rust's borrow checker prevents data races and memory unsafety, but does NOT prevent: logical races (TOCTOU), deadlocks (same-thread re-lock), semantic errors (wrong value, truncation, silent drops), or API misuse (returning clones instead of references). Do not dismiss concurrency or correctness findings solely because "Rust prevents data races."
4. **Identify consensus-critical paths:** Block production, block verification, inherent data creation/validation, genesis initialization, state transitions
5. **Identify all pallet hooks:** `on_initialize`, `on_finalize`, `on_idle`, `offchain_worker` -- these execute every block and panics here halt the chain
6. **Map data flows using forward/backward tracing:**
   - **Forward tracing (entry → sink):** For each trust boundary entry point (RPC, inherent data, config), trace data forward through transformations, storage writes, and event emissions. Identify where untrusted data first touches consensus-critical state.
   - **Backward tracing (sensitive op → source):** For each sensitive operation (storage writes, weight calculations, key generation, error formatting), trace backward to the data source. If the source is external/untrusted and no validation intervenes, flag as a finding.
   - **Candidate point analysis:** Prioritize review at "candidate points" — locations where code complexity is highest: functions with multiple mutex acquisitions, nested `match` on external data, `unsafe` blocks, error-handling switch points, and codec deserialization sites.
7. **Identify `Send`/`Sync` boundary violations:** Rust's type system prevents data races via `Send`/`Sync` trait bounds. Search for `unsafe impl Send` or `unsafe impl Sync` — these override the compiler's safety analysis and must be manually verified for soundness.
8. **Enumerate critical functions (function registry):** For every crate identified as priority-1 or priority-2 in §5, build an explicit registry of functions that must be read during manual review. This registry is a prerequisite for §3.
   - **For each pallet:** List every hook (`on_initialize`, `on_finalize`, `on_idle`), every `ProvideInherent` method, every `#[pallet::call]` extrinsic, and every internal handler called from hooks or inherents. Read the pallet's `lib.rs` to extract the function list — do not rely on grep to discover them.
   - **For each crate with internal implementation modules:** Crate roots (`lib.rs`, `mod.rs`) often re-export types and delegate to submodules (`versions/`, `impl/`, `internal/`, `common/`). The actual logic lives in submodules. Trace from the public API (trait implementations, exported functions) to the implementation bodies and add those to the registry. **Reading only the crate root is insufficient and a common failure mode.**
   - **For each service/startup module:** List every function called during node initialization (`new_full`, `new_partial`, `run_node`, subcommand handlers). **Include offline subcommand paths** (`check-block`, `export-state`, `revert`, `import-blocks`) — see §3.5 for the recurring genesis divergence pattern.
   - **For each data source or follower crate:** Include the primary data-fetching functions (e.g., `get_utxos_up_to_capacity`, pagination/cursor logic, query builders). These crates sit at trust boundaries and historically contain the densest critical findings — see §3.2 pagination checks and §3.10.
   - **Prioritize reading the largest implementation files.** Sort all in-scope `.rs` files by line count and ensure the top 5-10 files are in the registry and read during manual review — see §5.14 for the coverage gate that enforces this.
   - During manual review (§3), track review status per function: `reviewed`, `skipped (reason)`, or `not-yet-reviewed`. Every function in the registry must reach `reviewed` or `skipped` by the end of the audit. Any function left as `not-yet-reviewed` is a gap.

### 1.3 Setup

```bash
cd {REPO}
git checkout {COMMIT}
cargo check --workspace 2>&1 | tail -20
cargo clippy --version
cargo audit --version   # install via: cargo install cargo-audit
cargo deny --version    # install via: cargo install cargo-deny
cargo geiger --version  # install via: cargo install cargo-geiger
```

### 1.4 Mandatory Ingestion Phase

The approach to code loading depends on the agent's architecture. Three models are supported, in order of preference:

**Model A: Multi-agent orchestration (preferred for agents with delegation capability)**
The orchestrator does NOT need to load the full codebase itself. Instead, it performs reconnaissance (§1.2), builds the file inventory and function registry, and delegates crate-level review to sub-agents. Each sub-agent loads and exhaustively reads all files in its assigned crate. See §5 Multi-Agent Execution Strategy for the full protocol. This model achieves comprehensive coverage without a single large context window.

**Model B: Large-context single agent (≥1M tokens)**
Agents with ≥1M token context windows MUST perform a distinct **Ingestion Step** before any analysis begins:

1.  **List Files:** Run `find {IN_SCOPE} -name "*.rs" -o -name "*.toml" -o -name "*.lock" -o -name "*.json" -o -name "*.sh" | grep -v "target\|test\|mock"` to list all relevant files.
2.  **Batch Read:** Call `read_file` on **EVERY** listed file. Do not rely on grep. Do not skip "boring" files.
3.  **Confirmation:** Output a summary: "Context Loaded: [Count] files, [Total Lines] lines."
4.  **Proceed:** Only after this confirmation may you proceed to Section 2.

With all code in context, the agent can reason about control flow directly, detect pattern-absence bugs without grep, trace data flows across module boundaries, and perform function registry enumeration from loaded code.

**Model C: Small-context single agent (<1M tokens, no delegation)**
These agents must rely on the function registry (§1.2 step 8), grep-led exploration (§2), and targeted file reads. Prioritize depth over breadth: load priority-1 and priority-2 components in full (typically ~25K lines / ~200K tokens) and accept tool-mediated reads for the remainder. All grep limitations (§2 preamble) and AI agent limitations (§5) apply with full force. The coverage gate (§5.14) is especially critical for these agents, as context pressure makes large-file avoidance most severe in this model.

---

## 2. Static Analysis Phase

The §2 static-analysis catalog — its grep patterns, `cargo audit`/`cargo deny`/`cargo geiger` procedures, and mechanical checks — is executed by the [search-pattern-catalog](../techniques/search-pattern-catalog.md) technique against the [static-analysis-patterns](./static-analysis-patterns.md) resource. The subsection headings below are the taxonomy the rest of the workflow cites; each entry's operative body lives in that resource.

> **Grep is a lead generator, not the analysis.** Grep finds pattern-*presence* bugs; the majority of real findings are pattern-*absence* bugs discoverable only by reading function bodies and reasoning about invariants (see §3).

### 2.1 Panic Path Detection
`unwrap`/`expect`/`panic!`/indexing sweep. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.2 Dependency Vulnerability Scan
`cargo audit`/`cargo deny`, with a manual crate-table fallback. Operative body: [static-analysis-patterns](./static-analysis-patterns.md).

### 2.3 Unsafe Code Detection
Quantify `unsafe` usage across the dependency tree. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.4 Cryptographic Weakness Search
Weak RNG/hashing/constant-time, run against all in-scope dirs. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.5 Type Safety and Arithmetic
Overflow, truncating/lossy casts. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.6 Feature Flag Divergence
Behaviour differences across feature gates. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.7 Unbounded Resource Consumption
Missing size/length caps, fan-out, silent truncation. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.7.1 Storage Lifecycle Pairing Scan
`insert` vs `remove`/`take` site pairing table. Operative body: [scan-storage-lifecycle](../techniques/scan-storage-lifecycle.md) and [static-analysis-patterns](./static-analysis-patterns.md#mechanical-checks).

### 2.8 External Connection Security
Connection-pool sharing, TLS, endpoint exposure. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.9 Information Leak Search
Secrets/sensitive data in logs and errors. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#grep-patterns).

### 2.10 Serialization Pre-Allocation Mismatch
`Vec::with_capacity` size-function mismatches. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#mechanical-checks).

### 2.11 Mock Data Source Toggle Detection
Env-controlled mock branches in data-source factories. Operative body: [static-analysis-patterns](./static-analysis-patterns.md#mechanical-checks).

---

## 3. Systematic Manual Review Strategies

The §3 manual-review checklist — its per-item PASS/FAIL decision criteria and the required analysis tables — is applied by the [apply-checklist](../techniques/apply-checklist.md) technique. The subsection headings below are the taxonomy the rest of the workflow cites; each entry's decision criteria live in that technique's protocol.

### 3.1 Pallet Hook and Weight Audit
`on_initialize`/`on_finalize` weight accounting via `weights.rs`. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.2 On-Chain State Lifecycle Audit
Insert/remove pairing; cursor/pagination monotonicity; orphan-on-error. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.3 Event Emission Integrity
Per-field event trace table + event-vs-storage struct diff. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.4 Consensus Path Symmetry
Proposer/verifier tuple symmetry; consensus-config invariant validation. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.5 Genesis Initialization Consistency
`StorageInit` construction-site enumeration; online vs offline divergence. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.6 Input Validation at Trust Boundaries
Consumption-layer validation; typed wrappers over raw bytes/strings (defense-in-depth). Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.7 Error Handling Integrity
Error-path state reversion; no silent swallowing. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.8 Concurrency and Shared State Safety
Shared pools/locks, contention, consumer isolation. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.9 Cryptographic Construction Review
Key handling, nonce reuse, signature/commitment schemes. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.10 External Data Source Integration
Cross-chain timestamp source AND freshness validation (DEFAULT-FAIL). Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.11 Cross-Crate Constant Consistency
Duplicated constants kept in sync across crates. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.12 Runtime Upgrade and Storage Migration Safety
`on_runtime_upgrade` migration correctness. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.13 Access Control and Origin Validation
Origin checks on privileged extrinsics/calls. Criteria: [apply-checklist](../techniques/apply-checklist.md).

### 3.14 System Transaction and Ledger Internal Function Review
System-txn application; wildcard `_ =>` match arms; empty-vs-absent query ambiguity. Criteria: [apply-checklist](../techniques/apply-checklist.md).

---

## 4. Reporting Format

### Finding Entry

```markdown
### Issue {ID}: {Title}

**Severity:** Critical | High | Medium | Low | Informational
**Category:** {Consensus | Panic/DoS | Cryptographic | State Consistency | Input Validation | Resource Exhaustion | Information Leak | Arithmetic/Type Safety | Configuration | Error Handling | Concurrency | Dependencies | Access Control | Runtime Upgrade | Unsafe Code}
**Affected Files:**
- `{file_path}#{line_number(s)}`

**Description:**
{What the code does, why it is problematic, what triggers it, what the impact is}

**Suggested Remediation:**
{Specific fix recommendation}
```

### Severity Scoring

For each finding, the agent MUST compute severity using both dimensions. Do not assign severity intuitively — use the rubric.

**IMPACT (I):**

| Score | Definition |
|-------|------------|
| 1 | No direct security impact — code quality, documentation, style |
| 2 | Affects local tooling or off-chain state only (wallets, CLI, deployers) |
| 3 | Affects node availability, correctness, or data integrity |
| 4 | Affects consensus integrity, enables fund loss, or halts the network |

**FEASIBILITY (F):**

| Score | Definition |
|-------|------------|
| 1 | Requires physical access, highly unlikely conditions, or multiple independent failures |
| 2 | Requires privileged access (root, validator key, config file control, operator action) |
| 3 | Requires only network access (RPC, p2p, public endpoint) |
| 4 | Occurs under normal operation, passive conditions, or routine network activity |

**Severity = map((I + F) / 2):**

| Average | Severity |
|---------|----------|
| 1.0–1.5 | Informational |
| 2.0–2.5 | Low |
| 3.0 | Medium |
| 3.5 | High |
| 4.0 | Critical |

Each finding entry MUST include the I and F scores with one-sentence justifications:

```
**Impact:** 4 — Consensus starvation blocks block production
**Feasibility:** 3 — Requires only RPC access, routinely available
**Severity:** High (avg 3.5)
```

**Calibration examples (from validated audit sessions):**
- Connection pool shared (5 conns, RPC + consensus): I=4, F=3 → **High** (not Medium — RPC access is routine). LA rated Critical; the pool serves both consensus and RPC paths.
- Mock data source toggled by environment variable: I=4, F=2 → **Medium** (not Critical — requires config file control). LA rated Low; the real-world deployment controls config files as infrastructure.
- `unwrap()` on parent header in inherent creation: I=3, F=4 → **High** (not Low — pruning/reorgs trigger without attacker)
- Feature-gated genesis digest divergence: I=4, F=2 → **Medium** (not Critical — requires heterogeneous builds)
- `unwrap()` on chain spec properties: I=3, F=2 → **Medium** (not Low — attacker who controls config file triggers it, but requires operator-level access)
- Fixed-seed RNG 0x42 in minting: I=4, F=3 → **High** (predictable nonces, no privileges needed to observe)
- MaxRegistrations unenforced: I=3, F=3 → **Medium** (not Low — attacker needs only Cardano transactions, no special privileges)
- Mapping event missing utxo_index: I=2, F=4 → **Medium** (not Low — occurs on every multi-output Cardano tx; affects indexer correctness)
- Incomplete dust address validation (length-only): I=3, F=3 → **Medium** (not Low — invalid Fr values from Cardano data)
- Wallet from_path missing role validation: I=2, F=2 → **Low** (requires incorrect API usage by developer)

**Severity calibration cross-check (mandatory before finalizing report):**

For each finding rated Critical or High, verify:
1. Is the affected code reachable from the production node binary? (not just toolkit/test code)
2. What is the minimum privilege level needed to trigger it? No privileges (network access) → F ≥ 3; Config file control → F = 2; Validator key / physical access → F = 1
3. Does the finding affect consensus or just availability? Consensus integrity / fund loss → I = 4; Node availability / data integrity → I = 3; Off-chain tooling only → I ≤ 2

If I + F < 6, the finding should not be Critical. If I + F < 5, the finding should not be High.

**Severity calibration:** Compare each finding against the [severity-rubric](./severity-rubric.md) calibration examples before finalizing. Use these as lookup references — if a finding resembles a calibration example, use the example's severity as a baseline.

---

## 5. Execution Strategy

The §5 execution model — phase order, multi-agent dispatch strategy, per-agent execution requirements (§5.1–§5.15), component priority order, and AI-agent limitation mitigations — is realized by the workflow's activity structure and its dispatch/verify techniques. The [execute-ensemble-pass](../techniques/execute-ensemble-pass.md) technique carries the second-pass blind-spot protocol. The subsection headings below are the taxonomy the rest of the workflow cites.

### Phase Order

1. **Reconnaissance** (§1.2): Map the architecture, identify trust boundaries and consensus paths.
2. **Static Analysis** (§2): Run all automated tools. Capture output as leads.
3. **Manual Review** (§3): Apply each strategy to every relevant component, highest-risk first (pallet hooks and inherent data providers, then observation/bridge pallets, then service/startup code, then tooling).
4. **Report** (§4): Consolidate findings with severity, evidence, and remediation.

### Multi-Agent Execution Strategy

The orchestrator performs reconnaissance and coordination; sub-agents perform deep, crate-level review. Group A/B/C/D dispatch, collection, verification, and merge are executed by [dispatch-sub-agents](../techniques/dispatch-sub-agents/TECHNIQUE.md), [verify-sub-agent-output](../techniques/verify-sub-agent-output.md), and [merge-findings](../techniques/merge-findings.md); the roster and file-coverage obligations live in [target-profile](./target-profile.md#agent-dispatch-assignments).

### Execution Model Requirements

The numbered items §5.1–§5.15 (mandatory ingestion, structured scratchpad iteration, trace-based prompts, function-level review, depth-first ordering, evidence-based PASS/FAIL, negative-evidence discipline, checklist instantiation, component iteration, grep pagination, severity calibration, mandatory finding elevation, grep scope enforcement, the >200-line coverage gate §5.14, and priority-1 invariant extraction) are enforced by the sub-agent activities and the [verify-sub-agent-output](../techniques/verify-sub-agent-output.md) coverage and completeness gates.

### Component Priority Order

Crate prioritisation (priority-1 consensus-critical through priority-4 utility) and the toolkit minimum-checklist floor live in [target-profile](./target-profile.md) and the [toolkit-checklist](./toolkit-checklist.md) resource.

### AI Agent Limitations and Mitigations

The structural biases (first-positive-signal bias, large-file avoidance, grep-triage-over-reading, breadth-over-depth) and their mitigations are enforced structurally: adversarial verification of PASS items ([decompose-safety-claims](../techniques/decompose-safety-claims.md)), the coverage gate, and the optional ensemble pass ([execute-ensemble-pass](../techniques/execute-ensemble-pass.md)).

### Tool Requirements

| Tool | Purpose | Installation |
|------|---------|-------------|
| `cargo clippy` | Lint and static analysis (panic paths, arithmetic, casts) | Included with rustup |
| `cargo audit` | Dependency vulnerability scan (RUSTSEC advisories) | `cargo install cargo-audit` |
| `cargo deny` | License compliance, advisory checks, duplicate deps | `cargo install cargo-deny` |
| `cargo geiger` | Unsafe code usage quantification across dependency tree | `cargo install cargo-geiger` |
| `cargo +nightly miri` | Undefined behavior detection in unsafe code | `rustup +nightly component add miri` |
| `grep` / `rg` | Pattern matching across codebase (lead generation only — see §2 preamble) | System utility / `cargo install ripgrep` |
| `cargo check` | Compilation and feature flag verification | Included with rustup |
| `cargo semver-checks` | API compatibility verification for runtime upgrades | `cargo install cargo-semver-checks` |
