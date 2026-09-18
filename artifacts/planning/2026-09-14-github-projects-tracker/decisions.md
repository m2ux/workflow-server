# Decisions

What was settled while moving this repo onto Projects, and why the first profile did not hold.

## The Project is a conversation

A Project owns Status, dates, views, automations, and an On track / At risk feed. Hierarchy lives on
issues. The Project answers “what conversation am I having,” not “what tier is this item.”

GitHub’s featured pattern is one Project spanning many repos. A repo lists a Project when the board
is linked. An issue sits on a board because it was added, not because the Project is scoped to the
repo.

## One standing board

The first recommendation was one Project per initiative, copied from a template — the Product Ops
“Feature Release” grain. Five instances were created (I00–I04). They were the same conversation
copied five times: user-owned, not repo-owned, same fields, same Status.

That profile was dropped. The live profile is one standing Project for all `m2ux/workflow-server`
work, plus the empty copy source. Initiatives are issues on that board. Theme and parent are views
or labels.

This matches how GitHub Docs (42 people, one cycle board) and Sourcegraph Cloud (one Project, epics
as a field) run standing engineering. Product Ops still instantiates a board per ship when that ship
*is* the conversation and gets its own status feed. This repo does not run that conversation.

## Kind is a label

GitHub’s designed slot for Initiative / Epic / Task is **issue type**: one value, shown on the
issue, filter `type:Epic`. That slot is org-only. `m2ux` is a user. Custom types cannot be created.
The three defaults cannot be assigned.

A **label** (`type:initiative` / `type:epic` / `type:task`) lives on the issue, survives the board,
and works in `gh issue list`. A Project field dies with the board and is invisible on the Issues
list. The words “Initiative” and “Epic” were taken out of titles once the label carried the kind.

If the account becomes an organization, issue types replace the `type:` labels and the labels
retire.

## The address is bracketed and zero-padded

`[I00]`, `[I00 E00]`, `[I04 E01 W03]`. Two digits so `E09` sorts before `E10`. A space between
tokens, not a dot. The title after the closing bracket is the name.

Phase numbering (`P00`) is not used on tickets. `E` is the epic. Link *text* follows the address;
the href is the issue URL.

## What a second Project would need

A new *kind* of Project, not another copy of this one. At least one of: a close date of its own, a
Status vocabulary that would be a lie on the first board, intake the first board must refuse, an
audience or privacy the first board cannot have, or a different item grain (Initiative-only
portfolio, review PRs). Theme, epic, engine-versus-corpus, and “so I can see everything” fail that
test.

Deferred kinds: a standing interrupt board (bugs and one-offs), a portfolio that holds only
initiative issues, a design-intake board for unscheduled planning folders.

## Intake

- Scheduled as an initiative → an Initiative issue on the standing board, `type:initiative`, theme
  labels, address `[I<nn>]`. Epics and work items join the same board.
- Not an initiative → stay on the Issues list until groomed onto the standing board.
- A planning folder is not a Project and is not an initiative until an issue is cut.

## Hierarchy still intended

Initiative parent of epics; epic parent of work-item issues. Native sub-issues (one parent, 100
children, eight levels). The epic body stays the design home. A work-item issue is a thin execution
record. One pull request delivers one work item. Gates become `blocked-by`. That wiring is not done;
see [remaining.md](remaining.md).
