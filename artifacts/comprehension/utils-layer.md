# Comprehension: Utils Layer

**Date:** 2026-04-26
**Coverage:** `src/utils/` (crypto.ts, session.ts, validation.ts, toon.ts, index.ts)

## Architecture

The utils layer provides foundational services consumed by every other module in the workflow server:

- **crypto.ts** — Server key management (AES-256-GCM encryption, HMAC-SHA256 signing). Key stored at `~/.workflow-server/secret`. Used by session.ts for token signing and by trace.ts for trace token signing.
- **session.ts** — Session token lifecycle (create, decode, advance, decodePayloadOnly, assertCheckpointsResolved). Tokens are base64url-encoded JSON payloads with HMAC signatures. `SessionPayload` carries workflow state (wf, act, skill, cond, version, sequence, timestamp, session ID, agent ID, blocking checkpoint, parent context).
- **validation.ts** — Workflow consistency checks: workflow/activity/skill associations, step manifests, activity manifests, transition conditions. Returns `ValidationResult` objects passed through `_meta` in API responses.
- **toon.ts** — Thin wrapper around `@toon-format/toon` encode/decode for TOON file format. `decodeToonRaw()` returns `unknown`; `decodeToon(content, schema)` validates against Zod.
- **index.ts** — Barrel export (re-exports toon, crypto, session, validation).

## Key Abstractions

- `SessionPayload` — Token payload with 13 fields (wf, act, skill, cond, v, seq, ts, sid, aid, bcp, psid, pwf, pact, pv)
- `SessionAdvance` — Updates applied by `advanceToken`: wf, act, skill, cond, aid, bcp (null to clear), psid, pwf (null to clear), pact (null to clear), pv (null to clear)
- `ParentContext` — `{ psid, pwf, pact, pv }` embedded in child tokens for trace correlation
- `ValidationResult` — `{ status: 'valid' | 'warning' | 'error', warnings: string[], errors?: string[] }`
- `StepManifestEntry` / `ActivityManifestEntry` — Structures for validating step/activity completion

## Dependency Graph

```
tool handlers → validation.ts → workflow-loader.ts
tool handlers → session.ts → crypto.ts
tool handlers → session.ts → assertCheckpointsResolved
trace.ts → crypto.ts
loaders (4 files) → toon.ts
```

## Consumer Analysis

- **validation.ts** consumers: `workflow-tools.ts` (7 call sites), `resource-tools.ts` (2 call sites)
- **session.ts** consumers: All tool modules via `decodeSessionToken`, `advanceToken`, `sessionTokenParam`, `assertCheckpointsResolved`, `decodePayloadOnly`
- **crypto.ts** consumers: `session.ts`, `trace.ts`
- **toon.ts** consumers: All loader modules, `state-tools` (if present)

## Session Token Lifecycle

### createSessionToken
```
workflowId, workflowVersion, agentId, parent?
→ payload: { wf, act: '', skill: '', cond: '', v, seq: 0, ts, sid: randomUUID(), aid }
→ if parent: add psid, pwf, pact, pv
→ encode(payload): JSON → base64url → HMAC-SHA256 signature
→ token: "<base64url>.<hex-signature>"
```

### decodeSessionToken
```
token string
→ split on last '.' → base64url payload + signature
→ HMAC verify signature against server key
→ base64url decode → JSON parse
→ SessionPayloadSchema.safeParse → throw if invalid
→ return SessionPayload
```

### decodePayloadOnly (Token Adoption)
```
token string
→ split on last '.' → base64url payload
→ base64url decode → JSON parse
→ SessionPayloadSchema.safeParse → return null if invalid
→ return SessionPayload WITHOUT HMAC verification
```

Used by `start_session` when HMAC verification fails (server restart) to attempt token adoption.

### advanceToken
```
token string, updates?, decoded?
→ decode token (or use provided decoded payload)
→ increment seq, update ts
→ apply updates: undefined fields are skipped, null fields clear optional payload fields
→ encode new payload
→ return new token string
```

### assertCheckpointsResolved
```
SessionPayload
→ if token.bcp is set: throw hard error
→ otherwise: return void
```

Called in nearly every tool handler except `present_checkpoint` and `respond_checkpoint`.

## Validation Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `validateWorkflowConsistency` | Check workflow mismatch | `string \| null` |
| `validateActivityTransition` | Check transition validity | `string \| null` |
| `validateSkillAssociation` | Check skill is declared by activity | `string \| null` |
| `validateWorkflowVersion` | Check version drift | `string \| null` |
| `validateStepManifest` | Check step completeness/order | `string[]` |
| `validateTransitionCondition` | Check condition matches transition | `string \| null` |
| `validateActivityManifest` | Check activity manifest validity | `string[]` |
| `buildValidation` | Aggregate warnings into ValidationResult | `ValidationResult` |
| `buildErrorValidation` | Aggregate warnings + error | `ValidationResult` |

## Crypto Functions

| Function | Purpose |
|----------|---------|
| `getOrCreateServerKey` | Load or generate 32-byte key at `~/.workflow-server/secret` |
| `encryptToken` | AES-256-GCM encrypt with random IV and auth tag |
| `decryptToken` | AES-256-GCM decrypt, verify auth tag |
| `hmacSign` | HMAC-SHA256 signature (hex string) |
| `hmacVerify` | Timing-safe HMAC verification |

## Open Questions

| # | Question | Status | Resolution | Section |
|---|----------|--------|------------|---------|
| 1 | Does any caller branch on ValidationResult.status? | Resolved | No. All callers pass it through to _meta. | Consumer Analysis |
| 2 | What types does @toon-format/toon encode accept? | Resolved | Any serializable value; `encodeToon` accepts `Record<string, unknown> | unknown[] | unknown` | Key Abstractions |
| 3 | Are there existing tests for utils modules? | Resolved | `session.test.ts` (22 tests), `validation.test.ts` (15 tests) | — |
| 4 | How does token adoption handle concurrent writes? | Resolved | `loadOrCreateKey` uses `O_CREAT | O_EXCL` with fallback to reading existing key | crypto.ts |
| 5 | What is the checkpoint gate semantics? | Resolved | `assertCheckpointsResolved` throws hard error if `bcp` is set | session.ts |

---
*This artifact is part of a persistent knowledge base.*
