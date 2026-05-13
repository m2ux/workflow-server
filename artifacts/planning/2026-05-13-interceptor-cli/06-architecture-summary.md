# Architecture Summary — feat/112-interceptor-cli

**Activity:** post-impl-review (architecture-summary step)
**Date:** 2026-05-13
**Audience:** Management / cross-team stakeholders

---

## What changed

A new `workflow-server-interceptor` CLI ships as a `bin` entry of
`@m2ux/workflow-server`. When wired into an MCP-host harness's
lifecycle hooks (Claude Code, Cursor, OpenCode, Codex CLI, Claude
Agent SDK), it captures the workflow-server `session_token` from
each response and injects it into the next outgoing call's
arguments. The LLM never has to retype the ~480-character HMAC-signed
token, eliminating a class of "signature verification failed" errors
that previously halted long workflows mid-step.

A redundancy-cleanup pass folded into the same PR retires the
compensating mechanisms in the workflow-server that existed
specifically to discipline the LLM into correct token handling:

- The dual-parameter shape on `present_checkpoint` and
  `respond_checkpoint` (accepting both `session_token` and
  `checkpoint_handle`) collapsed to a single `session_token`
  parameter (BREAKING CHANGE).
- `session_token` and `checkpoint_handle` are now redacted from
  the audit log.
- Tool descriptions, the HMAC-failure error message, and the README
  acknowledge the interceptor as the recommended fix.
- The meta-workflow's `workflow-engine` skill softened four
  token-handling rules to "applies when running without an
  MCP-client interceptor", removed one moot rule, updated one rule
  to reference the renamed field, and added one new rule
  (`explicit-session-on-resume`) for the parent-resume-after-sub-agent
  boundary.

The companion tier-C work (CBOR codec, SessionStore, state_hash
modules) on the `enhancement/session-token-size-optimization` branch
was reverted; the branch is closed (no PR) since tier-C never
reached main.

---

## C4 — System Context

```mermaid
C4Context
    title System Context — Workflow-Server Interceptor

    Person(user, "Developer", "Runs an AI coding agent against an MCP-hosted workflow")
    System(harness, "MCP-Host Harness", "Claude Code, Cursor, OpenCode, Codex CLI, or Claude Agent SDK. Forwards tool calls between the LLM and the MCP server. Now invokes the interceptor in its lifecycle hooks.")
    System(llm, "LLM", "Claude, GPT, etc. Composes outgoing tool calls. Under the interceptor, no longer transcribes session_token.")
    System(workflow_server, "workflow-server MCP Server", "Stateless server. Returns an HMAC-signed session_token in every response.")
    System_Ext(state_dir, "~/.claude/workflow-server-tokens/", "Per-sid token files and a current.token pointer. Mode 0700/0600.")

    Rel(user, harness, "Drives")
    Rel(harness, llm, "Forwards prompts / receives tool calls")
    BiRel(harness, workflow_server, "MCP tool calls / responses")
    Rel(harness, state_dir, "Reads on inject / writes on capture (via interceptor)")
```

---

## C4 — Containers

```mermaid
C4Container
    title Containers — Token Lifecycle Under the Interceptor

    Container(harness, "MCP-Host Harness", "Native", "Holds PreToolUse / PostToolUse hooks")
    Container(interceptor_inject, "workflow-server-interceptor inject", "Node CLI", "PreToolUse hook: reads stdin, reads current.token, emits updatedInput JSON")
    Container(interceptor_capture, "workflow-server-interceptor capture", "Node CLI", "PostToolUse hook: reads stdin, extracts sid, writes per-sid + current.token")
    Container(workflow_server, "workflow-server MCP Server", "Node/TS", "Tools: start_session, next_activity, get_activity, get_workflow, get_skill, get_resource, resolve_operations, yield_checkpoint, present_checkpoint, respond_checkpoint, resume_checkpoint, get_trace, get_workflow_status, health_check, list_workflows, discover")
    ContainerDb(state_dir, "Token State Dir", "Filesystem", "~/.claude/workflow-server-tokens/<sid-hex>.token + current.token")

    Rel(harness, interceptor_inject, "spawn + stdin JSON", "subprocess (~50ms)")
    Rel(interceptor_inject, state_dir, "read current.token")
    Rel(interceptor_inject, harness, "stdout: { updatedInput: { session_token } }")
    Rel(harness, workflow_server, "MCP call with injected session_token")
    Rel(workflow_server, harness, "MCP response with _meta.session_token")
    Rel(harness, interceptor_capture, "spawn + stdin JSON")
    Rel(interceptor_capture, state_dir, "atomic-write <sid-hex>.token + current.token (mode 0600)")
```

---

## C4 — Components (interceptor)

```mermaid
C4Component
    title Components — workflow-server-interceptor CLI

    Container_Boundary(cli, "workflow-server-interceptor (src/hooks/cli.ts)") {
        Component(main, "main()", "dispatches process.argv[2] to runInject / runCapture; final guard catches escapes; exits 0 unconditionally")
        Component(runInject, "runInject()", "decides whether to inject; emits {} on any skip or pass-through")
        Component(runCapture, "runCapture()", "locates _meta.session_token; extracts sid; writes per-sid + current.token")
        Component(readPointerToken, "readPointerToken()", "trimmed contents of current.token, or null")
        Component(extractSidHex, "extractSidHex()", "base64url + JSON.parse + UUID regex → 32-hex string or null")
        Component(writeTokenFile, "writeTokenFile()", "atomic .tmp + rename + chmod 0600")
        Component(ensureStateDir, "ensureStateDir()", "mkdirSync recursive at mode 0700")
        Component(locateResponseToken, "locateResponseToken()", "checks _meta.session_token then tool_response._meta.session_token")
        Component(parseJsonSafe, "parseJsonSafe()", "JSON.parse with null on error")
        Component(readStdin, "readStdin()", "readFileSync(0) with empty-string on error")
    }

    Rel(main, runInject, "if argv[2]==='inject'")
    Rel(main, runCapture, "if argv[2]==='capture'")
    Rel(runInject, readStdin, "")
    Rel(runInject, parseJsonSafe, "")
    Rel(runInject, readPointerToken, "")
    Rel(runCapture, readStdin, "")
    Rel(runCapture, parseJsonSafe, "")
    Rel(runCapture, locateResponseToken, "")
    Rel(runCapture, ensureStateDir, "")
    Rel(runCapture, extractSidHex, "")
    Rel(runCapture, writeTokenFile, "twice — per-sid then pointer")
```

---

## Token lifecycle — sequence

```mermaid
sequenceDiagram
    participant LLM
    participant Harness
    participant Inject as interceptor inject
    participant Server as workflow-server
    participant Capture as interceptor capture
    participant FS as ~/.claude/workflow-server-tokens/

    LLM->>Harness: emits tool call (no session_token)
    Harness->>Inject: spawn + stdin {tool_name, tool_input}
    Inject->>FS: read current.token
    FS-->>Inject: token T
    Inject-->>Harness: stdout {updatedInput: {...tool_input, session_token: T}}
    Harness->>Server: MCP call with session_token: T
    Server-->>Harness: response with _meta.session_token: T'
    Harness->>Capture: spawn + stdin {_meta: {session_token: T'}}
    Capture->>Capture: extractSidHex(T') → sid-hex
    Capture->>FS: write <sid-hex>.token = T' (atomic, 0600)
    Capture->>FS: write current.token = T' (atomic, 0600)
    Capture-->>Harness: (no stdout)
    Note over LLM: Next turn — LLM emits tool call (no session_token) → cycle repeats
```

---

## Boundaries and invariants

| Invariant | Enforced by | Test |
|-----------|-------------|------|
| `session_token` never appears in audit log | `redactParams` in `src/logging.ts:27-33` | TC-30, TC-31, TC-32b |
| `checkpoint_handle` never appears in audit log | `redactParams` (same set) | TC-31 |
| Audit redaction is shallow (other params preserved) | `redactParams` clones top-level only | TC-32, TC-32c |
| Token files always mode `0600` | `writeTokenFile` opens with `0o600`, chmods twice | TC-13, TC-27 |
| State dir always mode `0700` | `ensureStateDir` calls `mkdirSync({mode: 0o700})` | TC-14 |
| Atomic write (no torn writes) | `.tmp` + `renameSync` | TC-17, TC-26 |
| sid extraction failure → pointer-only capture | `extractSidHex` returns null; `runCapture` writes only pointer | TC-18, TC-18b, TC-18c |
| Inject never clobbers agent-supplied token | skip-branches at cli.ts:188-195 | TC-04, TC-05 |
| Inject always skips `start_session` | skip-branch at cli.ts:183-186 | TC-03 |
| CLI never exits non-zero | unconditional `process.exit(0)` in `main()` | TC-10, TC-24, TC-25 |
| Collapsed API: `checkpoint_handle` no longer in schema | Zod input schemas in workflow-tools.ts | TC-33, TC-34, TC-35a, TC-35b, TC-35c |
| Collapsed API: response field renamed to `session_token` | response-body construction in `present_checkpoint` / `respond_checkpoint` | TC-33, TC-34 |
| Meta-workflow operations use `session_token` parameter binding | submodule commit `161ff0d` | Test helper `resolveCheckpoints` (mcp-server.test.ts:66-75) exercises this via runtime calls |

---

## Risks and mitigations (summary)

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Concurrent workflow-server sessions race on `current.token` | Low | Per-sid files survive; manual recovery documented; v2-graceful path |
| ~50ms per-call cold-start cost | Low | Accepted v1 trade-off; native build deferred |
| Wire-format change breaks sid extraction | Low | Graceful fallback to pointer-only; tested |
| External consumer breaks on collapsed API | Low | Approved breaking change; release notes |
| Cross-session boundary correctness depends on agent discipline | Low | New `explicit-session-on-resume` meta-rule |
| Hook script absent / mis-installed | Low | Failure-safe default = status quo (LLM transcribes) |

---

## Status

Implementation complete. Manual diff review pending user input.
Test count exceeds plan target. No critical or major issues. Two
informational drifts (api-reference doc staleness, cross-session
integration test deferral) — both documented and either fixable in a
small follow-up or accepted by plan scope.
