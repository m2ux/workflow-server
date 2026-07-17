# Applicable Constructs

Schema constructs for update of `workflow-design`.

| Construct | Why it applies | Reference |
|-----------|----------------|-----------|
| **Technique Output** | High finding: Protocol braces `{pattern_analysis}` with no Outputs entry | `techniques/pattern-analysis.md` · `technique.schema.json` outputs |
| **Output artifact** | Keep existing `{pattern_analysis_path}` artifact alongside the new assemble product | `#### artifact` on `pattern_analysis_path` |
| **Protocol steps** | Low finding: align persist cite anchors to `#template` without changing procedure | persist lines in listed techniques |
| **Technique version** | Bump leaf technique versions when Outputs or cite text change | frontmatter `metadata.version` |

## Write-time constraints (this change)

- **Output Economy / technique-outputs-declared** — every braced assemble product is a declared Output.
- **Cite-anchor consistency** — persist cites use `#template` (or the guide’s named template home).
- Do not invent new activities, checkpoints, or resources for this fix set.
