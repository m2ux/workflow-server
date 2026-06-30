# Change Block Index — Simplify workflow-server README prose

**Date:** 2026-06-29
**Branch:** `chore/simplify-readme-prose` (PR [#142](https://github.com/m2ux/workflow-server/pull/142))
**Diff:** `git diff origin/main..HEAD -- README.md`
**Scope:** Single file, prose-only. 12 insertions / 12 deletions across 6 logical blocks.
**Estimated review time:** ~3 min (6 blocks × ~30 s).

> Review the diff in your side-by-side app. Confirm each block's rationale paragraph is accurate (or note corrections), then provide row numbers for any blocks with issues, or "none".

## File Index

| Row | Path | Block (README region) | Task |
|-----|------|------------------------|------|
| [1](#block-1) | README.md | Tagline (L8) | T2 |
| [2](#block-2) | README.md | Overview paragraph (L18) | T2 |
| [3](#block-3) | README.md | How-It-Works steps 2 & 3 (L23–24) | T1 |
| [4](#block-4) | README.md | Architecture bullets (L33–36) | T3 |
| [5](#block-5) | README.md | MCP Tools intro — "five"→"six" (L40) | T4 |
| [6](#block-6) | README.md | Quick-Start glue + Engineering intro (L108, L138, L142) | T3 |

## Block Rationale

### Block 1
**Tagline (L8) — term-before-gloss (T2 / gap G3).** The original packed three loaded terms ("structured", "fidelity-enforced", and the discover/navigate/execute triple) into one sentence before a newcomer knew what a workflow was. The rewrite introduces "workflow" in plain words first ("an ordered set of steps for a goal"), then derives "fidelity-enforced" from a plain explanation ("The server keeps the agent on that defined path, so these workflows are fidelity-enforced"). The load-bearing terms "MCP server", "workflow", and "fidelity-enforced" are all retained; the discover/navigate/execute verbs are kept and still mirror the How-It-Works steps. The `[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)` link is byte-identical.

### Block 2
**Overview paragraph (L18) — one-idea-per-sentence, active voice (T2 / gap G4).** The original chained "structured, multi-step workflows" plus a bootstrap clause plus a three-item server-responsibility list into two dense sentences. The rewrite splits this into three short active-voice sentences ("guides… one step at a time" / "You add a single IDE rule…" / "From there the server takes over: it helps the agent find a workflow, tracks the session, and walks it through the steps"). The `[IDE rule](docs/ide-setup.md)` link is preserved verbatim; the three responsibilities (discovery, session, navigation) are all retained in plainer words. The `## 🎯 Overview` heading is untouched.

### Block 3
**How-It-Works steps 2 & 3 (L23–24) — the density cliff (T1 / gaps G1, G2).** This is the highest-leverage edit. Step 2 originally packed `session token` + `get_workflow` + the dotted `techniques.workflow` bundled-under-`techniques`-and-`rules` clause + `initialActivity` into one sentence (~4 ideas). It is split into two sentences and the dotted-field clause is softened in place to "along with the techniques and rules it needs" — the exact field paths live in the already-linked `docs/api-reference.md`. Step 3 originally chained `next_activity` + `get_activity` + an em-dash `techniques.activity`+`techniques[]` clause + `get_resource` lazy-loading (~4–5 ideas). It is split into three sentences; the em-dash clause collapses to "plus the techniques that activity uses"; `get_resource` lazy-loading becomes "loads reference material a technique points to, only when it is needed". Preserved: tool names `start_session`, `get_workflow`, `next_activity`, `get_activity`, `get_resource`; `initialActivity`; the parenthetical "(steps, checkpoints, transitions)"; "session token" wording (no `session_index` introduced); the 4-step numbered structure.

### Block 4
**Architecture bullets (L33–36) — light reword (T3 / gap G5).** The four bullets defining Workflows / Activities / Techniques / Tools are reworded for plainer phrasing ("define the overall process" → "describe the whole process"; "markdown definitions of a capability" → "markdown files that describe one capability"; "the operations the agent invokes" → "the operations the agent calls"). No fact changes; the canonical term "Techniques"/"Technique" is retained; the `User Goal → Workflow → Activities → Techniques → Tools` diagram above is byte-identical.

### Block 5
**MCP Tools intro — "five"→"six" (L40) (T4 / gap G6, Q2).** The single approved factual correction. The prose said the 16 tools span "five concerns", but the table directly below has six category rows (Bootstrap, Session, Workflow/activity navigation, Checkpoint flow, Techniques+resources, Trace; 3+3+3+4+2+1 = 16). One word changes: "five"→"six". The "16" count, the `[docs/api-reference.md](docs/api-reference.md)` link, and the entire six-row table are byte-identical. This edit was gated behind the `approach-confirmed` checkpoint and approved in the plan (Q2).

### Block 6
**Quick-Start glue + Engineering intro (L108, L138, L142) — light reword (T3 / gaps G7, G8).** Three short connective prose sentences reworded to one idea each, none of them inside a code/command/JSON block:
- L108 (Setup IDE Rule): the trailing "so the bootstrap procedure stays in sync with the server" becomes a separate sentence "That way, the bootstrap procedure always stays in sync with the server."
- L138 (Execute a Workflow): "matches your request to the appropriate activity and guides you through the structured phases" → "matches your request to the right activity. It then guides you through the phases, one at a time."
- L142 (Engineering layout): "holds engineering artifacts and workflow-related assets" → "holds your engineering artifacts and the files that support your workflows."
All command/JSON/`curl` blocks, the directory-structure bullets, and every link are byte-identical.
