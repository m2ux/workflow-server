# Commands

## Conventions

These operations follow the [shared command conventions](../../references/commands.md#conventions).

### Locations

`<engine>` is the engine checkout, `<corpus>` the definition-branch root, and `<docker-tree>` the packaging checkout. Commands run from the engine checkout unless a spec says otherwise.

### Invocation Sources

Check invocations against the captured sources before execution.

## Install Engine Dependencies

Install the captured lockfile with the runtime required by that revision's CI.

- Installation needs the appropriate network permissions; it is not a network-free sandbox operation.

```bash
npm ci
```

## Run Engine Checks

Check source/tooling types, production output, generated schemas and behavior against the intended corpus.

```bash
npm run typecheck
npm run build
npm run check:schemas
npx tsx guards/check-tool-call-shape.ts --root <corpus>
WORKFLOWS_DIR=<corpus> npm run test:ci
```

## Run Delivery Gate

Measure fixture delivery against the recorded benchmark and threshold used by CI.

```bash
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=review --context-mode=fresh --gate --reference=benchmark/fixtures/token-benchmark-baseline.json
```

## Check Engine Documentation

Check site references and affected generated content against their source definitions.

- Inspect generated diffs in the disposable tree; a link check alone does not prove generated content is current.

```bash
npm run check:site
npm run check:svg
npm run build:site
git diff -- site
```

## Run Corpus Checks

Validate the corpus roster, protocol, guards and recorded paths with the paired engine.

```bash
bash <corpus>/walks/check-roster.sh
python3 <corpus>/walks/check-walk-protocol.py
python3 <corpus>/walks/check-walk-protocol.py --self-test
WORKFLOWS_DIR=<corpus> npm run check:all
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/snapshot.test.ts
WORKFLOWS_DIR=<corpus> npx vitest run tests/e2e/all-workflows-walk.test.ts
```

## Run Option Coverage

Walk the current corpus roster and compare checkpoint reachability with its exceptions.

- Read the roster first and supply its walked IDs as a literal comma-separated value.
- An omitted scope walks the full roster. The [coverage configuration](VARIANT.md#workflows-coverage) determines when a literal `WF_COVERAGE_SCOPE` narrows the walk.

```bash
jq -r '.walked | join(",")' <corpus>/walks/roster.json
WORKFLOWS_DIR=<corpus> WF_WALKED=<walked-ids> npm run test:coverage-walk
```

## Count Running Sessions

List running sessions in the configured state root for an affected workflow.

- Use the relevant state configuration; retain its identity in the evidence.

```bash
npm run sessions:census -- --workflow <workflow-id> --status running --list
```

## Check Shell Syntax

Parse a changed Bash script without executing its operations.

```bash
bash -n <script-path>
```

## Validate Compose

Resolve the reviewed Compose file with a disposable environment file.

- The environment file supplies the required host paths and ports. Keep sensitive values out of saved output.

```bash
docker compose --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml config
```

## Build Review Image

Build a local image using captured Docker files and engine content.

- Use a disposable engine checkout as the context. Copy both the Dockerfile and ignore file so the actual build boundary is measured.
- Container runtime checks use disposable mounts and an unused port according to the reviewed configuration.

```bash
cp <docker-tree>/Dockerfile <engine>/Dockerfile
cp <docker-tree>/.dockerignore <engine>/.dockerignore
docker build --file <engine>/Dockerfile --tag workflow-server:integration-review <engine>
```

## Exercise Review Container

Start the reviewed image with disposable mounts and inspect its running behavior.

- The override file selects the local review image and a unique container name. The environment file supplies unused ports and disposable corpus, project and state paths; inspect the resolved configuration before starting.
- Probe the MCP endpoint with the client and protocol version documented by the reviewed engine. Record the interaction and response; health checks alone do not cover MCP.
- Stop and restart with the same disposable state mount to observe durability when affected. Remove only this review's containers after recording evidence.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml up -d --no-build --pull never
curl --fail http://127.0.0.1:<review-port>/health
curl --fail http://127.0.0.1:<review-port>/ready
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml logs
```

## Restart Review Container

Restart the review service while retaining its disposable state mount.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml restart
```

## Stop Review Container

Remove the disposable review service after its evidence is recorded.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml down
```

## Check Skill Summaries

Run the shared mode-summary tests from the checkout containing its skills.

```bash
python3 -m unittest discover -s skills/work-planner/test -p test_modes.py
```
