# AGENTS.md

Instructions for AI coding agents working in this repository (Workflow Orchestration MCP Server).

## Project overview

This repo is an **MCP server** for AI agent workflow orchestration (TypeScript, Node.js 18+). Agents discover, navigate, and execute structured workflows via a **Goal → Workflow → Activities → Techniques → Tools** model. Workflow data lives in a `workflows` worktree (orphan branch); engineering artifacts live in `.engineering/`. See [README.md](README.md) for overview and [docs/ide-setup.md](docs/ide-setup.md) for rule setup.

## Setup commands

- **Install:** `npm install`
- **Build:** `npm run build`
- **Run (stdio, default):** `npm start` or `npm run dev`
- **Run (HTTP):** `npm run start:http` or `npm run dev:http`
- **Tests:** `npm test` (watch) / `npm run test:ci` (single run)
- **Typecheck:** `npm run typecheck`
- **Guards:** `npm run check:all` (every guard, one table) / `npm run check:delta` (only what your change added, against the merge-base)
- **Worktree setup:** `npm run worktree:provision` — checks out the submodules and makes `node_modules` resolvable, so guards and tests measure the worktree you are editing
- **A worktree is named for the branch it holds.** `.worktrees/workflow/353-context-scoped-delivery` holds `workflow/353-context-scoped-delivery` — the branch name in full, slashes and all, as nested directories. `git worktree list` then reads as a branch index, and a path in a command or a stack trace says which branch it belongs to without anyone inspecting its `HEAD`. Rename with `git worktree move`, which fixes the administrative files a `mv` leaves dangling.
- **Workflow data:** `git worktree add ./workflows workflows` (see [README.md](README.md), [setup.md](setup.md), [stdio.md](stdio.md), [http.md](http.md)).

## Code and doc style

- TypeScript; follow existing patterns in `src/` and `schemas/`.
- Use clear, professional language; no process attribution in code comments (e.g. “Added by agent”).
- **Describe the design, not the change to it.** Definitions (workflow, activity, technique, resource prose), code comments, doc comments, and **commit subjects** state the system as it is, in the present tense, without naming the design they replaced. A reader next year has no memory of the previous design, so naming it makes them learn a dead design just to parse the sentence — and the sentence rots the moment the thing it contrasts against is gone. Write `account for token usage per dispatch`, not `move usage accounting off the transition and onto the dispatch`; write `cost travels on its own call`, not `a transition can only account for a dispatch it exits`. Same for a value's absence: say what holds when it is missing, not what the old path did. Cut “instead of”, “no longer”, “previously”, “unchanged behaviour”, and any example that was true before the change and false after it. The workflow canon states the same discipline for definition prose as [Document in Positive Present](workflows/workflow-design/resources/design-principles.md#17-document-in-positive-present).
  - **Keep a hazard that is still live, stated as an invariant.** *A marker is unreadable to a context that never received the bytes* survives; *this is why the old rule forbade it* does not.
  - **PR and issue bodies are the exception, and so is a commit body.** They exist to explain a change against what preceded it, and stop being read once merged — a reviewer needs the before-state to judge the change. Keep the narrative there and out of everything that persists. A measurement that is a tool's reason to exist may likewise be cited with its provenance.
  - After a behaviour change, sweep for surviving descriptions of the old behaviour: doc comments, tool descriptions, technique `## Rules`, resource prose, READMEs. A grep for the old phrasing finds most of them; a stale claim reads as current fact.
- **Prefer removing the thing that needs a prohibition.** When a change leaves prose warning "do not also use X", that usually means two paths now do one job. Retire one and the warning has nothing left to say — along with any validation or edge-case handling that existed only to police the overlap.
- **Keep `CLAUDE.md` and `AGENTS.md` in sync by merging, never by copying.** They have diverged before, each gaining content the other lacked; overwriting one with the other silently drops the difference.

## Task management

- Complete **one** task at a time unless the user asks for multiple.
- For multi-step work, use todos and mark them complete as you finish; only one todo in progress at a time.
- Request permission before starting a new task or making changes outside the current request.
- *ALWAYS* use a local work-tree when working on a branch

## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow YAML files unless the user explicitly asks.
- When following workflows, respect workflow fidelity as defined in YAML files and the workflow-server rules: call `discover` first to learn the bootstrap procedure, then follow the returned sequence (`list_workflows` / `start_session` / `get_workflow` / `next_activity` / `get_activity`). Fetch the `workflow-server://schemas` MCP resource when you need to validate workflow definitions. See [docs/ide-setup.md](docs/ide-setup.md).

## Testing and PR instructions

- After code or schema changes, run `npm run typecheck` and `npm test` before committing.
- After workflow-corpus changes, run `npm run check:all`. To see only what your change added, run `npm run check:delta`. Corpus debt is triaged per finding in `scripts/binding-fidelity-triage.json` — classify a new finding there (`harmless` / `fix-later` / `live-bug`) rather than suppressing it; there is no re-snapshot command.
- Follow the repo’s PR/commit conventions.
- **Commit incrementally. Do not amend or squash to tidy up.** Each change lands as its own commit with its own message, so the branch carries a readable record of how it was built. Push with plain `git push`; when a push will not fast-forward, stop and ask rather than rewriting.
  - **`--force`/`--force-with-lease` has exactly one use:** correcting a genuine error in an earlier commit, on a branch with **no other contributors**. Not for squashing, not for rewording, not for folding a follow-up into the commit it fixes, and never on a shared branch.
  - Repeated amending is the failure mode to avoid: it silently collapses distinct pieces of work into one commit, and the intermediate states survive only in a local reflog. Once collapsed, the history cannot be recovered — only reconstructed by hand, which is a rewrite of its own.
- **GitHub CLI — REST only (no GraphQL).** `gh pr create`, `gh pr view`, `gh pr list`, and any call that hits `api.github.com/graphql` are **forbidden** here (GraphQL is deprecated/unreliable and fails). Create and manage PRs with REST only, e.g.:

  ```bash
  git push -u origin HEAD
  gh api --method POST repos/{owner}/{repo}/pulls \
    -f title='...' -f head='branch' -f base='main' -f body='...'
  ```

  Other ops: `gh api repos/...`, `gh api --method PATCH|POST|GET ...`. Never use `gh pr *`.

### GitHub auth and agent shell (required)

Host auth is **keyring + SSH** (`gh` as the active user; `origin` is `git@github.com:...`). Most agent GitHub failures are a **sandboxed shell**, not a broken login. Workflow ops under `github-cli-protocol` and remote `version-control` carry the same invariant (`host-shell-for-gh`, `host-shell-for-remote-git`).

1. **First attempt, every time — full host permissions.**  
   For every `gh` call (including `gh api`) and every remote git/SSH call (`fetch` / `pull` / `push` / `ls-remote` / network `clone` / `ssh` to the git host), run the Shell with `required_permissions: ["all"]` (or the harness equivalent outside the agent sandbox). Local-only git (`status`, `add`, `commit`, `rev-parse`) may use the default shell. Do not start these remote calls sandboxed and “escalate after failure.”

2. **Leave token env unset unless a known-good PAT is intentional.**  
   Unset `GH_TOKEN` and `GITHUB_TOKEN` for keyring auth. `gh` prefers those env vars over the keyring; a wrong or garbage value yields `Bad credentials` / HTTP 401 even when keyring login is fine. Never scrape `~/.config/gh/hosts.yml` into them (tokens live in the keyring, not that file).

3. **Sandbox denial is not auth failure.**  
   These signatures mean the shell is still sandboxed — re-run the **same** command once under full host permissions. Do not conclude credentials or SSH keys are invalid; do not thrash sandboxed retries; if the harness refuses full host permissions, stop and surface that blockage:

   ```text
   Bad owner or permissions on /etc/ssh/ssh_config.d/20-systemd-ssh-proxy.conf
   read tcp 127.0.0.1:…->127.0.0.1:… connection reset by peer
   Get "https://api.github.com/...": unexpected EOF
   fatal: Could not read from remote repository.
   ```

4. **Health check** (unsandboxed only — same permissions as step 1):

   ```bash
   unset GH_TOKEN GITHUB_TOKEN
   gh auth status
   gh api user --jq .login
   ssh -T git@github.com
   git ls-remote origin HEAD
   ```

## Where to look

- **Quick start, schema, API:** [README.md](README.md), [schemas/README.md](schemas/README.md), [docs/api-reference.md](docs/api-reference.md)
- **IDE/MCP setup:** [docs/ide-setup.md](docs/ide-setup.md), [setup.md](setup.md), [stdio.md](stdio.md), [http.md](http.md)
- **Work in `.engineering/` (artifacts, planning):** [.engineering/AGENTS.md](.engineering/AGENTS.md)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **workflow-server** (13661 symbols, 18447 relationships, 294 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/workflow-server/context` | Codebase overview, check index freshness |
| `gitnexus://repo/workflow-server/clusters` | All functional areas |
| `gitnexus://repo/workflow-server/processes` | All execution flows |
| `gitnexus://repo/workflow-server/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
