# Single-Use Artifact Operations — November 2026

> Revision record · Created 2026-11-06

## Executive Summary

Artifact operations with one linked procedural reference are part of that caller's sequence. Shared operations remain callable in their owning artifact, and field definitions and command specifications keep their owning homes.

This record traces each eligible operation into its caller, preserving authorization, scope, branch conditions, evidence, retries and result continuation. Record Dispatch Status remains shared because four links from three caller sections reach it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Revision Plan](plan.md) | Eligibility, composition and validation |
| [Original Operations](before.json) | All 100 artifact operations, bodies and incoming reference sites |

## Links

| Resource | Link |
| --- | --- |
| Integration PR | https://github.com/m2ux/workflow-server/pull/1641 |
