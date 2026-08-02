# Inline technique→technique references: fold/composition investigation — August 2026

> Investigation · Created 2026-08-02 · **Status:** Complete (findings recorded; improvement plan tracked in the host issue)

## 🎯 Executive Summary

Techniques reference other techniques inline (`Apply [group](…)::[op](…)(arg: …)`), but there is no formal mechanism to **fold** a callee into the caller — so the reference evaporates at every layer. The loader passes it through as verbatim prose (the only body rewrite is resource links); no guard resolves it (`check-all-refs` reads only `techniques[]` lists, `check-binding-fidelity` only activity step binds, `check-resource-anchors` requires a `#anchor` the canonical form never carries); the spec's §4.2 paren-arg syntax has zero validation; and delivery is papered over by the hand-maintained `core-ops.ts` list. Measured cost: **118 unique inline Apply edges, 84% invisible to the activity layer; 56 call sites omit at least one required callee input**; live contract drift includes a dropped `client_session_index`, a `{state}`→`substitutions` rename, and restated callee procedure that no longer matches its source. Meanwhile the canon forbids the construct in three homes (AP-114, §25, §26 — hardened further by in-flight #382/#385 AP-142/143) while the addressing spec fully specifies its syntax and §3.5 sanctions it — a contradiction with no mechanical enforcement on either side.

## 📄 Documents

| # | Document | Contents |
|---|----------|----------|
| 1 | [01-composition-pipeline-trace.md](01-composition-pipeline-trace.md) | Server pipeline map (parse → compose → deliver); proof the inline ref is verbatim passthrough; fragment-resolver scope; provenance/binding machinery; the `▼ STEP` discrete-block contract; inventory of reusable mechanisms for a fold (~80% already exists) |
| 2 | [02-guards-canon-schema-survey.md](02-guards-canon-schema-survey.md) | Guard-by-guard coverage map and the seven unchecked concerns; canon stance (AP-114, AP-51, AP-54, AP-56, AP-125, §25/§26) vs spec §3.5/§4.1/§4.2 contradiction; schema audit — no formal construct at any layer; formal-vs-prose-only bottom-line table |
| 3 | [03-corpus-survey.md](03-corpus-survey.md) | Form inventory (8 forms, counts) across 554 technique files; 6 representative call sites read closely; the 118-edge / 84%-invisible activity-layer visibility result; 6 drift classes with paths |

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue (improvement plan) | [#394](https://github.com/m2ux/workflow-server/issues/394) |
| Related prior work | [#382](https://github.com/m2ux/workflow-server/issues/382) formalise reusable parallel fan-out · [PR #385](https://github.com/m2ux/workflow-server/pull/385) (introduces AP-142/143, open at time of writing) |
| AP-114 false-negative note | [../2026-08-01-formalise-reusable-parallel-fan-out/10-ap114-redesign-note.md](../2026-08-01-formalise-reusable-parallel-fan-out/10-ap114-redesign-note.md) |
| Key server files | `src/loaders/markdown-technique-loader.ts`, `src/loaders/technique-loader.ts`, `src/loaders/core-ops.ts`, `src/loaders/fragment-resolver.ts`, `src/utils/resource-ref.ts`, `src/utils/binding-provenance.ts` |
| Key guards | `scripts/check-all-refs.ts`, `scripts/check-binding-fidelity.ts`, `scripts/check-resource-anchors.ts` |
| Spec | `docs/technique-protocol-specification.md` §3.5, §4.1, §4.2 |
