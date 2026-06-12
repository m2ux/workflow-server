# 02 — Context and Literacy

**Activity:** context-and-literacy · **Status:** ✅ Complete

## Authoritative references consulted

| Reference | Use |
|-----------|-----|
| `schemas/workflow.schema.json` + `schemas/README.md` | Workflow / activity / variable / mode / artifactLocations / executionModel field tables |
| `schemas/activity.schema.json` | Step, checkpoint, decision, loop, transition, artifact, action constructs |
| `schemas/condition.schema.json` | `simple` / `and` / `or` / `not` condition forms |
| `schemas/technique.schema.json` | Technique interface (capability, inputs, protocol, output, rules) |
| `docs/technique-protocol-specification.md` | Authoritative technique authoring rules (symbol model, protocol variables, addressing, backticking, inheritance) — per user instruction |
| `workflows/work-package/` (workflow.toon, 10-validate.toon, techniques/) | Closest structural analog: sequential orchestrator+worker pipeline with a `doWhile` fix-revalidate loop, validation gating, checkpoints, artifactLocations |
| `workflows/prism/` | Modular technique/resource/README layout style exemplar |

## TOON + convention literacy (confirmed)

- **Files:** `workflow.toon` · `activities/NN-name.toon` · `techniques/<id>.md` + root `techniques/TECHNIQUE.md` base contract · `resources/<id>.md` · `README.md` at root and in each subfolder (prism style).
- **TOON syntax:** `key: value`; arrays `key[N]:` then `- ` items; inline table `key[N]{f1,f2}:` + CSV rows; nested maps by indentation; quote strings containing `:`/special chars. Versions `X.Y.Z`.
- **Identifier case (two namespaces):** symbols (variables, technique input/output ids, `{$locals}`) = `snake_case` (bind by exact string match to runtime variables); names (workflow/activity/technique/resource ids, file/`::`/hyperlink targets, **rule slugs**) = `kebab-case`.
- **Naming structure (AP-60):** booleans = affirmative predicates (`validation_passed`, not `validation_status`); collections = plural item nouns (no `_list` suffix); I/O ids = qualified noun phrase, head noun last, no `-path`/representation suffix, no direction encoding.
- **Technique markdown:** frontmatter `metadata.version` → `## Capability` (one paragraph) → `## Inputs` (`### snake_id`, `*(optional)*` marker, `#### member`/`#### default`) → `## Protocol` (`### N. Title` blocks; `- ` imperative steps; `{$name}` declare-once protocol vars, `{name}` thereafter; `> ` blockquote notes for step-local constraints; `technique::op(arg: {var})` invocations in parens; `[noun](../resources/x.md#section)` resource links; all code tokens backticked) → `## Output` (`### snake_id`, `#### artifact` filename) → `## Rules` (`### kebab-name`, positive declarative assertion).
- **Contract inheritance:** root `TECHNIQUE.md` carries shared Inputs/Output/Rules (and `Initial`/`Final` protocol wrap); siblings inherit — hoist shared inputs there rather than re-declaring per technique (AP-52).

## Applicable schema constructs for `requirements-refinement`

| Construct | Planned use |
|-----------|-------------|
| Sequential activities + `initialActivity` + conditional `transitions` | setup → analyze → update → validate → finalize pipeline |
| `loop` (`doWhile`, `maxIterations: 3`) | bounded correction cycle (re-update → re-validate) |
| Conditional `transitions` (with `and`/`or` conditions) | route on validation outcome: pass → finalize; correctable & iterations remain → correct; critical/max-retries → failure report |
| `checkpoints` + `options.effect.setVariable`/`transitionTo` | confirm inputs, confirm analysis, confirm finalization/promotion, escalate on critical failure |
| `variables` (snake_case, affirmative booleans) | `transcript_path`, `target_doc_path`, `target_doc_exists`, `analysis_confirmed`, `validation_passed`, `has_correctable_issues`, `has_critical_issues`, `correction_iteration`, `max_correction_iterations`, `finalization_confirmed` |
| `artifacts` + `artifactLocations.planning` | analysis report, working SRS versions, validation verdict, final SRS, failure report (all under planning folder) |
| `actions` (`set`/`validate`/`message`) | set outcome flags, guard inputs exist, README progress |
| Techniques (markdown) + root `TECHNIQUE.md` | `analyze-transcript`, `update-specification`, `validate-specification`, `finalize-specification`; shared inputs hoisted; SRS spec protocol encoded as a resource + rules |
| `executionModel` (orchestrator + worker) | matches work-package |

`format_literacy_confirmed = true`, `schema_constructs_confirmed = true`.
