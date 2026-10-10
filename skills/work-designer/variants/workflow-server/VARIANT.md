# Workflow-Server

This variant configures Work Designer for m2ux/workflow-server under the shared [variant contract](../../references/variants.md#variant-contract).

## Identity

Select this variant for the `m2ux/workflow-server` repository, including its linked worktrees and component branches. Match the repository identity from its SSH or HTTPS remote, or an explicit selection in project instructions.

Mode configuration: [Review](#review-configuration) and [Revise](#revise-configuration).

## Planning

- **Base.**  The workspace checkout that owns the project's engineering history.
- **Root.**  `.engineering/artifacts/planning/`, resolved against that workspace.
- **Records.**
  Follow the established `YYYY-MM-DD-<ref>-<slug>/` convention, omitting the work reference when none exists. The slug describes the work shared across modes.

Use the shared [planning guide](../../references/planning.md) to resolve, reuse and write the record.

## Review Configuration

Use [Planning](#planning) for artifact settings. Establish affected products from [Branches and Sources](#branches-and-sources), and apply [Boundary Review](#boundary-review) to their consumers.

Select coverage for every affected branch and consumer:

| Product | Coverage |
| --- | --- |
| Engine | [Main Coverage](#main-coverage) |
| Definitions | [Workflows Coverage](#workflows-coverage) |
| Packaging | [Docker Coverage](#docker-coverage) |
| Workspace tooling | [Workspace Coverage](#workspace-coverage) |

When engine or corpus behavior is involved, read [Design Reading](#design-reading) and [Engine and Corpus Pairing](#engine-and-corpus-pairing). Follow project-source links only for the concerns selected by this review.

## Revise Configuration

The `workspace` branch owns skill files and their shared guidelines. When planning artifacts are needed, use [Planning](#planning). Run [Check Skill Summaries](commands.md#check-skill-summaries) alongside the shared [skill checks](../../references/commands.md#run-skill-checks).

## Branches and Sources

`config/branches` in the workspace checkout declares branches that own separate products:

| Branch | Responsibility | Languages and Formats | Starting Sources |
| --- | --- | --- | --- |
| main | Engine, loaders, schemas, guards, tests, benchmarks and site | TypeScript, generated JavaScript, JSON Schema, Markdown, HTML/CSS and CI YAML | [Documentation index](https://github.com/m2ux/workflow-server/blob/main/docs/README.md), [development](https://github.com/m2ux/workflow-server/blob/main/docs/development.md), [package](https://github.com/m2ux/workflow-server/blob/main/package.json) |
| workflows | Definitions, reusable operations, resources, judgments and recorded walks | YAML, Markdown and JSON, with Bash/Python validation helpers | [Branch layout](https://github.com/m2ux/workflow-server/blob/workflows/README.md), [authoring index](https://github.com/m2ux/workflow-server/blob/workflows/docs/README.md), [walks](https://github.com/m2ux/workflow-server/blob/workflows/walks/README.md) |
| docker | Image, Compose and install/start/update helpers | Dockerfile, YAML and Bash | [Dockerfile](https://github.com/m2ux/workflow-server/blob/docker/Dockerfile), [Compose](https://github.com/m2ux/workflow-server/blob/docker/docker-compose.yml), [scripts](https://github.com/m2ux/workflow-server/tree/docker/scripts) |
| workspace | Layout, agent configuration, hooks, skills and development helpers | Markdown, Python, Bash and configuration files | [Workspace](https://github.com/m2ux/workflow-server/blob/workspace/README.md), [layout](https://github.com/m2ux/workflow-server/blob/workspace/docs/layout.md), [skill guidelines](../../../guidelines.md) |

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

For behavioral engine integration, [Install Engine Dependencies](commands.md#install-engine-dependencies), [Run Engine Checks](commands.md#run-engine-checks) and [Run Delivery Gate](commands.md#run-delivery-gate) establish the baseline. Use the locked runtime and dependency configuration. The checks include both TypeScript compilations, production build, generated schemas, corpus tool-call shapes and the full test suite.

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

For changed documentation or site content, [Check Engine Documentation](commands.md#check-engine-documentation) and compare examples and generated surfaces with their owners. Pure prose changes can use narrower runtime coverage under Review's [Coverage](../../references/review-mode.md#coverage).

## Workflows Coverage

[Run Corpus Checks](commands.md#run-corpus-checks) from the intended engine checkout: roster and walk-protocol validation, the registered guard sweep, snapshots and all-workflows drift. The corpus supplies definitions and baselines; its tooling comes from the paired engine.

- **Definition contracts.**
  Inspect schema agreement; steps, gates, actions, loops, checkpoints, exits and fans; value provenance and absence/null/falsy behavior; routine expansion; technique anatomy and inherited contracts; defaults, executable references and artifact persistence.
- **Receiving roles.**
  Trace the actual content and resource sections delivered to each role, including review, interactive and headless paths when affected. Apply Review's [Coverage](../../references/review-mode.md#coverage) to separate instruction inspection from execution evidence.
- **Option coverage.**
  [Run Option Coverage](commands.md#run-option-coverage) over the full roster for shared engine behavior, meta definitions, common routines/contracts, routing, walker/policy or roster changes. A smaller scope needs evidence that its dependency analysis includes every affected consumer.
- **Records and exceptions.**
  Inspect snapshots, roster membership, option-coverage exceptions and triage entries with the definitions they describe. Check stale keys, newly unobserved options, missing consumers and the rationale for each affected exception.
- **Running sessions.**
  Assess definition versions and the documented resume/seeding behavior. [Count Running Sessions](commands.md#count-running-sessions) where the relevant state is available; a local census establishes nothing about another deployment.

## Docker Coverage

[Check Shell Syntax](commands.md#check-shell-syntax) for changed helpers and [Validate Compose](commands.md#validate-compose) with disposable paths. For image/runtime changes, [Build Review Image](commands.md#build-review-image) with the reviewed Docker files and intended engine build context, then [Exercise Review Container](commands.md#exercise-review-container).

- **Runtime.**
  Use a disposable container to observe HTTP health/readiness and an MCP interaction, production dependencies and schemas, non-root ownership, corpus read-only access, planning/state writes, configuration precedence and graceful stop.
- **Durability.**
  [Restart Review Container](commands.md#restart-review-container) with its state mount and observe signing-key and session continuity where affected. [Stop Review Container](commands.md#stop-review-container) after recording the evidence.
- **Helpers.**
  Exercise changed install/start/stop/update behavior in disposable directories or controlled fixtures: existing checkouts, dirty trees, branch selection, quoted paths, repeat execution and failed prerequisites.
- **Publishing.**
  Inspect the engine's [image workflow](https://github.com/m2ux/workflow-server/blob/main/.github/workflows/docker-publish.yml) for the Docker revision it fetches, build context, publication conditions and scan conditions. Host Node smoke checks establish host behavior; container evidence must come from the reviewed image.

## Workspace Coverage

[Check Skill Summaries](commands.md#check-skill-summaries) exercises a shared check alongside applicable Python suites, and [Check Shell Syntax](commands.md#check-shell-syntax) covers Bash syntax. Configuration is parsed with its actual consumer or format validator.

- **Hooks.**
  Exercise allowed, rejected and malformed tool inputs, path/quoting cases, registration and invocation, and the output contract through the hook's supported test entry point.
- **Scripts.**
  Use disposable repositories and directories to check component/worktree discovery, branch selection, engineering layout, repeat execution and failure behavior.
- **Skills.**
  Check file links, command availability, inputs/outputs, templates, host capabilities and behavioral walkthroughs. Mechanical tests cover only the claims they observe.
- **Shared configuration.**
  Trace changed workspace paths and settings into engine configuration and container mounts. Engine tests alone do not cover this branch.

## Boundary Review

Compare each changed producer with its consumers: engine tools and corpus calls, schemas and definitions, shared contracts and their distant users, generated and served documents, packaging and workspace settings. Inspect CI selection for wrong trees, stale revisions and incomplete coverage scope. Assess any assumption from one constituent PR that another invalidates.
