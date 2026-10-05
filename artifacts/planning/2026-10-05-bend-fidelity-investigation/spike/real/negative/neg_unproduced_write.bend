# NEGATIVE: the activity declares a write of review_verdict that no step
# produces. Today check-activity-variables reports unused-declaration. Here the
# law fails.
import Base
import ./../model.bend as M
import ./data/neg_unproduced_write_data.bend as D

law writes_produced:
  {M.writes_produced(D.activity()) == True{} : Bool}

def writes_produced():
  {==}
