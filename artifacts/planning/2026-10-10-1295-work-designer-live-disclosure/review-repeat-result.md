**Planning complete. Integration readiness: insufficient evidence.** Static inspection supports a narrow Compose publication review; no runtime checks were executed.

The [work-designer skill](/home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/SKILL.md) selected its `workflow-server` variant. This report is the requested planning artifact; no files were written.

**Reviewed subject**

| Product | Captured revision | Role |
|---|---|---|
| Packaging base | `86febd4485661f8e3472e0d0622eb72e787d5d8e` | Dockerfile, Compose configuration and helpers |
| Proposed packaging result | Base plus the stipulated one-line edit | Publish the Compose service on IPv4 loopback |
| Engine | `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e` | Image build context and HTTP/MCP implementation |
| Definitions | `d5e2ace11c66e6b7742d5b2e591abd4af271bb55` | Mounted corpus |

All three supplied commits exist locally. The candidate has no supplied commit or tree identity, so its exact diff and merge base remain future observations. Local branch names were not substituted for the supplied revisions.

Review these two combinations under equivalent conditions:

- Control: packaging base + pinned engine + pinned definitions.
- Candidate: packaging base with the specified edit + the same engine and definitions.

These are separately versioned products to pair, not histories to merge together.

**Packaging and consumers**

- **Publication:** the proposed `127.0.0.1:` prefix changes the host address in Compose’s port mapping. Preserve the `HOST_PORT` and `PORT` defaults and overrides. The container listener must remain reachable through its container interface: the captured Dockerfile explicitly supplies `--host=0.0.0.0`. [Compose](https://github.com/m2ux/workflow-server/blob/86febd4485661f8e3472e0d0622eb72e787d5d8e/docker-compose.yml), [Dockerfile](https://github.com/m2ux/workflow-server/blob/86febd4485661f8e3472e0d0622eb72e787d5d8e/Dockerfile).
- **Consumers:** check host-local HTTP and MCP clients, clients using the daemon host’s non-loopback address, and the published IPv6 addresses. Loopback is relative to the Docker daemon’s host.
- **Scope limit:** `scripts/start.sh` independently publishes ports without this prefix. The proposed change establishes a Compose-specific behavior. It does not establish that every launcher is restricted to loopback. [Start helper](https://github.com/m2ux/workflow-server/blob/86febd4485661f8e3472e0d0622eb72e787d5d8e/scripts/start.sh#L509).

No blocking defect was confirmed in the stipulated change.

**Required coverage**

Every runtime row uses the candidate packaging result, engine `c1a97f…`, and definitions `d5e2ace…`.

| Concern | Required observation | Evidence and limits |
|---|---|---|
| Exact subject | Only the specified Compose mapping changes; candidate is based on the supplied packaging base | Git comparison, not yet available |
| Compose interpolation | Default and empty ports resolve to host `127.0.0.1:3000` → container `3000`; custom host/container ports retain the loopback address | Resolved Compose configuration; parsing alone cannot prove publication |
| Actual publication | Docker reports the expected `127.0.0.1` binding, without a wildcard or IPv6 publication | Container inspection plus connection probes |
| Local service | `/health` returns `status: ok`; `/ready` returns `status: ready`, with its checks true and the intended corpus mounted | Actual candidate container; health alone is insufficient |
| MCP and corpus consumption | Initialization and a session-bearing request succeed; `discover` and `list_workflows` return usable results without load errors | Actual MCP traffic through the published port |
| External denial | A separate machine cannot connect through the daemon host’s non-loopback address while host loopback succeeds | Use a demonstrably working probe path; a firewall or unreachable peer can make a negative result inconclusive |
| Deployment | Recreating the service applies the new publication; an existing container does not retain the prior binding | Inspect before/after recreation and repeat connection probes |
| Evidence identity | Container image identity, candidate revision, corpus revision, Docker/Compose versions and network topology are recorded | Mutable image tags or branch names alone are insufficient |

The readiness checks inspect directory availability, signing-key writability and whether the corpus contains workflows. They do not validate all definitions. A real MCP interaction supplies the relevant additional consumer observation. [HTTP implementation](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/src/transports/http.ts), [API contract](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/docs/api.md).

**Planned commands — not executed**

Replace angle-bracket placeholders before running. Execution would require a later authorization permitting disposable files, containers and network probes.

1. Capture the actual candidate and confirm the scope:

```bash
git show -s --format='%H %T' <CANDIDATE_SHA>
git merge-base 86febd4485661f8e3472e0d0622eb72e787d5d8e <CANDIDATE_SHA>
git diff --check 86febd4485661f8e3472e0d0622eb72e787d5d8e <CANDIDATE_SHA>
git diff --name-status 86febd4485661f8e3472e0d0622eb72e787d5d8e <CANDIDATE_SHA>
git diff 86febd4485661f8e3472e0d0622eb72e787d5d8e <CANDIDATE_SHA> -- docker-compose.yml
```

Expected: the supplied base is the merge base, and the complete diff contains only the requested line replacement.

2. Prepare separate disposable worktrees:

```bash
git worktree add --detach /tmp/compose-review/docker <CANDIDATE_SHA>
git worktree add --detach /tmp/compose-review/engine c1a97f236e20db64c8d36ba919ef0e7a4c1b671e
git worktree add --detach /tmp/compose-review/definitions d5e2ace11c66e6b7742d5b2e591abd4af271bb55
```

Prepare `paths.env` with disposable project/state directories, numeric UID/GID owning those directories, and `HOST_WORKFLOWS_DIR=/tmp/compose-review/definitions`. Leave ports absent. Use a clean environment without inherited path or Compose overrides.

3. Validate default, empty and custom port values:

```bash
env -u HOST_PORT -u PORT docker compose --env-file /tmp/compose-review/paths.env -f /tmp/compose-review/docker/docker-compose.yml config --format json
HOST_PORT= PORT= docker compose --env-file /tmp/compose-review/paths.env -f /tmp/compose-review/docker/docker-compose.yml config --format json
HOST_PORT=33001 PORT=3000 docker compose --env-file /tmp/compose-review/paths.env -f /tmp/compose-review/docker/docker-compose.yml config --format json
HOST_PORT=33001 PORT=3001 docker compose --env-file /tmp/compose-review/paths.env -f /tmp/compose-review/docker/docker-compose.yml config --format json
```

Inspect `services.workflow-server.ports`: every case must have `host_ip: 127.0.0.1`, the intended published/target ports, and TCP protocol. Also confirm the container’s `PORT` agrees with the target port.

4. Use an existing immutable image whose provenance establishes the pinned engine and packaging inputs. A fresh build is conditional on that evidence being unavailable:

```bash
cp /tmp/compose-review/docker/Dockerfile /tmp/compose-review/engine/Dockerfile
cp /tmp/compose-review/docker/.dockerignore /tmp/compose-review/engine/.dockerignore
docker build --file /tmp/compose-review/engine/Dockerfile --tag workflow-server:compose-review /tmp/compose-review/engine
docker image inspect workflow-server:compose-review --format '{{.Id}}'
```

The Compose override should select that review image, `pull_policy: never`, and unique container name `workflow-server-compose-review`. It must leave the candidate’s port mapping intact.

5. With unused host port `33001` and container port `3001` recorded in `runtime.env`, exercise the candidate:

```bash
docker version
docker compose version
docker compose -p compose-review --env-file /tmp/compose-review/runtime.env -f /tmp/compose-review/docker/docker-compose.yml -f /tmp/compose-review/review.override.yml config
docker compose -p compose-review --env-file /tmp/compose-review/runtime.env -f /tmp/compose-review/docker/docker-compose.yml -f /tmp/compose-review/review.override.yml up -d --force-recreate --no-build --pull never
docker inspect workflow-server-compose-review --format '{{.Image}} {{json .NetworkSettings.Ports}} {{json .Mounts}}'
docker port workflow-server-compose-review
curl --noproxy '*' --fail --silent --show-error --max-time 5 http://127.0.0.1:33001/health
curl --noproxy '*' --fail --silent --show-error --max-time 5 http://127.0.0.1:33001/ready
```

Confirm image identity, the definitions bind source and its read-only status, the intended non-root user, and successful readiness. Do not infer the definitions commit from `/ready` alone: Compose does not supply `CORPUS_PIN` in the captured configuration.

6. Exercise MCP using the protocol version present in the pinned transport test:

```bash
curl --noproxy '*' -i -N --max-time 5 -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"compose-review","version":"1.0.0"}}}' http://127.0.0.1:33001/mcp
```

Record the returned `mcp-session-id` and negotiated protocol. Use this command pattern for the following bodies, substituting those literal values:

```bash
curl --noproxy '*' -i -N --max-time 5 -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'mcp-session-id: <RETURNED_SESSION_ID>' -H 'MCP-Protocol-Version: <NEGOTIATED_VERSION>' --data '<JSON_BODY>' http://127.0.0.1:33001/mcp
```

| Order | JSON body | Expected observation |
|---|---|---|
| 1 | `{"jsonrpc":"2.0","method":"notifications/initialized"}` | Notification accepted |
| 2 | `{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}` | Registered tools returned |
| 3 | `{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"discover","arguments":{}}}` | Bootstrap result returned |
| 4 | `{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"list_workflows","arguments":{}}}` | Intended corpus is consumable; inspect load errors |

Inspect HTTP and JSON-RPC results, including any event-stream frames. A curl timeout on an open stream is not, by itself, the MCP result. [Pinned lifecycle test](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/tests/http-transport.test.ts#L330).

7. From a separate test machine, probe the daemon host’s actual non-loopback address:

```bash
curl --noproxy '*' --connect-timeout 3 --max-time 5 -i http://<DAEMON_IPV4>:33001/health
```

Any HTTP response proves reachability, including an error response. Establish that the probe path works using an equivalent controlled baseline. Repeat for applicable IPv6 paths; inspect that Docker did not publish an IPv6 listener. This measures publication, not isolation from processes on the host, proxies, or containers reaching a container address directly.

8. Preserve logs and clean up only the review project:

```bash
docker compose -p compose-review --env-file /tmp/compose-review/runtime.env -f /tmp/compose-review/docker/docker-compose.yml -f /tmp/compose-review/review.override.yml logs
docker compose -p compose-review --env-file /tmp/compose-review/runtime.env -f /tmp/compose-review/docker/docker-compose.yml -f /tmp/compose-review/review.override.yml down
```

**CI and readiness limits**

- The image workflow’s HTTP smoke launches a Node process on the runner. Its image build fetches `Dockerfile` and `.dockerignore` from the Docker branch; it does not exercise Compose publication. It also fetches a branch tip, so the captured Docker revision must be established from run evidence. [Image workflow](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/.github/workflows/docker-publish.yml).
- Engine and corpus CI select counterpart branches dynamically. A green result needs its actual checkout revisions examined before it can support this pinned combination. Current checks, PR metadata and branch requirements were not retrieved.
- Shell syntax checks, TypeScript regression suites, corpus guards, option-coverage walks, performance benchmarks and session-durability experiments are not additional requirements for this stipulated mapping-only change. Their inputs and behavior are outside its affected dependency closure. Existing required repository gates still apply; broaden review if the actual diff or runtime observations expand the scope.
- Readiness requires the actual candidate identity plus successful Compose and container observations above. No test pass, successful deployment, or remote-denial result is claimed here.

**Audit appendix — exact shell commands executed**

Every invocation below used working directory `/home/mike1/projects/dev/workflow-server` and exited `0`. These were local file, configuration and Git-object inspections. The memory search supplied no Docker-specific evidence and was not used for the conclusions.

```bash
cat /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/SKILL.md

cat /home/mike1/projects/dev/workflow-server/.project/main/AGENTS.md

rg -n 'docker|packaging|integration|work-designer|worktree' /home/mike1/.codex/memories/MEMORY.md

cat /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/review-mode.md

rg -n '^#{1,4} ' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/commands.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/variants.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/planning.md

rg --files -g AGENTS.md -g '!node_modules' -g '!vendor' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer

sed -n '5,32p;62,75p;105,123p;149,160p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/commands.md

sed -n '5,17p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/variants.md

cat /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/planning.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/templates/integration-review.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/coverage.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/AGENTS.md

git remote -v && git show -s --format='%H %D%n%s' 86febd4485661f8e3472e0d0622eb72e787d5d8e c1a97f236e20db64c8d36ba919ef0e7a4c1b671e d5e2ace11c66e6b7742d5b2e591abd4af271bb55 && git for-each-ref --format='%(refname) %(objectname)' refs/heads/docker refs/heads/main refs/heads/workflows

rg --files /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants && rg -n '^#{1,3} ' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md

git ls-tree -r --name-only 86febd4485661f8e3472e0d0622eb72e787d5d8e

sed -n '5,10p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md

git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:docker-compose.yml 86febd4485661f8e3472e0d0622eb72e787d5d8e:Dockerfile 86febd4485661f8e3472e0d0622eb72e787d5d8e:.env.example 86febd4485661f8e3472e0d0622eb72e787d5d8e:.dockerignore

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/README.md c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:package.json

sed -n '20,34p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md

git ls-tree -r --name-only c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- .github/workflows src tests | rg '(^\.github/|config|http|transport|docker|health|index\.ts)'

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/configuration.md c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/development.md

git grep -n -E 'docker|compose|localhost|127\.0\.0\.1|health|HOST_PORT|--publish|--host|--port|image' 86febd4485661f8e3472e0d0622eb72e787d5d8e -- scripts

sed -n '11,19p;39,73p;109,121p;135,190p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md && rg -n '^#{1,4} ' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/commands.md

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:.github/workflows/docker-publish.yml c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:.github/workflows/verify.yml

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/index.ts && git grep -n -E 'host|port|health|ready|mcp|CORPUS_PIN|listen' c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- src/config.ts src/transports/http.ts tests/http-transport.test.ts docs/api.md

sed -n '3,6p;85,146p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/commands.md

cat /home/mike1/projects/dev/workflow-server/config/branches && git ls-tree --name-only c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- docs/architecture.md && git ls-tree --name-only d5e2ace11c66e6b7742d5b2e591abd4af271bb55

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/api.md

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/architecture.md && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/http.md | rg -n '^#{1,6} '

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/config.ts | sed -n '360,480p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/transports/http.ts | sed -n '24,123p;174,225p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:tests/http-transport.test.ts | sed -n '315,369p'

git show d5e2ace11c66e6b7742d5b2e591abd4af271bb55:.github/workflows/verify-corpus.yml d5e2ace11c66e6b7742d5b2e591abd4af271bb55:.github/workflows/coverage.yml

git grep -n -E "parseFlag.*(host|port)|env\['(HOST|PORT)'\]|host:|port:" c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- src/config.ts && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/http.md | sed -n '87,103p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:.github/workflows/verify.yml | sed -n '108,160p'

git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:scripts/start.sh | sed -n '501,552p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/index.ts
```
