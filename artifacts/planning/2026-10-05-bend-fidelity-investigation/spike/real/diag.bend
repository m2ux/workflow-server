# Diagnostic over the generated activity: the names the server's rule leaves
# unresolved, the orphan inputs, the declared reads nothing consults, the names
# the stricter in-order rule finds read before their producer, and the six
# verdicts in order: reads_resolve, no_orphan_input, reads_used,
# writes_produced, loops_bounded, option_exits_declared.
import Base
import ./model.bend as M
import ./post_impl_review_data.bend as D

def main() -> List<&2, String> & List<&2, String> & List<&2, String> & List<&2, String> & List<&2, Bool>:
  (M.unresolved_names(D.ambient(), D.post_impl_review()),
   M.orphan_inputs(D.ambient(), D.post_impl_review()),
   M.unused_reads(D.post_impl_review()),
   M.unresolved_in_order(D.ambient(), D.post_impl_review()),
   [M.reads_resolve(D.ambient(), D.post_impl_review()), M.no_orphan_input(D.ambient(), D.post_impl_review()), M.reads_used(D.post_impl_review()), M.writes_produced(D.post_impl_review()), M.activity_loops_bounded(D.post_impl_review()), M.option_exits_declared(D.post_impl_review())])
