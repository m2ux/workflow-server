# Skill files against the canonical resources — SOLID audit

Applies [SOLID at the Definition Layer](https://github.com/m2ux/workflow-server/blob/main/workflows/workflow-design/resources/design-principles.md)
to every live skill file, taking that principle's own test: name every file a later extension of a
contract would force an edit to. A file that must change only to keep agreeing — a restated count, a
duplicated field list, a copied criteria set — is coupled to content it does not own, and the
citation is what survives removing the copy.

## Surface

| Set | Files | Disposition |
|---|---|---|
| `examples/cursor-workspace/.claude/skills/workflow-canon/` | `SKILL.md`, `references/canon-map.md`, `references/reporting.md` | Tracked, repo-owned — in scope |
| `.claude/skills/gitnexus/*/SKILL.md` | 6 files | Untracked local config, vendor-generated — findings recorded, remediation upstream |
| `AGENTS.md` gitnexus block | Between `<!-- gitnexus:start -->` and `<!-- gitnexus:end -->` | Generated region — regeneration owns it |
| `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/` | 74 files | Planning artifacts, exempt |

## Dependency inversion — prose depends on a copy, not on the home that owns the fact

| # | Site | Copies | State |
|---|---|---|---|
| D1 | `reporting.md` coverage obligation | Unit counts of three homes | **Two of three wrong.** Names thirteen catalog units, six inventory units, thirty principles; the homes hold 13, 7 and 35 |
| D2 | `canon-map.md` inventory enumeration | `grep "^## " schema-construct-inventory.md` | Wrong — names six of seven sections, dropping `## Universal obligation` |
| D3 | `canon-map.md` principles count | `grep -c "^## " design-principles.md` | Wrong — says thirty, the home holds 35 |
| D4 | `canon-map.md` family table | `grep "^## " anti-patterns.md` | Exact reproduction; its stated justification does not hold against the file |
| D5 | `SKILL.md` catalog size | `wc -l anti-patterns.md` | Wrong — says ~1700, the file is 1974 |
| D6 | `canon-map.md` conformance row | `convention-conformance.md` body | Restatement |
| D7 | `canon-map.md` schema-sources sentence | `schema-construct-inventory.md` header block | Paraphrases the section D2 excludes, so the exclusion reads as covered |
| D8 | `canon-map.md` structure-backed-constraints pairing | That entry's own closing cite | The entry states it |
| D9 | `gitnexus-guide` Tools Reference | The MCP tool surface | Wrong — 7 of 16 tools; omits `api_impact`, `route_map`, `shape_check`, `tool_map` and the five `group_*` tools |
| D10 | `gitnexus-guide` Graph Schema | `gitnexus://repo/{name}/schema` | Copies the resource the same file directs the reader to read first |
| D11 | `gitnexus-guide` / `gitnexus-exploring` resource tables | The MCP resource surface | Two copies, and a third in the `AGENTS.md` generated block |

**D1 is the severe one.** The coverage obligation is the gate that decides whether a walk was partial.
Built from counts, and two are low, it certifies as complete a walk that reached neither
`## Universal obligation` nor five principles. The same file forbids the device four dozen lines
later: cite entries by name, never any count of the catalog's entries.

## Single responsibility — one fact, several homes

| # | Fact | Homes |
|---|---|---|
| S1 | Unit counts per criteria home | `SKILL.md`, `canon-map.md`, `reporting.md` |
| S2 | Principle anchors embed an ordinal; cite by title | `SKILL.md`, `canon-map.md` — differing examples |
| S3 | Change-surface composition | `SKILL.md` § Audit, `canon-map.md` § Change-surface scope, which names the other as authoritative |
| S4 | Task → gitnexus skill routing | `AGENTS.md`, `gitnexus-guide/SKILL.md`, workspace `CLAUDE.md` |
| S5 | gitnexus resource URIs | `AGENTS.md`, `gitnexus-guide`, `gitnexus-exploring` |

## Open–closed — the surface an extension forces an edit to

`canon-map.md`'s file-kind routing table names thirty principle titles. Adding a principle to the
canon forces an edit here, because the fact it carries — which principles bind which file kind — is
stated in no canon home. This is the only construct in the set that holds novel information rather
than a copy, and it is the one open design decision.

## Interface segregation

Clean. Fetch-by-anchor guidance, the section-grain instruction, and the per-home take / do-not-take
boundaries each deliver the slice a consumer uses.

## The shape already correct in the set

The Guards row cites its home and copies nothing: the registry is the enumeration, each entry carries
a one-line `proves`, read it rather than assuming a roster. Every criteria-home row is written to
that shape.
