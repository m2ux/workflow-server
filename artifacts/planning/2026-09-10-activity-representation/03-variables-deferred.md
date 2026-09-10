# The variables block — deferred

> Planning · 2026-09-10 · **Status:** Deferred from the step-grammar change.
> Tracked separately; not part of the issue this folder backs.

## Why it is separated

The step-grammar change is a rewrite of how a step is spelled. This is a change to
where variable declarations live and who owns them. They touch the same 117 files but
they are different decisions with different risk, and folding them together would put
a variable-model change behind a syntax cleanup.

It is also the larger prize: `variables` is 26.5% of activity bytes, against 4.7% for
the whole step-grammar change.

## What the measurement shows

`check-activity-variables.ts` passes at **hard zero** across the corpus. Two of its
five finding families are `undeclared-use` (the activity reads or writes a name its
contract omits) and `unused-declaration` (the contract names something the activity
never touches). Zero findings in both means the declared read and write sets are
exactly the sets `deriveActivityContract` computes from the steps, technique
signatures, `when` expressions and loop bindings. The declaration is already provably
redundant with a derivation the server performs anyway.

`variables.reads` is 14,798 bytes of it, derivable outright.

`variables.writes` is 103,660 bytes, and most of it is not derivable — `type`,
`description`, `defaultValue` and `values` are authored facts. But they are also
duplicated: 462 distinct declarations, 76 of them repeated across activities of one
workflow, 74 byte-identical and 2 silently divergent.

## The obstacle

`deriveActivityContract` narrows what it derives by a `namespace` argument — the
workflow's declared variable names — and that namespace is assembled from the
declarations themselves. Delete every declaration and there is no namespace to narrow
against, so the derivation cannot distinguish a bag read from a literal.

## The shape of a fix

Give the workflow file the variable dictionary. It already carries a `variables[]`
array, and `fragments` is already the established precedent in this schema for
declare-once-reference-by-name. With the dictionary owned there:

- the namespace comes from the workflow file, breaking the circularity;
- each activity's read and write sets are derived, and neither block is authored;
- the 74 duplicate declarations collapse to one home each, and the 2 divergent ones
  stop being possible;
- `undeclared-use` and `unused-declaration` become unrepresentable rather than
  policed, retiring two of the guard's five finding families. The other three
  (`unwritten-read`, `unread-write`, `unreachable-read`) are graph properties and
  survive unchanged.

## Effect if taken

| | Removed from each activity delivery | Removed from the corpus |
|---|---:|---:|
| `variables.reads` | 14,798 B | 14,798 B |
| `variables.writes` | 103,660 B | 34,734 B net |
| **Total** | **118,458 B (26.3%)** | **49,532 B (11.0%)** |

The delivery figure exceeds the corpus figure because 68,926 bytes of unique
declarations relocate to workflow files rather than disappearing. That relocation is
itself most of the win: `get_workflow` is called once per session, while an activity
is delivered on every open, to every worker, for every fan instance.

## Direction of travel

This removes mechanism rather than adding it — a whole authored block and two guard
finding families go, and nothing replaces them. Worth stating because the opposite
move, adding a validator to police the duplication, is the tempting one and would sit
on the wrong side of the ladder.
