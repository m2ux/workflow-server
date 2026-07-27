# Format Conventions

Literacy surface for update of `meta`. Grounded in `schemas/README.md`, `convention-conformance`, and live YAML from `meta`, `work-package`, and `workflow-design`.

## YAML syntax

- **Block mappings:** `key: value`; children indent two spaces.
- **Block sequences:** `-`-prefixed items; nested maps indent under the `-`.
- **Scalars:** Unquoted when safe; quote when the value opens with a special character (`!=`, `{`, `*`) or contains `: `; `|-` for multi-line prose.

## Project conventions

| Concern | Convention |
|---------|------------|
| Activity files | `NN-kebab-name.yaml` under `activities/`; `meta` uses `00`–`04` |
| Technique files | kebab-case `.md` under `techniques/<group>/`; container `TECHNIQUE.md` per group |
| Field order | Activity: `id`, `version`, `name`, `description`, `required`, `rules`, `steps`, `transitions`, `outcome`. Technique front-matter `metadata.version`, then `## Capability`, `## Inputs`, `## Outputs`, `## Protocol` |
| Versions | Semantic `X.Y.Z`; bump the activity/technique/workflow file that changes |
| Steps | Ordered `steps[]` with `kind:` technique / action / checkpoint / loop |
| Technique binding | `group::op` string, or `{ name, inputs, outputs }` map for deviations. `meta` writes `workflow-engine::<op>` |
| Checkpoints | Inline `kind: checkpoint` with statement `message`, `options[]` carrying `effect.setVariable` |
| Transitions | Activity-level `transitions[]` (`to` / `condition` / `isDefault`) |
| Variables | Declared in `workflow.yaml` `variables[]`: `name`, `type`, `description`, `defaultValue` — one-line description |

## Step gating — the two forms

Both are live in `meta/activities/00-discover-session.yaml` and must be used consistently with siblings.

- **`when:`** — compact expression string on the step: `when: is_resuming == false`, `when: is_monorepo == true`, `when: project_type == 'rust-substrate' && run_local_validation == true`. Used on `kind: action` and `kind: technique` steps throughout `meta` and `work-package`.
- **`condition:`** — structured object (`condition.schema.json`): `type: simple|and|or|not`, `variable`, `operator`, `value`. Required on `kind: checkpoint` steps for the server's `condition_not_met` dismissal path; `when:` on a checkpoint does not enable it.

Neither form is server-evaluated on non-checkpoint steps — the worker agent honours the gate.

## Transition authoring

- Quote string `condition.value` scalars containing special characters; leave booleans unquoted.
- `isDefault: true` marks the fallback arm; do not also attach a tautological condition to it.
- `meta` activities carry exactly one transition each (`00`→`01`→`02`→`03`), all `isDefault: true`; `04-end-workflow` has none.

## Plain technical language

- Protocol bullets state the operative action only; rationale belongs in the design specification or assumptions log.
- Description, outcome, and checkpoint `message` fields stay positive declarative present tense — statements, not questions (`statement-not-question`), no next-step narration.
- Variable descriptions are one line (`variable-description-one-line`).
