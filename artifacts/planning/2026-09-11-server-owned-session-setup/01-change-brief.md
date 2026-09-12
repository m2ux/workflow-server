# Change Brief — Server-owned session setup (Landing 1)

**Workflow:** `work-package` v4.1.0
**Mode:** Create
**Date:** 2026-09-11
**Change categories:** Server, session store, tool contract
**Change request:** Landing 1 of [the specification](README.md) — `#528` W1 and W2 as one server behaviour, on `main`.
**Issue:** [#528](https://github.com/m2ux/workflow-server/issues/528) — W1 (occupancy refusal) and W2 (git-derived bind from `working_directory`).
**Scope this run:** Landing 1 only. Corpus rewrite and transient-folder deletion are Landings 2 and 3.
**Baseline:** `origin/main` of `m2ux/workflow-server`. GitNexus on this tree rates `writeSessionFile` **CRITICAL** (six direct callers, nine processes, four modules). The specification does not change that function's contract.

---

## Problem Overview

A new session today is born in two steps an agent performs by following prose, then a third step that writes over whatever it finds. The agent is asked to pass `owner/repo` derived by hand. That derivation has bound the wrong repository in production: a name taken from a pull-request link, an empty directory where source was expected, a session thrown away at 81,762 tokens, a planning folder minted under the dated fallback and written into for three days. The third step is `writeSessionFile` during promote. A resume repeats the same sequence, lands on the same slug, and replaces the run already in that folder. The identifier is derived from the folder plus slot zero, so the caller is handed the identifier of the run that was just destroyed. Measured on a real work package: a cursor and one completed activity before, an empty cursor and none after, five history events reduced to two, the same identifier throughout.

Those two faults keep losing work, and they keep looking healthy. This run moves the deterministic half onto the server: the working directory is the input, git at that path is the bind, the planning folder is durable, and a folder that already holds a session is refused with the folder and the existing identifier named, files untouched.

## Purpose

| Goal | Meaning |
|------|---------|
| Bind from the checkout | `start_session` takes `working_directory`. The bound `owner/repo` is that checkout's origin remote, not a name from a link and not the outermost superproject unless that is the checkout. |
| Create durable, never transient, on this path | A fresh session with `working_directory` lands on a durable planning folder and returns `session_index`. No process-local temp directory is registered for this call. |
| Refuse occupancy | A create or a transient promote whose destination already holds a readable `session.json` throws `FOLDER_OCCUPIED`, names the folder and the existing `session_index`, and leaves both session files byte-identical. An unreadable session is refused with its own code, naming key rotation. |
| Keep `writeSessionFile` unconditional | Occupancy lives on `createSessionFile` and on the promote branch's existence check. Tests for migration, concurrency, and the store keep calling `writeSessionFile`. |
| Return open decisions, not silent binds | Caller `repo` disagreeing with derivation, basename mismatch, unmapped root, several unnamed component submodules, and no origin remote each return a named open decision with candidates and a recommendation. No session is created. |
| Leave judgement with the agent | Workflow matching, resume intent, and presenting an open decision stay in `meta`. This landing does not rewrite those activities. |

**Out of scope (this run):**

- Landing 2: corpus bootstrap, `discover-session` / `initialize-session` / `resolve-target`, published sentences that instruct the agent to derive `repo`.
- Landing 3: deleting the transient folder, the process-local registry, and the promote branch.
- Reattach: continuing a child found in an occupied folder.
- Profiles, locked seeds, inherited variable declarations.
- Deleting `resolve-host-repo`. The create call implements it; the technique remains the documented algorithm.

---

## Dimensions

This landing is server code on `main`. No workflow graph, activity, checkpoint, or corpus file is edited.

| Dimension | This run's shape |
|-----------|------------------|
| **Call contract** | Fresh `start_session` requires `working_directory` (absolute). `planning_folder` / slug remain an optional hint. `repo` is optional and must equal the derived `owner/repo` when present. Resume of a named folder stays. |
| **Derivation** | Invert path presentation, `git rev-parse --show-toplevel`, origin remote of that toplevel, host ascent for facts (`host_repo`, `component_path`) that are not the bind. Open decisions as in the specification. |
| **Occupancy** | `sessionFileExists` before any write. `createSessionFile(folder, state)` throws `FOLDER_OCCUPIED` when the file exists, then persists. Transient `dispatch_child` onto an occupied folder takes the same error. Persistent parent still appends. |
| **Errors** | `describeSessionStoreError` gains a `FOLDER_OCCUPIED` arm. Broken-seal refuse names key rotation. |
| **Published surface on this landing** | Only sentences that become false because promote-over-occupied stops: the `dispatch_child` description, `docs/dispatch-model.md`, and the site generator string that restate the wipe. Agent-facing "derive `repo`" instructions move with Landing 2. |
| **Tests** | Ten new cases against the real store, as listed in the specification. Existing start-session, dispatch-child, migration, and concurrency suites stay green. |

---

## Open judgements

None. The specification is the brief. Landing 1, the checkout-not-host bind, the `createSessionFile` cut, and the ten tests are settled there. Product decisions this run does not reopen: reattach, transient deletion, corpus rewrite.

---

## What Landing 1 owns

| # | Acceptance criterion | Standing |
|---|---|---|
| 1 | Fresh `start_session` with `working_directory` derives `owner/repo`, creates a durable folder, returns `session_index` with no transient directory | This run |
| 2 | Bound repository is the checkout under work; a differing host is reported, not bound | This run |
| 3 | Non-git working directory is refused; no directory is created for it | This run |
| 4 | Named open decisions with candidates and recommendation; no session created | This run |
| 5 | Occupied readable session refused as `FOLDER_OCCUPIED`; files untouched | This run |
| 6 | Unreadable session refused with key-rotation wording; files untouched | This run |
| 7 | Named existing planning folder still resumes | This run (pin) |
| 8 | Persistent parent still appends | This run (pin) |
| 9 | `writeSessionFile` remains the unconditional persist | This run |
| 10 | No setup activity in `meta` exists solely to derive a fact the create call returns | Landing 2 |
| 11 | Published "derive `repo`" sentences rewritten in the same commits that make them false | Landing 2, after this landing makes replace-on-promote false |
