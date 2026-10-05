# NEGATIVE: one session value drives two advances, the shape of a replayed or
# forked state. Today the seal catches a file edited outside the server, and
# a re-issued call is not distinguished from a fresh one (docs/fidelity.md,
# Limits of Detectability). Here the session is affine: a second use is refused.
import Base
import ./../mvw.bend as M

def walk() -> M.Ended & M.Ended:
  s0 = M.start()
  a = M.next_activity(M.Dispatch{}, s0, M.Dispatched{}, (True{}, Unit{}))
  b = M.next_activity(M.Dispatch{}, s0, M.Dispatched{}, (True{}, Unit{}))
  (a, b)

def main() -> M.Ended & M.Ended:
  walk()
