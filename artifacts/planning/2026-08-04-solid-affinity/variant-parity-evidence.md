# Variant parity — the measured case

Evidence behind the catalogue proposal in this folder's item 1. Gathered 5 August 2026 against
`feat/batched-dispatch`, after the batched-dispatch review raised the class.

## What was searched

Every activity definition in the corpus — 133 YAML files across sixteen workflows — for the shape the
proposal is about: two or more steps in one activity, each binding a **different** technique, each gated
on the **same** variable tested against a **different** value.

A shared gate variable alone is not this shape, and the first pass got that wrong: keying only on "these
steps share a gate variable" returned 67 sets, most of them a sequence of steps advancing one loop, which
share the loop's state variable by construction. Requiring mutually exclusive equality tests on one
discriminator brings it down to the real cases.

Three sets qualify:

| Activity | Discriminator | Arms |
|---|---|---|
| `prism/activities/01-structural-pass.yaml` | `current_unit.pipeline_mode` | 4 |
| `work-package/activities/07-assumptions-review.yaml` | `issue_platform` | 2 (`jira`, `github`) |
| `work-packages/activities/03-analysis.yaml` | `analysis_type` | 2 (`completion`, `context`) |

The prism set was itself missed by the tightened pass, because one arm's gate tests the discriminator
against two values (`single` with a lens condition, or `full-prism`), so an arm-count-equals-value-count
test drops it. Worth knowing for anyone writing the Detect: the arms of a real variant set are not always
one value each.

## The prism set, arm by arm

Four steps in `01-structural-pass.yaml`, selected by `current_unit.pipeline_mode`:

| Arm | Gate | Declared inputs of its own | Declared outputs |
|---|---|---|---|
| `run-structural` → `structural-analysis` | `single` with lens `l12`, or `full-prism` | `analysis_focus`, `findings_destination` (both optional) | `structural_analysis` |
| `run-single-lens` → `single-lens-analysis` | `single` without lens `l12` | `lens_name` (**required**), `analysis_focus` (optional) | `lens_analysis` |
| `run-portfolio` → `portfolio-analysis` | `portfolio` | `selected_lenses`, `analytical_goal` (both optional) | `per_lens_artifacts`, `portfolio_synthesis` |
| `dispatch-behavioral-lenses` → `behavioral-pipeline::independent-lenses` | `behavioral` | none of its own | `error_resilience_analysis`, `cost_analysis`, `evolution_analysis`, `api_surface_analysis` |

Counted across the four arms: **five distinct declared inputs and eight distinct declared outputs, and
not one of either is common to all four.** One input, `lens_name`, is required on a single arm, and the
bind site supplies it on that arm only.

`target_content`, which every one of the four bind sites passes, is declared on the group container
`prism/techniques/TECHNIQUE.md` and inherited. That is the mechanism working, and it is why the arms'
own Inputs sections carry only what differs. It also means the common part of the contract is already
somewhere a reader can compare; the varying part is not.

## The seam, which is the checkable thing

After the four gated steps, an **ungated** action step `report-unit-paths` writes `all_artifact_paths`,
described as "Accumulated artifact paths across units". The next activity, `03-synthesis-pass.yaml`, binds
`prior_artifact_paths: all_artifact_paths` — so the downstream consumer reads one variable, uniformly,
whichever arm ran.

Nothing binds any arm's declared outputs into that accumulator. Eight declared output ids on one side, a
prose description on the other, and an ungated step between them that runs whatever happened. The
discriminator itself is written in `prism/activities/00-select-mode.yaml`, by neither the arms nor the
accumulator.

## One claim from the review that does not reproduce

The batched-dispatch record described this instance as "three operations bound as an escalation chain with
three different declared contracts, one consumer reading them uniformly, and the second arm rewriting the
discriminator the third arm's gate reads". Two parts of that are wrong. There are **four** arms, not
three. And **no arm writes the discriminator** — `pipeline_mode` is set in the mode-selection activity,
and grep over the whole prism tree finds no other writer. The consumer-reads-uniformly part holds, and
is the load-bearing half.

The record also said "two entries prescribe splitting a multi-mode operation into one operation per mode".
Searching every Fix in the catalogue, **one** does: `artifact-name-is-filename`, whose Fix says a name
selected by a mode input splits into a group with one operation per mode. The others that prescribe a
split (`no-monolith-masking-steps`, `no-duplicate-technique-steps`) split *steps within an activity*,
which does not produce sibling operations behind a discriminator.

## Why this does not contradict the exclusion in the same folder

This folder's *Explicitly not proposed* list rules out "a substitutability guard over the agent-entry or
analysis sets", on the grounds that their members differ by role and enforcing sameness would be wrong.
The prism set **is** that analysis set, so the proposal and the exclusion appear to collide.

They do not, once the proposal is stated as the seam rather than the arms. Requiring the four arms to
declare the same inputs and outputs would be the error the exclusion names: a portfolio run genuinely
produces different artifacts from a single-lens run. What is checkable without that error is narrower —
where a common consumer reads all arms uniformly, each arm's contribution to what that consumer reads has
to be traceable to a declared output. Today it is traceable to a sentence.

That reading also survives the scan-scope caution: the unit of comparison is one bind site plus the
consumer that reads across it, not the whole corpus.
