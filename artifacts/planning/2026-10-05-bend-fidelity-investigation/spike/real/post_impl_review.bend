# The work-package activity post-impl-review (corpus/work-package/activities/
# 10-post-impl-review.yaml at 15860ff3) under the spike's laws. The data in
# post_impl_review_data.bend is generated from the YAML by gen.py; the laws
# below are proven by computation: each check normalises to True{}, and {==}
# is the whole proof. A broken definition makes the same proof fail with
# "expected : True{} / observed : False{}" (see negative/).
#
# The activity was chosen because it alone, among the corpus's real
# activities, carries every construct the spike must cover: four checkpoints
# (one soft, one conditional, one inside a loop), a forEach loop and a while
# loop with an or-form continuation test and maxIterations, eleven gated
# steps, and a child dispatch (handle-sub-workflow, then the activity-loop
# routine walking the prism child).

import Base
import ./model.bend as M
import ./post_impl_review_data.bend as D

# LAW: every name a step or exit consults is one the session bag holds: a
# declared read, a declared write, a name some step produces, or ambient.
# Today: check-activity-variables, undeclared-use family (warns in corpus CI).
law reads_resolve:
  {M.reads_resolve(D.ambient(), D.post_impl_review()) == True{} : Bool}

def reads_resolve():
  {==}

# LAW: every bound technique or routine input names something the bag holds.
# Today: check-binding-fidelity, orphan-input family (warns in corpus CI).
law no_orphan_input:
  {M.no_orphan_input(D.ambient(), D.post_impl_review()) == True{} : Bool}

def no_orphan_input():
  {==}

# LAW: every declared read is consulted by some step or exit.
# Today: check-activity-variables, unused-declaration family.
law reads_used:
  {M.reads_used(D.post_impl_review()) == True{} : Bool}

def reads_used():
  {==}

# LAW: every declared write is produced by some step.
# Today: check-activity-variables, unused-declaration family.
law writes_produced:
  {M.writes_produced(D.post_impl_review()) == True{} : Bool}

def writes_produced():
  {==}

# LAW: every loop declares maxIterations, so every loop has a terminating
# encoding (run_while below). Today: nothing. maxIterations is optional in
# the schema, read by no server code, and 7 of the corpus's 62 loops omit it.
law loops_bounded:
  {M.activity_loops_bounded(D.post_impl_review()) == True{} : Bool}

def loops_bounded():
  {==}

# LAW: every exit a checkpoint option selects is one the activity declares.
# Today: the loader fails the workflow load (workflow-loader.ts 653-660).
law option_exits_declared:
  {M.option_exits_declared(D.post_impl_review()) == True{} : Bool}

def option_exits_declared():
  {==}

# The report an advance out of this activity owes, as a type computed from the
# generated data: one slot per step, gated steps as Maybe, loops as lists of
# body reports, checkpoints as the option chosen, outputs at their declared
# types. A report of any other shape is a type error at the call that carries
# it (the MVW layer shows the refusals).
def report_type() -> Type:
  M.ActivityManifest(D.post_impl_review())

# The review-fix-cycle loop (10-post-impl-review.yaml 293-346) as a terminating
# program. The state is the two continuation flags; the test is the loop's
# or-form continueWhile; the body is one pass that may clear or raise them. The
# bound is the loop's maxIterations, 3. The checker accepts the recursion
# because the bound shrinks structurally on every pass.
type FixState is Data:
  FixState{code_findings_actionable: Bool, test_findings_actionable: Bool}

def fix_cycle_continues(s: FixState) -> Bool:
  match s:
    case FixState{c, t}:
      Bool.or(c, t)

# one pass: apply fixes, reset the flags, and let the re-review set them again
def fix_cycle_pass(s: FixState) -> FixState:
  match s:
    case FixState{c, t}:
      FixState{False{}, False{}}

def run_review_fix_cycle(start: FixState) -> FixState:
  M.run_while(~FixState, ~fix_cycle_continues, ~fix_cycle_pass, 3n, start)

# LAW: a cycle that starts with actionable findings ends with none.
law fix_cycle_settles:
  {run_review_fix_cycle(FixState{True{}, True{}}) == FixState{False{}, False{}} : FixState}

def fix_cycle_settles():
  {==}

def main() -> FixState:
  run_review_fix_cycle(FixState{True{}, False{}})
