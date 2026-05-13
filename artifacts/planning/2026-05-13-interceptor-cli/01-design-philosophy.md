# Design Philosophy — MCP-Client Interceptor CLI

**Activity:** design-philosophy
**Date:** 2026-05-13
**Issue:** [#112](https://github.com/m2ux/workflow-server/issues/112)
**Branch:** `feat/112-interceptor-cli`
**PR:** [#113](https://github.com/m2ux/workflow-server/pull/113)

---

## 1. Problem Statement

### 1.1 What is happening

Session tokens returned by `start_session` are HMAC-signed opaque strings (~480 characters at current size; ~140 characters if the tier-C compaction work had been completed). Every subsequent workflow-server MCP call requires the LLM to retype that exact string into the call's `arguments.session_token` field. The LLM is a reliable-but-not-infallible copyist of long opaque strings: occasionally it emits a near-copy with a small number of characters altered, inserted, or dropped. HMAC verification then fails, and the workflow halts mid-step with a "signature verification failed" error.

### 1.2 System understanding

- Tokens travel through the wire on every call after `start_session`; this is by deliberate design (the server is stateless with respect to session identity, which is embedded inside the token).
- The corruption surface is not the network, not the server, not the client transport — it is the LLM's own token output stream as it composes the next `tools/call` JSON.
- PR #1466 documented one concrete instance: a `psid` UUID embedded in the token gained two stray hex characters, almost certainly an attention-pattern artifact rather than a random bitflip.

### 1.3 Impact assessment

A workflow can be twenty or thirty MCP calls long. A single corrupted token anywhere in that chain throws away the cumulative progress: artifacts produced, checkpoints resolved, variables set, and orchestration state. The user sees a cryptic HMAC error with no obvious recovery path. The structural pressure this places on workflow length is real — every additional step is another transcription opportunity, which silently caps how rich the workflows can become.

### 1.4 Success criteria

1. `workflow-server-interceptor` ships as a `bin` entry of `@m2ux/workflow-server`.
2. A sample `~/.claude/settings.json` hook configuration in `docs/interceptor-recipe.md` wires both `PreToolUse` (inject) and `PostToolUse` (capture) hooks.
3. After installation, every MCP call to `mcp__workflow-server__*` — except `start_session` — receives an auto-injected `session_token`, verified by an integration test that exercises the exact tool-call shape Claude Code emits. The state directory contains a separate `<sid-hex>.token` file per workflow-server session observed, plus a `current.token` pointer file containing the most recently captured token.
4. Per-harness configuration samples for Cursor, OpenCode, Codex CLI, and the Claude Agent SDK ship in `examples/interceptor/`.

### 1.5 Constraints

- **Zero server-side change.** The wire protocol and token format stay as they are today. The fix is purely on the client side.
- **Cross-harness portability.** The CLI itself is harness-agnostic; per-harness wiring is documentation, not code.
- **Failure-safe defaults.** If the hook is absent, mis-installed, or its state file is missing, behavior must revert cleanly to the status quo — never worse.

---

## 2. Problem Classification

**Type:** `specific-problem-cause-known`

PR #1466 isolated the failure mode (LLM transcription drift on the `session_token` field), and the chosen remedy (harness hook injection) has been pre-selected. There is no open requirements question, no unknown failure mode under investigation, and no inventive design space left to explore. The problem and its cause are both pinned.

**Complexity:** `simple`

- Single new file: the interceptor CLI executable.
- Supporting tests and documentation.
- Estimated 300–500 LOC end-to-end, including tests and per-harness recipe samples.
- No architectural shifts in the workflow-server itself.
- No new packages, no schema changes, no migration concerns.

---

## 3. Solution Approach

### 3.1 Approach

Eliminate the LLM's role in passing the token rather than trying to shrink it. The MCP client (Claude Code, Cursor, OpenCode, Codex CLI, Claude Agent SDK) is given two hooks:

- **`PreToolUse`**: intercepts outgoing `mcp__workflow-server__*` calls and injects `session_token` from a small state file the interceptor maintains.
- **`PostToolUse`**: inspects each workflow-server response, extracts the new token returned by the server, and writes it back to the state file for the next call to use.

The LLM never sees the token in the outbound call's argument list — the harness owns the full token lifecycle.

### 3.2 Why this approach over the alternatives

#### vs. tier-C (shrink the token)

Tier-C work (CBOR codec, `SessionStore`, `state_hash` modules — already partially landed on this branch's predecessor commits) reduces token size from ~480 to ~140 characters. That cuts the transcription surface area by roughly 75 %, but does not eliminate it: a 140-character opaque blob is still corruptible. Hooks eliminate the surface entirely. Tier-C also requires non-trivial server-side work to complete (wire format migration, state hash verification, backward-compatibility shims). Hooks require zero server-side changes.

The two approaches are not mutually exclusive — tier-C remains useful for harnesses that lack hooks — but hooks are the structural fix and should land first.

#### vs. stateful MCP server (track session by transport)

Holding session state in the server keyed by transport identity would let the wire-level `session_token` parameter disappear entirely. But it would:

- Force every tool handler to drop the `session_token` parameter from its schema.
- Rewrite the resume-from-saved-token contract, which currently depends on the token being explicitly portable.
- Forfeit statelessness as a deliberate property of the server.
- Couple session lifetime to transport lifetime, breaking long-running disconnected sessions.

Hooks preserve the existing wire protocol unchanged and add a transparent injection layer between the LLM and the wire.

#### vs. SEP-2624 (protocol-level interceptors)

SEP-2624 proposes a protocol-level interceptor mechanism inside the MCP specification itself. It is a draft, unmerged, with no SDK reference implementation. Concrete prototypes exist only in third-party repos. It is not a viable near-term fix; if and when it lands, it can subsume the per-harness recipes documented here.

### 3.3 Cross-harness availability

The hook capability is not Claude Code-specific. Five major harnesses ship the equivalent today:

| Harness               | Mechanism                                           |
|-----------------------|-----------------------------------------------------|
| Claude Code           | `PreToolUse` / `PostToolUse` hooks with `updatedInput` |
| Claude Agent SDK      | Programmatic callback registered at session start    |
| Cursor (≥1.7)         | `beforeMCPExecution`                                |
| OpenCode              | `tool.execute.before` plugin handler                |
| OpenAI Codex CLI      | `PreToolUse` hook (PR #18385)                       |

The interceptor CLI ships once. Per-harness configuration snippets ship as documentation.

### 3.4 Failure modes

- **State file missing.** Hook passes the call through untouched. The first MCP call after `start_session` populates the state file from the response.
- **Multiple concurrent workflow-server sessions in one Claude Code conversation.** Each session writes a separate `<sid-hex>.token` file, so per-session state never collides. `current.token` (the inject pointer) still races: the most recent capture wins. Recovery is per-file — a user can manually copy a specific `<sid-hex>.token` to `current.token` to switch which session the next inject targets. True multi-active-session support (different sessions concurrently active mid-call) would require a sid hint on the inject side, which the current MCP tool-call context does not expose; it remains a v2 concern.
- **Agent explicitly passes `session_token` or `checkpoint_handle`.** Hook detects the existing value and skips injection — never clobbers an agent-supplied token.
- **`start_session` call.** Hook always skips injection — the caller may legitimately be resuming with a saved token.
- **Hook script absent or mis-installed.** Behavior reverts to today's status quo: LLM transcribes the token directly, occasional corruption.

### 3.5 State directory layout — keyed by `sid`

```
~/.claude/workflow-server-tokens/
  <sid-hex>.token       # one file per workflow-server sid that has been observed
  current.token         # plain text containing the most recently captured token (for fast inject lookup)
```

`<sid-hex>` is the workflow-server session id extracted from the token's payload (base64url-decode the part before the `.`, then JSON.parse, then read the `sid` field — a UUID — and strip the dashes to get 32 hex characters).

**Capture (PostToolUse)** writes the captured token to two places: the per-sid file at `<STATE_DIR>/<sid-hex>.token`, and the shared `<STATE_DIR>/current.token` pointer. **Inject (PreToolUse)** reads only `current.token` — it has no sid hint in the tool-call context to choose a specific per-sid file with.

#### Why per-sid files in v1 instead of just `current.token`

- **Inspection / debugging.** `ls ~/.claude/workflow-server-tokens/` lets a user see which workflow-server sessions are alive locally and which one `current.token` is currently pointing at.
- **Targeted cleanup.** Deleting an individual session's state is per-file rather than wiping a single shared file shared by every session ever observed.
- **Foundation for future multi-active-session work.** If MCP ever exposes a sid hint in tool-call context, the inject hook can switch from `current.token` to `<sid-hex>.token` without disturbing the on-disk layout or capture semantics.
- **Same robustness for the single-active-session case.** When only one workflow-server session is running in a conversation, `current.token` always points at it; behavior is identical to a single-file design.

The downside is that **interleaved concurrent sessions still race on `current.token`** — but the per-sid files survive, so a user can recover by manually pointing `current.token` at the desired sid file. This is "v2-graceful": no architectural rework needed when true multi-active-session support is added later. The on-disk shape stays, and inject's selection logic is the only thing that changes.

---

## 4. Workflow Path

**Path:** `skip-optional`

Pre-resolved on entry:
- `complexity = simple`
- `needs_elicitation = false`
- `needs_research = false`
- `skip_optional_activities = true`
- `needs_comprehension = false`

Rationale: the problem is fully scoped (issue #112 + PR #1466 + the design content captured here), the cause is known, the remedy is selected, and the implementation surface is bounded (single CLI file + tests + docs). There is nothing left for elicitation or research activities to discover. Codebase comprehension is also skipped because no existing server source needs to be modified — the change lives in a new CLI file plus packaging metadata.

---

## 5. Scope

### 5.1 In scope (v1)

- `workflow-server-interceptor` TypeScript CLI shipped as a `bin` entry of `@m2ux/workflow-server`.
- `PreToolUse` injection of `session_token` for `mcp__workflow-server__*` calls, reading from `current.token`.
- `PostToolUse` capture of the response token into both a per-sid file (`<sid-hex>.token`) and the shared `current.token` pointer.
- `sid` extraction from the captured token's payload (base64url-decode the part before the `.`, JSON.parse, read `sid`, strip dashes to produce a 32-character hex filename component).
- State directory creation with mode `0700` and token files written with mode `0600`.
- Skip-injection rules for `start_session` and for calls that already carry a `session_token` or `checkpoint_handle`.
- `docs/interceptor-recipe.md` with a working Claude Code `settings.json` snippet.
- `examples/interceptor/` with sample configurations for Cursor, OpenCode, Codex CLI, and the Claude Agent SDK.
- Integration test that exercises the exact tool-call shape Claude Code emits.

### 5.2 Out of scope (v1)

- **Native (Rust) build.** TypeScript executable invoked via Node is acceptable; the ~50 ms cold-start per call is within budget.
- **Server-side state attestation (e.g., a `sh` state-hash field).** The hook makes LLM-side transcription corruption impossible; server-side drift detection is a separate concern, deferred.
- **workflow-server wire format changes.** Token stays as-is on the wire.
- **True multi-active-session support** (different sessions concurrently active mid-call). The per-sid files survive concurrent captures, but inject still uses `current.token`, so concurrent-active-session calls race on the pointer. Promoting this to in-scope would require a sid hint on the inject side that the current MCP tool-call context does not provide.

---

## 6. Redundancy Analysis & Cascading Scope

A GitNexus-driven sweep of workflow-server identified features and rules that exist purely to compensate for the LLM-transcribes-tokens failure mode the interceptor eliminates. Once the LLM no longer owns the token, several pieces of server code, parameter shapes, documentation, and meta-workflow rules become either redundant, misleading, or actively harmful (e.g., logging tokens that no longer need to be exposed). This work package folds the cleanup pass into the same PR because (a) the analysis is rooted in the same structural insight, (b) the cleanup carries no incremental risk over the interceptor itself, and (c) the user has explicitly approved breaking changes to the MCP tool surface in this PR.

### 6.1 Fully redundant code/features (act on now)

- **`withAuditLog` in `src/logging.ts`.** Today this wrapper captures the entire `params` object for every tool call into the audit log. With the interceptor, those params include the auto-injected `session_token` (and `checkpoint_handle` on the legacy checkpoint API surface). Logging an HMAC-signed credential that the LLM no longer touches is gratuitous data exposure: the token never appears in agent context, but it sits in the audit log indefinitely. Redact `session_token` and `checkpoint_handle` keys from `params` before calling `logAuditEvent`. Preserve the field's presence (replace value with `"[redacted]"`) so debugging "did the call include a token at all?" still works.
- **`present_checkpoint` / `respond_checkpoint` dual-parameter shape.** The current `handle = checkpoint_handle ?? session_token` accepts either parameter as equivalent. This duality exists for one reason: to give the LLM two recognizable names for what is actually a single token slot (the yielded session token with `bcp` set). With the interceptor, the LLM never constructs parameter names — the harness injects `session_token`. The dual shape is obsolete. **Collapse to a single `session_token` parameter.** This is a breaking change to the MCP tool surface; user has approved breaking changes in this PR.
- **Tier-C commits on `enhancement/session-token-size-optimization` branch (`1cd7d56`, `f7a4cd8`).** Tier-C reduced token size from ~480 to ~140 characters to shrink the transcription surface area. The interceptor eliminates the transcription surface entirely, making tier-C's transcription-corruption motivation redundant. Revert the two commits. Tier-C work may resurrect later for unrelated reasons (state size on disk, log volume), but its current branch's motivation no longer holds.

### 6.2 Documentation surfaces (act on now)

LLM-guidance text in tool descriptions and error messages was written under the assumption that the LLM constructs the wire-level parameter names and transcribes the token. Soften that text to acknowledge the interceptor as the recommended fix while preserving fallback guidance for the no-interceptor case.

- **`start_session` tool description's `STRICT PARAMETERS` and `STALENESS RECOVERY POLICY` notices** (in `src/tools/resource-tools.ts`) — soften to "applies when running without the harness interceptor".
- **`session_token` parameter description in `src/utils/session.ts:188-192`** (`"REQUIRED. The session token string... Every tool call must include this parameter."`) — soften to "managed by the harness interceptor or passed explicitly".
- **HMAC-failure error message in `src/utils/session.ts:75-82`** — keep the message but acknowledge the interceptor as the primary fix; the long recovery hint was for the LLM and is no longer the first-line cure.

### 6.3 Meta-workflow rule pruning (workflows submodule branch)

The meta workflow's `workflow-engine` skill encodes a number of rules that exist solely to discipline the LLM into handling tokens correctly. Under the interceptor, the LLM is not handling tokens, so these rules either no longer apply or apply only as a fallback for the no-interceptor case.

- `token-passes-on-each-call`, `use-most-recent-token`, `start-session-strict-params`, `parameter-vs-variable` (specifically for tokens) — mark each as "applies when running without an MCP-client interceptor".
- `checkpoint-handle-distinct-from-session` — under the collapsed-parameter API (§6.1, task 9), the distinction between `checkpoint_handle` and `session_token` disappears at the wire level. This rule is moot; remove it.
- `thread-resumed-token` — currently references the `checkpoint_handle` field. Under the collapsed-parameter API, the field is `session_token`. Update accordingly.
- Existing `token-in-prompt` rule (in `harness-compat::spawn-agent`) handles INBOUND session-boundary handoff: when a sub-agent is spawned, it gets its own session_token via prompt because the interceptor's `current.token` is parent-scoped. This rule is correct as-is. **ADD a complementary OUTBOUND rule** for when the parent regains control after a sub-agent dispatch: the parent's next workflow-server call must explicitly pass its own session_token in order to overwrite the interceptor's stale `current.token` pointer (which is still holding the sub-agent's last captured token). Name: `explicit-session-on-resume`.

### 6.4 Checkpoint flow analysis

Under the interceptor, the checkpoint flow needs to be re-analysed because the dual-parameter shape that exists today (`checkpoint_handle` OR `session_token`) was a key part of the LLM-ergonomics surface that motivated it. The analysis below confirms that collapsing to a single `session_token` parameter is safe and that all transitions stay within the harness's single `current.token` slot.

- A worker shares the same `sid` as its dispatching orchestrator (only `aid` differs). The worker advances `current.token` to a same-session token; the orchestrator can resume using `current.token` directly.
- `yield_checkpoint` returns a new session_token (with `bcp` set) — this IS the "checkpoint_handle" today (same string, different parameter name).
- `present_checkpoint` does not advance the token; `current.token` stays at the yield-time handle.
- `respond_checkpoint` clears `bcp` and returns a new session_token. The capture hook stores it.
- The worker resumes with `resume_checkpoint`, which captures a further token advance.
- All transitions occur within one session, one `sid`, one `current.token` slot. The dual-parameter shape on `present_checkpoint`/`respond_checkpoint` is purely LLM-ergonomic — interceptor injection of `session_token` succeeds because the server's existing `handle ?? session_token` line already accepts it. Collapsing the schema to require only `session_token` retains correctness for every interceptor-mediated path and shifts the breaking change onto callers who construct the wire JSON by hand.

### 6.5 What this means for v1 scope

The interceptor remains the structural fix and the headline of the PR. The cleanup pass (tasks 6–10 in [05-work-package-plan.md](05-work-package-plan.md)) is a deliberate widening of scope to retire the now-redundant compensating mechanisms in the same change set, while the redundancy analysis is fresh and while breaking changes are on the table. The effort grows from 2.5-3.5h to 4.5-6h total.
