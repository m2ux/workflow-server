# missing_sound: all_in(xs, env) agrees with missing(xs, env) being empty.
# The cons step hinges on has(env, x), which missing selects through
# Bool.pick; the .fin helper takes that verdict as a parameter b and
# matches it, with the induction hypothesis arriving as rec.

import Base
import ./../real/model.bend as M

law missing_sound:
  for xs: List<&2, String>
  for +env: List<&2, String>
  {M.all_in(xs, env) == List.is_empty(&2, String, M.missing(xs, env)) : Bool}

# the cons case with the verdict b in place of has(env, x): on True both
# sides reduce to the tail claim rec, on False both sides are False
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
