# T1: three checks over a small activity, proven by computation.
# The activity scans a ticket into findings, reviews each finding in a
# bounded loop, and ends at a checkpoint whose options select an exit.

import Base
import ./../real/model.bend as M

def triage() -> M.Activity:
  M.Activity{
    "triage",
    ["ticket"],
    [M.Decl{"findings", False{}, M.TArray{}}, M.Decl{"verdict", False{}, M.TString{}}],
    [
      M.Tech{"scan", [], ["ticket"], ["findings"], []},
      M.Loop{"review", [], ["findings"], Some{"finding"}, Some{3n}, [M.Act{"note", [], ["finding"], []}]},
      M.Check{"decide", [], ["findings"], [M.Opt{"accept", ["verdict"], Some{"done"}}, M.Opt{"reject", ["verdict"], Some{"blocked"}}]}
    ],
    [M.Exit{"done", []}, M.Exit{"blocked", []}]
  }

# (a) every loop declares maxIterations
law triage_loops_bounded:
  {M.activity_loops_bounded(triage()) == True{} : Bool}

def triage_loops_bounded():
  {==}

# (b) every exit a checkpoint option selects is declared
law triage_option_exits_declared:
  {M.option_exits_declared(triage()) == True{} : Bool}

def triage_option_exits_declared():
  {==}

# (c) every declared write is produced by some step
law triage_writes_produced:
  {M.writes_produced(triage()) == True{} : Bool}

def triage_writes_produced():
  {==}
