# Workflow Plane — TypeScript DSL ("Score") design artifacts

Working artifacts from the multi-agent design run of 2026-06-12 that produced the
**Score** DSL specification. The governing document is
[`../../../proposals/workflow-plane/design-specification.md`](../../../proposals/workflow-plane/design-specification.md);
the finished, repair-verified DSL specification is promoted at
[`../../../proposals/workflow-plane/dsl-specification.md`](../../../proposals/workflow-plane/dsl-specification.md).

## Locked decisions (user-approved before the run)

1. **Executed builder** — the `.ts` artifact runs once at compile time in a deterministic
   sandbox (no IO/clock/RNG) and emits canonical IR; the runtime executes IR only.
2. **Techniques stay markdown** but gain *generated* TypeScript contracts so tsc
   type-checks step bindings end-to-end.
3. **Tri-layer formal definition** — normative `.d.ts` + EBNF over the canonical IR
   serialization + Alloy semantic constraints.

## Contents

| File | What it is |
|------|-----------|
| `dsl-specification-draft.md` | The Score spec, **post-repair** (12 sections: rationale/topology, authoring surface + full d.ts, technique contracts, compile pipeline, IR EBNF, Alloy constraints, worked example, TOON migration, governance, open questions). The 4-attacker adversarial pass raised 73 findings (3 critical, 45 major); all were validated against ground truth and applied/refuted/deferred — disposition log in the workflow result. Identical to the promoted `proposals/workflow-plane/dsl-specification.md`. |
| `dsl-specification-draft.md.bak` | The repair agent's pre-repair backup (the raw synthesis output). |
| `step-cp-refs.txt` | Repair-agent corpus scan scratch (step-level checkpoint references). |
| `inventory-legacy-semantics.md` | Ground truth: legacy Orchestra activity language (constructs + PROV/SYM/FLOW/LOOP/DEC/TERM/SCOPE rules). |
| `inventory-technique-contracts.md` | Ground truth: what a generated TS technique contract must represent. |
| `inventory-runtime-model.md` | Ground truth: workflow/activity/condition schemas, checkpoint + dispatch + state models. |
| `inventory-newspec-requirements.md` | Ground truth: requirements the Workflow Plane design spec places on the DSL. |
| `design-A.md` | Candidate design, lens: maximal static safety. |
| `design-B.md` | Candidate design, lens: maximal agent writability/reviewability. |
| `design-C.md` | Candidate design, lens: maximal migration fidelity. |
| `parts/` | The synthesis agent's section files (p03a–p09), assembled into the draft. |
| `tscheck/` | Compiled type-system probes: judge feasibility checks (`t1–t4.ts`), the attacker's full compilable d.ts skeleton (`full/score.ts` + `full/score.gen.ts` + probe suites), and the repair agent's verification probes (`repair-probe.ts`, `zeropad.ts`). npm scaffolding pruned. |

## Judge outcome (for context)

C won the parity lens (91); B won type-feasibility (82) and agent ergonomics (85).
The synthesis adopted B's declarative pure-value style with C's fidelity constructs
fenced behind a `MIG-001`-warned migration tier, and A's strongest structural ideas
with its fragile type-level validators amputated.

## Provenance note

The original `/tmp` working directory was lost to a tmp-cleaner mid-run; these files
were reconstructed by replaying the `Write`/`Edit`/`Bash` tool calls recorded in the
workflow's subagent transcripts. During reconstruction a real assembly defect was
found and fixed: the synthesis agent's abandoned first-pass §3 had been concatenated
alongside its revised §3 (the agent hit a spend limit before noticing); the stale
section was removed from this copy.
