# Issue #148: Comprehension migration: move work-package comprehension onto the codebase-wiki techniques, keeping task notes in planning

Captured verbatim on 2026-08-02 when the issue was consolidated into the shared-capability-homes epic.

---

## Summary

The `work-package` workflow has a **Codebase Comprehension** stage: before planning a change, the agent studies the relevant areas of the codebase and writes what it learned into a bespoke artifact, one markdown file per area under `.engineering/artifacts/comprehension/`. Separately, #146 delivered **`codebase-wiki`** — a set of reusable techniques (`codebase-wiki/<op>`) for maintaining a citation-backed, confidence-tagged knowledge base about a codebase.

This issue migrates the comprehension stage off its bespoke artifact and onto the wiki techniques. The migration must **split** what comprehension currently writes into two destinations:

- **Pure, durable codebase knowledge** — facts that are true about the codebase regardless of who asked — goes to the wiki, citation-backed and confidence-tagged.
- **Task and process metadata** — open questions, which work package contributed what, the running history of how the knowledge was obtained, and the analytical lenses applied to obtain it — **stays localised to the work package's planning folder**, excluded from the wiki.

The wiki is a knowledge base, not a lab notebook: it should read as *what is true about the codebase*, not *how this work package came to understand it*.

## Hard requirement — no functional regression

The comprehension stage today delivers concrete functional value, declared in the activity's outcomes and spelled out in its methodology resource (see References). The migration MUST preserve all of it. In particular:

1. **A durable, cumulative, reusable knowledge base.** Comprehension already aims to be "cumulative knowledge, not disposable planning documents" that "future work can build on without re-investigating the same area." The wiki must be at least as reusable and cumulative.
2. **Depth of analysis.** Architecture, key abstractions, design rationale, **and especially the Data Flow & Operational Context analysis** — the data-flow map, the invariant-alignment table, execution context, and operational scenarios — must all be preserved. That section is load-bearing for the "guard becomes a halt vector" failure mode described in the methodology resource; losing it is a functional regression.
3. **The question-driven comprehension loop keeps working.** The stage runs a `deep-dive-iteration` while-loop steered by the `needs_comprehension` and `has_open_questions` variables and a `comprehension-sufficient` checkpoint. All of that must continue to work. Open questions still drive area selection (the `question-driven-exploration` pattern) — they just live in planning now, not the wiki.
4. **Lens passes still run.** The `prism/portfolio-analysis` passes (`pedagogy`, `rejected-paths`) still execute; their *output* is localised per the split below.
5. **Downstream consumers are unaffected.** The `design-philosophy`, `implementation-analysis`, `plan-prepare`, and `assumptions-review` activities must receive equivalent inputs: the durable reference (now the wiki) plus the task metadata (now planning).

## The split — knowledge versus task/process metadata

| Current comprehension content | Nature | Destination |
|---|---|---|
| Architecture Overview (project structure, module map, design patterns) | Pure knowledge | **Wiki** (`concept`/`entity` pages) |
| Key Abstractions (core types, traits, data model, error handling) | Pure knowledge | **Wiki** (`entity` pages) |
| Design Rationale — observation, hypothesized rationale, trade-offs | Pure knowledge | **Wiki** (`concept`/`comparison` pages) |
| Design Rationale — **"Implications for changes"** | Task-relative lens | **Planning** |
| Data Flow & Operational Context (flow map, invariant alignment, execution context, operational scenarios) | Pure knowledge (durable behavioural facts) | **Wiki** |
| Domain Concept Mapping (glossary, domain model) | Pure knowledge | **Wiki** |
| Deep-dive findings (traced flows, implementation detail, edge cases) | Pure knowledge (facts) | **Wiki** (distilled into pages) |
| **"Open Questions"** table + "Remaining follow-up (out of scope)" | Trigger-task open questions | **Planning** |
| Metadata header **"Work packages: [contributing WP list]"** | Work-package-specific provenance | **Planning** |
| Dated per-work-package deep-dive section wrappers, "Last updated", "augmented across successive work packages" narrative | Running history of *how it got there* | **Planning** (generic operation history already goes in the wiki `log.md`; the work-package narrative stays in planning) |
| Applied prism-lens output (`pedagogy`, `rejected-paths`) | Lenses applied to obtain understanding | **Planning** — but a durable fact surfaced by a lens (a genuinely rejected design alternative, say) may be *distilled* into a wiki page; the pedagogical/process framing stays in planning |

**Guiding principle:** if a reader coming fresh to the codebase — with no knowledge of this work package — would want the content, it belongs in the wiki. If it only makes sense in the context of *this task's investigation*, it belongs in planning.

## Wiki-side notes

- Every claim promoted to the wiki must carry a `raw/` citation and a confidence score, per the `codebase-wiki` page format. This is stricter than today's comprehension artifact — an improvement, not a regression — but the migration must actually populate citations rather than dropping content that lacks them.
- The augment-from-task flow is folded into `codebase-wiki/ingest`, with task knowledge as an additional input source. The comprehension stage should bind `ingest` (source plus task knowledge), then `maintain-index-log`, `cross-link`, and `lint` — reusing the wiki operations rather than re-implementing artifact writes.

## Acceptance criteria

- [ ] The comprehension stage binds `codebase-wiki/<op>` techniques; it no longer writes the monolithic per-area file under `.engineering/artifacts/comprehension/`.
- [ ] The wiki receives only pure knowledge (architecture, abstractions, rationale minus its "implications for changes", data-flow/operational-context, domain concepts, distilled deep-dive facts), each claim citing `raw/` with a confidence score.
- [ ] Open questions, work-package provenance, the task-relative "implications for changes", the per-work-package investigation history, and raw applied-lens output are written to a **planning** artifact — not the wiki.
- [ ] The `deep-dive-iteration` loop and the `comprehension-sufficient` checkpoint still function, driven by the planning-resident open questions.
- [ ] The Data Flow & Operational Context analysis (invariant alignment, execution context, operational scenarios) is preserved as wiki knowledge — the halt-vector-prevention capability is intact.
- [ ] Every declared outcome of the current `codebase-comprehension` activity still holds after migration.
- [ ] Downstream activities receive equivalent inputs (wiki reference plus planning task metadata).

## Open design questions

1. **Planning home for task metadata.** Where does the planning-resident comprehension meta live — for example, `.engineering/artifacts/planning/<wp>/comprehension-notes.md` holding open questions, implications, the investigation log, and lens output?
2. **Lens output routing.** Do the `pedagogy`/`rejected-paths` passes stay in the comprehension stage feeding planning, and what (if anything) is distilled into wiki `comparison`/`concept` pages?
3. **Task-knowledge citations.** How does ingest-from-task attach `raw/` citations and confidence scores to task-derived claims?
4. **Back-compat.** What happens to existing `.engineering/artifacts/comprehension/*.md` artifacts — migrate, deprecate in place, or leave for manual port?
5. **Activity shape.** Does comprehension stay optional (`required: false`) with unchanged transitions, or does binding the wiki operations change the activity graph?

## References

- The `codebase-wiki` workflow and its reusable techniques: #146
- Current comprehension activity (including its declared outcomes): `work-package/activities/14-codebase-comprehension.yaml`
- Comprehension techniques: `work-package/techniques/codebase-comprehension/` (`survey`, `deep-dive`, `revise-questions`)
- Output format and methodology (including the halt-vector failure mode): `work-package/resources/codebase-comprehension.md`

*Filed on behalf of @m2ux by the workflow-design agent, following the codebase-wiki workflow delivery (#146) and its compliance review.*

