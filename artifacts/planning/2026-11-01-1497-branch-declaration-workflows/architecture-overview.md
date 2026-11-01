# Architecture Overview — Branch Declaration: workflows

> architecture-overview · [m2ux/workflow-server#1497](https://github.com/m2ux/workflow-server/pull/1497) · 2026-11-01

## Summary

The change commits `config/branches` to `workflows`, naming the project's four long-lived branches. It lands in the project's configuration and touches no code. An epic base cut from `workflows` can then state its long-lived branches at its own commit, which is where the work-planner's epic sync reads them.

## Structure

The one changed file is data read by the work-planner skill on `workspace`. The graph finds no indexed symbol in the diff; the reader is `sync.py read_branches`, which reads the file from git at a resolved commit.

```mermaid
---
title: Components — Branch Declaration: workflows
---
flowchart LR
    Sync([sync.py on workspace])

    subgraph Branch [workflows and its epic bases]
        Decl[(config/branches)]
    end

    Sync -->|git show revision:config/branches| Decl

    style Decl fill:#c8e6c9,stroke:#2e7d32
    style Sync fill:#f5f5f5,stroke:#9e9e9e
```

### Workflows and Its Epic Bases

- **`config/branches`.**
  Names `docker`, `main`, `workflows` and `workspace`, one per line, the set `workspace` states.

## Behaviour

One flow reads the declaration.

### Declaration Read

An epic sync given a `workflows` epic base as `--revision` yields the long-lived names.

```mermaid
---
title: Sequence — Declaration Read
---
sequenceDiagram
    actor Caller
    participant Sync as sync.py read_branches
    participant Git as git

    Caller->>Sync: --project, --revision origin/<epic base>
    Sync->>Git: show revision:config/branches
    Git-->>Sync: four names
    Sync-->>Caller: names with source
```

- **Without the file.**
  A `workflows` epic base would be unevaluable, and the sync would name the checks it did not make.

## What Changed

### Workflows and Its Epic Bases

- **Declaration.**
  `workflows` states the long-lived set at its own commit.

## Reading Order

1. **[config/branches](https://github.com/m2ux/workflow-server/blob/7f76f53b881c74f8dbbe4eda07547c71c4ed7f13/config/branches)** — the whole change.

## References

- **R1.** [Task pull request #1495](https://github.com/m2ux/workflow-server/pull/1495) — the task merge this base carries.
