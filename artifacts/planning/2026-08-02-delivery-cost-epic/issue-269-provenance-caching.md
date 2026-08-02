# Capture: issue #269 — Provenance caching: stop reloading every workflow technique for each step on get_activity

Body verbatim as of 2 August 2026 (issue open, filed 21 July 2026). Captured because the issue's own investigation-detail folder does not exist on this branch — see the README in this folder.

---

## Summary

When the server delivers an activity, each step arrives decorated with provenance — a note, for each input the step consumes, of which earlier step produces it. Building that decoration is where the waste lives: the helper that computes it reloads essentially every technique in the workflow, and the delivery loop calls that helper once per ungated step, so a single `get_activity` or `get_technique` call can walk the entire technique catalog several times over. (An ungated step is one whose full technique text the server inlines up front — "eager bundling"; a gated step's text stays lazy, fetched on demand.)

Runtime logs from `workflow-design` and `meta` sessions confirm the split: eager bundling itself correctly scopes to the current activity, and the payloads agents receive are mostly fine. The overscoped work is all server-side resolve work, and it will worsen as workflows grow.

## What the logs show

Four sessions exhibit the same pattern:

| Session | Call | Focus | Waste pattern |
|---------|------|-------|---------------|
| `MBJPED` | `get_activity` ×2 (`bundle: full`, 200k tokens) | `retrospective` (2 ungated steps) | Full `workflow-design` catalog loaded each time |
| `MBJPED` | `get_technique` `create-completion-doc` | 1 gated step | Same full-catalog provenance scan |
| `XYVS3R` | `get_activity` (`bundle: full`, 100k tokens) | `intake-and-context` (3 ungated steps) | Catalog walked **3 times** in one call |
| `MMJTSK` / `6IZO56` | `get_activity` | meta activities | Same pattern over all nested `workflow-engine::*` / `version-control::*` techniques |

`get_activity` still completes in ~60–130 ms today, but the number of unique technique resolves per request scales as the count of all workflow techniques multiplied by the count of ungated steps.

Also observed, as a secondary matter: repeated failed `get_resource` probes for `planning-readme` under wrong workflows and path spellings, and a technique path treated as a resource — the agent underusing the `resources` map already bundled into the delivery.

## Root cause

The provenance builder (`buildProvenanceContext`, in the binding-provenance utility) does three things that compound:

1. It walks every activity and step in the workflow, not just the current activity.
2. For each bound operation it re-reads the technique file to discover which outputs that technique produces.
3. Its cache lives only inside a single provenance call — and the eager-bundling loop in `get_activity` invokes it once per ungated step, so the catalog is reloaded N times per request.

Eager bundling itself is correct: it inlines only the current activity's ungated steps, and gated steps stay lazy. The cross-activity loads are a side effect of provenance, not a bundling-budget bug.

One budget note for context: the eager budget works out as `context_tokens × 0.8 × 4`, which at 100k–200k tokens is roughly 320k–640k characters — enough that all ungated steps of the current activity almost always inline, by design.

## The fix, in stages

### Stage 1 — Cache technique output IDs once per request (highest leverage)

- Build a workflow-scoped map from each activity or technique reference to its output IDs, once per `get_activity` / `get_technique` request.
- Reuse that map across every step decoration in the request.
- **Acceptance:** a single `get_activity` on `intake-and-context` resolves each unique technique at most once; the provenance decoration output is byte-for-byte unchanged; a regression test counts resolve/load invocations.

### Stage 2 — Build provenance once per get_activity

- Stop rebuilding the producer list for every eligible step; resolve each step's position without reloading techniques.
- Can land with or after Stage 1.

### Stage 3 — Agent and protocol guidance (optional)

- Prefer `bundle: "reference"` under persistent context after the first full delivery.
- Repeat `get_activity` with `full` only after summarization or for disposable workers.
- Use the bundled `resources` map; stop probing alternate resource ID spellings.
- Document the cost of gated-step `get_technique` calls until Stages 1–2 land.

### Stage 4 — Observability (optional)

- Emit one summary log line per `get_activity`: unique techniques resolved, provenance passes, ungated steps bundled, characters spent, and the eager budget in characters.

## Out of scope

- Changing eager-budget defaults or headroom (adjacent to #248 / #232).
- Redesigning which workflow steps are gated versus ungated in the YAML.
- The agent's `inspect_session` polling chatter.

## Severity

Medium–High (performance / scale). Binding correctness is fine; the cost grows with workflow size multiplied by step count. The fix stays localized to provenance caching as long as the decoration output is preserved.

## Related

- Eager bundling design: #189 C1c (in-code comments)
- Adjacent cost/token work: #248, #232

## Investigation detail

Full record — verdict, root cause, agent call profile, timestamped log excerpts for sessions `MBJPED`, `XYVS3R`, `MMJTSK`, and `6IZO56`, and hot-path source locations:
[`.engineering/artifacts/planning/2026-07-21-technique-loading-efficiency-provenance-scan/`](.engineering/artifacts/planning/2026-07-21-technique-loading-efficiency-provenance-scan/) — see [analysis.md](.engineering/artifacts/planning/2026-07-21-technique-loading-efficiency-provenance-scan/analysis.md), [log-evidence.md](.engineering/artifacts/planning/2026-07-21-technique-loading-efficiency-provenance-scan/log-evidence.md), and [code-pointers.md](.engineering/artifacts/planning/2026-07-21-technique-loading-efficiency-provenance-scan/code-pointers.md).
