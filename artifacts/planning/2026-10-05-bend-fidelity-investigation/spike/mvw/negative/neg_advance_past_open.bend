# NEGATIVE: next_activity on a run whose checkpoint is still open. Today the
# server refuses the call at runtime (docs/fidelity.md, Layer 2). Here the
# paused session has the wrong type for the call.
import Base
import ./../mvw.bend as M

def walk() -> M.Ended:
  s0 = M.start()
  s1 = M.yield_checkpoint(M.Dispatch{}, s0, "Proceed with the dispatch?")
  M.next_activity(M.Dispatch{}, s1, M.Dispatched{}, (True{}, Unit{}))

def main() -> M.Ended:
  walk()
