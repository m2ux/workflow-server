# Scope Manifest — Rule and checkpoint fragments: a shared home

**Targets:** `work-package` v4.0.0, `remediate-vuln` v3.0.0 · **Mode:** Update
**Basis:** [Change brief](01-change-brief.md) · [Impact analysis](01-impact-analysis.md) · [Findings register](09-findings-register.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-30-rule-and-checkpoint-fragments-a-shared-body` — on branch `workflow/work-package-borrowed-gate-variables` at `bc52c69`, the fetched `origin/workflows` tip

Three files modified, none created, none removed. Preserved instead of removed: none — nothing was flagged.

---

## File manifest

| # | Path | Kind | Action | One-line change | Entered scope |
|---|------|------|--------|-----------------|---------------|
| 1 | `meta/techniques/agent-conduct.md` | Technique | Modify | The Artifact Writing Register citation carries the `meta/` segment | Remediation round 1 |
| 2 | `meta/techniques/verify-artifact-conforms.md` | Technique | Modify | The same citation, in the protocol step measuring artifacts against the register | Remediation round 1 |
| 3 | `workflow-design/resources/schema-construct-inventory.md` | Resource | Modify | One Workflow-Level Constructs row for `fragments.checkpoints` | Remediation round 1 |

**No file under either target changes.** Both `work-package` and `remediate-vuln` are delivered
untouched, which is what the original scoping concluded and what remains true. The three files
above are shared canon that both targets read.

**Out of scope this pass:**

- `work-package/workflow.yaml` and the four activity files holding the seven `ref` sites — the migration surface of [#520](https://github.com/m2ux/workflow-server/issues/520), which retires #519's checkpoint half.
- `schemas/workflow.schema.json` and `src/loaders/fragment-resolver.ts` — same, and outside the edit surface besides.
- `remediate-vuln/workflow.yaml` — candidate until the variable check was measured; the declarations it was to gain already reach it from the borrowed activities.
- `scripts/check-fragments.ts` — candidate for a widened `undeclared-effect-variable` walk; the walk already follows `activities:` refs into the authoring workflow, so there is nothing to widen.
- `scripts/binding-fidelity-triage.json` — holds the stale entry behind the register's open finding F3. In the server repository, outside this edit surface.

---

## How the manifest came to hold three files

The manifest confirmed at the scope gate enumerated none, and that was correct for what it
scoped: no criterion of #519 leaves a definition change under either target. Every file here
entered later, through the disposition gate, when the operator chose remediation over
acceptance for two pre-existing findings the criteria walk had surfaced in shared canon.

The two directions of the scope check therefore disagree by construction, and the register
records why: a remediation round's edits are bounded by the findings it repairs, not by the
manifest confirmed before those findings had a disposition.

---

## Structural design

```
meta/techniques/          # two citations requalified
workflow-design/resources/ # one inventory row added
work-package/              # unchanged
remediate-vuln/            # unchanged
```

**Flow:** unchanged. No activity is added, removed or reordered, so `work-package`'s graph and
`initialActivity` stand, and `remediate-vuln`'s graph keeps binding the same borrowed activity ids.

| Convention | This change |
|------------|-------------|
| File naming | No file is created, so no name is minted |
| Field ordering | No field is added to any YAML |
| Version format | No definition changes shape, so no version is bumped |
| Routing patterns | Untouched — no exit or graph edge changes |
| Checkpoint structure | The two shared bodies keep their `fragments.checkpoints` form; #520 converts them |
| Technique structure | Untouched — the two edits are citation paths inside existing prose |
| Reference conventions | The requalified form matches 32 sibling citations under `meta/techniques/workflow-engine/` |

---

## Drafting order

1. **Root definition** — none. `work-package/workflow.yaml` holds the two checkpoint fragments and changes under #520.
2. **Activities** — none. The four files holding the seven `ref` sites change under #520.
3. **Techniques** — entries 1 and 2, one citation each.
4. **Resources** — entry 3, one table row.
5. **README** — no tree change to describe.
