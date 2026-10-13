# Workspace Harness Adapters — October 2026

> Architecture record · Created 2026-10-13

## Executive Summary

Pull request #1300 gives the workspace one command policy and one rendering path, reached by each agent harness through an adapter of its own. The decision about whether a tool call is allowed is made once, in `hooks/`, against data in `config/`; Claude and Codex keep separate entry points only for translating their own event shapes and honouring their own native permission models. Machine-local configuration for each harness is generated from that same policy rather than maintained by hand.

This record holds the architecture overview written for the engineer reviewing that pull request. It explains where the change lands, the two flows a reviewer needs to follow, and the order to read a 57-file diff in. It exists because the issue it delivers, I04:E15:W01, entered review without one.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Architecture Overview](architecture-overview.md) | The change's structure, its flows, and the order to read the diff |

## Links

| Resource | Link |
| --- | --- |
| Pull request | [m2ux/workflow-server#1300](https://github.com/m2ux/workflow-server/pull/1300) |
| Task issue | [I04:E15:W01](https://github.com/m2ux/workflow-server/issues/1299) |
| Epic | [I04:E15](https://github.com/m2ux/workflow-server/issues/1301) |
