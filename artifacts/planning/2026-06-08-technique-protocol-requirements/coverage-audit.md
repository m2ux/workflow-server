# Coverage Audit — Source vs Output Spec

**Date:** 2026-06-08
**Source:** `docs/technique-protocol-specification.md` (SRC-DOC001, Mike Clay)
**Output:** `05-final-spec.md` (21 requirements: REQ-F001–F013, REQ-NF001–NF008)
**Method:** adversarial section-by-section sweep of the source's normative statements, mapped to output requirements; reverse-check that no output requirement is unsourced.

**Resolution:** all 9 gaps closed in correction pass 1 — see `03-working-spec-1.md` / `04-validation-report-1.md`. Spec now carries 30 requirements (REQ-F001–F021, REQ-NF001–NF009).

## Result

- **Captured:** 21 requirements, mapping to ~19 distinct source constraints.
- **No spurious requirements** — every output requirement traces to a source statement.
- **Missed candidates:** 9 (2 essential, 4 recommended, 3 niche).
- **Coverage:** ~70% of all candidate constraints; ~90% of the *essential* core.

## Covered (source → requirement)

§1 model → F001/F002/F003; §1 nesting → F006/F007; §2 file shapes → F006; §3.1 → F001;
§3.2 entries/members → F003; §3.2 artifact → F004; §3.2 symbol model → NF004; §3.2 case → NF001;
§3.2 naming structure → NF002/NF003/NF004; §3.3 blocks/Initial-Final → F002/F008; §3.3 step-is-action → F005;
§3.3 protocol-vars → F010; §3.3 backticking/$ → NF006; §3.4 rule-name → NF005; §4.1 rule citation → F012;
§4.2 invocation args → F011; §5 inheritance → F007; §6 wrapping → F008; §8 I/O agnostic → NF007;
§8 resource decoupling → NF008; §9 validation/unresolved → F013.

## Gaps (missed prospective candidates)

### Essential — recommend adding
- **GAP-1 — Optional inputs + `#### default` (§3.2).** An entry whose description opens with "optional"
  is `required:false` and MAY declare a `#### default`. F003 omits optional/default semantics.
  → Proposed **REQ-F014**: The system SHALL allow an input to be marked optional and to declare a default value applied when the input is not supplied.
- **GAP-2 — Rule placement at smallest containment scope (§3.4, §8).** A rule lives inline-in-step if
  step-specific, on the common container if shared by siblings, on the child if it governs only that child.
  → Proposed **REQ-F015**: The system SHALL require a rule to be declared at the smallest containment scope that covers everything it governs.

### Recommended
- **GAP-3 — Inline error handling (§3.5).** A step states its failure condition and recovery inline,
  naming any recovery technique inline.
  → Proposed **REQ-F016**: The system SHALL require a step's error handling and recovery to be stated inline in that step.
- **GAP-4 — Reference-resolution precedence (§2, §4).** An unprefixed reference resolves
  current-workflow-first, then the shared `meta` layer.
  → Proposed **REQ-F017**: The system SHALL resolve an unprefixed reference against the current workflow first and the shared meta layer second.
- **GAP-5 — Description states *what*, not sequence (§8).** Capability/description states what a construct
  is; the sequence lives in `protocol[]`.
  → Proposed **REQ-NF009**: The system SHALL require a capability or description to state what a construct is and SHALL NOT permit it to enumerate the step or activity sequence.
- **GAP-6 — Contract override precedence (§5).** A technique-local entry overrides an ancestor entry of
  the same id/name.
  → Proposed **REQ-F018**: The system SHALL give a technique-local input, output, or rule precedence over an inherited ancestor entry of the same identifier or name.

### Minor / niche — optional
- **GAP-7 — Root `TECHNIQUE` excluded from the addressable technique list (§2).**
- **GAP-8 — Addressing-path grammar; `<technique>::<group>` expands to all `<group>-*` rules (§4).**
- **GAP-9 — A symbol may be declared in both Inputs and Output (input∩output idempotent resolver) (§3.2).**

## Correctly out of scope
Server/delivery mechanism, not technique-authoring requirements: §7 delivery body/bundle internals,
`locateTechnique` resolution mechanics. Appropriately excluded.

## Process observation
This omission profile reflects a real limitation of the workflow's `analyze-source` step: extraction
completeness depends on the analyzing agent, and the `validate-specification` rubric checks *conformance*
(structure, IDs, format) not *source-coverage completeness*. A future enhancement could add a
coverage-completeness check (source-statement → requirement traceability) to the validation rubric.
