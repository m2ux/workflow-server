# Comprehension: State Tools (`src/tools/state-tools.ts`)

> Focused comprehension artifact for WP-01: Security Hardening (QC-003, QC-004).

## Architecture Overview

The state tools module registers two MCP tools — `save_state` and `restore_state` — that serialize and deserialize workflow execution state as TOON files. This enables cross-session workflow resumption: an agent can save progress, close the session, and later restore from the persisted file.

```
Agent
  ├── save_state(session_token, state_json, planning_folder_path)
  │     ├── decodeSessionToken()        → validates session
  │     ├── NestedWorkflowStateSchema   → validates state structure
  │     ├── encryptToken()              → encrypts session_token in variables
  │     ├── encodeToon()                → serializes to TOON format
  │     └── writeFile()                 → writes to planning_folder_path/workflow-state.toon
  │
  └── restore_state(session_token, file_path)
        ├── decodeSessionToken()        → validates session
        ├── readFile()                  → reads from arbitrary file_path
        ├── decodeToon() + safeParse()  → deserializes and validates
        ├── decryptToken()              → decrypts session_token if flag set
        └── returns full state object
```

## Key Abstractions

### StateSaveFile (schema)
Top-level envelope for persisted state. Fields: `id`, `savedAt`, `description`, `workflowId`, `workflowVersion`, `planningFolder`, `state`. Currently has **no metadata field** for encryption state — this is the root cause of QC-004.

### NestedWorkflowState (schema)
Extends `WorkflowState` with recursive `triggeredWorkflows` that can each carry their own nested state. The `variables` field is `z.record(z.unknown())` — an open key-value store with no reserved-key protection.

### Session Token Encryption (crypto.ts)
AES-256-GCM encryption using a server-local key stored at `~/.workflow-server/secret`. The `encryptToken`/`decryptToken` functions are correct and not in scope. The problem is _where the encrypted/not-encrypted flag is stored_, not the encryption itself.

## Vulnerability Analysis

### QC-003: Path Traversal

**save_state** — Line 59: `join(planning_folder_path, STATE_FILENAME)`. The `planning_folder_path` parameter comes directly from the agent with no validation. `join()` does not normalize traversal sequences before joining; a path like `../../etc/cron.d` passes through. Line 60: `mkdir(dirname(filePath), { recursive: true })` will create any intermediate directories.

**restore_state** — Line 91: `readFile(file_path, 'utf-8')`. The `file_path` parameter is used directly. An agent can read any file the server process has access to (e.g., `../../.ssh/id_rsa`).

**Attack surface**: Both tools require a valid `session_token`, but session tokens are issued to any agent that calls `start_session`. Token validation is not a security boundary against a malicious agent within the same session.

### QC-004: Encryption Flag Forgery

**save_state** — Line 46: `state.variables['_session_token_encrypted'] = true`. The flag is written into the `variables` namespace after encryption.

**restore_state** — Line 99: `restored.state.variables['_session_token_encrypted']` is checked to decide whether to decrypt. An agent that crafts a state JSON with `_session_token_encrypted: true` but a plaintext `session_token` will cause `decryptToken` to throw (GCM auth tag validation fails). An agent that omits the flag from an encrypted state will cause the encrypted ciphertext to be returned as the "session token", which would fail on next use but leaks the ciphertext.

**Root cause**: The flag lives in `variables`, which the agent controls end-to-end.

## File-Level Details

| File | Lines | Role | Changes Needed |
|------|-------|------|----------------|
| `src/tools/state-tools.ts` | 111 | Tool registration, save/restore logic | Add path validation; move encryption flag to save-file metadata |
| `src/schema/state.schema.ts` | 166 | Zod schemas for state + save file | Add optional `sessionTokenEncrypted` to `StateSaveFileSchema` |
| `src/utils/crypto.ts` | 58 | AES-256-GCM encrypt/decrypt, HMAC | No changes needed |
| `src/config.ts` | 24 | ServerConfig, PROJECT_ROOT | No changes needed (process.cwd() used for sandbox boundary) |
| `tests/state-persistence.test.ts` | 297 | Schema validation, TOON round-trip | Add path-traversal rejection tests, encryption flag migration tests |

## Design Rationale (Existing)

- **TOON format**: Used for human-readable persistence that agents and users can inspect. Consistent with the rest of the workflow data format.
- **Encryption is optional**: Only applied when `session_token` exists in variables. Some saves may not include tokens (e.g., workflow completed).
- **Shared variables namespace**: Designed for simplicity — any workflow variable is accessible. The encryption flag was added as a quick implementation without considering the trust boundary.

## Test Coverage Gap

Existing tests cover schema validation and TOON round-trip serialization. There are **zero tests** for:
- Path traversal rejection
- Absolute path rejection
- Encryption flag stored in correct location
- Backward compatibility of encryption flag migration
- The actual `save_state`/`restore_state` tool handlers (tests only exercise schemas and encoders, not the registered tool functions)

## Open Questions

None. The code paths are fully traced, the vulnerabilities are precisely located, and the fix approach (path validation + schema field move) is straightforward.
