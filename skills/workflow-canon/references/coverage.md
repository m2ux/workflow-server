# Integration Coverage

Select evidence from workflow-server's languages, constructs, schemas, architecture and branch responsibilities. A branch's name supplies no coverage requirement by itself.

## Coverage Planning

### Establish the Project Map

For each affected product or branch, identify its source formats, runtime, dependency manifest, public and internal contracts, build outputs, deployment role and consumers. Follow the documentation index into the design and implementation that own those contracts. Read CI to establish what each job checks out, builds, measures and excludes.

Record the exact revisions of separately versioned consumers, generators, fixtures, data and deployment definitions. Choose combinations that represent the intended integration and any intermediate state its delivery order exposes.

### Select Observations

Each applicable row contributes checks to the report's coverage matrix. A row can apply to several branches, or several rows to one branch.

| Concern | Coverage to Derive from the Project |
| --- | --- |
| Languages and build | Locked dependency resolution, the actual compiler/type checker or interpreter, applicable static checks, production build and relevant unit/integration suites |
| Schemas and interfaces | Valid and invalid inputs, optional/default values, enums, serialization and agreement between declarations, generated clients or schemas, and the real consumers |
| Composition and configuration | Name/path resolution, imported or inherited contracts, parameter binding, precedence, isolation, cycles and invalid configuration |
| Control flow | Branches, gates, loops, boundaries, termination, retries, cancellation and failure propagation for the constructs the implementation supports |
| State and concurrency | Persistence, atomicity, restart/resume, version changes, concurrent updates, identity and isolation according to the declared lifecycle |
| Generated or interpreted content | Source-to-output agreement, downstream consumption, content actually delivered to a user or agent, and the interpretation performed by the receiving component |
| External boundaries | Request/response contracts, error and partial-result handling, unavailable dependencies and the limits of mocked evidence |
| Packaging and deployment | The built artifact in its target runtime, configuration, paths, ownership, writable/persistent storage, startup, health, shutdown and update behavior |
| Development tooling | Actual registration and invocation, accepted/rejected/malformed input, repeat execution, workspace discovery and failure behavior |
| Performance and resource use | The project's representative workload, budgets, benchmark baseline and accepted regression threshold where the change affects them |
| Documentation | Design claims, API examples, generated surfaces, links and instructions against their authoritative implementation |
| Tests and exceptions | Fixture relevance, discovered test sets, skips, snapshots, baselines, exclusions and the rationale for affected exceptions |

### Determine the Required Set

- **Project gates.**
  Include the current required checks for each affected branch and any checks needed to observe its changed contracts. Record why a gate or additional check is applicable.
- **Shared behavior.**
  A shared runtime, schema, library, configuration or test-driver change reaches its consumer closure. Use a complete consumer suite when that closure cannot be bounded reliably.
- **Independent observations.**
  Match the observation to the contract. A build proves a build; a deployable artifact needs runtime evidence, and a generated document needs evidence from its consumer when the claim concerns use.
- **Exception records.**
  Check whether affected baselines and exclusions still describe the reviewed result, including stale keys and newly unobserved behavior. Review's [authority](review-mode.md#rules) governs their treatment.
- **Unavailable checks.**
  Preserve the gap under Review's [Coverage](review-mode.md#coverage), including the environment and observation needed to close it.

## Branches and Sources

`config/branches` in the workspace checkout declares branches that own separate products:

| Branch | Responsibility | Languages and Formats | Starting Sources |
| --- | --- | --- | --- |
| main | Engine, loaders, schemas, guards, tests, benchmarks and site | TypeScript, generated JavaScript, JSON Schema, Markdown, HTML/CSS and CI YAML | [Documentation index](https://github.com/m2ux/workflow-server/blob/main/docs/README.md), [development](https://github.com/m2ux/workflow-server/blob/main/docs/development.md), [package](https://github.com/m2ux/workflow-server/blob/main/package.json) |
| workflows | Definitions, reusable operations, resources, judgments and recorded walks | YAML, Markdown and JSON, with Bash/Python validation helpers | [Branch layout](https://github.com/m2ux/workflow-server/blob/workflows/README.md), [authoring index](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md), [walks](https://github.com/m2ux/workflow-server/blob/workflows/walks/README.md) |
| docker | Image, Compose and install/start/update helpers | Dockerfile, YAML and Bash | [Dockerfile](https://github.com/m2ux/workflow-server/blob/docker/Dockerfile), [Compose](https://github.com/m2ux/workflow-server/blob/docker/docker-compose.yml), [scripts](https://github.com/m2ux/workflow-server/tree/docker/scripts) |
| workspace | Layout, agent configuration, hooks, skills and development helpers | Markdown, Python, Bash and configuration files | [Workspace](https://github.com/m2ux/workflow-server/blob/workspace/README.md), [layout](https://github.com/m2ux/workflow-server/blob/workspace/docs/layout.md), [skill guidelines](../../guidelines.md) |

The URLs identify document homes to read from captured trees. Read applicable project instructions alongside these sources.

## Design Reading

Start with the engine's [architecture](https://github.com/m2ux/workflow-server/blob/main/docs/architecture.md), then follow the model and artifact documents relevant to the diff.

| Concern | Authoritative Reading | Trace Through the Integration |
| --- | --- | --- |
| Agent responsibilities | [Dispatch](https://github.com/m2ux/workflow-server/blob/main/docs/dispatch.md) and [checkpoints](https://github.com/m2ux/workflow-server/blob/main/docs/checkpoint.md) | Who talks to the user, tracks the workflow, executes the activity and resolves a pause |
| State and enforcement | [State](https://github.com/m2ux/workflow-server/blob/main/docs/state.md), [fidelity](https://github.com/m2ux/workflow-server/blob/main/docs/fidelity.md) and [schemas](https://github.com/m2ux/workflow-server/blob/main/docs/schemas.md) | Declared structure, engine refusals, advisory checks, persisted state and agent obligations |
| Naming and content | [Resolution](https://github.com/m2ux/workflow-server/blob/main/docs/resolution.md) and [delivery](https://github.com/m2ux/workflow-server/blob/main/docs/delivery.md) | References, actual files and sections, receiving identities, delivered bytes and budgets |
| Definition composition | [Workflow](https://github.com/m2ux/workflow-server/blob/main/docs/workflow.md), [routine](https://github.com/m2ux/workflow-server/blob/main/docs/routine.md), [technique](https://github.com/m2ux/workflow-server/blob/main/docs/technique.md) and [resource](https://github.com/m2ux/workflow-server/blob/main/docs/resource.md) | Routing, expanded steps, inherited contracts, operation procedures and reference material |
| Definition design | [Principles](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/design-principles.md), [anti-patterns](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md) and [construct inventory](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/schema-construct-inventory.md) | The relevant criteria, their exclusions, and the schema constructs carrying each obligation |
| Serving and deployment | [Configuration](https://github.com/m2ux/workflow-server/blob/main/docs/configuration.md), [API](https://github.com/m2ux/workflow-server/blob/main/docs/api.md) and transport documents in the index | Paths, startup, health, readiness, tool surfaces and deployment settings |

## Engine and Corpus Pairing

- **CI inputs.**
  Inspect [engine verification](https://github.com/m2ux/workflow-server/blob/main/.github/workflows/verify.yml), [corpus verification](https://github.com/m2ux/workflow-server/blob/workflows/.github/workflows/verify-corpus.yml) and [coverage](https://github.com/m2ux/workflow-server/blob/workflows/.github/workflows/coverage.yml). Initiative and epic bases can select an initiative counterpart; final integration PRs can select the long-lived counterpart. Resolve the actual behavior at the reviewed revisions.
- **Corpus root.**
  The engine's corpus path names the branch root containing `corpus/`, `ledgers/` and `walks/`. Provision a resolvable dependency tree and use the explicit corpus path for every coupled check.
- **Measurement.**
  Confirm corpus tests ran. [Guard exit codes](https://github.com/m2ux/workflow-server/blob/main/guards/README.md#one-sweep-one-registry) distinguish findings from inability to measure; both differ from a clean result.

## Main Coverage

For behavioral engine integration, [Install Engine Dependencies](#install-engine-dependencies), [Run Engine Checks](#run-engine-checks) and [Run Delivery Gate](#run-delivery-gate) establish the baseline. Use the locked runtime and dependency configuration. The checks include both TypeScript compilations, production build, generated schemas, corpus tool-call shapes and the full test suite.

Select additional observations for the affected behavior:

| Area | Required Coverage When Affected |
| --- | --- |
| Schemas | Valid and invalid values, defaults, optionality and closed sets; agreement between Zod, generated schemas, enforcement metadata and exposed schema resources |
| Loading and resolution | Qualified and local names, shadowing, namespace collisions, source-workflow scope, resource anchors and failure diagnostics |
| Routines | Input/output binding, internal isolation, nested expansion, prefixed identifiers, site/body gate composition and cycle rejection |
| State | Atomic persistence, seal verification, resume, version-sensitive variable seeding, child sessions and concurrent updates |
| Control flow | Transitions, exits, checkpoint answers and timing, loop boundaries, fan destinations, per-branch identities, joins and invalid/empty fan inputs |
| Delivery | Fresh and reused contexts, eager and fetched content, reference markers, resource reachability, budget accounting, continuation and replacement workers |
| Artifacts | Declared and produced files, names, destinations, repeated announcements and persistence |
| Transports | MCP calls over the applicable transport, stdio output, HTTP lifecycle, health/readiness and shutdown |
| Guards | Registration in the enforced sweep, correct corpus selection, finding/clean/unmeasured outcomes and detection of a known defect |

For changed documentation or site content, [Check Engine Documentation](#check-engine-documentation) and compare examples and generated surfaces with their owners. Pure prose changes can use narrower runtime coverage under Review's [Coverage](review-mode.md#coverage).

## Workflows Coverage

Use [Run Guard Suite](canon-context.md#run-guard-suite) and [Run Corpus Checks](canon-context.md#run-corpus-checks) from the intended engine checkout for the registered guard sweep, roster and walk-protocol validation, snapshots and all-workflows drift. The corpus supplies definitions and baselines; its tooling comes from the paired engine.

- **Definition contracts.**
  Inspect schema agreement; steps, gates, actions, loops, checkpoints, exits and fans; value provenance and absence/null/falsy behavior; routine expansion; technique anatomy and inherited contracts; defaults, executable references and artifact persistence.
- **Receiving roles.**
  Trace the actual content and resource sections delivered to each role, including review, interactive and headless paths when affected. Apply Review's [Coverage](review-mode.md#coverage) to separate instruction inspection from execution evidence.
- **Option coverage.**
  [Run Option Coverage](canon-context.md#run-option-coverage) over the full roster for shared engine behavior, meta definitions, common routines/contracts, routing, walker/policy or roster changes. A smaller scope needs evidence that its dependency analysis includes every affected consumer.
- **Records and exceptions.**
  Inspect snapshots, roster membership, option-coverage exceptions and triage entries with the definitions they describe. Check stale keys, newly unobserved options, missing consumers and the rationale for each affected exception.
- **Running sessions.**
  Assess definition versions and the documented resume/seeding behavior. [Count Running Sessions](#count-running-sessions) where the relevant state is available; a local census establishes nothing about another deployment.

## Docker Coverage

[Check Shell Syntax](#check-shell-syntax) for changed helpers and [Validate Compose](#validate-compose) with disposable paths. For image/runtime changes, [Build Review Image](#build-review-image) with the reviewed Docker files and intended engine build context, then [Exercise Review Container](#exercise-review-container).

- **Runtime.**
  Use a disposable container to observe HTTP health/readiness and an MCP interaction, production dependencies and schemas, non-root ownership, corpus read-only access, planning/state writes, configuration precedence and graceful stop.
- **Durability.**
  [Restart Review Container](#restart-review-container) with its state mount and observe signing-key and session continuity where affected. [Stop Review Container](#stop-review-container) after recording the evidence.
- **Helpers.**
  Exercise changed install/start/stop/update behavior in disposable directories or controlled fixtures: existing checkouts, dirty trees, branch selection, quoted paths, repeat execution and failed prerequisites.
- **Publishing.**
  Inspect the engine's [image workflow](https://github.com/m2ux/workflow-server/blob/main/.github/workflows/docker-publish.yml) for the Docker revision it fetches, build context, publication conditions and scan conditions. Host Node smoke checks establish host behavior; container evidence must come from the reviewed image.

## Workspace Coverage

[Check Skill Summaries](revise-mode.md#check-skill-summaries) exercises a shared check alongside applicable Python suites, and [Check Shell Syntax](#check-shell-syntax) covers Bash syntax. Configuration is parsed with its actual consumer or format validator.

- **Hooks.**
  Exercise allowed, rejected and malformed tool inputs, path/quoting cases, registration and invocation, and the output contract through the hook's supported test entry point.
- **Scripts.**
  Use disposable repositories and directories to check component/worktree discovery, branch selection, engineering layout, repeat execution and failure behavior.
- **Skills.**
  Check file links, command availability, inputs/outputs, templates, host capabilities and behavioral walkthroughs. Mechanical tests cover only the claims they observe.
- **Shared configuration.**
  Trace changed workspace paths and settings into engine configuration and container mounts. Engine tests alone do not cover this branch.

## Commands

### Install Engine Dependencies

Install the captured lockfile with the runtime required by that revision's CI.

- Installation needs the appropriate network permissions; it is not a network-free sandbox operation.

```bash
npm ci
```

### Run Engine Checks

Check source/tooling types, production output, generated schemas and behavior against the intended corpus.

```bash
npm run typecheck
npm run build
npm run check:schemas
npx tsx guards/check-tool-call-shape.ts --root <corpus>
WORKFLOWS_DIR=<corpus> npm run test:ci
```

### Run Delivery Gate

Measure fixture delivery against the recorded benchmark and threshold used by CI.

```bash
npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=review --context-mode=fresh --gate --reference=benchmark/fixtures/token-benchmark-baseline.json
```

### Check Engine Documentation

Check site references and affected generated content against their source definitions.

- Inspect generated diffs in the disposable tree; a link check alone does not prove generated content is current.

```bash
npm run check:site
npm run check:svg
npm run build:site
git diff -- site
```

### Count Running Sessions

List running sessions in the configured planning tree for an affected workflow.

- Resolve the planning root holding the relevant session records; retain its identity in the evidence.

```bash
npm run sessions:census -- --root <session-planning-root> --workflow <workflow-id> --status running --list
```

### Check Shell Syntax

Parse a changed Bash script without executing its operations.

```bash
bash -n <script-path>
```

### Validate Compose

Resolve the reviewed Compose file with a disposable environment file.

- The environment file supplies the required host paths and ports. Keep sensitive values out of saved output.

```bash
docker compose --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml config
```

### Build Review Image

Build a local image using captured Docker files and engine content.

- Use a disposable engine checkout as the context. Copy both the Dockerfile and ignore file so the actual build boundary is measured.
- Container runtime checks use disposable mounts and an unused port according to the reviewed configuration.

```bash
cp <docker-tree>/Dockerfile <engine>/Dockerfile
cp <docker-tree>/.dockerignore <engine>/.dockerignore
docker build --file <engine>/Dockerfile --tag workflow-server:integration-review <engine>
```

### Exercise Review Container

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

### Restart Review Container

Restart the review service while retaining its disposable state mount.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml restart
```

### Stop Review Container

Remove the disposable review service after its evidence is recorded.

```bash
docker compose -p integration-review --env-file <scratch>/review.env -f <docker-tree>/docker-compose.yml -f <scratch>/review.override.yml down
```
