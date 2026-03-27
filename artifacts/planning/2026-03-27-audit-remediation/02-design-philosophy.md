# Design Philosophy — WP-01: Security Hardening

## Problem Statement

Two security findings from the quality audit require remediation in `src/tools/state-tools.ts`:

**QC-003 — Path traversal in state tools.** `save_state` joins a caller-supplied `planning_folder_path` with a fixed filename and writes to it, creating intermediate directories via `mkdir({ recursive: true })`. `restore_state` reads from a caller-supplied `file_path` directly. Neither tool validates that the resolved path stays within the workspace. An agent can supply `../../etc/cron.d/backdoor` or an absolute path to read or write anywhere on the host filesystem.

**QC-004 — Encryption flag forgery.** When `save_state` encrypts the session token, it records `_session_token_encrypted = true` inside `state.variables` — the same `z.record(z.unknown())` namespace that agents populate freely. On restore, the presence of this flag controls whether decryption runs. An agent can set the flag on plaintext data (causing garbled decryption) or delete it from encrypted data (leaking ciphertext as if it were a valid token).

## Classification

- **Type**: Specific problem with known cause
- **Complexity**: Simple — two discrete fixes in one file, no architectural dependencies
- **Risk**: Low regression risk; changes are additive (validation) or move data between fields

## Workflow Path

Simple complexity → skip optional activities:

- `needs_elicitation = false` (problem fully specified by audit findings)
- `needs_research = false` (standard path-validation and schema techniques)
- `skip_optional_activities = true`

Proceed directly to implementation planning.

## Design Constraints

1. **Minimal blast radius.** Changes confined to `src/tools/state-tools.ts` and `src/schema/state.schema.ts`. No changes to tool API signatures (parameter names/types stay the same).
2. **Fail-closed.** Path validation must reject by default; only explicitly allowed paths pass. Prefer allowlist (resolved path must be under workspace root) over denylist (blocking `..` alone is insufficient).
3. **Backward compatibility for saved state files.** Existing `workflow-state.toon` files that store `_session_token_encrypted` in `variables` must still restore correctly. The migration path: on restore, check both the new metadata field and the legacy `variables` location; on save, always write to the new location only.
4. **No new dependencies.** Use Node.js `path.resolve` / `path.relative` for normalization; no third-party path-validation libraries.
5. **Workspace root boundary.** Use `process.cwd()` as the sandboxing boundary (the directory the server was launched from). This aligns with how MCP servers are typically invoked — from the project root. If a more specific boundary is needed later, `ServerConfig` can gain a `projectRoot` field, but that is out of scope for this WP.
