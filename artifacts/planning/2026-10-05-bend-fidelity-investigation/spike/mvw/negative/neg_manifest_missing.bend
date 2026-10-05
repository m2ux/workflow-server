# NEGATIVE: the report omits the one ungated step. Today the step manifest
# layer warns and the call proceeds (docs/fidelity.md, Layer 5, Presence).
# Here the report has the wrong type for the activity being left.
import Base
import ./../mvw.bend as M

def walk() -> M.Ended:
  s0 = M.start()
  M.next_activity(M.Dispatch{}, s0, M.Dispatched{}, Unit{})

def main() -> M.Ended:
  walk()
