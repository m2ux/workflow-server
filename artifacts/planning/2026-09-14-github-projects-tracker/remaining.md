# What remains

The standing board exists and the thirty open issues that already had tickets are on it, in
Backlog, with `type:` labels and padded addresses. The rest of the original migration sequence is
not done.

## Parent links

Native sub-issues: initiative parent of its epics; epic parent of its work-item issues. `gh` 2.46
has no `--parent`. The REST sub-issues API was not run. Hierarchy view on the board will not nest
until this is wired.

## Promote work items

I00 (and I02 W01) work items that are still sections in epic bodies need Task issues:
`[I<nn> E<nn> W<nn>]` title, thin body, `type:task`, parent the epic, `blocked-by` for gates, added
to the standing board at Backlog. Skip the seven stopped items; leave them recorded on the epic.

I04 already has seven work issues. Two of those titles use the epic address without a W token
(#674, #692, #686).

## Rewrite Tracking sections

Each epic’s Tracking list should point at child issue links. Design sections stay the home. A short
comment on the epic: work items are sub-issues; this body remains the design home.

## Theme labels

Apply `theme:*` on initiatives (and on epics that belong to one pillar). I00: mechanical + language
+ delivery. I01: canon; #634 also mechanical + delivery. I02 and I03: language. I04: canon; #710 and
#711 also delivery.

## Automations and priority

Turn on closed/merged → Done in the board’s workflow settings after the next backfill. Leave
auto-add off. Retire `priority:*` labels once the board Priority field is the home.

## Authoring conventions

[epic-authoring-conventions](../2026-08-02-epic-authoring-conventions/README.md) still says a work
item never lives outside its epic as a section. Rewrite so a work item is a Task sub-issue of its
epic, the address is `[I<nn> E<nn> W<nn>]`, kind is `type:`, themes are `theme:`, and scheduling an
initiative means an issue on the standing board — not a new Project.
