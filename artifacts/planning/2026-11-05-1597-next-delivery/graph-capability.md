# Graph Measurement Capability

This is preliminary integration-review preparation at652ef07ea5b8553d3bdb73542c3a393ac20e6ea9 against workspace03d353300ca4804194fd50d316d73e3bf1270d1d. The final integration head requires a fresh matching review checkout, index and measurements. These data do not certify the final head or complete Change Overview.

## Measured Result

The isolated GitNexus1.6.12 index reports1197changed symbols across53files and33affected flows. The canonical installed diff parser and raw indexed line ranges recover all1197unique symbols, including all1000backend-listed symbols. Every recovered symbol has a successful UID-matching context result. Exact process-membership queries recover144steps for the33flows; each flow has its reported count and contiguous indexes beginning at1. Independent parent checks find zero completeness or identity discrepancies. Status before and after names the same current/indexed652ef07commit; the detached review checkout remains clean.

## Interface Limits

- The CLI surface formatter prints at most15symbols; the backend surface lists at most1000and flags truncation. A formatted subset is not the complete change surface.
- Native fresh responses omit optional staleness payloads. The saved independent status records establish freshness; no native staleness block is invented.
- Native flow-name queries rank symbol-search matches. A flow ID can return no process; its label can return another process and only a subset of its symbols. Exact process-membership rows are retained separately, with raw zero-based line coordinates; context display coordinates are one based.
- Native contexts cap ordinary relationship windows at30. The saved raw relationship query supplies1864indexed edges without that display cap. Indexed flows still carry analyzer coverage warnings:157candidate entries unranked,585branch-capped callees and21walk-budget cuts. No absence or runtime-execution proof follows from the graph.

## Execution Bounds

The first measurement process is interrupted after970contexts. Resume validates each saved UID/result and collects only missing contexts before continuing. The completed prototype uses the archived v2instrument; its initial version is retained separately. A temporary-index read-only replay failure is recovered through the installed adapter, which quarantines a pending WAL with no shadow sidecar and later reclaims it. This is a capability probe, not the final index. A191KBrelationship query completes with an evaluator warning; the prepared final instrument uses the installed parameterized-query API and four bounded context workers. Final measurements must prove their own complete counts, freshness and identities.

## Published Evidence

The archive contains native contexts/search responses, exact raw graph rows, source-surface recovery, actual status, analyzer output and the executed instruments. The manifest binds every regular relative-path member and archive hash. It excludes index databases, credential material and raw system sessions. These are tool-returned data and local instrument checks, not claims about model-received token volumes.
