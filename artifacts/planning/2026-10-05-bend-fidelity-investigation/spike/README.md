# Spike: Bend as the Fidelity System

This folder holds the Bend sources, the negative cases, the captured compiler output, and the steps that reproduce them. Everything runs from the Bend repository at one commit, built from source under `/tmp`. Nothing here touches the server or the corpus; both were read from detached worktrees of `origin/main` (`ab680d9d`) and `origin/workflows` (`15860ff3`).

## The Bend studied

| Item | Value |
|------|-------|
| Repository | https://github.com/bendlang/bend |
| Commit | `565d7fdec289b1f2f5f5037bb58b5afb6738ff1d` |
| Commit date | 2026-10-04 05:26:01 -0700 |
| Commit subject | simplify pending links in io_str (#1303) |
| Version string | Bend 2.0.35 (`bend --help`) |
| Implementation | TypeScript under Bun: `bend2/bend.ts` (checker, 3,882 lines), `bend2/comp.ts` (compiler), `bend2/main.ts` (CLI), `bend2/safe.ts` (elaborator to BendTT, 1,548 lines), `bend2/bendtt.lean` (the kernel behind `--verdict`, 3,892 lines, 0 `sorry`) |

This is Bend 2. Bend 1 (HVM2, untyped) is a different system and is not what the repository ships at this commit: `README.md` Limitations states "Bend 2 is a new language. Bend 1 programs and HVM do not carry over." Bend 1 does not matter to the findings: nothing here uses the parallel runtime, and the checker, laws and kernel are Bend 2 only.

## Build from source

There is no compile step for the checker: `bend2/main.ts` runs directly under Bun. The CLI refuses to run under Node (`bend2/main.ts:896-899`). The `--verdict` path needs the BendTT kernel, which is Lean source compiled to a native binary with Lean v4.34.0 (`bend2/safe.ts:1471-1500`).

Host toolchain found: Node 20.19.4, gcc, clang 21 (`/usr/lib/llvm-21/bin`), python3 with PyYAML 6.0.2. Not found: Bun, Lean, elan, cargo. Nothing was installed outside `/tmp`.

```bash
# 1. Clone Bend
mkdir -p /tmp/bend-fidelity && cd /tmp/bend-fidelity && git clone https://github.com/bendlang/bend bend
cd bend && git checkout 565d7fdec289b1f2f5f5037bb58b5afb6738ff1d

# 2. Bun 1.4.0, the version Bend's own CI pins (.github/workflows/repo-gate.yml), from the release archive, checksum verified
mkdir -p /tmp/bend-fidelity/bun && cd /tmp/bend-fidelity/bun
curl -fsSL -o bun-linux-x64.zip https://github.com/oven-sh/bun/releases/download/bun-v1.4.0/bun-linux-x64.zip
curl -fsSL -o SHASUMS256.txt https://github.com/oven-sh/bun/releases/download/bun-v1.4.0/SHASUMS256.txt
grep ' bun-linux-x64.zip' SHASUMS256.txt | sha256sum --check   # bun-linux-x64.zip: OK
unzip -q bun-linux-x64.zip                                      # ./bun-linux-x64/bun --version -> 1.4.0

# 3. Lean 4.34.0, the version safe.ts names, from the release archive (no elan, no writes to HOME)
mkdir -p /tmp/bend-fidelity/lean && cd /tmp/bend-fidelity/lean
curl -fsSL -o lean-4.34.0-linux.tar.zst https://github.com/leanprover/lean4/releases/download/v4.34.0/lean-4.34.0-linux.tar.zst
tar --zstd -xf lean-4.34.0-linux.tar.zst                        # bin/lean --version -> Lean (version 4.34.0, ...)

# 4. The BendTT kernel binary, the two commands safe.ts runs (bend2/safe.ts:1498-1499)
mkdir -p /tmp/bend-fidelity/kernel && cp /tmp/bend-fidelity/bend/bend2/bendtt.lean /tmp/bend-fidelity/kernel/
cd /tmp/bend-fidelity/kernel
/tmp/bend-fidelity/lean/lean-4.34.0-linux/bin/lean -c bendtt.c bendtt.lean   # 16 s wall; Lean elaborates the theorems here
/tmp/bend-fidelity/lean/lean-4.34.0-linux/bin/leanc -O3 -DNDEBUG bendtt.c -o bendtt   # 4 s wall, 5.5 MB binary
```

The CLI writes a version-check record to `~/.bend/check.json` and Bun writes an install cache under `~/.bun`, so every run sets `HOME` to `/tmp/bend-fidelity/home`. `BENDTT` names the kernel binary, which keeps `safe.ts` from building and caching one under the real home (`bend2/safe.ts:1476-1486`).

## Run commands

`/tmp/bend-fidelity/bendc` is the wrapper used throughout:

```sh
#!/bin/sh
HOME=/tmp/bend-fidelity/home BENDTT=/tmp/bend-fidelity/kernel/bendtt exec /tmp/bend-fidelity/bun/bun-linux-x64/bun /tmp/bend-fidelity/bend/bend2/main.ts $1 $2 $3 $4
```

```bash
/tmp/bend-fidelity/bendc <file.bend> --check-only   # the checker (bend2/bend.ts)
/tmp/bend-fidelity/bendc <file.bend> --verdict      # the checker, then the Lean-proven kernel
/tmp/bend-fidelity/bendc <file.bend>                # check, then normalise or run main
/tmp/bend-fidelity/bendc <file.bend> -o <out>.bendtt   # the kernel's input text, with out-of-scope reasons on stderr
```

In this workspace a script under `/tmp` runs through the sandbox launcher, so the invocation is `/home/mike1/projects/dev/workflow-server/scripts/sbx /tmp/bend-fidelity/bendc <file> --check-only`; the launcher appends one `sbx:` line on a non-zero exit, which the captures below omit.

[run.sh](run.sh) checks every `.bend` of one layer and captures the output beside it:

```bash
cd <this folder>
/home/mike1/projects/dev/workflow-server/scripts/sbx bash run.sh probes
/home/mike1/projects/dev/workflow-server/scripts/sbx bash run.sh mvw
/home/mike1/projects/dev/workflow-server/scripts/sbx bash run.sh real
/home/mike1/projects/dev/workflow-server/scripts/sbx bash run.sh real/perlaw
/home/mike1/projects/dev/workflow-server/scripts/sbx bash run.sh authoring
```

Each `<layer>/out/<name>.check.txt` holds the `--check-only` output, `.verdict.txt` the `--verdict` output and `.run.txt` the run, each ending with the exit status and the wall time. Negative cases under `<layer>/negative/` get the check only. Wall times include Bun start-up on a 16-core host.

## Toolchain verification

Shipped demos, checked with the commands above:

| File | `--check-only` | `--verdict` |
|------|----------------|-------------|
| `demos/proof_insertion_sort/PROOF.bend` | ALL PROOFS CHECK, 0.13 s | ALL PROOFS CHECK, 0.12 s |
| `demos/app_win_is_bug_2d/PROOF.bend` | ALL PROOFS CHECK, 0.53 s | ALL PROOFS CHECK, 1.56 s |

## Layout

```
spike/
  README.md            this file
  run.sh               the capture runner
  probes/              11 single-fact programs about the language, with out/
  mvw/                 layer 1: the MVW specimen, 7 negatives, out/
  real/                layer 2: model.bend, gen.py, the generated data, the laws, 7 negatives, 1 finding, perlaw/, out/
  authoring/           the nine agent-written proofs of the authoring measurement, results.json, out/
```

## Layer 0: probes

Eleven programs, each pinning one fact about the compiler the design depends on. Every negative probe is refused by the checker and by the kernel alike (`probes/out/`).

| Probe | Fact | Compiler output (first lines) |
|---|---|---|
| `probe1_exhaustive` | A match must name every constructor: an unbound exit is a compile error | `expected : cases for ExAbort / observed : \{}` |
| `probe2_affine` | A plain value is consumed once | `observed : s (consumed more than once)` |
| `probe3_indexed` | A type computed by a def refuses a value of the other branch | `expected : ClearSession / observed : OpenSession` |
| `probe4_ok` | The same program, well-typed, runs | `ClearS{1}` |
| `probe5_copy_type` | A Type-kinded value cannot be marked reusable | `expected : Data / observed : Type ... +s can be used many times, so its type must be Data` |
| `probe6_unguarded` | A self-call whose arguments do not shrink is refused | `expected : a decreasing self-call (arguments are read left to right: each passed unchanged until one shrinks)` |
| `probe7_unsafe` | `@unsafe` lifts the check; the verdict then names every def that relies on it, and a plain run prints the value regardless | check and verdict: `Error: 2 defs rely on unsafe or foreign code: - spin - seven`; run: `7` |
| `probe8_fuel` | A while loop with a continuation test terminates on a shrinking bound | `3` |
| `probe9_dependent_graph` | A graph over per-activity exit types, matched in nested cases, evaluates | `Enter{Dispatch{}}` |
| `probe10_manifest_type` | A report type computed from a step list is inhabited by the right tuple | `(True{}, None{}, Unit{})` |
| `probe11_manifest_missing` | A report that gives `None` for an ungated step is refused | `expected : Bool / observed : Maybe` |

Two facts learnt by failing: constructor names are one flat namespace shared with Base (`Done{}` collides with `Result.Done`; the first `probe1` draft was refused with `a fresh constructor name (duplicate declaration: Done)`), and a `let` of a bare constructor needs an annotation (`an annotated term (cannot infer)`).

## Layer 1: the MVW specimen

[mvw/mvw.bend](mvw/mvw.bend) encodes `corpus/specimens/mvw` (one orchestrator, one activity `dispatch`, one routine `record-dispatch`, one technique `note-ran`) as a Bend program: 206 lines with comments. The definition is data and types; the server's calls are functions over an affine session value; a full walk is `main`.

| Property the brief asked for | How the type holds it | Negative case | Compiler output |
|---|---|---|---|
| Every declared exit binds to a target | `graph(a, e: ExitOf(a)) -> Destination` is a match that must be total | `neg_unbound_exit` (a second exit, unbound) | `expected : cases for Skipped` |
| A destination names a declared activity | `Enter{activity: Activity}` | `neg_unknown_destination` (`Enter{Review{}}`) | `expected : a declared constructor (Activity declares Dispatch) / observed : Review{}` |
| No transition past an open checkpoint type-checks | `next_activity` takes `Session(Clear{}, a)`; `yield_checkpoint` returns `Session(Open{}, a)` | `neg_advance_past_open` | `expected : M.Standing<M.Dispatch{}> / observed : M.Paused<M.Dispatch{}>` |
| No answer to a question that was not asked | `respond_checkpoint` takes `Session(Open{}, a)` | `neg_answer_unpaused` | `expected : M.Paused<M.Dispatch{}> / observed : M.Standing<M.Dispatch{}>` |
| Every ungated step appears in the reported run | the report has type `Manifest(steps(a))`, one slot per step, `Maybe` only where a gate may skip the step | `neg_manifest_missing` (`Unit{}`) | `expected : Sigma<&1, &1, Bool, _ => Unit> / observed : Unit` |
| An ungated step reports a value, not an absence | same type | `neg_manifest_absent_value` (`(None{}, Unit{})`) | `expected : Bool / observed : Maybe` |
| A session is a linear value | `Standing`, `Paused`, `Ended` are Type-kinded | `neg_session_reused` (two advances from one value) | `observed : s0 (consumed more than once)` |

Results (`mvw/out/`): `--check-only` ALL PROOFS CHECK in 0.11 s; `--verdict` ALL PROOFS CHECK in 0.13 s; the run prints `Ended{}` in 0.12 s. Two laws, `dispatch_ends` and `dispatch_owes_one_bool`, are each proven by `{==}` (one line). The seven negatives are each refused in 0.10–0.12 s. Authoring: one checker error on the way (`q (consumed more than once)`: a pattern binder from an affine scrutinee is affine even when its field is Data; the fix is `case Paused{+q}`), then green; the seven negatives passed first time.

What the layer shows about the runtime: the gate, the frontier and the compare-and-swap are types here, and the compiler refuses the bad driver program. That refusal is for code the checker sees. The MCP caller is a language model; the server must still decode its JSON and refuse at runtime, which it does today.

## Layer 2: one real activity

### The choice

`corpus/work-package/activities/10-post-impl-review.yaml` (377 lines) is the only real activity in the corpus that carries every construct the brief asked for at once: four checkpoints (`file-index-table`, `rationale-attestation`, the soft `block-interview#{current_block_index}` inside a loop, the conditional `local-validation-permission`), a `forEach` loop and a `while` loop with an or-form `continueWhile` and `maxIterations: 3`, eleven `when`-gated steps, a `validate` action, and a child dispatch (`dispatch-prism` binds `workflow-engine::handle-sub-workflow`; `walk-prism-child` binds the 328-line `meta/routines/activity-loop.yaml`). It binds ten techniques across three namespaces (`work-package`, `meta`, `prism`) and one routine from `support/gitnexus`, so the binding rules it exercises are the corpus's hardest. Child dispatch is a technique and a routine binding here; the child's own walk is the routine's body, which the model treats as a step with inputs and outputs, since that is what the loader splices.

### The model and the generator

[real/model.bend](real/model.bend) (518 lines, 365 without comments; 38 defs and laws) defines the activity as data (`Activity`, `Step` with five constructors, `Opt`, `Exit`, `Decl`) and six checks over it, plus the report type and a terminating loop. [real/gen.py](real/gen.py) (476 lines) translates an activity YAML, with the techniques and routines it binds, into that data: [real/post_impl_review_data.bend](real/post_impl_review_data.bend) is 57 generated lines (18 top-level steps, 26 writes, 23 reads, 63 ambient names). The generator's rules mirror the server's and cite them in its header; agreeing with the server took four rounds:

| Round | What the real activity exposed | Server rule adopted |
|---|---|---|
| 1 | `parent_session_index`, `session_index` read by orchestrator techniques, declared nowhere | the orchestrator's inputs and meta's activity reads are ambient (`activity-variables.ts:755-800`), plus the seeded names (`eager-client.ts:53-57`) and ambient context ids (`binding-provenance.ts:36`) |
| 2 | `requirements`, `pr_number`, eight more declared reads consumed by no own input | inputs inherited from an ancestor `TECHNIQUE.md` are composed into the signature (`technique-loader.ts` composeLoaded) and are ambient context, counted as reads only where the activity declares them (`check-binding-fidelity.ts:1005-1006`) |
| 3 | `workflow_id: prism` read as a variable `prism` | a bare `inputs:` value that names no bag entry is a literal (`binding-provenance.ts:445-451`) |
| 4 | `base_branch`, `commit_sha`, `push_remote` consumed only as `{tokens}` in technique prose | a `{name}` token in a bound technique's body is a read (`check-binding-fidelity.ts:609-637`); a technique's own declared inputs and outputs are not prose reads |

The generator prints a note at every site where the server's grammar makes a reading ambiguous. On the real activity: `walk-prism-child` passes `session_index: child_session_index` and `initial_activity: child_initial_activity` as bare values, literals by `activity.schema.json`'s rule for `with`, though the author evidently means variables; and `read-prism-manifest` binds `output_path`, an input `prism/read-run-manifest.md` does not declare.

### The laws

[real/post_impl_review.bend](real/post_impl_review.bend) states seven laws. Every proof is `{==}`: the check normalises to `True{}`. "Replaces" names the mechanism that polices the same invariant today; "rests on" says which Bend component the guarantee depends on.

| Law | States | Replaces today | Lines of proof | Checker | Kernel | Rests on |
|---|---|---|---|---|---|---|
| `reads_resolve` | every consulted name is a declared read, a declared write, a produced name, or ambient | `check-activity-variables` undeclared-use (warns in CI) | 1 | ALL PROOFS CHECK, 0.94 s alone | **out of fuel**, 7.85 s | checker |
| `no_orphan_input` | every bound technique or routine input names something the bag holds | `check-binding-fidelity` orphan-input (warns in CI) | 1 | 0.73 s | **out of fuel**, 6.91 s | checker |
| `reads_used` | every declared read is consulted | `check-activity-variables` unused-declaration | 1 | 0.26 s | ALL PROOFS CHECK, 1.04 s | kernel |
| `writes_produced` | every declared write is produced | `check-activity-variables` unused-declaration | 1 | 0.28 s | ALL PROOFS CHECK, 0.92 s | kernel |
| `loops_bounded` | every loop declares `maxIterations` | nothing: the field is optional and unread | 1 | 0.13 s | ALL PROOFS CHECK, 0.27 s | kernel |
| `option_exits_declared` | every option-selected exit is declared | the loader (fails the load) | 1 | 0.13 s | ALL PROOFS CHECK, 0.26 s | kernel |
| `fix_cycle_settles` | the review-fix cycle, run on its bound of 3, ends with no actionable findings | nothing: the server never runs a loop | 1 | (in the file) | (in the file) | checker's descent rule, for termination |

The whole laws file: `--check-only` ALL PROOFS CHECK in 3.11 s; the run prints `FixState{False{}, False{}}`; `--verdict` prints the generic mismatch text after 13.4 s. `-o` writes a 437-line, 360 KB `.bendtt` with no out-of-scope def, and the kernel alone reports `In reads_resolve: out of fuel` in 8.7 s (`FUEL = 400000000` per check, `bendtt.lean:143-145`). The per-law files under [real/perlaw/](real/perlaw/) separate the two kernel failures from the four kernel passes (`real/perlaw/out/`).

Behind each one-line proof is the model: `reads_resolve` is about 60 lines of model code (`consults_steps`, `produces_steps`, `bag_names`, `missing`, `has`, `all_in`), written once for every activity.

The stricter rule a checker makes cheap to state, `reads_resolve_in_order` (a name may be consulted only after a step that produces it), is six lines more. On the real activity it flags one name, `run_status`: a `validate` action reads it in the same step whose technique produces it, which is the model's step granularity rather than a corpus defect ([real/diag.bend](real/diag.bend) prints the lists).

### The negative cases

[real/negative/make.py](real/negative/make.py) applies one deliberate defect to a copy of the YAML and runs the generator, so each negative is the real activity minus one fact. Each law file under `real/negative/` imports its data and states the law the defect breaks.

| Case | Defect | Today | Result (`real/out/`) |
|---|---|---|---|
| `neg_unbounded_loop` | `review-fix-cycle` loses `maxIterations` | nothing checks it | `loops_bounded`: `expected : False{} / observed : True{}` at `{==}` |
| `neg_orphan_input` | `findings_to_classify: "{manual_diff_review_repor}"`, a braced misspelling | orphan-input warning | `no_orphan_input` fails at `{==}` |
| `neg_undeclared_read` | a gate `review_budget_remaining == true` on a step | undeclared-use warning | `reads_resolve` fails at `{==}` |
| `neg_unused_read` | `reviewer_handle` added to `reads` | unused-declaration warning | `reads_used` fails at `{==}` |
| `neg_unproduced_write` | `review_verdict` added to `writes` | unused-declaration warning | `writes_produced` fails at `{==}` |
| `neg_option_exit_undeclared` | an option selects `exit: escalate` | the load fails | `option_exits_declared` fails at `{==}` |
| `neg_loop_without_bound` (hand-written) | the cycle as the corpus states it: run while the test holds | nothing | `expected : a decreasing self-call ... / observed : run_until_settled` |

Each failing law reports `expected : False{} / observed : True{}` with the law's name and the `{==}` underlined, and nothing else: the message names the law, not the defect. Finding the defect means evaluating the model's diagnostic lists, which is what `diag.bend` does.

### The finding

[real/finding_bare_rename_typo.bend](real/finding_bare_rename_typo.bend) applies the same misspelling as `neg_orphan_input` as a **bare** value, `findings_to_classify: manual_diff_review_repor`. The law holds and the run prints `True{}`: by the server's grammar a bare value that names no bag entry is a literal string, so the step's input is bound to the text `manual_diff_review_repor` and no server check or guard can see the typo. A typed definition language has no such ambiguity, since a variable reference and a string literal are different terms. The grammar, not any checker, is what makes the defect undetectable today.

## Layer 3: negative cases per law

Every law above has a broken variant beside it: 7 under `mvw/negative/`, 7 under `real/negative/`, 7 probe refusals. Every variant fails to compile or fails at its `{==}`, and the compiler's actual output is captured under the layer's `out/`. No law accepted a broken variant.

## Authoring cost

Two measurements, both on this model.

**The investigator's own trail.** Probes: 2 of 11 needed a second attempt (the global constructor namespace; the un-inferrable `let`). MVW: 1 checker error, then green. `model.bend`: 6 checker-error rounds across its growth: `steps` consumed twice (fix `+steps`); `ds` consumed twice (`+ds`); an erased `-T: Type` used live in a type-returning def (`T: Type`); `rest` consumed twice in `missing` (`+tail = ...`); a forward reference (`unresolved_in_order` calling `unresolved_steps` defined below it, which Bend refuses as "an unfilled law is a dead claim"); and the restructuring of `run_while` because a match on a computed value is not allowed and a closure may be called once, so the test and body became templates over a Data state. None of the six was a logical error; each was a quantity, order or syntax rule the guide states and the message named. The generator took four calibration rounds against the server's rules, which were not Bend errors.

**Nine independent agents, three tasks, three agents each** ([authoring/](authoring/), [authoring/results.json](authoring/results.json)). Each agent received the model, the guide's relevant sections, one shipped proof, the run commands, and a list of six Bend facts the investigator had learnt by failing (no match on a computed value; `+x` to use a pattern binder twice; defs call only defs above; closed template arguments; the proof forms; the rewrite direction). Attempts count checker runs on the proof file; several agents counted their verdict run as a second attempt.

| Task | What it asked for | Agent | Attempts | Checker errors | Lines | Check | Verdict |
|---|---|---|---|---|---|---|---|
| T1 computation | a small activity as data and three laws by `{==}` | 1, 2, 3 | 1, 2, 1 | 0, 0, 0 | 40, 44, 55 | 0.14 s | pass |
| T2 induction | `all_in(xs ++ ys) == all_in(xs) && all_in(ys)`, with a Bool lemma Base lacks | 1, 2, 3 | 2, 2, 1 | 1, 0, 0 | 37, 40, 37 | 0.13 s | pass |
| T3 soundness | `all_in(xs, env) == List.is_empty(missing(xs, env))`, through `Bool.pick` | 1, 2, 3 | 1, 1, 2 | 0, 0, 0 | 30, 30, 30 | 0.13 s | pass |

Nine of nine succeeded under the checker and under the kernel; the investigator re-ran every returned file under [run.sh](run.sh) (`authoring/out/`). The one checker error in nine trails was a quantity error (`ys (consumed more than once)`: the law's affine binder passed to a lemma and to the induction hypothesis), fixed by erasing the lemma's unmatched binders. Every T2 and T3 proof needed one helper def: an associativity lemma for `Bool.and`, or a `.fin` helper that takes the computed verdict as a parameter, the idiom the shipped insertion-sort proof uses because a computed value cannot be matched in place. Three agents said the rewrite direction (`%e : P` replaces `e`'s right side with its left) was the one thing to pin down first; all nine judged the result maintainable after a model change so long as the helpers keep matching on their first argument.

What the measurement does and does not say. It says that an agent given the model, the guide and the six facts writes a 30–55-line Bend proof of a small lemma over list and Bool functions in one or two attempts, and that the kernel confirms such proofs. It does not say what a 484-line proof costs: the shipped `app_win_is_bug_2d` proves two four-line laws in 484 lines of proof kit, certificates and index lemmas (proof-authoring map), and no spike law needed more than one helper. The laws that retire guards are proofs by computation; the inductive laws are the ones that cost, and the fidelity system does not need them.

## What rests where

| Guarantee | Rests on |
|---|---|
| MVW: graph totality, gate typing, manifest typing, session affinity, both laws | checker and kernel agree (`mvw/out/mvw.verdict.txt`) |
| Real: `reads_used`, `writes_produced`, `loops_bounded`, `option_exits_declared` | checker and kernel agree (`real/perlaw/out/`) |
| Real: `reads_resolve`, `no_orphan_input` | the checker alone; the kernel runs out of fuel |
| Real: `fix_cycle_settles` and the termination of `run_while` | the checker's descent rule; the kernel's live check for the file as a whole is not reached because the two laws above exhaust it first |
| Any law over a program with `@unsafe` or a user foreign effect | nothing: both the check and the verdict name the tainted defs and fail (`probes/out/probe7_unsafe.check.txt`) |
| The elaborator's translation from the checked book to the kernel's text | unproven (`bend2/safe.ts` is AI-written; `GUIDE.md:328-332` says to read the translation to confirm a law) |
