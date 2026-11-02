**Readiness: insufficient evidence.** This is a review coverage plan, based on local source inspection. No blocking defect was established in the proposed line; Compose validation and runtime behavior remain unobserved.

The selected configuration is the workflow-server variant of [work-designer](/home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/SKILL.md). The report is returned here, without creating an artifact.

| Product | Reviewed revision |
|---|---|
| Packaging base | `86febd4485661f8e3472e0d0622eb72e787d5d8e` |
| Packaging candidate | That base plus the specified one-line Compose change; no candidate commit supplied |
| Engine | `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e` |
| Definitions | `d5e2ace11c66e6b7742d5b2e591abd4af271bb55` |

The local `docker` branch points elsewhere. It was not substituted for the supplied packaging base. These products should remain separate trees, paired for validation.

**Packaging and consumers**

- **Host publication.** The proposed mapping restricts the published endpoint to IPv4 loopback. The server must still listen on a reachable container interface: the [Dockerfile](https://github.com/m2ux/workflow-server/blob/86febd4485661f8e3472e0d0622eb72e787d5d8e/Dockerfile) supplies `--host=0.0.0.0`. Host publication and the listener inside the container are distinct settings.
- **Launch-path limit.** [`start.sh`](https://github.com/m2ux/workflow-server/blob/86febd4485661f8e3472e0d0622eb72e787d5d8e/scripts/start.sh#L509) independently publishes `HOST_PORT:CONTAINER_PORT`. This change establishes a requirement for Compose deployments only.
- **Image provenance.** Compose selects `ghcr.io/m2ux/workflow-server:main` with `pull_policy: always`. Testing that moving tag would not establish behavior for the supplied engine revision.
- **CI limit.** The captured [image workflow](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/.github/workflows/docker-publish.yml) probes HTTP on the host, fetches Dockerfiles from the current `docker` branch, and builds an image. It does not exercise this Compose mapping with the supplied revision combination.
- **Definition provenance.** The captured Compose file does not pass `CORPUS_PIN`. The engine reports that pin only when supplied. Establish the definitions revision through the clean checkout and inspected mount; do not require `/ready` to independently attest it.

**Required coverage**

| Requirement | Check and intended observation | Limit |
|---|---|---|
| Exactly the requested change | Inspect candidate diff against the packaging base: only the port line changes. Capture its commit or patch/file digest. | No candidate artifact was supplied or created here. |
| Correct interpolation | Render default, empty, host-port-only and custom-container-port configurations. Published host IP must remain `127.0.0.1`; port values must match the case. | Rendering establishes configuration, not actual network behavior. |
| Configuration errors remain visible | Render with missing required corpus path and malformed port values. Compare refusal behavior with the base. | Attribute inherited behavior separately from a regression. |
| Actual binding matches configuration | Inspect the running candidate’s port bindings. Require only `127.0.0.1` for the published endpoint, with the expected host/container ports. | Docker version, platform and network configuration must be recorded. |
| Local clients still work | Probe `/health`, `/ready`, MCP initialization, and `list_workflows` through the published loopback port. | A successful catalog request does not validate every workflow. |
| Non-loopback publication is absent | Probe the host’s non-loopback address locally and from a controlled second host. Require connection failure, not an HTTP error response. Check IPv6 publication separately. | A firewall can conceal a wildcard bind; combine probes with binding inspection and a controlled baseline. |
| Existing deployments adopt the mapping | Recreate a disposable base deployment using the candidate configuration; repeat binding and protocol checks. | Existing in-memory MCP sessions require a fresh initialization after recreation. |
| Readiness survives the pairing | Require HTTP 200, `status: ready`, all readiness checks true, and a nonempty catalog without load errors. Inspect image identity and mounts. | `/ready` alone checks directory availability and workflow presence, not complete corpus validity. |

The two runtime combinations are **base packaging + supplied engine + supplied definitions**, followed by **candidate packaging + the same engine and definitions**. No engine or definitions deployment step is required for this mapping change.

**Commands for later validation — not executed**

Replace angle-bracket paths before execution. Use isolated packaging, engine and definitions worktrees at the revisions above. Supply disposable project/state directories and the clean definitions checkout through environment files. Record the Docker and Compose versions and the fixture UID/GID.

Candidate checks:

```bash
git -C <candidate-packaging> diff --check 86febd4485661f8e3472e0d0622eb72e787d5d8e
git -C <candidate-packaging> diff --stat 86febd4485661f8e3472e0d0622eb72e787d5d8e
git -C <candidate-packaging> diff 86febd4485661f8e3472e0d0622eb72e787d5d8e
sha256sum <candidate-packaging>/docker-compose.yml
git -C <engine> rev-parse HEAD
git -C <definitions> rev-parse HEAD
docker version
docker compose version
```

Render both base and candidate with each environment case:

| Environment case | Expected candidate publication |
|---|---|
| `HOST_PORT` and `PORT` absent | `127.0.0.1:3000 → 3000` |
| Both empty | `127.0.0.1:3000 → 3000` |
| `HOST_PORT=32773`, `PORT` absent | `127.0.0.1:32773 → 3000` |
| `HOST_PORT=32774`, `PORT=3001` | `127.0.0.1:32774 → 3001` |
| Required corpus path absent | Configuration error |
| Malformed port | Explicit configuration/startup failure; compare with base |

Use a controlled environment so inherited shell variables cannot override the fixture:

```bash
env -i PATH=/usr/local/bin:/usr/bin:/bin HOME=/tmp/wf-bind-review docker compose --env-file <case.env> -f <packaging-tree>/docker-compose.yml config --format json
```

Obtain an image demonstrably built from the supplied engine and packaging files. If no verified immutable image is available, build one in the disposable engine tree:

```bash
cp <packaging-base>/Dockerfile <engine>/Dockerfile
cp <packaging-base>/.dockerignore <engine>/.dockerignore
docker build --platform linux/amd64 --file <engine>/Dockerfile --tag workflow-server:bind-review-c1a97f2 <engine>
docker image inspect workflow-server:bind-review-c1a97f2 --format '{{.Id}}'
```

The review override should select that local image, `pull_policy: never`, and the unique container name `workflow-bind-review`. It must not override `ports`. Use an unused host port; the default port needs rendering coverage without disturbing an existing installation.

```bash
docker compose -p wf-bind-review --env-file <host-port-only.env> -f <candidate-packaging>/docker-compose.yml -f <review.override.yml> up -d --no-build --pull never
docker inspect workflow-bind-review --format '{{json .NetworkSettings.Ports}}'
docker inspect workflow-bind-review --format '{{.Image}} {{.Config.User}} {{json .Mounts}} {{json .Config.Cmd}}'
curl --noproxy '*' --fail --silent --show-error --max-time 5 http://127.0.0.1:32773/health
curl --noproxy '*' --fail --silent --show-error --max-time 5 http://127.0.0.1:32773/ready
```

Expected HTTP behavior comes from the captured [transport implementation](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/src/transports/http.ts): `/health` returns `status: ok`; `/ready` requires every reported check to pass.

Exercise MCP using the protocol version in the captured transport test:

```bash
curl --noproxy '*' --fail --silent --show-error --max-time 10 --dump-header <scratch>/mcp-init.headers -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"compose-bind-review","version":"1.0.0"}}}' http://127.0.0.1:32773/mcp
rg -i '^mcp-session-id:' <scratch>/mcp-init.headers
```

Substitute the returned session ID and negotiated protocol version:

```bash
curl --noproxy '*' --fail --silent --show-error --max-time 10 -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'Mcp-Session-Id: <session-id>' -H 'MCP-Protocol-Version: <negotiated-version>' --data '{"jsonrpc":"2.0","method":"notifications/initialized"}' http://127.0.0.1:32773/mcp
curl --noproxy '*' --fail --silent --show-error --max-time 10 -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'Mcp-Session-Id: <session-id>' -H 'MCP-Protocol-Version: <negotiated-version>' --data '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_workflows","arguments":{}}}' http://127.0.0.1:32773/mcp
```

Require a successful MCP result containing workflows and no load errors. Repeat with the custom container-port case.

Run the following non-loopback probe both on the Docker host and on a controlled second host:

```bash
curl --noproxy '*' --connect-timeout 2 --max-time 3 --verbose http://<docker-host-lan-ip>:32773/health
curl --noproxy '*' --connect-timeout 2 --max-time 3 --verbose 'http://[::1]:32773/health'
```

Any HTTP response establishes a connection and fails the intended exclusion. A controlled base deployment should demonstrate that the second host’s route can reach a published service before attributing the candidate’s failure to this change. Inspect for unintended `0.0.0.0` or `::` publication as well.

For the upgrade observation, first run the base in the same disposable project, then apply the candidate:

```bash
docker compose -p wf-bind-review --env-file <host-port-only.env> -f <candidate-packaging>/docker-compose.yml -f <review.override.yml> up -d --force-recreate --no-build --pull never
docker compose -p wf-bind-review --env-file <host-port-only.env> -f <candidate-packaging>/docker-compose.yml -f <review.override.yml> logs --no-color
```

Repeat the binding, HTTP and fresh MCP checks. A simple restart does not apply a changed port mapping. After recording evidence:

```bash
docker compose -p wf-bind-review --env-file <host-port-only.env> -f <candidate-packaging>/docker-compose.yml -f <review.override.yml> down
```

**Scope and readiness limits**

- Full engine tests, schema generation, corpus guards, snapshot walks, option coverage, benchmarks and agent smoke runs are not required solely by this line: their inputs and behavior are unchanged. They also cannot establish Docker host binding.
- Bash syntax and install/update-helper exercises are not applicable because no helper changes. Session durability and artifact-write suites are outside the affected dependency path; readiness and mount inspection provide the necessary startup checks.
- IPv6 loopback clients, remote clients, container peers and alternate launchers are not covered by an IPv4 host-loopback publication claim.
- No remote PR, branch-protection or CI status was inspected. Before an integration verdict, capture the actual candidate revision, verify required checks and their input revisions, and re-evaluate any moved dependency.
- The remaining work is the targeted validation above. No container, project test, network operation or publication was performed here.

**Audit appendix — exact executed shell commands**

All commands below ran with working directory `/home/mike1/projects/dev/workflow-server`. Commands are listed in submission order; independent reads were sometimes submitted together. The memory search and the narrowly targeted `list_workflows` search returned exit code 1 for no matches. Other shell invocations returned 0.

```bash
cat /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/SKILL.md

rg -n -i 'integration|docker|packaging|work-designer|readiness' /home/mike1/.codex/memories/MEMORY.md

cat AGENTS.md .project/main/AGENTS.md

cat /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/review-mode.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/variants.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/planning.md

rg -n '^#' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/commands.md

git status --short && git worktree list --porcelain && git show --no-patch --format=fuller 86febd4485661f8e3472e0d0622eb72e787d5d8e c1a97f236e20db64c8d36ba919ef0e7a4c1b671e d5e2ace11c66e6b7742d5b2e591abd4af271bb55

sed -n '1,33p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/commands.md && sed -n '62,75p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/commands.md && sed -n '105,123p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/commands.md && rg --files /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants

cat /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/references/coverage.md /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/templates/integration-review.md

rg -n '^#' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md && sed -n '1,35p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md && git remote -v && git for-each-ref --format='%(refname) %(objectname)' refs/heads/docker refs/remotes/origin/docker refs/heads/main refs/remotes/origin/main refs/heads/workflows refs/remotes/origin/workflows

git ls-tree -r --name-only 86febd4485661f8e3472e0d0622eb72e787d5d8e && git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:docker-compose.yml && git ls-tree --name-only c1a97f236e20db64c8d36ba919ef0e7a4c1b671e && git ls-tree --name-only d5e2ace11c66e6b7742d5b2e591abd4af271bb55

sed -n '39,51p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md && sed -n '109,121p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md && sed -n '135,190p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/VARIANT.md && rg -n '^#' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/commands.md

git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:Dockerfile && git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:.env.example && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/README.md && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:package.json

git grep -n -E '127\.0\.0\.1|0\.0\.0\.0|health|HOST_PORT|docker compose|docker-compose|docker run|ghcr.io|curl' 86febd4485661f8e3472e0d0622eb72e787d5d8e -- scripts .env.example Dockerfile docker-compose.yml && git ls-tree -r --name-only c1a97f236e20db64c8d36ba919ef0e7a4c1b671e .github/workflows docs src tests | rg -i 'docker|http|transport|config|deploy|health|server|readme|development|security|ci|test\.ts'

sed -n '1,6p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/commands.md && sed -n '85,146p' /home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer/variants/workflow-server/commands.md && cat config/branches && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:.github/workflows/docker-publish.yml

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/http.md && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/configuration.md && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/transports/http.ts

git show d5e2ace11c66e6b7742d5b2e591abd4af271bb55:README.md && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:tests/smoke/README.md && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/development.md | rg -n '^#|Docker|docker|HTTP|http|smoke|typecheck|npm ci|test:ci|check:all' && git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:scripts/start.sh | sed -n '500,568p'

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/transports/http.ts | sed -n '1,185p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/configuration.md | sed -n '35,110p' && git grep -n -E 'protocolVersion|initialize|sessionKeyWritable|corpusServes|app.get|process.env.*HOST|process.env.*PORT' c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- src tests/http-transport.test.ts docs/api.md && git ls-tree -r --name-only c1a97f236e20db64c8d36ba919ef0e7a4c1b671e tests/scripts .github/workflows

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:.github/workflows/verify.yml && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/development.md | sed -n '5,47p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/development.md | sed -n '79,121p' && git show 86febd4485661f8e3472e0d0622eb72e787d5d8e:.dockerignore

git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:tests/http-transport.test.ts | sed -n '315,375p' && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/config.ts | sed -n '582,635p' && git grep -n -E 'corpusPin|CORPUS_PIN|parseFlag.*host' c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- src/config.ts src/index.ts && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:docs/api.md | sed -n '1,38p' && git status --short

git grep -n -A 30 -B 5 'list_workflows' c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- src/server.ts src/tools/index.ts && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/config.ts | sed -n '660,672p'

git grep -n 'list_workflows' c1a97f236e20db64c8d36ba919ef0e7a4c1b671e -- src && git show c1a97f236e20db64c8d36ba919ef0e7a4c1b671e:src/config.ts | sed -n '660,672p'
```
