# NEGATIVE: respond_checkpoint on a run with no checkpoint open. Today the
# server refuses the call at runtime. Here the clear session has the wrong
# type for the call.
import Base
import ./../mvw.bend as M

def walk() -> M.Ended:
  s0 = M.start()
  s1 = M.respond_checkpoint(M.Dispatch{}, s0, 0)
  M.next_activity(M.Dispatch{}, s1, M.Dispatched{}, (True{}, Unit{}))

def main() -> M.Ended:
  walk()
