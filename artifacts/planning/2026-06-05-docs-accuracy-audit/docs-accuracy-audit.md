# Documentation & Schema Accuracy Audit

**Date:** 2026-06-05
**Scope:** every doc, schema, and code comment in the repo, validated against the technique model.

## What was done

The technique-model changes of this initiative (one technique kind with nested techniques; `::`
addressing; `####` sub-section I/O components with reserved `#### artifact`/`#### default`;
Initial/Final protocol wrapping; failure handling inline in the protocol step; the `techniques` /
`rules` / `unresolved` delivery bundle) were propagated into all documentation, schemas, and code
comments. Five read-only audit agents mapped the surface; six edit agents brought the prose docs in
line; code comments and the JSON schema were corrected by hand.

**Decision (recorded):** the workflow/activity `operations[]` reference arrays and the
`resolve_operations` tool are slated for removal. Documentation therefore describes the technique
target model and does not mention them. The code still contains them — see the cleanup flag below.

### Documentation brought to the target model

- `README.md`, `docs/api-reference.md`, `docs/architecture.md`, `docs/orchestra-specification.md`,
  `docs/resource_resolution_model.md`, `docs/workflow-fidelity.md`, `docs/state_management_model.md`,
  `docs/development.md`.
- `schemas/README.md` (technique section + schema-dependency diagram).
- `workflows/README.md`, `workflows/workflow-design/resources/README.md`,
  `workflows/workflow-design/resources/update-mode-guide.md`,
  `workflows/workflow-design/resources/design-principles.md`,
  `workflows/work-packages/README.md`, `workflows/cicd-pipeline-security-audit/README.md`,
  `workflows/meta/resources/workflow-canonical.md` (the canonical ontology resource).

### Schema

- `schemas/technique.schema.json`: removed the unreferenced `errorDefinition`, `operationDefinition`,
  `operationsDefinition`, and `toolDefinition` definitions; the `protocolDefinition` description
  states the Initial/Final wrap.
- `src/schema/technique.schema.ts`: removed the unused `ErrorDefinitionSchema`; the
  `ProtocolDefinitionSchema` and nested-technique comments state the current model.

### Code comments

- `src/loaders/markdown-technique-loader.ts`: canonical-section comment (no Errors section); frontmatter
  comment; removed a stale doc-block above `buildTechnique`.
- `src/loaders/technique-loader.ts`: `readTechnique`/`readTechniqueRaw` resolution docs reference
  `<id>.md` / `TECHNIQUE.md` and the current-workflow-then-meta order; "rule" (not "rule/error")
  comments.
- `src/tools/resource-tools.ts`: `get_technique` description (rules merged + Initial/Final wrap);
  `resolve_operations` description (returns the `techniques`/`rules`/`unresolved` bundle).
- `src/loaders/core-ops.ts`, `src/tools/workflow-tools.ts`: comments describe core technique refs and
  the declared technique refs they union.

### Confirmed accurate (no change)

`docs/checkpoint_model.md`, `docs/dispatch_model.md`, `docs/artifact_management_model.md`, `SETUP.md`,
`docs/ide-setup.md`, the condition/state/activity/workflow JSON schemas, and most workflow READMEs.

## Code cleanup — `operations[]` / `resolve_operations` machinery removed (2026-06-05)

Done. The technique bundle is produced by `resolveTechniques` + `formatTechniqueBundle` from
`techniques.primary` + `techniques.supporting[]` plus the core technique refs.

- **Content** — seven definitions declared their techniques via `operations[]`: `meta/workflow.toon`,
  the five `meta/activities/*`, and `work-package/activities/10-validate.toon`. Each `operations[]`
  was migrated into `techniques.supporting[]` (none had a `techniques:` block; `primary` is optional),
  so the same techniques remain in the bundle.
- **Code** — removed the `operations[]` reads in `workflow-tools.ts` (workflow and activity level;
  the bundle is now `techniques` refs + core techniques) and the `resolve_operations` tool in
  `resource-tools.ts` (with its now-unused imports).
- **Schema** — added `supporting` to the workflow-level techniques; removed the `operations` field and
  relaxed the required-`primary` constraint across the zod and JSON workflow and activity schemas.
- **Tests** — removed the `resolve_operations` invocation and auth-exempt entry; updated the
  activity-loader assertion for the migrated `discover-session`.

Verification: 363 pass / 2 skip; definition-lint confirms every migrated activity resolves its
techniques into the bundle.

Pre-existing, separate drift to address when convenient: the zod `TechniqueSchema` carries optional
legacy fields (`architecture`, `tools`, `flow`, `matching`, `state`, …, `interpretation`,
`resumption`) absent from `schemas/technique.schema.json`; the activity schema's `techniques`/`skills`
aliasing. Neither relates to the technique-model change.

Pre-existing, separate drift to address when convenient: the zod `TechniqueSchema` carries optional
legacy fields (`architecture`, `tools`, `flow`, `matching`, `state`, …, `interpretation`,
`resumption`) absent from `schemas/technique.schema.json`; the activity schema's `techniques`/`skills`
aliasing. Neither relates to the technique-model change.
