# Guidelines

The rules this skill's own files follow beyond the [skill guidelines](../../guidelines.md). Every change to the skill follows both.

## SKILL.md Structure

- **Opening.**  The bulleted list has one item for each issue type.
- **Section order.**  Rules precedes Dependencies.

## Layout

- **Issue bodies.**
  The layout rules are for the skill's own files. Issue bodies follow the scheme's Bold leads rule in SKILL.md.
- **Pull request test plans.**
  Templates and body updates follow [Test Plan](work-breakdown.md#test-plan).

## Titles

- **Title case.**
  A heading, a board title, an issue or pull request name and subtitle, and a template section heading are in title case.
  - A short word stays lowercase unless it is first or last: a, an, the, and, but, or, nor, for, as, at, by, in, of, on, to, up, with.
  - Each part of a hyphenated word is capitalized.

## Procedure

- **Sub-bullets.**
  A sub-bullet under a numbered procedure step is in sentence case. The first word is capitalized, and a name keeps its own capitals.

## Prose

- **One home per rule.**  A rule's home can also be the Work Breakdown Guide or the goal pass.
- **Branch strategy.**
  Delivery branch strategy lives in the [Work Breakdown Guide](work-breakdown.md#delivery).
- **Terms.**  The scheme is agent-engineering: an agent-engineering prefix, title, issue or table.
- **Examples.**
  A name, label, branch, path or board that belongs to one project is an example. The rule states what holds for every project.
- **Consumers.**
  A document states what it is and what it requires. A document may cite its own rules. The documents that use it are the ones that cite it.

## Mode files

- **Rules.**
  Every mode file has a Rules section. What binds the mode is stated there, per [Mode files](../../guidelines.md#mode-files). A step's action, a placement, and what a command prints stay in the section that owns them.

## Commands

- **Shared conventions.**
  The [command conventions](commands.md#conventions) also hold how bodies go through files and where boards sit. Graph-only setup belongs in [Graph Conventions](commands.md#graph-conventions).

## Progressive Disclosure

Apply the shared [progressive disclosure](../../guidelines.md#progressive-disclosure) and [disclosure verification](../../guidelines.md#disclosure-verification) rules to affected callers. Modes are read whole; supporting section reads inherit the mode's command prerequisites.

- **Mode routes.**
  Trace each affected mode through its common conventions, selected operations and supporting guides. Include cross-mode calls and explicit whole-file requirements.
- **Board operations.**
  Exercise a Standup request with captured board inputs, selecting multiple command specs and reusing conventions. Preserve the generator's format and unresolved evidence.
- **Graph operations.**
  Exercise an Understand request with a named pull request, verifying graph-specific setup before selected graph commands and exclusion of unrelated command bodies.
- **Revision.**
  Exercise a bounded skill edit with its consumer guidance, required whole-file guidelines, local checks and reused common prerequisites.
