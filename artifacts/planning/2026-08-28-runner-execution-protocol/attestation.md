# Why the runner carries no signature

Companion to [README.md](README.md), for [#523](https://github.com/m2ux/workflow-server/issues/523). This
records an option that was considered and set aside, so the issue body can state the chosen design
plainly without carrying the comparison.

## The option

The server sends the agent a program, as an attachment on an ordinary tool response. The program carries
out the mechanical parts of the workflow, so it becomes the thing that runs the workflow and the server
becomes the thing that checks it. Built into the program is a secret key, which it uses whenever it
touches the session, so the server can tell that the agent is running the real program rather than a
substitute of its own.

The intent is sound: make the mechanical reading of a workflow something a program does rather than
something an agent is asked to do, and have some way of knowing the program was actually used. It is the
second half that does not work.

## Why the checking does not work

**A signature says who made something, not what was run.** Signing the program establishes that the
server produced it. It says nothing about whether the agent then ran it. An agent can check the signature,
set the program aside, and make the session calls itself by hand. There is nothing a signature can do to
reach forward in time and constrain what happens after it has been checked.

**A key inside a program that the reader controls is a key the reader can take.** The program runs on the
agent's own machine, in a process the agent owns, and can be paused and inspected at will. Hiding a key
inside a program whose reader is also its adversary is a known and unsolved problem — it is the problem
copy-protection systems have been losing for thirty years. Every deployed example buys time against
casual copying and eventually falls to someone determined. And once the key is out, it signs anything: it
proves that whoever called possessed a secret, never that the workflow's rules were followed.

**The reader here is unusually well equipped.** Copy protection at least faces a person with a
disassembler. This design would deliver the program through the same channel, to the very agent whose
behaviour it is meant to constrain — something with a shell, file access, and no hesitation about looking
at what it was handed.

## The question that settles it

There are two quite different things one might be defending against, and they call for opposite
treatments.

| What is being defended against | What actually works |
|---|---|
| **Honest mistakes** — an agent misreads the structure, skips a step whose condition it got wrong, repeats a loop the wrong number of times, or reports having done something it did not | No cryptography at all. The server works out the right answer and refuses the wrong one. |
| **A deliberately dishonest agent** | Nothing on the agent's side of the line helps, because the agent controls that side. The only defence is that the server holds the real state and accepts only changes it can work out for itself. |

Everything this work addresses is the first kind. Throughout, the concern has been whether the structure
is read correctly, not whether someone is attacking the system.

## What replaces it

The server works out each transition itself, from the definitions and the session it already holds, and
accepts only the transitions it can reproduce. A substitute program cannot produce a valid session — not
because it lacks a key, but because the server will not accept a change it did not independently arrive
at.

The useful consequence is this: a substitute program that produces *correct* transitions becomes
indistinguishable from the genuine one, **and equally acceptable**. Who called stops being a question
worth asking. What matters is whether the result is right, and that the server can establish directly.

Working it out again is cheap here. The condition evaluator, the structured-condition evaluator, the table
mapping outcomes to destinations (`getExitBindings`, `src/loaders/workflow-loader.ts:510-522`) and the
loaders are all server code that the guards and the end-to-end harness already use. The transition rule is
even written down twice, once as instructions for an agent in
`workflows/meta/techniques/workflow-engine/evaluate-transition.md` and once as code in
`tests/e2e/walker.ts:250-269`, and the two agree. Buying certainty with cryptography would mean paying a
great deal to avoid paying very little.

## Problems with sending a program, setting the checking aside

Even if the checking worked, delivering a program down the tool channel is the wrong mechanism.

- **Tool responses are text.** A program would have to be encoded as text and read into the agent's
  conversation, which is the most expensive place in the whole system to put bytes — a single agent turn
  already re-reads around 58,700 tokens of accumulated context.
- **Every combination of operating system and processor needs its own build**, each with its own signing
  step behind it.
- **Something has to be willing to run it.** The agent's harness would need to permit executing a program
  it had just downloaded, which is a far larger thing to ask than anything the server does today, and many
  harnesses will simply decline.
- **The program's idea of the session could fall out of step with the server's.** The session schema
  quietly discards anything it does not recognise (`src/schema/session.schema.ts:72` is an ordinary object
  schema), and `src/utils/session/resolver.ts:148-156` reports the resulting mismatch as a signature
  failure — that is, as suspected tampering rather than as a version difference.

## The part of the idea that is kept

The instinct underneath is right and is adopted: **express the mechanical reading of a workflow as code
rather than as prose.** Around 33,000 characters of every delivery are rules and techniques whose only
subject is how to interpret the structure. Replacing those with something that executes is a real saving
and a real gain in reliability, and it is the same instinct that makes the end-to-end harness a better
description of how a workflow runs than any prose specification.

That idea needs neither a signature nor a delivered program.

## The form adopted

The runner is published as a package and installed, rather than delivered. The server already ships that
way, so running it is a matter of the harness invoking a local command. That gives distribution and
versioning for free, avoids the operating-system builds entirely if it is written in the same language as
the server, and — if a signature is ever wanted for confidence in the *supply of the package*, which is a
different question from confidence in what was executed — the package registry already provides one.

This is recorded in the issue as two things the proposal deliberately does not do: the server accepts a
transition because it arrives at the same one, not because the caller proves who it is; and nothing is
sent down the tool channel as a program.

## The one circumstance that would change this

If the server ever needed to skip working a transition out for itself, for cost reasons, and take a
claimed result on trust instead. Working it out is cheap here, so that circumstance does not arise — but
it is the thing to watch if the cost of checking ever becomes significant.
