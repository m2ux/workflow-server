# Prism Concept Lexicon

A reference for the analytical concepts used across prism resource files. Entries are grouped by role in the framework, with depth proportional to conceptual difficulty.

---

## Core Structural Concepts

These are the foundational ideas that the L12 pipeline and most other prisms build toward. Understanding them is essential to reading any prism output.

### Conservation Law

A conservation law names a trade-off that is inherent to the problem being analyzed — not to any particular implementation of it. It takes the product form *A x B = constant*: improving dimension A necessarily degrades dimension B, and no design can escape this constraint. The term is borrowed by analogy from physics, where conserved quantities (energy, momentum) persist through transformations. Here, what is "conserved" is the trade-off itself — it persists through every refactoring, redesign, or rewrite.

The practical value of a conservation law is convergence. Without one, analysis produces an open-ended list of observations with no organizing principle. With one, every finding can be classified relative to a single structural constraint: does this bug exist because of the conservation law (structural), or despite it (fixable)? This classification is what makes prism output actionable — it separates problems you can solve from problems you must manage.

Conservation laws appear in different forms across the prism resources. The L12 pipeline (00) derives them through iterative improvement and inversion. The deep-scan lens (12) finds them as "conserved quantities" — complexity that cannot be eliminated, only relocated. The optim lens (20) finds them as performance trade-offs at module boundaries. The behavioral synthesis lens (23) finds a "unified law" governing all four behavioral dimensions simultaneously. Despite the varied entry points, the underlying concept is the same: a named constraint that governs the system's design space.

A conservation law is not a universal truth — it is a claim about a specific system. The adversarial pass (01) exists precisely to test whether a proposed conservation law is genuine or merely an implementation choice that could be designed around. A law that survives adversarial challenge is a structural finding. One that doesn't was an overclaim.

### Meta-Law

A meta-law is discovered by applying the same diagnostic used to find the conservation law to the conservation law itself. Where the conservation law names what trade-off governs the system, the meta-law reveals what the conservation law conceals about the system and predicts a concrete, testable consequence that the conservation law structurally cannot see.

This is the concept most likely to feel abstract on first encounter. The intuition is: any analytical framework has blind spots created by its own assumptions. The conservation law is a framework — it organizes all findings around a single trade-off. But that organizing act necessarily backgrounds everything that doesn't fit the trade-off's terms. The meta-law names what was backgrounded. It is not a generalization of the conservation law to a broader category; it must find something specific to this system that the conservation law's framing made invisible.

The meta-law is what separates L12-depth analysis from standard structural review. Most analytical methods stop at identifying trade-offs. The recursive self-diagnosis step forces the model past its own analytical blind spots, producing findings that no single-pass analysis can reach regardless of how sophisticated the initial pass is. The synthesis pass (02) refines the meta-law further by incorporating the adversarial challenge, producing a version that has survived both the model's own blind spots and an independent critic.

In practice, meta-laws tend to cluster into four categories depending on the domain: frame discovery (the analysis was looking through the wrong lens entirely), hidden variable (a dimension the trade-off formulation omitted), observer-constitutive (the act of analyzing changes what is being analyzed), and deferred commitment (the system's real constraint is about when decisions are made, not what decisions are made).

### Structural Invariant

A structural invariant is a property that persists through every attempted improvement because it belongs to the problem space, not the implementation. If you fix a bug and the same class of problem reappears in a different location, the underlying cause is likely a structural invariant. The invariant is not a bug — it is a constraint that any solution to this problem must accommodate.

The L12 pipeline discovers structural invariants through iterative improvement: engineer a fix, observe what new problem the fix creates, fix that, observe again. The property that survives all iterations is the invariant. The rec lens (16) uses the same technique in compressed form — locate the deepest defect, propose a fix, trace what diagnostic signal the fix destroys, iterate until the persistent property emerges.

Structural invariants matter because they determine the boundary between fixable and structural bugs. A bug caused by a structural invariant cannot be eliminated — only moved to a different location or traded for a different kind of failure. Recognizing this boundary early prevents teams from spending effort on fixes that will recreate the original problem elsewhere.

### Concealment Mechanism

A concealment mechanism is the specific way an artifact hides its real problems from analysis. Every system has one. It is not deliberate obfuscation — it is a structural property of how the code or artifact is organized that makes certain classes of problem invisible to standard review.

The L12 pipeline names the concealment mechanism early (resource 00) and then exploits it: engineer an improvement that would deepen the concealment, then observe what becomes visible only because you tried to strengthen the hiding. This counterintuitive step — deliberately making the problem harder to see — is what reveals properties that direct analysis misses. Three properties of the problem become visible only through the attempt to conceal it further.

Concealment mechanisms cluster into six categories across domains. In code, concealment is predominantly structural — it hides what the code is or does (e.g., a function named "validate" that also mutates state). In non-code domains, concealment is predominantly epistemic — it hides what questions are worth asking (e.g., a business plan that frames all risks as resource problems, concealing that the core risk is a timing assumption).

---

## Analytical Method Concepts

These describe the reasoning operations the prisms use to arrive at findings.

### Dialectical Testing

Three independent perspectives stress-test a claim: one defends it, one attacks it, and one examines what both take for granted. The claim transforms through this process, and the gap between the original claim and the transformed claim is itself a diagnostic — it reveals the hidden assumptions that shaped the original framing.

This operation appears explicitly in the L12 structural lens (00) and its compressed variant (18). It also appears structurally in the full-prism pipeline, where the three passes (structural, adversarial, synthesis) instantiate the same pattern at the pipeline level rather than within a single prompt. The adversarial pass (01) is the "attack" perspective operating with full context isolation — it has never seen the structural analysis being generated, only the finished text.

### Falsifiable Claim

The L12 pipeline begins by requiring a specific, falsifiable claim about the system's deepest structural problem. "Falsifiable" means the claim must be concrete enough that evidence from the code could disprove it. This constraint prevents the analysis from starting with vague observations ("the code is complex") and forces it into a position that can be tested and refined.

The falsifiability requirement is what makes the subsequent dialectical testing productive. A vague claim cannot be meaningfully attacked or defended. A specific claim — "this system's deepest problem is that error context is destroyed at the service boundary" — can be checked against actual code paths, confirmed or refuted with evidence, and refined into a more accurate version.

### Invariant Inversion

Invariant inversion is the operation of engineering a design where a property that was impossible in the original system becomes trivially satisfiable. The point is not to propose a better design — it is to discover what new impossibility the inversion creates. The conservation law is the named relationship between the original impossibility and the new one.

For example, if the structural invariant is "this system cannot guarantee both consistency and availability," the inversion engineers a design where consistency and availability are trivially satisfiable. That design will necessarily sacrifice something else — perhaps it requires unbounded memory, or it can only handle a single client. The conservation law names the relationship: *consistency x availability x resource-boundedness = constant*.

### Fixable vs. Structural Classification

Every bug, edge case, or silent failure identified during analysis is classified as either fixable (can be eliminated by a code change) or structural (predicted by the conservation law to be unfixable — eliminating it will recreate the problem elsewhere). This binary classification is the primary actionable output of the L12 pipeline.

The adversarial pass (01) specifically challenges these classifications. Bugs labeled "structural" may actually be fixable if the analysis overclaimed its conservation law. Bugs labeled "fixable" may actually be structural if the analysis underestimated the invariant's reach. The synthesis pass (02) produces the definitive classification by resolving disagreements between the structural and adversarial perspectives with evidence from the code.

### Recursive Entailment

Recursive entailment is the pattern of applying a fix, observing the new problem the fix creates, applying a fix to that, and continuing until a persistent property emerges. The rec lens (16) uses this as its primary operation. It is a compressed version of the iterative improvement sequence in the L12 pipeline, focused specifically on whether a defect is fixable or structural.

The key insight is that a fix that "buries the problem deeper" — making the symptom disappear while preserving the root cause — is itself a diagnostic signal. If every attempted fix recreates the same class of problem, the underlying cause is a structural invariant that must be managed rather than solved.

### Revaluation

Revaluation is the recognition that what appears to be a defect is actually the cost of achieving something valuable. The ident lens (17) uses this as its final step: for each identity displacement found, ask what the displacement buys — performance, convenience, backward compatibility — and whether removing it would sacrifice something important.

The universal formula is: "What looked like [DEFECT] was actually [COST] of [IMPOSSIBLE GOAL]." Necessary displacements are those where removing the apparent defect breaks something the system needs. Accidental displacements are technical debt with no compensating benefit. Distinguishing the two prevents teams from "fixing" things that are load-bearing.

---

## Structural Analysis Patterns

These are the specific classes of structural problem that individual prisms are designed to find.

### Information Laundering

Information laundering occurs when specific failure modes are converted into generic ones, destroying diagnostic context in the process. The deep-scan lens (12) hunts this pattern: exceptions caught and re-thrown with less context, error messages that say "not found" without enumerating what was tried, silent default values that mask configuration errors.

The damage is not the error itself but the lost ability to diagnose it. When a specific database connection timeout is caught and re-thrown as a generic "service unavailable," every caller that handles the error must guess at the root cause. The diagnostic information has been "laundered" — its specific identity removed — making the failure appear simpler than it is.

### Identity Displacement

Identity displacement is when an artifact is something fundamentally different from what it claims to be. The ident lens (17) targets this: functions named "get" that silently mutate state, sentinel values (like `null` or `None`) that carry different meanings in different contexts, components that serve a different purpose than their name suggests.

This is distinct from a simple bug. A bug is where code fails to do what it should. Identity displacement is where code succeeds at doing something other than what its interface declares. The displacement may be intentional (a performance optimization disguised as a simple accessor) or accidental (accumulated drift between the name and the behavior). The revaluation step determines which.

### Trust Gradient

A trust gradient maps where validation actually happens in a system versus where it is merely assumed to have happened. The trust topology lens (13) constructs this map by tracing data from external boundaries inward, identifying every point where a component trusts that a prior component has already validated, sanitized, or authorized the input.

Trust inversions occur when low-level code depends on high-level invariants without checking them — utility functions that are only safe when called from a specific context, or read operations that silently perform privileged mutations. Boundary collapse occurs when two components each believe the other owns the same validation responsibility, resulting in either double validation (wasted work) or zero validation (a security gap).

### Temporal Coupling

Temporal coupling is an ordering dependency that the interface does not reveal. The coupling clock lens (14) finds three manifestations: implicit initialization contracts (what must exist before what, enforced only by convention), invariant windows (the gap between when a condition is checked and when it is acted upon — also known as TOCTOU or "time-of-check to time-of-use"), and ordering-dependent behavior (tests or configurations that silently require a specific execution sequence).

The core danger is that temporal coupling produces failures that only appear under specific execution sequences. They pass all tests run in the "expected" order and fail silently when execution order changes — during concurrent access, after refactoring, or when a new caller initializes components in a different sequence than the original author assumed.

### Abstraction Leak

An abstraction leak occurs when implementation details bleed through an intended boundary, forcing callers to understand internals they should not need to know about. The abstraction leak lens (15) distinguishes this from a contract violation (lens 11): a contract violation is where a single function's implementation diverges from its own signature promise; an abstraction leak is where internal details escape across layer boundaries.

Three patterns dominate: boolean flags or mode strings that let callers select internal execution paths (the caller drives the implementation), error types that require callers to parse internal structure to handle them, and magic constants duplicated across layers with no shared definition. Asymmetric concealment — where an abstraction is complete for one caller but leaks to another — is a particularly subtle form, because the leak is invisible to the caller for whom the abstraction works.

### Problem Migration

Problem migration is the phenomenon where fixing a visible problem creates an invisible one, and fixing that invisible problem makes the original one visible again. The rejected-paths lens (09) targets this directly: for each problem, trace the decision that enabled it, identify the rejected alternative that would have prevented it, and name the new invisible problem that alternative would have created.

The "law" the lens seeks is not about any specific problem but about the class of problem that migrates between visible and hidden states across design decisions. Understanding the migration pattern reveals which problems are genuinely solvable and which will simply reappear in a different form after any redesign.

### Corruption Cascade

A corruption cascade is the chain of consequences that follows when corrupt or incomplete data enters a system and propagates through consumers without being caught. The error resilience lenses (19, 24, 27, 28) trace these cascades by starting at the point where failure context is destroyed and following the corrupt data through every downstream decision until it either produces a visible error, exits the system as a wrong-but-accepted result (silent exit), or gets stored for later damage (deferred exit).

Silent exits are the most dangerous outcome because the system appears to be functioning correctly while producing wrong results. Deferred exits are second — the corruption is stored and causes damage at a later time, disconnected from the original cause, making diagnosis extremely difficult.

### Invisible Handshake

An invisible handshake is data that flows between functions without appearing in their signatures. The evolution lens (21) maps these: mutable shared state, closure captures, implicit ordering requirements, and return values that constrain future calls without documenting the constraint. Each handshake is an unwritten rule binding two or more components.

The "poison propagation" test reveals the fragility: find the smallest mutation to the shared state that corrupts the handshake without triggering any error, then trace every function that receives wrong data and state the exact wrong behavior it produces. The result is a fragility atlas ranking handshakes by cascade size — the number of downstream functions affected by a single corruption.

### Opacity

Opacity is a boundary where implementation is hidden in a way that erases performance-critical information. The optim lens (20) focuses specifically on what performance data is lost at module boundaries: allocation patterns, cache behavior, branch predictability, memory locality, and lock contention.

The consequence of opacity is blind workarounds — code that copies when it could alias, polls when it could wait, retries when it could resume, because the information needed to choose the optimal path was erased at a boundary. The lens requires costs to be stated concretely (nanoseconds, allocations, cache misses, round trips) rather than abstractly ("overhead" or "some cost"), forcing the analysis to quantify what opacity actually costs the system.

---

## Interface and Naming Concepts

These concern the relationship between what an artifact claims to be or do and what it actually is or does.

### Interface Contract

An interface contract is what a function's signature promises about types, side effects, and return values. The contract lens (11) reads code function by function, comparing each signature's promise against the implementation's actual behavior. Violations include functions that silently behave differently based on input type (not value), sentinel values with context-dependent meaning, and methods that mutate shared state as a side effect of a read operation.

The contract lens targets the gap within a single function's boundary. This distinguishes it from the abstraction leak lens (15), which targets what escapes across layer boundaries, and the fidelity lens (31), which targets drift between documentation and behavior.

### Naming Lies

A naming lie is a mismatch between what a function's name promises and what its implementation delivers. The API surface lens (22, 25) classifies three types: narrowing lies (delivers less than the name implies — "validateAll" checks one field), widening lies (delivers more than the name implies — hidden mutations or silent fallbacks), and direction lies (delivers something entirely different — "save" that also deletes).

For each lie, the lens requires writing the exact bug a caller would produce by trusting the name: "Called X assuming Y, so I wrote Z." This forces the analysis past abstract observations into concrete failure scenarios. Accumulated naming lies constitute labeling debt — a design-level cost that grows as more callers encode incorrect assumptions about what functions do.

### Contract Fidelity

Contract fidelity measures how accurately an artifact's self-description matches its actual behavior. The fidelity lens (31) targets a different failure class than contract (11) or API surface (22): not the gap between a function's name and its behavior, but the gap between documentation, help text, error messages, and comments on one side, and the code they describe on the other.

This gap emerges through evolutionary drift — code changes but its descriptions do not. Specific patterns include docstrings describing parameter behavior that no longer matches validation logic, error messages referencing function names that have been renamed, cache key generation logic that differs between save and load paths, and deprecation warnings pointing to migration paths that no longer exist.

---

## Behavioral Analysis Concepts

These are specific to the behavioral pipeline (lenses 19–23) and its synthesis.

### Error Boundary

An error boundary is any point where failure information is caught, wrapped, transformed, or silenced. The error resilience lens (19) extends this beyond explicit catch blocks to include implicit boundaries: type coercions that swallow mismatches, default values that mask undefined state, callbacks that never fire, and null checks that skip work. At each boundary, specific failure context — variable values, stack depth, partial state, timing information — is either preserved or destroyed.

The distinction between explicit and implicit boundaries matters because implicit boundaries are invisible to standard code review. A `try/catch` block is visible; a default parameter value that silently replaces an undefined input is not, yet both destroy diagnostic context.

### Convergence Point

A convergence point is a property that multiple independent analyses discover without coordination. The behavioral synthesis lens (23) looks for these specifically: where do error boundaries coincide with performance boundaries? Where do invisible handshakes coincide with naming lies? Convergence points reveal structural properties that no single analytical perspective can identify, because they exist at the intersection of multiple dimensions.

### Blind Spot

A blind spot is what falls between all available analytical lenses. Every lens asks a specific question, which means every lens is structurally unable to see properties that its question does not address. The behavioral synthesis lens (23) and the full-prism synthesis lens (02) both hunt blind spots — properties, defects, or structural features invisible to all perspectives applied so far.

Blind spots are not random gaps in coverage. They are systematically created by the assumptions embedded in each lens's framing. A lens that asks "how does this break?" cannot see properties that only manifest when the system works correctly. A lens that asks "what does this cost?" cannot see costs that are only visible in the naming layer. Identifying the systematic pattern of what all lenses miss is often more valuable than any individual lens's findings.

---

## Decay and Evolution Concepts

These concern how systems change over time, through active modification or passive neglect.

### Decay Timeline

A decay timeline models how problems evolve when a system receives no maintenance. The degradation lens (10) projects forward at three intervals — 6, 12, and 24 months — asking which problems metastasize, which failure paths begin to silently corrupt instead of failing visibly, and where brittleness increases monotonically. The degradation law names the property that worsens with neglect regardless of the system's initial quality.

The lens also constructs tests that "break the system by only waiting" — tests that pass today but will fail at predictable future dates without any new code changes. These are canaries for time-dependent rot: expired certificates, growing datasets that exceed hardcoded limits, cached values that drift from their sources.

### Shotgun Surgery

A shotgun surgery target is a behavior that requires changes to three or more components whenever it is modified. The evolution neutral lens (26) maps these systematically, distinguishing between explicit bindings (declared contracts, shared schemas) and implicit bindings (conventions, duplicated patterns, undocumented invariants).

The coupling budget is the irreducible minimum of cross-component dependencies required for the system's functionality. It is a form of conservation law applied to coupling: restructuring the system can move coupling from one location to another, but the total coupling budget is conserved. Reducing coupling in one place increases it somewhere else.

---

## Evidence and Cost Concepts

These concern the intersection of diagnostic capability and resource expenditure.

### Evidence Cost

Evidence cost is the resource expenditure required to detect corruption early. The evidence cost lens (29) ranks each piece of unchecked shared state by *validation_cost x mutation_frequency* and traces how skipped validation causes both errors and wasted computation simultaneously — the same act of omission produces two categories of harm.

The diagnostic conservation law this lens derives is about the observability budget: bytes used for error evidence cannot simultaneously hold payload data. Every system implicitly allocates its observability budget, and no design can simultaneously achieve a fast path, full safety, and debuggability. The "impossible trio" framing forces the analysis to name which of the three each component has sacrificed.

### Resource Scarcity

Every system embeds assumptions about what will never run out — memory, time, network bandwidth, human attention, unique identifiers. The scarcity lens (08) surfaces these assumptions by identifying concrete problems and tracing each to the resource scarcity it exposes. The analytical move is to design alternatives that gamble on opposite scarcities: if the current design assumes memory is abundant and time is scarce, what happens when those assumptions invert?

The conservation law the scarcity lens seeks is what quantity is preserved across all possible designs regardless of which scarcities they gamble on. This reveals constraints that are genuinely structural — no reallocation of resource assumptions can eliminate them.

---

## Dead Code and State Concepts

These concern code that exists but cannot participate, and state that persists beyond its intended scope.

### Structural Deadness

Structural deadness covers code that exists but cannot execute or participate in the system's behavior. The reachability lens (30) names three specific patterns: zombie overrides (methods overriding parent signatures but never invoked polymorphically through the base class), phantom configuration (configuration keys validated against constraints but never populated by any configuration loader), and orphaned handlers (exception handlers catching error types the guarded code cannot produce).

These differ from simple unused code because they appear active — they override, validate, and catch — creating the impression of participation while contributing nothing. Their presence increases maintenance burden and misleads readers about what the system actually does.

### State Machine Violations

A state machine violation occurs when mutable state occupies a condition that no code path is designed to handle. The state audit lens (32) enumerates all mutable state, maps every possible transition, and flags transitions that lack explicit handling. Three specific patterns emerge: orphaned state persistence (state surviving across logical boundaries like sessions persisting after logout), assumed state violations (code that requires initialization but lacks guards), and cache-source divergence (cached data becoming stale because mutations lack invalidation triggers).

---

## Transferred Knowledge Concepts

These concern how patterns learned in one context create problems in another.

### Transferred Patterns

When someone internalizes the patterns of an existing artifact and applies them to a new problem, they carry forward both the explicit decisions and the invisible rejections. The pedagogy lens (06) traces this process: for each explicit choice the original artifact makes, name the alternative it invisibly rejects, then predict which rejected alternatives get unconsciously resurrected when the learned patterns meet a different problem context.

The pedagogy law names the constraint that gets transferred as an assumption — something that was a deliberate choice in the original context but becomes an unquestioned premise in the new context. The prediction of which invisible transferred decision fails first (and is slowest to be discovered) is the lens's most actionable output, because these are the failures that appear months later and are hardest to trace back to their origin.

### Claim Inversion

Claim inversion is the operation of extracting every empirical claim an artifact embeds — about timing, causality, resources, or human behavior — and then assuming each claim is false to trace the corruption that unfolds when the artifact meets a contradicting reality. The claim lens (07) builds three alternative designs, each inverting one claim, to reveal the original's hidden assumptions.

The core impossibility the lens seeks is the goal the artifact is trying to optimize around that cannot actually be achieved. This is related to but distinct from a conservation law: the core impossibility is what the artifact pretends is possible, while the conservation law names the specific trade-off that makes it impossible.
