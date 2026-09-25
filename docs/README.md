# Workflow Server documentation

These pages hold the contract: exact values, field names, ordering rules and the commands that exercise them. Read them when you are implementing against the server, auditing a run, or debugging one.

For the illustrated read — how the pieces relate, with diagrams — start at the [documentation site](https://m2ux.github.io/workflow-server/).

## Start here

| If you are | Read |
|------------|------|
| Installing or deploying the server | [setup.md](setup.md), then [http.md](http.md) or [stdio.md](stdio.md) for your transport |
| Setting a flag or an environment variable | [configuration.md](configuration.md) |
| Calling the tools | [api-reference.md](api-reference.md) |
| Building or testing the server | [development.md](development.md) |
| Running a guard, or adding one | [guards/README.md](../guards/README.md) |
| Pricing a delivery change | [benchmark/README.md](../benchmark/README.md) |
| Authoring workflow definitions | [Document corpus](#document-corpus), and [schemas/README.md](../schemas/README.md) on this tree |
| Adding or changing documentation | [documentation-system.md](documentation-system.md) |

## The architecture models

Each model answers one pressure the design is under. [architecture.md](architecture.md) introduces them and says which pressure each one answers.

| Model | Answers |
|-------|---------|
| [Dispatch](dispatch-model.md) | How work is split across a chain of agents |
| [Checkpoints](checkpoint-model.md) | How a background agent asks a question it cannot ask directly |
| [State management](state.md) | How the next activity is chosen, and where session state lives |
| [Artifact management](artifact-management-model.md) | How planning output is kept out of the code change |
| [Resource resolution](resource-resolution-model.md) | How a `::` reference reaches a file on disk |
| [Delivery](delivery-model.md) | What then travels to an agent, how much of it, and what it costs |
| [Fidelity](fidelity.md) | How a claim to have followed the workflow is checked, layer by layer |

## Document corpus

Definitions and the docs that describe them live on the `workflows` branch. This is the only list of those links in this tree. Other pages name the document and point here.

| Document | What it is |
|----------|------------|
| [Authoring guide](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md) | Layout, and how to add a workflow, resource, technique, or routine |
| [Technique protocol](https://github.com/m2ux/workflow-server/blob/workflows/docs/technique-protocol-specification.md) | The technique file contract |
| [Identifier conventions](https://github.com/m2ux/workflow-server/blob/workflows/docs/identifier-conventions.md) | How every id in a definition is spelled |
| [Canon](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/README.md) | The namespace the four homes below are served from |
| [Design principles](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/design-principles.md) | The stance an author writes toward |
| [Anti-patterns](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md) | Smells, each as detect, do not flag, fix |
| [Schema construct inventory](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/schema-construct-inventory.md) | A prose pattern mapped to the construct that carries it |
| [Convention conformance](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/convention-conformance.md) | Comparison against sibling workflows |
| [Design canon](https://github.com/m2ux/workflow-server/blob/workflows/docs/design-canon.md) | How to reach the four homes, and how to cite one |

Plans, reviews, and decision records live under the engineering root and are not product documentation.
