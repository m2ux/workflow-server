# Lensing Skills

> Part of the [Structural Analysis Lensing Workflow](../README.md)

## Skills (6 workflow-specific)

The lensing workflow provides 6 skills organized by role. Skills `orchestrate-lensing` and `full-prism` form the isolation pipeline. The remaining skills are usable standalone by any workflow.

| # | Skill ID | Capability | Role |
|---|----------|------------|------|
| 00 | `structural-analysis` | Single-pass L12 structural analysis on code | Standalone / Worker |
| 01 | `full-prism` | Execute one pass of the Full Prism pipeline in isolation | Worker |
| 02 | `portfolio-analysis` | Run 2+ complementary portfolio lenses | Standalone |
| 03 | `general-analysis` | Apply lenses to non-code input (requirements, designs, plans) | Standalone |
| 04 | `select-lens` | Recommend optimal lens(es) for an analytical goal | Advisory |
| 05 | `orchestrate-lensing` | Dispatch isolated workers for the Full Prism pipeline | Orchestrator |

> The universal skills `orchestrate-workflow` and `execute-activity` from [meta/skills/](../../meta/skills/) are **not used** by this workflow. Lensing uses its own orchestration skill (`orchestrate-lensing`) because it requires disposable (non-resumed) workers for context isolation.

---

### Skill Protocol: `structural-analysis` (00)

Single-pass L12 structural analysis. Loads the L12 lens prompt and applies it to code, producing a conservation law, meta-law, and severity-classified bug table. This is the foundational lensing operation — other workflows can reference it directly.

```mermaid
graph TD
    startNode(["Start"]) --> loadLens["Load L12 lens resource (00)"]
    loadLens --> readTarget{"Input is file path?"}
    readTarget -->|"yes"| readFile["Read file content"]
    readTarget -->|"no"| useDirect["Use inline content"]
    readFile --> executeLens["Execute lens operations sequentially"]
    useDirect --> executeLens
    executeLens --> claim["Make falsifiable claim"]
    claim --> dialectic["Three-voice dialectic"]
    dialectic --> concealment["Name concealment mechanism"]
    concealment --> improve1["Engineer improvement that deepens concealment"]
    improve1 --> diagnose1["Apply diagnostic to improvement"]
    diagnose1 --> improve2["Engineer second improvement"]
    improve2 --> invariant["Name structural invariant"]
    invariant --> invert["Invert invariant → new impossibility"]
    invert --> conservationLaw["Name conservation law"]
    conservationLaw --> metaLaw["Apply diagnostic to law → name meta-law"]
    metaLaw --> bugTable["Collect all bugs with fixable/structural classification"]
    bugTable --> formatOutput["Format: sections + bug table"]
    formatOutput --> endNode(["End"])
```

**Protocol steps:**

| Step Key | Action |
|----------|--------|
| `load-lens` | Load resource `00` from lensing workflow via `get_resource` |
| `read-target` | Read file or accept inline code; note optional analysis focus |
| `execute-lens` | Execute every L12 operation: claim → dialectic → concealment → improvements → invariant → inversion → conservation law → meta-law → bug table |
| `format-output` | Structure output with section headers; classify bugs as fixable/structural |

**Output:** Conservation law, meta-law, concealment mechanism, structural invariant, bug table with locations and severity.

---

### Skill Protocol: `full-prism` (01)

Worker-side skill for one pass of the 3-pass pipeline. Runs in a fresh isolated context dispatched by `orchestrate-lensing`. Receives target content, prior pass outputs (if any), and a resource index. Self-bootstraps by loading the lens via `get_resource`.

```mermaid
graph TD
    startNode(["Start (fresh context)"]) --> loadLens["Load lens resource by index"]
    loadLens --> checkPrior{"Prior analysis provided?"}
    checkPrior -->|"no (structural pass)"| applyDirect["Apply lens to target content"]
    checkPrior -->|"yes (adversarial/synthesis)"| applyWithContext["Apply lens to content + prior outputs"]
    applyDirect --> executeAll["Execute every lens operation completely"]
    applyWithContext --> executeAll
    executeAll --> formatPass["Format output per pass type"]
    formatPass --> returnText["Return full analysis text to orchestrator"]
    returnText --> endNode(["End"])
```

**Protocol steps:**

| Step Key | Action |
|----------|--------|
| `load-lens` | Load lens resource by index (00-05) via `get_resource("lensing", index)` |
| `apply-lens` | Apply lens operations to content; use prior outputs as context if provided |
| `format-output` | Structure per pass: structural → sections + bug table; adversarial → wrong predictions + overclaims + underclaims; synthesis → refined law + definitive classification |

**Key rule:** No context leakage — do not reference anything beyond what was provided in the prompt.

---

### Skill Protocol: `portfolio-analysis` (02)

Run 2+ portfolio lenses independently against the same artifact. Each lens finds genuinely different structural properties (zero overlap confirmed across 3+ real codebases). Produces per-lens findings plus a convergence/divergence synthesis.

```mermaid
graph TD
    startNode(["Start"]) --> selectLenses{"Lenses specified?"}
    selectLenses -->|"yes"| useLenses["Use specified lenses"]
    selectLenses -->|"goal provided"| matchGoal["Match goal to lens selection guide"]
    selectLenses -->|"neither"| useDefault["Default: claim + degradation"]
    useLenses --> loadAll["Load each lens resource (06-11)"]
    matchGoal --> loadAll
    useDefault --> loadAll
    loadAll --> readTarget["Read target content"]
    readTarget --> applyLens1["Apply lens 1 independently"]
    readTarget --> applyLens2["Apply lens 2 independently"]
    readTarget --> applyLensN["Apply lens N independently"]
    applyLens1 --> crossSynth["Cross-lens synthesis"]
    applyLens2 --> crossSynth
    applyLensN --> crossSynth
    crossSynth --> convergent["Identify convergent findings (high confidence)"]
    convergent --> unique["Identify unique findings (portfolio value-add)"]
    unique --> summaryTable["Produce summary table with lens attribution"]
    summaryTable --> endNode(["End"])
```

**Protocol steps:**

| Step Key | Action |
|----------|--------|
| `select-lenses` | Use provided lenses, match goal to selection guide, or default to claim + degradation |
| `load-lenses` | Load each lens resource: pedagogy=06, claim=07, scarcity=08, rejected-paths=09, degradation=10, contract=11 |
| `read-target` | Read file or accept inline content |
| `execute-lenses` | Apply each lens independently — do not let one lens influence another |
| `cross-lens-synthesis` | Identify convergent (same property, multiple lenses) and unique (single lens) findings |

**Lens selection guide:**

| Analytical Goal | Recommended Lenses |
|-----------------|-------------------|
| Trade-off analysis | scarcity + rejected-paths |
| Hidden assumptions | claim + pedagogy |
| Maintainability risks | degradation + contract |
| Design rationale | pedagogy + rejected-paths |
| Interface quality | contract + claim |

---

### Skill Protocol: `general-analysis` (03)

Apply lenses to non-code input — requirements, designs, plans, strategies. Uses the general-domain lens set (resources 03-05) which has identical operations to code lenses but domain-neutral language.

```mermaid
graph TD
    startNode(["Start"]) --> determineMode{"analysis_mode?"}
    determineMode -->|"structural"| loadGenL12["Load general L12 (resource 03)"]
    determineMode -->|"full-prism"| loadGenPipeline["Load resources 03, 04, 05"]
    determineMode -->|"portfolio"| loadPortfolio["Load portfolio lenses (06-10)"]

    loadGenL12 --> readTarget["Read target content"]
    readTarget --> execStructural["Execute L12 operations on input"]
    execStructural --> endNode(["End"])

    loadGenPipeline --> readTarget2["Read target content"]
    readTarget2 --> pass1["Pass 1: Apply resource 03 → ANALYSIS 1"]
    pass1 --> pass2["Pass 2: Apply resource 04 to input + ANALYSIS 1"]
    pass2 --> pass3["Pass 3: Apply resource 05 to input + ANALYSIS 1 + ANALYSIS 2"]
    pass3 --> endNode

    loadPortfolio --> readTarget3["Read target content"]
    readTarget3 --> execEach["Apply each lens independently (06-10)"]
    execEach --> synthesize["Cross-lens synthesis"]
    synthesize --> endNode
```

**Protocol steps:**

| Step Key | Action |
|----------|--------|
| `determine-mode` | Route to structural (single L12), full-prism (3-pass), or portfolio based on `analysis_mode` |
| `read-target` | Read file or accept inline text |
| `execute-structural` | Load resource 03, execute all operations |
| `execute-full-prism` | Sequential: resource 03 → 04 (with ANALYSIS 1) → 05 (with both) |
| `execute-portfolio` | Load resources 06-10 (excluding 11-contract), apply independently, synthesize |

**Key rule:** The contract lens (resource 11) is code-specific — never use it for general analysis.

---

### Skill Protocol: `select-lens` (04)

Advisory skill that maps analytical goals to the optimal lens or combination. Returns a recommendation with skill ID, resource indices, and rationale. Does not execute analysis.

```mermaid
graph TD
    startNode(["Start"]) --> classifyGoal["Classify analytical goal"]
    classifyGoal --> checkType{"Input type?"}
    checkType -->|"code"| codeSet["Available: 00-02 + 06-11"]
    checkType -->|"text"| textSet["Available: 03-05 + 06-10"]
    codeSet --> matchDepth{"Depth preference?"}
    textSet --> matchDepth
    matchDepth -->|"single"| recSingle["Recommend single best lens + structural-analysis or general-analysis skill"]
    matchDepth -->|"pipeline"| recPipeline["Recommend full-prism skill + code or general pipeline"]
    matchDepth -->|"portfolio"| recPortfolio["Recommend 2-3 lenses + portfolio-analysis skill"]
    recSingle --> formatRec["Format: skill, resources, rationale, alternatives"]
    recPipeline --> formatRec
    recPortfolio --> formatRec
    formatRec --> endNode(["End"])
```

**Goal → Lens mapping matrix:**

| Goal | Lens(es) | Resource(s) |
|------|----------|-------------|
| Bug detection | L12 | 00 |
| Code review augmentation | L12 + contract | 00, 11 |
| Design review | claim + rejected-paths | 07, 09 |
| Codebase comprehension | pedagogy + rejected-paths | 06, 09 |
| Pre-commit validation | L12 pipeline | 00, 01, 02 |
| Planning review | L12 general | 03 |
| Maintainability assessment | degradation + contract | 10, 11 |
| Assumption validation | claim + scarcity | 07, 08 |

---

### Skill Protocol: `orchestrate-lensing` (05)

Coordination skill that dispatches each analytical pass to a fresh, isolated sub-agent. Captures full text output from each pass and forwards it verbatim to subsequent workers. Manages the pipeline lifecycle for single, full-prism, and portfolio modes.

```mermaid
graph TD
    startNode(["Start"]) --> loadWorkflow["Load lensing workflow definition"]
    loadWorkflow --> resolveTarget{"Target is file path?"}
    resolveTarget -->|"yes"| readFile["Read file → resolved_content"]
    resolveTarget -->|"no"| useInline["Use inline text → resolved_content"]
    readFile --> determineLens["Determine lens resource indices"]
    useInline --> determineLens
    determineLens --> checkMode{"pipeline_mode?"}

    checkMode -->|"single"| dispatchStructural["Dispatch FRESH worker: content + lens 00/03"]
    dispatchStructural --> captureStructural["Capture structural_output"]
    captureStructural --> presentSingle["Present structural_output as result"]
    presentSingle --> endNode(["End"])

    checkMode -->|"full-prism"| dispatchStructural2["Dispatch FRESH worker: content + lens 00/03"]
    dispatchStructural2 --> captureStructural2["Capture structural_output"]
    captureStructural2 --> dispatchAdversarial["Dispatch NEW FRESH worker: content + ANALYSIS 1 + lens 01/04"]
    dispatchAdversarial --> captureAdversarial["Capture adversarial_output"]
    captureAdversarial --> dispatchSynthesis["Dispatch NEW FRESH worker: content + ANALYSIS 1 + ANALYSIS 2 + lens 02/05"]
    dispatchSynthesis --> captureSynthesis["Capture synthesis_output"]
    captureSynthesis --> presentPrism["Present synthesis as primary + appendices"]
    presentPrism --> endNode

    checkMode -->|"portfolio"| dispatchParallel["Dispatch FRESH workers in parallel (1 per lens)"]
    dispatchParallel --> captureAll["Capture all outputs"]
    captureAll --> crossSynth["Cross-lens convergence/divergence summary"]
    crossSynth --> presentPortfolio["Present per-lens + synthesis"]
    presentPortfolio --> endNode
```

**Protocol steps:**

| Step Key | Action |
|----------|--------|
| `load-workflow` | Load lensing workflow definition, initialize state variables |
| `resolve-target` | Read file path or use inline content as `resolved_content` |
| `determine-lens-indices` | Map target_type + pipeline_mode to resource indices |
| `dispatch-structural-pass` | Create FRESH worker with content + resource index; capture output |
| `dispatch-adversarial-pass` | Create NEW FRESH worker with content + ANALYSIS 1 + resource index |
| `dispatch-synthesis-pass` | Create NEW FRESH worker with content + ANALYSIS 1 + ANALYSIS 2 + resource index |
| `dispatch-portfolio-passes` | Create parallel FRESH workers (up to 4 concurrent), one per lens |
| `present-result` | Present final output per mode (single/full-prism/portfolio) |

**Key rule:** NEVER use Task `resume` between passes. Each pass MUST be a fresh sub-agent.
