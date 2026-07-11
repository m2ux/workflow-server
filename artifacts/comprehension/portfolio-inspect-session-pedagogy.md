# Portfolio — Pedagogy Lens — inspect_session (#193)

> Lens: pedagogy (06). Subject: session read path + read-only tool pattern for the proposed `inspect_session` tool. Work package: #193. Date: 2026-07-11.

Pedagogy law surfaced: **a constraint the source code enforces by construction gets transferred to the new tool as an assumption the author must remember to preserve.** The existing read path is safe not because each tool re-checks, but because one primitive (`loadSessionForTool`) does the checking. Copy the *shape* without the primitive and the safety silently does not transfer.

## Explicit choices in the source, and the alternative each invisibly rejects

| Explicit choice (source) | Invisibly rejected alternative | Transferred-as-assumption risk for a new tool |
|---|---|---|
| Resolve session by *stored* `sessionIndex` via folder enumeration | Derive path from the input string | An author who "optimises" by composing a path from `session_index` resurrects the rejected path and reintroduces traversal risk. The containment is in the resolver, not the tool. |
| Verify HMAC seal on *every* load, reads included | Skip seal on read for speed | Copying `get_workflow_status`'s body but calling `readSessionFile` directly (to "just read") drops seal verification — a silent integrity regression, invisible until tampered state is projected. |
| `get_workflow_status` omits `advanceSession`/`saveSessionForTool` | Bump seq on every call uniformly | A newcomer patterning off *mutating* tools (the 11 that do advance) would add a write to a read-only tool — a visible bug (seq churn, seal rewrite) but easy to copy in. |
| Read-only tool omits `assertNoActiveCheckpoint` | Gate all tools uniformly | Copying the mutating-tool template pastes the checkpoint gate in, making inspection unusable exactly when blocked — the one time you most want to look. Silent until someone inspects a blocked session. |
| Compact projection, never raw `session.json` | Return the whole file | `history` + `deliveredContent` grow unboundedly; a "just return the doc" author ships a tool whose response size degrades over a session's life — slow to discover, worst at close-out (the target use case). |

## Mental-model traps for the newcomer

- **"session_index addresses a file"** — it addresses a *node in a tree*. Root sessions have empty `jsonPath`; children resolve to `["triggeredWorkflows", n, "state"]`. A reader who models "index → file" misses that `loaded.state` may already be a sub-state, which is exactly the asymmetry the reference `--child` semantics navigate on top of.
- **"the reference script's `--child N` descends arbitrarily deep"** — it does not. `resolve()` indexes the *root* document's `triggeredWorkflows` one level; `children`/`summary` always read the root. Deeper descent is done by addressing a deeper session's own index, not by a bigger N. Misreading this leads to an over-built recursive `child_index`.
- **"read-only = no shared code with writers"** — the safety (seal, schema-validate, navigate) lives in the *shared* `loadSessionForTool`; the read-only property is only the *absence* of the advance/save tail. The lesson: reuse the primitive, drop the tail.

## Prediction — which transferred decision fails first, discovered slowest

The **seal-on-read** assumption. It is invisible (reads "work" without it), the failure mode only triggers under tampered/torn state, and the target consumers are close-out summaries where a wrong projection is silently wrong rather than loud. An author reaching for `readSessionFile` instead of `loadSessionForTool` would pass every happy-path test and every review that does not specifically check the load primitive.
