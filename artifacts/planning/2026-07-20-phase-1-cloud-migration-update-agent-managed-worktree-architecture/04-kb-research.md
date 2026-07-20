# Knowledge Base Research - Phase 1 Agent-Managed Worktree Architecture

> work-package · 2026-07-20 · Complete

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|------------|-----------------|
| identify-patterns | pattern-research + repo/GitNexus | Required-startup config, planning-root derivation, readiness checks, and session slug-hint already exist in this repo |
| identify-best-practices | practice-research + web | Path containment, K8s readiness vs liveness, 12-factor fail-fast config, Docker bind mounts for host-owned workspaces |
| Repo deep-dive | `config.ts`, `store.ts`, `resource-tools.ts`, `http.ts` | Concrete adaptation targets; brief `apply_workflow` does not exist |

**KB gap:** concept-rag library has little Node/path-security or K8s-probe material (blockchain-heavy catalog). Institutional guidance for this package comes primarily from this repository; external validation used official/current docs.

## Relevant Concepts Discovered

### Required workspace bind (fail-fast startup)
**Source:** `src/config.ts` (`WorkspaceConfigError`, `resolveWorkspaceDir`)  
**Relevance:** Brief `WORKTREE_ROOT` maps to today’s required `workspaceDir` (`--workspace` / `WORKFLOW_WORKSPACE`) — throw if missing; never default to `cwd`.  
**Key Insight:** Hard cutover for the root is already the repo pattern; Phase 1 adapts naming/semantics, not invents a new optional bind.

### Planning path derivation
**Source:** `src/utils/session/store.ts` (`PLANNING_RELATIVE_DIR`, `planningRoot`, `ensurePlanningFolder`)  
**Relevance:** Default planning root is `{workspaceDir}/.engineering/artifacts/planning` — matches locked DP-2a / SC-3.  
**Key Insight:** Make the relative segment configurable (`PLANNING_SLUG` or equivalent) while keeping the monorepo default; do not silently adopt brief `.engineering/planning`.

### Session planning bind (slug hint)
**Source:** `src/tools/resource-tools.ts` (`start_session` / `planning_folder`)  
**Relevance:** Agent may pass absolute `planning_folder`; server uses **basename as slug** and always resolves under its workspace planning root.  
**Key Insight:** Prefer this pattern over inventing `apply_workflow` + per-call `worktreeRoot`. Root stays startup-only; per-session selection stays slug/folder-hint based.

### Readiness vs liveness
**Source:** `src/transports/http.ts` (`/health`, `/ready`)  
**Relevance:** `/ready` already gates on `workspaceDir` (plus workflow/schemas dirs); `/health` is process-alive only.  
**Key Insight:** Extend `/ready` checks for the configured worktree/workspace root presence — do not fold dependency checks into liveness.

### Path containment validator
**Source:** Web — Node path-traversal guidance; Node SECURITY.md (path APIs trust input)  
**Relevance:** New `worktree-validator.ts` must enforce paths stay under the configured root.  
**Key Insight:** `path.join` / `normalize` are not security controls. Resolve + verify descendant with `root + path.sep` (or `path.relative`); use `realpath` when symlinks can escape.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Fail-fast required config | `config.ts` WorkspaceConfigError; [12-factor Config](https://12factor.net/config) | Require worktree/workspace root at load; clear error; no silent cwd | HIGH |
| Derived resource path | `planningRoot` / `PLANNING_RELATIVE_DIR` | `{root}/{PLANNING_SLUG}` with configurable slug, repo default | HIGH |
| Slug-hint session bind | `start_session` planning_folder basename | Bind planning under configured root without per-call root parameter | HIGH |
| Split readiness/liveness | `http.ts`; [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) | `/ready` = root present; `/health` = process up | HIGH |
| Resolve-then-contain | [OpenReplay / Node path guidance](https://blog.openreplay.com/prevent-path-traversal-nodejs/); [safeguard.sh](https://safeguard.sh/resources/blog/path-traversal-vulnerabilities-in-nodejs-applications) | Validator: absolute resolve (+ realpath), reject escapes | HIGH |
| Host-owned bind mount | Brief §4; Docker bind vs volume guides | RW bind of worktree root so agent/host Git lifecycle shares filesystem with server | HIGH |

## Best Practices Found

### Fail-fast configuration validation
**Source:** [12factor.net/config](https://12factor.net/config); ConfigShield 12-factor guidance  
**Description:** Store deploy-varying config in the environment; validate required values at startup and crash with a clear message if missing.  
**Application:** Keep/extend `WorkspaceConfigError`; accept brief `WORKTREE_ROOT` as env alias into the same required field; never serve with an unbound root.

### Readiness checks dependencies; liveness does not
**Source:** Kubernetes probe docs; Codelit health-check guidance  
**Description:** Readiness answers “can this instance take traffic?”; liveness answers “should we restart?”. Filesystem/config dependencies belong in readiness.  
**Application:** Preserve `/health` shallow; keep/strengthen `/ready` `workspaceDir` (worktree root) existence check — aligns with DP-6 / SC-1–SC-2.

### Explicit path containment
**Source:** Node community path-traversal guides (2024–2025); Node SECURITY.md clarification that path APIs trust input  
**Description:** After resolve (and realpath when needed), ensure target is `root` or starts with `root + sep`.  
**Application:** Implement in `worktree-validator.ts` for any agent-influenced path under the configured root; reject traversal and sibling-prefix tricks (`/uploads` vs `/uploads-evil`).

### Prefer existing tool surface over invented APIs
**Source:** Repo tools inventory; locked DP-1a / RE-2  
**Description:** Adapt `workspaceDir` + `start_session` rather than adding brief-only `apply_workflow`.  
**Application:** Document agent steps: create worktree → init `.engineering` → start server with root → `start_session` with planning slug/folder hint.

### Bind mount for host-managed worktrees
**Source:** Docker bind vs named-volume guidance (host-owned files → intentional bind)  
**Description:** Named volumes suit container-owned data; bind mounts when the host (or agent on host) must create/edit the tree.  
**Application:** Compose: RW bind of worktree root; remove server-managed global planning volume; document UID/GID alignment for writes.

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| Invent `apply_workflow` + per-call `worktreeRoot` | Brief §3.2 / §5 vs repo | Startup-only root; session bind via `start_session` / planning slug |
| Silent default planning slug to brief `.engineering/planning` | Brief vs `PLANNING_RELATIVE_DIR` | Default monorepo path; override only via explicit `PLANNING_SLUG` |
| Treat `path.join` as sanitization | Node SECURITY.md; path-traversal guides | Dedicated containment helper with sep-aware check + realpath |
| Put root-missing check on `/health` | K8s probe guidance | Keep on `/ready` only |
| Optional dual-bind of legacy root | DP-5 rejected | Hard cutover; migration notes for operators |
| One process, many worktrees via per-call root | Brief multiplicity vs locked startup-only root | Phase 1: one configured root per process (worktree or monorepo); multiplicity via instances or remount — out of inventing per-call root |

## Recommended Approach

Based on research findings:

1. **Primary Pattern:** Adapt required `workspaceDir` startup bind as the worktree/workspace root (env alias `WORKTREE_ROOT` / docs mapping), derive planning via configurable slug defaulting to `.engineering/artifacts/planning`, validate with a dedicated containment module, gate `/ready` on that root.
   - Rationale: Maximises reuse of existing fail-fast config, planning store, session tools, and HTTP readiness — satisfies locked requirements without inventing brief-only APIs.

2. **Key Practices to Apply:**
   - Fail-fast at `loadConfig` when root unset
   - `planningRoot` driven by configurable relative slug
   - Validator: resolve + realpath + `root + sep` containment
   - Agent contract docs: Git/lifecycle client-side; server validates/writes
   - Docker: RW bind worktree root; no server-owned planning volume

3. **Risks to Monitor:**
   - Naming churn (`WORKFLOW_WORKSPACE` vs `WORKTREE_ROOT`) — use aliases + migration notes
   - Symlink escape — realpath in validator before writes
   - Brief/docs drift mentioning `apply_workflow` — correct in operator/agent docs

## Findings Synthesis (requirements mapping)

| Requirement / SC | Applicable finding | How it informs implementation |
|------------------|--------------------|-------------------------------|
| SC-1 fail-fast without root | WorkspaceConfigError + 12-factor | Keep throw-on-missing; alias env names as needed |
| SC-2 `/ready` gated on root | Existing `workspaceDir` check + K8s readiness | Retain/rename check key; 503 when missing |
| SC-3 default planning slug | `PLANNING_RELATIVE_DIR` | Parameterise constant; default unchanged |
| SC-4 containment | Resolve-then-contain + realpath | New `worktree-validator.ts` |
| SC-5 agent path | Session slug-hint + agent Git ownership | Document sequence; no server Git |
| SC-6 operator docs | 12-factor + Docker bind guidance | Migration + volume layout |
| SC-7 no invent-only API | No `apply_workflow` in repo | Do not add; bind root at startup |

## Applicable Patterns (need → pattern)

| Need | Pattern | Confidence |
|------|---------|------------|
| Required startup root | Fail-fast env/CLI config (`workspaceDir`) | HIGH |
| Planning under root | Derived `planningRoot` + configurable slug | HIGH |
| Session folder selection | `planning_folder` basename → slug | HIGH |
| Traffic gating | `/ready` dependency check | HIGH |
| Path security | Resolve + sep-prefix (+ realpath) | HIGH |
| Container filesystem | RW bind mount for host-agent trees | HIGH |

## Synthesis Assumptions

| ID | Assumption | Rationale |
|----|------------|-----------|
| SA-1 | Phase 1 deploys one server process bound to one worktree/monorepo root | Locked startup-only root + current `planningRoot(workspaceDir)` model; multi-worktree-per-process deferred |
| SA-2 | `WORKTREE_ROOT` can alias into the same field as `WORKFLOW_WORKSPACE` without a second optional root | Satisfies brief naming without reopening DP-5 |
| SA-3 | Brief Docker `PLANNING_SLUG=.engineering/planning` remains an explicit override example, not the code default | DP-2a / SC-3 |

## Open Research Candidates

| ID | Statement | Classification | Resolution / Handoff |
|----|-----------|----------------|----------------------|
| RC-1 | Exact CLI/env alias surface (`WORKTREE_ROOT` vs keep-only `WORKFLOW_WORKSPACE` / `--workspace` rename) | Resolved | Prefer env alias `WORKTREE_ROOT` → same `workspaceDir` resolution; keep `--workspace` working; document brief mapping. Final flag rename optional in plan — not a product reopen of required-root. |
| RC-2 | Symlink / realpath policy in `worktree-validator` | Resolved | Use `fs.realpath` (or sync equivalent) on root and candidate before containment check when validating write/containment paths. |
| RC-3 | Multi-worktree under one process via per-call `worktreeRoot` | Irreconcilable (out-of-scope) | Locked: root is startup-only. Phase 1 multiplicity = one root per process. Handoff: `out-of-scope` (future architecture), not stakeholder-blocking. |

### Irreconcilable detail

**RC-3: Multi-worktree single process**  
**Why research cannot resolve:** Product decision already locked (startup-only root); further research cannot reintroduce brief per-call root without contradicting requirements.  
**Handoff:** `out-of-scope`

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| Node.js path traversal prevention path.resolve containment | OpenReplay, safeguard.sh, nodejsdesignpatterns, Node SECURITY.md | Resolve + `root+sep` check; realpath for symlinks; path APIs trust input |
| Kubernetes readiness vs liveness filesystem | kubernetes.io official probes docs; Codelit; learnk8s | Readiness for traffic/deps; liveness for restart only |
| Docker bind mount vs volume shared workspace | Easton, Server Side Up, Raff | Bind for host-owned trees; named volume for container-owned data |
| 12-factor config fail fast | 12factor.net/config; ConfigShield | Env config; validate required at startup |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| Kubernetes probes | https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/ | Readiness removes traffic without kill; separate from liveness | HIGH |
| Twelve-Factor Config | https://12factor.net/config | Config in environment; strict separation from code | HIGH |
| Path traversal (OpenReplay) | https://blog.openreplay.com/prevent-path-traversal-nodejs/ | `startsWith(BASE + sep)` after resolve | HIGH |
| Path traversal (Safeguard) | https://safeguard.sh/resources/blog/path-traversal-vulnerabilities-in-nodejs-applications | realpath + sep; avoid substring-only checks | HIGH |
| Node SECURITY.md clarification | https://github.com/nodejs/node/commit/43b5a21916 | `path.join`/`normalize` trust input — app must sanitize | HIGH |
| Docker bind vs volume (Raff) | https://rafftechnologies.com/learn/guides/docker-volumes-vs-bind-mounts-production | Bind when host workflow owns files | MEDIUM |

### Community Practices

| Practice | Source | Application |
|----------|--------|-------------|
| Validate required env at startup | ConfigShield / 12-factor commentary | Extend existing `WorkspaceConfigError` path |
| Prefer ID/slug over raw user paths | OpenReplay path guidance | Matches `planning_folder` → basename slug |

### Alignment with KB Research

All primary KB (repo) findings confirmed by external sources: fail-fast config, readiness/liveness split, and path containment. Extended: symlink/realpath guidance and Docker bind-mount rationale for host-agent worktrees. No contradictions with locked requirements.

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| `src/config.ts` | Required workspace bind | `resolveWorkspaceDir`, `WorkspaceConfigError` |
| `src/utils/session/store.ts` | Planning derivation | `PLANNING_RELATIVE_DIR`, `planningRoot` |
| `src/tools/resource-tools.ts` | Session bind | `start_session` planning_folder hint |
| `src/transports/http.ts` | Readiness | `/ready` checks |
| Incoming brief `phase1_update_agent_worktrees.md` | Design intent (adapt, don’t copy APIs) | §§3–5, agent responsibilities |
| Kubernetes probe docs | Readiness contract | Readiness vs liveness |
| 12factor.net/config | Config externalisation | Factor III |
| Node path-traversal guides | Validator design | Containment algorithm |

**Status:** Complete
