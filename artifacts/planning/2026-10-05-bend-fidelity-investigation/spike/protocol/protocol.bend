# The session protocol as an executable specification: one transition function
# `step(workflow, call, run) -> Outcome` that refuses, warns or accepts exactly
# where the server does, over a session state that is an affine value.
#
# The function mirrors src/tools/workflow-tools.ts at origin/main ab680d9d:
#
#   next_activity      resolveRetiringActivity 1006-1050; destination 1284-1294;
#                      T2 exit required off a fanning activity 1297-1304; T9 a
#                      branch return names the join 1336-1345; warnings
#                      validation.ts 37-58 (transition), 288-309 (exit),
#                      115-206 with immediateExitCut 94-113 (manifest); writes
#                      1420-1573: frontier minus the retiring entry, the
#                      destination entered only when the frontier empties,
#                      earlier visit answers forgotten on entry 788-793,
#                      `__terminal__` or `complete` completes the run.
#   yield_checkpoint   2465 refuses while a gate is open; 2475-2482 refuses with
#                      more than one activity in flight; 2495-2505 a declared
#                      id yielded with options, an unknown id without them;
#                      2526-2566 a recorded answer replays and opens no gate;
#                      2577-2582 the gate, with the worker's options for an
#                      adhoc checkpoint.
#   respond_checkpoint 2814 refuses with no gate; 2840-2853 option_id under the
#                      3 s floor; 2854-2875 option exists, reply iff the option
#                      records one; 2876-2888 auto_advance needs defaultOption
#                      and autoAdvanceMs and ceil(ms/1000) seconds; 2893-2900
#                      condition_not_met needs a condition; 2909-2963 the
#                      answer is recorded, keyed by activity and checkpoint.
#   present_checkpoint 2734-2738 refuses with no gate, changes nothing.
#   resume_checkpoint  2680-2682 refuses while a gate is open.
#   get_activity and the other content calls
#                      params.ts 68-76 the gate; resolver.ts 150-172 the
#                      frontier: a named activity must be in flight, and a
#                      name is required when more than one is.
#   dispatch_child     resource-tools.ts 663-712: no gate, no status check.
#   inspect_session, get_workflow_status
#                      read-only, ungated.
#
# What the model leaves out, deliberately: the seal, the compare-and-swap, the
# wall clock (a call carries the seconds elapsed since the gate opened, which is
# the one number the timers read), agent identities and the batch bound,
# variable values and their types, instance fans, and the trace. Those are
# effects or bookkeeping over agent-supplied identities, and the oracle's
# subject is the protocol's control flow.
#
# The state is Type-kinded, so a run is consumed by the one call that takes it:
# a driver that uses a run twice does not compile (negative/neg_run_reused.bend).
# Every refusal and warning is a constructor, so a differential test can compare
# the oracle's verdict with the server's by name.

import Base

# Strings
# =======

def terminal() -> String:
  "__terminal__"

def has_str(xs: List<&2, String>, +x: String) -> Bool:
  match xs:
    case Nil{}:
      False{}
    case h <> t:
      Bool.or(String.eq(h, x), has_str(t, x))

def remove_str(xs: List<&2, String>, +x: String) -> List<&2, String>:
  match xs:
    case Nil{}:
      Nil{}
    case +h <> t:
      +rest = remove_str(t, x)
      Bool.pick(List<&2, String>, String.eq(h, x), rest, h <> rest)

# the names of xs that env lacks
def missing_from(xs: List<&2, String>, +env: List<&2, String>) -> List<&2, String>:
  match xs:
    case Nil{}:
      Nil{}
    case +x <> rest:
      +tail = missing_from(rest, env)
      Bool.pick(List<&2, String>, has_str(env, x), tail, x <> tail)

def all_in(xs: List<&2, String>, +env: List<&2, String>) -> Bool:
  List.is_empty(&2, String, missing_from(xs, env))

def same_set(+xs: List<&2, String>, +ys: List<&2, String>) -> Bool:
  Bool.and(all_in(xs, ys), all_in(ys, xs))

# xs is exactly [x]
def is_single(xs: List<&2, String>, +x: String) -> Bool:
  match xs:
    case Nil{}:
      False{}
    case h <> t:
      match t:
        case Nil{}:
          String.eq(h, x)
        case h2 <> t2:
          False{}

def head_or_empty(xs: List<&2, String>) -> String:
  match xs:
    case Nil{}:
      ""
    case h <> t:
      h

# The definition
# ==============

# where an exit leads: the terminal, one activity, or the branches of a fan
type Dest is Data:
  DTerminal{}
  DEnter{activity: String}
  DFan{branches: List<&2, String>}

# one row of workflow.yaml's graph
type Binding is Data:
  Binding{activity: String, exit: String, dest: Dest}

# a checkpoint option: the exit it selects, and whether it records a typed reply
type CpOption is Data:
  CpOption{id: String, exit: Maybe<&2, String>, records_reply: Bool}

# a declared checkpoint: soft when it has a defaultOption and autoAdvanceMs,
# dismissible when it carries a condition
type Checkpoint is Data:
  Checkpoint{id: String, options: List<&2, CpOption>, default_option: Maybe<&2, String>, auto_advance_ms: Maybe<&2, Nat>, conditional: Bool}

# a top-level step: gated when a when, condition or continueWhile may skip it;
# a loop carries its body's ids, which a manifest may name any number of times
type StepDef is Data:
  SPlain{id: String, gated: Bool}
  SCheckpoint{id: String, gated: Bool, checkpoint: Checkpoint}
  SLoop{id: String, gated: Bool, body: List<&2, String>}

type ExitDef is Data:
  ExitDef{id: String, immediate: Bool}

type ActivityDef is Data:
  ActivityDef{id: String, steps: List<&2, StepDef>, exits: List<&2, ExitDef>}

type Workflow is Data:
  Workflow{initial: String, activities: List<&2, ActivityDef>, graph: List<&2, Binding>}

def initial_of(w: Workflow) -> String:
  match w:
    case Workflow{initial, acts, graph}:
      initial

def acts_of(w: Workflow) -> List<&2, ActivityDef>:
  match w:
    case Workflow{initial, acts, graph}:
      acts

def graph_of(w: Workflow) -> List<&2, Binding>:
  match w:
    case Workflow{initial, acts, graph}:
      graph

def dest_targets(d: Dest) -> List<&2, String>:
  match d:
    case DTerminal{}:
      [terminal()]
    case DEnter{a}:
      [a]
    case DFan{bs}:
      bs

def dest_is_fan(d: Dest) -> Bool:
  match d:
    case DTerminal{}:
      False{}
    case DEnter{a}:
      False{}
    case DFan{bs}:
      True{}

def find_activity(acts: List<&2, ActivityDef>, +id: String) -> Maybe<&2, ActivityDef>:
  match acts:
    case Nil{}:
      None{}
    case +a <> rest:
      match a:
        case ActivityDef{+aid, steps, exits}:
          Bool.pick(Maybe<&2, ActivityDef>, String.eq(aid, id), Some{a}, find_activity(rest, id))

def activity_exists(acts: List<&2, ActivityDef>, +id: String) -> Bool:
  Maybe.is_some(&2, ActivityDef, find_activity(acts, id))

# every target is the terminal or a declared activity
def targets_exist(+acts: List<&2, ActivityDef>, ts: List<&2, String>) -> Bool:
  match ts:
    case Nil{}:
      True{}
    case +t <> rest:
      Bool.and(Bool.or(String.eq(t, terminal()), activity_exists(acts, t)), targets_exist(acts, rest))

def steps_of_fin(m: Maybe<&2, ActivityDef>) -> List<&2, StepDef>:
  match m:
    case None{}:
      Nil{}
    case Some{a}:
      match a:
        case ActivityDef{id, steps, exits}:
          steps

def steps_of(acts: List<&2, ActivityDef>, +id: String) -> List<&2, StepDef>:
  steps_of_fin(find_activity(acts, id))

# the graph rows of one activity
def bindings_of(g: List<&2, Binding>, +activity: String) -> List<&2, Binding>:
  match g:
    case Nil{}:
      Nil{}
    case +b <> rest:
      match b:
        case Binding{+act, exit, dest}:
          +tail = bindings_of(rest, activity)
          Bool.pick(List<&2, Binding>, String.eq(act, activity), b <> tail, tail)

# the destination an activity's exit binds, among that activity's rows
def bound_dest(bs: List<&2, Binding>, +exit: String) -> Maybe<&2, Dest>:
  match bs:
    case Nil{}:
      None{}
    case b <> rest:
      match b:
        case Binding{act, +ex, +dest}:
          Bool.pick(Maybe<&2, Dest>, String.eq(ex, exit), Some{dest}, bound_dest(rest, exit))

def has_fan_binding(bs: List<&2, Binding>) -> Bool:
  match bs:
    case Nil{}:
      False{}
    case b <> rest:
      match b:
        case Binding{act, ex, dest}:
          Bool.or(dest_is_fan(dest), has_fan_binding(rest))

def all_exit_targets(bs: List<&2, Binding>) -> List<&2, String>:
  match bs:
    case Nil{}:
      Nil{}
    case b <> rest:
      match b:
        case Binding{act, ex, dest}:
          List.append(&2, String, dest_targets(dest), all_exit_targets(rest))

def fan_has_branch(d: Dest, +b: String) -> Bool:
  match d:
    case DTerminal{}:
      False{}
    case DEnter{a}:
      False{}
    case DFan{bs}:
      has_str(bs, b)

# whether some graph row fans out to this activity
def in_a_fan(g: List<&2, Binding>, +branch: String) -> Bool:
  match g:
    case Nil{}:
      False{}
    case b <> rest:
      match b:
        case Binding{act, ex, dest}:
          Bool.or(fan_has_branch(dest, branch), in_a_fan(rest, branch))

def first_enter(bs: List<&2, Binding>) -> Maybe<&2, String>:
  match bs:
    case Nil{}:
      None{}
    case b <> rest:
      match b:
        case Binding{act, ex, dest}:
          match dest:
            case DEnter{a}:
              Some{a}
            case DTerminal{}:
              first_enter(rest)
            case DFan{bs2}:
              first_enter(rest)

# the join a branch converges on: the load binds every branch exit to one
# activity, so the first row that enters one names it
def join_of(g: List<&2, Binding>, +branch: String) -> Maybe<&2, String>:
  first_enter(bindings_of(g, branch))

def find_checkpoint(ss: List<&2, StepDef>, +id: String) -> Maybe<&2, Checkpoint>:
  match ss:
    case Nil{}:
      None{}
    case s <> rest:
      match s:
        case SCheckpoint{+sid, gated, +cp}:
          Bool.pick(Maybe<&2, Checkpoint>, String.eq(sid, id), Some{cp}, find_checkpoint(rest, id))
        case SPlain{sid, gated}:
          find_checkpoint(rest, id)
        case SLoop{sid, gated, body}:
          find_checkpoint(rest, id)

def find_option(os: List<&2, CpOption>, +id: String) -> Maybe<&2, CpOption>:
  match os:
    case Nil{}:
      None{}
    case +o <> rest:
      match o:
        case CpOption{+oid, exit, records}:
          Bool.pick(Maybe<&2, CpOption>, String.eq(oid, id), Some{o}, find_option(rest, id))

def step_id(s: StepDef) -> String:
  match s:
    case SPlain{id, gated}:
      id
    case SCheckpoint{id, gated, cp}:
      id
    case SLoop{id, gated, body}:
      id

def step_gated(s: StepDef) -> Bool:
  match s:
    case SPlain{id, gated}:
      gated
    case SCheckpoint{id, gated, cp}:
      gated
    case SLoop{id, gated, body}:
      gated

# every id a manifest may name: the top-level steps and the loop bodies
def known_ids(ss: List<&2, StepDef>) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case s <> rest:
      match s:
        case SPlain{id, gated}:
          id <> known_ids(rest)
        case SCheckpoint{id, gated, cp}:
          id <> known_ids(rest)
        case SLoop{id, gated, body}:
          id <> List.append(&2, String, body, known_ids(rest))

def index_of(ss: List<&2, StepDef>, +id: String, i: Nat) -> Maybe<&2, Nat>:
  match ss:
    case Nil{}:
      None{}
    case s <> rest:
      Bool.pick(Maybe<&2, Nat>, String.eq(step_id(s), id), Some{i}, index_of(rest, id, 1n+i))

# The run
# =======

# a recorded checkpoint answer, keyed by activity and checkpoint
type Answer is Data:
  Answer{activity: String, checkpoint: String, option: String, exit: Maybe<&2, String>}

# whether a checkpoint is open; an adhoc gate carries the worker's own options
type Gate is Data:
  GClear{}
  GOpen{activity: String, checkpoint: String, adhoc: Maybe<&2, List<&2, CpOption>>}

type Status is Data:
  Running{}
  Completed{}

# the session the server holds, less what the model leaves out. Type-kinded:
# one owner, consumed by the call that takes it.
type Run is Type:
  Run{frontier: List<&2, String>, gate: Gate, answers: List<&2, Answer>, status: Status, children: Nat}

def start(w: Workflow) -> Run:
  Run{[initial_of(w)], GClear{}, Nil{}, Running{}, 0n}

# how respond_checkpoint answers: by option, with or without a typed reply; by
# the soft checkpoint's default; by dismissing a conditional checkpoint
type Mode is Data:
  ByOption{id: String, with_reply: Bool}
  AutoAdvance{}
  ConditionNotMet{}

# the calls, with the arguments the protocol reads. `claimed` is the activity
# the caller names as its destination; `elapsed` the seconds since the gate opened.
type Call is Data:
  Advance{from: Maybe<&2, String>, exit: Maybe<&2, String>, claimed: String, manifest: List<&2, String>}
  Yield{checkpoint: String, adhoc: Maybe<&2, List<&2, CpOption>>}
  Present{}
  Respond{mode: Mode, elapsed: Nat}
  Resume{}
  Deliver{activity: Maybe<&2, String>}
  DispatchChild{}
  Diagnose{}

# why a call is refused, one constructor per server refusal the model reaches
type Refusal is Data:
  GateOpen{}
  NotOnActivity{}
  FromRequired{}
  ActivityNotFound{}
  ExitRequiredForFan{}
  BranchMustNameJoin{}
  NoCheckpointOpen{}
  TooFast{}
  InvalidOption{}
  ReplyRequired{}
  ReplyRefused{}
  HardCheckpoint{}
  TimerNotElapsed{}
  NotConditional{}
  FrontierAmbiguous{}
  DeclaredYieldedAdhoc{}
  CheckpointNotFound{}
  NoActivityInFlight{}
  NotDispatchedFor{}
  ActivityIdRequired{}
  NoActiveToPresent{}

# what an accepted advance warns about, one constructor per advisory layer
type Warning is Data:
  WTransition{}
  WExitUnbound{}
  WExitClaimDisagrees{}
  WManifestMissing{missing: List<&2, String>}
  WManifestUnknown{unknown: List<&2, String>}

type Outcome is Type:
  Refused{why: Refusal}
  Accepted{run: Run, warnings: List<&2, Warning>, replayed: Bool}

def pick_refusal(c: Bool, why: Refusal, otherwise: Maybe<&2, Refusal>) -> Maybe<&2, Refusal>:
  Bool.pick(Maybe<&2, Refusal>, c, Some{why}, otherwise)

# Answers and the manifest
# ========================

def answered(ans: List<&2, Answer>, +activity: String, +checkpoint: String) -> Bool:
  match ans:
    case Nil{}:
      False{}
    case a <> rest:
      match a:
        case Answer{act, cp, opt, ex}:
          Bool.or(Bool.and(String.eq(act, activity), String.eq(cp, checkpoint)), answered(rest, activity, checkpoint))

# entering an activity forgets the answers its earlier visits recorded
def forget_answers(ans: List<&2, Answer>, +activity: String) -> List<&2, Answer>:
  match ans:
    case Nil{}:
      Nil{}
    case +a <> rest:
      match a:
        case Answer{act, cp, opt, ex}:
          +tail = forget_answers(rest, activity)
          Bool.pick(List<&2, Answer>, String.eq(act, activity), tail, a <> tail)

def forget_all(bs: List<&2, String>, ans: List<&2, Answer>) -> List<&2, Answer>:
  match bs:
    case Nil{}:
      ans
    case b <> rest:
      forget_all(rest, forget_answers(ans, b))

def immediate_exits(es: List<&2, ExitDef>) -> List<&2, String>:
  match es:
    case Nil{}:
      Nil{}
    case e <> rest:
      match e:
        case ExitDef{+id, imm}:
          +tail = immediate_exits(rest)
          Bool.pick(List<&2, String>, imm, id <> tail, tail)

def min_maybe(a: Maybe<&2, Nat>, b: Maybe<&2, Nat>) -> Maybe<&2, Nat>:
  match a:
    case None{}:
      b
    case Some{x}:
      match b:
        case None{}:
          Some{x}
        case Some{y}:
          Some{Nat.min(x, y)}

# the earliest top-level index of a checkpoint whose recorded answer, in this
# activity, selected an immediate exit (validation.ts immediateExitCut)
def cut_index(+ss: List<&2, StepDef>, +immediates: List<&2, String>, +activity: String, ans: List<&2, Answer>) -> Maybe<&2, Nat>:
  match ans:
    case Nil{}:
      None{}
    case a <> rest:
      match a:
        case Answer{act, cp, opt, ex}:
          match ex:
            case None{}:
              cut_index(ss, immediates, activity, rest)
            case Some{e}:
              +tail = cut_index(ss, immediates, activity, rest)
              Bool.pick(Maybe<&2, Nat>, Bool.and(String.eq(act, activity), has_str(immediates, e)), min_maybe(index_of(ss, cp, 0n), tail), tail)

def within_cut(cut: Maybe<&2, Nat>, +i: Nat) -> Bool:
  match cut:
    case None{}:
      True{}
    case Some{c}:
      Nat.is_le(i, c)

# the ungated top-level steps a manifest must name, up to the immediate cut
def required_ids(ss: List<&2, StepDef>, +cut: Maybe<&2, Nat>, +i: Nat) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case +s <> rest:
      +tail = required_ids(rest, cut, 1n+i)
      Bool.pick(List<&2, String>, Bool.and(Bool.not(step_gated(s)), within_cut(cut, i)), step_id(s) <> tail, tail)

def warn_missing(xs: List<&2, String>) -> List<&2, Warning>:
  match xs:
    case Nil{}:
      Nil{}
    case h <> t:
      [WManifestMissing{h <> t}]

def warn_unknown(xs: List<&2, String>) -> List<&2, Warning>:
  match xs:
    case Nil{}:
      Nil{}
    case h <> t:
      [WManifestUnknown{h <> t}]

def manifest_warnings(a: ActivityDef, +answers: List<&2, Answer>, +manifest: List<&2, String>) -> List<&2, Warning>:
  match a:
    case ActivityDef{+id, +steps, exits}:
      cut = cut_index(steps, immediate_exits(exits), id, answers)
      required = required_ids(steps, cut, 0n)
      List.append(&2, Warning, warn_missing(missing_from(required, manifest)), warn_unknown(missing_from(manifest, known_ids(steps))))

def manifest_warnings_fin(m: Maybe<&2, ActivityDef>, +answers: List<&2, Answer>, +manifest: List<&2, String>) -> List<&2, Warning>:
  match m:
    case None{}:
      Nil{}
    case Some{a}:
      manifest_warnings(a, answers, manifest)

def manifest_warnings_for(+acts: List<&2, ActivityDef>, retiring: Maybe<&2, String>, +answers: List<&2, Answer>, +manifest: List<&2, String>) -> List<&2, Warning>:
  match retiring:
    case None{}:
      Nil{}
    case Some{r}:
      manifest_warnings_fin(find_activity(acts, r), answers, manifest)

# Advance
# =======

# the activity the call retires: named and in flight, or none on a first call
def resolve_retiring(from: Maybe<&2, String>, +frontier: List<&2, String>) -> Result<&2, &2, Refusal, Maybe<&2, String>>:
  match from:
    case Some{+f}:
      Bool.pick(Result<&2, &2, Refusal, Maybe<&2, String>>, has_str(frontier, f), Done{Some{f}}, Fail{NotOnActivity{}})
    case None{}:
      match frontier:
        case Nil{}:
          Done{None{}}
        case h <> t:
          Fail{FromRequired{}}

def claimed_dest(+claimed: String) -> Dest:
  Bool.pick(Dest, String.eq(claimed, terminal()), DTerminal{}, DEnter{claimed})

def destination_fin(bound: Maybe<&2, Dest>, +claimed: String) -> Dest:
  match bound:
    case Some{d}:
      d
    case None{}:
      claimed_dest(claimed)

# the graph's binding of the retiring activity's exit, else the caller's claim
def destination(+graph: List<&2, Binding>, retiring: Maybe<&2, String>, exit: Maybe<&2, String>, +claimed: String) -> Dest:
  match retiring:
    case None{}:
      claimed_dest(claimed)
    case Some{r}:
      match exit:
        case None{}:
          claimed_dest(claimed)
        case Some{e}:
          destination_fin(bound_dest(bindings_of(graph, r), e), claimed)

def exit_required_for_fan(+graph: List<&2, Binding>, retiring: Maybe<&2, String>, exit: Maybe<&2, String>) -> Bool:
  match retiring:
    case None{}:
      False{}
    case Some{r}:
      match exit:
        case Some{e}:
          False{}
        case None{}:
          has_fan_binding(bindings_of(graph, r))

def join_mismatch(j: Maybe<&2, String>, +targets: List<&2, String>) -> Bool:
  match j:
    case None{}:
      False{}
    case Some{jn}:
      Bool.not(is_single(targets, jn))

def branch_misnames_join(+graph: List<&2, Binding>, retiring: Maybe<&2, String>, +targets: List<&2, String>) -> Bool:
  match retiring:
    case None{}:
      False{}
    case Some{+r}:
      Bool.and(in_a_fan(graph, r), join_mismatch(join_of(graph, r), targets))

def first_refusal(+acts: List<&2, ActivityDef>, +graph: List<&2, Binding>, +retiring: Maybe<&2, String>, exit: Maybe<&2, String>, +targets: List<&2, String>) -> Maybe<&2, Refusal>:
  pick_refusal(Bool.not(targets_exist(acts, targets)), ActivityNotFound{},
    pick_refusal(exit_required_for_fan(graph, retiring, exit), ExitRequiredForFan{},
      pick_refusal(branch_misnames_join(graph, retiring, targets), BranchMustNameJoin{}, None{})))

def transition_warnings(+initial: String, +graph: List<&2, Binding>, retiring: Maybe<&2, String>, +targets: List<&2, String>) -> List<&2, Warning>:
  match retiring:
    case None{}:
      Bool.pick(List<&2, Warning>, is_single(targets, initial), Nil{}, [WTransition{}])
    case Some{+r}:
      +valid = all_exit_targets(bindings_of(graph, r))
      Bool.pick(List<&2, Warning>,
        Bool.or(List.is_empty(&2, String, valid),
          Bool.or(all_in(targets, valid),
            Bool.or(is_single(targets, r), is_single(targets, terminal())))),
        Nil{}, [WTransition{}])

def exit_warning_fin(b: Maybe<&2, Dest>, +targets: List<&2, String>) -> List<&2, Warning>:
  match b:
    case None{}:
      [WExitUnbound{}]
    case Some{d}:
      Bool.pick(List<&2, Warning>, same_set(dest_targets(d), targets), Nil{}, [WExitClaimDisagrees{}])

def exit_warnings(+graph: List<&2, Binding>, retiring: Maybe<&2, String>, exit: Maybe<&2, String>, +targets: List<&2, String>) -> List<&2, Warning>:
  match retiring:
    case None{}:
      Nil{}
    case Some{r}:
      match exit:
        case None{}:
          Nil{}
        case Some{e}:
          exit_warning_fin(bound_dest(bindings_of(graph, r), e), targets)

def frontier_after(frontier: List<&2, String>, retiring: Maybe<&2, String>) -> List<&2, String>:
  match retiring:
    case None{}:
      frontier
    case Some{r}:
      remove_str(frontier, r)

def complete_if_marker(+a: String, status: Status) -> Status:
  Bool.pick(Status, String.eq(a, "complete"), Completed{}, status)

# the destination is entered only by the call that empties the frontier
def enter_fin(empty: Bool, dest: Dest, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat, warnings: List<&2, Warning>) -> Outcome:
  match empty:
    case False{}:
      Accepted{Run{frontier, GClear{}, answers, status, children}, warnings, False{}}
    case True{}:
      match dest:
        case DTerminal{}:
          Accepted{Run{Nil{}, GClear{}, answers, Completed{}, children}, warnings, False{}}
        case DEnter{+a}:
          Accepted{Run{[a], GClear{}, forget_answers(answers, a), complete_if_marker(a, status), children}, warnings, False{}}
        case DFan{+bs}:
          Accepted{Run{bs, GClear{}, forget_all(bs, answers), status, children}, warnings, False{}}

def enter(dest: Dest, +frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat, warnings: List<&2, Warning>) -> Outcome:
  enter_fin(List.is_empty(&2, String, frontier), dest, frontier, answers, status, children, warnings)

def advance_fin(mr: Maybe<&2, Refusal>, +w: Workflow, +retiring: Maybe<&2, String>, exit: Maybe<&2, String>, +manifest: List<&2, String>, +frontier: List<&2, String>, +answers: List<&2, Answer>, status: Status, children: Nat, dest: Dest, +targets: List<&2, String>) -> Outcome:
  match mr:
    case Some{why}:
      Refused{why}
    case None{}:
      warnings = List.append(&2, Warning, transition_warnings(initial_of(w), graph_of(w), retiring, targets),
        List.append(&2, Warning, exit_warnings(graph_of(w), retiring, exit, targets),
          manifest_warnings_for(acts_of(w), retiring, answers, manifest)))
      enter(dest, frontier_after(frontier, retiring), answers, status, children, warnings)

def advance_retiring(res: Result<&2, &2, Refusal, Maybe<&2, String>>, +w: Workflow, +exit: Maybe<&2, String>, +claimed: String, +manifest: List<&2, String>, +frontier: List<&2, String>, +answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match res:
    case Fail{why}:
      Refused{why}
    case Done{+retiring}:
      +dest = destination(graph_of(w), retiring, exit, claimed)
      +targets = dest_targets(dest)
      advance_fin(first_refusal(acts_of(w), graph_of(w), retiring, exit, targets), w, retiring, exit, manifest, frontier, answers, status, children, dest, targets)

def advance(+w: Workflow, from: Maybe<&2, String>, +exit: Maybe<&2, String>, +claimed: String, +manifest: List<&2, String>, r: Run) -> Outcome:
  match r:
    case Run{+frontier, gate, +answers, status, children}:
      match gate:
        case GOpen{a, c, ad}:
          Refused{GateOpen{}}
        case GClear{}:
          advance_retiring(resolve_retiring(from, frontier), w, exit, claimed, manifest, frontier, answers, status, children)

# Yield
# =====

def yield_replay(prior: Bool, adhoc: Maybe<&2, List<&2, CpOption>>, +activity: String, +checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match prior:
    case True{}:
      Accepted{Run{frontier, GClear{}, answers, status, children}, Nil{}, True{}}
    case False{}:
      Accepted{Run{frontier, GOpen{activity, checkpoint, adhoc}, answers, status, children}, Nil{}, False{}}

def yield_open(adhoc: Maybe<&2, List<&2, CpOption>>, +activity: String, +checkpoint: String, frontier: List<&2, String>, +answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  yield_replay(answered(answers, activity, checkpoint), adhoc, activity, checkpoint, frontier, answers, status, children)

def yield_declared(declared: Maybe<&2, Checkpoint>, adhoc: Maybe<&2, List<&2, CpOption>>, +activity: String, +checkpoint: String, frontier: List<&2, String>, +answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match declared:
    case Some{cp}:
      match adhoc:
        case Some{opts}:
          Refused{DeclaredYieldedAdhoc{}}
        case None{}:
          yield_open(None{}, activity, checkpoint, frontier, answers, status, children)
    case None{}:
      match adhoc:
        case None{}:
          Refused{CheckpointNotFound{}}
        case Some{opts}:
          yield_open(Some{opts}, activity, checkpoint, frontier, answers, status, children)

def yield_sized(ambiguous: Bool, +w: Workflow, +checkpoint: String, adhoc: Maybe<&2, List<&2, CpOption>>, +frontier: List<&2, String>, +answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match ambiguous:
    case True{}:
      Refused{FrontierAmbiguous{}}
    case False{}:
      +activity = head_or_empty(frontier)
      yield_declared(find_checkpoint(steps_of(acts_of(w), activity), checkpoint), adhoc, activity, checkpoint, frontier, answers, status, children)

def yield_cp(+w: Workflow, +checkpoint: String, adhoc: Maybe<&2, List<&2, CpOption>>, r: Run) -> Outcome:
  match r:
    case Run{+frontier, gate, +answers, status, children}:
      match gate:
        case GOpen{a, c, ad}:
          Refused{GateOpen{}}
        case GClear{}:
          yield_sized(Nat.is_gt(List.length(&2, String, frontier), 1n), w, checkpoint, adhoc, frontier, answers, status, children)

# Respond
# =======

def record_answer(oid: String, exit: Maybe<&2, String>, activity: String, checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  Accepted{Run{frontier, GClear{}, Answer{activity, checkpoint, oid, exit} <> answers, status, children}, Nil{}, False{}}

def respond_reply(records: Bool, with_reply: Bool, oid: String, exit: Maybe<&2, String>, activity: String, checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match records with_reply:
    case True{} False{}:
      Refused{ReplyRequired{}}
    case False{} True{}:
      Refused{ReplyRefused{}}
    case True{} True{}:
      record_answer(oid, exit, activity, checkpoint, frontier, answers, status, children)
    case False{} False{}:
      record_answer(oid, exit, activity, checkpoint, frontier, answers, status, children)

def respond_option(too_fast: Bool, opt: Maybe<&2, CpOption>, with_reply: Bool, activity: String, checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match too_fast:
    case True{}:
      Refused{TooFast{}}
    case False{}:
      match opt:
        case None{}:
          Refused{InvalidOption{}}
        case Some{o}:
          match o:
            case CpOption{oid, exit, records}:
              respond_reply(records, with_reply, oid, exit, activity, checkpoint, frontier, answers, status, children)

def ceil_seconds(ms: Nat) -> Nat:
  Nat.div(Nat.add(ms, 999n), 1000n)

def respond_timer(too_early: Bool, opt: Maybe<&2, CpOption>, activity: String, checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match too_early:
    case True{}:
      Refused{TimerNotElapsed{}}
    case False{}:
      match opt:
        case None{}:
          Refused{InvalidOption{}}
        case Some{o}:
          match o:
            case CpOption{oid, exit, records}:
              record_answer(oid, exit, activity, checkpoint, frontier, answers, status, children)

def respond_auto(default_option: Maybe<&2, String>, auto_ms: Maybe<&2, Nat>, options: List<&2, CpOption>, +elapsed: Nat, activity: String, checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match default_option:
    case None{}:
      Refused{HardCheckpoint{}}
    case Some{+d}:
      match auto_ms:
        case None{}:
          Refused{HardCheckpoint{}}
        case Some{ms}:
          respond_timer(Nat.is_lt(elapsed, ceil_seconds(ms)), find_option(options, d), activity, checkpoint, frontier, answers, status, children)

def respond_dismiss(conditional: Bool, activity: String, checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match conditional:
    case False{}:
      Refused{NotConditional{}}
    case True{}:
      record_answer("__condition_not_met__", None{}, activity, checkpoint, frontier, answers, status, children)

def respond_cp(cp: Maybe<&2, Checkpoint>, mode: Mode, +elapsed: Nat, +activity: String, +checkpoint: String, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match cp:
    case None{}:
      Refused{CheckpointNotFound{}}
    case Some{c}:
      match c:
        case Checkpoint{cid, options, default_option, auto_ms, conditional}:
          match mode:
            case ByOption{+id, with_reply}:
              respond_option(Nat.is_lt(elapsed, 3n), find_option(options, id), with_reply, activity, checkpoint, frontier, answers, status, children)
            case AutoAdvance{}:
              respond_auto(default_option, auto_ms, options, elapsed, activity, checkpoint, frontier, answers, status, children)
            case ConditionNotMet{}:
              respond_dismiss(conditional, activity, checkpoint, frontier, answers, status, children)

# the checkpoint a gate answers against: the worker's own options for an adhoc
# gate, which has no default and no condition; the declared one otherwise
def gate_checkpoint(+acts: List<&2, ActivityDef>, +activity: String, +checkpoint: String, adhoc: Maybe<&2, List<&2, CpOption>>) -> Maybe<&2, Checkpoint>:
  match adhoc:
    case Some{opts}:
      Some{Checkpoint{checkpoint, opts, None{}, None{}, False{}}}
    case None{}:
      find_checkpoint(steps_of(acts, activity), checkpoint)

def respond(+w: Workflow, mode: Mode, +elapsed: Nat, r: Run) -> Outcome:
  match r:
    case Run{frontier, gate, answers, status, children}:
      match gate:
        case GClear{}:
          Refused{NoCheckpointOpen{}}
        case GOpen{+activity, +checkpoint, adhoc}:
          respond_cp(gate_checkpoint(acts_of(w), activity, checkpoint, adhoc), mode, elapsed, activity, checkpoint, frontier, answers, status, children)

# Present, resume, deliver, dispatch, diagnose
# ============================================

def present(r: Run) -> Outcome:
  match r:
    case Run{frontier, gate, answers, status, children}:
      match gate:
        case GClear{}:
          Refused{NoActiveToPresent{}}
        case GOpen{a, c, ad}:
          Accepted{Run{frontier, GOpen{a, c, ad}, answers, status, children}, Nil{}, False{}}

def resume(r: Run) -> Outcome:
  match r:
    case Run{frontier, gate, answers, status, children}:
      match gate:
        case GOpen{a, c, ad}:
          Refused{GateOpen{}}
        case GClear{}:
          Accepted{Run{frontier, GClear{}, answers, status, children}, Nil{}, False{}}

# a content call is served the activity it names, or the sole one in flight
def frontier_refusal(named: Maybe<&2, String>, +frontier: List<&2, String>) -> Maybe<&2, Refusal>:
  match named:
    case Some{+n}:
      Bool.pick(Maybe<&2, Refusal>, has_str(frontier, n), None{},
        pick_refusal(List.is_empty(&2, String, frontier), NoActivityInFlight{}, Some{NotDispatchedFor{}}))
    case None{}:
      pick_refusal(Nat.is_gt(List.length(&2, String, frontier), 1n), ActivityIdRequired{},
        pick_refusal(List.is_empty(&2, String, frontier), NoActivityInFlight{}, None{}))

def deliver_fin(mr: Maybe<&2, Refusal>, frontier: List<&2, String>, answers: List<&2, Answer>, status: Status, children: Nat) -> Outcome:
  match mr:
    case Some{why}:
      Refused{why}
    case None{}:
      Accepted{Run{frontier, GClear{}, answers, status, children}, Nil{}, False{}}

def deliver(named: Maybe<&2, String>, r: Run) -> Outcome:
  match r:
    case Run{+frontier, gate, answers, status, children}:
      match gate:
        case GOpen{a, c, ad}:
          Refused{GateOpen{}}
        case GClear{}:
          deliver_fin(frontier_refusal(named, frontier), frontier, answers, status, children)

# dispatch_child: no gate and no status check, as the server has it
def dispatch_child(r: Run) -> Outcome:
  match r:
    case Run{frontier, gate, answers, status, children}:
      Accepted{Run{frontier, gate, answers, status, 1n+children}, Nil{}, False{}}

def diagnose(r: Run) -> Outcome:
  match r:
    case Run{frontier, gate, answers, status, children}:
      Accepted{Run{frontier, gate, answers, status, children}, Nil{}, False{}}

# The transition
# ==============

def step(+w: Workflow, c: Call, r: Run) -> Outcome:
  match c:
    case Advance{from, exit, claimed, manifest}:
      advance(w, from, exit, claimed, manifest, r)
    case Yield{checkpoint, adhoc}:
      yield_cp(w, checkpoint, adhoc, r)
    case Present{}:
      present(r)
    case Respond{mode, elapsed}:
      respond(w, mode, elapsed, r)
    case Resume{}:
      resume(r)
    case Deliver{activity}:
      deliver(activity, r)
    case DispatchChild{}:
      dispatch_child(r)
    case Diagnose{}:
      diagnose(r)

# a sequence of calls, stopping at the first refusal
def run_calls(+w: Workflow, cs: List<&2, Call>, o: Outcome) -> Outcome:
  match cs:
    case Nil{}:
      o
    case c <> rest:
      match o:
        case Refused{why}:
          Refused{why}
        case Accepted{run, ws, rp}:
          run_calls(w, rest, step(w, c, run))

def walk(+w: Workflow, cs: List<&2, Call>) -> Outcome:
  run_calls(w, cs, Accepted{start(w), Nil{}, False{}})

# Projections
# ===========

def refusal_of(o: Outcome) -> Maybe<&2, Refusal>:
  match o:
    case Refused{why}:
      Some{why}
    case Accepted{run, ws, rp}:
      None{}

def frontier_of(o: Outcome) -> List<&2, String>:
  match o:
    case Refused{why}:
      Nil{}
    case Accepted{run, ws, rp}:
      match run:
        case Run{frontier, gate, answers, status, children}:
          frontier

def gate_of(o: Outcome) -> Maybe<&2, Gate>:
  match o:
    case Refused{why}:
      None{}
    case Accepted{run, ws, rp}:
      match run:
        case Run{frontier, gate, answers, status, children}:
          Some{gate}

def status_of(o: Outcome) -> Maybe<&2, Status>:
  match o:
    case Refused{why}:
      None{}
    case Accepted{run, ws, rp}:
      match run:
        case Run{frontier, gate, answers, status, children}:
          Some{status}

def answers_of(o: Outcome) -> List<&2, Answer>:
  match o:
    case Refused{why}:
      Nil{}
    case Accepted{run, ws, rp}:
      match run:
        case Run{frontier, gate, answers, status, children}:
          answers

def children_of(o: Outcome) -> Nat:
  match o:
    case Refused{why}:
      0n
    case Accepted{run, ws, rp}:
      match run:
        case Run{frontier, gate, answers, status, children}:
          children

def warnings_of(o: Outcome) -> List<&2, Warning>:
  match o:
    case Refused{why}:
      Nil{}
    case Accepted{run, ws, rp}:
      ws

def replayed_of(o: Outcome) -> Bool:
  match o:
    case Refused{why}:
      False{}
    case Accepted{run, ws, rp}:
      rp
