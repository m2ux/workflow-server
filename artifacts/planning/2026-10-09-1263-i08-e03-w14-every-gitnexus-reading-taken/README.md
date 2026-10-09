# Every GitNexus Reading Taken Through a Tool — October 2026

> Work item · Created 2026-10-09

## Executive Summary

Seven techniques in the `support/gitnexus` namespace take their answer from an MCP resource while every other reading in that namespace is a tool call. A client holding the library as tools alone cannot reach them, so a run that binds one lands nothing and reports a reading it never took. This work puts every reading behind a tool the namespace already binds, gives a reading that could not be taken a statement of its own, and holds the namespace to one address with a standing check.

It matters because the readings carry evidence. A flow cycle that appends no trace reads the same as one whose flows have no steps, and a caller deriving findings from that output cannot tell which happened. The defect was reached in a live sidecar walk, where three ranked flows produced no trace and the run declared the output anyway.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W14](w14.md) | The task's overview, problem, design and work breakdown |

## Links

| Resource | Link |
| --- | --- |
| Task issue | https://github.com/m2ux/workflow-server/issues/1263 |
| Parent epic | https://github.com/m2ux/workflow-server/issues/882 |
| Live walk evidence | https://github.com/shieldedtech/midnight-agent-eng/issues/83 |
