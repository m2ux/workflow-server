# Concerns

Each concern raised during the manual read-through of workflow technique files, numbered in the
order it was raised. Index and status live in [README.md](./README.md).

---

## 1. A tool call names no source, so a reader cannot tell where the tool comes from

**Raised against:** `meta/techniques/atlassian-operations/comment-confluence-page-footer.md`
**Applies to:** every technique whose protocol step invokes a named tool

### The concern

A protocol step reads `Call createConfluenceFooterComment { cloudId, pageId, body }`. Nothing in that
line, or anywhere else in the file, says what `createConfluenceFooterComment` is or which system
provides it. It happens to be a tool on the Atlassian Remote MCP server, and the only place that says
so is the family header `TECHNIQUE.md`, whose capability sentence mentions the Atlassian MCP server.
A reader who opens the child file on its own gets an unattributed identifier.

The reviewer's preference is a protocol designator carried on the symbol itself — something in the
shape of `mcp://createConfluenceFooterComment` — which the executing agent strips before use, and
which lets a casual reader infer the API source from the call line alone.

### Where this holds today

Four technique families call named tools, and none of them attribute the tool at the call site:

- `atlassian-operations` — 23 files, bare names such as `createConfluenceInlineComment`,
  `searchConfluenceUsingCql`, `getAccessibleAtlassianResources`
- `knowledge-base-search` — bare names such as `chunks_search`, `catalog_search`
- `workflow-engine` — bare names such as `dispatch_child`, `start_session`, `list_workflows`
- `gitnexus-operations` — `gitnexus_query`, `gitnexus_context` and similar, where the source is
  legible only because the vendor happened to prefix its own tool names

Two further families invoke shell commands rather than tools — `github-cli-protocol` writes
`gh api user --jq .login` and `cargo-operations` writes `cargo check` — and those read as commands
because a command looks like a command. Between an MCP tool and a shell invocation there is no such
cue: `start_session` and `dispatch_child` could be either, read cold.

### Open points

- Whether the designator distinguishes servers (`mcp://atlassian/...`) or merely marks the transport
  (`mcp://...`). The first attributes; the second only classifies.
- What strips it, and where that stripping is stated — a convention the agent must apply is itself a
  rule that needs a home.
- Whether the same treatment extends to the shell-backed families, so that every invocation in the
  corpus carries its channel.

---

## 2. The canon-map reproduces the canonical sources, and the copies have gone stale

**Raised against:** `examples/cursor-workspace/.claude/skills/workflow-canon/references/canon-map.md`
and `SKILL.md`

### The concern

Content that lives in a canonical source is reproduced in the skill that reads it. Every such copy is
a second home that drifts from the first, and three have already drifted — two of them in ways that
remove criteria from an audit's reach. **No content is to be duplicated from the canonical sources.**

The skill opens by forbidding this of itself, then grants an exception for "enumerates their units",
and every stale fact below sits inside that exception.

### The register

| Site | Copies from | State |
|---|---|---|
| `canon-map.md` thirteen-row family table | `grep "^## " anti-patterns.md` | Exact reproduction; the stated justification is false |
| `canon-map.md` "Thirteen units" | count of those headings | Correct today; drifts on the next family |
| `canon-map.md` "thirty numbered principles" | count of `^## ` in `design-principles.md` | Wrong — the home holds 35 |
| `canon-map.md` "Six units, by `##` section" plus six titles | `grep "^## " schema-construct-inventory.md` | Wrong — the home holds 7 sections; `## Universal obligation` is dropped |
| `canon-map.md` "header block names the authoritative schema files" | `schema-construct-inventory.md` header block | Paraphrase of the section the enumeration above excludes |
| `canon-map.md` "One unit: Reference Conventions … explicitly *not* a substitute for" | `convention-conformance.md` body | Restatement |
| `canon-map.md` anchor-ordinal / cite-by-title note | `SKILL.md`, same skill | Internal duplicate, differing examples |
| `canon-map.md` Change-surface scope section | `SKILL.md` § Audit → Scope the surface | Self-acknowledged restatement |
| `canon-map.md` file-kind routing table | thirty principle titles, family names, unit names | Titles copied; only the mapping is novel |
| `canon-map.md` `structure-backed-constraints` / Encode Constraints as Structure pairing | that catalog entry's own closing cite | The entry already states it |
| `SKILL.md` "~1700 lines" | `wc -l anti-patterns.md` | Wrong — 1974 |
| `SKILL.md` "One unit per `##` section", three rows | the homes' structure | Derivable |

### The copy that removes a rule from the walk

`## Universal obligation` is the first section of the construct inventory and carries that home's
binding rule: every piece of prose is checked against the inventory, and where a formal construct
exists it is used. The skill enumerates the inventory as six units and lists the six that follow that
section, so the rule sits outside the enumeration a walk covers. The adjacent sentence paraphrases
part of the same section, which makes it read as covered.

### The pattern already present and correct

The Guards row cites its home and copies nothing: the registry is the enumeration, each entry carries
a one-line `proves`, read it rather than assuming a roster. The four criteria-home rows are to be
written to that shape.

### What is the skill's own

The paths to the homes; the fetch mechanics; the take / do-not-take boundaries; the judgement that
the catalog's last family is a dumping ground read to its end, and that Creation Rules reaches the
surface only when the change edits the catalog. The file-kind routing *mapping* is novel information
with no canon home — the one open design question, since it either moves into the canon or the walk
covers every unit for every file kind.
