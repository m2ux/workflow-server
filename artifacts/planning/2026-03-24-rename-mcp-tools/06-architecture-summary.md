# Architecture Summary — New Modules in PR #60

**Date:** 2026-03-25

---

## Module Dependency Graph

```
                    ┌──────────────────────┐
                    │   Tool Handlers      │
                    │  (workflow-tools.ts,  │
                    │   resource-tools.ts,  │
                    │   state-tools.ts)     │
                    └──────┬──────┬────────┘
                           │      │
              ┌────────────┘      └────────────┐
              ▼                                 ▼
    ┌──────────────────┐              ┌──────────────────┐
    │   session.ts     │              │  validation.ts   │
    │  Token lifecycle │              │  Stateless       │
    │  (create/decode/ │              │  validators      │
    │   advance)       │              │                  │
    └────────┬─────────┘              └────────┬─────────┘
             │                                 │
             ▼                                 ▼
    ┌──────────────────┐              ┌──────────────────┐
    │   crypto.ts      │              │ workflow-loader   │
    │  HMAC + AES-GCM  │              │ (existing)       │
    │  + key mgmt      │              │                  │
    └──────────────────┘              └──────────────────┘
```

---

## Module Summaries

### `src/utils/crypto.ts` (58 lines)

Bottom-layer cryptographic primitives. No internal dependencies beyond Node.js `crypto` and `fs`.

| Export | Purpose |
|--------|---------|
| `getOrCreateServerKey()` | Read or generate 256-bit key at `~/.workflow-server/secret` |
| `encryptToken(token, key)` | AES-256-GCM encryption → `iv:authTag:ciphertext` hex string |
| `decryptToken(encrypted, key)` | Reverse of encryptToken |
| `hmacSign(payload, key)` | HMAC-SHA256 → hex digest |
| `hmacVerify(payload, sig, key)` | Constant-time HMAC verification |

**Used by:** `session.ts` (HMAC operations), `state-tools.ts` (AES-GCM encryption at rest)

### `src/utils/session.ts` (82 lines)

Middle-layer session token lifecycle. Depends on `crypto.ts` for signing.

| Export | Purpose |
|--------|---------|
| `createSessionToken(wfId, version)` | Creates initial token with wf/v/seq=0/ts |
| `decodeSessionToken(token)` | HMAC-verifies and decodes → `SessionPayload` |
| `advanceToken(token, updates?)` | Increments seq, optionally updates wf/act/skill |
| `sessionTokenParam` | Zod schema fragment for tool parameter spreading |

**Token format:** `{base64url_json_payload}.{hmac_sha256_hex}`

**SessionPayload fields:**
- `wf` — workflow ID
- `act` — current activity ID
- `skill` — last loaded skill ID
- `v` — workflow version at session start
- `seq` — monotonic call counter
- `ts` — session creation epoch (seconds)

### `src/utils/validation.ts` (118 lines)

Top-layer stateless validation functions. Depends on `workflow-loader` types (`Workflow`, `getActivity`, `getValidTransitions`).

| Export | Purpose |
|--------|---------|
| `validateWorkflowConsistency(token, wfId)` | Token's wf matches explicit wf param |
| `validateActivityTransition(token, wf, actId)` | Activity is a valid transition from token's act |
| `validateSkillAssociation(wf, actId, skillId)` | Skill is declared by the activity |
| `validateWorkflowVersion(token, wf)` | Workflow version hasn't drifted since session start |
| `validateStepManifest(manifest, wf, actId)` | Steps present, ordered, non-empty outputs |
| `buildValidation(...warnings)` | Aggregates nullable warnings into `ValidationResult` |

**Design principle:** All validators return `string | null` (warning message or null). `buildValidation` collects them into `{ status: 'valid' | 'warning', warnings: string[] }`. Warnings never block tool execution.

---

## Integration Points

### Tool Handler Pattern

Every token-bearing tool follows this sequence:

```typescript
const token = await decodeSessionToken(session_token);   // HMAC check
// ... business logic ...
const validation = buildValidation(
  validateWorkflowConsistency(token, workflow_id),
  // ... additional validators as appropriate ...
);
return {
  content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  _meta: {
    session_token: await advanceToken(session_token, { wf, act, skill }),
    validation,
  },
};
```

### State Persistence

`state-tools.ts` integrates crypto.ts directly (not through session.ts) for at-rest token protection:

- **Save:** If `state.variables['session_token']` exists, encrypt it with AES-256-GCM before writing to disk
- **Restore:** If `_session_token_encrypted` flag is set, decrypt the token before returning to the caller

This ensures session tokens are never stored in plaintext on the filesystem.

### Token-Exempt Tools

Four tools do not require a session token:
- `help` — bootstrap entry point
- `list_workflows` — discovery (pre-session)
- `start_session` — creates the initial token
- `health_check` — operational probe

---

## Design Characteristics

| Characteristic | Decision |
|----------------|----------|
| Token role | Validation aid, not authorization gate |
| Validation behavior | Warnings only, never blocking |
| Token storage | HMAC-signed (integrity), AES-encrypted at rest |
| Key scope | Per-server instance (filesystem-based) |
| State tracking | Monotonic seq counter, last-accessed wf/act/skill |
| Expiry | Timestamp recorded, no TTL enforced |
