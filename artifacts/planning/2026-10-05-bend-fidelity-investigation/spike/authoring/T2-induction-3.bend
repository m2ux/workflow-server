# all_in distributes over append: every name of xs ++ ys is in env exactly
# when every name of xs is and every name of ys is. Proven by induction on
# xs; the step case regroups the conjunction through and_assoc, then the
# induction hypothesis folds the tail back into all_in over the append.

import Base
import ./../real/model.bend as M

# Bool.and matches its first argument alone, so one case split proves it.
# b and c appear only in the statement, so they are erased.
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
      %and_assoc(M.has(env, x), M.all_in(rest, env), M.all_in(ys, env)) : {Bool.and(M.has(env, x), M.all_in(List.append(&2, String, rest, ys), env)) == _ : Bool}
      %all_in_append(rest, ys, env) : {Bool.and(M.has(env, x), M.all_in(List.append(&2, String, rest, ys), env)) == Bool.and(M.has(env, x), _) : Bool}
      {==}
