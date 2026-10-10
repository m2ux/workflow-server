# Skill Guidelines

How a skill's own files are written: SKILL.md, the references, the templates, and the scripts' docstrings. Every change to a skill follows them. A skill with rules of its own keeps them in its `references/guidelines.md`, which adds to these.

## Frontmatter

- **Fields.**
  - `name` and `description`, and `hooks` when the skill declares a hook. No other field.
  - `name` is kebab-case and matches the skill's folder.
- **Hooks.**
  - A skill declares a hook when a check it owns must run at every tool call that could break it, not only at a step its procedure names.
  - The hook's command runs a script in the skill's own scripts folder, which exits at once on a call outside its check.
  - Claude Code registers the hook when the skill is invoked and runs it for the rest of the session. Cursor ignores the field.
- **Description.**
  - It states what the skill covers and the requests that call for it, as the phrases a user would say: "plan the work", "audit workflow X".
  - It carries at least one such phrase for each mode, since the description alone decides whether the skill loads.
  - It carries no procedure; what each mode does is in the body.
  - It stays under the 1,024-character skill limit.

## Files

- **SKILL.md.**  The skill's entry point, at the top of its folder.
- **References.**
  - `references/` holds one `<mode>-mode.md` per mode, `commands.md` when the skill runs commands, `guidelines.md` when the skill has rules of its own, and each guide the modes share.
  - Templates, scripts and tests each have a folder of their own.

## SKILL.md structure

- **Opening.**
  One sentence on what the skill does, then a bulleted list with one item for each thing it acts on.
- **Modes.**
  - Each mode is its bold name, without the word "mode", linking to its reference file.
  - Beneath it, a bulleted summary of the work the mode does:
    - Each item is one line: a noun phrase or a gerund phrase that names one capability.
    - It has no trailing full stop, no purpose clause, and no board status outside that phrase.
    - A distinction from another mode stays in the file that owns it.
- **Rules.**
  A statement that binds every mode goes in Rules, never as loose prose in another section.
- **Dependencies.**
  Every tool, sandbox, runtime, branch and harness capability the skill relies on is named in Dependencies, with what it is needed for.
- **Commands.**  SKILL.md points to `commands.md` and holds no command of its own.

## Mode files

- **Opening.**  `# <Name> mode`, then a paragraph on what the mode does.
- **Procedure.**
  - A `## Procedure` of numbered steps, each opening with a bold label.
  - A section the procedure draws on sits beside it, under a heading of its own.
- **Rules.**  A statement that binds only this mode goes in the mode's `## Rules`.

## Layout

- **One line per item.**
  Each paragraph and list item is one line. No file is hard-wrapped at a column; the editor wraps.
- **Bold leads.**
  - A bold lead is a label. When the label and its body fit on one line of at most 100 characters, indent included, the body stays on it, two spaces after the label: `- **Epic**  Lists its tasks in a Work Breakdown table.`
  - A longer body goes on the next line, indented under the bullet.
  - A label that is a phrase ends in a full stop. A bare name, such as a mode or an issue type, takes none.
  - No bold words open a running sentence. A step such as "**Fetch** each issue" becomes the label "**Fetch.**" with "Fetch each issue …" beneath it.
- **Sub-bullets.**
  An item that describes several discrete points lists them as sub-bullets. A single sentence, or a simple list within one sentence, stays as it is.

## Prose

- **Succinct.**  Plain words, and no sentence that another already carries.
- **One home per rule.**
  - Each rule is stated once: in SKILL.md, the mode that owns it, or the guide the modes share.
  - Every other file cites it by link, never restates it.
- **The design as it is.**
  Present tense, with no account of what the text replaced: no "previously", "no longer" or "instead of".
- **Terms.**  After a rename, every use of the old term goes, in prose, docstrings and identifiers.

## Links

- **Files.**
  A reference to another markdown file in the skill is a relative link, never a code span.
- **Link text.**
  The link sits on the noun that names the thing: the mode, the guide, the command, the template.
- **Resolution.**  Every link resolves to a file that exists, and every anchor to a heading in it.

## Commands

- **One spec per operation.**
  - Every command lives in `commands.md`, under a sub-section named for what it does: Fetch issue, Run guard suite.
  - A script used several ways has a spec for each use. Its shared behaviour is described once, in the first, and the others cite it.
- **Spec layout.**
  - Each spec opens with a one-line, succinct description of what the command does.
  - Detail a caller needs, such as flags, inputs or refusals, follows as bullets, then the command block.
- **Named by link.**
  - Prose names a spec by linking to its sub-section, mid-sentence: "run [Check format](work-planner/references/commands.md#check-format) on each epic".
  - No file outside `commands.md` inlines a command body or keeps a Commands section of its own.
- **Shared conventions.**
  The session setup, where commands run, and the example values live once, at the top of `commands.md`.

## Progressive Disclosure

- **Placement.**
  Keep shared purpose, mode selection and essential constraints in the entry point. Link conditional detail where the active mode needs it.
- **Applicability.**
  State the condition beside a conditional link and require the reader to resolve it before loading the instructions. Select checks before retrieving their command specs.
- **Reading boundaries.**
  Link the smallest complete section the caller needs. The skill's reading rules define a heading link as that section and its subsections, stopping before the next heading of equal or higher level. Whole-file links identify required complete documents.
- **Prerequisites.**
  Provide or explicitly link the context needed to use each section, including conventions and mode authority. Split files when section routing still brings unrelated guidance into context.
- **Batched reads.**
  Preserve each link's boundary when batching retrieval. Batch selected whole files or separate section ranges; each range excludes unrelated intervening content. Inspect headings to locate boundaries.
- **Complete output.**
  Bound reads and output volume so required content is returned completely. Retrieve missing sections when output is truncated; a request for content is not evidence of receipt.

## Disclosure Verification

- **Required context.**
  Every revision traces a representative request through each affected mode's required reads, including prerequisites, subsections and explicit whole-file requirements. Necessity follows the task and affected consumers; another mode's guidance can be required.
- **Live checks.**
  When a revision changes reading paths, test representative requests with independent sub-agents in fresh contexts. Give them the skill, realistic tasks, necessary inputs and authority limits, without expected reading choices or prior findings. Repeat affected scenarios before claiming consistent behavior. Record unavailable live validation as an evidence gap.
- **Observed behavior.**
  Inspect actual tool calls, returned content and task results. Missing necessary context or loading unrelated content fails the disclosure check. Report structural validation and live behavior separately, preserving observed failures.
- **Performance.**
  Record unnecessary content, repeated reads, truncation and task correctness. Claims of context-token savings require a comparable baseline with the same tasks, inputs and execution conditions; file or word counts establish only their stated measurements.

## Changes

- **Everything that names it.**
  A rename or a move updates every reference: folder, `name`, heading, script paths, links and anchors.
- **Stale claims.**
  After a behaviour change, search the skill for any description of the old behaviour and restate it.
- **Verified.**
  The skill's tests pass, every link resolves and [disclosure verification](#disclosure-verification) is recorded before the change is committed.
