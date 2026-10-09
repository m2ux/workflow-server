# Advisory Read — October 2026

> Standalone delivery · Created 2026-10-09

## Executive Summary

Issue #949 delivers one shared GitHub operation for advisory summaries, with endpoint provenance and an explicit unreadable result. A conformance specimen exercises published and unreachable advisories; a private draft checks repository access.

The issue stands outside I08. Its original body is preserved in an issue comment, and the advisory criteria and dependencies are removed from #946 and #955. The standalone issue owns the advisory smoke run.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Delivery plan](delivery.md) | Implementation scope, decisions, checks and progress |
| [Canon audit](canon-audit.md) | Definition review, closed findings and guard evidence |
| [Corpus guards](canon-guards.log) | Complete corpus-only guard sweep output |
| [Live results](live-results.json) | Projected advisory results and executable assertions recorded from the completed specimen |
| [Live session client](live-session.mjs) | Stdio MCP client used to open, walk and read back the specimen session |

## Links

| Resource | Link |
| --- | --- |
| Issue | https://github.com/m2ux/workflow-server/issues/949 |
| Pull request | https://github.com/m2ux/workflow-server/pull/1290 |
