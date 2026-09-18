# Definitions

A directory here that holds `techniques/`, `resources/` or `routines/` is a **namespace**, and the directory's name is the id every reference uses. One that also holds a `workflow.yaml` is a **workflow** — a product the server offers an operator. One that does not is a **library** of shared operations any workflow binds.

Both live under this root so a walk that loads definitions has one place to enter. Grouping folders under it organise the tree and name nothing of their own.

Discovery enters this folder when it is pointed at the branch root. What each named root on this branch is for is mapped in the [branch README](../README.md#named-roots). The directories themselves are the catalogue.

## A workflow directory

Each product workflow is a directory of its own, typically carrying:

- `workflow.yaml` — the definition: id, initial activity, transitions
- `README.md` — what that workflow does
- `activities/` — the steps of the graph
- `techniques/` — how those steps act
- `resources/` — documents a technique names

How to add one is in [`docs/README.md`](../docs/README.md#adding-a-workflow).

## support

[`support/`](support/README.md) holds the libraries. Each is a namespace of shared operations belonging to no single product, reached by its own directory name — `support/` appears in no reference. A library declares no `workflow.yaml`, so discovery offers none of them to an operator.

## specimens

[`specimens/`](specimens/README.md) holds worked examples of a form: an author copies from them when creating a workflow that needs that form, and a test drives them so the form stays loadable and observable. They travel with the other definitions. `specimens/` is a grouping folder — discovery walks it, and each child that holds a `workflow.yaml` is a workflow reached by its directory name.
