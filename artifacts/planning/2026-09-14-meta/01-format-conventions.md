# Format Conventions

Literacy surface for update of `requirements-refinement`. Grounded in schema docs, `convention-conformance`, and live YAML from `requirements-refinement`, `work-package`, and `plain-language`.

## YAML syntax

- **Block mappings:** `key: value`; children indent two spaces.
- **Block sequences:** `-`-prefixed items; nested maps indent under the `-`.
- **Scalars:** Unquoted when safe; quote when needed; `|-` / `|` for multi-line prose.

## Project conventions

| Concern | Convention |
|---------|------------|
| Activity files | `NN-kebab-name.yaml` under `activities/` (this target keeps the `02` gap) |
| Technique / resource files | kebab-case `.md`; container `TECHNIQUE.md` for groups |
| Field order | `id`, `version`, `name`/`title`, `description` early |
| Versions | Semantic `X.Y.Z` |
| Steps | Ordered `steps[]` with `kind:` technique / action / checkpoint / loop |
| Technique binding | Bare op inside activity-named groups; `group::op` otherwise |
| Checkpoints | Inline `kind: checkpoint` with statement `message`, `options[]`, effects |
| Routing | Activity-level `exits[]` (`id` / `when` / `isDefault` / `immediate`), bound in `graph` |
| Artifacts | Declared on technique outputs; activity `artifacts[]` is server-computed |
| Artifact links | `[label]({path_variable})` in checkpoint/action messages |

## Change-relevant shapes

- **readme-seed resource:** Classifier, Links defaults, Progress inventory (five columns), Row ownership keyed by activity `artifactPrefix`, Mode exclusion map on `{operation_type}`.
- **create-readme bind:** `seed_profile` names the workflow-local readme-seed; Progress body is spliced as authored; update mode flips Post-update review from cancelled/N/A to pending.
- **Progress Item links:** minted `{prefix}-{bare_filename}` for activity-owned artifacts; unprefixed for cross-activity registers. Agent-audience artifacts get no Progress row.
- **Canon review of existing YAML:** statement-form checkpoint messages; `setVariable` / `exit` effects on options; no procedure in I/O contracts; positive present tense in descriptions.

## Transition authoring

- Quote string `condition.value` scalars that contain special characters; prefer plain unquoted booleans/numbers.
- Use `isDefault: true` for the fallback arm; do not also attach a tautological variable condition on that same arm.
- Non-default arms carry explicit `condition` objects; keep `to` ids reachable in the activity graph.

## Plain technical language

- Protocol bullets state the operative action only — trim trailing rationale clauses that belong in design principles or assumptions logs.
- Description / outcome / message fields stay positive declarative present tense; no buried procedure.
