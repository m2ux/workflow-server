# T1-computation-3: a review activity as data, and three of model.bend's
# checks over it proven by computation. Each law normalises its check to
# True{} and closes with {==}.

import Base
import ./../real/model.bend as M

# The activity
# ============
# review: a technique gathers findings over the declared read scope; a
# loop bounded at three passes applies fixes until the tree is patched; a
# checkpoint accepts or rejects, each option recording the decision and
# selecting one of the two declared exits.

def review_writes() -> List<&2, M.Decl>:
  [M.Decl{"findings", False{}, M.TArray{}}, M.Decl{"patched", False{}, M.TBool{}}, M.Decl{"decision", False{}, M.TString{}}]

def fix_body() -> List<&2, M.Step>:
  [M.Act{"apply-fix", Nil{}, ["findings"], ["patched"]}]

def approve_options() -> List<&2, M.Opt>:
  [M.Opt{"accept", ["decision"], Some{"done"}}, M.Opt{"reject", ["decision"], Some{"rework"}}]

def review_steps() -> List<&2, M.Step>:
  [M.Tech{"gather", Nil{}, ["scope"], ["findings"], Nil{}}, M.Loop{"fix-cycle", Nil{}, ["findings"], None{}, Some{3n}, fix_body()}, M.Check{"approve", Nil{}, ["patched"], approve_options()}]

def review_exits() -> List<&2, M.Exit>:
  [M.Exit{"done", ["decision"]}, M.Exit{"rework", ["decision"]}]

def review() -> M.Activity:
  M.Activity{"review", ["scope"], review_writes(), review_steps(), review_exits()}

# The laws
# ========

# LAW (a): every loop of review declares maxIterations
law review_loops_bounded:
  {M.activity_loops_bounded(review()) == True{} : Bool}

def review_loops_bounded():
  {==}

# LAW (b): every exit a checkpoint option selects is one review declares
law review_option_exits_declared:
  {M.option_exits_declared(review()) == True{} : Bool}

def review_option_exits_declared():
  {==}

# LAW (c): every declared write of review is produced by some step
law review_writes_produced:
  {M.writes_produced(review()) == True{} : Bool}

def review_writes_produced():
  {==}
