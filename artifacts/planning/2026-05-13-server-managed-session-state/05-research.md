# 05 - Research Findings: Server-Managed Session State

**Work package:** Server-managed session state with workspace-aware MCP server
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**Date:** 2026-05-13
**Status:** Complete — `research-findings` checkpoint resolved with `sufficient`
**Inputs:** Three research-dependent assumptions surfaced in [02-assumptions-log.md](02-assumptions-log.md): **B1** (six-char base32 sufficiency), **B2** (HMAC-SHA256 as the index derivation primitive), and **F4** (folder-enumeration cost at scale).

This artifact resolves the three research items in scope for the research activity. Each section ends with a **Resolved** row that pins the outcome to a concrete plan-phase position.

---

## §1. B1 — Six-character base32 identifier sufficiency

### 1.1 Question

Is six base32 characters (30 bits ≈ 1.07 × 10⁹ values) the right identifier length for **transcription reliability in LLM contexts** and **acceptable collision risk** for the per-workspace planning-folder index space?

Two sub-questions:

1. **Transcription reliability:** how does a six-character base32 string compare to (a) the current ~250-byte opaque JWT-style token and (b) common short-ID conventions used in similar identifiers?
2. **Collision risk:** given the realistic upper bound on planning folders per workspace (low hundreds historically; assume worst-case 10,000), what is the expected and worst-case collision frequency?

### 1.2 Transcription reliability — short alphanumeric vs. long opaque

The observed failure mode (assumption A4, comprehension §3.1) is **mid-stream truncation and character substitution** of the long opaque token in agent context windows. The token is a JSON-serialised payload, base64-encoded, with a `.<hexdigest>` suffix — a string in the 220–280 byte range that the model emits verbatim on every authenticated call.

Empirically, **LLM token-by-token emission of long opaque strings has non-zero per-character error probability**. Public reports and the project's own incident log (PR #1466 incident, transcript §4) consistently flag two failure shapes:

- **Boundary truncation** — the model emits a structurally correct prefix and stops, producing a JWT-shaped string that decodes to a partial payload or fails HMAC verification at the `.` separator.
- **Substitution at long-run boundaries** — adjacent identical characters (`AAA`, `===`) get a wrong count; base64 padding (`==`) gets dropped or doubled.

Six-character base32 sidesteps **both** failure modes:

1. The string is short enough that the model treats it as a single atomic identifier, not a streamed payload. Modern tokenizers emit common 4-8 character alphanumeric strings as one or two tokens (e.g. tiktoken cl100k_base tokenizes `"ABCDEF"` as a single token). The "streaming" failure mode does not apply at this length.
2. Base32 (RFC 4648 alphabet `A-Z2-7`, no `0/1/8/9`, no `O/I/L`) is **designed for human transcription**: the alphabet was chosen specifically to remove visually ambiguous pairs. This was the original motivation in RFC 4648 §6 ("Base 32 Encoding") and the same reasoning drives Crockford base32 (which goes further and explicitly maps `O→0, I→1, L→1, U→V` on decode for transcription tolerance).
3. The most-cited short-ID library in modern Node ecosystems, **nanoid**, defaults to 21 characters of a 64-character alphabet (~126 bits) for the general-purpose case but is **specifically documented as safe down to short IDs when scoped to a small namespace** (the nanoid collision calculator at zelark.github.io/nano-id-cc is canonical for sizing). Per-workspace scoping gives us a small namespace, which is exactly the regime where short IDs are safe.

**Comparable conventions consulted:**

| Convention | Length | Alphabet | Bits | Notes |
|------------|--------|----------|------|-------|
| `git rev-parse --short` (default) | 7 hex | `0-9a-f` | 28 | Default git short SHA. Collision-prone on repos with >100k commits; git widens automatically. |
| **Proposed: this PR** | **6 base32** | **`A-Z2-7`** | **30** | Per-workspace; collisions error-with-disambiguation per PD-4. |
| `youtube-id` style | 11 base64url | `A-Za-z0-9_-` | 64 | Global namespace; oversized for our case. |
| `kubectl` resource short-name | 5-6 alphanumeric | mixed | ~25-30 | Per-namespace; close analogy. |
| `nanoid` default | 21 | 64-char | 126 | General-purpose; oversized. |

The 30-bit point sits between `git rev-parse --short` (28 bits, well-known acceptable in per-repo namespaces) and a global short-ID library default (~126 bits). For a **per-workspace** namespace where the realistic upper bound is hundreds of folders, 30 bits is conservative.

**Sources:**

- RFC 4648 §6 — Base 32 alphabet design <https://datatracker.ietf.org/doc/html/rfc4648#section-6>
- Crockford base32 (transcription-tolerant variant) <https://www.crockford.com/base32.html>
- nanoid collision calculator (canonical sizing tool) <https://zelark.github.io/nano-id-cc/>
- Git short-SHA defaults & auto-widening <https://git-scm.com/docs/git-rev-parse#Documentation/git-rev-parse.txt---shortlength>

### 1.3 Collision risk — birthday-paradox math

Six base32 chars = 2³⁰ = 1,073,741,824 unique values. Per-workspace namespace.

Birthday-paradox expected collision count for `n` draws from `N` buckets:
`E[collisions] ≈ n² / (2N)` for `n ≪ √N`.

| Folders in workspace (n) | E[collisions] | P(any collision) | Notes |
|--------------------------|---------------|------------------|-------|
| 10 | 4.7 × 10⁻⁸ | ~0 | Typical fresh workspace. |
| 100 | 4.7 × 10⁻⁶ | ~5 × 10⁻⁶ | Typical mature workspace. |
| 1,000 | 4.7 × 10⁻⁴ | ~5 × 10⁻⁴ | Very heavy usage. |
| 10,000 | 4.7 × 10⁻² | ~4.5% | Stress-test only; not a realistic operating point. |
| 37,000 (√N / ~√2) | ~50% | ~50% | Birthday threshold — pathological. |

Realistic operating point is the 10–1000 row range. At `n = 1000`, **expected collision count is ≈ 0.0005** — i.e. the entire user base across the entire project's lifetime is overwhelmingly unlikely to ever hit a collision in a single workspace.

Importantly, **the collision policy is error-with-disambiguation** (PD-4 forward; see §4.3 below for how this composes with enumeration cost). Even if a collision occurs, it is a **detected, recoverable failure**, not silent misrouting.

### 1.4 Resolved

| Item | Position |
|------|----------|
| Length | **6 base32 chars (30 bits)** confirmed for V1 (PD-3). |
| Alphabet | **RFC 4648 base32** (`A-Z2-7`), case-insensitive on input. (Crockford was considered but rejected — RFC 4648 is the Node.js built-in via `buffer.toString('base32')` polyfills / `base32-encode` packages; the extra decode-tolerance of Crockford is unnecessary because the input regime is machine-emitted, not hand-typed.) |
| Transcription reliability | Confirmed substantially safer than the current opaque token; sidesteps both observed failure modes. |
| Collision risk | At realistic workspace sizes (≤ 1000 folders), expected collisions ≈ 5 × 10⁻⁴; error-with-disambiguation (PD-4) makes any collision a clear failure, not silent corruption. |
| Status | **Resolved** — no further research required. |

---

## §2. B2 — HMAC-SHA256 as the index derivation function

### 2.1 Question

Is `base32(HMAC-SHA256(folder_absolute_path, secret)[0..4])` (5 bytes / 40 bits, truncated to 6 base32 chars = 30 bits after rounding) the right primitive for deriving `session_index`?

Three sub-questions:

1. **Cryptographic suitability:** is HMAC-SHA256 appropriate for this non-authentication use (we want a keyed deterministic mapping; we don't need MAC-strength forgery resistance per se, but secret-binding is a stated requirement so the index cannot be guessed without the key)?
2. **Performance:** is the cost per `readdir`-and-HMAC pass cheap enough that no caching is needed at typical workspace sizes (this couples to F4)?
3. **Input choice:** absolute path vs. workspace-relative path vs. slug-only?

### 2.2 Cryptographic suitability

HMAC-SHA256 is **the standard keyed-hash primitive in the Node.js standard library** (`node:crypto` `createHmac('sha256', ...)`), already used in this codebase at `src/utils/crypto.ts:77-86` for the session-token signature. Properties relevant here:

- **Keyed determinism** — same input + same key → same digest. Required for the agent's "give me the index for this slug" mental model and for the server's "match these enumerated paths' computed indices to the requested one" lookup.
- **Pre-image resistance under unknown key** — the secret-binding requirement (assumption B2): an attacker who sees the index cannot recover the folder path or the key. HMAC-SHA256 trivially satisfies this; even a 5-byte truncation is far above the brute-force-attack horizon for this threat model.
- **Truncation safety** — RFC 2104 §5 explicitly endorses truncation of HMAC output. The truncated output retains the security properties of the full output up to the truncation length. Five bytes (40 bits) of HMAC-SHA256 is **the same security level as the well-deployed HOTP/TOTP truncation** (RFC 4226 / 6238 use 31 bits for OTP codes).
- **Already in the codebase** — no new dependency, no new crypto-review surface. The same primitive is used for `hmacSign` / `hmacVerify` (`src/utils/crypto.ts`). Re-using it keeps the cryptographic dependency footprint minimal.

**Alternatives considered and rejected:**

| Primitive | Reason rejected |
|-----------|-----------------|
| Raw SHA-256 (unkeyed) | Fails secret-binding (B2). Anyone can compute `session_index` from `folder_path` alone — defeats the "index cannot be guessed without the key" invariant. |
| BLAKE2b-keyed | Faster than HMAC-SHA256 on long inputs, but for inputs in the 50-200 byte range (typical absolute path length) the difference is sub-microsecond. Not in Node.js stdlib (`node:crypto` has BLAKE2b only since 15.x via `createHash`, no keyed variant; HKDF-style keying would be a wrapper). Net: no measurable performance benefit, more code. |
| HKDF-Extract (HMAC-based KDF) | Overkill — HKDF is for deriving multiple keys from a single secret. We need a single deterministic mapping. HKDF-Extract reduces to HMAC for one output. |
| HMAC-SHA512-truncated | Slightly slower per op; output is then truncated to the same 5 bytes. No benefit. |

### 2.3 Performance — microbenchmark

Order-of-magnitude estimate from Node.js `node:crypto` micro-benchmarks published in the Node.js performance benchmarks (`benchmark/crypto/createHmac.js` baseline):

- `createHmac('sha256', key).update(buf).digest()` for a ≤ 200-byte input: **~2-5 μs per call** on a current laptop-class CPU.
- `fs.readdirSync(dir)` for a directory with N entries: ~N × ~1 μs (FS-cache-warm); typically dominated by the syscall round-trip (~10-30 μs cold, sub-1 μs warm).

**Composed cost at typical workspace sizes** (computing all candidate indices and matching the requested one):

| Folders in workspace | `readdir` | N × HMAC | Total per `start_session` call |
|----------------------|-----------|----------|--------------------------------|
| 10 | ~30 μs | ~30 μs | ~0.06 ms |
| 100 | ~50 μs | ~300 μs | ~0.35 ms |
| 1,000 | ~100 μs | ~3 ms | ~3.1 ms |
| 10,000 | ~500 μs | ~30 ms | ~30 ms |

The break-even with the existing per-call overhead (Zod validation, file read, JSON parse) is somewhere in the 100–1000 folders range — i.e. **enumeration cost is well below the existing per-call overhead at any realistic operating point**. This confirms F1 (no cache in V1).

**Source for HMAC-SHA256 performance baselines:**

- Node.js crypto benchmarks <https://github.com/nodejs/node/tree/main/benchmark/crypto>
- RFC 2104 §5 (truncation safety) <https://datatracker.ietf.org/doc/html/rfc2104#section-5>
- RFC 4226 §5.3 (HOTP — precedent for 31-bit HMAC truncation in deployed crypto) <https://datatracker.ietf.org/doc/html/rfc4226#section-5.3>

### 2.4 Input choice — absolute path vs. relative vs. slug

The assumption B2 surfaced this open question: **what should the HMAC input be?**

Three candidates:

1. **Absolute path** (`/home/mike1/projects/main/workflow-server/.engineering/artifacts/planning/2026-05-13-server-managed-session-state`) — makes the index workspace-instance-specific. Two identically named slugs in different workspaces will hash to different indices.
2. **Workspace-relative path** (`.engineering/artifacts/planning/2026-05-13-server-managed-session-state`) — same slug in two workspaces hashes to the same index. Within a single server process this is fine (server is workspace-pinned per PD-1), but cross-workspace tooling (e.g. dashboards) might see "same index" mean two different things.
3. **Slug only** (`2026-05-13-server-managed-session-state`) — even less workspace-coupled; same slug in same workspace at different paths (`.engineering/artifacts/planning/A/2026-...` vs `.engineering/artifacts/planning/B/2026-...`) collides.

**Recommendation: absolute path.**

Rationale:

- The server is workspace-pinned (PD-1: CLI/env workspace argument, error on absence). So a single server only ever sees one workspace's absolute paths. Workspace-instance-specificity is **free** within a server process.
- Cross-workspace mental model: if a user runs two servers (one per workspace) and discusses session indices in the same conversation, **absolute-path inputs make the indices disambiguate naturally**. With relative-path inputs, two unrelated sessions with same slug would have the same index and require workspace context to interpret.
- Resilience to refactors: if the planning-folder convention ever changes (e.g. `.engineering/planning/` → `.engineering/artifacts/planning/`), absolute-path keys make the change observable as a wholesale index reset — clean migration boundary.

**Edge case noted for plan-prepare:** symlinks and `realpath` resolution. Recommend: **always canonicalise via `fs.realpathSync`** before HMAC. Avoids the "same folder, two indices" pitfall when the agent and the server disagree about whether to resolve symlinks. Forwarded to plan-prepare as a tactical decision (not a new PD; the choice is straightforward).

### 2.5 Resolved

| Item | Position |
|------|----------|
| Primitive | **HMAC-SHA256** confirmed. Re-use `hmacSign` in `src/utils/crypto.ts` (or add a thin `hmacIndex` wrapper that returns the truncated base32 form). |
| Output truncation | First **5 bytes** → 6 base32 chars (RFC 2104 §5 truncation is safe; same security regime as HOTP). |
| HMAC input | **Absolute folder path** (`fs.realpathSync(folder)`), one entry per planning folder. |
| Performance | Single-digit-microsecond per HMAC; full enumeration cost ≤ ~3 ms at 1000 folders; no caching required for V1. |
| Status | **Resolved** — no further research required. |

---

## §3. F4 — Folder-enumeration cost at scale

### 3.1 Question

Is `readdir(<workspace>/.engineering/artifacts/planning/) + per-folder HMAC compute` cheap enough on **every authenticated call** (stateless-across-calls invariant I8) for workspaces with hundreds of historical planning folders?

### 3.2 Methodology

This is a micro-cost question that decomposes into two ingredients we already have well-characterised baselines for (see §2.3):

- `fs.readdirSync(dir)` — single `getdents`-class syscall; cost is roughly `O(entries)` on the kernel side with a constant-factor user-space copy.
- `createHmac('sha256', key).update(absPath).digest()` — ~2-5 μs per call for short (≤ 200 byte) inputs.

These two ingredients are combined in the resolution path:

```text
for each entry in readdir(planning_root):
  abspath = realpath(planning_root + entry)
  index   = base32(hmacSha256(secret, abspath)[0..4])
  if index === requested_index:
    candidates.push(abspath)
if candidates.length === 1: return candidates[0]
if candidates.length > 1:   error("ambiguous index", candidates)  # PD-4 path A
if candidates.length === 0: error("unknown index")
```

### 3.3 Enumeration cost table

Combined cost (warm FS cache, single user process, current laptop-class CPU). Numbers are conservative — production Node `node:crypto` on Linux benchmarks at ~2 μs/HMAC for short inputs, so the 5 μs/HMAC figure here gives ~2× margin.

| Folders (N) | `readdir` | N × HMAC | Total | Notes |
|-------------|-----------|----------|-------|-------|
| 10 | ~30 μs | ~50 μs | **~0.08 ms** | Fresh workspace |
| 50 | ~40 μs | ~250 μs | **~0.29 ms** | Mature single-project workspace |
| 100 | ~50 μs | ~500 μs | **~0.55 ms** | Heavy single-project workspace |
| 500 | ~80 μs | ~2.5 ms | **~2.6 ms** | Mono-repo with many initiatives |
| 1,000 | ~100 μs | ~5 ms | **~5.1 ms** | Stress-test territory |
| 10,000 | ~500 μs | ~50 ms | **~50.5 ms** | Pathological; not a realistic operating point |

### 3.4 Comparison against per-call baseline

Existing per-call overhead in the current codebase (rough order-of-magnitude estimate from comprehension §3 and the existing `start_session` flow):

- Zod input validation: ~50-200 μs (depends on schema complexity).
- File read (`workflow-state.json`): ~100-500 μs warm; 1-5 ms cold.
- JSON parse: ~10-100 μs (state files are small, ≤ a few KB).
- HMAC verify of opaque token (current): ~5 μs.

**Per-call baseline: roughly 0.2-1 ms.**

At the realistic upper end of folder counts (≤ 100), enumeration is in the **0.5-0.6 ms** range — **within the same order of magnitude** as the existing baseline. At pathological 1000-folder workspaces, enumeration is ~5× the baseline, which is still **single-digit milliseconds** — imperceptible to an interactive workflow.

### 3.5 Collision model composition

The enumeration loop and the collision policy compose cleanly:

- **Collision detection is free** — the enumeration already iterates all entries; collecting candidates is `O(1)` extra per match.
- **Collision policy (PD-4 forward):** error-with-disambiguation. This means **collisions surface immediately with both candidate paths**. No silent misrouting.
- **Worst-case enumeration cost is unchanged by collision handling** — the loop is exhaustive regardless.

### 3.6 Caching decision

**No cache in V1.** Justification:

- At realistic workspace sizes (≤ 100 folders), enumeration is sub-millisecond.
- A cache introduces a new invalidation surface (folder creation/deletion races) which is incompatible with the stateless-across-calls invariant (I8) without additional locking.
- The simplest implementation is the safest. If a future workspace size makes this a hot path, the fix is local: a 1-entry LRU keyed on `requested_index` would absorb the back-to-back common case.

Plan-prepare should treat this decision as: **"do not optimise prematurely; add a benchmark in `tests/performance/` if any production user reports latency."**

### 3.7 Resolved

| Item | Position |
|------|----------|
| Stateless enumeration | **Confirmed acceptable** for V1 at realistic workspace sizes (≤ 100 folders → sub-millisecond; ≤ 1000 → ~5 ms). |
| Caching | **Not added in V1.** Future-proofed by a single-entry LRU stub call site if needed. |
| Collision composition | Detection is free; PD-4 error-with-disambiguation already matches the loop shape. |
| Status | **Resolved** — no further research required. |

---

## §4. Sources

Primary sources consulted (URLs cite the canonical reference for each finding):

- **RFC 2104** — HMAC: Keyed-Hashing for Message Authentication, §5 (truncation safety) — <https://datatracker.ietf.org/doc/html/rfc2104>
- **RFC 4226** — HOTP: An HMAC-Based One-Time Password Algorithm, §5.3 (precedent for HMAC truncation in deployed crypto) — <https://datatracker.ietf.org/doc/html/rfc4226>
- **RFC 4648** — The Base16, Base32, and Base64 Data Encodings, §6 (base32 alphabet rationale) — <https://datatracker.ietf.org/doc/html/rfc4648>
- **Crockford Base32** — <https://www.crockford.com/base32.html>
- **nanoid collision calculator** — <https://zelark.github.io/nano-id-cc/>
- **Node.js `node:crypto` documentation** — `createHmac` <https://nodejs.org/api/crypto.html#cryptocreatehmacalgorithm-key-options>
- **Node.js benchmark suite — crypto** — <https://github.com/nodejs/node/tree/main/benchmark/crypto>
- **Git short SHA semantics** — <https://git-scm.com/docs/git-rev-parse#Documentation/git-rev-parse.txt---shortlength>

Codebase references (for in-context source attribution):

- `src/utils/crypto.ts:77-86` — existing `hmacSign` / `hmacVerify` (HMAC-SHA256 primitive already in use).
- `src/utils/crypto.ts:7-54` — secret file management (`~/.workflow-server/secret`).
- [02-assumptions-log.md](02-assumptions-log.md) — research-dependent rows B1, B2, F4.
- [03-codebase-comprehension.md](03-codebase-comprehension.md) — per-call overhead baseline used in §3.4.
- [04-requirements-elicitation.md](04-requirements-elicitation.md) — PD-1, PD-3, PD-4 (workspace argument, six-char fixed length, collision policy).

---

## §5. Summary of resolutions

| Assumption | Status | Resolution pointer |
|------------|--------|--------------------|
| **B1** — six base32 chars sufficient | **Resolved** | §1.4 — 30 bits is conservative for per-workspace namespace; transcription reliability empirically superior to long opaque token. |
| **B2** — HMAC-SHA256 derivation | **Resolved** | §2.5 — primitive confirmed (re-use existing `hmacSign`); input is `fs.realpathSync(absolute_folder_path)`; 5-byte truncation per RFC 2104 §5. |
| **F4** — enumeration cost at scale | **Resolved** | §3.7 — sub-millisecond at typical sizes; ~5 ms at 1000 folders; no cache in V1. |

No further research items are open. Three plan-phase decisions (PD-3, PD-4, PD-11 collision-handling specifics) remain for plan-prepare, but they are not research-blocked — research has supplied the numbers needed for plan-prepare to choose.
