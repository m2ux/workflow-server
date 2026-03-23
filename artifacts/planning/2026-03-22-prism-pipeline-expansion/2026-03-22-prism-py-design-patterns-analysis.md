# Design Pattern Analysis: `prism.py` (agi-in-md)

> Analysis of `prism.py` execution patterns vs the prism workflow's current architecture. Identifies design patterns used upstream and novel opportunities for the workflow.

---

## 1. Upstream Architecture Overview

`prism.py` is a 14,879-line monolithic REPL that orchestrates prism execution via the Anthropic CLI (`claude`). It implements 14 distinct scan modes, each composing prisms through different pipeline topologies. The core abstraction is `PrismREPL._run_*` methods that compose prisms into multi-call pipelines with artifact chaining and persistent state.

**Key architectural distinction:** prism.py treats prisms as composable *operations* within adaptive pipelines. The workflow treats them as *resources* dispatched through fixed pipeline modes. This difference is the source of most novel opportunities.

---

## 2. Design Patterns in `prism.py`

### Pattern 1: Conditional Pipeline Steps

```python
STATIC_CODE_PIPELINE = [
    {"prism": "l12", "role": "L12 STRUCTURAL", "chain": False},
    {"prism": "deep_scan", "role": "DEEP SCAN", "chain": False},
    ...
    {"prism": "security_v1", "role": "SECURITY", "chain": False,
     "condition": "has_security_keywords"},  # ← conditional
    {"prism": "l12_complement_adversarial", "role": "ADVERSARIAL", "chain": True},
    {"prism": "l12_synthesis", "role": "SYNTHESIS", "chain": True},
]
```

The 10-step static champion pipeline skips steps when conditions aren't met (e.g., `security_v1` only runs when auth/token/password/inject keywords are detected in the source). Conditions include `has_security_keywords`, `has_l12`, and `large_file`. This saves cost without losing analytical coverage.

**Workflow gap:** The workflow's pipeline modes (single, full-prism, portfolio, behavioral) are unconditional. No mechanism to skip lenses based on target characteristics.

---

### Pattern 2: Dispute Mode — Lightweight Disagreement Committee

```
Prism A (l12) ──→ ┐
                   ├──→ Disagreement Synthesis
Prism B (identity) ─→ ┘
```

Selects 2 **maximally orthogonal** prisms (l12 + identity have 10/10 pairwise uniqueness for code; l12_universal + claim for general targets). Runs both independently. The synthesis step focuses *exclusively* on disagreements — not agreements. 3 calls for ~$0.15.

The `DISPUTE_SYNTHESIS_PROMPT` produces:
- **DISAGREEMENTS**: Where analyses diverge, why, and which is more likely correct
- **BLIND SPOTS**: Structural properties revealed by the divergence that both missed
- **CONVERGENCE**: Implicit shared assumptions and whether they're correct
- **DEEPEST FINDING**: The single insight visible only from comparing two analyses

**Workflow gap:** No dispute mode. The workflow's full-prism pipeline does self-correction via adversarial/synthesis, but at 3x the cost. Portfolio mode runs independent lenses but synthesizes convergence, not disagreements. Dispute fills the gap between single-lens and full-prism: meaningful self-correction at portfolio cost.

---

### Pattern 3: Subsystem Mode — Per-region Prism Assignment

```
Source Code
    ↓ AST split
[ClassA] [ClassB] [FuncC] [FuncD]
    ↓ Calibration call (Sonnet)
ClassA → deep_scan    ClassB → identity
FuncC  → error_resilience    FuncD → optimize
    ↓ Parallel execution (per-subsystem prism)
    ↓ Cross-subsystem synthesis
```

Phase 1: AST-parses code into structural subsystems (classes, functions) via `_split_into_subsystems()`. Supports Python AST, regex fallback for other languages, and ~100-line chunking as last resort. Min 10 lines per subsystem, max 8 (smallest pairs merged).

Phase 2: A calibration call assigns **different** prisms to different subsystems, maximizing analytical diversity. The `CALIBRATE_SUBSYSTEM_PROMPT` receives the full prism catalog and subsystem summaries.

Phase 3: Each subsystem is analyzed with its assigned prism, with context headers noting other subsystems.

Phase 4: `SUBSYSTEM_SYNTHESIS_PROMPT` produces cross-subsystem findings, cross-subsystem bugs (invisible to single-subsystem analysis), file-level conservation law, and a coverage map showing what each prism found vs. what a different prism would have found.

**Workflow gap:** The workflow's plan-analysis detects codebase/module scopes and assigns pipeline modes per module, but doesn't decompose a single file into subsystems with different prisms. This pattern finds cross-boundary bugs that single-prism whole-file analysis misses.

---

### Pattern 4: Verified Pipeline — Gap Detection + Re-analysis

```
L12 → knowledge_boundary + knowledge_audit → Extract gaps → AgentsKB fill → Re-run L12 with corrections
```

The highest-accuracy mode. 4 Sonnet calls:
1. Initial L12 structural analysis
2. Gap detection: `knowledge_boundary` and `knowledge_audit` prisms applied to the L12 output (meta-analysis)
3. Extract structured gaps as JSON, batch-fill via AgentsKB
4. Re-run L12 with gap context injected as `<verified_knowledge>` tags

The re-analysis produces corrected output because the model knows which claims from the initial analysis were knowledge-dependent and which have been verified.

**Workflow gap:** No iterative refinement pipeline. The workflow's oracle (44) includes self-auditing, but it's single-pass. Verified mode's explicit gap-detect-fill-reanalyze cycle is structurally different — it uses the model's second attempt to correct the first, grounded in verified facts.

---

### Pattern 5: Smart Mode — Adaptive Chain Engine

```
prereq → AgentsKB fill → {subsystem OR L12} → dispute → profile update
```

The system decides each pipeline step based on input characteristics:
1. **Prereq scan** — identifies knowledge gaps with tier classification (T1: verifiable, T2: composite, T3: frontier/confabulation risk)
2. **AgentsKB batch fill** — queries a knowledge base for verified answers, prioritizing T1 questions
3. **Analysis** — chooses subsystem mode (if multi-class code) or L12 (if single-unit), injecting verified facts
4. **Dispute** — self-correction; adaptive: if a conservation law was found, dispute is supplementary; if not, dispute is critical
5. **Profile update** — extracts patterns, conservation laws, and known facts into persistent `.deep/profile.json`

After 5+ scans, convergence detection warns that additional analysis adds breadth, not depth.

**Workflow gap:** The workflow's plan-analysis selects lens and mode, but doesn't compose *modes* (subsystem + dispute + prereq) into adaptive chains. Smart mode's key insight: the pipeline structure itself should be data-dependent, not pre-selected.

---

### Pattern 6: Reflect Mode — Constraint History Synthesis

```
L12 → claim (meta-analysis of L12 output) → constraint history + learning memory → synthesis
```

Produces:
- **RECURRING PATTERNS**: Structural properties appearing across multiple prior analyses
- **UNEXPLORED DIMENSIONS**: Analytical angles not yet covered, with specific prism recommendations
- **KNOWN FALSE POSITIVES**: Patterns prior scans flagged but user rejected
- **NEXT BEST SCAN**: The single most valuable next analytical step

The key innovation is **cross-session learning**: reflect reads `.deep/constraint_history.md` and `.deep/learning.json` to understand what prior analyses found and what the user rejected. This prevents re-flagging intentional design choices and guides toward unexplored dimensions.

**Workflow gap:** The workflow has no persistent state between executions. Each analysis starts from zero. No mechanism to accumulate findings across scans or avoid known false positives.

---

### Pattern 7: Knowledge Injection Layer

Before every scan, `prism.py` injects three context layers:

1. **Verified facts** from `.deep/knowledge/{file}.json` — deterministic facts tagged as `KB-FACT`
2. **Prior analysis history** from `.deep/constraint_history.md` — last 3 analyses of the same file
3. **Learning memory** from `.deep/learning.json` — false positives and rejected fixes with 30-day decay

These are injected as XML-tagged context before the source code:
```
<verified_knowledge source="KB-FACT">
Deterministic facts from knowledge base (ground truth, not analysis):
- [fact 1]
- [fact 2]
</verified_knowledge>

<prior_analysis>
This file was previously analyzed 3 times. Key findings:
...
Consider exploring dimensions NOT covered by prior analyses.
</prior_analysis>

<learning_context>
Known false positives for this file:
- [false_positive] issue X — intentional design choice
</learning_context>

[actual source code]
```

**Workflow gap:** The workflow has no knowledge injection mechanism. Each analysis receives only the source code. Prior findings, verified facts, and user feedback are not carried forward.

---

### Pattern 8: Dynamic Prism Cooking via COOK_UNIVERSAL

```python
COOK_UNIVERSAL = (
    "You will receive content and an intent. Another AI will receive "
    "this content with YOUR output as its system prompt.\n\n"
    "Four operations that produce a 9.8/10 prompt:\n"
    "1. IMPOSSIBILITY SEED: force naming 3 desirable properties that "
    "CANNOT all coexist simultaneously...\n"
    "2. RECURSIVE DEPTH: After finding the law, force engineering an "
    "improvement that recreates the original problem deeper...\n"
    "3. META-LAW: Apply the entire diagnostic TO the conservation law...\n"
    "4. HARVEST: Collect every concrete defect, gap, or contradiction..."
)
```

Generates custom prisms on-the-fly based on an intent string. The generated prism is a complete system prompt (~250+ words) that encodes the analytical operations. This is used in:
- Chat mode (cook per message)
- Evolve mode (3-generation recursive cooking)
- Deep mode (cook 4-prism WHERE/WHEN/WHY + synthesis system)

**Workflow gap:** The workflow uses only pre-authored prism resources. Dynamic cooking could enable on-the-fly lens generation for domains not covered by the 58-resource catalog.

---

### Pattern 9: Evolve Mode — Autopoietic Prism Generation

```
Content → COOK_UNIVERSAL → Prism v1
Prism v1 → COOK_UNIVERSAL → Prism v2
Prism v2 → COOK_UNIVERSAL → Prism v3 (saved as {file}_evolved.md)
```

Three generations of meta-cooking. Each generation's output (a prism prompt) becomes the input to the next cooking cycle. The result converges to a domain-specific prism that's saved to `.deep/prisms/` with YAML frontmatter for reuse. The evolved prism is then executed against the original content.

**Workflow gap:** No generative prism capability. All lenses are static resources. Evolve mode would enable the workflow to create domain-adapted lenses for codebases with unusual architectures or non-standard patterns.

---

### Pattern 10: Adaptive Depth Escalation

```
Stage 1: SDL deep_scan (~$0.02, Haiku) → check signal quality
Stage 2: L12 (~$0.06, Sonnet) → check signal quality
Stage 3: Full pipeline (~$0.50) → maximum depth
```

Starts with the cheapest/fastest analysis and escalates only if signal quality (conservation law presence + output depth) is insufficient. Stops at the first stage producing adequate analytical depth. Also checks session history: if prior scans of similar files (same extension) found a specific prism most useful, it skips the cheap stages and goes directly to the recommended prism.

**Workflow gap:** The workflow's budget parameter (quick/standard/thorough) drives fixed depth assignments. No adaptive escalation based on signal quality or session history.

---

### Pattern 11: Codebase Profile

Persistent `.deep/profile.json` accumulates:
- Conservation laws (extracted with strict validation: must contain × and =)
- Structural patterns
- Known facts
- Scan count and files analyzed
- Last updated timestamp

Conservation law extraction uses regex with reject-list filtering to prevent labels, questions, and partial sentences from being recorded as laws.

**Workflow gap:** The workflow produces analysis artifacts per execution but doesn't accumulate structural knowledge across executions. A codebase profile would enable the reflect pattern and convergence detection.

---

### Pattern 12: Per-Prism Model Optimization

```python
OPTIMAL_PRISM_MODEL = _build_prism_model_map()  # from YAML frontmatter
```

Each prism declares its optimal model in YAML frontmatter. The pipeline overrides the user's model selection per-step, using the declared optimal model. User overrides via `~/.prism/prism_models.json`.

**Workflow alignment:** The workflow's model-sensitivity rule documents per-prism model preferences but doesn't enforce them at the orchestration level. The orchestrator could automatically select models per-lens.

---

## 3. Novel Opportunities for the Workflow

### High-Impact (new pipeline modes)

| Opportunity | Upstream Pattern | Workflow Integration Point | Estimated Complexity |
|---|---|---|---|
| **Dispute mode** | 2 orthogonal prisms → disagreement synthesis | New pipeline mode in orchestrate-prism | Medium — 1 new skill, 1 new synthesis prompt |
| **Subsystem mode** | AST split → per-subsystem prism assignment → synthesis | New skill + activity for multi-unit single-file analysis | High — requires AST decomposition, calibration call |
| **Verified pipeline** | L12 → gap detect → fill → re-analyze | New pipeline mode chaining existing knowledge prisms (40-42) | Medium — composition of existing resources |
| **Smart/adaptive mode** | Automatic pipeline composition based on input | Extended plan-analysis that outputs a composite pipeline | High — requires pipeline composition logic |

### Medium-Impact (state management)

| Opportunity | Upstream Pattern | Workflow Integration Point | Estimated Complexity |
|---|---|---|---|
| **Knowledge injection** | Verified facts + prior analysis + learning memory → context envelope | New skill for context enrichment before analysis | Medium — requires persistent storage layer |
| **Codebase profile** | Cross-scan conservation law accumulation + convergence detection | New post-analysis skill for profile update | Medium — requires `.deep/` or equivalent storage |
| **Conditional steps** | Skip prisms when criteria aren't met | Extension to orchestrate-prism's dispatch logic | Low — predicate evaluation on target content |

### Exploratory (generative)

| Opportunity | Upstream Pattern | Workflow Integration Point | Estimated Complexity |
|---|---|---|---|
| **Dynamic cooking** | COOK_UNIVERSAL generates prisms from intent | New skill that generates custom lens prompts | Medium — prompt engineering for cook meta-prompt |
| **Evolve mode** | 3-generation recursive cooking → domain-adapted prism | New pipeline mode that produces reusable lenses | Medium — iterative cooking with validation |
| **Adaptive depth** | Escalate from cheap to deep based on signal quality | Extension to plan-analysis's budget-drives-depth rule | High — requires signal quality metrics |

---

## 4. Key Design Principles Extracted

1. **Composition over selection.** `prism.py` composes modes (prereq + subsystem + dispute + profile) rather than selecting one mode. The workflow selects one mode per analysis.

2. **State accumulates.** Conservation laws, known false positives, and verified facts persist across sessions. Analysis quality improves with repeated use on the same codebase.

3. **Disagreement > agreement.** The dispute pattern explicitly synthesizes only divergence points. This is more informative than convergence-focused synthesis (which the workflow's portfolio mode does).

4. **Adaptive pipelines.** Smart mode decides the pipeline structure at runtime based on input characteristics. The pipeline topology is data-dependent, not pre-selected by the user.

5. **Meta-analysis as first-class operation.** Running claim (07) on L12 output treats prior analysis as a target. This recursive application of prisms to prism outputs is a powerful pattern not used in the workflow.

6. **Knowledge grounding reduces confabulation.** The verified pipeline's explicit gap-detect-fill-reanalyze cycle addresses confabulation structurally. Injecting verified facts as tagged context gives the model ground truth to anchor against.

---

## 5. Recommended Priority

1. **Dispute mode** — highest value-to-cost ratio. Reuses existing prisms, adds genuine self-correction at 1/3 the cost of full-prism.
2. **Conditional pipeline steps** — lowest implementation cost. Add predicate support to orchestrate-prism dispatch.
3. **Meta-analysis composition** — run claim on L12 output as a new composite pattern. Uses existing resources, no new infrastructure.
4. **Knowledge injection layer** — enables the entire family of stateful patterns (reflect, verified, convergence detection).
5. **Subsystem mode** — highest analytical value for multi-class files. Requires the most new infrastructure.
