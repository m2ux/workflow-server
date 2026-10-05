# NEGATIVE: a gate consults review_budget_remaining, which the activity neither
# declares nor produces. Today check-activity-variables reports undeclared-use
# in corpus CI. Here the law fails.
import Base
import ./../model.bend as M
import ./data/neg_undeclared_read_data.bend as D

law reads_resolve:
  {M.reads_resolve(D.ambient(), D.activity()) == True{} : Bool}

def reads_resolve():
  {==}
