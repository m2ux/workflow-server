# Authoring on this branch

This folder holds documentation that belongs to this tree's layout: how the named roots are arranged, and how to add a workflow, resource or technique. What each named root is *for*, and what it holds, is in that folder's own README; the [branch README](../README.md#named-roots) maps them.

## Contents

- this file — adding a workflow, resource or technique, and how definition files link

## Discovery

Discovery enters `corpus/` and skips `ledgers/`, `walks/` and `docs/` at the branch root. A `workflow.yaml` at any depth under `corpus/` is a workflow. The directory name is the id: `corpus/{id}/workflow.yaml` is the workflow `{id}`, and so is `corpus/specimens/{id}/workflow.yaml`.

## Adding a workflow

Create a directory named for the workflow's id with a `workflow.yaml` in it, under `corpus/`. Grouping folders carry no definition and exist to organise the corpus, so `corpus/group/kind/example/workflow.yaml` is the workflow `example` and is referenced by that name alone. Discovery skips `ledgers/`, `walks/` and `docs/` at the branch root, and three folder names at every depth — `activities`, `resources` and `techniques`. The directory name is the id every reference reaches it by, so it matches the `id` the definition declares; `npm run check:workflow-identity` holds the two together.

1. Create `corpus/{workflow-id}/` with `workflow.yaml`, `README.md`, and `activities/`, `resources/`, `techniques/` as needed.
2. Prefix activity files `{NN}-{id}.yaml`. Connect them with `transitions`; set the workflow's `initialActivity`.
3. Commit on this branch.

### Linking between definition files

A link within a workflow is an ordinary relative path — the workflow moves as a unit, so the distance between two of its own files never changes.

A link **out of** a workflow names the workflow it wants, anchored on the id and written from a leading slash: `[conduct](/shared/techniques/conduct.md)`. The leading segment resolves to wherever discovery found that workflow, so the link survives either end moving. Counting directories out of a workflow (`../../shared/techniques/…`) records the distance between two workflows, which is a fact about today's layout rather than about either of them — and that includes a link that climbs to the corpus root only to come back into its own workflow, whose `..` count is the workflow's own depth. `npx tsx guards/check-corpus-links.ts` reports both forms; it runs by path rather than in the sweep until the corpus is rewritten to the anchored form.

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
