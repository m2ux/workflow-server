# Knowledge Base Research - Simplify workflow-server README prose

**Date:** 2026-06-29
**Work Package:** Simplify workflow-server README prose
**Status:** Complete

---

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|------------|-----------------|
| Knowledge-base search | concept-rag (repo knowledge base) over the README, `docs/`, and prior comprehension/portfolio artifacts | Established the repo's own constraints (structure/coverage freeze, load-bearing terms, link/anchor contract) and the convergent pedagogy + rejected-paths guidance |
| Web research | Plain-language / readability conventions from established style guidance (plainlanguage.gov, the "curse of knowledge" literature, classic prose-economy rules) | Surfaced a consistent, citable rule set to apply uniformly across the prose rewrite |
| Synthesis | `synthesize` — mapped each convention to a specific README density hotspot | Connected conventions to the four hotspots and to the structure-preserving constraint |

---

## Relevant Concepts Discovered

### Sentence-level density is ideas-per-sentence, not word length
**Source:** Web (plain-language readability guidance) + portfolio synthesis finding U2
**Relevance:** The README's density cliff is in How-It-Works steps 2–3, where one sentence carries three or more facts (tool name + bundle field path + id). A "shorter words" rewrite would leave the cliff intact.
**Key Insight:** Target 15–20 words per sentence and one idea per sentence; let the existing numbered list carry the sequence rather than packing the sequence into a single sentence.

### The "curse of knowledge" — gloss jargon on first use
**Source:** Web (curse-of-knowledge / expert-blind-spot literature) + portfolio finding U1
**Relevance:** The README front-loads loaded terms ("structured", "fidelity-enforced", "techniques", dotted `techniques.workflow` paths) before a newcomer has the vocabulary.
**Key Insight:** Introduce each term in plain words *before* naming it (term-before-gloss). This is term-ordering *inside* prose — not a restructure — so it is compatible with the frozen section order.

### Lead with the main point; keep subject and verb close; prefer active voice
**Source:** Web (plain-language conventions; classic prose-economy rules)
**Relevance:** Several README sentences bury the action behind qualifying clauses (e.g. the em-dash clause in step 3 spelling out `techniques.activity` + `techniques[]`).
**Key Insight:** Lead each sentence with what the tool/step does; use everyday words; omit needless words; keep the actor and the verb adjacent.

### Simplify without losing accuracy — wording transform, not a re-derivation
**Source:** Repo KB — comprehension artifact (`readme-prose.md`, Design Rationale) + portfolio convergent finding CF1
**Relevance:** The densest fragment (dotted field paths) is both the prime simplification target and the prime hazard; the instinctive "fix" is to relocate facts to the API reference and delete field names.
**Key Insight:** Keep every field-level fact, tool name, link, anchor, and code/command block. Soften the *prose around* the jargon; lean on the already-linked `docs/api-reference.md` for exact field paths without deleting them from the README.

### Progressive disclosure within the frozen structure
**Source:** Repo KB — portfolio synthesis (CF3) + comprehension Design Rationale
**Relevance:** The work package freezes sections, headings, and order, and forbids dropping or adding facts.
**Key Insight:** The only sanctioned lever is sentence-level density plus term ordering applied *within* each existing section. Progressive disclosure here means a plain gloss before the jargon term, not reorganising content across sections.

---

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| One idea per sentence (15–20 words) | Web (plain-language guidance) | Split the multi-fact How-It-Works step 2 and step 3 sentences into one-fact sentences; lean on the numbered list | HIGH |
| Term-before-gloss (counter the curse of knowledge) | Web + portfolio U1 | Introduce "fidelity-enforced", "techniques", "workflow" in plain words before naming them, in the tagline and Overview | HIGH |
| Lead with the main point; active voice; close subject–verb | Web (plain-language conventions) | Reword sentences to lead with the tool's action; collapse the em-dash bundle clause to "plus the techniques that activity uses" | HIGH |
| Wording transform that preserves all facts | Repo KB comprehension + portfolio CF1 | Reword in place; keep tool names, dotted field facts, links, anchors, code blocks verbatim | HIGH |
| Progressive disclosure within frozen structure | Repo KB portfolio CF3 | Apply term ordering inside each prose section; never split audiences or reorder sections | HIGH |

---

## Best Practices Found

### Target 15–20 words per sentence, one idea each
**Source:** Web (plainlanguage.gov-style readability guidance)
**Description:** Short, single-idea sentences in everyday words measurably lower reading effort; omit needless words and keep the subject and verb close together.
**Application:** Rewrite How-It-Works steps 2–3 as several short sentences, each stating one action; keep the four-step numbered structure.

### Define or gloss jargon on first use, consistently
**Source:** Web (curse-of-knowledge literature)
**Description:** Experts under-explain terms they have internalised; a first-use plain gloss closes the gap. Be consistent — use the same term once introduced.
**Application:** Gloss "fidelity-enforced", "technique", and the bundle concept on first appearance; keep "Technique" (canonical) and the existing "session token" wording rather than introducing `session_index`.

### Simplify the prose, preserve the facts
**Source:** Repo KB — comprehension Design Rationale + portfolio CF1
**Description:** Accessibility gains must not migrate completeness from visible (README) to hidden (linked reference).
**Application:** Keep all field paths, tool names, counts, links, anchors, and code/command blocks; soften only the surrounding wording.

---

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| "Simplify" silently becomes "drop or relocate facts" (push step 2–3 mechanics to the API reference, delete field names) | Portfolio CF1 / P1 | Keep tool names + a plain gloss in place; rely on the already-linked api-reference for exact paths without deleting them |
| Term-before-jargon failure ships looking successful (render + diff pass; only symptom is a still-disoriented newcomer) | Portfolio U1 | Explicitly verify each loaded term is introduced in plain words before it is named |
| "Shorter words" rewrite that leaves three ideas per sentence — feels improved, cliff remains | Portfolio U2 | Measure density as ideas-per-sentence; enforce one idea per sentence |
| Splitting newcomer vs. reference audiences — this *is* a restructure; breaks the `#-quick-start` anchor and external deep-links | Portfolio U3 | Do not split sections or reorder; verify anchors and relative links survive |
| Silently editing frozen facts (the "five concerns" count; "session token" → `session_index`) | Portfolio CF2 / U4 | Leave "five concerns" verbatim and flag the 5-vs-6 wrinkle to plan-prepare; keep existing "session token" wording |
| Out-of-scope creep: fixing api-reference tool-roster drift (missing `dispatch_child`) | Portfolio U5 / comprehension Q6 | Out of scope (touches `docs/`); record as a separate follow-up, do not edit in this single-file work package |

---

## Recommended Approach

Based on research findings:

1. **Primary Pattern:** Sentence-level density reduction + term-before-gloss, applied *within* each existing prose section.
   - Rationale: It is the only lever compatible with the structure/coverage freeze, and it directly addresses the density cliff both lenses identified as the core accessibility problem.

2. **Key Practices to Apply:**
   - One idea per sentence (15–20 words); lead with the main point; active voice; everyday words.
   - Introduce each loaded term in plain words before naming it (counter the curse of knowledge); keep canonical "Technique" and existing "session token" wording.
   - Preserve every fact: tool names, dotted field paths, counts, links, anchors, code/command blocks verbatim.

3. **Risks to Monitor:**
   - Fact relocation disguised as simplification (steps 2–3) — keep facts in place, soften surrounding prose.
   - Term-before-gloss failures that pass render/diff but still leave newcomers disoriented — verify gloss ordering explicitly.
   - Scope creep into frozen facts or out-of-scope files — flag to plan-prepare (five-vs-six; api-reference `dispatch_child`), do not edit silently.

---

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| Repo KB — `comprehension/readme-prose.md` | Repo-specific constraints: section freeze, density hotspots, load-bearing terms, link/anchor contract, glossary | Section Map; Prose-density hotspots; Design Rationale; Link/anchor integrity map; Glossary |
| Repo KB — `14-portfolio-synthesis.md` (+ pedagogy / rejected-paths lenses) | Convergent, high-confidence guidance and the rejected "fixes" that trade a visible problem for a hidden one | CF1–CF3 convergent; U1–U5 unique; Bottom line |
| Repo KB — `02-design-philosophy.md` / `02-assumptions-log.md` | Problem framing (inventive-improvement, structure-preserving) and confirmed design assumptions DP-1..DP-3 | Problem classification; Assumptions |
| Web — plain-language / readability conventions (plainlanguage.gov-style) | Citable rule set: 15–20 words/sentence, one idea per sentence, active voice, lead with the point, omit needless words | Sentence length; active voice; word choice |
| Web — "curse of knowledge" / expert-blind-spot literature | Why experts under-explain and the term-before-gloss remedy applied on first use | Jargon glossing; consistency |

---

## Provenance

- **context_scope:** `mixed` — both repository knowledge base (comprehension + portfolio + design-philosophy artifacts) and external web sources (plain-language and curse-of-knowledge conventions) informed the recommended approach.
- **Web sources used (for the provenance log):** plain-language / readability convention guidance (plainlanguage.gov-style: sentence length 15–20 words, one idea per sentence, active voice, omit needless words, lead with the main point); the "curse of knowledge" / expert-blind-spot principle motivating term-before-gloss and first-use jargon glossing.

---

**Status:** Ready for plan-prepare activity
