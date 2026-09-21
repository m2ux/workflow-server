# Authoring on this branch

This folder holds documentation that belongs to this tree's layout: how the named roots are arranged, and how to add a workflow, resource, technique or routine. What each named root is *for*, and what it holds, is in that folder's own README; the [branch README](../README.md#named-roots) maps them.

## Contents

- this file — adding a workflow, resource, technique or routine, and how definition files link

## Discovery

Discovery enters `corpus/` and skips `ledgers/`, `walks/` and `docs/` at the branch root. A `workflow.yaml` at any depth under `corpus/` is a workflow. The directory name is the id: `corpus/{id}/workflow.yaml` is the workflow `{id}`, and so is `corpus/specimens/{id}/workflow.yaml`.

## Adding a workflow

Create a directory named for the workflow's id with a `workflow.yaml` in it, under `corpus/`. Grouping folders carry no definition and exist to organise the corpus, so `corpus/group/kind/example/workflow.yaml` is the workflow `example` and is referenced by that name alone. Discovery skips `ledgers/`, `walks/` and `docs/` at the branch root, and four folder names at every depth — `activities`, `resources`, `techniques` and `routines`. The directory name is the id every reference reaches it by, so it matches the `id` the definition declares; `npm run check:workflow-identity` holds the two together.

1. Create `corpus/{workflow-id}/` with `workflow.yaml`, `README.md`, and `activities/`, `resources/`, `techniques/`, `routines/` as needed.
2. Prefix activity files `{NN}-{id}.yaml`. Connect them with `transitions`; set the workflow's `initialActivity`.
3. Commit on this branch.

### Linking between definition files

A link within a namespace is an ordinary relative path — the namespace moves as a unit, so the distance between two of its own files never changes.

A link **out of** a namespace names the namespace it wants, anchored on the id and written from a leading slash: `[commit-regular-files](/git/techniques/commit-regular-files.md)`. The leading segment resolves to wherever discovery found that namespace, so the link survives either end moving, and it reads the same whether the target is a workflow or a library. Counting directories out of a namespace (`../../git/techniques/…`) records the distance between two of them, which is a fact about today's layout rather than about either of them — and that includes a link that climbs to the corpus root only to come back into its own namespace, whose `..` count is the namespace's own depth. `npx tsx guards/check-corpus-links.ts` reports both forms; it runs by path rather than in the sweep until the corpus is rewritten to the anchored form.

Check it before committing:

```bash
npx tsx guards/validate-workflow-yaml.ts <path>
npm run check:refs
npm run check:binding
```

## Adding a resource

A resource is a slug-named markdown file under a workflow's `resources/` directory, and that slug is the id techniques refer to it by — the frontmatter `name:` matches it. Nothing registers it: the server discovers resources by reading the directory, so creating the file is the whole of the work. A technique in another workflow reaches it through the prefixed form `{workflow}/{slug}`.

## Adding a technique

A technique is a markdown file under a `techniques/` directory. Put it in the `meta` workflow when every workflow should have it, or in one workflow's own directory when only that workflow does — a workflow-local technique shadows a `meta` one of the same name. A technique may hold nested techniques in a folder of its own, and a nested technique is addressed by appending its slug to the parent's path. Like resources, techniques are discovered by reading the directory.

The file contract — anatomy, addressing, composition, delivery — is the technique protocol the server loads. The sections below are the shape that contract requires:

- YAML frontmatter carrying the version.
- **`## Capability`** — what the technique does.
- **`## Inputs`** and **`## Outputs`**, both optional. Each `###` entry may carry `####` sub-sections for its components, plus the reserved `#### artifact`, naming the file an output persists to, and `#### default`, giving an input's default.
- **`## Protocol`** — the ordered procedure, written either as `### N. Title` blocks or as a flat list, with failure handling inline in the step that gives rise to it.
- **`## Rules`** — the constraints the technique enforces.

Techniques are addressed by `::`-delimited paths — `[workflow::]technique[::nested…]` — and a reference within a single workflow omits the workflow segment. The slash form `{workflow}/{technique}` normalises to the same thing. Resolution reads the workflow from the session, looks in that workflow's own directory first, and falls back to the shared `meta` layer.

The grain of the work — judgement on live feedback versus accepted, codified application — is [Atomic Techniques; Compose at Activities](/workflow-design/resources/design-principles.md#26-atomic-techniques-compose-at-activities). This section is the file contract.

## Adding a routine

A routine is a kebab-named YAML file under a namespace's `routines/` directory, and that filename is the id every `kind: routine` step resolves. Nothing registers it: the server discovers routines by reading the directory. A step in another namespace reaches it as `{namespace}::<name>`.

The file carries `id` (matching the filename), `version`, `name`, `description`, optional `inputs` / `outputs` / `internals`, and `steps[]` as the ordinary kind-tagged list. It declares no `exits`, no `outcome`, no `rules` and no activity-wide `techniques`. How those fields map, and when a path lives here rather than as a technique, is the [schema construct inventory](/workflow-design/resources/schema-construct-inventory.md#routine-level-constructs-routineschemajson) and [Atomic Techniques; Compose at Activities](/workflow-design/resources/design-principles.md#26-atomic-techniques-compose-at-activities).
