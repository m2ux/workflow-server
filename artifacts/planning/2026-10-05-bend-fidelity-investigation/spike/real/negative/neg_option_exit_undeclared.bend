# NEGATIVE: an option of local-validation-permission selects the exit escalate,
# which the activity does not declare. Today the loader fails the workflow load.
# Here the law fails.
import Base
import ./../model.bend as M
import ./data/neg_option_exit_undeclared_data.bend as D

law option_exits_declared:
  {M.option_exits_declared(D.activity()) == True{} : Bool}

def option_exits_declared():
  {==}
