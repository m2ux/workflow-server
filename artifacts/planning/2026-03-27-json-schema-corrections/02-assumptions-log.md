# WP-02 Assumptions Log

## Active Assumptions

### A-001: `additionalProperties` policy for activity and skill schemas
- **Type:** STAKEHOLDER-DEPENDENT
- **Status:** Resolved
- **Finding:** QC-061, QC-062, QC-123
- **Resolution:** STAKEHOLDER DECISION — **Option C: strict for both.** Change `additionalProperties` to `false` on activity root, skill root, and all skill sub-definitions. Stakeholder rationale: "Should be strict for both. Workflow review should catch non-compliance." This enforces schema-as-contract discipline across all schemas uniformly.
- **Resolved at:** Activity 5 (implement) — checkpoint resolution from user

### A-002: Condition `value` type expansion scope
- **Type:** INFERRED
- **Status:** Resolved
- **Finding:** QC-068
- **Assumption:** Expanding condition `simple.value` to include `array` and `object` types is safe because the runtime condition evaluator already handles structural equality comparison for these types.
- **Resolution:** REJECTED. The runtime condition evaluator (`src/schema/condition.schema.ts:evaluateSimpleCondition`) uses strict equality (`===`) for `==` and `!=` operators. Arrays and objects compared with `===` only match by reference, never by value. Expanding the schema to accept these types would create a false promise. Instead, document the exclusion rationale in the schema description.
- **Resolved at:** Activity 4 (assumptions-review)

### A-003: `stateVersion` upper bound
- **Type:** INFERRED
- **Status:** Resolved
- **Finding:** QC-125
- **Assumption:** A reasonable upper bound for `stateVersion` is sufficient (e.g., `maximum: 1000`).
- **Resolution:** ACCEPTED. `stateVersion` is a schema migration version number, not a per-save counter. Practical systems rarely exceed single-digit schema versions. A bound of 1000 is effectively infinite for real use while still preventing absurd values from accidental input.
- **Resolved at:** Activity 4 (assumptions-review)

### A-004: `rules` type reconciliation approach
- **Type:** INFERRED
- **Status:** Resolved
- **Finding:** QC-069, QC-127
- **Assumption:** The correct resolution for the `rules` naming collision is to keep both forms and differentiate by schema context.
- **Resolution:** ACCEPTED. Both forms serve legitimate but different purposes. Workflow/activity `rules` are ordered imperative directives (agent must follow them in order), while skill `rules` are named domain constraints (keyed for lookup). Renaming either would be a breaking change. The fix is to add explicit cross-reference documentation to each `rules` description so the type difference is discoverable.
- **Resolved at:** Activity 4 (assumptions-review)

### A-005: Relative `$ref` resolution is validator-dependent
- **Type:** INFERRED
- **Status:** Resolved
- **Finding:** QC-066
- **Assumption:** Adding `$id` to make `$ref` resolution explicit is safe and improves portability.
- **Resolution:** ACCEPTED. Adding `$id` with the bare filename (e.g., `"$id": "condition.schema.json"`) makes the resolution base explicit without changing the effective behavior for validators that already resolve relative to file location. This is the recommended approach per JSON Schema draft-07 spec. The runtime Zod schemas handle their own validation independently, so JSON Schema `$id` additions carry no runtime risk.
- **Resolved at:** Activity 4 (assumptions-review)

## Resolved Assumptions

- **A-001:** `additionalProperties` policy — Option C: strict (`false`) for both activity and skill (stakeholder decision)
- **A-002:** Condition value types — do NOT expand to array/object (runtime uses `===`)
- **A-003:** stateVersion bound — `maximum: 1000` accepted
- **A-004:** Rules type reconciliation — document-only fix, keep both forms
- **A-005:** `$id` addition — accepted, low risk
