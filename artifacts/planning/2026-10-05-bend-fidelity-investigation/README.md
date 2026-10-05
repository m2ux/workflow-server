# Bend as the Fidelity System

An investigation of whether Bend 2, a dependently typed, affine language with a proof checker, could take over some or all of the workflow-server's fidelity guarantees. Server `origin/main` at `ab680d9d`, corpus `origin/workflows` at `15860ff3`, Bend `565d7fde` (2.0.35, 2026-10-04). The brief is [PROMPT.md](PROMPT.md); the mechanism table and trust-boundary classification are [mapping.md](mapping.md); the built spike with every captured compiler output is [spike/](spike/README.md).

## Verdict

- **Do not adopt Bend as the definition language, the runtime engine, or the worker's proof format.** Each placement works in the spike, and each is beaten on total cost by a TypeScript change that buys the same guarantee, because every guarantee Bend adds is decidable over finite definition data and the server already holds that data in typed form.
- **What Bend proves, it proves cheaply: 27 laws across the spike and the authoring measurement, 21 negative cases, every spike law one line of proof, every check under 4 seconds.** Graph totality, checkpoint gating, manifest shape, session affinity, read resolution, orphan inputs, used declarations, bounded loops and option exits all hold on the MVW specimen and on the richest real activity in the corpus, and each deliberately broken variant is refused with a precise message.
- **The proven kernel does not reach the laws that would matter most.** Four of the six real-activity laws pass the Lean-proven kernel; the two dataflow walks that would retire the binding guards run the kernel out of fuel and rest on the AI-supported checker alone, whose acceptance changed in five of its last 36 releases.
- **Nothing moves the trust boundary.** Of the eight Limits of Detectability, none becomes proven; five narrow to the shape of a claim, three are inherent. The agent still controls every channel that matters: the work, the predicate values, the person.
- **The spike exposed three definition-format defects worth fixing without Bend**, each cheaper than any placement: a bare `inputs:` or `with:` value is a literal when misspelt, so a typo is invisible to every check; `maxIterations` is optional and read by no server code, so seven corpus loops have no bound; and the five warning layers' structural halves could refuse today with a one-line policy change each.

## What was built

| Layer | Bend sources | Laws | Negatives | Checker | Kernel (`--verdict`) |
|---|---|---|---|---|---|
| Probes of the language | 11 files | — | 7 refusals by design | 0.10–0.14 s | agrees with the checker on all 11 |
| MVW specimen (`corpus/specimens/mvw`) | 1 file, ~200 lines | 2 `{==}` laws plus 4 properties held by types | 7 | ALL PROOFS CHECK, 0.11 s | ALL PROOFS CHECK, 0.13 s |
| Real activity (`work-package/activities/10-post-impl-review.yaml`, 377 lines of YAML) | a 518-line model (365 without comments), a 476-line generator, 57 generated lines of data, a 107-line laws file | 7 `{==}` laws | 7 generated or written, plus 1 finding | ALL PROOFS CHECK, 3.1 s | 4 laws pass (0.3–1.0 s); 2 run out of fuel (7–8 s) |
| Agent authoring measurement | 9 proofs by 9 independent agents, 3 tasks | 18 laws | — | 9 of 9 pass; 1 checker error in 9 trails; 30–55 lines per file | 9 of 9 pass |

The real activity was chosen because it alone carries every construct the brief asked for: four checkpoints (one soft, one conditional, one inside a loop), a `forEach` loop and a `while` loop with an or-form continuation test, eleven gated steps, and a child dispatch through `handle-sub-workflow` and the 328-line `activity-loop` routine ([spike/README.md](spike/README.md#layer-2-one-real-activity)).

## Placements, ranked

Ranked by guarantee gained per unit of cost, against the cheapest alternative that buys the same guarantee ([mapping.md Part 1](mapping.md#part-1-mechanism-table)).

### 1. Definition language (author-time checker)

**What it buys.** Every structural rule the loader refuses at load, and the YAML half of guard family C (binding and dataflow), becomes a compile error at author time. The spike holds `reads_resolve`, `no_orphan_input`, `reads_used`, `writes_produced`, `loops_bounded` and `option_exits_declared` on the real activity and refuses each broken variant with "expected : True{} / observed : False{}" at the law. A loop without `maxIterations` has no terminating encoding at all: the checker refuses the self-call ([spike/real/out/neg_loop_without_bound.check.txt](spike/real/out/neg_loop_without_bound.check.txt)).

**What it does not buy.** Eight of the ten guard families read markdown structure, prose phrasing, link targets, file layout or human ledgers; a type system over definitions does not see them. Technique signatures live in markdown headings and `{token}` prose, so a Bend definition language still needs the parser the spike wrote in Python. The ledgers' 600 human verdicts have no slot in a law.

**What it costs.** Re-expressing 24,317 lines of YAML across 62 workflows and 278 activities is mechanical: the generator turns one activity into 70 lines of data, and the rules it mirrors took four calibration rounds to agree with the server's own (ambient names, orchestrator inputs, inherited contracts, bare renames). The 59,270 lines of markdown stay markdown. The risk is the toolchain: a checker with "trusted claims" for soundness, four closed proofs of `Empty` fixed in one month, verdict text changed twice, no ABI promise, Bun-only, no JSON, strings as linked lists, and a kernel that cannot confirm the dataflow laws at the scale of one activity.

**Cheapest alternative.** The same six functions in TypeScript over the loader's materialised model, as a guard that exits 1, and the loader as the serve gate. Equal strength for every law the spike states, because each is a decidable computation over finite data; what Bend adds is a quantified law proven by induction, which the corpus does not need (every activity is a closed term) and which the kernel could not confirm at scale.

### 2. Runtime engine (session state machine in Bend)

**What it buys.** The MVW layer shows the shape: a session is an affine value whose type carries its gate and position, so an advance past an open checkpoint, an answer to no question, a wrong-shaped report, or a second use of a consumed session is a compile error ([spike/mvw/out/](spike/mvw/out/)).

**What it does not buy.** The compile error is for a *driver program the checker sees*. The MCP caller is a language model sending JSON; the server must still decode, resolve and refuse at runtime, which is what the seal, the compare-and-swap, the frontier check, the gate and the timers do today, all of them refusals already. Bend has no JSON, and its JS interop runs the checker on emit but cannot run IO from the emitted module (interop map). The state machine would be a pure Bend library behind a TypeScript server that keeps every effect, so the proof covers the part that was never the risk.

**Cheapest alternative.** A typed state machine in TypeScript (discriminated unions over `Gate × Position`), or TLA+ for the protocol if a model-checked argument is wanted.

### 3. Proof-carrying work (workers return typed terms)

**What it buys.** A report's shape as a dependent type computed from the step list: a missing ungated step or an absent required value is a type error rather than a Layer 5 warning ([spike/mvw/negative/neg_manifest_missing.bend](spike/mvw/negative/neg_manifest_missing.bend), [spike/real/post_impl_review.bend](spike/real/post_impl_review.bend) `report_type`).

**What it does not buy.** The term is text the agent wrote. A type checker proves properties of a term, not that a model did the work the term describes, that a predicate it asserts is true, or that a person saw a question. "Evidence the step happened" is a well-formed claim. The technique-fetch layer compares agent claims with delivery events whose agent id is also agent-supplied; no type reaches that.

**Cheapest alternative.** A Zod schema generated from the activity's steps, refusing on mismatch; the server already computes `declaredOutputs` for the warning.

### 4. A fourth placement: laws as the guard protocol, in TypeScript

The evidence points here. Keep YAML and markdown as the authored formats. Take the loader's materialised model as the one typed representation (it already exists, in Zod). State each invariant of guard families B1, C and D as a total function over that model that **refuses**, unify the three overlapping scopes those guards use today, and make the serve gate the same check the merge gate runs. Adopt the three format changes below. Record every law in one registry with its negative case beside it, as the spike does, so the verification artefact is re-runnable by anyone. If a proof kernel is wanted later, the spike shows the laws translate: the same data and the same functions, with Bend or Lean as an external second opinion on the small laws the kernel can hold.

## Constructs to deprecate

Findings the spike forces, in cost order. Each is the user's decision ([Open questions](#open-questions-for-the-user)).

1. **The bare rename form of a technique `inputs:` value and a routine `with:` value.** A bare value that names a bag entry is a rename; one that names nothing is a literal; the server says the two are "statically indistinguishable" (`binding-provenance.ts:445-451`). So `findings_to_classify: manual_diff_review_repor` binds a string and passes every check ([spike/real/finding_bare_rename_typo.bend](spike/real/finding_bare_rename_typo.bend)). The corpus also writes bare names where it means variables: `walk-prism-child` passes `session_index: child_session_index`, a literal by the schema's own rule. Require braces for every variable reference; a bare value is always a literal. The orphan check becomes decidable and the generator's note disappears.
2. **Optional `maxIterations` on `while` and `doWhile` loops.** The field is read by no server code (definition map), 7 of 62 corpus loops omit it, and a loop without it has no terminating encoding in any checker. Make it required for `while` and `doWhile`; fix the seven loops.
3. **The five warning layers as warnings.** Transition against the graph, exit declared, manifest shape, activity-manifest ids and variable types are structural comparisons with server-held definitions. Each is one line from a refusal in `validation.ts`; a corpus walk shows whether any legitimate warning remains. The policy change buys what placement 2 buys at the boundary.
4. **The `required` flag on a variable declaration**, read by no check (`variable.schema.ts:16`).
5. **Three overlapping dataflow scopes** (`binding-fidelity` per workflow, `activity-variables` per graph, `routines` per signature) and **four ledger verdict vocabularies** across seven ledgers, one of which (`section-framing`) never reads the verdict. One typed model and one vocabulary.

## Constructs that survive

- **YAML definitions and markdown techniques, resources and routines.** No placement retires them; the structured half is already typed by Zod, the prose half is prose under any checker.
- **The seal, the compare-and-swap, the checkpoint gate and its timers, repo binding, the batch bound, the trace.** All effects over bytes, time and files; all refusals or records today; Bend adds nothing to any of them.
- **The loader's load-time refusals.** They are the author-time checks placement 1 would duplicate, already run as the six serving guards.
- **Eight of ten guard families**, with their ledgers and walks: markdown anatomy, link resolution, prose phrasing, single-home rules, schema agreement with prose, repository hygiene, and the human verdicts that no law can hold.
- **The adhoc checkpoint**, with its known limit: its option list is the worker's own, so option validation checks the worker's list against itself ([mapping.md Part 2](mapping.md#part-2-the-trust-boundary)).

## Recommendation

1. Do not start a Bend migration of definitions, runtime or worker protocol. The guarantees are real but small, the kernel does not reach the ones that matter, and TypeScript buys each at a fraction of the cost with no new toolchain.
2. Land the two schema changes (braced variable references, required loop bounds) and the warn-to-refuse policy, each as its own pull request on the engine, with the corpus fixes they force.
3. Build the fourth placement: one typed invariant registry over the loader's model, with a negative case per law, run as both the merge gate and the serve gate. The spike's `model.bend` is a readable specification of the six dataflow laws and their agreed rules; port it.
4. Revisit a proof kernel when the registry is stable and someone wants a machine-checked argument for the session protocol. Lean or TLA+ fits that better than Bend 2 today: Bend's kernel could not confirm the spike's dataflow laws, and its language is one month into public release.

## Open questions for the user

Each changes what is built next; none is answerable from the repository alone.

1. **Braces for every variable reference in `inputs:` and `with:`?** It retires the bare rename form and forces a corpus sweep (the generator's notes name the sites it found in one activity). The alternative is to accept that a misspelt rename is undetectable.
2. **`maxIterations` required for `while` and `doWhile`?** Seven loops need a bound; `await-review-loop` in `13-submit-for-review.yaml` is a loop over a human's response time, so its bound is a policy, not a count.
3. **Which warnings become refusals, and for which runs?** Flipping Layer 3 to a refusal changes what a mid-run definition edit does to an open session; a decision about operators, not about types.
4. **Is a stricter in-order dataflow rule wanted?** The spike states it in six lines (`unresolved_in_order`): a name may be consulted only after a step that produces it. On the real activity it flags one name, `run_status`, read by a validate action in the step that produces it, which is granularity rather than a defect. The server's rule today is order-free.
5. **Should the two held-out guards be registered?** `check-session-contract.ts` is the one existing check of a *run* against its definitions, the nearest thing the repository has to proof-carrying work; `check-operation-contract.ts` is held out because it is red.
6. **Is a kernel-checked protocol argument worth a toolchain?** If yes, the spike's MVW layer is the specification to port, and the choice is Lean or TLA+ rather than Bend 2.

## Evidence index

- [mapping.md](mapping.md): every runtime layer, guard family and definition construct, with today's strength, its strength under Bend, what it retires, the cheapest alternative and the cost; the eight Limits of Detectability classified; where each Bend guarantee rests (checker, elaborator, kernel).
- [spike/README.md](spike/README.md): the Bend commit, the from-source build, every run command, the probes, the two layers with their negative cases and captured output, per-law lines of proof and check time, and the authoring measurement.
- [notes/maps/](notes/maps/): the ten structured reader maps over the server, corpus, guards, canon, ledgers and Bend internals, with file and line citations for every claim, and the completeness critic's verified contradictions.
- Reproduction: everything under `/tmp/bend-fidelity` is rebuilt by the commands in the spike README; nothing was installed outside `/tmp`, and the server and corpus worktrees were read, not changed.
