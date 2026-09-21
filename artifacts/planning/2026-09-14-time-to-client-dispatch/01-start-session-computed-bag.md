# Start session: compute the opening bag and yield only on a live gate

Planning note for the time-to-dispatch experiment. Engine worktree: `feat/time-to-dispatch-experiment`. Corpus bind (bootstrap) lives on `feat/time-to-dispatch-meta`.

## Summary

`start_session` already derives the checkout, retries an occupied dated slug, and — on a unique catalog match with no resume phrasing — embeds the client in the same call (`client.session_index`). The remaining meta walk (discover-session through dispatch-client-workflow) exists to recompute git/fs facts and to stop for four human decisions. Those facts belong in the `start_session` bag. Those decisions belong on the existing **open-decision** channel (JSON with `decision` / `candidates` / `recommendation` and **no** `session_index`). The agent retries the same call after the user settles it. Unique fresh requests keep returning `client` and never enter meta activities.

## What start_session already does

- `working_directory` → git toplevel, origin `owner/repo`, host vs component path (`deriveWorkingDirectory`).
- Open decisions, no session: `unbound-repo`, `binding-mismatch` (caller `repo` vs origin), `unmapped-root`, `component-choice` (host with several component submodules and none named in the request).
- Occupied dated slug → next free `YYYY-MM-DD-<id>-N` in the same call.
- Unique catalog match, no resume-intent lexicon hit → embed child; response includes `client`.

Eager dispatch today **returns null** (falls through to an empty meta session) when the match is ambiguous or the request states resume. The agent then walks discover-session. That fall-through is the work this plan removes.

## Response contract (three outcomes)

Every fresh durable meta `start_session` ends in exactly one of:

| Outcome | Agent sees | Next call |
| --- | --- | --- |
| **Client** | `session_index` (meta) + `client.session_index` + `client.workflow.initialActivity` | `get_workflow` / `next_activity` on the **child** |
| **Decision** | `decision`, `candidates`, `recommendation`; no `session_index` | Present to the user; retry `start_session` with the pin the decision asked for |
| **Resume named folder** | Existing session in that folder (today’s named-`planning_folder` path) | Continue that session; no eager embed |

Bootstrap already describes the first two (`client` path; `decision` with no `session_index`). New decision names join that second paragraph. There is no fourth outcome that creates an empty meta and hopes the agent will walk discover-session.

## Stages

Each stage is a `start_session` behaviour change plus tests. Corpus bootstrap text updates in the same stage so the agent does not walk meta after a gate the server already yielded.

### 1. Seed git facts into the bag

On every durable create from `working_directory`, write the derivation onto the meta (and, when embedding, the child) variable bag: `host_repo_path`, `target_repo` / `repo`, `component_path` (`.` when the checkout is the host), `host_binding_mismatch` (false when names agree).

`deriveWorkingDirectory` already has these facts. Eager dispatch does not copy them into `variables` today (`OPH6L7` left several at defaults). Downstream meta activities, if ever entered, must read the bag rather than re-run `resolve-host-repo`.

**Pin for basename mismatch.** Meta’s `host-binding-mismatch` checkpoint is “folder basename disagrees with the origin repo segment.” That is **not** today’s `binding-mismatch` (caller `repo` vs origin). If basename disagrees, return an open decision (`host-binding-mismatch`) with confirm / abort, same shape as `binding-mismatch`. Confirm retries with an explicit pin (`confirm_host_binding: true` or passing `repo` equal to origin). Abort does not create a session.

Files: `tryEagerClientDispatch` / `start_session` after derivation; `derive-working-directory.ts` if the basename check lives there; tests beside `eager-client.test.ts` and existing derivation tests.

### 2. Ambiguous catalog → `workflow-selection` decision

When `rankWorkflows` sets `ambiguous` (or no unique `workflow_id`), **do not create a session**. Return `decision: workflow-selection`, `candidates` from the ranked top ids (the same list `discover_workflow` already returns), `recommendation` naming the top hit.

Retry pin: optional `target_workflow_id` on `start_session` (distinct from `workflow_id`, which remains the top-level workflow, default `meta`). When `target_workflow_id` is set and exists in the catalog, treat the match as unique and continue to embed. Do not invent a second catalog tool for this.

Today’s silent skip of eager dispatch on ambiguity goes away.

Files: `resource-tools.ts` `start_session` input schema; `eager-client.ts` (or a sibling `opening-match.ts`) returning `client | decision` instead of `client | null`; `discover_workflow` ranking reused, not copied.

### 3. Resume phrasing → scan, then `resume-session` decision

When the resume-intent lexicon matches, **do not embed a fresh client**. Scan planning folders under the derived engineering root for a client session whose workflow id equals the unique catalog match (or the pinned `target_workflow_id`).

- **One hit:** `decision: resume-session` with that `planning_folder` / slug / `session_index`. Retry with `planning_folder` set → today’s resume path. Retry with a `fresh` pin (new optional boolean, default false) → ignore the hit and take the unique-match embed path.
- **Several hits:** same decision, `candidates` listed; the user picks one folder or `fresh`.
- **No hit:** unique match embeds a new client (same as M6). Resume wording without a saved session is not a gate.

Do not reimplement resume. Named `planning_folder` already opens the stored session. The new work is the scan and the decision payload.

Files: new scanner next to `findPlanningFolderBySlug`; lexicon already in `resume-intent.ts`; tests for one / many / zero hits.

### 4. Component choice stays on the derivation channel

`component-choice` is already an open decision from `deriveWorkingDirectory` when the host has several component submodules and none is named. Do not add a second monorepo picker on `start_session`. Seed `is_monorepo` / `submodules` when derivation succeeds with a single tree or a named component.

resolve-target’s remaining validates (git tree exists, resumed binding agrees) run as refuse-or-decision inside derivation / resume, not as a later activity.

### 5. Bootstrap and meta definition

`bootstrap-protocol.md` step 1 already branches on `client` and on `decision` without `session_index`. Name the new decision ids (`workflow-selection`, `resume-session`, `host-binding-mismatch`) and the retry pins (`target_workflow_id`, `planning_folder`, `fresh`, `confirm_host_binding`). When `client` is present, the rest of the protocol stays skipped.

discover-session / initialize-session / resolve-target are retired. Opening is `start_session` only; see [02-opening-on-start-session.md](02-opening-on-start-session.md).

`dispatch-client-workflow` stays the post-dispatch orchestrator loop. It is not part of this `start_session` change.

### 6. Live clock

Same request, sidecar, uninstructed chat on `workflow-server-exp`. Happy path still `discover` → `start_session` → child `get_workflow` / `next_activity`. Gate paths: `start_session` → user → retry `start_session` → `client`. Record prompt-to-stop and whether meta `elapsed_ms` still collapses to the embed span. Do not overwrite `01-live-cursor-sidecar-walk.md` or `-eager.md`.

## Pins on start_session (additive)

| Field | Role |
| --- | --- |
| `target_workflow_id` | After `workflow-selection`, the chosen client id |
| `fresh` | After `resume-session`, ignore saved hits and embed |
| `confirm_host_binding` | After `host-binding-mismatch`, proceed with this checkout |
| `planning_folder` | Unchanged: resume that folder |

`workflow_id` remains the top-level workflow (default `meta`).

## Non-goals

- Folding child `next_activity` into `start_session` (enters the client; separate cut).
- LLM `derive-initiative-name` / `extract-identifying-context`. Dated slug and origin bind cover identity.
- Migrating `dispatch-client-workflow` or orchestrator spawn onto the server.
- Creating an empty meta session so the agent can walk discover-session “just in case.”
- Changing the install instance on `:3000` until this path is ranked on the sidecar.

## What was verified (today)

- M6 live: meta `OPH6L7` embed in 83 ms; child `JE2NSB` `work-package`; bootstrap `client` path held.
- Derivation already yields `unbound-repo`, `binding-mismatch`, `unmapped-root`, `component-choice` with no `session_index`.
- Eager dispatch skips (null) on resume phrasing and ambiguous match — those two skips are the stages above.

## Suggested order of commits

1. Seed derivation facts onto the bag; basename-mismatch decision.
2. `client | decision` from opening match; `workflow-selection` + `target_workflow_id`.
3. Resume scan + `resume-session` + `fresh`.
4. Bootstrap names the new decisions and pins.
5. Sidecar reload and live walk.
