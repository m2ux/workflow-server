---
metadata:
  version: 1.0.0
---

## Capability

Whether a roster of trees to index accounts for every component its host declares — naming the components no roster entry covers, and the entries no declared component answers.

## Inputs

### declared_components

One entry per submodule the host declares, each with its path, whether it is infrastructure, and whether a clone has populated its working tree.

### index_roster

The roster's entries, both the trees it marks for indexing and the ones it holds out, each naming the path it covers.

## Outputs

### roster_coverage_report

What the roster accounts for and what it does not.

#### undeclared_components

Each component the host declares that no roster entry covers, with its path and whether its working tree is populated. Empty where the roster covers every one.

#### stale_entries

Each roster entry naming a path the host no longer declares. Empty where every entry answers a declared component.

#### infrastructure_components

Each declared component the host marks as infrastructure, named whether or not the roster covers it, so a reader can tell a path deliberately outside the product from one the roster has missed.

## Protocol

### 1. Take the Roster's Paths

- Read the path each entry of `{index_roster}` covers, taking the trees held out alongside the trees marked for indexing. A roster records a decision either way, so an entry holding a component out covers it as fully as one marking it for indexing, and reading only the indexed entries would report every deliberate exclusion as a gap.

### 2. Name What the Roster Does Not Cover

- Record under `undeclared_components` each entry of `{declared_components}` whose path no roster path matches, carrying its `is_populated` mark so a reader knows whether there is a tree to index at all.

### 3. Name What No Component Answers

- Record under `stale_entries` each roster path that matches no entry of `{declared_components}`. A component the host has stopped declaring leaves an entry describing nothing, and a roster read as complete while it holds one is describing a tree that is gone.

### 4. Name the Infrastructure

- Record under `infrastructure_components` each entry of `{declared_components}` whose `is_infrastructure` mark is set.

## Rules

### the-roster-is-reported-on-and-never-written

This judgement answers what the roster does not cover and writes nothing into it. A roster entry carries a decision — that a tree is indexed, or that it is held out and why — and a comparison of paths supplies neither the decision nor the reason behind it. An entry written from this answer would state a judgement nobody made, and would read afterwards exactly like one somebody did.
