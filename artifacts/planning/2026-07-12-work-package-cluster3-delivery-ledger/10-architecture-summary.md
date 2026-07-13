# Architecture Summary — Cluster 3 Delivery Ledger (#189)

## What changed, in one paragraph

The workflow-server already had a "reference-not-repeat" delivery ledger (B1): under `context_mode: "persistent"`, a payload whose content hash matches one already delivered to this agent is replaced by a short `{ delivery: "unchanged", content_hash }` marker instead of being resent. This change extends that ledger to two finer granularities. **C2** dedups the *shared blocks* of a composed technique — the contract-inherited `inherited_inputs` / `inherited_outputs` and merged `rules`, which are identical across most techniques of a workflow — so a not-yet-seen technique whose contract was already delivered by a sibling gets those blocks as markers while its own core stays full. **C12** brings `get_workflow`'s orchestrator ops bundle into the ledger under its own key, so a persistent-mode resume collapses the whole bundle to one marker.

## Shape

- **One new helper**, `dedupTechniqueBlocks(projected, state, newDeliveries)` in `src/utils/delivery.ts`, operating on the projected technique record (not the typed object) so marker substitution is friction-free. Two call sites: `get_technique` (resource-tools.ts) and the `get_activity` eager-bundle path (workflow-tools.ts).
- **C12** is a self-contained block in `get_workflow` (workflow-tools.ts): content-key the ops bundle, collapse on a ledger hit, commit the key in the same `advanceSession` mutator.
- **Content-keyed channels.** New keys (`technique:<block>:<hash>`, `workflow_bundle:<hash>`) are namespaced per delivery channel; a marker only ever references content its own channel delivered. Content-keying means an annotated or changed block simply hashes differently and delivers full — no invalidation logic, no staleness.

## Properties

- **Additive, no schema change.** Delivery-time transform after composition/validation/provenance; the schema and `projectTechnique`'s typed input never see a marker.
- **Fresh/default sessions and dispatched workers are byte-for-byte unchanged** — dedup only runs under reference delivery.
- **Full-content escapes preserved:** `get_technique { full: true }` / `get_activity { bundle: "full" }` re-deliver every block.
- **Risk: LOW.** Same failure mode as B1 (a summarized-away block is recovered via the full escape). Ledger growth is monotonic but bounded by the finite corpus of distinct contract blocks and ops bundles.

## Stakeholder takeaway

A pure token-efficiency optimisation for single-agent (persistent) sessions: less repeated boilerplate in technique and workflow payloads across a walk, with no behavioural change for the default disposable-worker topology and a built-in recovery path if a context drops content.
