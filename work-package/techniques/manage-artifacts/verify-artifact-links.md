---
metadata:
  version: 1.1.0
---

## Capability

Link integrity across a planning folder, measured as a reader following the published links would experience it.

## Inputs

### artifact_publish_ref

*(optional)* The engineering checkout's branch name, the ref published engineering-artifact links resolve against; empty when the run published none.

## Outputs

### broken_artifact_links

Every link in the planning folder that does not resolve, as `{ file, link, target, class }` entries where `class` is `missing-target`, `unresolved-anchor`, `worktree-citation`, or `resource-id-as-link`. Empty when every link resolves.

## Protocol

### 1. Enumerate Links

- Enumerate the planning artifacts in `{planning_folder_path}` — every `.md` file — and collect every markdown link each one carries.

### 2. Resolve Relative Targets

- Resolve each relative target against the folder as the published tree holds it: the artifacts committed on `{artifact_publish_ref}`, not the working tree alone. A target present locally but absent from that ref resolves for the author and 404s for the reader.
- Record each unresolved target as a `missing-target` entry.

### 3. Resolve Anchors

- Apply [Anchor Integrity](../../resources/findings-report.md#anchor-integrity) across the folder; record each `#anchor` it leaves unresolved as an `unresolved-anchor` entry.

### 4. Detect Worktree Citations

- Record as a `worktree-citation` entry any link whose target reaches outside the planning folder into a checkout path — a `../`-rooted path into source, or an absolute checkout path. A review worktree is removed at close-out, so those targets stop resolving inside the run that wrote them; a permanent blob URL at the cited commit is the resolving form.

### 5. Detect Resource Ids as Links

- Record as a `resource-id-as-link` entry any link whose target is a resource or technique id rather than a path — a bare id, or an id with no extension and no directory. Resource ids address the server's loader, not the git host, so a reader following one gets a 404.

### 6. Report

- Emit `{broken_artifact_links}` with one entry per unresolved link. Report exceptions only — a folder whose links all resolve is the one-line result, not a per-file table.

## Rules

### exhaustive-over-sampled

Every link in every artifact is resolved, not a sample. The three classes are independent — a folder can ship all three at once — so a pass that stops at the first class leaves the others live.
