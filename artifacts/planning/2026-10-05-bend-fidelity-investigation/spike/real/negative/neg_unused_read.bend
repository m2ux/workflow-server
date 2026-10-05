# NEGATIVE: the activity declares a read of reviewer_handle that nothing
# consults. Today check-activity-variables reports unused-declaration. Here the
# law fails.
import Base
import ./../model.bend as M
import ./data/neg_unused_read_data.bend as D

law reads_used:
  {M.reads_used(D.activity()) == True{} : Bool}

def reads_used():
  {==}
