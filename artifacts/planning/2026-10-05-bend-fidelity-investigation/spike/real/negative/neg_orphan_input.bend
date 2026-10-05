# NEGATIVE: classify-and-route-findings binds findings_to_classify to a
# misspelt variable nothing produces. Today check-binding-fidelity reports an
# orphan-input in corpus CI. Here the law fails.
import Base
import ./../model.bend as M
import ./data/neg_orphan_input_data.bend as D

law no_orphan_input:
  {M.no_orphan_input(D.ambient(), D.activity()) == True{} : Bool}

def no_orphan_input():
  {==}
