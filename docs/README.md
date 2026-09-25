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
| Pricing a delivery change | [benchmarks.md](benchmarks.md) |
| Authoring workflow definitions | [technique-protocol-specification.md](technique-protocol-specification.md), [identifier-conventions.md](identifier-conventions.md), [schemas/README.md](../schemas/README.md) |
| Looking for the design principles or the anti-pattern catalog | [design-canon.md](design-canon.md) |
| Adding or changing documentation | [documentation-system.md](documentation-system.md) |

## The architecture models

Each model answers one pressure the design is under. [architecture.md](architecture.md) introduces them and says which pressure each one answers.

| Model | Answers |
|-------|---------|
| [Dispatch](dispatch-model.md) | How work is split across a chain of agents |
| [Checkpoints](checkpoint-model.md) | How a background agent asks a question it cannot ask directly |
| [State management](state-management-model.md) | How the next activity is chosen, and where session state lives |
| [Artifact and workspace isolation](artifact-management-model.md) | How planning output is kept out of the user's source tree |
| [Resource resolution](resource-resolution-model.md) | How a `::` reference reaches a file on disk |
| [Delivery](delivery-model.md) | What then travels to an agent, how much of it, and what it costs |
| [Workflow fidelity](workflow-fidelity.md) | How a claim to have followed the workflow is checked |

## Where other material lives

Workflow definitions — the YAML, the techniques and the resources — live on the [`workflows` branch](https://github.com/m2ux/workflow-server/tree/workflows), with authoring guides at that branch's `docs/` root. Plans, reviews and decision records live under the engineering root and are not product documentation. Work on the engineering branch starts at [its AGENTS.md](https://github.com/m2ux/workflow-server/blob/engineering/AGENTS.md).
