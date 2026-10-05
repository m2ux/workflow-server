# missing_sound: all_in answers True exactly when missing answers the empty
# list. By induction on xs; the cons case hands the computed verdict
# M.has(env, x) to a .fin helper that matches it, with the induction
# hypothesis arriving as rec.

import Base
import ./../real/model.bend as M

law missing_sound:
  for xs: List<&2, String>
  for +env: List<&2, String>
  {M.all_in(xs, env) == List.is_empty(&2, String, M.missing(xs, env)) : Bool}

# with b the verdict for x: when True both sides reduce to the tail's claim,
# when False both sides are False
def missing_sound.fin(-x: String, -rest: List<&2, String>, -env: List<&2, String>,
  rec: {M.all_in(rest, env) == List.is_empty(&2, String, M.missing(rest, env)) : Bool}, b: Bool)
  -> {Bool.and(b, M.all_in(rest, env)) == List.is_empty(&2, String, Bool.pick(List<&2, String>, b, M.missing(rest, env), x <> M.missing(rest, env))) : Bool}:
  match b:
    case True{}:
      rec
    case False{}:
      {==}

def missing_sound(xs, env):
  match xs:
    case Nil{}:
      {==}
    case x <> rest:
      missing_sound.fin(x, rest, env, missing_sound(rest, env), M.has(env, x))
