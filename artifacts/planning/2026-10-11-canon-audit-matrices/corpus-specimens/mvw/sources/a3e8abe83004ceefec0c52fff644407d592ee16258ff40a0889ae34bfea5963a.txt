---
name: audit-domain-rubric
description: The audit domains a security audit groups a target's characteristics into, and the risk levels each domain is calibrated against.
---

# Audit Domain Rubric

## Security Characteristics

A characteristic is a security-relevant pattern a codebase actually contains. These are what a scan looks for, and what it finds is what grounds the domains below in evidence rather than in a checklist. The examples name common forms; they are not the whole of any category.

| Category | What to look for | Forms it takes |
|----------|------------------|----------------|
| Cryptography | Anywhere the code chooses or composes a primitive | Hashing, signing, encryption, key derivation, commitment schemes, proof systems |
| Identity and access | Anywhere the code decides who may do what | Credential handling, token or session validation, role and permission checks, access-control middleware |
| Untrusted input | Anywhere external data becomes internal structure | Deserialisation, binary and text parsing, schema-driven decoding, file and upload handling |
| External interface | Anywhere the process is reachable from outside itself | HTTP and RPC handlers, sockets, message consumers, scheduled or webhook entry points |
| Stored state | Anywhere data outlives the request that made it | Databases, caches, queues, filesystem writes, state machines, authenticated data structures |
| Value and assets | Anywhere the system tracks something whose amount matters | Balances, credits, quotas, inventory, ledgers, transfer and settlement paths |
| Memory and type safety | Anywhere the language's guarantees are set aside | Escape hatches such as Rust `unsafe`, C interop and FFI, pointer arithmetic, reinterpreting casts |
| Alternate execution | Anywhere code runs somewhere other than the main binary | Embedded interpreters, bytecode engines, expression evaluators, resource or cost metering, sandboxes |
| Alternate build target | Anywhere the artifact differs from the one under test | WebAssembly, native extensions, cross-compiled or vendored builds |
| Configuration and gating | Anywhere behaviour differs between environments | Feature flags, debug and test modes, mocked verification, environment-driven branches |
| Dependencies | Anywhere trust extends past the repository | Third-party packages, transitive pins, unmaintained or vendored code |

A codebase in which none of these appears has no security surface, and the count of characteristics found is what says so.

## Domains

A domain groups a target's characteristics into one area of concern that an audit can reason about as a whole. A domain enters an audit only where the target holds code for it, and a target whose concerns fall outside these takes a domain named for what its own code does.

| Domain | The question it asks |
|--------|----------------------|
| Cryptographic correctness | Are the primitives sound, correctly composed, and used with the parameters they require? |
| Access control | Can an actor reach something they should not, or act beyond what they were granted? |
| Input trust | Can external data reach a decision, a parser, or a store without being validated first? |
| Interface exposure | What is reachable from outside the process, and what can be done with it? |
| State integrity | Can stored data be corrupted, lost, or transitioned into a state the system does not expect? |
| Asset conservation | Can something of value be created, destroyed, or moved in a way the rules do not permit? |
| Execution safety | Can code or input escape the limits meant to contain it — memory, types, resources, or sandbox? |
| Failure behaviour | When something fails, does the system lose data, degrade silently, or expose more than it should? |
| Supply and configuration | Can a dependency, a flag, or an environment difference change the security posture? |

## Risk Levels

A domain's risk is calibrated against what a flaw in it would reach — its exposure, and its blast radius.

| Level | A flaw in this domain |
|-------|-----------------------|
| `CRITICAL` | Directly compromises system integrity or the assets it holds |
| `HIGH` | Degrades a security guarantee, or enables privilege escalation |
| `MEDIUM` | Has limited blast radius, or needs specific conditions to reach |
| `LOW` | Is informational, or a defence-in-depth improvement |

A domain holding code that crosses a trust boundary takes an elevated level, since a flaw there is reachable from outside the boundary it crosses.

These levels calibrate the prompt an audit hands to its analysis. The severity a finding carries afterwards is the one its source analysis assigned.
