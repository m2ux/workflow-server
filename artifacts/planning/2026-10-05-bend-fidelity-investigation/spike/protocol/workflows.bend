# Test workflows for the protocol oracle, as data in protocol.bend's shape.
#
# mvw        corpus/specimens/mvw: one activity, one exit to the terminal.
# gated      three activities exercising a hard checkpoint, a soft checkpoint
#            (defaultOption and autoAdvanceMs), a conditional checkpoint, an
#            immediate exit, and a loop back into the same activity.
# fanned     a source whose exit opens two branches that converge on a join.
#
# Every id is a string, as in the YAML; the loader's load-time rules (every
# exit bound, every option exit declared, branch exits naming one join) are
# assumed to hold of this data, as they hold of a corpus the server serves.

import Base
import ./protocol.bend as P

# mvw
# ===

def mvw() -> P.Workflow:
  P.Workflow{"dispatch",
    [P.ActivityDef{"dispatch",
      [P.SPlain{"recording", False{}}],
      [P.ExitDef{"dispatched", False{}}]}],
    [P.Binding{"dispatch", "dispatched", P.DTerminal{}}]}

# gated
# =====
#
# review: a hard checkpoint `approve` whose option `stop` selects the
#   immediate exit `halted`; three further steps, the last gated.
# wait: a soft checkpoint `poll` (defaultOption `later`, autoAdvanceMs 30000)
#   and a conditional checkpoint `escalate`; exit `again` loops back into
#   `review`, exit `done` leads to `finish`.
# finish: one ungated step, exit to the terminal.

def review_steps() -> List<&2, P.StepDef>:
  [P.SPlain{"gather", False{}},
   P.SCheckpoint{"approve", False{},
     P.Checkpoint{"approve",
       [P.CpOption{"go", None{}, False{}},
        P.CpOption{"stop", Some{"halted"}, False{}},
        P.CpOption{"note", None{}, True{}}],
       None{}, None{}, False{}}},
   P.SPlain{"apply", False{}},
   P.SLoop{"polish", True{}, ["polish-pass"]},
   P.SPlain{"report", True{}}]

def wait_steps() -> List<&2, P.StepDef>:
  [P.SCheckpoint{"poll", False{},
     P.Checkpoint{"poll",
       [P.CpOption{"later", None{}, False{}},
        P.CpOption{"now", None{}, False{}}],
       Some{"later"}, Some{30000n}, False{}}},
   P.SCheckpoint{"escalate", True{},
     P.Checkpoint{"escalate",
       [P.CpOption{"yes", None{}, False{}},
        P.CpOption{"no", None{}, False{}}],
       None{}, None{}, True{}}},
   P.SPlain{"decide", False{}}]

def gated() -> P.Workflow:
  P.Workflow{"review",
    [P.ActivityDef{"review", review_steps(), [P.ExitDef{"reviewed", False{}}, P.ExitDef{"halted", True{}}]},
     P.ActivityDef{"wait", wait_steps(), [P.ExitDef{"again", False{}}, P.ExitDef{"done", False{}}]},
     P.ActivityDef{"finish", [P.SPlain{"close", False{}}], [P.ExitDef{"closed", False{}}]}],
    [P.Binding{"review", "reviewed", P.DEnter{"wait"}},
     P.Binding{"review", "halted", P.DTerminal{}},
     P.Binding{"wait", "again", P.DEnter{"review"}},
     P.Binding{"wait", "done", P.DEnter{"finish"}},
     P.Binding{"finish", "closed", P.DTerminal{}}]}

# fanned
# ======
#
# source: exit `split` opens branches `left` and `right`; each branch's one
# exit names `join`; join exits to the terminal.

def fanned() -> P.Workflow:
  P.Workflow{"source",
    [P.ActivityDef{"source", [P.SPlain{"plan", False{}}], [P.ExitDef{"split", False{}}]},
     P.ActivityDef{"left", [P.SPlain{"probe-left", False{}}], [P.ExitDef{"probed", False{}}]},
     P.ActivityDef{"right", [P.SPlain{"probe-right", False{}}], [P.ExitDef{"probed", False{}}]},
     P.ActivityDef{"join", [P.SPlain{"merge", False{}}], [P.ExitDef{"merged", False{}}]}],
    [P.Binding{"source", "split", P.DFan{["left", "right"]}},
     P.Binding{"left", "probed", P.DEnter{"join"}},
     P.Binding{"right", "probed", P.DEnter{"join"}},
     P.Binding{"join", "merged", P.DTerminal{}}]}
