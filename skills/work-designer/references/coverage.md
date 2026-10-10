# Integration Coverage

Select evidence from the reviewed project's languages, constructs, schemas, architecture and branch responsibilities. A branch's name supplies no coverage requirement by itself.

## Establish the Project Map

For each affected product or branch, identify its source formats, runtime, dependency manifest, public and internal contracts, build outputs, deployment role and consumers. Follow the documentation index into the design and implementation that own those contracts. Read CI to establish what each job checks out, builds, measures and excludes.

Record the exact revisions of separately versioned consumers, generators, fixtures, data and deployment definitions. Choose combinations that represent the intended integration and any intermediate state its delivery order exposes.

## Select Observations

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

## Determine the Required Set

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

## Configuration Example

For example, the [workflow-server variant](../variants/workflow-server/VARIANT.md) applies this method to separate engine, definition, container and workspace branches. Its configuration supplies that project's document homes and check selection.
