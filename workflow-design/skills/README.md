# Workflow Design Skills

> Part of the [Workflow Design Workflow](../README.md)

## Skills (2 workflow-specific)

The workflow-design workflow provides 2 skills. The primary skill (`workflow-design`) encodes the 14 design principles as an executable protocol. The supporting skill (`toon-authoring`) provides TOON format rules and validation patterns.

| # | Skill ID | Capability | Used By |
|---|----------|------------|---------|
| 00 | `workflow-design` | Design and draft workflow definitions that maximize schema expressiveness | [All activities](../activities/README.md) (primary) |
| 01 | `toon-authoring` | Author syntactically valid TOON files that pass schema validation | [Context and Literacy](../activities/README.md#02-context-and-literacy), [Content Drafting](../activities/README.md#07-content-drafting), [Validate and Commit](../activities/README.md#09-validate-and-commit) (supporting) |

> The universal skills `orchestrate-workflow` and `execute-activity` from [meta/skills/](../../meta/skills/) apply to this workflow's execution model.

---

### Skill Protocol: `workflow-design` (00)

Primary skill governing the entire workflow design process. Encodes the 14 design principles as an 8-phase protocol with 13 named rules. Declares inputs (user description, target workflow ID), outputs (complete workflow file set), and error recovery patterns.

**Protocol phases:**

| Phase | Steps | Purpose |
|-------|-------|---------|
| `intake` | 3 | Accept description, classify operation, set mode |
| `context-loading` | 5 | Load schemas, survey workflows, confirm format literacy |
| `elicitation` | 3 | Elicit design dimensions one at a time with per-question checkpoints |
| `pattern-analysis` | 2 | Extract patterns from 2+ reference workflows |
| `scope-definition` | 3 | Enumerate all files, verify worktree, confirm manifest |
| `content-drafting` | 4 | Draft files in order with per-file approach and validation |
| `quality-review` | 3 | Expressiveness, conformance, and rule-to-structure audits |
| `validation` | 3 | Schema validation, scope verification, commit |

**Rules (13):**

| Rule ID | Rule |
|---------|------|
| `formal-over-informal` | Use formal schema constructs wherever one exists; prose only for description/problem/recognition |
| `convention-first` | Search for existing naming conventions before introducing new patterns |
| `modular-always` | workflow.toon defines metadata and references only; content lives in separate files |
| `schema-immutable` | Never modify schemas during workflow creation |
| `one-question-at-a-time` | Each elicitation question is a separate checkpoint |
| `plan-before-act` | Present approach and get confirmation before drafting each file |
| `structural-enforcement` | Critical constraints must be backed by checkpoints, conditions, or validate actions |
| `non-destructive` | For updates, compare new content against existing and flag removals |
| `corrections-persist` | Record user corrections and verify compliance at every subsequent checkpoint |
| `format-literacy` | Verify TOON format comprehension by reading existing files before drafting |
| `scope-completeness` | Enumerate all files before starting and re-verify after completion |
| `no-speculative-execution` | Never execute changes to see how they look |
| `defense-in-depth` | For highest-severity constraints, use multiple enforcement layers |

**Error recovery:**

| Error | Recovery |
|-------|----------|
| `schema_validation_failure` | Read error, identify non-conforming field, fix content, re-validate |
| `format_error` | Read existing valid TOON file of same type, compare syntax, rewrite |
| `convention_divergence` | Compare against reference workflows, identify divergence, align |
| `missing_construct` | Check schema construct inventory (resource 01), replace prose with formal construct |

---

### Skill Protocol: `toon-authoring` (01)

Supporting skill for TOON file creation. Provides format rules and validation patterns to ensure syntactically valid TOON output.

**Protocol phases:**

| Phase | Steps | Purpose |
|-------|-------|---------|
| `read-reference` | 3 | Read existing valid TOON file, note syntax patterns, read schema documentation |
| `plan-content` | 3 | Identify schema fields, map content to TOON syntax, cross-check properties |
| `draft-content` | 3 | Write file following TOON syntax rules exactly |
| `validate` | 3 | Check against schema, run validator script, fix errors |

**Rules (8):**

| Rule ID | Rule |
|---------|------|
| `no-json-syntax` | No curly braces for objects, no square brackets for arrays, no commas between items |
| `no-yaml-nesting` | TOON is not YAML — no anchors, no flow sequences |
| `array-declaration` | Declare arrays with `key[N]` where N is the item count |
| `colon-quoting` | String values containing a colon must be wrapped in double quotes |
| `inline-objects` | Use `key[N]{field1,field2}` shorthand for simple tabular data |
| `version-format` | Always use semantic versioning `X.Y.Z` |
| `field-ordering` | Follow field ordering from existing files of the same type |
| `schema-reference` | workflow.toon files should include a `$schema` field |
