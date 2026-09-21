---
name: conformance-report
description: Template and rules for the git pin conformance report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Git Pin Conformance Report Guide

## What this guide is for

The shape of `git-pin-conformance-report.md` and what each section may claim. A reader opens that document to answer one question — did the pin operation land each checkout at the revision named, for each kind of name, and refuse the name it could not resolve without touching the checkout — so every section is evidence for that and nothing else.

The repository the checkouts belong to is the run's excuse for having revisions to name. Which commits they were is worth a column and nothing more.

## Template

```markdown
# Git Pin Conformance Report

> One readiness run over two worktrees of one repository

## What was asked and what landed

| Checkout | Name | Expected | Landed commit | Resolved as | Refusal |
|----------|------|----------|---------------|-------------|---------|

## What the refused name left behind

One paragraph. Name the commit the branch pin landed on the first checkout, the commit that checkout's head reads now, and whether they are one commit.
```

## Rules

### expected-beside-landed

Every row carries the form the name was expected to resolve as and the form the pin resolved it as, or the refusal. A row that names only the commit describes a checkout; the pair describes the operation, which is what the document is evidence of.

### a-gap-is-written-as-a-gap

Where the repository carried no tag, the roster carried no tag entry, and the report says so in one line under the table rather than dropping the kind silently. Three kinds resolved and one refused is the whole claim; a repository that cannot exercise one of them is a smaller claim, written as one.

### a-refusal-leaves-a-commit-to-check

The refused name followed the branch pin on the same checkout, so the closing paragraph holds two commits: the one the branch pin landed and the one the head reads afterwards. Say whether they agree. A refusal that moved the checkout is the finding this document exists to catch, and a paragraph reporting the refusal alone would miss it.
