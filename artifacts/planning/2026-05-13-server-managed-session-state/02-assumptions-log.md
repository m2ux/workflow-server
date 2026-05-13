# 02 - Assumptions Log

**Work package:** Server-managed session state with workspace-aware MCP server
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**Created:** 2026-05-13 (design-philosophy activity)

This log tracks assumptions made during planning. Each row is classified by **resolvability**:

- **Code-analyzable** — verifiable by reading the current codebase. Reconciled in this activity.
- **Stakeholder-dependent** — requires human input (elicitation activity).
- **Research-dependent** — requires external research (research activity).

Status legend: `confirmed`, `refuted`, `refined`, `open`.

---

## A. Problem interpretation

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| A1 | The current session-state model is exactly: opaque HMAC-signed token threaded on every authenticated call **plus** an agent-written `workflow-state.json` + `.session-token` pair in the planning folder. | code-analyzable | confirmed | `src/utils/session.ts:5-20` defines `SessionPayload`. `workflows/meta/skills/00-workflow-engine.toon:152-170` defines the `persist` operation, which calls the harness `Write` tool on `workflow-state.json` and `.session-token`. |
| A2 | The token already encodes all of: `wf, act, skill, cond, v, seq, ts, sid, aid, bcp, psid, pwf, pact, pv`. | code-analyzable | confirmed | `SessionPayload` interface and `SessionPayloadSchema` zod schema at `src/utils/session.ts:5-20, 43-58` enumerate exactly these fields. |
| A3 | The token's parent chain is single-level (flattened into `psid/pwf/pact/pv`, no recursion). | code-analyzable | confirmed | `SessionPayload` carries exactly one parent level; `start_session` at `src/tools/resource-tools.ts:177-200` reads exactly one ancestor via `parent_session_token`. There is no nested parent shape. |
| A4 | Token transcription drift is a real, observed failure mode that the codebase actively works around. | code-analyzable | confirmed | `src/utils/session.ts:60-106` (long, prescriptive error strings for HMAC failure with explicit "session token may have been truncated" guidance); `src/tools/resource-tools.ts:95-165` (the stale-token auto-adoption branch in `start_session`); `src/utils/session.ts:143-162` (`decodePayloadOnly`, a payload-recovery path that exists solely to handle this case). |
| A5 | The agent — not the server — currently owns the schema of `workflow-state.json` (enforced only via TOON rules). | code-analyzable | confirmed | Schema is documented in `workflows/meta/skills/00-workflow-engine.toon:165-170` as agent-facing rules (`state-format`, `no-token-duplication`, `no-derived-fields`, `omit-empty-collections`, `variables-canonical-home`). No server-side validator references this file's shape. |
| A6 | The server does not currently take a workspace argument; it knows only its `WORKFLOW_DIR` (workflow definitions, not the user's workspace). | code-analyzable | confirmed | `src/config.ts:27-34` reads only `WORKFLOW_DIR`, `SCHEMAS_DIR`, `SERVER_NAME`, `SERVER_VERSION`. `src/index.ts` passes config directly with no CLI parsing. No `process.argv` parsing exists. |
| A7 | `~/.workflow-server/secret` already exists as a 32-byte HMAC-suitable key created by the server on first run. | code-analyzable | confirmed | `src/utils/crypto.ts:7-54` — `KEY_DIR=~/.workflow-server`, `KEY_FILE=~/.workflow-server/secret`, `KEY_LENGTH=32`. Created with `mkdir -m 0700` and `open` with mode `0600`, `O_CREAT|O_EXCL` for concurrent-safe initialisation. |
| A8 | HMAC primitives suitable for sealing a file (sha256, raw-bytes input, timing-safe compare) already exist in the codebase. | code-analyzable | confirmed | `src/utils/crypto.ts:77-86` — `hmacSign` (sha256, hex-digest) and `hmacVerify` (timing-safe). |
| A9 | The unauthenticated tool set is exactly `discover`, `list_workflows`, `health_check`. | code-analyzable | confirmed | `src/tools/workflow-tools.ts:31,44,497` register these three tools with empty zod schemas and descriptions explicitly stating "Does not require a session token". |
| A10 | All authenticated tools today share a single zod fragment (`sessionTokenParam`) that adds `session_token`, so replacing it is a single-point change. | code-analyzable | confirmed | `src/utils/session.ts:188-192` defines `sessionTokenParam` once. `grep -n sessionTokenParam src/tools/workflow-tools.ts` shows every authenticated tool spreading it (`...sessionTokenParam`). |
| A11 | The five files referencing `session_token` in `src/` are the only server-side change surfaces for the parameter-shape transition: `tools/workflow-tools.ts`, `tools/resource-tools.ts`, `utils/session.ts`, `utils/validation.ts`, `logging.ts`. | code-analyzable | confirmed | `grep -rn session_token src/` returns exactly those five files. Test files (`tests/session.test.ts`, etc.) will need parallel updates but are not in the production code path. |

## B. Design intent

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| B1 | Six base32 characters (30 bits) is sufficient identifier length for transcription reliability and acceptable collision risk. | research-dependent | open | Research activity: survey transcription-failure rates for short alphanumeric strings vs. token-shaped opaque blobs in LLM contexts; survey UUID-shortening conventions (nanoid, base32) for similar use cases. |
| B2 | `base32(HMAC(folder_path, secret)[0..4])` is the right derivation function — deterministic, secret-bound (so the index cannot be guessed without the key), and short. | refined / research-dependent | refined | The derivation is deterministic and secret-bound, which is good. Open: should the input be the absolute path, the slug (basename), or the workspace-relative path? Absolute-path makes the index workspace-instance-specific; slug-only makes two workspaces with identically named slugs collide. Recommendation: use absolute path. Confirm in research. |
| B3 | `.session-token` should hold ONLY the HMAC hex bytes — no JSON, no envelope. The state lives in `session.json`. | stakeholder-dependent | open | The issue specifies this. Worth confirming with the user: there is a precedent for richer seal files (e.g., signed-JSON with algorithm identifier and timestamp). Keeping it raw is simpler but irreversible if a future use case needs metadata in the seal. |
| B4 | Atomic write semantics are: write `session.json.tmp` + fsync + rename, then write `.session-token.tmp` + fsync + rename. Two-step rename is acceptable because the seal-mismatch is the convergence detector. | refined | refined | Two-step rename has a tiny window where `session.json` is new but `.session-token` is old. A concurrent reader during that window would observe a seal mismatch and reject — which is the correct failure mode (fail fast). Order is: write `session.json` first, then `.session-token`. A reader that sees a half-completed pair retries or errors clearly. |
| B5 | The HMAC is computed over the raw bytes of `session.json`, not over a parsed/normalised representation. Whitespace and key-order changes invalidate the seal. | stakeholder-dependent | open | Simpler and more defensible — anything that touches the file invalidates the seal. The alternative (canonicalised hash) hides accidental edits. Recommend raw-bytes; confirm with user. |
| B6 | The agent's reading of `session.json` is a stable contract: the JSON shape is part of the agent-facing API even though only the server writes it. | stakeholder-dependent | open | The agent uses `session.json` to situate itself ("which activity am I in?"). Schema drift breaks agents. Confirm whether `session.json` schema is versioned (`stateVersion` field carried forward from today's `workflow-state.json`) and what the deprecation policy is. |

## C. Complexity assessment

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| C1 | This is a complex inventive-goal classification: many components affected, multiple open design decisions, no single localised change. | self-evident | confirmed | Touches every authenticated tool, persistence layer, meta-workflow skill, and agent-facing documentation. Phase 9 migration alone is a non-trivial sub-project. |
| C2 | Full workflow path (elicitation + research) is appropriate. | self-evident | confirmed | Checkpoint `workflow-path-selected` was answered with `full-workflow` by the user. Open questions in section 8 of `02-design-philosophy.md` justify elicitation; section 7 of the same doc and assumption B1 justify research. |
| C3 | Estimated effort: 1–3 days of agentic development time across phases 1–10, with most weight in phases 5–7 (index resolution, tool API, nested-parent) and phase 9 (migration). | stakeholder-dependent | open | Confirm with user. Estimate informs whether the work package is sequenced as a single PR or split. |

## D. Workflow path

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| D1 | `is_review_mode` is false; this is a forward-development work package, not a review of existing prior work. | code-analyzable | confirmed | The orchestrator's resume prompt explicitly states `is_review_mode: not set (defaults false)` and instructs to skip the review-mode steps in this activity. |
| D2 | Codebase comprehension (next activity) should focus on the session/token plumbing surface area: `src/utils/session.ts`, `src/utils/crypto.ts`, `src/tools/{workflow,resource}-tools.ts`, `src/utils/validation.ts`, `src/logging.ts`, and the `meta` workflow's `persist`/`restore` operations. | code-analyzable | confirmed | These are the only files touched by `session_token` per A11. The meta-workflow surface is `workflows/meta/skills/00-workflow-engine.toon` (per A1, A5). |
| D3 | Migration of in-flight `workflow-state.json` files (phase 9) needs its own sub-plan; it is too risky to be a single PR task. | stakeholder-dependent | open | Confirm with user during plan-prepare whether phase 9 should be a separate change set with feature-flag gating. |

## E. Workspace and operational semantics

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| E1 | Workspace argument can be provided as either a CLI flag (e.g., `--workspace=PATH`) or an environment variable (e.g., `WORKFLOW_WORKSPACE=PATH`). | stakeholder-dependent | open | User to decide preferred surface. Existing config uses env vars exclusively (`WORKFLOW_DIR`, etc.); a CLI flag would be a new precedent. Recommendation: support both, CLI takes precedence. |
| E2 | When neither workspace argument is provided, the server errors out at startup rather than silently defaulting to `process.cwd()`. | stakeholder-dependent | open | Erroring is safer (cwd at MCP-server launch is determined by the harness, not the user, and is unpredictable). Confirm with user. |
| E3 | The server runs as the same OS user as the agent (single-user-machine assumption). Filesystem permissions `0700`/`0600` are advisory documentation of intent, not enforced isolation. | self-evident | confirmed | MCP-over-stdio servers launched by Claude Code run in the same process tree as the user. The threat model in section 5 of `02-design-philosophy.md` already states this. |
| E4 | One server instance per workspace. Two server instances launched against the same workspace is undefined behaviour (race conditions on file writes). | stakeholder-dependent | open | Confirm with user whether locking (PID file, advisory `flock`) is in or out of scope. Recommendation: out of scope for V1; documented constraint. |
| E5 | `~/.workflow-server/secret` rotation is manual and invalidates every in-flight session. There is no key-rotation protocol. | stakeholder-dependent | open | Confirm acceptable. Alternative (keyring with prior-key fallback for one rotation cycle) is more complex. Recommendation: V1 has no rotation; document recovery as "start over from the most recent commit". |
| E6 | Atomic rename semantics are POSIX (local filesystem). NFS, SMB, and FUSE backends are out of scope. | stakeholder-dependent | open | Confirm whether any user workflow puts the planning folder on a network mount. Recommendation: document as a constraint. |

## F. Index resolution

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| F1 | The server resolves `session_index` → planning folder by enumerating planning folders in the workspace and matching computed HMACs. There is no cache or in-memory map. | self-evident | confirmed | Stated directly in the issue. Stateless-across-calls invariant (I8 in design philosophy) requires this. |
| F2 | "Planning folders in the workspace" means directories matching `<workspace>/.engineering/artifacts/planning/*/`. | code-analyzable | confirmed | The orchestrator's resume prompt and the existing artifact structure use exactly this layout (`/home/mike1/projects/main/workflow-server/.engineering/artifacts/planning/2026-05-13-server-managed-session-state`). No other planning-folder location is referenced anywhere in the codebase or workflows. |
| F3 | The collision policy when two folders hash to the same six-character index is: error with both candidate paths and require the agent to disambiguate (rare case; deterministic resolution would silently route to the wrong folder). | stakeholder-dependent | open | Confirm with user. Alternative: lengthen the index to 8 characters (40 bits, ~1 in 1 trillion collisions for thousands of folders) and dispense with the policy entirely. |
| F4 | Folder enumeration on every authenticated call is acceptable for workspaces with hundreds of historical planning folders (the typical case). | research-dependent | open | Research activity: benchmark `readdir` + per-folder HMAC compute time on representative workspace sizes. Add an LRU cache if measurements warrant. |

## G. Nested parent chain

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| G1 | `parentSession` is the same shape as `session.json` itself, recursively. There is no separate `parent` type. | self-evident | confirmed | Stated in issue. Schema simplicity. |
| G2 | When a child workflow dispatches a grandchild, the grandchild's `session.json` carries `parentSession = <child's session.json at dispatch time>`, which itself carries `parentSession = <parent's session.json at parent dispatch time>`. The chain captures state-at-dispatch-time, not state-at-the-moment-of-recursion. | self-evident | confirmed | Stated in issue. Snapshot semantics; otherwise the chain would need to be re-read on every parent mutation. |
| G3 | Parent-chain depth has no hard ceiling, but a soft warning is reasonable past (say) 5 levels — typical dispatch is 2–3 levels deep. | stakeholder-dependent | open | Confirm with user; informs validation messages. |

## H. Tampering and threat model

| ID | Assumption | Resolvability | Status | Evidence / next step |
|----|------------|---------------|--------|----------------------|
| H1 | The threat model is **incoherent state**, not malicious actors. Anyone with workspace write access can already delete files; the seal exists to detect inconsistency, not to prevent local edits. | self-evident | confirmed | Section 3.7 of `02-design-philosophy.md` documents this. |
| H2 | A user-side edit to `session.json` that is intentional ("I want to manually rewind the workflow") is an unsupported workflow and must result in a clear seal-mismatch error. There is no "force-accept" mechanism. | stakeholder-dependent | open | Confirm with user. Alternative is a `start_session(planning_slug, force_reseal=true)` escape hatch; risk is normalising hand-edits. Recommendation: no force-reseal in V1. |

---

## Reconciliation summary

- **Code-analyzable assumptions:** 17 (A1–A11, D1–D2, E3, F1, F2, G1, G2). **All confirmed.**
- **Stakeholder-dependent:** 14 (B3, B5, B6, C3, D3, E1, E2, E4, E5, E6, F3, G3, H2 — and B2 partially). To be addressed in the **requirements-elicitation** activity.
- **Research-dependent:** 3 (B1, B2 partial, F4). To be addressed in the **research** activity.
- **Open count after reconciliation:** 17 (stakeholder + research). None of these block downstream work; the comprehension activity can proceed.

Convergence: no further code-resolvable assumptions remain.
