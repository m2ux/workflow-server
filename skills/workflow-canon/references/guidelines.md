# Guidelines

The rules this skill's files follow beyond the [skill guidelines](../../guidelines.md). Every revision follows both.

## Identity

- **Purpose and modes.**
  The entry point describes Workflow Canon's work-design purpose for workflow-server. Each mode owns the scope and authority of its capability.

## SKILL.md Structure

- **Section order.**  Rules precedes Dependencies.
- **Rules.**
  A statement that binds every mode goes in Rules, never as loose prose in another section.
- **Dependencies.**
  Every tool, sandbox, runtime, branch and harness capability the skill relies on is named in Dependencies, with what it is needed for.
- **Command conventions.**
  SKILL.md links the [command conventions](command-conventions.md) on a required path and holds no command of its own.
- **Modes.**
  - Each mode is its bold name, without the word "mode", linking to its mode file.
  - Beneath it, a bulleted list that selects the mode, since the reader holds a request and picks one mode from this list alone:
    - The first item states the mode's direction and what it is scoped to, and nothing else: `Backward-looking, scoped to one integration's branches`.
    - Each further item is one line: a noun phrase or a gerund phrase naming a request this mode answers.
    - An item earns its place only where a request reaches this mode because of it. At most five follow the first.
    - A step the mode takes once selected stays in the mode file, as does a distinction from another mode.
    - A mode the mode runs for itself goes unnamed, since naming it routes that mode's own requests here.
    - It has no trailing full stop and no purpose clause.

## Procedure Files

- **What the file carries selects the set.**
  - A procedure is a top-level section carrying a numbered step, whatever its heading names it, as [Commands](#commands) defines it.
  - A file carrying one takes the sections below. A catalog, a context file and a contract file state what a procedure consults, and nothing about them is a sequence, so each keeps its own shape.
  - The entry point takes [its own structure](#skillmd-structure) whatever it carries.
- **Top-level sections.**
  - A procedure file takes the [sections](#sections) its column declares, in that order.
  - Anything else the file needs is a sub-section under one of them, so a diverse title names a part of a known whole.
- **What the reader does with a heading places it.**
  - Reference holds what a step consults or produces: a table, an output shape, a vocabulary.
  - Rules holds what binds the file whatever step it is on.
  - An alternative way in is a step of the Procedure.
- **Procedure.**
  A `## Procedure` of numbered steps, each opening with a bold label. Where the file holds several procedures, each is a sub-section of it.

## Sections

Each procedure file's sections, in order, and the ones it requires. A blank cell leaves the option undeclared.

| Option | `*-mode.md` | `*` |
| --- | --- | --- |
| `sections` | Prerequisites, Procedure, Reference, Rules | Prerequisites, Procedure, Reference, Rules |
| `required` | Procedure, Rules | Procedure |

## Mode Files

- **File name.**  A mode file is `references/<mode>-mode.md`.
- **Opening.**  `# <Name> Mode`, then a paragraph on what the mode does.
- **Sections.**
  A mode carries a procedure, so a mode file takes the [procedure-file sections](#procedure-files) and their order, and carries Rules as well as Procedure.
- **Rules.**  A statement that binds only this mode goes in the mode's `## Rules`.

## Commands

- **One spec per operation.**
  - Every command has a sub-section named for what it does: Initialize Audit Surface.
  - A script used several ways has a spec for each use.
- **In the step that runs it.**
  - A specification sits in the procedure step that runs it: its description, detail and command block. No file takes a Commands section.
  - A specification several steps run, a step of another file runs, or text outside its step links to, is a sub-section of the procedure in the file owning its subject, and those steps run it.
  - A specification no procedure runs has no step to hold it, so it stays with the section whose prose or sibling specification names it; in a mode file, whose commands stand in its procedure, it is a sub-section of the procedure.
  - A caller is a procedure that runs the command. A specification standing outside any step, and any passage of prose naming a command, does not make the file holding it a caller.
  - A procedure is a section carrying numbered steps, whatever its heading names it. The step is the author stating that the reader performs these, in this order, and is the only place a file records that.
  - Prose runs nothing whatever its mood, order or count: a sentence routing three commands in sequence names them as a statement of what one command does names it. State a route as steps to call them.
  - SKILL.md holds no specification. A command the entry point names is specified in the step that runs it.
  - A specification with two owners has one home and a link from the other. A count of those links that keeps growing says the split is in the wrong place.
- **Spec layout.**
  - Each spec opens with a one-line, succinct description of what the command does.
  - Detail a caller needs, such as flags or inputs, follows as bullets, then the command block.
  - Preconditions and refusals sit in the step that runs the command, never in the spec.
- **Named by link.**
  - Prose names a spec by linking to its sub-section, mid-sentence: `run [Check Audit Status](change-surface.md#check-audit-status) before the evaluation gate`.
  - A command body is inlined only in the file that owns the spec.
- **Conventions.**
  - Session setup, execution location, example values and other skill-wide prerequisites stand where a procedure reaching them opens no further file: SKILL.md, which selects the mode, or the file holding the operations those procedures open anyway.
  - Conventions governing one procedure's commands sit in that procedure's file, ahead of the procedure.

## Progressive Disclosure

Apply the shared [progressive disclosure](../../guidelines.md#progressive-disclosure) and [disclosure verification](../../guidelines.md#disclosure-verification) rules using the scenarios affected by the revision:

- **Author.**
  Draft a specified definition change with a contract consumer. Follow the shared canon prerequisites, four section matrices, independent verification and relevant checks; preserve the draft walk, byte agreement and complete-surface commit gate. Repeat with a changed candidate invalidating prior evidence.
- **Audit.**
  Audit a definition with a closure-only consumer and prior residual. Include inventory and mapping verification, budgeted fan-out, partial returns, criterion/file coverage, attribution and report selection. Repeat with a disputed exclusion or stale source. Also trace a single canon question's bounded path.
- **Review.**
  Select one affected branch product with a conditional check that does not apply. Confirm the report preserves missing evidence and the reads follow the selected coverage.
- **Revise.**
  Change a template with a consumer in another mode. Include its required consumer guidance, a command section with conventions, a parent section with subsections and the required whole-file guidelines.
- **Command routing.**
  Select multiple operations across two modes, including a canon check. Confirm each procedure's commands and governing conventions arrive with its own file, the shared conventions arrive once, and the other mode's operations stay outside the retrieved files.

## Titles

- **Title case.**
  Headings and template section headings use title case. Short words stay lowercase unless first or last: a, an, the, and, but, or, nor, for, as, at, by, in, of, on, to, up, with.

## Reference Ownership

- **Ownership.**
  Canon context owns document homes and definition checks; the coverage guide owns branch responsibilities and integration coverage. Modes link directly to the sections their tasks need.
- **Currency.**
  Check project settings against current instructions and captured revisions. Counts, runtime versions, thresholds and branch pairings come from the sources that own them.
- **Separation.**
  An executable operation belongs to the file whose procedure runs it. Skill-wide conventions form one bounded file; conventions governing one procedure's commands sit in that procedure's file, ahead of the procedure.

## Shared Planning

- **Location.**
  The planning guide owns location and naming rules for all modes; mode files reference the guide.

## Complete Audits

- **Authority.**
  The [change-surface contract](change-surface.md) owns per-type matrices, independent applicability verification, evidence freshness and the full-surface completion gate. Author and Audit share it; dispatch and reporting consume its state.
