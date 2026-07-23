# Format Conventions — Authoring Literacy

> YAML / markdown conventions for authoring workflow definitions in this repo. Reference for drafting Pass B edits to `work-package` and `meta`.

## Workflow definition (`workflow.yaml`)

- Fields: `id`, `version` (semver `N.N.N`), `title`, `description`, `tags[]`, `rules{}` (`workflow` / `activity` / `universal`), `variables[]`, `initialActivity`, `activities[]` (each `id`, `name`, `required`, `artifactPrefix`).
- Rules entries are strings or `{ ref: name }` fragment references resolved against `fragments.rules` (bare name: declaring workflow, then `meta`).
- Version bumps follow semver on every authored change.

## Activity files (`activities/NN-<id>.yaml`)

- `id`, `version`, `name`, `description`, `required`, `rules[]`, `steps[]`, `transitions[]`, `outcome[]`, `artifacts[]`.
- `steps[]` kinds: `action` (agent-executed `actions[]`: `set` / `log` / `message` / `validate`), `technique` (bound `group::operation`, optional `inputs`/`outputs` deviations), `checkpoint` (`condition`, `message`, `options[]` with `effect.setVariable` / `transitionTo`, optional `blocking`).
- `when:` / `condition:` gates read the variable bag via structured conditions (`simple`, `and`, `or`, dotted paths).
- `transitions[]` evaluate in array order; first true `condition` wins; `isDefault: true` is the fallback.

## Technique / resource markdown

- Techniques: frontmatter `id`, `version`, `capability`, `inputs[]`, `outputs[]`, `protocol` (titled steps), `rules`. Follow `signature-is-the-contract`.
- Cross-workflow references use qualified ids (`meta/...`, `ponytail/<id>`); a workflow's own group operations use the bare shorthand.
- Documentation voice: declarative present tense, describe the system as it is; no evolution narrative in system docs (planning artifacts excepted).

## Conventional Commits / DCO

- `type(scope): description`; reference issue numbers; `git commit -s` (Signed-off-by).
