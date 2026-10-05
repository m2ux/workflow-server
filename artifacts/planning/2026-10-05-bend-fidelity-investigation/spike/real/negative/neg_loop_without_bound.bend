# NEGATIVE: the review-fix cycle written as the corpus states it, a loop that
# runs while its test holds and nothing else. Bend has no encoding of such a
# loop: a self-call whose arguments do not shrink is refused by the checker's
# descent rule. The only way to keep it is @unsafe, which the verdict names.
import Base

type FixState is Data:
  FixState{code_findings_actionable: Bool, test_findings_actionable: Bool}

def fix_cycle_pass(s: FixState) -> FixState:
  match s:
    case FixState{c, t}:
      FixState{False{}, False{}}

def run_until_settled(+s: FixState) -> FixState:
  match s:
    case FixState{c, t}:
      Bool.pick(FixState, Bool.or(c, t), run_until_settled(fix_cycle_pass(s)), s)

def main() -> FixState:
  run_until_settled(FixState{True{}, True{}})
