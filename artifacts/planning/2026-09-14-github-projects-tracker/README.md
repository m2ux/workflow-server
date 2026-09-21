# The tracker as it stands

GitHub Issues hold the work. One standing Project holds the planning conversation for this repo.
`m2ux` is a user account: a Project belongs to the user, and the repo lists a board only when it is
linked.

## Boards

| # | Title | URL | Role |
|---|---|---|---|
| 2 | workflow-server | https://github.com/users/m2ux/projects/2 | Standing board. Linked to `m2ux/workflow-server`. Thirty open items, all **Backlog**. |
| 1 | Initiative template | https://github.com/users/m2ux/projects/1 | Copy source for fields and views. Empty. Not linked to the repo. |

A Project per initiative was created (five instances) and removed the same day. Those issues live on
board 2. Deleting a Project does not delete issues.

**Fields on both boards:** Status (Backlog, Ready, In Progress, In Review, Done), Priority (High,
Medium, Low), Estimate, Start date, Target date, Parent issue, Sub-issues progress.

**Views:** Roadmap, Planning, Board, Blocked, My items.

Close-to-Done is a built-in workflow with no public create mutation; turn it on in the board’s
workflow settings. Auto-add stays off.

## Address

The title carries a bracketed address. Kind is not in the title. Two digits so lexical sort matches
numeric order.

| Kind | Title form | Example |
|---|---|---|
| Initiative | `[I<nn>] Name` | `[I00] Replace the Agent That Walks the Definition with a Runner` |
| Epic | `[I<nn> E<nn>] Name` | `[I00 E00] Safe Ground: What Must Hold Before Anything Is Rewritten` |
| Work item | `[I<nn> E<nn> W<nn>] Name` | `[I04 E01 W03] Rule scope: …` |

Cross-references use the same tokens as link *text*. The href stays the issue URL, so
`[E00 W04](https://github.com/m2ux/workflow-server/issues/528)` still opens #528. A citation `#528`
is enough when the number is known.

`E` is the epic. The old `P` (phase) token is not used on tickets.

## Kind

GitHub’s issue-type slot is org-only. This account lists default Task / Bug / Feature and they cannot
be assigned (`type` on #527 is null). Kind is a **label** on the issue:

- `type:initiative`
- `type:epic`
- `type:task`

Those labels are on all thirty items on the standing board. A Project field is the wrong home: kind
is a property of the work, not of this board.

Parent / sub-issue is the tree, not the kind. It is not yet wired.

## Themes

Four labels name destinations that outlive an initiative. They exist on the repo and are not yet on
the issues. See [themes.md](themes.md).

- `theme:mechanical`
- `theme:language`
- `theme:delivery`
- `theme:canon`

## On the standing board

Five live initiatives. Closed I01 E00–E04 stay off the board. Work items that exist only as sections
inside an epic body are not issues and are not on the board, except the seven I04 work issues that
already had their own tickets.

| Initiative | Issue | On the board |
|---|---|---|
| I00 | #527 | Epics #528 #529 #699 #530 #698 #704 #700 #531 #532 #534 #533 |
| I01 | #540 | Epic #634 only |
| I02 | #587 | The initiative. W01 is still a section in the body |
| I03 | #705 | Epic #535 |
| I04 | #706 | Epics #707–#711 and work issues #637 #638 #652 #678 #674 #692 #686 |

Priority on the board was copied from `priority:*` labels where those existed. Issues without a
priority label have Status only. The `priority:*` labels are still on the issues.

## How to copy the schema

```
gh project copy 1 --source-owner @me --target-owner @me --title "…"
```

Do that only when a second *conversation* fails the standing board — a different Status vocabulary,
intake, audience, or close rule. A slice of this backlog (initiative, theme, epic) is a view. The
test is in [research.md](research.md).
