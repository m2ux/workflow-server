# Test Plan: Audience Attribute on Technique Output Declarations

> **ADR:** none (moderate change, no ADR gate) · **Ticket:** [#224](https://github.com/m2ux/workflow-server/issues/224) · **PR:** [#227](https://github.com/m2ux/workflow-server/pull/227)

## Overview

This test plan validates the additive `audience` attribute (`human | agent`) on technique output / `#### artifact` declarations — parsing, schema validation, delivery carry-through, and corpus lint — with backward compatibility for declarations that omit it.

Key changes to validate:
1. `OutputItemDefinitionSchema` - accepts the optional `audience` enum and rejects out-of-set values under `.strict()`.
2. `parseEntrySubsections` / `parseOutputsSection` - parse `#### audience` as an output reserved key.
3. `projectTechnique` - carries `audience` through the delivered bundle opaquely (no code change).
4. `composeActivityArtifacts` - surfaces `audience` in the get_activity artifacts contract and `_meta.artifacts`.
5. `check-audience.ts` - validates the agent-audience JSON-format convention across the corpus.

## Planned Test Cases

Source links point at the definition line of each test in the `feat/224-v4-audience-attribute` branch (commit `482332e4`).

| Test ID | Objective | Type | Source |
|---------|-----------|------|--------|
| PR227-TC-01 | Verify the loader parses `#### audience: human` onto the output entry | Unit | [technique-loader.test.ts:712](../../../../tests/technique-loader.test.ts#L712) |
| PR227-TC-02 | Verify the loader parses `#### audience: agent` onto the output entry | Unit | [technique-loader.test.ts:722](../../../../tests/technique-loader.test.ts#L722) |
| PR227-TC-03 | Verify an output with no `#### audience` still loads (audience absent, backward compatible) | Unit | [technique-loader.test.ts:743](../../../../tests/technique-loader.test.ts#L743), [schema-validation.test.ts:301](../../../../tests/schema-validation.test.ts#L301) |
| PR227-TC-04 | Verify the schema accepts `audience: 'human'` and `audience: 'agent'` | Unit | [schema-validation.test.ts:295](../../../../tests/schema-validation.test.ts#L295) |
| PR227-TC-05 | Verify the schema rejects an out-of-set `audience` value under `.strict()` | Unit | [schema-validation.test.ts:306](../../../../tests/schema-validation.test.ts#L306), [schema-validation.test.ts:313](../../../../tests/schema-validation.test.ts#L313), [technique-loader.test.ts:753](../../../../tests/technique-loader.test.ts#L753) |
| PR227-TC-06 | Verify `projectTechnique` / `projectTechniqueToYaml` preserve `audience` on a projected output | Unit | [technique-loader.test.ts:762](../../../../tests/technique-loader.test.ts#L762) |
| PR227-TC-07 | Verify `composeActivityArtifacts` carries `audience` into the artifacts contract | Unit | [compose-activity-artifacts.test.ts:39](../../../../tests/compose-activity-artifacts.test.ts#L39) |
| PR227-TC-08 | Verify get_activity surfaces `audience` in the body `{artifacts}` block and `_meta.artifacts` | Integration | [compose-activity-artifacts.test.ts:39](../../../../tests/compose-activity-artifacts.test.ts#L39) |
| PR227-TC-09 | Verify `check-audience.ts` flags an agent-audience artifact whose name violates the JSON-format convention | Unit | [audience-guard.test.ts:44](../../../../tests/audience-guard.test.ts#L44) |
| PR227-TC-10 | Verify `check-audience.ts` passes the current corpus (no new violations) | Integration | [audience-guard.test.ts:27](../../../../tests/audience-guard.test.ts#L27) |

Additional guard coverage beyond the planned matrix: [audience-guard.test.ts:56](../../../../tests/audience-guard.test.ts#L56) (JSON-named agent + markdown human artifact pass) and [audience-guard.test.ts:77](../../../../tests/audience-guard.test.ts#L77) (`{token}`-templated agent artifact with a fixed `.json` suffix).

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| Loader parses and schema-validates `audience` | Loader reads `audience`; schema accepts `human`/`agent`, rejects others | PR227-TC-01, PR227-TC-02, PR227-TC-04, PR227-TC-05 |
| Backward compatibility | Declarations without `audience` still load and validate | PR227-TC-03 |
| Projected into delivered bundle | `audience` survives projection to the worker bundle | PR227-TC-06 |
| get_activity artifacts-contract carry-through | `audience` surfaces in the artifacts contract and `_meta` | PR227-TC-07, PR227-TC-08 |
| Corpus lint coverage | A lint check validates `audience` and the corpus passes | PR227-TC-09, PR227-TC-10 |

## Running Tests

```
npm test                    # full Vitest suite (includes all PR227-TC cases above)
npm run check:audience       # standalone corpus audience guard (PR227-TC-10)
```
