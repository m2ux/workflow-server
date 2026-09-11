# Product workflows

A workflow the server offers an operator is a directory that holds a `workflow.yaml`. Those directories live here so a walk that loads products has one place to enter. The directory's name is the id every reference uses — `corpus/work-package/workflow.yaml` is the workflow `work-package`. Grouping folders under this root organise the tree and name nothing of their own.

Discovery enters this folder when it is pointed at the branch root. What each named root on this branch is for is mapped in the [branch README](../README.md#named-roots).

## A workflow directory

Each product workflow is a directory of its own, typically carrying:

- `workflow.yaml` — the definition: id, initial activity, transitions
- `README.md` — what that workflow does
- `activities/` — the steps of the graph
- `techniques/` — how those steps act
- `resources/` — documents a technique names

How to add one is in [`docs/README.md`](../docs/README.md#adding-a-workflow).

## Product directories

The catalogue with descriptions is in the [branch README](../README.md#available-workflows). The directories here:

- [`cicd-pipeline-security-audit/`](cicd-pipeline-security-audit/)
- [`codebase-wiki/`](codebase-wiki/)
- [`meta/`](meta/) — also the shared technique and resource layer every other workflow falls back to
- [`midnight-system-review/`](midnight-system-review/)
- [`plain-language/`](plain-language/)
- [`ponytail/`](ponytail/)
- [`prism/`](prism/)
- [`prism-audit/`](prism-audit/)
- [`prism-evaluate/`](prism-evaluate/)
- [`prism-update/`](prism-update/)
- [`remediate-vuln/`](remediate-vuln/)
- [`requirements-refinement/`](requirements-refinement/)
- [`substrate-node-security-audit/`](substrate-node-security-audit/)
- [`work-package/`](work-package/)
- [`work-packages/`](work-packages/)
- [`workflow-authoring/`](workflow-authoring/)
- [`workflow-design/`](workflow-design/)

## specimens

[`specimens/`](specimens/README.md) holds worked examples of a form: an author copies from them when creating a workflow that needs that form, and a test drives them so the form stays loadable and observable. They travel with the other definitions. Discovery skips any directory named `specimens`, so a walk of this folder does not list them.
