# E16 pair decisions

- E16:W01 and E16:W04: separate. Relation capture uses GitHub collections; revision verification uses local git revisions and a supplied command. Neither consumes the other's output.
- E16:W02 and E16:W04: separate. Missing-relation behavior belongs to capture; checkout cleanup and command exit behavior belong to the revision helper. Their failure fixtures are independent.
- E16:W03 and E16:W04: separate. The closure sweep consumes captured issue/PR evidence; the revision helper consumes no closure or capture result. Separate scripts and failure contracts warrant separate reviews.

The final reachability audit depends on both implementation branches. Separate pairs do not establish parallel write safety: verify their actual command-specification and caller write sets before dispatch.
