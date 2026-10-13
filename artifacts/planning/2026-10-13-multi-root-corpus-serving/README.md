# Multi-Root Corpus Serving — October 2026

> Planning record · Created 2026-10-13

## Executive Summary

The server resolves definitions against one corpus root. A deployment that serves a private corpus beside the public one therefore has to join the two on disk, nesting the public tree inside the private one as a git submodule and pinning it by commit. The join works, and it costs: the whole public tree is served whether or not the private definitions reference it, the public triage ledgers and walk roster are copied into the private branch and re-keyed on every pointer bump, and a public namespace name is reserved against private reuse because the two trees share one id space.

This work makes the root a list. Several corpus roots are configured, walked, and reduced to one index, so two corpora are served as one namespace without either tree holding the other. The name-ambiguity and shadow detection the index already performs run over the union, which turns the reservation rule into a check. The design question the work turns on is the path spelling: the index keys namespaces on the path from the corpus root, and that spelling is what the collision guard leaves live when a name is claimed twice — under several roots the same relative path can arise in each, so the one reference that never collides can.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Evidence](evidence.md) | What the engine does today, measured, with the seams the work uses |
| [Path keys](path-keys.md) | The path-spelling collision, the options, and the decision taken |

## Links

| Resource | Link |
| --- | --- |
| Initiative | [I12 Multi-Root Corpus](https://github.com/m2ux/workflow-server/issues/1374) |
| Root Union | [I12:E00](https://github.com/m2ux/workflow-server/issues/1375) |
| Configured Roots | [I12:E01](https://github.com/m2ux/workflow-server/issues/1376) |
| Guard Reach | [I12:E02](https://github.com/m2ux/workflow-server/issues/1377) |
