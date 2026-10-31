# Plan Change

One change to the plan that a run makes as it works, and whether the run applies it or the user decides it.

## Operations

### *Check* Plan Change Autonomy

One pending change assessed against the run's allowance.

**Inputs:** The pending change, its subject, the option recommended for it, and the allowance the caller was supplied.

1. Match the change to one kind in [Change Kinds](#change-kinds).
2. Return it as automatic where the supplied allowance names that kind, with the supplied recommendation as the option the caller applies.
3. Return it as held otherwise, for the caller to settle as [Held Change](#held-change) states.
   - A change matching no kind is held, as is one matching [Initiative Creation](#initiative-creation).
   - An absent allowance holds every change, so a run the user drives decides nothing on their behalf.

### *Record* Plan Change

One entry in the run's list, for a change it applied or held.

**Inputs:** The change, its kind, the option applied or recommended, the affected issue identities and the run's current list.

1. Add one entry meeting [Entry](#entry) to the supplied [Change List](#change-list), marked applied or held.
2. Return the updated list for the caller to publish and report.

## Fields

### Allowance

The caller names the change kinds its run applies without asking. A run the user drives directly is supplied none.

### Change Kinds

| Kind | What It Covers |
| --- | --- |
| Task creation | A new task row, and the task issue that delivers it |
| Epic creation | A new epic, and the initiative row that carries it |
| Migration | Work moved from one issue to another, with the renumbering that move forces |
| Re-prioritisation | A priority label, a queue order or a board status |
| Folded work | Criteria, scope or design added to an existing issue because the work in hand needs it |

An option deciding to leave work where it is changes no plan, so it needs no allowance and takes no entry, unlike a change [held](#held-change) for the user to decide.

### Initiative Creation

A new initiative is outside every allowance. The work stays where it is, open and unplaced, until the user decides where it belongs.

### Change List

One list for the run, holding every change it applied and every change it held. It is what the run reports and what its record keeps.

### Entry

One line: the kind, the issue or row it concerns, and the option applied or recommended. The entry states the change, not the alternatives weighed against it.

### Held Change

A held change is left unapplied and its subject stays as it stands, so the next run sees the same decision. Its entry carries the recommended option, which is what the user is answering.

A run working under an allowance records and reports a held change rather than asking, since the work it was dispatched for does not wait on an answer. A run supplied no allowance puts it to the user.
