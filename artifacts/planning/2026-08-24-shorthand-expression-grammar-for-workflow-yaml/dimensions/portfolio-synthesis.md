# Portfolio Synthesis — workflow-server YAML definition grammar (activity + workflow tiers)

**Lenses:** pedagogy (06), claim (07), scarcity (08), deep-scan (12), sdl-abstraction (15) · **Findings:** 34 (16 convergent, 18 unique)
**Source revision:** `origin/main` `b061faee`; `workflows/` from working tree.

| Finding | Lenses | Convergence |
|---|---|---|
| Predicate-free graph edges are a deliberate invariant protecting activity borrowability, not a vacancy to fill | pedagogy, claim, scarcity, sdl-abstraction | convergent |
| Neither dialect contains the other: `when` lacks presence, `Condition` lacks truthiness | pedagogy, claim, deep-scan | convergent |
| `actions[].target` holds two grammars whose value sets overlap completely — 53/53 set-sense values also parse as predicates | pedagogy, claim, sdl-abstraction | convergent |
| Group 1's residue prediction confirmed exactly: presence + emptiness forms close all 4 non-parsing values | pedagogy, claim | convergent |
| …but the presence form invalidates the stated precondition of a hard-zero guard covering 350/657 defaulted variables | pedagogy, claim, sdl-abstraction | convergent |
| The two evaluators coerce differently; 5 of 13 probe predicates disagree | pedagogy, claim, deep-scan | convergent |
| 54 `exits[].when` and 38 validate-sense `target` predicates have no syntax guard at all | pedagogy, scarcity, sdl-abstraction | convergent |
| The parenthesization rule is context-free-expressible but lives in an imperative check applied at 1 of 6 positions | pedagogy, scarcity, sdl-abstraction | convergent |
| The whole grammar lives in prose invisible to Zod, `tsc`, and JSON Schema validation | pedagogy, scarcity, sdl-abstraction | convergent |
| `gate-liveness.ts` contradicts itself on negatives; the tree spelling is eagerly bundled where the string spelling is not — 54 gates | scarcity, deep-scan | convergent |
| The real migration is 19 condition blocks, not 75: 78 are structurally forced, 9 more locked by `exists`/`notExists` | claim, scarcity | convergent |
| The server does evaluate both dialects at `gate-liveness.ts:194-195`; the published contract says it never does | deep-scan, sdl-abstraction | convergent |
| `condition` on a checkpoint is a different construct (dismissal), sharing a name with a legacy gate, enforced by nothing | claim, sdl-abstraction | convergent |
| The impossibility triad: one predicate language × position-specific power × agent-side evaluation — pick two | claim, deep-scan | convergent |
| No schema-drift check exists and none is registered among the 31 guards | scarcity, sdl-abstraction | convergent |
| The formal artifacts have described a superseded design since 2026-02-10, checked by nothing | scarcity, sdl-abstraction | convergent |
| Authors reject the available terse form 96.8% of the time — 272 explicit boolean comparisons against 9 terse | claim | unique |
| Rename-only bindings carry the dataflow joins; only 2 of 64 are intent-free | claim | unique |
| A precondition satisfied by absence transfers as an assumption, because absence leaves nothing to copy — the pedagogy law | pedagogy | unique |
| Two thirds of predicate rules (10 of 15) live where they cannot fail a build | scarcity | unique |
| Every gate is parsed 2-4× per delivery; no AST is cached though `parseWhen` and `WhenAst` are exported | deep-scan | unique |
| `assertWhenAuthoring` tokenizes twice and its second failure branch is unreachable | deep-scan | unique |
| An unparseable expression reads no variables, silently shrinking the activity's declared variable contract | deep-scan | unique |
| `unbound` verdicts discard the variable name that the same file's other function returns | deep-scan | unique |
| Neither dialect can compare two bag variables; a bare right-hand word is silently a string literal | deep-scan | unique |
| Decimal literals parse as a condition tree and fail as a `when` string | deep-scan | unique |
| `when: ""` silently disables a step, and the corpus guard is written to skip it | deep-scan | unique |
| Dotted-path resolution is triplicated across three modules, acknowledged in a comment | deep-scan | unique |
| Malformed dotted paths (`a..b`, `a.`) tokenize as valid identifiers and resolve to `undefined` | deep-scan | unique |
| The published JSON Schema rejects a live definition file — `remediate-vuln/workflow.yaml` uses string activity refs | sdl-abstraction | unique |
| Four loader-level sugars are invisible to both schemas by construction | sdl-abstraction | unique |
| `target` carries three roles across two modules that do not cite each other | sdl-abstraction | unique |
| A bare technique reference's meaning depends on filesystem state; adding a file re-targets it silently | sdl-abstraction | unique |
| Three different name grammars across three modules, no shared constant | sdl-abstraction | unique |

## What Converged

**The workflow tier's predicate-freedom is an invariant** — reached by four of five lenses from four different directions (transfer risk, falsified premise, untested protection, uncodified contract). Four-lens agreement on the single question the run was commissioned to answer for the workflow tier is the strongest signal in this portfolio: `grammar/workflow.ebnf` and `constraints/workflow.als` should specify the *absence* of edge predicates as a constraint, not invent a language for them.

**Neither dialect contains the other**, reached independently by pedagogy (as a false transfer premise), claim (as a falsified neutrality claim), and deep-scan (as a failed type-level lowering). Agreement matters because it kills the framing "should `when` lower into `Condition`" in both directions at once.

**The presence form is confirmed and dangerous** — pedagogy and claim independently verified Group 1's prediction closes all four residue values, and independently found the same guard comment that the cheapest closing form invalidates. Confirmation and counter-indication arriving together is what makes this actionable rather than merely encouraging.

**Coercion divergence** was reached by three lenses; deep-scan added the reason it is unobservable (the `&&` at `gate-liveness.ts:196` masks it) and claim independently predicted it as the slowest-to-discover failure. Two lenses converging on *the same prediction* by different routes is the portfolio's clearest risk signal.

**The impossibility triad** was derived independently by claim (as "the core impossibility the artifact optimizes") and deep-scan (as "the conservation law"), in the same three terms. Independent derivation of the same trade-off is evidence it is structural rather than an artifact of framing.

**Enforcement gaps** converged three ways and were the only findings verified by execution rather than reading: the `when-expression` guard reports OK on invalid `exits[].when` and flags the identical expressions on steps.

## What Only One Lens Saw

**claim** was built to invert empirical premises, and it alone falsified the two that a shorthand proposal rests on: authors reject terseness 96.8% of the time, and rename-only bindings carry the dataflow joins rather than noise. Both invert the proposal's motivation, not merely its details.

**pedagogy** alone named the transfer mechanism — a precondition satisfied by absence leaves nothing to copy — which is the generative rule behind four separate findings other lenses reached one at a time.

**scarcity** alone counted where rules live: 10 of 15 in locations that cannot fail a build. That count is the practical test for anything this run specifies.

**deep-scan** contributed 9 of the 18 unique findings, as the only code-only lens. Two are consequential beyond implementation hygiene: no dialect can compare two bag variables (an unmet expressiveness need, unlike terseness), and an unparseable expression silently shrinks the variable contract the `activity-variables` guard checks.

**sdl-abstraction** alone crossed the layer boundary and found the published JSON Schema rejecting a live definition file — the concrete proof that the "four-way single source of truth" is one authoritative source, one generated-and-misapplied, and two authoritative for nothing.
