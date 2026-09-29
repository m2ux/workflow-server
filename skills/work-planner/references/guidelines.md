# Guidelines

How the skill's own files are written. Every change to the skill follows them: SKILL.md, the references, the templates, and the scripts' docstrings.

## Frontmatter

- **Fields.**  `name` and `description` only. `name` is kebab-case and matches the skill's folder.
- **Description.**
  - It states what the skill covers and the requests that call for it, as the phrases a user would say: "plan the work", "standup", "hoist orphan issues".
  - It carries no procedure; what each mode does is in the body.
  - It stays under the 1,024-character skill limit.

## SKILL.md structure

- **Opening.**
  One sentence on what the skill does, then a bulleted list with one item for each issue type.
- **Modes.**
  - Each mode is its bold name, without the word "mode", linking to its reference file.
  - Beneath it, a bulleted summary of what the mode covers, in noun phrases that read as capabilities, never as instructions.
- **Rules.**
  A statement that binds every mode goes in Rules, never as loose prose in another section.
- **Dependencies.**
  Every tool, sandbox, runtime, branch and harness capability the skill relies on is named in Dependencies, with what it is needed for.
- **Commands.**  SKILL.md points to [commands.md](commands.md) and holds no command of its own.

## Layout

- **One line per item.**
  Each paragraph and list item is one line. No file is hard-wrapped at a column; the editor wraps.
- **Bold leads.**
  - A bold lead is a label. When the label and its body fit on one line of at most 100 characters, indent included, the body stays on it, two spaces after the label: `- **Epic**  Lists its tasks in a Work Breakdown table.`
  - A longer body goes on the next line, indented under the bullet.
  - A label that is a phrase ends in a full stop. A bare name, such as a mode or an issue type, takes none.
  - These rules are for the skill's own files. Issue bodies follow the scheme's Bold leads rule in SKILL.md.
  - No bold words open a running sentence. A step such as "**Fetch** each issue" becomes the label "**Fetch.**" with "Fetch each issue …" beneath it.
- **Sub-bullets.**
  An item that describes several discrete points lists them as sub-bullets. A single sentence, or a simple list within one sentence, stays as it is.

## Prose

- **Succinct.**  Plain words, and no sentence that another already carries.
- **One home per rule.**
  - Each rule is stated once: in SKILL.md, the Work Breakdown guide, the goal pass or the mode that owns it.
  - Every other file cites it by link, never restates it.
- **The design as it is.**
  Present tense, with no account of what the text replaced: no "previously", "no longer" or "instead of".
- **Terms.**
  - The scheme is agent-engineering: an agent-engineering prefix, title, issue or table.
  - After a rename, every use of the old term goes, in prose, docstrings and identifiers.

## Links

- **Files.**
  A reference to another markdown file in the skill is a relative link, never a code span: [work-breakdown.md](work-breakdown.md), not `work-breakdown.md`.
- **Link text.**
  The link sits on the name of the thing it points to: the mode's name, the guide's name, the command spec's name.
- **Resolution.**  Every link resolves to a file that exists, and every anchor to a heading in it.

## Commands

- **One spec per operation.**
  - Every command lives in [commands.md](commands.md), under a sub-section named for what it does: Fetch issue, Tick criteria, Plan board changes.
  - A script used several ways has a spec for each use. Its shared behaviour is described once, in the first, and the others cite it.
- **Spec layout.**
  - Each spec opens with a one-line, succinct description of what the command does.
  - Detail a caller needs, such as flags, inputs or refusals, follows as bullets, then the command block.
- **Named by link.**
  - Prose names a spec by linking to its sub-section, mid-sentence: "run [Check format](commands.md#check-format) on each epic".
  - No file outside commands.md inlines a command body or keeps a Commands section of its own.
- **Shared conventions.**
  The session setup, where `gh` runs, bodies through files, board locations and the example values live once, at the top of commands.md.

## Changes

- **Everything that names it.**
  A rename or a move updates every reference: folder, `name`, heading, script paths, links and anchors.
- **Stale claims.**
  After a behaviour change, search the skill for any description of the old behaviour and restate it.
- **Verified.**  The tests pass, and every link resolves, before the change is committed.
