# Namespace Conformance Workflow

A worked example of a library that offers operations without being a workflow, and of the two spellings that reach one.

## The form

[`specimens/shared-probe/`](../shared-probe/techniques/TECHNIQUE.md) holds a `techniques/` folder and no `workflow.yaml`. That makes it a namespace — a place references can point at — and not a workflow, so it offers `measure-entries` to any site that wants it while staying out of the catalogue an operator picks from. A folder needs nothing else to be addressable: the library it holds is what names it.

A namespace answers to two names. `shared-probe` is its directory name, which is what a reference ordinarily carries, so the folder can be re-grouped without rewriting what points at it. `specimens/shared-probe` is the path from the corpus root, which names this one and no other, and is what a reference carries where a name is claimed twice or where an author would rather be explicit. Written as a technique reference the path spells with the same separator as the rest: `specimens::shared-probe::measure-entries`.

## What the run does

`reach-by-name` binds the operation under the bare name and records which folder the delivery came from. `reach-by-path` binds the same operation under the path and records the same thing. Both sites count one directory, because the evidence wanted is which folder answered each reference rather than anything about the counting. Whether the two deliveries agree is asserted by the test that drives the specimen, which sees both of them; neither activity reads what the other produced, so each site stands as its own worked example.

The shared contract travels with the operation either way: `component_path` is declared once on the library's own `TECHNIQUE.md` and arrives on `measure-entries` as an inherited input, under both spellings.

## Copying from it

Take this when a set of techniques, resources or routines is wanted by several workflows and belongs to none of them. Put them in a folder with the construct directory they are, leave the definition out, and reference them by the folder's name.
