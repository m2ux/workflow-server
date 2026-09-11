---
metadata:
  version: 1.0.0
---

## Capability

Build an ordered keyed collection from dispatched worker outputs and a completeness manifest against the expected work-unit (or brief) ids.

## Inputs

### dispatched_results

Array of `{ id, result }` from the prior dispatch step (or equivalent), in input order.

### expected_ids

Ordered expectation list. Each entry is either a string id or an object with an `id` field (e.g. `{work_units}` or `{worker_briefs}` bound by name). Objects contribute their `.id`.

## Outputs

### gathered_results

Object with:

#### items

Ordered array of `{ id, result }` aligned to normalised expectation order. Missing ids appear with `result: null`.

#### dispatch_manifest

Per-id table: `id`, `dispatched` (boolean), `returned` (boolean), `status` (`ok` | `missing` | `empty`).

#### completeness

`complete` when every expected id has a non-empty return; otherwise `incomplete`.

## Protocol

1. Normalise `{expected_ids}` to an ordered id list (string as-is; object → `.id`).
2. Index `{dispatched_results}` by `id`.
3. For each normalised id, append an `items` entry and a manifest row: present non-empty → `ok`; present empty → `empty`; absent → `missing` with `result: null`.
4. Set `{gathered_results.completeness}` to `complete` only when every row is `ok`.
5. Do not merge item payloads into parent bag scalars — combination is [synthesise-results](./synthesise-results.md)'s job.
