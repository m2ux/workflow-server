# Format Conventions

Literacy surface for update of `work-package`. Grounded in the five JSON schemas, `schemas/README.md`, `convention-conformance`, and live markdown from `work-package`, `meta`, and `ponytail`. Scope note: every edit this session makes lands in technique `.md` files, so rows about activity/workflow YAML bodies are dropped.

## YAML syntax

- **Technique frontmatter:** `---`, `metadata:`, two-space `version: X.Y.Z`, `---`. `metadata.version` is the *only* permitted key — any sibling key fails the template guard.
- **Scalars:** unquoted when safe; `|-` for multi-line prose. No block sequences or mappings change in this update.

## Project conventions

| Concern | Convention |
|---------|------------|
| Technique files | kebab-case `.md` under `techniques/`; container `TECHNIQUE.md` for groups |
| Technique H2 set | Exactly Capability, Inputs, Outputs, Protocol, Rules — each at most once, **in that order (Outputs before Protocol)** |
| H1 | None. Technique files carry no H1 title |
| I/O entry ids | `### <id>`, snake_case (camelCase only to mirror an external tool param) |
| Rule names | `### <name>`, kebab-case, optionally dot-grouped |
| Designators | `{id}`, `{id}.field`, `{$local}` — always inside a **single** backtick span, never fragmented |
| Protocol locals | Declare once as `{$name}` at the producing step; read as bare `{name}`; the bind must textually precede every read |
| Optionality | Prose only — a leading `*(optional)*`. There is **no** engine-enforced `required` flag on an input |
| Defaults | `#### default` nested under the input's `###` |
| Artifacts | `#### artifact` nested under the output's `###`; never a filename in Protocol |
| Outputs key | `outputs` (plural). `schemas/README.md` still says `output` — stale; trust the schema |
| Versions | Semantic `X.Y.Z` |

## Placeholder resolution — what counts as a producer

Static provenance resolves each own input in strict precedence: step-binding value → prior step output positioned earlier → declared workflow variable → later-positioned producer → declared `default` or `*(optional)*` marking → else `UNRESOLVED`. Session binding is **exact string match** against the name-keyed variable bag, so a token whose spelling differs from a declared id can never bind, whatever its case.

Two defect classes follow: an **unbound local** (a `{name}` read that is neither declared I/O, nor an ambient activity input, nor bound by a `{$name}`) and a **dead binding** (`{$name}` never read). Both are agent-audited, not machine-enforced — no server or script implements the resolvability check.

## Plain technical language

- Protocol bullets state the operative action only; trailing rationale belongs in design principles.
- Inputs/Outputs descriptions state what the value **is** — meaning, shape, allowed values, emptiness — never how it is produced, resolved, or fallen back to.
- Description, outcome, and message fields stay positive declarative present tense with no buried procedure.

## Change-relevant shapes

- Edits land in technique `## Inputs` descriptions and `## Protocol` prose only.
- `## Transition authoring` is deliberately omitted: this update changes no `transitions[]`, `decisions[]`, activity YAML, or checkpoint shapes.
- Guard codes this change surface can realistically trip: `section-order`, `entry-id-casing`, `sigil-casing`, `frontmatter-extra-key`, `version-missing`.
