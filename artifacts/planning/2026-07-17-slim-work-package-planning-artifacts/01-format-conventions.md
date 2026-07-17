# Format Conventions

Literacy surface for updating `work-package` planning-artifact guidance. Grounded in schema docs, `convention-conformance`, and live YAML from `work-package` / `workflow-design`.

## YAML syntax

- **Block mappings:** `key: value`; children indent two spaces.
- **Block sequences:** `-`-prefixed items; nested maps indent under the `-`.
- **Scalars:** Unquoted when safe; quote when needed; `|-` / `|` for multi-line prose.

## Project conventions

| Concern | Convention |
|---------|------------|
| Activity files | `NN-kebab-name.yaml` under `activities/` |
| Technique / resource files | kebab-case `.md`; container `TECHNIQUE.md` for groups |
| Field order | `id`, `version`, `name`/`title`, `description` early |
| Versions | Semantic `X.Y.Z` |
| Steps | Ordered `steps[]` with `kind:` technique / action / checkpoint / loop |
| Technique binding | Bare op inside activity-named groups; `group::op` otherwise |
| Checkpoints | Inline `kind: checkpoint` with statement `message`, `options[]`, effects |
| Transitions | Activity-level `transitions[]` (`to` / `condition` / `isDefault`) |
| Artifacts | Declared on technique outputs; activity `artifacts[]` is server-computed |
| Artifact links | `[label]({path_variable})` in checkpoint/action messages |

## Update-relevant shapes

- Planning artifacts are decision surfaces: short, salient, plain language; tables OK when dense.
- Technique persist steps define what lands in the planning folder; keep protocols from prescribing sprawling dumps.
- Checkpoint messages name the decision subject and link the one (or few) artifacts needed to choose.
- README is an index: summary + links — no restatement of facts that live in numbered artifacts.
