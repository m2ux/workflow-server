# Format Conventions

Literacy surface for the update of `requirements-refinement`. Grounded in the five schemas, `schemas/README.md`, `convention-conformance`, and live YAML from `prism-evaluate`, `codebase-wiki`, and `work-packages`.

## YAML syntax

- **Block mappings:** `key: value`; children indent two spaces.
- **Block sequences:** `-`-prefixed items; nested maps indent under the `-`.
- **Scalars:** unquoted when safe; quote when the value opens with `{` or contains `:`; `|-` for multi-line prose.

## Project conventions

| Concern | Convention |
|---------|------------|
| Activity files | `NN-kebab-name.yaml` under `activities/`; prefix is filename-only, `id` is the unnumbered slug. Numbering gaps are tolerated repo-wide |
| Activity root order | `id`, `version`, `name`, `description`, `steps`, `transitions`, `outcome` |
| Technique files | kebab-case `.md`; 4-line `metadata: version:` frontmatter, so `## Capability` lands at line 6 |
| Technique section order | Capability → Inputs → Outputs → Protocol → Rules (each optional, never reordered); container `TECHNIQUE.md` omits Protocol |
| I/O declarations | `### snake_case_id` headings; `#### artifact` for produced files, `#### default` for input defaults |
| Rules headings | `### kebab-case-rule-id` plus a prose paragraph |
| Versions | Semantic `X.Y.Z` |
| Steps | Ordered `steps[]`; every step carries `kind:` technique / action / checkpoint / loop |
| Step field purity | A bound step carries `kind`, `id`, `technique`, plus structural `actions` / gate / `required: false` — the schema admits no `description` or `name` |
| Step gating | Structured `condition:` object, or the inline `when:` string. Both are live; `condition` is required on a checkpoint for `condition_not_met` dismissal |
| Checkpoints | Inline `kind: checkpoint` with statement `message`, `options[]`, effects; `blocking` defaults to true |
| Transitions | Activity-level `transitions[]` (`to` / `condition` / `isDefault`), last arm `isDefault: true` |
| Variable names | Qualified `snake_case`, two words minimum (schema pattern), booleans as affirmative predicates |
| Activity `rules:` | Absent — one instance repo-wide; constraints live in step order, gates, and bound techniques |
| Workflow `rules:` | Buckets `workflow` (orchestrator) / `activity` (worker) / `universal` (both); `fragments.rules` refs available for shared texts |
| Artifacts | Declared on technique outputs as `#### artifact`; activity `artifacts[]` is server-computed and absent from the activity schema |
| Artifact links | `[label]({path_variable})` in checkpoint and action `message` fields — the dominant repo form |

## Transition authoring

- Quote string `condition.value` scalars carrying special characters; leave booleans and numbers plain.
- Use `isDefault: true` for the fallback arm without also attaching a tautological condition to it.
- Non-default arms carry explicit `condition` objects; every `to` id stays reachable in the activity graph.
- A retry limit compared in a transition condition reads from the declared limit variable rather than a repeated literal.

## Plain technical language

- Protocol bullets state the operative action only; rationale belongs in planning artifacts.
- `description`, `outcome`, and `message` fields stay positive declarative present tense with no buried procedure.
- Checkpoint `message` is a statement of its subject; the decision space lives in `options[]` labels.

## Change-relevant shapes

- Checkpoint `message` / `options[].effect` shapes, and `action: message` artifact links.
- Correction-cycle expression: transition cycle versus `kind: loop`, with the iteration counter's producing step and the limit variable.
- Technique `## Protocol` phase headings (`### N. Title`) and I/O contract purity.
