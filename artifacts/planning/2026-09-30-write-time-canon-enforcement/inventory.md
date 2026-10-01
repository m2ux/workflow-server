# Inventory

Evidence for the [planning record](README.md). Corpus at `workflows` `893e8a5e`, engine at `main` `2a7cd4be`.

## Canon size

| Measure | Value | Command |
| --- | ---: | --- |
| Anti-pattern entries | 173 | `grep -c "^### " anti-patterns.md` |
| Anti-pattern families, Creation Rules included | 13 | `grep -c "^## " anti-patterns.md` |
| Design principles | 47 | `grep -c "^## " design-principles.md` |
| Convention sections | 1 | `grep -c "^## " convention-conformance.md` |
| Words across the three homes | 24,776 | `wc -w anti-patterns.md design-principles.md convention-conformance.md` |

The #970 audit header states the same total: 221 of 221 units.

## Audit rounds

The #970 record, [2026-09-29-canon-audit-corpus-970](../2026-09-29-canon-audit-corpus-970/), holds one walk file per lane and round.

| Measure | Value | Command |
| --- | ---: | --- |
| Walk files (six lanes A–F × four rounds) | 24 | `ls … \| grep -c "^walk"` |
| Surface list, first round | 57 lines | `grep -c "" surface.txt` |
| Fix surface | 40 lines | `grep -c "" fix-surface.txt` |
| Residual surface | 90 lines | `grep -c "" res-surface.txt` |
| Round-four surface | 82 lines | `grep -c "" r4-surface.txt` |

## Guards

| Measure | Value | Command |
| --- | ---: | --- |
| Corpus guards, all passing | 50 | `npx tsx guards/check-all.ts --corpus-only --root <corpus>` |
| Guard time, parallel | 6.4 s | the same run's summary line |
| Wall time | 7.0 s | `/usr/bin/time` over the same run |

`check-all.ts` accepts `--root`, `--only`, `--corpus-only` and `--serving-only`; nothing selects guards by file kind.

## Id authorities

- **Generated schemas.**
  `schemas/` holds workflow, activity, routine, technique, condition and session-file JSON schemas, generated from the Zod schemas in `src/schema/`.
- **Annotated fields.**
  `schemas/enforcement.json` keys 92 annotated fields as `<schema>.<path>`, e.g. `workflow.rules.universal`, `workflow.techniques.activity` (`grep -c "\"owner\"" schemas/enforcement.json`).
- **Technique sections.**
  The markdown technique loader parses Capability, Inputs, Protocol, Outputs and Rules into technique schema fields, and rejects a non-canonical interface heading.
- **No schema.**  Resources and READMEs.

## Hook surface

- **Claude Code.**
  PostToolUse hooks filter by tool name through `matcher` and receive the tool input, `file_path` included, as JSON on stdin. Exit code 2 returns stderr to the agent. A skill's frontmatter `hooks` registers its hooks when the skill is invoked, and they run for the rest of the session ([hooks in skills](https://code.claude.com/docs/en/hooks)). PostToolUse exit 2 shows stderr to the agent and cannot block, since the tool already ran.
- **Cursor.**  Reads only standard skill frontmatter; its hooks use a separate format.
- **Workspace.**  Existing hooks live in `hooks/`, registered through `.claude/settings.template.json`.
