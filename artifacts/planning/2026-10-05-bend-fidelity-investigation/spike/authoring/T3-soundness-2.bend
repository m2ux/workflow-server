# missing_sound: all_in(xs, env) agrees with the emptiness of missing(xs, env).
# Induction on xs. The Con case turns on has(env, x), which all_in feeds to
# Bool.and and missing to Bool.pick; the .fin helper receives that Bool as a
# parameter and matches it, since a computed value cannot be matched in place.

import Base
import ./../real/model.bend as M

law missing_sound:
  for xs: List<&2, String>
  for +env: List<&2, String>
  {M.all_in(xs, env) == List.is_empty(&2, String, M.missing(xs, env)) : Bool}

# the Con case decided on b = has(env, x): when True both sides reduce to the
# induction hypothesis rec; when False both sides are False
def missing_sound.fin(-x: String, -rest: List<&2, String>, -env: List<&2, String>, b: Bool,
  rec: {M.all_in(rest, env) == List.is_empty(&2, String, M.missing(rest, env)) : Bool})
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
      missing_sound.fin(x, rest, env, M.has(env, x), missing_sound(rest, env))
