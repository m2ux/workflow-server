# Format Conventions

Literacy surface for update of `workflow-design`. Grounded in schema docs, `convention-conformance`, and live YAML from the PR worktree plus `work-package` as a sibling reference.

## YAML syntax

- **Block mappings:** `key: value`; children indent two spaces.
- **Block sequences:** `-`-prefixed items; nested maps indent under the `-`.
- **Scalars:** Unquoted when safe; quote when needed; `|-` / `|` for multi-line prose.

## Project conventions

| Concern | Convention |
|---------|------------|
| Technique files | kebab-case `.md`; frontmatter `metadata.version`; Capability / Outputs / Protocol sections |
| Field order | Capability, then Inputs/Outputs, then Protocol |
| Versions | Semantic `X.Y.Z` (bump technique version on Output/protocol edits) |
| Technique binding | Bare op inside activity-named groups; `group::op` otherwise |
| Artifacts | Declared on technique outputs (`#### artifact`); activity `artifacts[]` is server-computed |
| Guide cites | Persist/assemble lines use `…md#template` (or the guide’s named template anchor) |

## Change-relevant shapes

- Technique **Outputs** entries (`### {id}`) must match every braced product the Protocol assembles or persists.
- Persist protocol steps cite the creation guide with `#template` (same anchor style as Assemble steps).
