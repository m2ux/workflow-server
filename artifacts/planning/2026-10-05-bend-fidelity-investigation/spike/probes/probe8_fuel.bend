import Base

# a while loop with a continuation test and a fuel bound: the shape the corpus's
# maxIterations gives. The fuel shrinks structurally, so the checker accepts it.
def cycle(fuel: Nat, +again: Bool, acc: U32) -> U32:
  match fuel:
    case 0n:
      acc
    case 1n+rest:
      match again:
        case False{}:
          acc
        case True{}:
          cycle(rest, again, (acc + 1 : U32))

def main() -> U32:
  cycle(3n, True{}, 0)
