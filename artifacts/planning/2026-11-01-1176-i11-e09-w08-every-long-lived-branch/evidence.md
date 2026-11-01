# W08 Evidence

Every check runs `sync.py --names --project /home/mike1/projects/dev/workflow-server --revision <ref>` from the skill as committed on `i11/e09/workspace` at `3f7915377`, which reads `config/branches` at the commit the revision resolves to.

## Before

Each long-lived head, and each epic base cut from it, holds no declaration.

| Revision | Commit | Result |
| --- | --- | --- |
| `origin/main`, `origin/i11/e09/main` | `824e36439` | `unevaluable: no config/branches at 824e364…` |
| `origin/workflows`, `origin/i11/e09/workflows` | `a4b5b9cca` | `unevaluable: no config/branches at a4b5b9c…` |
| `origin/docker`, `origin/i11/e09/docker` | `86febd448` | `unevaluable: no config/branches at 86febd4…` |

## Declaration

Each task branch commits blob `759ee90cb`, the blob `workspace` commits: `docker`, `main`, `workflows`, `workspace`.

## Main

| Revision | Commit | Result |
| --- | --- | --- |
| `i11/e09/w08-every-long-lived-branch-main` | `815499b6a` | `source: config/branches at 815499b6a…`; `docker`, `main`, `workflows`, `workspace` |

## Workflows

| Revision | Commit | Result |
| --- | --- | --- |
| `i11/e09/w08-every-long-lived-branch-workflows` | `ad42dade6` | `source: config/branches at ad42dade6…`; `docker`, `main`, `workflows`, `workspace` |

## Docker

| Revision | Commit | Result |
| --- | --- | --- |
| `i11/e09/w08-every-long-lived-branch-docker` | `171837cdb` | `source: config/branches at 171837cdb…`; `docker`, `main`, `workflows`, `workspace` |

The `docker` build context admits only the files its Dockerfile copies, so `config/` stays out of the image.
