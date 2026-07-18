# Anti-Pattern Findings — work-package v3.31.0

**Session:** PCVJDD · **Activity:** post-update-review · **Date:** 2026-07-18
**Commit:** `89c6b9c3` · **Catalog:** AP-01 … AP-116
**Scope:** committed diff under `work-package/` (4 activities + `README.md` + `workflow.yaml` version bumps)

| Entry | Designator | Result |
|-------|------------|--------|
| — | — | *No findings* |

**Spot checks (changed surfaces):**

- `link-named-artifacts` (AP-97) — `file-index-table` and `dco-sign-off-confirmation` checkpoints now carry `[label]({path_variable})` for `{change_block_index}` / `{provenance_log_path}`; no hard-coded `NN-` prefix
- `statement-not-question` (AP-99) / `no-next-step-narration` (AP-98) — all four edited messages remain statements with no trailing `?` and no auto-advance/routing narration
- `no-rationale-in-description` (AP-26) — trimmed option descriptions (`proceed-with-gaps`, `rationale-confirmed-with-issues`) keep the WHAT clause only; removed clause was restated location/consumer detail, not a fact unique to that option
- `checkpoint-requires-decision` (AP-89) / `one-decision-one-checkpoint` (AP-88) — option sets and effects unchanged; no ceremony introduced or decision split
- Tool-Technique-Doc Consistency — no tool name or bootstrap-path text in this commit

**anti_pattern_finding_count:** 0
