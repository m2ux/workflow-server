# Schema Expressiveness Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** expressiveness
**Target:** `meta` v5.9.0

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Critical | Definedness gate written as a `null` value comparison instead of the `exists` / `notExists` existence operators | `activities/00-discover-session.yaml` — `record-match.when` (L53), `record-no-match.when` (L85) | Replace both inline `when` strings with structured `condition` blocks: `operator: exists` on `record-match`, `operator: notExists` on `record-no-match` |

**Finding count:** 1 · **Disposition:** fixed — see [verified findings § Resolution](08-verified-findings.md#resolution). Re-audit returned 0.

## Notes

- **F-1 before/after.** Before: `when: matched_session != null` and `when: matched_session == null`. After:

  ```yaml
  # record-match
  condition:
    type: simple
    variable: matched_session
    operator: exists
  # record-no-match
  condition:
    type: simple
    variable: matched_session
    operator: notExists
  ```

- **Construct mapping.** [schema-construct-inventory](../../../../workflows/workflow-design/resources/schema-construct-inventory.md) maps "If the variable is defined" to `operator: "exists"` / `"notExists"`. A `!= null` / `== null` comparison is the informal stand-in.
- **Why Critical.** On the new fast path (`resume_intent_requested == false`) the three search steps are gated off, so `matched_session` is never produced — it is *undefined*, not null. Under the engine's simple-condition semantics `undefined !== null` is true and `undefined === null` is false, so `record-match` fires and `record-no-match` does not: `has_saved_state` is set true and `saved_planning_slug` is bound to an unresolvable `{matched_session.planning_slug}`, surfacing the `resume-session` checkpoint on exactly the fresh-start requests this change exists to fast-path. `notExists` is defined to cover undefined *and* null, so the formal construct is also the correct one.
- **Convention support.** No `when` gate or condition anywhere in the workflows library compares against `null`; all 19 definedness gates use structured `exists` / `notExists`. Existence is not expressible in the documented inline-`when` grammar, so the structured `condition` form is required here despite the schema's general "prefer `when`" note.
