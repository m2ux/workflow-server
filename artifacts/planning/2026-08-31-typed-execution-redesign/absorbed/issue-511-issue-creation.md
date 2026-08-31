## Summary

The operation that creates a work package's tracker issue carries a switch inside it: is there already an issue, or does one need making? It sets that switch early and reads it later to decide whether to create anything. That is ordinary internal bookkeeping and there is nothing wrong with it.

What makes it a problem is that the operation also declares the switch as one of its results. A declared result lands in the session when the operation runs, so every caller receives the switch whether it wanted it or not, and every workflow that borrows the calling activity has to account for a value it has no use for.

The anti-pattern catalogue already names this shape — an input or output description holding procedure rather than the value's meaning — and the example it quotes is this exact field.

## What happens today

The operation declares the switch as a result and describes it as a gate: false when an earlier step verified an existing issue, otherwise true. Its own steps then reference it four times — set twice, read twice — to decide whether the creation steps run.

The activity that starts a work package does not get the switch from the operation at all. A checkpoint asks the user whether to create a new issue or supply an existing one, and two of that checkpoint's options set the switch directly. Seven gates in that activity then read it, including the gate on the operation itself. So the value has two producers, and the one the activity actually depends on is the checkpoint — not the declaration.

A second caller has now arrived. Completion raises tracker issues for the rows of the deferred-items register, and binds the same operation once per approved row. It has no use for the switch, but a bound operation's declared results land in the session regardless, so the caller must direct it somewhere and something must read it. The vulnerability-remediation workflow borrows completion without borrowing the start activity, so in that workflow the value has no reader at all and the contract check reports it.

The result is that a caller which only wants an issue created must also carry a switch describing how the operation decided to create it.

## The fix

**Stage one — settle where the switch belongs.** Whether to make a new issue or adopt an existing one is a decision a person takes at a gate. It belongs to the activity that asks the question, which is already where it is set and read. The operation does not own it.

**Stage two — stop declaring it as a result.** Remove it from the operation's declared outputs. Callers then receive what they asked for: the issue's key and address.

**Stage three — let the operation's own steps branch on the fact rather than the switch.** The creation steps currently run when the switch is true; they can run when no existing issue key was supplied, which is the thing the switch was standing for. This is the only part of the change that touches the operation's procedure.

**Stage four — leave the start activity's gates as they are.** They read a value its own checkpoint sets, and that keeps working untouched.

## Why now is cheap

The second caller has just been written, so the cost of the current shape is visible rather than hypothetical: it needed a redirected result and a gate that cannot be false, added purely so the borrowed value had a reader. Both come out when the declaration does.

Waiting means every further caller pays the same tax, and each one makes the declaration look more load-bearing than it is.

## Scope

The operation's declared results and the two of its own steps that gate on the switch. The start activity's checkpoint, variable and gates are untouched. The completion caller drops the redirect and the gate that existed only to consume it.

## Acceptance criteria

- Creating an issue yields the issue's key and address and nothing else.
- The start activity behaves as it does today, with its checkpoint still deciding whether an issue is created.
- A workflow that borrows the completion activity without the start activity has no unread value from this operation.
- No caller carries a gate that cannot be false.

## Non-goals

This does not change what an issue contains, which tracker it is raised against, or how the deferred-items register is written.

This does not touch two adjacent flags in the same activity that a fixer will meet: a second switch for creating a GitHub issue alongside a Jira one, and a third recording that issue creation was skipped. Whether those three collapse into one piece of state is a larger question about how that activity models its issue decision, and it deserves to be asked on its own rather than answered halfway here.

## Investigation detail

The counts come from the corpus at the merge of the deferred-items raising work: one result declaration, four references inside the operation's own steps, two checkpoint options that set the value, seven gates in the start activity that read it, and one redirect at the new caller. The shape was found while auditing that work against the design canon, and the redirect and the always-true gate it forced are in the pull request for it.

