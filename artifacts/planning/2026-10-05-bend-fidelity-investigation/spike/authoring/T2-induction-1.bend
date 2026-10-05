# all_in distributes over append: all_in(xs ++ ys, env) is the conjunction
# of all_in(xs, env) and all_in(ys, env). The proof is by induction on xs.
# The step case first regroups the right side through Bool.and associativity,
# then rewrites the left side through the induction hypothesis.

import Base
import ./../real/model.bend as M

# Bool.and matches its first argument, so one case split on a closes both sides.
# b and c are erased: the caller may pass an affine value without consuming it.
law and_assoc:
  for a: Bool
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

def all_in_append(xs, ys, env):
  match xs:
    case Nil{}:
      {==}
    case x <> rest:
      %and_assoc(M.has(env, x), M.all_in(rest, env), M.all_in(ys, env)) : {M.all_in(List.append(&2, String, x <> rest, ys), env) == _ : Bool}
      %all_in_append(rest, ys, env) : {M.all_in(List.append(&2, String, x <> rest, ys), env) == Bool.and(M.has(env, x), _) : Bool}
      {==}
