# Server-owned session setup: the checkout on disk decides the repository, a new session never writes over an old one

> Specification · 2026-09-11 · [#528](https://github.com/m2ux/workflow-server/issues/528) W1 and W2 as one behaviour. Companion records: [session reattach](../2026-08-04-session-reattach/README.md), [session-creation capture](../2026-08-02-session-presets-consolidation/issue-401-session-creation.md), [deep-dive decisions 9, 12, 14](../2026-08-02-session-presets-consolidation/deep-dive-decisions.md), [git-derived host binding](../2026-07-28-git-derived-host-repo-binding/README.md).

This is the change to build. It is not a redesign of how a run continues — that waits on the append-only session record — and it is not a rewrite of the meta workflow's judgement calls. It is the server taking the working directory, deriving what git already knows, creating the session on a durable folder, and refusing any write that would replace a session already in that folder.

**GitNexus impact on `writeSessionFile` is CRITICAL** (six direct callers, nine processes, four modules). This specification does not change that function's contract. A create that finds `session.json` already present refuses, and the promote path stops calling the unconditional write.

## Solution Overview

This landing has the server take the working directory of the checkout under work, read that checkout's git origin as the bound repository, and create the session on a durable planning folder. If that folder already holds a session, the call names the folder and the existing identifier and leaves the files untouched. The persist function that writes every session stays as it is; occupancy lives on a create-only wrapper and on the promote path's existence check.

The guarantee is that a fresh start from a real checkout cannot bind a name taken from a link, and a resume cannot destroy the run already in the folder while handing back that run's identifier. Workflow matching and resume intent stay with the agent. Corpus bootstrap rewrite and deletion of throwaway sessions are later landings.

## Summary

A session today is born in two steps an agent performs by following prose, then a third step that writes over whatever it finds. The first two have been wrong in production. The third destroys a run on resume and reports the identifier of the run it destroyed.

One call does the deterministic half. The working directory is the input. The repository under work is the origin remote of that checkout, not a name taken from a link and not the outermost superproject unless that is the checkout. The planning folder is created durable. If that folder already holds a session, the call names the folder, names the reason, and leaves the file untouched.

Judgement stays with the agent: matching a request to a workflow, reading resume intent from prose, presenting an ambiguity the derivation could not settle. Those are the activities that survive.

## What happens today

`start_session` asks the agent to pass `repo` as `owner/repo`, "derived from git via `version-control::resolve-host-repo`". Omit `planning_folder` and the session is born under `os.tmpdir()`, registered in a process-local map the code documents as fragile across restarts. The first `dispatch_child` then calls `ensurePlanningFolder` — an idempotent mkdir — and `writeSessionFile`, whose comment says it replaces whatever the folder holds. The child's identifier is derived from the folder plus the slot it occupies. Both the first run and the second put their child in slot zero, so both derive the same identifier. The caller is handed it back. Every later call succeeds against an empty session.

Measured on a real work package: cursor and one completed activity before, empty cursor and none after, five history events reduced to two, the same identifier throughout. The `dispatch_child` tool description states this as current behaviour. `docs/dispatch-model.md` states it. The site data generator states it. Nothing tests the second-dispatch path.

The derivation the agent is asked to perform has failed in production. One run bound a repository named in a pull-request link rather than the checkout, created an empty directory where the reviewer expected source, and looked healthy throughout. The same fault elsewhere threw a session away at 81,762 tokens. A planning folder was minted under the dated fallback and written into for three days across six commits. A review of a `midnight-node` pull request bound `shieldedtech/midnight-agent-eng` because the technique answers the host, not the component, and every downstream activity substituted the real repository by hand.

The ceremony that carries this procedure is the near-term performance tax. Clean runs reach real work 18–32 minutes after the request. Four meta workers pay 124,000 cache-write tokens before the client workflow starts; 38% of one timed startup was orchestrator handoff with nothing executing. Of the four activities, repo derivation, session creation and planning-folder resolution are deterministic. Workflow matching, resume intent, and a multi-component choice when the working directory is the host of a monorepo are not.

## The change

`start_session` takes `working_directory`. It maps that path from the agent-facing namespace into the server's (the inverse of the presentation map already used the other way). It derives the repository from git at that path. It creates the session on a durable planning folder. It never writes a new `session.json` over one that is already there.

`dispatch_child` from a parent that is still transient — until that path is deleted — meets a destination that already holds a session and refuses, with the same occupancy error, leaving the file untouched. A persistent parent still appends.

The throwaway-then-promote machinery is deleted once no caller depends on omitting both `working_directory` and `planning_folder`. Until then, promote may still move a first-time transient session onto an *empty* durable folder. It may not move one onto a folder that already holds a session.

### Call contract

Fresh session:

| Argument | Role |
|---|---|
| `working_directory` | Absolute path of the checkout under work. Required for a fresh session. Bare and relative paths are rejected, same rule as `planning_folder` today. |
| `planning_folder` / slug | Optional hint. Basename is the slug. When omitted, the slug is `YYYY-MM-DD-{initiative}` when the request yields a kebab-case initiative, otherwise `YYYY-MM-DD-{workflow_id}`. |
| `repo` | Optional. When present it must equal the derived `owner/repo`. Disagreement is an open decision, not a silent win for the caller. |
| `workflow_id` | Unchanged. Default `meta`. |
| `user_request`, `agent_id`, `context_mode` | Unchanged. |

Resume of a top-level session the caller named: pass `planning_folder` (or a slug that `findPlanningFolderBySlug` resolves). That path already loads the sealed file and restamps drift. It does not write a new session. It stays.

A derived slug that collides with a folder already holding a session is not a resume. It is occupancy. The caller did not name that folder; the dated fallback did. Refusing costs one call. Auto-resuming would continue yesterday's work package when the caller wanted a new one. Overwriting is the defect.

### Derivation

The algorithm is the one `version-control::resolve-host-repo` already writes, with one change of subject: the repository bound on the session is the checkout under work, not the outermost superproject unless that is the checkout.

1. Invert path presentation, then `git -C {working_directory} rev-parse --show-toplevel`. Failure means the path is not a git checkout: refuse. Do not mkdir a directory the caller named and do not create a session against it. This is the empty-directory incident.
2. The bound repo is `git -C {toplevel} remote get-url origin`, accepting SSH and HTTPS, dropping a trailing `.git`. No origin remote: open decision `unbound-repo`, with the work already done (toplevel path, any host ascent) kept on the response. The session is not created. The documented fallback — the user, or the workspace `AGENTS.md` — is how the caller supplies `repo` on a retry, and that retry is the only case in which a caller-supplied `repo` is admitted without a matching derivation.
3. Ascend while the parent directory is a git repository whose `.gitmodules` names the current toplevel as a submodule path, classifying infrastructure crossings the way the technique already does. Emit `host_repo` when it differs from the bound repo, and `component_path` relative to that host. These are facts on the response. They are not the bind.
4. If `basename({toplevel})` disagrees with the repository segment of the bound `owner/repo`, open decision `binding-mismatch`. The server maps `owner/repo` onto a filesystem root by basename alone, and binding anyway is how a session lands on a directory that is not the checkout. Keep the derivation on the response. Do not create.
5. If the working directory is the host of a monorepo with more than one non-infrastructure component submodule, and nothing in the request names one, open decision `component-choice` with the candidate list and a recommendation. Keep the host bind. Do not guess a component. This is the gate `resolve-target` already presents; it moves onto the response of the create call so the orchestrator can put it to the user without a worker having derived it first.
6. A working directory that is a git checkout but sits outside every session search root: open decision `unmapped-root`. Container deployments are the expected case. Do not hard-error a path the presentation map has not mounted.

An open decision is a successful tool call with no `session_index`. It names `decision`, `candidates`, and `recommendation`. It is not a checkpoint: a checkpoint needs a live session already walking an activity. The orchestrator presents it and calls back. This is decision 12 of the session-presets record, unchanged.

### Occupancy

A create or a promote consults `sessionFileExists` before any write.

| What is in the folder | What the call does |
|---|---|
| No `session.json` | Create. `writeSessionFile` as today. |
| Readable `session.json`, and the caller named this folder | Resume the top-level session (existing `start_session` branch). `dispatch_child` does not take this branch: a persistent parent appends; a transient promote refuses. |
| Readable `session.json`, and the caller did not name this folder (derived slug, or promote onto a slug) | Refuse `FOLDER_OCCUPIED`. Name the folder. Name the existing `session_index` so the caller can continue that run if that is what they meant. Leave both files untouched. |
| `session.json` present and unreadable (`SEAL_MISMATCH`, schema-invalid, missing seal) | Refuse with that code. The message names a rotated signing key as the likely cause. Leave the files untouched. An unreadable session is not an absent one. |

`writeSessionFile` stays the unconditional persist for a folder whose `session.json` this call has just established is absent, and for migration of a legacy folder that has no `session.json` yet. GitNexus rates a contract change CRITICAL. Do not add occupancy to it. Add `createSessionFile(folder, state)` that throws `SessionStoreError('FOLDER_OCCUPIED')` when the file exists, then persists. `start_session`'s fresh branch and `dispatch_child`'s promote-to-empty-folder branch call it. Tests for migration, concurrency, and the store keep calling `writeSessionFile`.

`describeSessionStoreError` gains a `FOLDER_OCCUPIED` arm: the folder already holds a run; nothing was written; pass that `session_index` to continue it, or pass a distinct `planning_folder` to open another.

### What the meta workflow keeps

| Activity | After this change |
|---|---|
| `discover-session` | Match the request to a workflow. Read resume intent. Present any open decision the create call returned. It does not derive the host repository. |
| `initialize-session` | `dispatch_child` of the matched client workflow into the durable parent, with the slug the create call already bound (or `derive-planning-slug` when the initiative is named after create). It does not bind `repo`. |
| `resolve-target` | Present `component-choice` when the create call returned it. The detect-and-list techniques run only to fill that presentation if the create call did not. They do not run on the path where the working directory already sat inside one component. |
| `dispatch-client-workflow` | Unchanged. |
| `end-workflow` | Unchanged. |

No setup activity remains whose entire job is a derivation the server just performed. That is the #528 criterion "no setup activity remains that contains no judgment call", applied to these three, not to the whole corpus.

## Why W1 and W2 are one change

A durable create without occupancy refusal recreates the wipe on the dated fallback: two meta bootstraps on the same day for the same workflow id share `YYYY-MM-DD-work-package`, and the second write lands on the first run. Occupancy refusal without derivation leaves the agent still executing the 48-line procedure, still passing `repo` from a link when the prose slips, still opening a transient session whose promote is the wipe.

Continuing a child in an occupied folder — reattach — is not this change. Six faults a straightforward reattach walks into are already paid for, each found by reviewing a first attempt that was written and then taken back out. They belong to the append-only session record. Refusing costs the caller one call. Continuing, done wrong, costs them the run.

## Blast radius

`writeSessionFile` is CRITICAL to change. Direct callers: `registerResourceTools` (both `start_session` and `dispatch_child`), `migratePlanningFolder`, and four test files (`session-store`, `session-scope`, `session-concurrency`, `mcp-server`). Indirect: `createServer`, the HTTP and stdio transports, the e2e harness, every walk script that opens a session. The create-only wrapper is the cut that keeps that contract.

`dispatch_child`'s transient branch is the occupancy subject. The persistent-parent branch already appends under compare-and-swap and is out of this change.

`resolveSessionRoot` still maps `owner/repo` onto `$ROOT/<repo>/.engineering`. After this change the `repo` it receives is derived, so the empty-directory mkdir sits behind a checkout that git has already confirmed. The multi-root error that currently tells the agent to run `resolve-host-repo` is rewritten against `working_directory`.

Tool descriptions, `docs/dispatch-model.md`, `docs/ide-setup.md`, the site generator string that restates the wipe, and `AGENTS.md` / `CLAUDE.md` bootstrap wording are the published surface. Each currently instructs the agent to derive `repo` and currently describes replace-on-promote as fact. They move with the behaviour, in the same commits that make the old sentence false.

## Tests

New cases, against the real store, not a stub that cannot see a second write:

1. Fresh `start_session` with `working_directory` at a checkout whose origin is `owner/repo` binds that repo, creates a durable folder, returns `session_index` and `planning_folder_path`. No transient directory is registered.
2. The same call with `working_directory` inside a non-infrastructure submodule binds the submodule's origin, not the superproject's. `host_repo` is present on the response when it differs.
3. `working_directory` that is not a git checkout is refused. No folder is created under the mapped basename.
4. Caller `repo` that disagrees with the derivation returns open decision `binding-mismatch` and creates nothing.
5. Derived slug whose folder already holds a readable session throws `FOLDER_OCCUPIED`, names that session's index, and leaves `session.json` and `.session-token` byte-identical to before the call.
6. Named `planning_folder` whose folder already holds a readable session resumes it (existing behaviour, pinned so occupancy does not swallow it).
7. Transient `dispatch_child` onto a folder that already holds a session throws `FOLDER_OCCUPIED` and leaves the file. This is the measured wipe, inverted.
8. Transient `dispatch_child` onto a folder with `session.json` present and a broken seal throws `SEAL_MISMATCH`, names key rotation, and leaves the file. Treating unreadable as absent was the first reattach attempt's second route to the same destruction.
9. Persistent-parent `dispatch_child` still appends; occupancy does not fire. Two children of one workflow remain reachable only this way, and this change does not take it.
10. Open decision `component-choice` when `working_directory` is a host with two non-infrastructure component submodules and the request names neither. Session is not created. A second call that names one of the candidates creates.

The existing start-session, dispatch-child, migration, and concurrency suites stay green. A test that currently depends on promote-over-occupied is not believed to exist; if one appears, it is asserting the defect.

## Acceptance criteria

- A fresh `start_session` given `working_directory` derives `owner/repo` from that checkout's origin, creates a durable planning folder, and returns `session_index` without a transient directory.
- The bound repository is the checkout under work. A host that is a superproject of that checkout is reported, not bound, unless the working directory is the host.
- A working directory that is not a git checkout is refused. No directory is created for it.
- A caller `repo` that disagrees with the derivation, a basename that disagrees with the origin, an unmapped root, a host with several unnamed component submodules, and a checkout with no origin remote each return as a named open decision with candidates and a recommendation. No session is created. The derivation already done is on the response.
- A create or promote whose destination already holds a readable session is refused as `FOLDER_OCCUPIED`, names the folder and the existing `session_index`, and leaves both session files untouched.
- A create or promote whose destination holds an unreadable session is refused with a reason that names key rotation, and leaves the files untouched.
- A `start_session` whose caller named an existing planning folder still resumes that top-level session.
- A persistent parent still appends a second child.
- `writeSessionFile` remains the unconditional persist. Occupancy lives on `createSessionFile` and on the promote branch's existence check.
- No setup activity in `meta` exists solely to derive a fact the create call returns.
- The published sentences that currently describe replace-on-promote, and the published sentences that currently instruct the agent to derive `repo`, are rewritten in the same commits that make them false.

## Non-goals

- Reattach: a dispatch that continues the child it finds, with cursor, completed activities and variables intact. The six hazards are recorded. The append-only session record is what makes this cheap. This change refuses.
- Profiles, locked seeds, inherited variable declarations. Those are #528's neighbours, not this behaviour.
- Deleting `resolve-host-repo`. The create call implements it. The technique remains the documented algorithm and the agent-side fallback for a workspace that is not a git repository.
- Workflow matching, initiative slugification beyond the dated fallback, and reading resume intent from free text. Those stay in `discover-session`.
- Resuming through a persistent parent. That path appends. It overwrites nothing.
- Content-addressed delivery, coverage-walk narrowing, routines, typed execution.

## Landing

Code and definitions sit on separate long-lived branches. The behaviour is one change; the merges are three, in this order.

1. **Server, on `main`.** `working_directory`, derivation, `createSessionFile`, occupancy on promote, open-decision shape, tests 1–10. Transient create remains for a caller that omits both `working_directory` and `planning_folder`, so today's bootstrap still boots. Promote onto an occupied folder already refuses, so the wipe stops on this landing.
2. **Corpus, on `workflows`.** Bootstrap procedure, `start_session` description as served to agents, `discover-session` / `initialize-session` / `resolve-target` as in the table above, `create-session` no longer passing an agent-derived `repo`, `docs/ide-setup.md` and the dispatch-model paragraph. The wipe sentence is deleted because the first landing made it false; this landing deletes the instruction that produced the derivation incidents.
3. **Server, on `main`.** Delete the transient folder, the process-local registry, and the promote branch. A fresh session without `working_directory` is refused. Adoption of the corpus landing is the same commit as this deletion if the pointer would otherwise describe a bootstrap the server no longer serves.

Landing 1 is the reliability fix and can ship alone. Landings 2 and 3 are the performance half: they are what remove the ceremony workers. Shipping 2 without 1 leaves the corpus describing a call the server does not honour. Shipping 3 without 2 breaks every agent still omitting `working_directory`.

## Investigation detail

The wipe, the six reattach hazards, and the corpus-side gate semantics: [2026-08-04-session-reattach](../2026-08-04-session-reattach/README.md).

The W2 decisions this specification implements — filesystem path as input, open decision rather than error, durable create and deletion of temp-then-promote: [deep-dive decisions](../2026-08-02-session-presets-consolidation/deep-dive-decisions.md) 9, 12, 14, and the container-path constraint carried with no further decision.

The component-not-host bind: #528 W2 as filed, extending the host-derivation incident recorded in [git-derived host binding](../2026-07-28-git-derived-host-repo-binding/README.md). `resolve-host-repo` remains the algorithm; its subject on the session is the checkout under work.

Startup cost the ceremony currently pays: [startup cost on real runs](../2026-08-06-startup-cost-on-real-runs/README.md) and [work-package startup cost](../2026-08-02-workflow-startup-cost/README.md).

GitNexus: `gitnexus_impact({ target: "writeSessionFile", direction: "upstream" })` on this tree — CRITICAL, six direct callers, nine processes. Re-take before editing that symbol. The specification's answer is to not edit it.
