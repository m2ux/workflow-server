---
metadata:
  version: 1.0.0
---

## Capability

The control and data dependence inside one function — which predicates gate a statement, and where a variable's definitions flow — read from the graph's program-dependence layer.

## Inputs

### dependence_mode

`'controls'` for the predicates that gate each block of the anchored function, or `'flows'` for the definition-to-use edges within it.

### dependence_target

A file path, matched on its suffix, or a symbol name, which anchors the answer to that function. Every answer is anchored; the layer has no whole-graph enumeration.

### flow_variable

*(optional)* In `'flows'` mode, the one source-level variable whose definitions and uses the answer keeps.

### limit

*(optional)* How many edges the answer carries, from 1 to 200.

#### default

`50`

## Outputs

### dependence_report

The dependence edges matched for the anchored function, how many there are in full, and whether the graph holds the layer they come from.

#### results

Each edge as a source block and a dependent block, each with its line span and text. In `'controls'` mode the source is the controlling predicate and `reason` is the branch sense it took — `T` for its true arm, `F` for its false arm — with `guard` set true where the dependent block is an early `return` or `throw`. In `'flows'` mode `reason` names the variable carried from definition to use.

#### total

How many edges matched, of which `results` holds a page.

#### truncated

Whether `results` is shorter than `total`.

#### note

Present where the graph carries no program-dependence layer, or where that could not be confirmed, naming the build that records one; the answer is then empty and says nothing about the code.

## Protocol

### 1. Take the Dependence Edges

- Call `gitnexus_pdg_query { mode: dependence_mode, target: dependence_target, variable: flow_variable, limit, repo: repo_name }` and record the `{dependence_report}`.
   > - Where `{dependence_target}` names several symbols the answer is the candidates, with `totalCandidates` the true count; choose by file and name the file's path as `{dependence_target}` instead.
   > - Where the answer carries `{dependence_report}.note`, the graph was built without its program-dependence layers; a rebuild carrying them is what makes this answer a measurement.

### 2. Read a Guard by Its Predicate

- Read a `guard` edge's sense from its own predicate rather than from a fixed label: `if (!ok) return` puts the return on the true arm and the protected body on the false one, and every arm of a `switch` reads as true. The dependence is within the function; what a caller's argument carried into it is a taint question rather than this one.
