# Portfolio — Rejected-Paths Lens — inspect_session (#193)

> Lens: rejected-paths (09). Subject: session read path + read-only tool pattern for the proposed `inspect_session` tool. Work package: #193. Date: 2026-07-11.

Rejected-paths law surfaced: **the problem the tool removes (per-call permission prompts + regenerated projection logic) migrates from *visible friction* to *hidden divergence risk* — two projection definitions that can silently drift.**

## Concrete problems, enabling decision, and the rejected path

| Concrete problem | Decision that enabled it | Rejected path that would have prevented it | New invisible danger the rejected path creates |
|---|---|---|---|
| 8 ad-hoc `python3 -c` reads per run, each a fresh permission prompt | No first-class read tool; inline `-c` refused by the allow-hook by design | Allow-list the inline form / relax the hook | Re-opens the exact sandbox-escape vector the hook exists to close — worse than the friction |
| Wrong-key probe silently reports nothing | Projection logic regenerated per call | Ship the static `inspect_session.py` as the sole answer | Script still needs a permission grant per environment; no server-resident schema authority; two copies of projection logic to keep aligned |
| Response could bloat with `history`/`deliveredContent` | Session file accretes unbounded fields | Return raw `session.json` (simplest to build) | Token blow-up worst at close-out; forces every consumer to re-implement projection — the original problem returns one layer up |
| Two positional/edge semantics for children | `child_index` overlaps with index-based child resolution | Support only index-based child addressing (drop `child_index`) | Loses the reference contract's positional `triggeredWorkflows[n]` semantics that close-out summaries expect; forces callers to know each child's index string |
| Two projection definitions (Python spec + TS tool) can diverge | Reference impl is normative but not executed by the server | Generate TS from the script / share one definition | Over-engineering for a simple additive tool; a test asserting parity is the lighter guard |

## Meta-observation

The whole feature is **one migration**: moving projection authority from *N inline ad-hoc definitions* (visible cost: prompts + tokens; hidden cost: correctness) to *one server-resident definition* (visible cost: none; hidden cost: the TS port must stay faithful to `inspect_session.py`). The load-bearing risk is not building the tool — GitNexus shows zero existing callers and no modified flows, so the blast radius is nil — but **fidelity of the port to the normative script**, especially the root-relative one-level `--child` semantics and the exact view set (`summary|identity|variables|checkpoints|activities|history|children`).

## Prediction — which migration a practitioner discovers first under pressure

The **`child_index` semantics mismatch**. Under close-out pressure an author inspecting a nested work-package will reach for a child view, hit the overlap between "positional from the addressed session" (script) and "resolve by the child's own index" (existing resolver), and get either the wrong sub-state or a `NOT_FOUND`. It is the first divergence a real close-out run exercises, and the design-philosophy note already flags it as the one composition decision left for plan-prepare.
