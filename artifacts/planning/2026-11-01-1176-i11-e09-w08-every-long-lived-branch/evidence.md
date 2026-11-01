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

## Merged Bases

| Revision | Commit | Pull request | Result |
| --- | --- | --- | --- |
| `origin/i11/e09/main` | `1cd4a87d9` | [#1494](https://github.com/m2ux/workflow-server/pull/1494) | `source: config/branches at 1cd4a87d9…`; `docker`, `main`, `workflows`, `workspace` |
| `origin/i11/e09/workflows` | `7f76f53b8` | [#1495](https://github.com/m2ux/workflow-server/pull/1495) | `source: config/branches at 7f76f53b8…`; `docker`, `main`, `workflows`, `workspace` |
| `origin/i11/e09/docker` | `8e276e55c` | [#1496](https://github.com/m2ux/workflow-server/pull/1496) | `source: config/branches at 8e276e55c…`; `docker`, `main`, `workflows`, `workspace` |

## Checks

- **`main` (#1494).** Typecheck, schemas and test suite; definitions-call-tools; walk delivery cost: all pass at `815499b6a`.
- **`workflows` (#1495).** Checkpoint options pass. The guard sweep fails at `ad42dade6` on `corpus-links` (relative links from `work-package` to `gitnexus` and `prism` techniques). The base head `a4b5b9cca` fails the same guard the same way, and no rule on the base requires the check.
- **`docker` (#1496).** No checks run on the branch.

## Epic Sync

`sync.py` on #1176 with `--revision origin/i11/e09/workspace` reads the three W08 links, reports W08 done and AC15 ticked, and reports `i11/e09/main`, `i11/e09/workflows` and `i11/e09/docker` unmerged behind draft review pull requests #1506, #1497 and #1498.
