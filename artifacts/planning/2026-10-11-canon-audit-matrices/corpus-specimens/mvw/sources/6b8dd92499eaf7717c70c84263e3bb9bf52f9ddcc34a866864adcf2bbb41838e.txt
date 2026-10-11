# Fan

> Part of [techniques](../README.md)

Contract and rules for carrying a graph fan — the techniques that open every branch a destination names, give each its own identity, run them in one turn, and retire them against the….

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`enter-fan`](enter-fan.md) | Publish the in-progress mark for every branch a graph destination fans, then open them all with one call and report the branches and the activity they converge on |
| [`retire-branch`](retire-branch.md) | Retire one branch of an open fan against the activity the branches converge on, and account for the activity it carried |
| [`spawn-branches`](spawn-branches.md) | Give every branch an identity and a stub, emit them all in one turn, and hand back what each returned in the order the fan opened them |
