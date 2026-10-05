# NEGATIVE: the review-fix-cycle loop declares no maxIterations. Today nothing
# checks this: the field is optional and the server reads it nowhere. Here the
# loops_bounded law fails, and the loop has no terminating encoding.
import Base
import ./../model.bend as M
import ./data/neg_unbounded_loop_data.bend as D

law loops_bounded:
  {M.activity_loops_bounded(D.activity()) == True{} : Bool}

def loops_bounded():
  {==}
