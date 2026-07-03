# Contract Seam Check — Bindings ↔ Declared I/O ↔ Protocol Prose (Phase 2c)

Date: 2026-07-03. Sample: 25 bound steps across 7 workflows (meta ×8, work-package ×10, prism ×2, codebase-wiki ×2, workflow-design ×2, substrate ×1); 19 object-form, 6 string-form. `check-binding-fidelity.ts` read first so findings below are what the guard does NOT catch.

## Per-class summary

| Class | Count in sample | Pattern |
|---|---|---|
| RENAME DRIFT | 2 (+1 effective) | `match_ambiguous` (technique output) vs `workflow_match_ambiguous` (activity condition variable), meta/00 — string binding, so no remap is even possible; `create-session.md` prose hardcodes its caller's variable `{client_planning_slug}` instead of its own declared input `planning_slug`; prism `pass_artifact` vs `all_artifact_paths` (unmapped rename in effect). |
| PROSE-ONLY CONTRACT | 4 | `gitnexus_available` consumed by `substrate/search-pattern-catalog` protocol, never declared; `comprehension_dir` cross-group coupling in `codebase-wiki/write-overview`; `has_saved_state` (meta/00) read by a checkpoint with no producer — its only `set` is gated on itself (circular); orphan inputs `issue_details`/`problem_context` on `design-philosophy::define` with no producer anywhere in work-package. |
| DECLARED-BUT-DEAD | **12 output ids across 10 techniques** | **Dominant failure mode.** Systematic in side-effect techniques (artifact writers, log maintainers, analysis passes): `worker_result`, `trace_token`, `stakeholder_overview`, `root_cause`, `per_lens_artifacts`, `portfolio_synthesis`, `index_log`, `written_artifact`, `created_readme`, `pattern_results`, `pass_artifact`, `match_ambiguous`. The declared output is contract fiction; the real product is a file on disk. |
| GHOST INPUT | 1 | `workflow_catalog` on match-target-workflow (used semantically, never by id). Input-side prose discipline is otherwise good. |

## String-binding name-match convention

For plain-string bindings the implicit convention is: feed the op's declared input ids from same-named session variables / prior outputs. It **holds in most samples** (`workflow_catalog`, `is_monorepo`, `requirements`/`problem_statement`, the review-assumptions chain) and **breaks two ways**: (a) orphan inputs with no same-named producer anywhere (`issue_details`, `problem_context` — the agent must improvise from activity-01's differently-named issue-lookup outputs); (b) outputs renamed at the activity layer without a remap (`match_ambiguous` → `workflow_match_ambiguous`), where the convention gives no signal at all.

## What check:binding catches vs misses

**Catches:** binding-resolution (all `step.technique` refs incl. cross-workflow/shorthand/meta-fallback); arg-conformance (every inputs/outputs **key** in the composed signature); read-resolution (every `{token}`/condition variable resolves to *some* declared id anywhere in the corpus, `{$local}`, workflow var, set-target, or ambient) — against a drift baseline.

**Misses (everything above passes the guard):**
1. Input-map **values** never validated — bare name vs `{braced}` vs literal vs JSON vs mini-DSL (`entity_context: "entity_title={workflow_id}; …"` in workflow-design/01) are indistinguishable; nothing verifies a bare name resolves.
2. DECLARED is one **corpus-wide bag** — a token declared in any workflow satisfies reads everywhere (masks `client_planning_slug`, `comprehension_dir`, all cross-group prose coupling).
3. **Declared inputs count as producers** — an input nothing ever produces can never flag.
4. **No dataflow ordering** — `has_saved_state` read before any producer; a set-target anywhere in the file satisfies the read.
5. **Dead outputs / ghost inputs out of scope** — no reverse check.
6. **Rename drift through workflow variables invisible** — both names resolve individually.
7. The **PLACEHOLDER whitelist** silently excuses real tokens (naming-conventions' `{type}`).

## Three worst concrete examples

1. **meta/00-discover-session** — unmapped output rename + circular condition variable: checkpoint gated on `workflow_match_ambiguous` while the technique declares `match_ambiguous` (string binding → no remap possible); `has_saved_state` must be invented by the agent as `matched_session != null`.
2. **`workflow-engine/create-session.md`** — protocol step 1 names the caller's bound variable `{client_planning_slug}` instead of its own input `{planning_slug}`, making the activity's input remap pointless and the op unreusable by any caller binding a different source. Passes the guard only because `client_planning_slug` happens to be a meta workflow variable.
3. **`work-package/02 define-problem`** — `design-philosophy::define` declares required inputs `issue_details`/`problem_context` that appear nowhere else in the workflow; the executing agent must silently bridge from activity-01's differently-named issue-lookup outputs. Unflaggable because declared inputs are treated as producible names.

**Bottom line:** the object-form **key** seam is tight (guard-enforced; zero key violations in sample). The guard validates *name existence*, not *dataflow*. The dominant real-world gap is declared-but-dead outputs on side-effect techniques (~10/22 sampled); the riskiest for execution fidelity are the two unmapped renames and the orphan-input steps, where the agent must guess the wiring.
