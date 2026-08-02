# Scope Manifest — Formalise reusable parallel fan-out

**Primary target:** `meta` · **Co-edit:** `workflow-design`, `prism`, `work-package` · **Mode:** Update  
**Basis:** [01-change-brief.md](01-change-brief.md) · [01-impact-analysis.md](01-impact-analysis.md) · [06-migration-candidates.md](06-migration-candidates.md)  
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/` — branch `workflow/meta-formalise-reusable-parallel-fan-out`

---

## File manifest (current design)

Paths under the worktree root.

| # | Path | Kind | Action | One-line change |
|---|------|------|--------|-----------------|
| 1 | `meta/activities/patterns/06-process-unit-fan-out.yaml` | activity pattern | create | Process/shell/tool suite spine: seed → execute/wait-all/gather → `{unit_results}` |
| 2 | `meta/activities/patterns/README.md` | readme | modify | Catalog 06; apportionment; seed vars for process-unit |
| 3 | `meta/techniques/unit-fan-out.md` | technique | **delete** | Coordination is activity-owned (AP-143); not a strategy technique |
| 4 | `meta/techniques/cargo-operations/run-suite.md` | technique | modify | Pure combine over `{unit_results}` |
| 5 | `meta/techniques/cargo-operations/TECHNIQUE.md` | technique | modify | Leaf ops do not scatter multi-op suites |
| 6 | `meta/techniques/scatter-gather.md` | technique | modify | Agent-instance parallel boundary; process units elsewhere |
| 7 | `meta/techniques/README.md` | readme | modify | Drop unit-fan-out; point process suites at pattern 06 |
| 8 | `meta/README.md` | readme | modify | Catalogue process-unit pattern; tree under `activities/patterns/` |
| 9 | `work-package/activities/11-validate.yaml` | activity | modify | Mirror process-unit pattern spine + `run-suite` combine; step gates on inline `when:` (PR #383 dialect) |
| 10 | `work-package/README.md` | readme | modify | Validate uses pattern spine, not strategy technique |
| 11 | `workflow-design/resources/design-principles.md` | resource | modify | §2 layer map; §34 pattern homes; renumbered principles |
| 12 | `workflow-design/resources/anti-patterns.md` | resource | modify | AP-140–143; AP-36/39/110/107 scrub |
| 13 | `workflow-design/resources/schema-construct-inventory.md` | resource | modify | Layer map; pattern-primary rows; 06 process-unit |
| 14 | `workflow-design/resources/README.md` | readme | modify | Index blurbs for §2/§34/AP-143 |
| 15 | `prism/techniques/behavioral-pipeline/independent-lenses.md` | technique | modify | Atomic lens work; parallel dispatch activity-owned |
| 16 | `work-package/activities/14-complete.yaml` | activity | integrate | OR keep-sites → parenthesized `when:` (from [PR #383](https://github.com/m2ux/workflow-server/pull/383)) |
| 17 | `workflow-design/activities/01-intake-and-context.yaml` | activity | integrate | `persist-structural-inventory` OR gate → `when:` (PR #383) |
| 18 | `prism/activities/01-structural-pass.yaml` | activity | integrate | `run-structural` nested OR gate → parenthesized `when:` (PR #383) |
| 19 | `meta/techniques/workflow-engine/activity-worker.md` | technique | integrate | Walker/docs alignment with shared when-expression (PR #383 pin) |
| 20 | `workflow-design/techniques/yaml-authoring.md` | technique | modify | Retarget Document-in-Positive-Present anchor after § renumber |
| 21 | `workflow-design/techniques/readme-authoring.md` | technique | modify | Retarget Complete-Documentation-Structure anchor after § renumber |
| 22 | `workflow-design/techniques/audit-rule-enforcement.md` | technique | modify | Retarget Encode-Constraints-as-Structure anchor after § renumber |
| 23 | `workflow-authoring/techniques/workflow-definition/readme-authoring.md` | technique | modify | Retarget Complete-Documentation-Structure anchor after § renumber |

**PR #383 implications (host server track — not authored here):**

| Surface | Implication for this branch |
|---------|------------------------------|
| `src/schema/when-expression.ts` | Reference parse/eval (parens, C-style `\|\|`/`&&`/`!`); mechanical nets fail-closed on invalid input |
| `scripts/check-when-expression.ts` (`check:when`) | Authoring guard: bare mixed `&&`/`\|\|` without parentheses is a hard fail |
| Four OR keep-sites | Already on this branch via merge of workflows pin `d891ed73` — do not reintroduce structured OR trees on those steps |
| Loop / checkpoint gates | Still structured `condition:` where the schema uses that field (e.g. `11-validate` fix-revalidate loop) |
| Host merge order | Server PR #383 should land (or be available) before host pin of this workflows branch so `check:all` / e2e walker agree with parenthesized OR |

**Out of scope this pass:**

- Server-side technique→technique reference resolution (host parser follow-up)
- Migrating live `scatter-gather.md` body off coordination Capability (definition debt)
- Server `src/` / `schemas/` (owned by [PR #383](https://github.com/m2ux/workflow-server/pull/383) / #379)
- Full corpus structured→`when` migration beyond co-touched validate steps and the four #383 keep-sites
- Optional `dispute-analysis` dual-dispatch (still deferred)

**Binding split (current):**

| Call site | Unit kind | Coordination home |
|-----------|-----------|-------------------|
| validate cargo suite | same-context process | **`meta/patterns/06-process-unit-fan-out`** (mirrored in `11-validate`) + pure `run-suite` |
| agent / lens mid-phase | agent workers | **`meta/patterns/01`–`05`** (borrow or mirror) |
| pure combine | N/A | atomic technique over already-gathered results |

---

## Structural design

```
{target_path}/
├── meta/
│   ├── activities/patterns/
│   │   ├── 01…05-*.yaml                   # agent coordination (existing)
│   │   ├── 06-process-unit-fan-out.yaml   # create — process suite
│   │   └── README.md                      # modify
│   ├── techniques/
│   │   ├── unit-fan-out.md                # delete
│   │   ├── scatter-gather.md              # modify — agent boundary
│   │   ├── cargo-operations/run-suite.md  # pure combine
│   │   └── README.md
│   └── README.md
├── work-package/activities/11-validate.yaml
├── workflow-design/resources/             # canon
└── prism/techniques/.../independent-lenses.md
```
