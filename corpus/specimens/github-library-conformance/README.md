# GitHub Library Conformance

Binds five GitHub library techniques. Label replacement and the single-select write run against the throwaway board, and each write is confirmed by the re-read its technique already specifies.

| Activity | Refers to |
|---|---|
| `list-labels` | `github::list-labels` |
| `replace-label-family` | `github::replace-label-family` |
| `find-project` | `github::project::find-project` |
| `read-project-field` | `github::project::read-project-field` |
| `write-project-field` | `github::project::write-project-field` |

Label-family replacement and single-select field writes are exercised on the scratch board, then confirmed by the re-read each write leaf already specifies.

The throwaway board is user project 8, `Throwaway library write check`. The throwaway issue is [m2ux/workflow-server#924](https://github.com/m2ux/workflow-server/issues/924). The family re-read shows `throwaway:two`. The field re-read shows Throwaway status option `29087cbe` (Two) on item `253986171`.
