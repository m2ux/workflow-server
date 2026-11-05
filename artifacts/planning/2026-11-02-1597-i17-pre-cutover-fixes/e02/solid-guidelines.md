# SOLID Guidelines for the Work Planner Skill

The draft E01's first task lands in the skill's guidelines (`skills/work-planner/guidelines.md`), and the measure E01's audit applies to every file.

## The Model

The skill's procedure files are an object model written in prose.

| Code | Skill |
| --- | --- |
| Class | An artifact or protocol file |
| Public method | An operation (`### *Verb* Subject`) or a protocol entered whole |
| Method call | A link to an operation heading, or a "Follow"/"Run" of a protocol |
| Private method | A command under `## Commands`, reached only from its own file's operations |
| Object state and its type | `## Fields`: the shape the file owns and the conditions on it |
| Interface | A general artifact's operations and fields that each kind supplies |
| Implementation | A kind's file, which fills that interface for one kind of work |
| Import | `## Prerequisites` |
| Application layer | A mode, which only orchestrates calls |

A call goes down the layers (mode, then protocol, then artifact), never up. That is the existing Layers rule, and these guidelines refine it.

## Encapsulation

- **Call operations, not internals.**
  Another file reaches an artifact through its operations and its published fields. It never runs that artifact's commands, and never restates its steps or conditions.
- **Commands are private.**
  A command heading is linked only from an operation in its own file. A caller needing that capability calls the operation that wraps it.
- **Fields are the contract.**
  A field another file links to is part of the artifact's public shape. Keep it stable, and change its callers in the same change when it moves.
- **One file, one subject.**
  An operation that changes another subject's state is a call to that subject's operation, never a copy of its steps.

## S: Single Responsibility

- **One reason to change.**
  An artifact owns one shape and the operations that produce or read it. A protocol owns one change that lands in several artifacts together. A file changes only when that shape or change does.
- **Place by subject, not by caller.**
  A rule lives in the file whose shape it constrains, whoever needs it. A caller that needs it links to it.
- **One home per rule.**
  Each rule is stated once. A second statement of it is a breach, even when the two agree today.

## O: Open–Closed

- **A new kind is a new file.**
  Adding a kind of work (an issue kind, a delivery unit kind, a board item kind) adds its own artifact and script module and edits no general file. This generalises the body family's existing "Common file" and "A new kind" rules to every family.
- **General files name no kind.**
  A general artifact, mode or protocol states its rules for any member of its family. It never names a kind as a case it handles: no "a task row, or a hot-fix".
- **Extension points are operations.**
  Where kinds differ, the general file calls an operation that each kind's file defines under the same name and contract, and links to "the unit's kind". It never branches.

## L: Liskov Substitution

- **Same contract for every kind.**
  Each kind's version of an interface operation takes the same inputs and returns the same output shape, so a caller never asks which kind it holds.
- **No narrowing.**
  A kind may add conditions to its own fields. It may not refuse an input the interface accepts, or return less than the interface promises.

## I: Interface Segregation

- **Small operations.**
  An operation does one thing a caller needs. A caller never loads a file to use one rule of it that belongs elsewhere.
- **Prerequisites list only what is called.**
  A file's Prerequisites name exactly the files its operations, fields and commands link to. A prerequisite that loads a file for one stray rule marks that rule as misplaced.
- **Kinds carry only their own surface.**
  A kind's file holds what is specific to it. Shared behaviour stays in the general file, and the kind's file calls it.

## D: Dependency Inversion

- **Depend on the general file.**
  Modes and protocols call general operations. A kind's file links up to the interface it fills, and a general file never links down to a kind.
- **Kinds register, callers don't enumerate.**
  The list of kinds lives in one place: SKILL.md's kind list, plus, for scripts, one registry that maps each kind to its module. Every other file reaches kinds through that list.

## Scripts

- **A kind's logic lives in its module.**
  General scripts (`deliver.py`, `board-queue.py`, `sync.py`, `progress.py`) call each kind's module through one interface. They never test for a kind inline.
- **One implementation per rule.**
  A rule a script implements has one function. Other scripts import it, and the prose's home for that rule names the function's file.

## Audit Questions

E01's audit asks these questions of each file.

1. What one shape or change does this file own, and does every section serve it?
2. Does any rule here also appear elsewhere? Which copy is the owner?
3. Does this file name a kind of work as a case it handles?
4. Does it run another file's command, or restate another file's steps or conditions?
5. Does a general file link down to a kind, or a lower layer link up to a higher one?
6. Does every prerequisite exist because of a link the file makes?
7. For scripts: does a general script branch on a kind, or reimplement a rule another module owns?
