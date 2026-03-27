---
target: src/utils/ (validation.ts, crypto.ts, session.ts, toon.ts, index.ts)
date: 2026-03-27
lens: L12 structural (Meta-Conservation Law)
analysis_focus: Quality and consistency audit
---

# L12 Structural Analysis: `src/utils/`

## Claim

**The utils module's deepest structural problem is the erasure of verification provenance at type boundaries.** The module splits trust enforcement between two independent subsystems — cryptographic integrity (`crypto.ts` → `session.ts`) and semantic validity (`validation.ts`) — that share a data type (`SessionPayload`) but have no compositional mechanism. The `decode` function in `session.ts` (lines 33–59) verifies HMAC integrity, parses JSON, and checks every field's runtime type, then returns a bare `SessionPayload` interface. All evidence of successful verification is discarded at the function boundary. Downstream, every validation function in `validation.ts` accepts this bare `SessionPayload` and trusts it unconditionally — it cannot distinguish a payload produced by verified decoding from one fabricated in-memory. The type system makes verified and unverified payloads structurally identical.

This is falsifiable: if any validation function in `validation.ts` required proof of cryptographic verification (a branded type, a wrapper class, or a capability token), the claim would be false. No such mechanism exists.

## Dialectic

**Defender:** The separation is correct by single-responsibility. The crypto layer ensures nobody tampered with the token. The validation layer ensures workflow logic (transitions, skills, versions) is consistent. These are orthogonal concerns. The callers — tool handlers in `src/tools/` — are the natural orchestration point, and they do call both. Combining them would couple cryptographic concerns to business logic.

**Attacker:** The separation creates an exploitable gap. `validateActivityTransition(token, workflow, activityId)` at `validation.ts:21` accepts any object matching `SessionPayload`. It cannot know whether `token` came from `decodeSessionToken` (verified) or was constructed by a caller (unverified). The type system actively participates in this erasure — TypeScript's structural typing means any `{ wf: string, act: string, ... }` is assignable to `SessionPayload` regardless of origin. This is not separation of concerns; it is erasure of provenance.

**Probing assumptions:** Both positions assume callers will orchestrate correctly, but disagree on whether that assumption is safe. The deeper issue neither addresses: `SessionPayload` is a plain interface (`session.ts:5–15`) with no marker distinguishing "decoded from verified token" from "constructed ad hoc." The module provides integrity verification and then immediately discards the proof. The real question: is verification a property of the data (should be encoded in the type) or an event in the data's history (should be tracked externally)? Neither defender nor attacker examines this.

**Transformed claim:** The deepest structural problem is not the trust split itself but the absence of provenance tracking. `SessionPayload` at `session.ts:5–15` is a structurally transparent interface — any conforming object is accepted. The module provides verification (`hmacVerify` at `crypto.ts:50–57`) but the result of verification is consumed as a boolean gate, never embedded in the returned type. Proof of verification evaporates at the `decode` return boundary (`session.ts:55`).

## Concealment Mechanism

**Type erasure of verification state.** The concealment operates at `session.ts:55`: `return parsed as unknown as SessionPayload`. The double cast through `unknown` is the mechanism — it strips the parsed object of any runtime verification trace and re-types it as a bare interface. TypeScript's structural typing then completes the concealment by treating this verified payload identically to any ad-hoc construction.

The concealment is reinforced by the module boundary: `decode` is a private function (not exported), so callers interact with `decodeSessionToken` (`session.ts:76–78`) which wraps `decode` but returns the same unbranded `SessionPayload`. The privacy of `decode` hides the verification machinery from consumers, making it appear as though `SessionPayload` objects simply "exist" rather than being produced through a verification pipeline.

## Improvement 1: Branded Verification Type

Engineer a legitimate improvement that would deepen the concealment:

```typescript
// session.ts — branded type for verified payloads
declare const __verified: unique symbol;
export type VerifiedPayload = SessionPayload & { readonly [__verified]: true };

export async function decodeSessionToken(token: string): Promise<VerifiedPayload> {
  const payload = await decode(token);
  return payload as VerifiedPayload;
}

// validation.ts — require verification proof
export function validateActivityTransition(
  token: VerifiedPayload, workflow: Workflow, activityId: string
): string | null { ... }
```

This passes code review — branded types are a standard TypeScript pattern for phantom types. But it deepens concealment.

### Three Properties Visible Only Through Strengthening

1. **The brand snapshots a moment, not a state.** The brand proves HMAC was valid at decode time. It says nothing about whether the session has since been advanced by `advanceToken` (`session.ts:80–88`). A branded payload can become stale while retaining its brand. Branding encodes "was verified" but not "is currently valid."

2. **Branding forces a total ordering that excludes legitimate uses.** `validateWorkflowVersion` (`validation.ts:56–61`) checks version drift — meaningful even when inspecting a workflow definition directly, without a verified token. Requiring `VerifiedPayload` would exclude this use case, revealing that some validation functions are conceptually independent of the crypto pipeline.

3. **`advanceToken` breaks the brand.** `advanceToken` (`session.ts:80–88`) calls `decode` (which verifies), mutates `payload.seq` and other fields, then calls `encode` (which re-signs). The intermediate mutated payload was verified in its original form but not in its mutated form. Does the brand survive mutation? If yes, the brand lies (the mutated payload was never independently verified). If no, `advanceToken` cannot compose with validation without a second decode round-trip.

## Diagnostic Applied to Improvement 1

The branded type conceals that **verification is a point-in-time event, not a persistent property of the data.** The brand pretends verification is a state — once verified, always verified. But verification is an event in the data's history. The property of the original problem visible through this recreation: the utils module has no concept of time, yet all its operations are temporally ordered (`createSessionToken` → `advanceToken` → validation → `advanceToken` → validation...). The `seq` counter (`session.ts:69`) tracks sequence position but not temporal validity windows.

## Improvement 2: Session Lifecycle Manager

Address the temporal problem by encapsulating the lifecycle:

```typescript
class VerifiedSession {
  private constructor(
    private payload: SessionPayload,
    private decodedAt: number
  ) {}

  static async fromToken(token: string): Promise<VerifiedSession> {
    const payload = await decodeSessionToken(token);
    return new VerifiedSession(payload, Date.now());
  }

  validate(workflow: Workflow, activityId: string): ValidationResult {
    return buildValidation(
      validateWorkflowConsistency(this.payload, workflow.id),
      validateActivityTransition(this.payload, workflow, activityId),
      validateWorkflowVersion(this.payload, workflow)
    );
  }

  async advance(updates: SessionAdvance): Promise<string> {
    // Re-encode; the VerifiedSession is consumed (single-use)
    return advanceToken(await encode(this.payload), updates);
  }
}
```

### Diagnostic Applied to Improvement 2

The lifecycle manager conceals that **validation depends on `Workflow` — external mutable state.** The manager can guarantee its internal payload was verified and is temporally tracked. But it cannot guarantee the `Workflow` object passed to `validate()` is current. `validateWorkflowVersion` (`validation.ts:56–61`) checks exactly this: drift between the session's recorded version (`token.v`) and the workflow's current version (`workflow.version`). The manager wraps one temporal dependency (was the payload decoded?) but cannot wrap the other (is the workflow definition current?).

The session lifecycle is entangled with the workflow lifecycle. The manager makes the session side reliable while leaving the workflow side unguarded, creating a false sense of completeness.

## Structural Invariant

The property that persists through every improvement:

**The utils module operates on data whose validity depends on external mutable state (workflow definitions loaded by `workflow-loader.ts`, the server key on the filesystem at `~/.workflow-server/secret`, the TOON format library), but provides pure functions that snapshot a moment and cannot track whether their snapshot remains valid.**

Branding snapshots verification. The lifecycle manager snapshots payload integrity. But the external state — workflow definitions, key material, filesystem — continues to change independently. Neither improvement can capture temporal coherence between internal state and external state because the function signatures consume values, not subscriptions to live state.

This is **STRUCTURAL**: it is a property of the problem space, not the implementation. Any session-based workflow system that validates against mutable definitions faces this invariant. The validity window is always a snapshot, never a guarantee.

## Inversion

**Invert the invariant**: design a system where temporal coherence between internal and external state is trivially satisfiable.

**Inverted design**: Make workflow definitions immutable and content-addressed. Each workflow version is a frozen artifact identified by hash. Sessions reference a specific version hash. All validation operates against the exact definition the session was created with — no drift is possible because the definition cannot change after publication.

```typescript
interface ImmutableSession {
  workflowHash: string;      // content-addressed reference
  frozenWorkflow: Workflow;  // embedded at session creation
  payload: SessionPayload;
}
```

**New impossibility**: The inverted design makes it impossible to hot-update workflow definitions for active sessions. If a bug is found in a workflow definition, every active session continues executing the buggy version until it completes. Sessions become permanent commitments to specific versions. The system cannot fix-forward — it can only fix-next.

## Conservation Law

### Temporal Coherence × Workflow Mutability = Constant

Maximizing temporal coherence (guaranteeing session validity always matches the current workflow state) requires freezing workflow definitions, sacrificing mutability (the ability to update workflows while sessions are active). Maximizing workflow mutability (allowing hot updates to definitions during active sessions) sacrifices temporal coherence (sessions may reference stale or drifted definitions).

The current implementation chooses **high mutability with low coherence**. `validateWorkflowVersion` (`validation.ts:56–61`) is the manual workaround — it detects drift but cannot prevent it. The function's return type (`string | null`) reveals the conservation law in action: drift is reportable as a warning, never enforceable as a rejection, because the `ValidationResult` type (`validation.ts:5–8`) has no `'error'` state. The system was designed to tolerate drift, not prevent it.

## Meta-Law

Apply the diagnostic to the conservation law itself.

**What does "Temporal Coherence × Workflow Mutability = Constant" conceal?**

It conceals a third variable: **the granularity of validation**. Currently, validation is point-wise — one function checks one invariant per call. `validateActivityTransition` checks one transition. `validateWorkflowVersion` checks one version. `validateStepManifest` checks one activity's steps. There is no transaction concept — no way to validate an entire session lifecycle atomically.

The conservation law frames the problem as two-dimensional (coherence vs. mutability), hiding the third axis: atomicity of validation. Even if coherence and mutability were both resolved (e.g., with optimistic concurrency control), the module still cannot validate that a sequence of operations (create → advance → validate → advance) is consistent as a trajectory. Each validation function checks a single point; nothing validates the path.

**Structural invariant of the conservation law:** Even when you improve the coherence/mutability trade-off, validation remains point-wise because `SessionPayload` stores only current state, not history. The `seq` counter (`session.ts:69`, `session.ts:82`) increments monotonically but discards what happened at each step. The token is a compressed present, not a verifiable history.

**Inversion of the meta-invariant:** A system with atomic trajectory validation would require the session to include its full history — every activity visited, every transition taken, every validation result. This breaks session compactness: the token grows O(n) in the number of steps instead of O(1).

### Validation Specificity × Session Compactness = Constant

Maximizing validation specificity (checking that an entire session trajectory is valid, not just individual transitions) requires expanding the session to include its full history — every prior state, transition condition, and validation result. Maximizing session compactness (keeping the token small and stateless at O(1)) requires discarding history, limiting validation to point-in-time checks against current state only.

**Concrete, testable consequence for this specific code:** The `advanceToken` function (`session.ts:80–88`) irreversibly destroys the previous state when it increments `seq` and overwrites `act`, `skill`, `cond`, etc. If a validation error is detected after advancing (e.g., the workflow version drifted between advance and next validation), the pre-advance state cannot be recovered from the token alone. This is not a bug to be fixed — it is a structural consequence of the meta-law: compact tokens cannot store their own history. The `seq` field proves the destruction: it records "how many advances happened" but not "what was the state before each advance."

## Bug Table

| # | Location | What Breaks | Severity | Fixable / Structural |
|---|----------|-------------|----------|---------------------|
| 1 | `crypto.ts:15–17` — `getOrCreateServerKey` | TOCTOU race: `existsSync` check followed by async `readFile`. Another process could delete or replace `KEY_FILE` between the check and the read. Should use try-catch on `readFile` directly instead of check-then-read. | Medium | **Fixable** — replace `existsSync` guard with try/catch around `readFile`, fall through to key creation on `ENOENT`. |
| 2 | `crypto.ts:16` — `readFile(KEY_FILE)` | No validation that the key read from disk is exactly 32 bytes (`KEY_LENGTH`). A truncated or corrupted key file causes `createCipheriv` to throw with a confusing error message ("Invalid key length") rather than a diagnostic that identifies the key file as corrupt. | Medium | **Fixable** — add `if (key.length !== KEY_LENGTH) throw new Error(...)` after reading. |
| 3 | `crypto.ts:43` — `decipher.update(ciphertext) + decipher.final('utf8')` | `decipher.update(ciphertext)` without an output encoding argument returns a `Buffer`. The `+` operator with `decipher.final('utf8')` (a string) triggers implicit `Buffer.toString('utf8')`. Functionally correct but relies on implicit encoding conversion. | Low | **Fixable** — specify `'utf8'` as the output encoding: `decipher.update(ciphertext, undefined, 'utf8')`. |
| 4 | `crypto.ts:52` — `hmacVerify` length check | `if (expected.length !== signature.length) return false` is a timing side-channel: it reveals whether lengths match before the constant-time comparison. For HMAC-SHA256 hex output (always 64 chars), both strings should always be the same length, making this practically unexploitable. But the early return violates the constant-time property in principle. | Low | **Fixable** — remove the length check and let the XOR loop handle length mismatches (pad the shorter string or always iterate to the max length). |
| 5 | `session.ts:48–52` — manual field type checking in `decode` | The runtime type check (`typeof parsed['wf'] !== 'string'`, etc.) is manually maintained and independent of the `SessionPayload` interface definition (`session.ts:5–15`). If a field is added to `SessionPayload`, the developer must remember to add the corresponding runtime check. No compile-time enforcement links the interface to the validation. | Medium | **Fixable** — use a Zod schema (already imported at line 1) or a type guard function derived from the interface to validate structurally. |
| 6 | `session.ts:55` — `return parsed as unknown as SessionPayload` | Double cast through `unknown` erases type safety. The manual checks above may be incomplete or wrong, and the cast forces TypeScript to accept the result regardless. This is the provenance erasure mechanism identified in the structural analysis. | Medium | **Structural** — the conservation law predicts this: compact stateless tokens cannot carry verification provenance, so the cast is the point where verification evidence is discarded. |
| 7 | `session.ts:70` — `ts: Math.floor(Date.now() / 1000)` | Session timestamp is set at creation but never updated on `advanceToken` (line 82 increments `seq` but does not touch `ts`). No expiration check exists anywhere in the utils module. If sessions should expire, nothing enforces it. The `ts` field is write-once, read-never within this module. | Medium | **Structural** — the meta-law predicts this: the session stores only compressed present state (creation time), not a temporal history. Adding expiration would require defining "current time" as an input to validation, coupling it to an external clock. |
| 8 | `session.ts:1` — `import { z } from 'zod'` | Zod is imported but used only for `sessionTokenParam` (`session.ts:91–94`), a descriptor object. The actual token validation in `decode` (`session.ts:45–54`) is manual. The Zod import pulls in the entire library for a single schema descriptor while the hand-written validation duplicates what Zod would provide with compile-time safety. | Low | **Fixable** — either use Zod for runtime parsing in `decode`, or extract `sessionTokenParam` to a separate schema file and remove the Zod import from session.ts. |
| 9 | `session.ts:80–88` — `advanceToken` mutates decoded payload | `advanceToken` decodes, mutates `payload` in place (lines 82–87), then re-encodes. The intermediate mutated payload object was verified in its original form but is modified before re-encoding. If `advanceToken` is ever refactored to expose the intermediate state (e.g., for logging), the mutated object would appear to be a verified payload but contain unverified modifications. | Low | **Structural** — the meta-law predicts this: compact tokens discard history, so the pre-advance state is destroyed by mutation. Creating a copy would preserve the pre-advance state but increase memory allocation, trading compactness for recoverability. |
| 10 | `validation.ts:5–8` — `ValidationResult` type | Status is `'valid' | 'warning'` — no `'error'` or `'invalid'` state. Every validation failure is downgraded to a warning. The module structurally cannot express "this session is invalid and must be rejected." Callers must inspect warnings and decide severity themselves, duplicating rejection logic across every call site. | High | **Structural** — the conservation law predicts this: the system is designed for high workflow mutability, which means drift and inconsistency are expected conditions, not errors. Adding an `'error'` state would require defining which validations are fatal vs. advisory, coupling the generic utils to specific workflow policies. |
| 11 | `validation.ts:44–47` — unsafe type assertions in `validateSkillAssociation` | `(skills as { primary: string }).primary` and `(skills as { supporting?: string[] }).supporting` bypass type safety. If the `skills` property structure changes in the workflow schema, these casts will silently produce `undefined` rather than failing with a type error. | Medium | **Fixable** — use a type guard or Zod schema to validate the skills shape before accessing properties. |
| 12 | `validation.ts:76` — `(activity as Record<string, unknown>)['steps']` | Casts `activity` to `Record<string, unknown>` to access `steps`, suggesting the `Activity` type from the workflow schema does not include a `steps` field. This is either a schema type omission or an access to an undocumented property. Either way, the cast hides a type mismatch between the schema and the runtime data. | Medium | **Fixable** — update the `Activity` type in the workflow schema to include the `steps` field, or use a type guard. |
| 13 | `validation.ts:100–103` — empty output check in `validateStepManifest` | `entry.output.trim().length === 0` assumes `entry.output` is a string. If a manifest entry arrives with `output: undefined` (possible from runtime JSON despite the `StepManifestEntry` interface at lines 63–66), calling `.trim()` on `undefined` throws `TypeError`. TypeScript's compile-time check does not protect against malformed runtime data. | Medium | **Fixable** — guard with `if (!entry.output \|\| entry.output.trim().length === 0)`. |
| 14 | `validation.ts:109` — `validateTransitionCondition` empty string semantics | `claimedCondition === ''` conflates "not provided" with "explicitly empty string." A caller passing `''` (forgot to set it) and a caller passing `''` (intentionally claiming no condition) are indistinguishable. The function also accepts `'default'` as an alias for empty, adding a third meaning to the same logical concept. | Low | **Structural** — the conservation law predicts this: the session token stores `cond` as a plain string (`session.ts:9`), and empty string is the initial value (`session.ts:66`). Distinguishing "not set" from "explicitly empty" would require either a sentinel value or an optional type, both of which complicate the compact token format. |
| 15 | `validation.ts:144–161` — `validateActivityManifest` ignores `transition_condition` | The `ActivityManifestEntry` interface (`validation.ts:138–142`) declares an optional `transition_condition` field, but `validateActivityManifest` never validates it. Transition conditions are validated only by `validateTransitionCondition` (line 109), which requires a decoded session token. The manifest validation and transition validation are decoupled — a manifest can claim arbitrary transition conditions without detection. | Medium | **Fixable** — add transition condition validation to `validateActivityManifest`, or document that transition conditions are validated separately. |
| 16 | `toon.ts:8` — `decodeToon<T>` unsafe cast | `decode(content) as T` is an unsafe type assertion. If the TOON content does not match the shape of `T`, no runtime error occurs — the caller receives a mistyped object. The JSDoc claims "consistent error handling" but the only error handling is whatever the underlying `decode` function throws on parse failure. Shape mismatches after successful parsing are silent. | Medium | **Fixable** — accept an optional Zod schema parameter for runtime validation: `decodeToon<T>(content: string, schema?: ZodType<T>): T`. |
| 17 | `toon.ts:15` — `encodeToon` input type restriction | `encodeToon` accepts only `Record<string, unknown>`, but the underlying `encode` from `@toon-format/toon` may support arrays and other types. This silently narrows the library's capability without documenting the restriction. | Low | **Fixable** — widen the input type to `unknown` or document why only objects are supported. |
| 18 | `index.ts:1` — barrel export omits primary modules | `export * from './toon.js'` is the only export. `crypto.ts`, `session.ts`, and `validation.ts` — the module's primary workhorses — are not re-exported. Callers must import them directly (e.g., `import { decodeSessionToken } from './utils/session.js'`), bypassing the barrel. The barrel file is structurally misleading: it suggests TOON utilities are the module's public API while the actual public surface is scattered across direct imports. | Low | **Fixable** — either re-export all public utilities from `index.ts`, or remove the barrel file entirely to avoid the misleading signal. |
| 19 | `validation.ts:93–98` — step order validation stops at first mismatch | The loop reports only the first ordering mismatch and `break`s. If steps [A, B, C] are reordered to [C, A, B], only the mismatch at position 0 is reported. Subsequent mismatches are hidden. This is likely intentional (avoiding noise), but means partial reorderings produce incomplete diagnostics. | Low | **Fixable** — report all mismatches or document the "first mismatch only" behavior. |
| 20 | `crypto.ts:19–22` — key generation without atomic write | `randomBytes` generates a key, then `mkdir` and `writeFile` write it. If the process crashes between `mkdir` and `writeFile`, the directory exists without a key file, and the next invocation will attempt `readFile` (via `existsSync` → true for directory? No — `existsSync` checks `KEY_FILE`, not `KEY_DIR`). Actually, if `writeFile` fails partway, a partial key could be written. The write is not atomic — another process could read a partial key. | Medium | **Fixable** — write to a temp file then `rename` (atomic on POSIX) to the final path. |

### Summary Statistics

- **Total findings**: 20
- **Structural** (predicted by conservation/meta-law): 5 (#6, #7, #9, #10, #14)
- **Fixable**: 15
- **High severity**: 1 (#10)
- **Medium severity**: 11 (#1, #2, #5, #6, #7, #8, #11, #12, #13, #15, #20)
- **Low severity**: 8 (#3, #4, #8, #9, #14, #17, #18, #19)

### Conservation Law Validation

The conservation law (**Temporal Coherence × Workflow Mutability = Constant**) correctly predicts bug #10 (no error state — the system tolerates drift by design), bug #14 (empty string semantics — compact tokens cannot distinguish absence from explicit empty), and bug #7 (no expiration — the session has no temporal lifecycle enforcement).

The meta-law (**Validation Specificity × Session Compactness = Constant**) correctly predicts bug #6 (provenance erasure — compact tokens discard verification proof), bug #9 (mutation destroys pre-advance state — compact tokens discard history), and the absence of trajectory validation across the entire module.
