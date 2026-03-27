# Comprehension: Utils Layer

**Date:** 2026-03-27
**Work Package:** WP-08 Utils Hardening
**Coverage:** `src/utils/` (crypto.ts, session.ts, validation.ts, toon.ts, index.ts)

## Architecture

The utils layer provides foundational services consumed by every other module in the workflow server:

- **crypto.ts** — Server key management (AES-256-GCM encryption, HMAC-SHA256 signing). Key stored at `~/.workflow-server/secret`. Used by session.ts for token signing.
- **session.ts** — Session token lifecycle (create, decode, advance). Tokens are base64url-encoded JSON payloads with HMAC signatures. SessionPayload carries workflow state (wf, act, skill, cond, version, sequence, timestamp, session ID, agent ID).
- **validation.ts** — Workflow consistency checks: workflow/activity/skill associations, step manifests, transition conditions, activity manifests. Returns `ValidationResult` objects passed through `_meta` in API responses.
- **toon.ts** — Thin wrapper around `@toon-format/toon` encode/decode for TOON file format.
- **index.ts** — Barrel export (currently only re-exports toon.ts).

## Key Abstractions

- `SessionPayload` — Token payload with 9 fields (wf, act, skill, cond, v, seq, ts, sid, aid)
- `ValidationResult` — `{ status: 'valid' | 'warning', warnings: string[] }` — informational metadata
- `StepManifestEntry` / `ActivityManifestEntry` — Structures for validating step/activity completion

## Dependency Graph

```
tool handlers → validation.ts → workflow-loader.ts
tool handlers → session.ts → crypto.ts
state-tools.ts → toon.ts → @toon-format/toon
loaders (4 files) → toon.ts
```

## Consumer Analysis

- **validation.ts** consumers: `workflow-tools.ts` (7 call sites), `resource-tools.ts` (2 call sites), `state-tools.ts` (2 call sites)
- **session.ts** consumers: All tool modules via `decodeSessionToken`, `advanceToken`, `sessionTokenParam`
- **crypto.ts** consumers: `session.ts`, `state-tools.ts`
- **toon.ts** consumers: All 4 loader modules, `state-tools.ts`

## Open Questions

| # | Question | Status | Resolution | Section |
|---|----------|--------|------------|---------|
| 1 | Does any caller branch on ValidationResult.status? | Resolved | No. All callers pass it through to _meta. | Consumer Analysis |
| 2 | What types does @toon-format/toon encode accept? | Resolved | Any serializable value; current Record<string,unknown> is artificially narrow. | Key Abstractions |
| 3 | Are there existing tests for utils modules? | Resolved | No dedicated utils test file found; tested indirectly through integration tests. | — |
