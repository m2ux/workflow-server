---
name: workflow-canon
description: "Apply the workflow-server design canon — design principles, the anti-pattern catalog, the schema construct inventory, convention conformance, and the repo guard suite — when authoring or auditing a workflow definition (workflow.yaml, activities/, techniques/, resources/, READMEs). Use for: \"review this workflow\", \"audit workflow X\", \"does this technique comply\", \"check for anti-patterns\", \"is this the right schema construct\", before drafting or editing any definition file, and before committing definition changes. Examples: \"audit workflow-design\", \"review my new activity YAML\", \"why is this rule an anti-pattern?\""
---

# Workflow Canon

The canon is four criteria homes plus a guard suite, all on disk in this repo.

**This skill holds no criteria of its own.** It locates the homes, enumerates their units, walks them, and reports. Copying Detect or stance text into this file would create a second home that drifts from the first — the defect the catalog itself names as `canon-layer-cites-not-restates` and `no-duplicated-guidance`. Cite entries by their kebab-case **name**; never by a bare `AP-XX` number and never by any count of the catalog's entries.

## Homes

**Locate the checkout first.** Every path below is relative to the workflow-server repo root. When the cwd is inside the checkout, `git rev-parse --show-toplevel` gives it. When the session is rooted in a cursor workspace instead — a directory holding `.mcp.json` and a `*.code-workspace` but no `workflows/` — the checkout is the `project` folder that `*.code-workspace` names, and it is an additional working directory of the session.

Confirm the resolved root holds `workflows/workflow-design/resources/` before reading anything. `workflows/` is a git submodule, so a shallow checkout may not have it; if the canon files are absent, say so rather than auditing from memory.

| Home | Path | Owns |
|------|------|------|
| Design Principles | `workflows/workflow-design/resources/design-principles.md` | *Prefer / before / only after* stance. One unit per `##` section. |
| Anti-Patterns | `workflows/workflow-design/resources/anti-patterns.md` | Specific smells as **Detect / Do not flag / Fix**. One unit per `##` family section. ~1700 lines — fetch by anchor. |
| Schema Construct Inventory | `workflows/workflow-design/resources/schema-construct-inventory.md` | Informal-prose → formal-construct mappings. One unit per `##` section. |
| Convention Conformance | `workflows/workflow-design/resources/convention-conformance.md` | Comparison against sibling workflows. One unit. |
| Guard suite | `scripts/guards.ts` (registry) | Mechanical checks. The registry is the enumeration — never maintain a parallel list. |

Anchors on the principles home embed the ordinal (`#13-separate-contract-from-procedure`). Cite by **title**; if an anchor fails to resolve, the section was renumbered — re-read the heading rather than guessing.

Read [references/canon-map.md](references/canon-map.md) before the first fetch: it carries the explicit unit inventory, the fetch-by-section anchors, the file-kind → binding-unit routing, and what must *not* be taken from each home.

## Pick the path

| Situation | Path |
|-----------|------|
| About to write or edit a definition file | **Draft** below |
| Reviewing or auditing existing definitions | **Audit** below |
| One narrow question ("is X an anti-pattern?", "which construct for Y?") | Fetch that single entry or inventory row, answer, stop. No walk, no report. |

## Draft

Applied *before* content exists, so the stance does the work and the Detect pass finds nothing.

1. **Fix the construct before the prose.** Fetch the construct-inventory section for the kind you are authoring (activity / workflow / technique / condition) and pick the most specific formal construct it offers. Prose that an inventory row maps to a construct is a defect the moment it is written, not at audit time.
2. **Load the stance that binds this file kind.** Use the routing table in [references/canon-map.md](references/canon-map.md#file-kind-routing) — it names the principles and the anti-pattern families a technique, activity, resource, or README can actually violate. Read the stance sections, not a summary of them.
3. **Read a live sibling.** Convention conformance is defined relative to existing workflows; the reference files are the baseline, and this skill does not substitute for opening them.
4. **Write.**
5. **Self-check before saving.** Re-walk only the units step 2 routed you to, against the file you just wrote. Then run the guards from the repo root — `npm run check:all`, or `npx tsx scripts/check-all.ts --only <id>,<id>` for a fast subset. Schema validity, reference resolution, and binding fidelity are cheaper to settle mechanically than by reading.

A draft self-check is not an audit and does not produce a findings register. If the change is going to commit, run the Audit path.

## Audit

### 1. Scope the surface

Name, before reading criteria:

- **Surface files** — every definition file of the target: `workflow.yaml`, `activities/`, `techniques/`, `resources/`, and the READMEs.
- **Changed files** — the subset differing from the base ref. Without this, nothing can be attributed.
- **Consumer surface** — the references other workflows hold *into* the target, each resolved to the file it names. A violation reachable only from a consumer is reachable. `grep -rn "<target-id>/" workflows/ --include=*.md --include=*.yaml` finds the cross-workflow refs.
- **Reference workflows** — the siblings of similar type whose conventions the target is compared against.
- **Base ref** — the ref the change is measured against.

### 2. Run the mechanical guards first

`npm run check:all` for the whole registry, or `npx tsx scripts/check-delta.ts --base <ref>` to get only what *this change* added — the delta runner materialises the merge-base in a throwaway worktree and diffs the two runs, which does the attribution of step 5 mechanically and exactly.

Guard findings are evidence, not judgment: they settle the schema-invalid, unresolved-reference, and binding-drift classes before any reading starts, and a guard failure is `Critical` on sight. Exit 2 means a guard could not measure — that is `blocked` coverage, never a pass.

### 3. Enumerate the criteria units

Take the explicit unit list from [references/canon-map.md](references/canon-map.md#unit-inventory). **Enumerate that list; do not pattern-match section titles.** Catalog entries sit outside the family sections, and a title pattern drops them with no error, no warning, and no coverage signal.

Do not restate, summarise, or renumber the entries a unit contains. Follow each as written.

### 4. Walk every unit against the surface

- Apply each entry's **Detect**, honour its **Do not flag** carve-outs, and record its **Fix** verbatim in intent when it fires.
- **Detect comes from the anti-pattern and inventory homes only.** From the principles home take only whether the authored content honours the stance — so one violation is not counted twice under two homes.
- Extend the same criteria to the consumer surface.
- Compare against the reference workflows wherever a unit states its criteria relative to sibling convention.
- Record every unit's disposition into the coverage ledger as you go — `walked`, `not-applicable` with the reason it does not reach this surface, or `blocked` with what prevented the walk. Only `blocked` is missing coverage; `not-applicable` is an evidenced negative.

### 5. Attribute and exclude

Attribute each finding against the base ref: a violation in a changed file arrived with this change; one anywhere else pre-existed it. Mark findings whose key a prior pass already accepted as **known** and keep them out of the decision surface — recorded, not deleted, so a later pass can ask whether the acceptance still holds.

### 6. Verify High findings adversarially

**Refute by default.** For each High, re-derive it from the cited file and construct alone, without re-reading the pass that produced it. A High survives only if the re-derivation independently reproduces it; withdraw the ones it does not, and downgrade any whose evidence supports only a lesser issue. Spot-confirm surviving Mediums — the cited construct exists and the finding class is right — without full re-derivation.

Only confirmed findings are eligible to drive fixes.

### 7. Report

Per [references/reporting.md](references/reporting.md): the finding row shape, the coverage ledger, the severity scale, and which report shape applies. Inside a workflow-authoring or workflow-design run, that run's creation guides own the layout and this skill defers to them.

## Non-negotiables

- **Structural evidence or it is not a finding.** A finding names the field, shape, or phrase its entry's Detect keys on. Inferred intent is never that evidence. Where an entry keys on the harness tool surface or an authoritative bootstrap resource, the evidence is that surface read directly — not the authored claim about it.
- **Cite by name.** Kebab-case entry name and principle title. No bare `AP-XX`, no entry counts — both drift.
- **One violation, one home.** Do not report the same bad sentence under a principle and its covering anti-pattern.
- **Fix, do not merely file.** When the request is to bring content into compliance, apply the Fix each entry prescribes rather than handing back the register. Enumerate findings before proposing to accept any of them.
- **Never edit the schema to make content validate.** That is `schema-is-constraint`; content conforms to the schema.

## References

- [references/canon-map.md](references/canon-map.md) — unit inventory, fetch anchors, file-kind routing, per-home boundaries.
- [references/reporting.md](references/reporting.md) — severity scale, finding and coverage row shapes, report templates.
