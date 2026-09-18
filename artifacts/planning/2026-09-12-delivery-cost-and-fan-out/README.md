# Delivery cost summary and the fan-out pair

#528 W5. Every activity delivery names what it resolved and what it spent.
The two fan-out ratios reported beside `bench:batch` are container-rule
reach and inherited I/O templating.

## Summary on the session

`get_activity` already wrote a log line. The same resolve-and-spend
figures now sit on the session as one `activity_delivered` event and on
the response as `_meta.delivery_cost`:

- `resolved_techniques` — distinct bound ops the producer scan read
- `provenance_passes` — steps decorated from that one scan
- `bundled_steps` — ungated steps inlined
- `spent_chars` against `eager_budget_chars`

Per-step magnitudes stay on `technique_bundled` and `resource_fetched`.
Wire size stays on `activity_dispatched`. The summary event carries no
`chars` field, so the batch budget does not count the same payload twice.

## The pair

The two things that ride along with every operation inside a container
are the two ratios:

- rules declared on a root or group, and the share that name the
  operation they arrive with
- inherited inputs and outputs, and the share the receiving protocol
  templates

Both are cross-cutting by design. Nothing gates on either figure.

Unused delivery content — a body with no tool, input, or observable
behaviour behind it — is a different measurement. W6 already budgets
fixed bootstrap content. What an activity delivers is the compiled-
delivery epic. It is not a third fan-out ratio.

## Out of scope

A threshold on either ratio. Changing what a delivery contains.
Putting the summary on `get_technique` / `get_resource` (those calls
already record `chars` and `delivery` on their own events).
