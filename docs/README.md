# Documentation Catalogue

## Start here

Read the page for the task in front of you.

| If you are                                | Read                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Installing or deploying the server        | [setup.md](setup.md)                                                               |
| Setting a flag or an environment variable | [configuration.md](configuration.md)                                               |
| Calling the tools                         | [api.md](api.md)                                                                   |
| Building or testing the server            | [development.md](development.md)                                                   |
| Running a guard, or adding one            | [guards/README.md](../guards/README.md)                                            |
| Pricing a delivery change                 | [benchmark/README.md](../benchmark/README.md)                                      |
| Authoring workflow definitions            | [Document corpus](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md), and [schemas/README.md](../schemas/README.md) |
| Adding or changing documentation          | [documentation.md](documentation.md)                                               |




## Architecture

Each model answers one pressure, introduced in [architecture](architecture.md).


| Model                                               | Answers                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| [Dispatch](dispatch.md)       | How work is split across a chain of agents                                    |
| [Checkpoints](checkpoint.md)  | How a background agent asks a question it cannot ask directly                 |
| [State](state.md)             | How the next activity is chosen, where session state lives, and where planning output is kept |
| [Resolution](resolution.md)   | How a name reaches a technique, resource, activity, or routine                |
| [Delivery](delivery.md)       | What then travels to an agent, how much of it, and what it costs              |
| [Fidelity](fidelity.md)       | How a claim to have followed the workflow is checked, layer by layer          |

## Artifacts

Each file an author writes, introduced in [architecture](architecture.md).

| Artifact | What it is |
|----------|------------|
| [Workflow](workflow.md) | The guide an operator follows, its phases, and where each outcome leads |
| [Technique](technique.md) | One capability a step names |
| [Routine](routine.md) | A run of steps written once and spliced in wherever it is needed |
| [Resource](resource.md) | Reference material a technique cites and does not contain |



