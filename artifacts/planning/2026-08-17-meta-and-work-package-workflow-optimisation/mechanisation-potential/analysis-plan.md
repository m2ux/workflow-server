# Analysis Plan — /home/mike1/projects/dev/workflow-server

**Scope:** codebase · **Budget:** thorough · **Units:** 1 · **Dispatches:** 3

The unit is adopted from the parent evaluation's confirmed plan rather than re-derived by survey. It is the primary lead: the agent-executed technique prose in `workflows/meta` and `workflows/work-package`, judged for which protocol steps are deterministic procedures a script or server tool could compute. Because the dominant failure mode here is a false positive — prose that reads like an algorithm but resolves a judgement call — the unit takes the 3-pass self-correcting L12 pipeline, where an adversarial pass exists specifically to attack the structural pass's candidate list.

## Units

| # | Target | Role | Risk | Mode | Lenses | Why |
|---|--------|------|------|------|--------|-----|
| 1 | `/home/mike1/projects/dev/workflow-server` | workflow-definitions | high | full-prism | l12 | Primary lead of the parent evaluation; highest false-positive risk (prose that looks deterministic but hides judgement), so it takes the 3-pass self-correcting pipeline. |

## Analytical focus

Evaluate the mechanisation potential of agent-executed technique prose in `workflows/meta` (150 technique files, ~34,900 words) and `workflows/work-package` (112 files, ~66,300 words): find every protocol step that is a deterministic procedure a script or server tool could compute. Repo/component/issue/PR coordinate resolution (`version-control::resolve-host-repo`, monorepo component matching) is the guide, not the boundary; path derivation, repo- and project-type detection, artifact link and anchor checking, `sync-progress-status` Progress-table writes, git and worktree state checks, classification steps that are fixed decision tables, and artifact format and schema validation are all in scope. Each candidate is tested for whether the procedure is genuinely deterministic or whether the prose hides a judgement call.

## Grounding measurements

Measured by the parent's scoping pass and carried in rather than re-measured.

| Surface | Measurement |
|---|---|
| `workflows/meta` | 171 files (160 md, 11 yaml), 290 KB, ~34,900 words — 5 activities, 150 technique files across 9 groups, 7 resources, 5 checkpoints |
| `workflows/work-package` | 168 files (152 md), 617 KB, ~66,300 words — 15 activities, 112 technique files across 16 groups, 37 resources, 44 checkpoints |
| `src/` | 12,343 LOC TypeScript (utils 4,000; tools 2,821; loaders 2,359; schema 1,621; transports 224; middleware 90; resources 66); 16 registered MCP tools (14 workflow, 2 resource), every one session control-plane |
| `scripts/` | 44 scripts, 15,257 LOC, including 26 `check-*.ts` guards reachable only as repo CI |
| `tests/` | 72 test files, 18,420 LOC |

## Execution

**Order:** one unit, three serial passes — structural (`l12`) then adversarial (`l12-complement-adversarial`) then synthesis (`l12-synthesis`). Each pass depends on the artifact the previous one wrote, so none may run concurrently.

**Concurrent:** none. Serial dependency across all three passes.

**Artifacts:** all flat in the output directory (`unit_output_subdir` is empty) — `structural-analysis.md`, `adversarial-analysis.md`, `synthesis.md`, then `REPORT.md`, `DEFINITIVE-FINDINGS.md`, `RUN-MANIFEST.json`.

**Fan-in analysis not available:** GitNexus is not indexed for this target (`gitnexus_available = false`), so module boundaries and caller counts come from directory layout, group membership and grep-level reference counting rather than graph queries.
