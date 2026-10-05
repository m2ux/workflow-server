# A model of one activity definition as data, and the checks over it that
# the spike states as laws. The data for a real activity is generated from
# its YAML by gen.py; the laws in the activity's own file are proven by
# computation: each check normalises to True{} or the proof {==} fails.
#
# The checks model what the server and two guards police today:
#
#   reads_resolve     every name a step consults (a gate, a condition, a
#                     message interpolation, a bound technique input, a routine
#                     argument, an exit test) is declared in variables.reads, is
#                     a declared write with a default, or is produced by an
#                     earlier step of the same activity. This is the rule the
#                     activity schema states for `reads` ("A name written by an
#                     earlier step of the same activity is local and not
#                     declared here") and the derivation check-activity-variables
#                     measures under its undeclared-use family.
#   no_orphan_input   the same rule restricted to bound technique and routine
#                     inputs: the orphan-input finding of check-binding-fidelity.
#   reads_used        every declared read is consulted by some step or exit:
#                     the unused-declaration family.
#   writes_produced   every declared write is produced by some step: the
#                     unused-declaration family.
#   loops_bounded     every loop declares maxIterations. Bend demands a
#                     structural bound on every recursion, so a loop without
#                     one has no terminating encoding (see run_while below).
#   option_exits_declared
#                     every checkpoint option that selects an exit names one
#                     the activity declares: the load failure the schema states.
#
# Manifest(a) is the type of the report an advance out of the activity must
# carry, computed from the steps: a step's outputs at their declared types,
# a gated step's as Maybe, a loop's as a list of body reports, a checkpoint's
# as the option chosen.

import Base

# Names
# =====

def has(xs: List<&2, String>, +x: String) -> Bool:
  List.contains(~String, ~String.eq, xs, x)

# every name of xs is in env
def all_in(xs: List<&2, String>, +env: List<&2, String>) -> Bool:
  match xs:
    case Nil{}:
      True{}
    case x <> rest:
      Bool.and(has(env, x), all_in(rest, env))

# the names of xs that env lacks
def missing(xs: List<&2, String>, +env: List<&2, String>) -> List<&2, String>:
  match xs:
    case Nil{}:
      Nil{}
    case +x <> rest:
      +tail = missing(rest, env)
      Bool.pick(List<&2, String>, has(env, x), tail, x <> tail)

# the names of a Maybe, as a list
def maybe_list(m: Maybe<&2, String>) -> List<&2, String>:
  match m:
    case None{}:
      Nil{}
    case Some{x}:
      [x]

# The definition model
# ====================

# The declared type of a session variable (activity.schema.json: writes[].type).
type VarType is Data:
  TBool{}
  TString{}
  TNumber{}
  TArray{}
  TObject{}

# A declared write: its name, whether it has a defaultValue, its type.
type Decl is Data:
  Decl{name: String, defaulted: Bool, ty: VarType}

# A checkpoint option: the variables its effect sets (setVariable keys and the
# recordReply target) and the exit it selects, if any.
type Opt is Data:
  Opt{id: String, sets: List<&2, String>, exit: Maybe<&2, String>}

# A step. `gate` is the names its when or condition consults. A technique
# step's `inputs` are the variables its bound technique's inputs resolve to
# (an explicit `inputs:` binding, else the same name) and its `outputs` the
# variables its outputs land in (an `outputs:` remap, else the same name).
# An action's `consults` are the names its set values, messages and validate
# targets read. A loop's `consults` are the names its continueWhile,
# breakCondition and over read; `item` its forEach variable; `bound` its
# maxIterations.
type Step is Data:
  Tech{id: String, gate: List<&2, String>, inputs: List<&2, String>, outputs: List<&2, String>, sets: List<&2, String>}
  Act{id: String, gate: List<&2, String>, consults: List<&2, String>, sets: List<&2, String>}
  Check{id: String, gate: List<&2, String>, consults: List<&2, String>, options: List<&2, Opt>}
  Loop{id: String, gate: List<&2, String>, consults: List<&2, String>, item: Maybe<&2, String>, bound: Maybe<&2, Nat>, body: List<&2, Step>}
  Rout{id: String, gate: List<&2, String>, inputs: List<&2, String>, outputs: List<&2, String>}

# An exit and the names its when expression consults.
type Exit is Data:
  Exit{id: String, consults: List<&2, String>}

type Activity is Data:
  Activity{id: String, reads: List<&2, String>, writes: List<&2, Decl>, steps: List<&2, Step>, exits: List<&2, Exit>}

# What steps consult and produce
# ==============================

# the names the options of a checkpoint may set
def option_sets(os: List<&2, Opt>) -> List<&2, String>:
  match os:
    case Nil{}:
      Nil{}
    case o <> rest:
      match o:
        case Opt{id, sets, exit}:
          List.append(&2, String, sets, option_sets(rest))

# the exits the options of a checkpoint select
def option_exits(os: List<&2, Opt>) -> List<&2, String>:
  match os:
    case Nil{}:
      Nil{}
    case o <> rest:
      match o:
        case Opt{id, sets, exit}:
          List.append(&2, String, maybe_list(exit), option_exits(rest))

# the names a list of steps consults, loop bodies included
def consults_steps(ss: List<&2, Step>) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          List.append(&2, String, gate, List.append(&2, String, ins, consults_steps(rest)))
        case Act{id, gate, cs, sets}:
          List.append(&2, String, gate, List.append(&2, String, cs, consults_steps(rest)))
        case Check{id, gate, cs, opts}:
          List.append(&2, String, gate, List.append(&2, String, cs, consults_steps(rest)))
        case Loop{id, gate, cs, item, bound, body}:
          List.append(&2, String, gate, List.append(&2, String, cs, List.append(&2, String, consults_steps(body), consults_steps(rest))))
        case Rout{id, gate, ins, outs}:
          List.append(&2, String, gate, List.append(&2, String, ins, consults_steps(rest)))

# the names a list of steps produces, loop bodies and items included
def produces_steps(ss: List<&2, Step>) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          List.append(&2, String, outs, List.append(&2, String, sets, produces_steps(rest)))
        case Act{id, gate, cs, sets}:
          List.append(&2, String, sets, produces_steps(rest))
        case Check{id, gate, cs, opts}:
          List.append(&2, String, option_sets(opts), produces_steps(rest))
        case Loop{id, gate, cs, item, bound, body}:
          List.append(&2, String, maybe_list(item), List.append(&2, String, produces_steps(body), produces_steps(rest)))
        case Rout{id, gate, ins, outs}:
          List.append(&2, String, outs, produces_steps(rest))

# the names the exits consult
def consults_exits(es: List<&2, Exit>) -> List<&2, String>:
  match es:
    case Nil{}:
      Nil{}
    case e <> rest:
      match e:
        case Exit{id, cs}:
          List.append(&2, String, cs, consults_exits(rest))

def exit_ids(es: List<&2, Exit>) -> List<&2, String>:
  match es:
    case Nil{}:
      Nil{}
    case e <> rest:
      match e:
        case Exit{id, cs}:
          id <> exit_ids(rest)

def decl_names(ds: List<&2, Decl>) -> List<&2, String>:
  match ds:
    case Nil{}:
      Nil{}
    case d <> rest:
      match d:
        case Decl{name, defaulted, ty}:
          name <> decl_names(rest)

# the declared writes that carry a defaultValue: present from the start of every session
def defaulted_names(ds: List<&2, Decl>) -> List<&2, String>:
  match ds:
    case Nil{}:
      Nil{}
    case d <> rest:
      match d:
        case Decl{name, defaulted, ty}:
          match defaulted:
            case True{}:
              name <> defaulted_names(rest)
            case False{}:
              defaulted_names(rest)

# Checks
# ======

# reads_resolve: walk the steps in order; each step's consulted names must be
# in the environment, which grows by what the step produces. A loop body is
# walked with the loop's item variable in scope.
def resolve_steps(ss: List<&2, Step>, +env: List<&2, String>) -> Bool:
  match ss:
    case Nil{}:
      True{}
    case +s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          ok = Bool.and(all_in(gate, env), all_in(ins, env))
          +env2 = List.append(&2, String, outs, List.append(&2, String, sets, env))
          Bool.and(ok, resolve_steps(rest, env2))
        case Act{id, gate, cs, sets}:
          ok = Bool.and(all_in(gate, env), all_in(cs, env))
          +env2 = List.append(&2, String, sets, env)
          Bool.and(ok, resolve_steps(rest, env2))
        case Check{id, gate, cs, opts}:
          ok = Bool.and(all_in(gate, env), all_in(cs, env))
          +env2 = List.append(&2, String, option_sets(opts), env)
          Bool.and(ok, resolve_steps(rest, env2))
        case Loop{id, gate, cs, item, bound, body}:
          ok = Bool.and(all_in(gate, env), all_in(cs, env))
          +inner = List.append(&2, String, maybe_list(item), env)
          body_ok = resolve_steps(body, inner)
          +env2 = List.append(&2, String, produces_steps(body), env)
          Bool.and(ok, Bool.and(body_ok, resolve_steps(rest, env2)))
        case Rout{id, gate, ins, outs}:
          ok = Bool.and(all_in(gate, env), all_in(ins, env))
          +env2 = List.append(&2, String, outs, env)
          Bool.and(ok, resolve_steps(rest, env2))

# The server's rule (activity-variables.ts, undeclared-use): a name a step consults
# is declared in reads, declared in writes, produced by some step of the activity,
# or ambient. Document order plays no part. `ambient` is the names the server
# supplies to every session.
def bag_names(ambient: List<&2, String>, a: Activity) -> List<&2, String>:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      List.append(&2, String, ambient, List.append(&2, String, reads, List.append(&2, String, decl_names(writes), produces_steps(steps))))

def consulted_names(a: Activity) -> List<&2, String>:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      List.append(&2, String, consults_steps(steps), consults_exits(exits))

# the consulted names the bag never holds
def unresolved_names(ambient: List<&2, String>, +a: Activity) -> List<&2, String>:
  missing(consulted_names(a), bag_names(ambient, a))

def reads_resolve(ambient: List<&2, String>, +a: Activity) -> Bool:
  List.is_empty(&2, String, unresolved_names(ambient, a))

# The stricter rule a checker makes cheap to state: a name is consulted only after
# a step that produces it, in document order, or is declared in reads, is a
# declared write with a default, or is ambient. A read of a declared write before
# its producer passes the server's rule and fails this one.
def reads_resolve_in_order(ambient: List<&2, String>, a: Activity) -> Bool:
  match a:
    case Activity{id, reads, writes, +steps, exits}:
      +env = List.append(&2, String, ambient, List.append(&2, String, reads, defaulted_names(writes)))
      Bool.and(resolve_steps(steps, env), all_in(consults_exits(exits), List.append(&2, String, produces_steps(steps), env)))

# the in-order walk, collecting offenders
def unresolved_steps(ss: List<&2, Step>, +env: List<&2, String>) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case +s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          bad = missing(List.append(&2, String, gate, ins), env)
          +env2 = List.append(&2, String, outs, List.append(&2, String, sets, env))
          List.append(&2, String, bad, unresolved_steps(rest, env2))
        case Act{id, gate, cs, sets}:
          bad = missing(List.append(&2, String, gate, cs), env)
          +env2 = List.append(&2, String, sets, env)
          List.append(&2, String, bad, unresolved_steps(rest, env2))
        case Check{id, gate, cs, opts}:
          bad = missing(List.append(&2, String, gate, cs), env)
          +env2 = List.append(&2, String, option_sets(opts), env)
          List.append(&2, String, bad, unresolved_steps(rest, env2))
        case Loop{id, gate, cs, item, bound, body}:
          bad = missing(List.append(&2, String, gate, cs), env)
          +inner = List.append(&2, String, maybe_list(item), env)
          body_bad = unresolved_steps(body, inner)
          +env2 = List.append(&2, String, produces_steps(body), env)
          List.append(&2, String, bad, List.append(&2, String, body_bad, unresolved_steps(rest, env2)))
        case Rout{id, gate, ins, outs}:
          bad = missing(List.append(&2, String, gate, ins), env)
          +env2 = List.append(&2, String, outs, env)
          List.append(&2, String, bad, unresolved_steps(rest, env2))

# the names the in-order walk finds consulted before any producer
def unresolved_in_order(ambient: List<&2, String>, a: Activity) -> List<&2, String>:
  match a:
    case Activity{id, reads, writes, +steps, exits}:
      +env = List.append(&2, String, ambient, List.append(&2, String, reads, defaulted_names(writes)))
      unresolved_steps(steps, env)

# no_orphan_input: the bound inputs of every technique and routine step name a
# supplied variable. The walk is the same as reads_resolve over inputs alone.
def orphan_free(ss: List<&2, Step>, +env: List<&2, String>) -> Bool:
  match ss:
    case Nil{}:
      True{}
    case +s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          +env2 = List.append(&2, String, outs, List.append(&2, String, sets, env))
          Bool.and(all_in(ins, env), orphan_free(rest, env2))
        case Act{id, gate, cs, sets}:
          +env2 = List.append(&2, String, sets, env)
          orphan_free(rest, env2)
        case Check{id, gate, cs, opts}:
          +env2 = List.append(&2, String, option_sets(opts), env)
          orphan_free(rest, env2)
        case Loop{id, gate, cs, item, bound, body}:
          +inner = List.append(&2, String, maybe_list(item), env)
          body_ok = orphan_free(body, inner)
          +env2 = List.append(&2, String, produces_steps(body), env)
          Bool.and(body_ok, orphan_free(rest, env2))
        case Rout{id, gate, ins, outs}:
          +env2 = List.append(&2, String, outs, env)
          Bool.and(all_in(ins, env), orphan_free(rest, env2))

# bound inputs alone, against the bag the server's rule gives
def bound_inputs(ss: List<&2, Step>) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          List.append(&2, String, ins, bound_inputs(rest))
        case Act{id, gate, cs, sets}:
          bound_inputs(rest)
        case Check{id, gate, cs, opts}:
          bound_inputs(rest)
        case Loop{id, gate, cs, item, bound, body}:
          List.append(&2, String, bound_inputs(body), bound_inputs(rest))
        case Rout{id, gate, ins, outs}:
          List.append(&2, String, ins, bound_inputs(rest))

def orphan_inputs(ambient: List<&2, String>, +a: Activity) -> List<&2, String>:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      missing(bound_inputs(steps), bag_names(ambient, a))

def no_orphan_input(ambient: List<&2, String>, +a: Activity) -> Bool:
  List.is_empty(&2, String, orphan_inputs(ambient, a))

# the declared reads nothing consults
def unused_reads(+a: Activity) -> List<&2, String>:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      missing(reads, consulted_names(a))

# reads_used: every declared read is consulted somewhere
def reads_used(a: Activity) -> Bool:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      +used = List.append(&2, String, consults_steps(steps), consults_exits(exits))
      all_in(reads, used)

# writes_produced: every declared write is produced by some step
def writes_produced(a: Activity) -> Bool:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      +made = produces_steps(steps)
      all_in(decl_names(writes), made)

# loops_bounded: every loop, nested ones included, declares maxIterations
def loops_bounded(ss: List<&2, Step>) -> Bool:
  match ss:
    case Nil{}:
      True{}
    case s <> rest:
      match s:
        case Loop{id, gate, cs, item, bound, body}:
          match bound:
            case None{}:
              False{}
            case Some{n}:
              Bool.and(loops_bounded(body), loops_bounded(rest))
        case Tech{id, gate, ins, outs, sets}:
          loops_bounded(rest)
        case Act{id, gate, cs, sets}:
          loops_bounded(rest)
        case Check{id, gate, cs, opts}:
          loops_bounded(rest)
        case Rout{id, gate, ins, outs}:
          loops_bounded(rest)

def activity_loops_bounded(a: Activity) -> Bool:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      loops_bounded(steps)

# option_exits_declared: every exit a checkpoint option selects is declared
def selected_exits(ss: List<&2, Step>) -> List<&2, String>:
  match ss:
    case Nil{}:
      Nil{}
    case s <> rest:
      match s:
        case Check{id, gate, cs, opts}:
          List.append(&2, String, option_exits(opts), selected_exits(rest))
        case Loop{id, gate, cs, item, bound, body}:
          List.append(&2, String, selected_exits(body), selected_exits(rest))
        case Tech{id, gate, ins, outs, sets}:
          selected_exits(rest)
        case Act{id, gate, cs, sets}:
          selected_exits(rest)
        case Rout{id, gate, ins, outs}:
          selected_exits(rest)

def option_exits_declared(a: Activity) -> Bool:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      all_in(selected_exits(steps), exit_ids(exits))

# The report type
# ===============

# the Bend type a declared variable type maps to. Bend has no JSON, so an
# array or object is carried as its JSON text.
def TypeOf(t: VarType) -> Type:
  match t:
    case TBool{}:
      Bool
    case TString{}:
      String
    case TNumber{}:
      Nat
    case TArray{}:
      String
    case TObject{}:
      String

# the declared type of a name, String when the activity declares no write for it
def var_type(ds: List<&2, Decl>, +name: String) -> VarType:
  match ds:
    case Nil{}:
      TString{}
    case d <> rest:
      match d:
        case Decl{n, defaulted, ty}:
          Bool.pick(VarType, String.eq(n, name), ty, var_type(rest, name))

# the record a step's outputs form: one slot per output, in order
def Outputs(+ds: List<&2, Decl>, outs: List<&2, String>) -> Type:
  match outs:
    case Nil{}:
      Unit
    case o <> rest:
      TypeOf(var_type(ds, o)) & Outputs(ds, rest)

# whether a gate may skip the step
def Gated(gate: List<&2, String>, T: Type) -> Type:
  match gate:
    case Nil{}:
      T
    case g <> rest:
      Maybe<&1, T>

# the report a list of steps owes, in order
def Manifest(+ds: List<&2, Decl>, ss: List<&2, Step>) -> Type:
  match ss:
    case Nil{}:
      Unit
    case s <> rest:
      match s:
        case Tech{id, gate, ins, outs, sets}:
          Gated(gate, Outputs(ds, outs)) & Manifest(ds, rest)
        case Act{id, gate, cs, sets}:
          Gated(gate, Unit) & Manifest(ds, rest)
        case Check{id, gate, cs, opts}:
          Gated(gate, String) & Manifest(ds, rest)
        case Loop{id, gate, cs, item, bound, body}:
          List<&1, Manifest(ds, body)> & Manifest(ds, rest)
        case Rout{id, gate, ins, outs}:
          Gated(gate, Outputs(ds, outs)) & Manifest(ds, rest)

def ActivityManifest(a: Activity) -> Type:
  match a:
    case Activity{id, reads, writes, steps, exits}:
      Manifest(writes, steps)

# A loop that terminates
# ======================

# A while loop with a continuation test, run on a bound: the shape maxIterations
# gives every corpus loop that declares it. The bound shrinks on every pass, so
# the checker accepts the recursion. Without the bound there is no def the
# checker accepts (neg_loop_without_bound.bend). The test and the body are
# templates, since a closure may be called once and a loop calls them on every
# pass; the state is Data, since the test reads it and the body consumes it.
# Bend has no match on a computed value, so the test selects through Bool.pick.
def run_while(~S: Data, ~test: S -> Bool, ~body: S -> S, bound: Nat, +s: S) -> S:
  match bound:
    case 0n:
      s
    case 1n+rest:
      Bool.pick(S, test(s), run_while(~S, ~test, ~body, rest, body(s)), s)
