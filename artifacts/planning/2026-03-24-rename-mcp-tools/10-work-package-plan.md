# Work Package Plan — HMAC Token Signing & Step Completion Manifest

**Created:** 2026-03-25
**Related:** [Step completion manifest design](09-step-completion-manifest.md)
**Issue:** #59 | **PR:** #60

---

## Overview

Two features that strengthen session integrity in the stateless workflow server:

1. **HMAC Token Signing** — cryptographically sign session tokens so agents cannot fabricate or tamper with them.
2. **Step Completion Manifest** — require agents to submit a structured summary of completed steps when transitioning between activities, validated server-side.

These are complementary: HMAC ensures the token's `act` field is trustworthy, which the manifest validator relies on to know which activity's steps to check.

---

## Tasks

### Task 1: HMAC Signing Helpers in `crypto.ts`

**File:** `src/utils/crypto.ts`
**Depends on:** nothing
**Estimate:** 15m agentic + 5m review

Add two functions using Node's `node:crypto` built-in:

| Function | Signature | Purpose |
|----------|-----------|---------|
| `hmacSign` | `(payload: string, key: Buffer) => string` | Compute HMAC-SHA256 of the payload, return hex digest |
| `hmacVerify` | `(payload: string, signature: string, key: Buffer) => boolean` | Recompute and compare using `timingSafeEqual` |

Implementation notes:
- Use `createHmac('sha256', key)` from `node:crypto` (already imported in the file).
- `timingSafeEqual` prevents timing attacks on signature comparison.
- The `key` parameter is the existing server key from `getOrCreateServerKey()`.

---

### Task 2: HMAC-Signed Token Encoding/Decoding in `session.ts`

**File:** `src/utils/session.ts`
**Depends on:** Task 1
**Estimate:** 20m agentic + 10m review

Modify the internal `encode` and `decode` functions:

**`encode` (signing):**
1. JSON-serialize the payload → base64url-encode → `payloadB64`.
2. Call `hmacSign(payloadB64, key)` → `sig`.
3. Return `payloadB64.sig` (dot-separated).

**`decode` (verification):**
1. Split token on `.` → `[payloadB64, sig]`.
2. If no signature segment, reject with `"Unsigned token"` error.
3. Call `hmacVerify(payloadB64, sig, key)` — reject if false with `"Token signature invalid"`.
4. Base64url-decode and JSON-parse as before.

**API changes:**
- `encode` and `decode` become `async` (they must call `getOrCreateServerKey()`).
- All public functions (`createSessionToken`, `decodeSessionToken`, `advanceToken`) become `async` and return `Promise<string>` / `Promise<SessionPayload>`.
- The key is fetched once per call via `getOrCreateServerKey()` (the function already caches on disk; a module-level lazy-init is acceptable but not required for v1).

**Token format change:**

| Before | After |
|--------|-------|
| `eyJ3ZiI6IndvcmstcGFja2FnZSIs...` | `eyJ3ZiI6IndvcmstcGFja2FnZSIs...` `.` `a1b2c3d4e5f6...` |

---

### Task 3: Propagate `async` to All Token Call Sites

**Files:** `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts`, `src/tools/state-tools.ts`
**Depends on:** Task 2
**Estimate:** 15m agentic + 5m review

Every call to `createSessionToken`, `decodeSessionToken`, and `advanceToken` must be `await`-ed. The tool handlers are already async, so this is a mechanical change — add `await` at each call site.

Affected locations (current count):
- `workflow-tools.ts`: 5× `decodeSessionToken`, 5× `advanceToken`
- `resource-tools.ts`: 1× `createSessionToken`, 4× `decodeSessionToken`, 5× `advanceToken`
- `state-tools.ts`: 2× `decodeSessionToken`, 2× `advanceToken`

---

### Task 4: Step Manifest Zod Schema

**File:** `src/utils/validation.ts` (or new `src/utils/manifest.ts` if validation.ts grows too large)
**Depends on:** nothing
**Estimate:** 10m agentic + 5m review

Define a Zod schema for the manifest parameter:

```typescript
const StepManifestEntrySchema = z.object({
  step_id: z.string().min(1),
  output: z.string().min(1, 'Step output must be non-empty'),
});

const StepManifestSchema = z.array(StepManifestEntrySchema).min(1);
```

Export a reusable Zod descriptor for use as a tool parameter:

```typescript
export const stepManifestParam = {
  step_manifest: z.array(StepManifestEntrySchema)
    .optional()
    .describe('Manifest of completed steps from the previous activity'),
};
```

---

### Task 5: Manifest Validation Function

**File:** `src/utils/validation.ts`
**Depends on:** Task 4
**Estimate:** 20m agentic + 10m review

Add `validateStepManifest`:

```typescript
export function validateStepManifest(
  manifest: StepManifestEntry[] | undefined,
  previousActivityId: string,
  workflow: Workflow,
): string | null
```

Logic:
1. If `previousActivityId` is empty (first activity), return `null` (no previous steps to validate).
2. Load the previous activity definition via `getActivity(workflow, previousActivityId)`.
3. Extract expected required steps: `activity.steps?.filter(s => s.required !== false).map(s => s.id)`.
4. If no manifest provided, return a warning: `"No step manifest provided for activity '{id}'. Submit a manifest to enable step completion validation."`.
5. If manifest provided, validate:
   - **Completeness:** every required step ID appears in the manifest.
   - **Order:** manifest step IDs appear in the same relative order as the activity definition.
   - **No extras:** no step IDs in the manifest that don't exist in the activity.
   - **Non-empty outputs:** already enforced by Zod schema, but double-check programmatically.
6. Return `null` if valid, or a descriptive warning string.

---

### Task 6: Wire Manifest Into Tool Handlers

**Files:** `src/tools/workflow-tools.ts`
**Depends on:** Task 3, Task 5
**Estimate:** 20m agentic + 10m review

Add `step_manifest` as an optional parameter to:
- `get_activity` — the agent is transitioning to a new activity, so it submits the manifest for the one it just completed.
- `validate_transition` — same transition context.

In each handler:
1. Accept `step_manifest` from the input params.
2. If `token.act` is non-empty (i.e., there's a previous activity), call `validateStepManifest(step_manifest, token.act, workflow)`.
3. Include the result in the `buildValidation(...)` call so it appears in `_meta.validation.warnings`.

**No changes** to `get_workflow`, `get_checkpoint`, `get_skill`, `list_resources`, `get_resource`, `discover_resources`, or `start_session` — those are not activity transitions.

---

### Task 7: Update Session Tests

**File:** `tests/session.test.ts`
**Depends on:** Task 2
**Estimate:** 20m agentic + 5m review

Adapt all existing tests to handle `async` returns. Add new HMAC-specific test cases (see test plan).

---

### Task 8: Manifest Validation Tests

**File:** `tests/validation.test.ts` (new) or extend `tests/session.test.ts`
**Depends on:** Task 5
**Estimate:** 20m agentic + 5m review

Test the `validateStepManifest` function in isolation with mock activity definitions. See test plan for specific cases.

---

### Task 9: Integration Tests (MCP Server)

**File:** `tests/mcp-server.test.ts`
**Depends on:** Task 6, Task 7, Task 8
**Estimate:** 20m agentic + 10m review

Add integration-level tests that exercise the full tool call path with signed tokens and manifests. See test plan.

---

### Task 10: Documentation Updates

**Files:** `README.md`, `docs/api-reference.md`, `docs/ide-setup.md`
**Depends on:** Task 6
**Estimate:** 15m agentic + 5m review

- Update the session protocol description to mention HMAC signing (token opacity is reinforced — agents should not attempt to decode).
- Document the `step_manifest` parameter on `get_activity` and `validate_transition`.
- Update any examples that show raw token format.

---

## Dependency Graph

```
Task 1 (HMAC helpers)
  └─► Task 2 (session.ts signing)
        └─► Task 3 (async propagation)
              └─► Task 6 (wire manifest into tools)
                    └─► Task 9 (integration tests)
                    └─► Task 10 (docs)

Task 4 (manifest schema)
  └─► Task 5 (manifest validation)
        └─► Task 6 (wire manifest into tools)

Task 2 ──► Task 7 (session tests)
Task 5 ──► Task 8 (manifest tests)
```

**Parallelizable pairs:** Tasks 1+4, Tasks 7+8, Tasks 9+10.

---

## Total Estimates

| Phase | Agentic Time | Human Review |
|-------|-------------|--------------|
| HMAC (Tasks 1–3, 7) | 70m | 25m |
| Manifest (Tasks 4–6, 8) | 70m | 30m |
| Integration + Docs (Tasks 9–10) | 35m | 15m |
| **Total** | **~3h** | **~1h** |

---

## Assumptions

1. **Key caching**: `getOrCreateServerKey()` reads from disk on each call. For v1 this is acceptable; a module-level cache can be added later if profiling shows overhead.
2. **Backward compatibility**: Unsigned tokens from existing sessions will be rejected after this change. This is intentional — a clean break, consistent with the PR's scope (rename + strengthen).
3. **Manifest is optional**: The `step_manifest` parameter defaults to `undefined`. When absent, a warning is returned but the call succeeds. This preserves backward compatibility for agents that haven't been updated.
4. **Conditional steps**: Steps with `required: false` or with a `condition` field are excluded from the required-steps list in manifest validation. Only unconditionally required steps are enforced.
5. **No activity file I/O in validation**: `getActivity(workflow, activityId)` already operates on the in-memory `Workflow` object (loaded by the tool handler), so manifest validation does not introduce new filesystem reads.
