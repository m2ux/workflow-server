# The Minimum Viable Workflow specimen (corpus/specimens/mvw at 15860ff3) as a
# Bend program: one orchestrator, one activity, one routine, one technique.
#
# What the types prove here, and where each claim comes from:
#
#   1. Every declared exit binds to a target. `graph` is a function over an
#      activity and the exits that activity declares (ExitOf). A match in Bend
#      must cover every constructor, so an exit the graph leaves unbound is a
#      compile error, and a destination that names no activity is a type error.
#      Checked by bend2/bend.ts; neg_unbound_exit.bend and
#      neg_unknown_destination.bend capture the refusals.
#
#   2. No transition past an open checkpoint type-checks. A session standing
#      on activity a with gate g has type Session(g, a). `next_activity` takes
#      Session(Clear{}, a) and `respond_checkpoint` takes Session(Open{}, a);
#      the other value is a type error. neg_advance_past_open.bend and
#      neg_answer_unpaused.bend capture the refusals.
#
#   3. Every ungated step appears in the reported run. The report
#      `next_activity` takes has type Manifest(steps(a)), computed from the
#      activity's step list: an ungated step contributes its output type, a
#      gated one a Maybe of it. A report that omits an ungated step is a type
#      error. neg_manifest_missing.bend captures the refusal.
#
#   4. A session is a linear value. Session types are Type-kinded, so a value
#      is consumed by the one transition that takes it. A second transition
#      from the same value is a compile error: neg_session_reused.bend.

import Base

# The definition
# ==============

# The activities the workflow declares (workflow.yaml: initialActivity dispatch).
type Activity is Data:
  Dispatch{}

# The exits each activity declares (activities/01-dispatch.yaml: exits: dispatched).
type DispatchExit is Data:
  Dispatched{}

# ExitOf(a): the exits of activity a. A type computed from the activity, so an
# exit is always one of a known activity's.
def ExitOf(a: Activity) -> Data:
  match a:
    case Dispatch{}:
      DispatchExit

# Where an exit leads (workflow.yaml: graph). Enter names a declared activity.
type Destination is Data:
  Terminal{}
  Enter{activity: Activity}

# The graph: for each activity, a total function from its exits to a destination.
# workflow.yaml: dispatch: dispatched: __terminal__
def graph(a: Activity, e: ExitOf(a)) -> Destination:
  match a:
    case Dispatch{}:
      match e:
        case Dispatched{}:
          Terminal{}

# The techniques and routines the specimen binds.
type Technique is Data:
  NoteRan{}

type Routine is Data:
  RecordDispatch{}

# routines/record-dispatch.yaml: one step, record, bound to note-ran.
def routine_steps(r: Routine) -> List<&2, Technique>:
  match r:
    case RecordDispatch{}:
      [NoteRan{}]

# What a step binds.
type Binding is Data:
  ViaRoutine{routine: Routine}
  ViaTechnique{technique: Technique}

# A step: its id, what it binds, and whether a gate (when or condition) may skip it.
type Step is Data:
  Step{id: String, binding: Binding, gated: Bool}

# activities/01-dispatch.yaml: steps: recording, kind routine, record-dispatch, ungated.
def steps(a: Activity) -> List<&2, Step>:
  match a:
    case Dispatch{}:
      [Step{"recording", ViaRoutine{RecordDispatch{}}, False{}}]

# The output a binding produces. techniques/note-ran.md and
# routines/record-dispatch.yaml both declare dispatch_recorded: boolean.
def OutputOf(b: Binding) -> Type:
  match b:
    case ViaRoutine{r}:
      match r:
        case RecordDispatch{}:
          Bool
    case ViaTechnique{t}:
      match t:
        case NoteRan{}:
          Bool

# The report a step owes: its output when ungated, possibly absent when gated.
def Report(s: Step) -> Type:
  match s:
    case Step{id, b, gated}:
      match gated:
        case False{}:
          OutputOf(b)
        case True{}:
          Maybe<&1, OutputOf(b)>

# The report an activity owes on leaving: one entry per step, in declaration order.
def Manifest(ss: List<&2, Step>) -> Type:
  match ss:
    case Nil{}:
      Unit
    case s <> rest:
      Report(s) & Manifest(rest)

# The session
# ===========

# Whether a checkpoint is open on the run.
type Gate is Data:
  Clear{}
  Open{}

# A run standing on activity a with no checkpoint open. Type-kinded: one owner,
# consumed by the one call that takes it.
type Standing<-a: Activity> is Type:
  Standing{}

# A run paused on activity a with a question nobody has answered.
type Paused<-a: Activity> is Type:
  Paused{question: String}

# A run that reached the terminal.
type Ended is Type:
  Ended{}

# The session the server holds: its gate and its position decide its type.
def Session(g: Gate, a: Activity) -> Type:
  match g:
    case Clear{}:
      Standing<a>
    case Open{}:
      Paused<a>

# Where a run stands after it leaves through a destination.
def After(d: Destination) -> Type:
  match d:
    case Terminal{}:
      Ended
    case Enter{b}:
      Session(Clear{}, b)

# The calls
# =========

# The server opens a run on the initial activity.
def start() -> Session(Clear{}, Dispatch{}):
  Standing{}

# yield_checkpoint pauses a clear run on a question.
def yield_checkpoint(-a: Activity, s: Session(Clear{}, a), question: String) -> Session(Open{}, a):
  match s:
    case Standing{}:
      Paused{question}

# present_checkpoint shows the question of a paused run and hands the run back, still paused.
def present_checkpoint(-a: Activity, s: Session(Open{}, a)) -> Session(Open{}, a) & String:
  match s:
    case Paused{+q}:
      (Paused{q}, q)

# respond_checkpoint records an answer and clears the gate. Only a paused run has a question to answer.
def respond_checkpoint(-a: Activity, s: Session(Open{}, a), option: U32) -> Session(Clear{}, a):
  match s:
    case Paused{+q}:
      Standing{}

# next_activity leaves activity a through exit e with the report its steps owe.
# The run must be clear, the exit must be one a declares, and the report must
# cover every ungated step. The result stands where the graph sends the exit.
def next_activity(+a: Activity, s: Session(Clear{}, a), e: ExitOf(a), m: Manifest(steps(a))) -> After(graph(a, e)):
  match a:
    case Dispatch{}:
      match s:
        case Standing{}:
          match e:
            case Dispatched{}:
              Ended{}

# A run
# =====

# One walk of the specimen: open, pause on an ad hoc question, answer it, and
# leave through the one exit with the one report the activity owes.
def walk() -> Ended:
  s0 = start()
  s1 = yield_checkpoint(Dispatch{}, s0, "Proceed with the dispatch?")
  s2 = respond_checkpoint(Dispatch{}, s1, 0)
  next_activity(Dispatch{}, s2, Dispatched{}, (True{}, Unit{}))

# Laws
# ====

# LAW: the specimen's one exit leads to the terminal.
law dispatch_ends:
  {graph(Dispatch{}, Dispatched{}) == Terminal{} : Destination}

def dispatch_ends():
  {==}

# LAW: the dispatch activity owes one report, a Bool that may not be absent.
law dispatch_owes_one_bool:
  {Manifest(steps(Dispatch{})) == Pair(Bool, Unit) : Type}

def dispatch_owes_one_bool():
  {==}

def main() -> Ended:
  walk()
