# Review: Schema Effectiveness, Technique Markdown Structure & Progressive-Disclosure Economics

You are reviewing the **workflow-server** project (this repository) — an MCP server that lets agents follow structured workflows via a **Goal → Activity → Skill/Technique → Tools** model. Workflow and activity definitions are **JSON-Schema-validated YAML** interpreted by the agent in the context of a server-managed session; technique content is **markdown**, also agent-interpreted. Activities expose techniques **piecemeal** (one `get_technique` call per bound step) as a deliberate progressive-disclosure strategy.

## Mission

Produce an **evaluation report and improvement backlog** answering three questions:

1. **Schema effectiveness:** Do the workflow/activity schemas (`schemas/workflow.schema.json`, `schemas/activity.schema.json`, and supporting `condition`/`state`/`technique` schemas) effectively communicate intent to an interpreting agent? Where do they cause misinterpretation, redundancy, or dead weight?
2. **Technique markdown effectiveness:** Does the markdown structure used for techniques (protocol sections, I/O contracts, composition via `Initial`/`Final` inheritance) reliably drive correct agent behavior? Where is structure carrying no interpretive weight, and where is missing structure forcing agents to guess?
3. **Progressive-disclosure economics:** Piecemeal exposure trades **context economy** (only load the technique for the current step) against **interaction overhead** (more tool calls, more turns, protocol payload repeated per call). Under what conditions does the current design win, and under what conditions does it lose? Quantify, don't assert.

**Constraint on recommendations: incremental only.** Every proposed improvement must preserve the existing architecture — MCP server, session state, YAML + JSON Schema definitions, markdown techniques, agent-side interpretation. Schema field additions/removals, payload shaping, disclosure-granularity options, markdown template changes, and validation-message improvements are in scope. Replacing the server, abandoning schemas, moving to code-generated execution, or collapsing to a skills-only model are **out of scope** (the framework-vs-skills question is a separate review).

## Ground rules

- **Read-only review.** Do not modify `src/`, `schemas/`, workflow YAML, or technique markdown. The only repo write is the final artifact under `.engineering/artifacts/planning/`.
- Live sessions against the server are encouraged for measurement; use the repo rules (`discover` first, then the returned bootstrap sequence).
- `.engineering/` holds design artifacts — start with `.engineering/AGENTS.md`. Comprehension artifacts using "skill" terminology for what is now "techniques" predate the ≈2026-05 rename; verify against current code before relying on them.
- Relevant established design decisions to respect (do not re-litigate; do evaluate their *execution*): step-level technique binding with one-at-a-time disclosure (`get_technique{step_id}`; `get_activity` deliberately does **not** bundle step techniques), the anti-pattern catalog (AP-60 qualified identifiers, AP-64 bound-step purity, AP-77–84 output discipline, AP-85 resource→technique subsumption), four-tier cross-workflow reuse (`<wf>::<op>` / local / meta / dispatch_child), and canonical naming over `technique_args` renames.
- GitNexus MCP tools are available for code navigation of the server implementation.

## Phase 1 — Schema effectiveness (static)

**1a. Ground truth.** Read `schemas/README.md`, all six schema files, `docs/api-reference.md`, and the server-side interpretation points (where `src/` reads each schema field and turns it into response payload or validation). For each top-level schema field/construct, record in a **field ledger**:

- Which server behavior or agent instruction it drives (trace to `src/` or to rendered payload).
- Whether it is **enforced** (validation blocks), **advisory** (warned/rendered), or **inert** (parsed but never surfaced to agent or validator).
- Whether an interpreting agent could plausibly misread it (ambiguous naming, overloaded semantics, null-vs-absent ambiguity, permissive defaults).

**1b. Consumption audit across the corpus.** Across all workflows in `workflows/`, measure per field: how many definitions use it, and with how much variance. Flag: fields used by ≤2 workflows (candidate dead weight), fields whose values are near-identical everywhere (candidate defaults), and structures authors visibly work around (e.g., prose stuffed into description fields because no structured slot exists, repeated boilerplate blocks, copy-paste variance in equivalent constructs).

**1c. Authoring friction.** Reconstruct where the schema fights authors: examine recent workflow-content PRs / `.engineering` remediation artifacts (AP audits, binding-fidelity work) for recurring classes of authoring error — these are schema-design signals, not author mistakes. A guard script that had to be written (`check:*` scripts) marks a spot where the schema alone could not express or enforce the intended constraint; list each guard and ask whether a schema construct could subsume it.

## Phase 2 — Technique markdown effectiveness (static)

**2a. Structural census.** Inventory technique markdown across 3 representative workflows (`meta`, `work-package`, one smaller client workflow): section headings used, presence/shape of I/O contracts, protocol-step formatting, length distribution, and use of composition (`Initial`/`Final` wrapping, directory-based technique groups like `work-package/techniques/codebase-comprehension/`). Identify the de-facto template and every deviation class from it (compare against `TECHNIQUE.md` where present).

**2b. Interpretability probes.** For ~6 techniques spanning short/long and simple/composed, spawn a fresh subagent per technique with *only* the technique content (plus the minimal step context an agent would really have at that point in a session) and ask it to (a) restate the protocol as a checklist, (b) name its required inputs and produced outputs, (c) state what it would do first. Score restatements against the source. Divergence localizes which markdown structures fail to transmit intent; consistent success on some section shapes and failure on others is the finding.

**2c. Contract seam check.** Techniques declare inputs/outputs consumed by step bindings. Verify the seam holds: sample bound steps and confirm the names in the binding, the technique's declared I/O, and the prose inside the technique body agree. Classify mismatches (rename drift, prose-only contracts, outputs declared but never referenced downstream).

## Phase 3 — Progressive-disclosure economics (measured)

**3a. Payload accounting.** Using live sessions, capture actual response sizes (chars ≈ tokens/4) for `start_session`, `get_workflow`, `get_activity`, `next_activity`, `get_technique`, `get_resource` on a representative walk of `work-package` and of one small workflow. For each activity, compute: fixed protocol overhead per `get_technique` call (envelope, repeated instructions, session/trace fields) vs unique technique content delivered. **The key ratio is overhead-per-call ÷ mean technique size** — piecemeal disclosure pays when techniques are large relative to the envelope and steps are conditionally skipped; it loses when techniques are small, steps always execute, or the envelope repeats content.

**3b. Full-walk totals under alternative policies.** From the same measurements, model total protocol tokens for a full deterministic walk under: (i) current per-step disclosure, (ii) per-activity bundling (all bound techniques delivered with `get_activity`), (iii) hybrid — bundle techniques under a size threshold, fetch large ones lazily, (iv) delta mode — full content on first fetch, reference-only on repeat fetches of the same technique (measure how often the same technique is fetched more than once per session, e.g. in loops). Also count **turns/tool-calls saved** per policy, since call latency and turn overhead cost beyond tokens.
Report the crossover: at what mean technique size / step count does each policy dominate?

**3c. Fidelity side of the ledger.** Progressive disclosure exists partly for fidelity (attention on the current step, no premature reading ahead). Check both trace evidence and the design record: from available session traces (`get_trace`) or an instrumented fresh run, look for fidelity failures attributable to disclosure granularity — agent proceeding without fetching the bound technique, agent acting on a stale earlier technique, agent re-fetching redundantly. Any bundling recommendation from 3b must address what it gives up here.

## Phase 4 — Synthesis: friction report + incremental backlog

Write the report with this structure:

1. **Friction register** — every friction point found, each with: where it lives (schema field / markdown structure / disclosure protocol), evidence pointer (measurement, probe result, corpus example), who pays (author, executing agent, or token budget), and severity.
2. **Field & structure ledgers** — the Phase 1a and 2a inventories with verdicts: keep / clarify / merge / retire-candidate (retire = flag for a future major version, not a breaking change now).
3. **Disclosure-policy verdict** — the Phase 3b crossover analysis with a concrete recommendation (e.g., keep per-step as default, add opt-in bundling below a size threshold declared per activity), including the fidelity trade from 3c.
4. **Prioritized incremental backlog** — each item: the change, which friction it removes, evidence, estimated effort (S/M/L), compatibility (additive / needs migration), and risk. Order by impact-per-effort. Candidates to evaluate (not limit to): size-thresholded technique bundling flag on activities; envelope slimming (move repeated per-call instructions into `start_session` once); reference-not-repeat on refetch; schema `description` fields rendered to agents vs author-only; subsuming one or more `check:*` guards into schema constructs; a normative technique markdown template with lint; richer validation messages at the binding seam.
5. **Non-goals honored** — one paragraph confirming no recommendation requires architectural replacement, and listing anything found that *would* (deferred, with a pointer to the framework-vs-skills review).

**Deliverable location.** Save as `.engineering/artifacts/planning/{today YYYY-MM-DD}-schema-technique-disclosure-review/` containing `evaluation-report.md` plus supporting files (field ledger, structural census, payload measurements, probe transcripts) as separate documents. Follow `.engineering/AGENTS.md` conventions. Do not commit; leave for review.

Lead your final summary with the disclosure-policy verdict and the single highest-leverage backlog item.
