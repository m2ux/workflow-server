# Ponytail Resources

> Part of the [Ponytail Lean-Coding Workflow](../README.md)

Four single-source reference files holding the discipline the techniques apply: the ladder and its safety floor, the over-engineering taxonomy, the marker convention, and the honesty boundary on reporting. Each resource owns its subject once; the techniques link into it by `#section` anchor rather than restating it.

The authoritative content lives in each `.md` file and is served by `get_resource`. This file is the catalog — what each resource owns.

---

## Resource Catalog

| Resource | Owns | Anchors |
|----------|------|---------|
| [the-ladder.md](the-ladder.md) | The understand-first trace, the seven rungs, and the non-negotiable safety floor | `#understand-first`, `#rungs`, `#safety-floor` |
| [review-taxonomy.md](review-taxonomy.md) | The five over-engineering tags, the one-line finding format, and the net-savings scoreboard | `#tags` |
| [ponytail-marker-convention.md](ponytail-marker-convention.md) | The `ponytail: <ceiling>, add when <trigger>` inline-comment convention and the `no-trigger` flag | `#convention`, `#no-trigger` |
| [honesty-boundary.md](honesty-boundary.md) | The gain-reporting rule — benchmark medians only, never a fabricated per-repo figure | `#rule` |

---

## What Each Resource Owns

### the-ladder.md

The core discipline. `#understand-first` defines reading and tracing the real end-to-end flow before a rung is chosen. `#rungs` lists the seven rungs from laziest down — does-it-need-to-exist, reuse, stdlib, native, installed dependency, one line, minimum code that works — with the rule to take the higher rung when two both work. `#safety-floor` lists the obligations no rung may climb past: understanding, validation at trust boundaries, error handling, security, accessibility, calibration, anything requested, and one runnable assert-based check.

### review-taxonomy.md

The vocabulary of an over-engineering review. `#tags` defines `delete`, `stdlib`, `native`, `yagni`, and `shrink`, each with a one-line definition and example, then specifies the `L<line>: <tag> <what>. <replacement>.` finding format and the `net: -<N> lines possible.` / `Lean already. Ship.` scoreboard.

### ponytail-marker-convention.md

How a deliberate simplification is recorded so it is harvestable. `#convention` defines the `ponytail: <ceiling>, add when <upgrade-trigger>` inline-comment form and the greppable token. `#no-trigger` defines the flag for a marker that records a ceiling but no exit — debt that rots into "never."

### honesty-boundary.md

The reporting constraint. `#rule` states that gain reporting cites benchmark medians for each class of cut and never fabricates a per-repo savings figure, because the unbuilt version was never written — the debt-ledger row count is the only genuine per-repo number.

---

## Cross-Workflow Access

Any workflow can load a ponytail resource without depending on the workflow's activities. Callers **must** use the owning-workflow qualifier — bare ids and relative `../resources/…` paths resolve only inside a native `ponytail` session, not when techniques are dispatched from `work-package` or another foreign context:

```
get_resource({ session_index, resource_id: "ponytail/the-ladder" })                 # The ladder + safety floor
get_resource({ session_index, resource_id: "ponytail/review-taxonomy" })             # Over-engineering tags
get_resource({ session_index, resource_id: "ponytail/ponytail-marker-convention" })  # Marker convention
get_resource({ session_index, resource_id: "ponytail/honesty-boundary" })            # Gain-reporting rule
```

A `#section` suffix narrows the load to one anchor, e.g. `ponytail/the-ladder#rungs`. Technique markdown links that agents follow for `get_resource` use the same `ponytail/<id>#section` form.
