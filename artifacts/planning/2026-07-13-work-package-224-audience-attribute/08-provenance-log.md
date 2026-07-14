# Provenance Log

> Audience Attribute on Technique Output Declarations · #224 · PR [#227](https://github.com/m2ux/workflow-server/pull/227)

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| 1 | claude | claude-opus-4-8 | code-generation | repo-only | Add optional `audience` enum (`human`\|`agent`) to `OutputItemDefinitionSchema` (Zod) and the hand-maintained `schemas/technique.schema.json` |
| 2 | claude | claude-opus-4-8 | code-generation | repo-only | Loader: generalize `parseEntrySubsections` to a reserved-key set; `parseOutputsSection` lands `audience`, passed through verbatim so `.strict()` rejects bad values |
| 3 | claude | claude-opus-4-8 | code-generation | repo-only | `composeActivityArtifacts`: carry `audience` onto the artifacts-contract entry and widen the return type; flows unchanged into the body `{artifacts}` block and `_meta.artifacts` |
| 4 | claude | claude-opus-4-8 | docs | repo-only | Protocol spec §3.2: document the `#### audience` attribute, the agent-⇒-JSON on-disk convention, and an authoring-guidance subsection (decision test, per-side anti-patterns, V5 out-of-scope note) |
| 5 | claude | claude-opus-4-8 | test-writing | repo-only | Projection carry-through regression test — `audience: agent` output survives `projectTechnique`/`projectTechniqueToYaml` unchanged (no source edit to projection) |
| 6 | claude | claude-opus-4-8 | code-generation | repo-only | Standalone corpus lint `scripts/check-audience.ts` — flags any `audience: agent` output whose `#### artifact` name is not JSON; baseline-snapshotted, wired as `check:audience` + vitest guard |
| 7 | claude | claude-opus-4-8 | test-writing | repo-only | Tests: loader parse (human/agent/absent/invalid), schema enum accept/reject under `.strict()`, `composeActivityArtifacts` audience carry-through |
