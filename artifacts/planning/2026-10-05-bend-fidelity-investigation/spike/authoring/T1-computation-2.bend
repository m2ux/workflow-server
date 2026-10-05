# T1-computation-2: a small activity as data under three of the model's checks,
# each proven by computation: the check normalises to True{} and {==} is the
# whole proof.
#
# The activity triages review findings: a technique classifies them, a bounded
# loop applies fixes while escalation is still open, and a checkpoint either
# accepts the result or escalates it, each option selecting a declared exit.

import Base
import ./../real/model.bend as M

def triage_findings() -> M.Activity:
  M.Activity{"triage-findings",
    ["findings", "planning_folder_path"],
    [M.Decl{"triaged", False{}, M.TArray{}},
     M.Decl{"escalate", True{}, M.TBool{}}],
    [M.Tech{"classify-findings", [], ["findings", "planning_folder_path"], ["triaged"], []},
     M.Loop{"fix-cycle", [], ["escalate"], None{}, Some{3n},
       [M.Act{"apply-fix", [], ["triaged"], ["escalate"]}]},
     M.Check{"confirm-triage", [], ["triaged"],
       [M.Opt{"accept", [], Some{"done"}},
        M.Opt{"escalate", ["escalate"], Some{"escalated"}}]}],
    [M.Exit{"done", []}, M.Exit{"escalated", ["escalate"]}]}

# LAW (a): every loop declares maxIterations.
law triage_loops_bounded:
  {M.activity_loops_bounded(triage_findings()) == True{} : Bool}

def triage_loops_bounded():
  {==}

# LAW (b): every exit a checkpoint option selects is one the activity declares.
law triage_option_exits_declared:
  {M.option_exits_declared(triage_findings()) == True{} : Bool}

def triage_option_exits_declared():
  {==}

# LAW (c): every declared write is produced by some step.
law triage_writes_produced:
  {M.writes_produced(triage_findings()) == True{} : Bool}

def triage_writes_produced():
  {==}
