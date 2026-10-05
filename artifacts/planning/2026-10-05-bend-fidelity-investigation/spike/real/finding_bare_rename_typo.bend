# FINDING, not a negative case: the same misspelling as negative/neg_orphan_input,
# written as a bare value (`findings_to_classify: manual_diff_review_repor`).
# The activity schema lets an `inputs:` value be a literal or a bare rename, and
# the server reads a bare value that names no bag entry as a literal string
# (binding-provenance.ts 445-451: "statically indistinguishable"). So the typo
# is not a defect the server or its guards can see, and the law below holds:
# the step's input is bound to the string "manual_diff_review_repor".
#
# A typed definition language has no such ambiguity: a variable reference and a
# string literal are different terms, and a reference to an undeclared variable
# is refused at compile time (probe neg_unknown_destination shows the error).
# The grammar, not the checker, is what makes this defect undetectable today.
import Base
import ./model.bend as M
import ./negative/data/finding_bare_rename_typo_data.bend as D

law no_orphan_input_holds_on_the_typo:
  {M.no_orphan_input(D.ambient(), D.activity()) == True{} : Bool}

def no_orphan_input_holds_on_the_typo():
  {==}

def main() -> Bool:
  M.no_orphan_input(D.ambient(), D.activity())
