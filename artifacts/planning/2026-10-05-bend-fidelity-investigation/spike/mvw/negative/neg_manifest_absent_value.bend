# NEGATIVE: the report marks the ungated step as skipped. Today the step
# manifest layer warns (Presence, or Output when the value is empty). Here
# an ungated step's slot has type Bool, and None is not a Bool.
import Base
import ./../mvw.bend as M

def walk() -> M.Ended:
  s0 = M.start()
  M.next_activity(M.Dispatch{}, s0, M.Dispatched{}, (None{}, Unit{}))

def main() -> M.Ended:
  walk()
