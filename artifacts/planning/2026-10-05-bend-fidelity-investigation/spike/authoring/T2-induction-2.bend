# all_in distributes over append: checking names against env one list at
# a time agrees with checking the concatenation. Induction on xs; the step
# reassociates Bool.and and closes with the induction hypothesis.

import Base
import ./../real/model.bend as M

# Bool.and associates. A match on a alone settles both sides, so b and c
# are erased and the lemma consumes only a at runtime.
law and_assoc:
  for  a: Bool
  for -b: Bool
  for -c: Bool
  {Bool.and(a, Bool.and(b, c)) == Bool.and(Bool.and(a, b), c) : Bool}

def and_assoc(a, b, c):
  match a:
    case True{}:
      {==}
    case False{}:
      {==}

law all_in_append:
  for xs: List<&2, String>
  for ys: List<&2, String>
  for +env: List<&2, String>
  {M.all_in(List.append(&2, String, xs, ys), env) == Bool.and(M.all_in(xs, env), M.all_in(ys, env)) : Bool}

# Nil: both sides compute to all_in(ys, env). Cons: the right side is
# and(and(has x, all_in rest), all_in ys); and_assoc nests it as
# and(has x, and(all_in rest, all_in ys)), and the induction hypothesis
# folds the inner and back into all_in(append(rest, ys), env).
def all_in_append(xs, ys, env):
  match xs:
    case Nil{}:
      {==}
    case x <> rest:
      %and_assoc(M.has(env, x), M.all_in(rest, env), M.all_in(ys, env)) : {Bool.and(M.has(env, x), M.all_in(List.append(&2, String, rest, ys), env)) == _ : Bool}
      %all_in_append(rest, ys, env) : {Bool.and(M.has(env, x), M.all_in(List.append(&2, String, rest, ys), env)) == Bool.and(M.has(env, x), _) : Bool}
      {==}
