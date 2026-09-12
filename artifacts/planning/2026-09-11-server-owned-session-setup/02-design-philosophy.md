# Design Philosophy

> design-philosophy · Server-owned session setup · [#528](https://github.com/m2ux/workflow-server/issues/528) W1 and W2 as one server behaviour · 2026-09-11

## Problem Statement

A new session is born in two agent-executed derivation steps, then a third step that writes `session.json` over whatever the destination folder already holds. The agent-derived `owner/repo` has bound the wrong repository in production. The write has destroyed a live run on resume: measured on a real work package, a cursor and one completed activity before the second dispatch, empty cursor and none after, five history events reduced to two, the same identifier throughout.

### System Context

[`start_session`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L108) asks the agent to pass `repo` derived by hand. [`writeSessionFile`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) is the unconditional persist. Transient [`dispatch_child`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L563) promote uses that persist on the durable folder. Server code lives on `main`; this run is Landing 1 only. The design to implement is the [specification](README.md).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Critical (`bug`, `tech-debt`, `priority: highest`) |
| Scope | Fresh `start_session` that derives `repo` from prose; resume that re-promotes onto a dated slug already holding a session |
| Business Impact | Lost runs that look healthy; wrong-repo binds that proceed as if the checkout were present |

## Problem Classification

**Type:** Specific Problem

**Subtype:**
- [x] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [ ] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Classification-confirmed accepted specific-cause-known: production is failing today, and both cooperating causes are identified — agent-derived `repo`, and unconditional persist on promote and derived-slug create. Complexity is complex: several viable approaches were weighed (reattach vs occupancy-refuse; occupancy on [`writeSessionFile`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) vs a `createSessionFile` wrapper; host bind vs checkout bind), and GitNexus rates that persist function CRITICAL (6 direct callers, 9 processes, 4 modules). [`registerResourceTools`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/tools/resource-tools.ts#L84) is also CRITICAL (33 upstream symbols). The specification already chooses the cuts; remaining work is implementation of a known design.

## Workflow Path Decision

**Selected Path:** Direct to planning

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Skip optional. Complex problems warrant the full path; this selection diverges because the [specification](README.md) already holds the requirements, the conventional solutions, and the occupancy / `createSessionFile` / checkout-not-host cuts. Elicitation and research would restate that document. At complex, the design framework also warrants inventive solutions; those alternatives (reattach, occupancy-on-`writeSessionFile`, host-bind) were weighed in the spec and are not reopened. Comprehension precedes planning on every path.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Landing 1 only. Corpus rewrite and transient-folder deletion are later landings |
| Technical | [`writeSessionFile`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) contract unchanged. Occupancy-refuse, not reattach. Bound repository is the checkout under work |
| Dependencies | [Specification](README.md), [change brief](01-change-brief.md), [impact analysis](01-impact-analysis.md) |
| Resources | Worktree `.worktrees/feat/528-server-owned-session-setup` on `feat/528-server-owned-session-setup` |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Fresh create from checkout | `start_session` given `working_directory` | Derived `owner/repo`, durable folder, `session_index`, no transient directory |
| Bind subject | Origin remote of the checkout under work | Differing host reported, not bound |
| Non-git path | `working_directory` is not a checkout | Refused; no directory created |
| Derivation disagreement | Caller `repo`, basename, unmapped root, several unnamed components, no origin | Named open decision; no session created |
| Occupied readable session | Create or transient promote onto a folder holding `session.json` | `FOLDER_OCCUPIED`; files byte-identical |
| Unreadable session | `session.json` present with broken seal | Refused; key-rotation wording; files untouched |
| Named resume | Caller named an existing `planning_folder` | Top-level session resumed |
| Persistent parent | Second `dispatch_child` from a durable parent | Appends; occupancy does not fire |
| Persist split | Occupancy on `createSessionFile` and the promote existence check | [`writeSessionFile`](https://github.com/m2ux/workflow-server/blob/c62606b2c26b348f367ecaaa12f8f0009a1c7a87/src/utils/session/store.ts#L422) remains the unconditional persist |
