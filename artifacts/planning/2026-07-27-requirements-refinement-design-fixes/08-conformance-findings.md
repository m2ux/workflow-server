# Convention Conformance Findings — `requirements-refinement`

**Mode:** update · **Date:** 2026-07-27
**Pass:** conformance
**Target:** `requirements-refinement` v1.2.0

Reference baseline: the 14 sibling workflows under `workflows/` (108 activity YAMLs, 505 technique files).

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| C-1 | High | Seven `_path` technique outputs added this pass are interpolated in activity `message` fields but were absent from `variables[]`. Sibling convention is **19/19 with zero exceptions** — every `_path` a sibling interpolates in an activity message is declared as a workflow variable (`type: string`, `defaultValue: ""`) | `workflow.yaml` `variables[]` vs `activities/01,03,04,05,06` messages | **Applied** — the seven declarations added in pipeline order, matching the sibling shape |
| C-2 | Low | All four `resources/*.md` lack the `name` / `description` / `metadata.order` frontmatter carried by 141 of 142 sampled sibling resource files (the sole exception being a folder-index README) | `resources/specification-protocol.md`, `validation-rubric.md`, `requirements-analysis-report.md`, `change-summary.md` | Justified deferral — the files load correctly by filename-derived id (verified: `requirements-refinement/specification-protocol#status-conventions` resolves with its anchor), so the gap costs only listing metadata. All four are outside the confirmed 16-file scope ([impact analysis](05-impact-analysis.md) lists them Unaffected). Carry as a follow-up |

**Finding count:** 2 as found · **1 residual** after the fix cycle (C-2 — deferred follow-up)

## Notes

Concerns checked against `convention-conformance` and confirmed conformant:

- **File naming** — activities `NN-name.yaml`; techniques and resources kebab-case `.md`.
- **Field ordering** — activity root `id, version, name, description, required, steps, transitions, outcome` matches the dominant sibling order (`required` at line 5 in 65 of 108 sibling activities). Technique section order Capability → Inputs → Outputs → Protocol → Rules matches siblings exactly.
- **Version format** — semantic `X.Y.Z` throughout. Per-file independent bumping is the corpus norm; no workflow-to-activity version linkage convention exists to violate.
- **Transition patterns** — `to` / `condition` / `isDefault` as siblings use them. Terminal activities `05` and `06` omit the `transitions:` block, matching all 25 sibling terminal activities — no explicit terminal marker exists in the schema. Confirms the A-10 position.
- **Checkpoint structure** — inline `kind: checkpoint` steps with `message` / `options` / effects.
- **`techniques.activity: [variable-binding]`** — matches 13 of 14 siblings verbatim.
- **Technique frontmatter** — all eight technique files carry `metadata.version`; `techniques/README.md` omits it, matching the sibling convention that folder-index READMEs carry none.
- **Activity-number gap at `02`** — **not** a divergence: 2 of 14 siblings carry gaps (`substrate-node-security-audit` at 08–09, `workflow-design` itself at 02 and 07), and renumbering is explicitly out of scope because `artifactPrefix` is server-computed from the filename.
- **Effect-less checkpoint options** — **not** a conformance divergence: 76 of 230 sibling checkpoint options (33%) carry no `effect`, and the schema requires only `id` + `label`. The four effect-less options here are held as a canon matter (AP-89) at Gate 2 under A-5 / A-7, not as a convention gap.
- **`intake-sources.md` not redeclaring container inputs** — conformant, and resolves [F-2](03-follow-ups.md) in the draft's favour. `source_path`, `target_doc_path`, and `planning_folder_path` are exactly the "workflow-wide contextual inputs (artifact location, target path)" that `hoist-shared-inputs` (AP-55) directs onto the container; redeclaring them on the leaf is the anti-pattern. The specification's G6 row for this file is superseded.
