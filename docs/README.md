Begin with [setup](setup.md), the shared sequence after a transport is chosen.

## Server

How a running process is bound, and what it exposes.

| Read | What it is |
|------|------------|
| [configuration](configuration.md) | Every flag and environment variable the server reads at startup |
| [api](api.md) | The catalog of tools and HTTP routes |

## Repository

How this tree is built, checked, measured, and written.

| Read | What it is |
|------|------------|
| [development](development.md) | Building and testing this repository |
| [guards](../guards/README.md) | The check programs, and how a verdict is a judgement |
| [benchmark](../benchmark/README.md) | How much text a run sends, and what that run cost |
| [documentation](documentation.md) | Which layer a fact belongs to, and the conventions |

## Authoring

The index of definition documents, and the schema that checks a definition.

| Read | What it is |
|------|------------|
| [corpus](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md) | The definition documents on the workflows branch |
| [schemas](../schemas/README.md) | The schema for a definition and for the session record |


## Architecture

Each model answers one pressure, introduced in [architecture](architecture.md).


| Model                        | Answers                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| [Dispatch](dispatch.md)      | How work is split across a chain of agents                                                    |
| [Checkpoints](checkpoint.md) | How a background agent asks a question it cannot ask directly                                 |
| [State](state.md)            | How the next activity is chosen, where session state lives, and where planning output is kept |
| [Resolution](resolution.md)  | How a name reaches a technique, resource, activity, or routine                                |
| [Delivery](delivery.md)      | What then travels to an agent, how much of it, and what it costs                              |
| [Fidelity](fidelity.md)      | How a claim to have followed the workflow is checked, layer by layer                          |


## Artifacts

Each file an author writes, introduced in [architecture](architecture.md).


| Artifact                  | What it is                                                              |
| ------------------------- | ----------------------------------------------------------------------- |
| [Workflow](workflow.md)   | The guide an operator follows, its phases, and where each outcome leads |
| [Technique](technique.md) | One capability a step names                                             |
| [Routine](routine.md)     | A run of steps written once and spliced in wherever it is needed        |
| [Resource](resource.md)   | Reference material a technique cites and does not contain               |


Plans and decision records live under the engineering root. Work on that branch starts at [its AGENTS.md](https://github.com/m2ux/workflow-server/blob/engineering/AGENTS.md).
