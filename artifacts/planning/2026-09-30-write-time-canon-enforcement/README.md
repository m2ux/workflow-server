# Write-time canon enforcement

Planning record for an initiative that makes a definition change comply with the canon when it is written, so an audit that fixes its own findings finishes in one pass. Evidence is in [inventory.md](inventory.md).

## Problem

Canon audits loop: fixes are written without the canon in view, so each fix round introduces findings the next audit must catch.

- **Fix rounds repeat.**
  The #970 corpus audit ran four walk rounds over six lanes, and its surface list grew from 57 to 90 lines as fixes landed.
- **The write-time walk costs as much as an audit.**
  The canon holds 221 units in about 25,000 words. A fixer that must walk every unit binding a file kind before writing skips it, and applies only the entry its finding names.
- **Guards run only when invoked.**
  50 corpus guards run in 6.4 s, yet a guard-detectable defect written mid-pass survives until the next audit runs them.
- **Applicability is implicit.**
  A unit binds until its own prose excludes the file kind, so nothing lists which units apply to a given construct.

## Goal

A definition change complies with the canon when it is written, so an audit that fixes its own findings finishes in one pass.

- **G1  Fix rounds end.**
  An audit pass that fixes its findings reports no finding its own fixes introduced, and needs no follow-up round for them.
- **G2  Guard defects surface at the edit.**
  An agent that writes a guard-detectable defect into a corpus definition is told at that edit, before it moves on.
- **G3  Relevant units are listable.**
  Before writing, an agent can list the canon units that apply to the construct it writes, without reading the whole canon.
- **G4  Every unit declares its reach.**
  Every canon unit states the constructs it applies to, as ids a guard checks against the schemas; a missing, unknown or stale id fails.
- **G5  The write-time walk uses the list.**
  The Author walk loads only the units listed for the constructs a draft writes, and a full Audit still walks every unit.

Status: **awaiting the user's confirmation of G1–G5.**

## Design

| Epic | Delivers | Goal |
| --- | --- | --- |
| E00 Fix Convergence | Author checks only the lines a pass wrote, closes `fix` findings in the pass, stops on oscillation | G1 |
| E01 Edit-time Guard Hook | A PostToolUse hook runs the corpus guards on each corpus definition edit, failing on branch-introduced failures | G2 |
| E02 Fires-on Ids | The id scheme in the anti-patterns Creation Rules, and a guard failing on missing, unknown or stale ids | G4 |
| E03 Anti-pattern Declarations | A Fires-on line in each anti-pattern entry | G4 |
| E04 Principle Declarations | A Fires-on line in each principle and the conventions section | G4 |
| E05 Construct Index | A command listing units per construct; canon-map File kinds and Author steps 5–6 use it | G3, G5 |

- **Prerequisite outside the initiative.**  #1017 restructured workflow-canon into Author, Audit and Revise modes, with commands.md and walk-rules.md. E00 and E05 edit files it created.
- **Order.**  E00 is delivered. E01 is independent. E02 precedes E03 and E04, which run in parallel. E05 follows both.

## Decisions

| ID | Decision | Alternatives rejected |
| --- | --- | --- |
| D1 | Fix-introduced findings close within the Author pass, checked over the lines the pass wrote | Whole-file re-audit after every fix batch |
| D2 | Each unit declares the constructs it fires on, in its own text | A construct-to-family table in the skill, a second home for applicability |
| D3 | Fires-on ids are generated-schema property paths (`<schema>.<path>`, as `enforcement.json` keys them), a bare schema name for a whole kind, `resource`, `readme`, and `*` | A vocabulary invented by the canon; `schema-construct-inventory.md`, which maps prose patterns to constructs and names no text sites |
| D4 | The index is generated on demand from the declarations, never stored | A committed index file, a copy that drifts |
| D5 | The hook matches `Edit\|Write\|MultiEdit` and exits unless the path is a corpus definition file | Firing on every tool call |
| D6 | The hook fails only on guard failures the branch introduced, as `check:delta` measures | Failing on any corpus failure, which blocks unrelated edits on a branch with a pre-existing failure |
| D7 | The hook and the index are one initiative, as separate epics | Two initiatives for one goal |

## Open questions

- **Q1  Where the hook is declared.**
  Recommendation: workflow-canon's frontmatter `hooks`, so it runs only during canon work, with a skill-guidelines exception for that field. Alternative: workspace settings, covering every session and Cursor with its own registration.
- **Q2  Selecting guards by file kind.**
  Recommendation: a non-goal. Select guards once each declares the kinds it admits; until then run all corpus guards.
- **Q3  E00's standing.**
  #1019 merged into its stacked base after that base had merged, so #1021 carries it into `workspace`. E00 is delivered when #1021 merges.

## Reviews

None yet.
