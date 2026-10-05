# One law of post_impl_review.bend on its own, so the kernel's verdict and its cost can be read per law.
import Base
import ./../model.bend as M
import ./../post_impl_review_data.bend as D

law loops_bounded:
  {M.activity_loops_bounded(D.post_impl_review()) == True{} : Bool}

def loops_bounded():
  {==}
