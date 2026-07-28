---
metadata:
  version: 1.0.0
---

## Capability

The repository's definition guards run against one target, with every resolvable failure resolved.

## Outputs

### fail_count

Number of definition files a guard rejected, counted after every resolvable failure has been resolved. Zero when the whole suite is clean against the target.

## Protocol

### 1. Run the Definition Guards

- Each guard resolves its corpus root from `--root`, then `WORKFLOWS_DIR`, then a default relative path. Pass `--root {target_path}` so every guard reads the tree this run edits; an empty value is treated as absent and silently falls back to that default, which is a checkout the run never touched.
- The two validators take a **positional** path and implement no `--root`:
  - `npx tsx scripts/validate-workflow-yaml.ts {target_path}/{target_workflow_id}` — every definition file against its schema
  - `npx tsx scripts/validate-activities.ts {target_path}` — every activity file, including resolved step-id collisions
- The remaining guards each take `--root {target_path}`:
  - `check-all-refs.ts` — every activity and workflow technique reference resolves through the loader
  - `check-binding-fidelity.ts` — no new binding drift: every bound input key is declared, every read resolves to a producer, no declared output is dead, no bound op's own input is unsuppliable
  - `check-resource-anchors.ts` — every relative resource link with an anchor resolves to a rendered heading
  - `check-variable-model.ts` — declared defaults, existence gates and checkpoint effects are coherent with the seeded variable model
  - `check-fragments.ts` — every fragment reference resolves, every fragment is used, and no inline body duplicates a fragment or another site
  - `check-technique-template.ts` — every technique file follows the normative template
  - `check-activity-technique-overlap.ts` — no activity-level technique reference duplicates a step binding
  - `check-audience.ts` — every output declaring an agent audience carries a machine-readable artifact name
  - `check-self-provisioned-input.ts` — no step interpolates its own set target into its own technique inputs
  - `check-identifier-qualification.ts` — no new bare-word data identifier
  - `check-review-mode-gating.ts` — review-reachable gates are resolvable without a person
  - `check-stealth-isolation.ts` — no leakage path out of an isolated workflow

### 2. Resolve the Failures

- Record each rejection with the guard that raised it and the message it printed, then correct the definition and re-run that guard
- A guard reporting against a committed baseline fails only on violations beyond it; a violation that is genuinely intended is recorded as a finding for disposition rather than baselined away here

## Rules

### guard-green-is-narrow-evidence

A clean guard is evidence only for the form that guard matches. Two known blind spots stand: a resource reference in already-projected form carries no `.md` and is invisible to the anchor guard, and an unresolvable resource is skipped at delivery with no warning at all. Treat an unexplained absence in a delivered payload as a reference defect, not as an empty result.
