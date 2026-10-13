# Decisions

## D1. The declaration is a project file the skill reads, not a rule the skill states

**Taken.** The skill states that a project may require criteria of its epics, and where it declares them. The project states which. `format.py` reads the declaration and carries no vocabulary of its own.

Three shapes were weighed.

| Shape | What it costs |
| --- | --- |
| **A project config file, with a general hook in the skill** | The declaration's format has to be designed and read, and `format.py` loses a literal it currently matches. Generalises past this one rule: a project's next mandatory criterion needs no skill change. |
| **Move the rule into the Workflow Canon skill** | Clean ownership of the doctrine, but `format.py` is a Work Planner script, so the general hook is still needed. This is the first shape plus a second move. |
| **Relabel the section as an Example in place** | Cheapest. The project's doctrine stays in the general guide, where the next reader takes it as law, and `format.py` keeps matching `canon audit`. |

The first was taken. The second is not excluded by it: once the hook exists, where the corpus audit's *substance* is documented can be settled separately.

## D2. The precedent is `config/branches`

The skill already has this seam and states it well:

- A project states its long-lived branches in `config/branches` at its root, one name per line.
- A run from a linked worktree reads the statement its main working tree holds.
- A missing or empty file leaves the names **unevaluable** — reported, not defaulted.
- workflow-server's own values appear under a labelled **Example**, never as the rule.

The declaration follows all four. "Unevaluable rather than defaulted" matters most: a project that declares nothing must not silently acquire this project's corpus audit, and must not silently lose a requirement it meant to state.

## D3. What a declared criterion has to carry

For the format check to report an epic that omits a required criterion, without knowing what the criterion means, the declaration states:

- **The condition that triggers it** — currently "a task row's work reaches this branch", the branch being the project value `--corpus` carries today.
- **The criterion's text**, which the epic must carry.
- **A phrase that identifies it** in an epic that already carries it, which is what `format.py:545` hardcodes as `canon audit` today.
- **The row's name**, so the Work Breakdown row that delivers it is stated by the project rather than by the guide.

## D4. What this does not decide

- The declaration's file name and syntax. One name per line will not carry four fields, so this is a design question for W01, recorded there.
- Whether other project-specific rules in the skill move to the same declaration. The themes table is already marked as an Example; nothing else has been surveyed.

## Origin

Raised by the user on 2026-10-13, reviewing the corpus audit criterion delivered in [#1359](https://github.com/m2ux/workflow-server/pull/1359): *"this is a general purpose skill so you need to define some kind of variant config to accommodate that rather than subsuming it into the general canon."*
