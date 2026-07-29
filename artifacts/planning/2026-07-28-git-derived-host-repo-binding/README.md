# Git-Derived Host Repo Binding — July 2026

> Update · Created 2026-07-28 · **Status:** Complete · Revised 2026-07-29

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

This change makes the workflow server work out which repository a work package belongs to by reading git, instead of inferring it from documentation or from a link someone pasted into a request. Previously a session bound from a pull request URL could create an empty, non-git directory and leave the code reviewer with nothing to read — and nothing errored, so the run looked healthy. Delivered as [PR #345](https://github.com/m2ux/workflow-server/pull/345) across five workflow definitions, with 50 of 58 audit findings closed and no Critical or High findings remaining open.

## Problem Overview

When an agent begins a piece of work, it must first decide which repository that work belongs to. Until now that decision came from prose: a line in a project's documentation, or whichever repository name happened to appear in the request — often a pull request link. Nothing checked the answer against what was actually on disk, and the server's own directory lookup used only the last part of the repository name, so a plausible-looking wrong answer resolved to a plausible-looking wrong place.

The consequence was a silent failure rather than an error. A session bound to the repository named in a pull request link was pointed at a directory that did not exist, so the server created it — empty, and not a git repository at all. The step that must record the work then had nothing to record into, and the reviewer had no source code to examine. Because no error was raised, the run appeared to be progressing normally while producing nothing usable.

## Solution Overview

The answer is now derived rather than assumed. A new step reads the repository the agent is standing in, walks upward through any parent repository that claims it as a component, and takes the outermost one as the host — reading its address from git itself. Where a project is a collection of components rather than a single codebase, the host project and the component being worked on are now two separate facts with two separate names, so naming one can no longer be mistaken for the other. A repository mentioned in a request identifies the component; the host is always derived.

Two safeguards sit behind it. The derived name is checked against the directory the server will actually use, and a mismatch stops the run for a decision instead of quietly diverging; and a resumed session is re-checked against the same derivation, which catches a stale binding saved by an earlier run. The [scope manifest](06-scope-manifest.md) carries the file-level breakdown, and the [close-out](09-COMPLETE.md) records what remains open — including two follow-ups that must land in the server's own repository before continuous integration will pass.

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Mode, target, edit-surface path | 15-30m | ✅ |
| 2 | 01 | [Change brief](01-change-brief.md) | Purpose, dimension shape, open judgements | 20-40m | ✅ |
| 3 | 01 | [Impact analysis](01-impact-analysis.md) | Blast radius, integrity, removals | 30-50m | ✅ |
| 4 | 06 | Scope and draft | Worktree, manifest, per-file drafting | 60-90m | ✅ |
| 5 | 06 | [Scope manifest](06-scope-manifest.md) | File-level change inventory | 20-40m | ✅ |
| 6 | 08 | Quality review | Criteria walk, consumer surface, guards | 45-75m | ✅ |
| 7 | 08 | [Findings register](08-findings-register.md) | Audit record, coverage, exclusions | 15-30m | ✅ |
| 8 | 09 | Validate and commit | Scope re-check, commit, pull request | 30-50m | ✅ |
| 9 | 09 | [Close-out (COMPLETE.md)](09-COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ✅ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| Pull request | [m2ux/workflow-server#345](https://github.com/m2ux/workflow-server/pull/345) |
| Target workflow | [workflows/meta/](../../../../workflows/meta/) |
| Related workflow | [work-package](../../../../workflows/work-package/README.md) |
