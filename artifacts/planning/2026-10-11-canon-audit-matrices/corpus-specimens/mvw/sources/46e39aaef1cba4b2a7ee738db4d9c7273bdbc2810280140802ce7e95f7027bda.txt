---
metadata:
  version: 1.0.0
---

## Capability

The components a host repository declares as submodules, each with the path it is declared at, whether a clone has populated its working tree, and whether it is infrastructure rather than a component of the product.

## Inputs

### host_repo_path

Absolute path of the repository whose declared submodules are read.

## Outputs

### declared_components

One entry per submodule the host declares, in the order the declaration file holds them.

#### entry

##### path

The submodule path as the host declares it, relative to `{host_repo_path}`.

##### is_infrastructure

Whether the path is infrastructure rather than a component of the product, per `git.infrastructure-submodule-paths`.

##### is_populated

Whether the working tree at that path holds anything. False for a submodule the host declares and no clone has populated, which is a directory carrying no entries.

## Protocol

### 1. Read What the Host Declares

- `git -C {host_repo_path} config --file .gitmodules --get-regexp "^submodule\..*\.path$"`, and take the value of each line as a `path`.
  > The declaration file is read rather than the working tree, because a submodule the host declares and no clone has populated is exactly the entry a walk of the working tree would miss, and it is one this technique answers for. `git submodule foreach` skips it for the same reason and is not the instrument here.

### 2. Mark the Infrastructure

- Set `is_infrastructure` on each entry by applying `git.infrastructure-submodule-paths` to its path.

### 3. Read Whether Each Tree Is Populated

- Set `is_populated` from whether the directory at that path holds any entry. A declared submodule whose directory is absent or empty is recorded with `is_populated` false rather than left out: what the host declares and what a clone has materialised are two facts, and an answer carrying only their intersection cannot tell a component nobody cloned from one the host never declared.
