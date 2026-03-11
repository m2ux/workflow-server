# Structural Analysis Lensing Workflow

> v1.1.0 — Apply cognitive lenses to code or text through isolated sub-agent passes.

---

## Overview

This workflow applies structural analysis lenses to code or text in three modes. Each analytical pass runs in an **isolated sub-agent** to guarantee independence — particularly critical for the adversarial pass, which must challenge the structural analysis without being biased by having generated it.

When an AI agent reviews code without specific guidance, it produces surface-level observations — the kind of feedback you would find in a generic code review. It notices style inconsistencies, missing error handling, and obvious logic errors. What it does not do is discover the *structural properties* of the code: the trade-offs the design is forced to make, the problems that persist through every attempted improvement, or the assumptions that will fail silently under conditions the author never considered. Lenses change this. Each lens is a short sequence of imperative operations (50–330 words) that directs the model through a specific analytical process. Rather than asking "what's wrong with this code?", the L12 lens instructs the model to make a falsifiable claim, attack it from three perspectives, name what the gap conceals, engineer an improvement that deepens the concealment, and trace the chain through to a conservation law. The model executes these operations as a program, and the output shifts from description to construction-based reasoning.

The three-pass Full Prism pipeline adds a second dimension: adversarial self-correction. A single analytical pass, however deep, has blind spots — it cannot see what its own framing conceals. The pipeline addresses this by running the structural analysis in one isolated context, then handing only the textual output to a fresh agent tasked with breaking it. Because the adversarial agent never saw the analysis being generated, it treats it as an opponent's work and searches for genuine counter-evidence. The synthesis pass then reconciles both perspectives, producing findings that neither pass alone could discover. This is why the workflow enforces strict context isolation between passes: shared generation history turns the adversary into a collaborator, which defeats the purpose of the pipeline.

| # | Activity | Required | Description |
|---|----------|----------|-------------|
| 01 | [**Structural Pass**](activities/01-structural-pass.toon) | yes | L12 structural analysis — conservation law, meta-law, classified findings |
| 02 | [**Adversarial Pass**](activities/02-adversarial-pass.toon) | full-prism only | Attack the structural analysis — wrong predictions, overclaims, underclaims |
| 03 | [**Synthesis Pass**](activities/03-synthesis-pass.toon) | full-prism only | Reconcile both perspectives into corrected, definitive findings |
| 04 | [**Deliver Result**](activities/04-deliver-result.toon) | yes | Present final analysis to the user |

**Detailed documentation:**

- **Activities:** See [activities/](activities/) for per-activity TOON definitions with steps, rules, and transitions.
- **Skills:** See [skills/README.md](skills/README.md) for the full skill inventory (6 skills) and protocol flow diagrams.
- **Resources:** See [resources/](resources/) for the 12 lens resources.

**Pipeline modes:**

| Mode | Passes | When to use |
|------|--------|-------------|
| `single` | Structural only | Quick analysis, code review augmentation |
| `full-prism` | Structural → Adversarial → Synthesis | Maximum depth with self-correction |
| `portfolio` | Multiple independent lenses | Breadth — complementary structural perspectives |

---

## Workflow Flow

```mermaid
graph TD
    startNode(["Start"]) --> SP["01 structural-pass"]

    SP --> MODE{"pipeline_mode?"}
    MODE -->|"full-prism"| AP["02 adversarial-pass"]
    MODE -->|"single"| DR["04 deliver-result"]

    AP --> SYN["03 synthesis-pass"]
    SYN --> DR

    DR --> doneNode(["End"])
```

---

## Execution Model

This workflow uses an **orchestrator with disposable workers** — distinct from the work-package pattern which uses a persistent, resumed worker.

```mermaid
sequenceDiagram
    participant User
    participant Orch as Orchestrator
    participant W1 as Worker 1 (Structural)
    participant W2 as Worker 2 (Adversarial)
    participant W3 as Worker 3 (Synthesis)

    User->>Orch: "analyze src/auth.ts full-prism"

    Note over Orch: Load workflow, resolve target content

    Orch->>W1: Task(content + lens index 00)
    W1->>W1: get_resource("lensing", "00")
    W1->>W1: Execute L12 operations
    W1-->>Orch: structural_output (full text)

    Note over Orch: Capture output verbatim

    Orch->>W2: Task(content + structural_output as "ANALYSIS 1" + lens index 01)
    Note over W2: Fresh context — never saw W1's generation
    W2->>W2: get_resource("lensing", "01")
    W2->>W2: Attack ANALYSIS 1
    W2-->>Orch: adversarial_output (full text)

    Orch->>W3: Task(content + ANALYSIS 1 + ANALYSIS 2 + lens index 02)
    W3->>W3: get_resource("lensing", "02")
    W3->>W3: Synthesize corrected result
    W3-->>Orch: synthesis_output (full text)

    Orch->>User: Final synthesis + appendices
```

**Why disposable workers?** In the work-package workflow, the persistent worker accumulates codebase understanding across activities — that context is valuable. In the lensing workflow, shared context is *harmful*. The adversarial worker must treat the structural analysis as an opponent's work to defeat. If it shares generation history with the structural worker, it pulls punches. Fresh agents guarantee genuine independence.

**Orchestrator** (skill: `orchestrate-lensing`):
- Loads workflow, resolves target content
- Dispatches each pass to a **fresh** sub-agent (NEVER resumes)
- Captures full text output from each pass
- Forwards prior outputs verbatim to subsequent passes
- MUST NOT execute lens operations or generate analysis

**Workers** (skill: `full-prism`):
- Self-bootstrap by loading the lens resource via `get_resource`
- Execute every operation in the lens prompt completely
- Return the full analysis text
- Run in isolation — no shared context between passes

---

## Resources (12)

All lens resources are accessible cross-workflow via `get_resource("lensing", index)`.

### Code Pipeline (3-pass Full Prism)

| Index | Name | Purpose |
|-------|------|---------|
| `00` | L12 Structural | Primary structural analysis — conservation law, meta-law, bug table |
| `01` | L12 Adversarial | Attack the structural analysis — wrong predictions, overclaims, underclaims |
| `02` | L12 Synthesis | Reconcile into corrected conservation law, definitive classification |

### General Pipeline (3-pass for non-code input)

| Index | Name | Purpose |
|-------|------|---------|
| `03` | L12 General Structural | Same operations as code L12 with domain-neutral language |
| `04` | L12 General Adversarial | Same operations as code adversarial with domain-neutral language |
| `05` | L12 General Synthesis | Same operations as code synthesis with domain-neutral language |

### Portfolio Lenses (single-pass, independent)

| Index | Name | Operation | Best for |
|-------|------|-----------|----------|
| `06` | Pedagogy | Transfer corruption — what patterns transfer and where they break | Codebase comprehension, design review |
| `07` | Claim | Assumption inversion — assume each embedded claim is false | Design philosophy, plan review |
| `08` | Scarcity | Resource conservation — what the design assumes is infinite | Implementation analysis, trade-off analysis |
| `09` | Rejected Paths | Problem migration — what rejected paths would swap | Codebase comprehension, plan review |
| `10` | Degradation | Decay timeline — what degrades monotonically with neglect | Strategic review, maintainability |
| `11` | Contract | Interface vs implementation — signature promises vs reality | Code review (code-only) |

---

## Skills (6)

| # | Skill | Scope | Purpose |
|---|-------|-------|---------|
| 00 | `structural-analysis` | lensing | Single-pass L12 on code — usable directly by other workflows |
| 01 | `full-prism` | lensing | Worker-side: execute one pass within the isolation model |
| 02 | `portfolio-analysis` | lensing | Run 2+ complementary portfolio lenses |
| 03 | `general-analysis` | lensing | Apply lenses to non-code input (requirements, designs, plans) |
| 04 | `select-lens` | lensing | Recommend optimal lens(es) for an analytical goal |
| 05 | `orchestrate-lensing` | lensing | Dispatch isolated workers, manage the Full Prism pipeline |

### Cross-Workflow Usage

Other workflows reference lensing skills and resources directly:

```
# Load a lens resource from another workflow's skill protocol
get_resource({ workflow_id: "lensing", index: "00" })

# Load a lensing skill
get_skill({ skill_id: "structural-analysis", workflow_id: "lensing" })
```

For example, the work-package workflow's `review-code` or `analyze-implementation` skills can load the L12 lens to augment their analysis with structural depth.

---

## Variables (9)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `target_content` | string | *(required)* | Code or text to analyze — file path or inline |
| `target_type` | string | `code` | Input domain: `code` or `general` |
| `pipeline_mode` | string | `single` | Mode: `single`, `full-prism`, or `portfolio` |
| `selected_lenses` | array | — | Portfolio mode: lens names to apply |
| `analysis_focus` | string | — | Optional focus area |
| `structural_output` | string | — | Captured output from structural pass |
| `adversarial_output` | string | — | Captured output from adversarial pass |
| `synthesis_output` | string | — | Captured output from synthesis pass |
| `portfolio_outputs` | object | — | Map of lens name → output for portfolio mode |

---

## Workflow Rules

1. **ISOLATION MODEL:** Each analytical pass MUST be dispatched to a FRESH sub-agent. The adversarial pass must never share context with the structural pass.
2. **EXECUTION MODEL:** Orchestrator with disposable workers. Workers are NOT resumed.
3. **ORCHESTRATOR DISCIPLINE:** The orchestrator MUST NOT execute lens operations or generate analysis.
4. **AUTOMATIC TRANSITIONS:** Passes advance without user confirmation.
5. **OUTPUT FORWARDING:** Full text output forwarded verbatim between passes. No summarizing.
6. **LENS LOADING:** Workers self-bootstrap by calling `get_resource`. The orchestrator provides only the resource index.
7. **FULLY AUTOMATED:** No user checkpoints. The only interaction is the initial input.

---

## Examples

### Standalone: Single-pass structural analysis on a file

The simplest use case. An agent loads the L12 lens resource and applies it to a source file.

```
# Agent loads the lens
lens = get_resource({ workflow_id: "lensing", index: "00" })

# Agent reads the target file, then executes every operation
# in the lens prompt against the code
```

**What you get:** A conservation law naming the structural trade-off the code is forced to make, a meta-law predicting what that trade-off conceals, and a bug table classifying each finding as fixable or structural.

### Standalone: Full Prism pipeline via the lensing workflow

Run the 3-pass self-correcting pipeline. The orchestrator dispatches three isolated agents.

```
# Start the lensing workflow with full-prism mode
get_workflow({ workflow_id: "lensing" })

# The orchestrator follows the orchestrate-lensing skill:
# 1. Reads target file
# 2. Dispatches fresh agent → structural pass (resource 00)
# 3. Captures output, dispatches fresh agent → adversarial pass (resource 01)
# 4. Captures output, dispatches fresh agent → synthesis pass (resource 02)
# 5. Presents the synthesis as the final result
```

**What you get:** A corrected conservation law that survives adversarial challenge, a definitive fixable/structural classification for every finding, and the "deepest finding" — a property visible only from having both the structural analysis and its correction.

### Standalone: Portfolio analysis with two complementary lenses

Run two independent lenses to get breadth instead of depth.

```
# Agent loads two lenses and applies each independently
claim_lens = get_resource({ workflow_id: "lensing", index: "07" })
degradation_lens = get_resource({ workflow_id: "lensing", index: "10" })

# Apply claim lens → discovers hidden assumptions
# Apply degradation lens → discovers what decays with neglect
# Cross-lens synthesis → identifies convergent and unique findings
```

**What you get:** Two non-overlapping sets of structural findings. Convergent findings (discovered by both lenses) are high-confidence. Unique findings (one lens only) are the value-add of portfolio analysis.

### Cross-workflow: Augmenting a work-package code review

A work-package skill like `review-code` loads the L12 lens to supplement its checklist-based review with structural depth.

```
# Inside a work-package skill protocol step:
protocol:
  structural-analysis[3]:
    - "Load resource 00 from the lensing workflow: get_resource(workflow_id: 'lensing', index: '00')"
    - "Apply every operation in the lens prompt against each changed file"
    - "Append structural findings to the code review report"
```

**What you get:** The standard severity-rated code review findings *plus* conservation laws and structural/fixable classification for each file. The lens finds problems that checklist reviews miss — particularly silent failures and design-level trade-offs.

### Cross-workflow: Full Prism from within a work-package activity

When maximum depth is needed (e.g., during implementation analysis), the work-package worker can act as the lensing orchestrator, spawning isolated sub-agents directly.

```
# The worker follows the orchestrate-lensing skill protocol:
# 1. Read target code
# 2. Task(fresh agent, content + resource index 00) → capture structural output
# 3. Task(fresh agent, content + ANALYSIS 1 + resource index 01) → capture adversarial output
# 4. Task(fresh agent, content + ANALYSIS 1 + ANALYSIS 2 + resource index 02) → capture synthesis
# 5. Include synthesis findings in the implementation analysis artifact
```

**What you get:** The self-corrected Full Prism analysis embedded within the work-package activity's artifact, with full isolation between passes even though the analysis is invoked from a parent workflow.

---

## Background

The lenses in this workflow are derived from the [agi-in-md](https://github.com/m2ux/agi-in-md) research project (29 rounds, 650+ experiments). The core finding: short imperative prompts ("lenses") reliably activate specific analytical operations in language models, producing structurally deeper findings than vanilla analysis.

- **The prompt is the dominant variable.** Haiku + L12 lens (9.8 depth, 28 bugs) outperforms Opus vanilla (7.3 depth, 18 bugs) at 5x lower cost.
- **Construction-based reasoning (L8+) works on all models.** Unlike meta-analysis which requires larger models, construction — building improvements and observing what they reveal — is a universal cognitive operation.
- **5 portfolio lenses find 5 genuinely different things.** Zero overlap confirmed across 3 real codebases. Each lens activates a distinct analytical operation.
- **The 3-pass pipeline self-corrects.** The adversarial pass finds what the structural pass conceals. The synthesis produces properties visible only from having both perspectives.

The L12 pipeline encodes 12 sequential operations: falsifiable claim → three-voice dialectic → concealment mechanism → engineered improvement → diagnostic recursion → structural invariant → invariant inversion → conservation law → meta-diagnostic → meta-law → concrete findings collection.

