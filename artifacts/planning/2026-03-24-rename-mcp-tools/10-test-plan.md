# Test Plan — HMAC Token Signing & Step Completion Manifest

**Created:** 2026-03-25
**Related:** [Implementation plan](10-work-package-plan.md)

---

## 1. HMAC Token Signing Tests

### 1.1 Unit Tests — `crypto.ts` HMAC Helpers

**File:** `tests/session.test.ts` (extend) or `tests/crypto.test.ts` (new)

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| C1 | `hmacSign` produces hex string | arbitrary payload + key | Returns 64-char hex string (SHA256 = 32 bytes) |
| C2 | `hmacSign` is deterministic | same payload + key called twice | Identical output |
| C3 | `hmacSign` differs for different payloads | two different payloads + same key | Different signatures |
| C4 | `hmacVerify` accepts valid signature | payload + correct sig + key | `true` |
| C5 | `hmacVerify` rejects wrong signature | payload + altered sig + key | `false` |
| C6 | `hmacVerify` rejects wrong key | payload + sig from key A, verified with key B | `false` |
| C7 | `hmacVerify` rejects empty signature | payload + empty string + key | `false` |

### 1.2 Unit Tests — `session.ts` Signed Tokens

**File:** `tests/session.test.ts`

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| S1 | `createSessionToken` returns dot-separated token | workflow ID + version | Token matches `<base64url>.<hex>` format |
| S2 | `decodeSessionToken` round-trips correctly | token from `createSessionToken` | Returns original payload fields |
| S3 | Tampered payload rejected | Modify base64 segment, keep signature | Throws `"Token signature invalid"` |
| S4 | Tampered signature rejected | Keep payload, modify hex segment | Throws `"Token signature invalid"` |
| S5 | Missing signature rejected | Strip `.signature` from valid token | Throws `"Unsigned token"` |
| S6 | Fabricated token rejected | Manually construct base64 payload without signing | Throws (unsigned or invalid signature) |
| S7 | `advanceToken` produces valid signed token | Advance a valid token | Resulting token decodes successfully |
| S8 | `advanceToken` increments seq through signing | Advance 3 times | `seq` is 3, signature valid |
| S9 | Token format does not contain raw JSON | Valid token | No `{`, `"`, or whitespace in token string |
| S10 | All functions are async | Call without await | Returns `Promise` |

### 1.3 Backward Compatibility

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| B1 | Old unsigned token is rejected | Pre-HMAC base64url-only token | Throws `"Unsigned token"` |

This is intentional — the HMAC change is a clean break per the implementation plan.

---

## 2. Step Completion Manifest Tests

### 2.1 Unit Tests — `validateStepManifest`

**File:** `tests/validation.test.ts` (new)

Test fixtures: mock `Workflow` objects with activities containing known step sequences.

**Activity fixture example:**
```
activity: "plan-prepare"
steps: [
  { id: "read-context", required: true },
  { id: "draft-plan", required: true },
  { id: "review-assumptions", required: true },
  { id: "optional-diagrams", required: false }
]
```

| # | Test Case | Manifest Input | Expected |
|---|-----------|---------------|----------|
| M1 | Complete valid manifest | All 3 required steps, correct order, non-empty outputs | `null` (valid) |
| M2 | Missing one required step | Only 2 of 3 required steps | Warning: missing step ID |
| M3 | Missing all required steps | Empty array `[]` | Warning: missing steps |
| M4 | Wrong step order | `["draft-plan", "read-context", "review-assumptions"]` | Warning: incorrect order |
| M5 | Unknown step ID | Includes `"nonexistent-step"` | Warning: unexpected step ID |
| M6 | Empty output string | One step has `output: ""` | Rejected by Zod schema (min length 1) |
| M7 | No manifest provided (undefined) | `undefined` | Warning: no manifest provided |
| M8 | No previous activity | `previousActivityId = ""` | `null` (skip validation) |
| M9 | Previous activity has no steps | Activity exists but `steps` is `undefined` | `null` (nothing to validate) |
| M10 | Optional steps excluded | Only required steps in manifest | `null` (valid — optional steps not required) |
| M11 | Optional steps included | All steps (required + optional) in manifest | `null` (valid — extras from the same activity are fine) |
| M12 | Duplicate step IDs | Same step ID appears twice | Warning: duplicate step |

### 2.2 Zod Schema Tests

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| Z1 | Valid manifest parses | Array of `{step_id, output}` | Parses successfully |
| Z2 | Missing `step_id` field | `[{output: "done"}]` | Zod validation error |
| Z3 | Missing `output` field | `[{step_id: "foo"}]` | Zod validation error |
| Z4 | Empty `step_id` | `[{step_id: "", output: "done"}]` | Zod validation error (min 1) |
| Z5 | Empty `output` | `[{step_id: "foo", output: ""}]` | Zod validation error (min 1) |
| Z6 | Extra fields ignored | `[{step_id: "foo", output: "ok", extra: true}]` | Parses successfully (Zod strips extras) |

---

## 3. Integration Tests

### 3.1 MCP Server Integration — HMAC

**File:** `tests/mcp-server.test.ts`

| # | Test Case | Action | Expected |
|---|-----------|--------|----------|
| I1 | Full session flow with signed tokens | `start_session` → `get_activity` → `get_activity` | Each response has valid signed token; all decode without error |
| I2 | Tampered token in tool call | Call `get_workflow` with altered token | Error response: signature invalid |
| I3 | Token from one server rejected by another | Generate token with key A, verify with key B (different `~/.workflow-server/secret`) | Error response |

### 3.2 MCP Server Integration — Step Manifest

| # | Test Case | Action | Expected |
|---|-----------|--------|----------|
| I4 | `get_activity` with valid manifest | Transition from activity A → B with complete manifest for A | `_meta.validation.status = "valid"` |
| I5 | `get_activity` without manifest | Transition from A → B, no `step_manifest` param | `_meta.validation.warnings` includes missing manifest warning |
| I6 | `get_activity` with incomplete manifest | Transition with manifest missing required steps | `_meta.validation.warnings` includes missing step warning |
| I7 | `validate_transition` with manifest | Call with valid manifest | Validation passes |
| I8 | First `get_activity` call (no previous) | `token.act = ""`, no manifest | No manifest warning (first activity) |

### 3.3 Combined Integration

| # | Test Case | Action | Expected |
|---|-----------|--------|----------|
| I9 | HMAC + manifest together | Full flow: start → get_activity(A) → complete steps → get_activity(B) with manifest | Signed token valid, manifest validated, no warnings |
| I10 | Tampered token prevents manifest bypass | Agent tampers token to change `act` field to skip validation | HMAC verification fails before manifest check |

---

## 4. Test Infrastructure Notes

- **Server key for tests:** Tests should use a deterministic test key (32 bytes of zeros or similar) rather than reading `~/.workflow-server/secret`. This can be achieved by mocking `getOrCreateServerKey()` or by adding an optional key parameter to the session functions.
- **Async test patterns:** All session token tests become async (`it('...', async () => { ... })`). Vitest handles this natively.
- **Mock workflows:** Tests in `validation.test.ts` should construct minimal `Workflow` objects with just enough structure to test manifest validation, rather than loading from disk.

---

## 5. Coverage Goals

| Area | Target | Metric |
|------|--------|--------|
| `hmacSign` / `hmacVerify` | 100% branch | All valid/invalid/edge cases |
| `encode` / `decode` (signed) | 100% branch | Format validation, tamper detection |
| `validateStepManifest` | 100% branch | All validation paths |
| Tool handler integration | Key paths | Happy path + tampered token + missing/invalid manifest |
