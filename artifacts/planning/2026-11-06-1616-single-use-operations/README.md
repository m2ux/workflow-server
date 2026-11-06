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
| [Validation](validation.md) | Final result, preservation, review corrections and explicit limits |
| [Remaining Operations](after.json) | The 65 shared operations and current references |
| [Inlining Ledger](inlining-ledger.json) | Each removed operation and its caller composition |
| [Preservation Evidence](preservation.json) | Exact specifications/Fields, literal values and instruction disposition |
| [Preservation Log](preservation.log) | Readable changed-context/result lines |
| [Prerequisite Changes](prerequisite-changes.json) | Direct imports whose use moved with the operations |
| [Reference Instrument](inventory-operations.py) | Repeatable incoming-reference inventory |
| [Preservation Instrument](verify-preservation.py) | Repeatable comparison with the pinned baseline |
| [Source Manifest](source.json) | Baseline, first review and corrected source hashes |
| [Planner Tests](planner-tests.log) | Final complete suite and opt-in skip |
| [Shared Tests](shared-tests.log) | Shared checker regressions |
| [Installed Checker](installed-checker.log) | Installed-model result |
| [Section Comparison](section-comparison.log) | Intentional removed operations and changed callers |
| [Sync Reader](sync-reader.json) | Independent route reads, preservation and prerequisite limits |
| [Hoist Reader](hoist-reader.json) | Independent Leave/disposition reads and ownership comparisons |
| [Delivery Reader](delivery-reader.json) | Independent overview/delivery reads and initial continuation findings |
| [Hot-fix Follow-up](hotfix-continuation.json) | Fresh bounded interpretation of the corrected repair route |
| [Merge Follow-up](merge-continuation.json) | Fresh bounded interpretation of the corrected refusal route |

## Links

| Resource | Link |
| --- | --- |
| Integration PR | https://github.com/m2ux/workflow-server/pull/1641 |
