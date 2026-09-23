---
name: conformance-report
description: Template and rules for the gitnexus radius conformance report, the one document a run leaves behind.
metadata:
  version: 2.0.0
  order: 1
---

# GitNexus Radius Conformance Report Guide

## What this guide is for

The shape of `gitnexus-radius-conformance-report.md` and what each section may claim. A reader opens that document to answer one question — did the reach run answer for every member of the group, naming the graph and the instruments behind each answer, separating what the member consumes from what it references, and deriving by hand where the graph held no edge — so every section is evidence for that and nothing else.

The concern the run was asked about is its excuse for having a radius to measure. What depends on it is worth a column and nothing more.

## Template

```markdown
# GitNexus Radius Conformance Report

> Concern: {concern_symbol} in {home_repo} · home radius {risk}, {direct} direct dependents · registry: {contracts} contracts, {cross_links} cross-links

## What the run settled for each member

| Graph | Reach | Dependency | Instruments | Surfaced by search | Index behind by |
|-------|-------|------------|-------------|--------------------|-----------------|

## The boundary the probes searched for

One line per kind — symbol, route, tool, package — naming the entries or saying the kind came back empty.

## The members the graph could not see

One paragraph. Name each member whose probes came back empty, the search of its tree that answered instead, what was asked, and what came back.

## The couplings the registry and the tree disagree on

One paragraph. Name each member consuming the home as a library that holds no reference to the concern, and each member referencing the concern that the group's links do not declare.
```

## Rules

### every-row-names-its-graph

Every row carries the member's graph name in its first column. A row that reports a reach without the graph it came from describes an answer the reader has to guess the source of, which is the condition the namespace's own addressing rule exists to prevent.

### an-empty-graph-answer-carries-its-instrument

A member whose graph held no edge is written with the instruments that answered instead, never as a blank. An empty caller set is absence of evidence, and a row that shows the absence without saying what was done about it reads exactly like a member nobody looked at.

### the-searched-member-is-the-finding

The closing paragraph names each member answered by a search of its tree and what came back, whether or not anything did. That search is what the run promises where the graph is silent, and a report that omits it would pass with the promise unkept.

### the-reach-column-rests-on-symbol-evidence

A row's reach carries what an instrument found of the concern itself in the member — a dependent among the member's own edges, or a boundary symbol in its tree. A library link and a package name both say the member depends on the tree the concern sits in, which is true of every symbol that tree holds alike, so a reach column fed from either reads the same for a member built around the concern and a member that never names it.

### a-consumer-without-a-reference-is-named

The report names each member the registry declares a consumer of the home whose reach came back `none`. The pair is the run's sharpest answer — the member could reach the concern and, as far as both symbol instruments saw, does not — and a report carrying only the members something was found in leaves the reader to read an absent row as an unasked question.
