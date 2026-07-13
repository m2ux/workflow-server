# Structural Analysis — Cluster 3 Delivery Ledger (#189)

Producer/clearer conservation walk over the delivery-ledger state the change touches (`session.json#deliveredContent`).

## State under analysis

The only persistent state this diff writes is delivery-ledger entries (content key → hash), per agent, in the session file. The ledger is **monotonic by design** (the established B1/cluster-2 model): entries are written on full delivery and never removed — the "clear" is the session ending. So the relevant conservation question is not producer↔clearer balance but **bounded growth** and **channel isolation**.

## Producers (writes)

| Site | Keys written | Channel |
|------|--------------|---------|
| `get_technique` (resource-tools) | `technique:<id>` + `technique:<block>:<hash>` (new) | technique |
| `get_activity` eager bundle (workflow-tools) | `bundle:<ref>`, `bundle:rules:<hash>`, `activity_rules:<hash>`, `technique:<block>:<hash>` (new) | bundle / activity_rules / technique |
| `get_workflow` (workflow-tools) | `workflow_bundle:<hash>` (new) | workflow_bundle |

All three commit via a single `recordDeliveries` inside one `advanceSession` mutator per call.

## Findings

- **Bounded growth — OK.** The new key namespaces draw from a finite corpus: block hashes range over the set of distinct contract/rules block contents in a workflow (a handful per workflow), and `workflow_bundle` is one key per distinct ops-bundle content (effectively one per workflow version). No attacker-driven or per-request unbounded accumulation; growth is bounded by corpus size, identical in character to the pre-existing `bundle:rules:<hash>` / `activity_rules:<hash>` content-keyed families.
- **Channel isolation — OK.** A marker only ever references a hash recorded in its own channel. Block markers reference `technique:<block>:<hash>` (technique channel, same as the whole-technique key so both paths cross-collapse); C12 references `workflow_bundle:<hash>` (own channel, no reference to `bundle:*`). The get_activity `newDeliveries` accumulator merges block and whole-technique keys into one map, but the prefixes are disjoint so no key collision, and both commit together.
- **No producer/clearer imbalance.** There is intentionally no clearer; the monotonic model is unchanged from B1. The change introduces no new lifecycle that would require a matching reclaim.

## Verdict

No structural risk. The change extends an existing monotonic, channel-isolated ledger with two additional content-keyed namespaces, both bounded by corpus size and both honouring the never-cross-reference invariant.
