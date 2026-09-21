---
name: conformance-report
description: Template and rules for the gitnexus radius conformance report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# GitNexus Radius Conformance Report Guide

## What this guide is for

The shape of `gitnexus-radius-conformance-report.md` and what each section may claim. A reader opens that document to answer one question — did the reach run answer for every member of the group, naming the graph and the instruments behind each answer, and did it read the registry and derive by hand where the graph held no edge — so every section is evidence for that and nothing else.

The concern the run was asked about is its excuse for having a radius to measure. What depends on it is worth a column and nothing more.

## Template

```markdown
# GitNexus Radius Conformance Report

> Concern: {concern_symbol} in {home_repo} · home radius {risk}, {direct} direct dependents · registry: {contracts} contracts, {cross_links} cross-links

## What the run settled for each member

| Graph | Reach | Instruments | Surfaced by search | Index behind by |
|-------|-------|-------------|--------------------|-----------------|

## The boundary the probes searched for

One line per kind — symbol, route, tool, package — naming the entries or saying the kind came back empty.

## The members the graph could not see

One paragraph. Name each member whose probes came back empty, the instruments that answered instead — the registry's link, the search of its tree — what was asked, and what came back.
```

## Rules

### every-row-names-its-graph

Every row carries the member's graph name in its first column. A row that reports a reach without the graph it came from describes an answer the reader has to guess the source of, which is the condition the namespace's own addressing rule exists to prevent.

### an-empty-graph-answer-carries-its-instrument

A member whose graph held no edge is written with the instruments that answered instead, never as a blank. An empty caller set is absence of evidence, and a row that shows the absence without saying what was done about it reads exactly like a member nobody looked at.

### the-searched-member-is-the-finding

The closing paragraph names each member answered by the registry or by a search of its tree and what came back, whether or not anything did. Those answers are what the run promises where the graph is silent, and a report that omits them would pass with the promise unkept.
