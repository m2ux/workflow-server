---
metadata:
  version: 1.0.0
---

## Capability

Walk one root of the component and report its shape, reporting back the root this instance was handed.

## Inputs

### survey_root

The one root this instance walks, as a plain string — the directory's name, which is also this instance's id. Siblings walking other roots are handed their own; this instance reads nothing about theirs.

## Outputs

### tree_survey

What this instance found in its own root, and when it ran.

#### root

The root this instance walked, copied from what it was handed. The report reads this against the id of the slot it landed in, so an instance served a sibling's element is visible rather than silent.

#### depth

How many levels of directory the root nests, counting the root as one.

#### directories

How many directories the root holds, at every level.

#### files

How many files the root holds, at every level.

#### started_at

The instant this instance began, ISO 8601 UTC.

#### finished_at

The instant this instance finished, ISO 8601 UTC.

## Protocol

### 1. Record The Start

- Read the current instant and record it as `{tree_survey.started_at}`, before walking anything. An instant read after the walk describes when the instance finished reporting rather than when it began, and the report reads these against each other to tell a batch from a queue.

### 2. Walk The Root

- Walk `{survey_root}` under `{component_path}` and count what it holds: its nesting depth, its directories and its files. Read only within that root — a sibling instance is walking another one at this moment, and a count that reaches outside is a count of work this instance was not handed.
- Copy `{survey_root}` into `{tree_survey.root}` unchanged. It is the one value the report checks the routing against.

### 3. Record The Finish

- Read the current instant and record it as `{tree_survey.finished_at}`.

## Rules

### the-root-is-reported-back-unaltered

The root goes into the output exactly as it arrived. The report compares it against the id of the container slot this instance's result landed in, and the two agreeing is the evidence that each instance was served its own element. Normalising it — trimming a slash, expanding it to a full path — makes a disagreement unreadable as a disagreement.

### one-instance-reads-one-root

An instance counts what is under the root it was handed and nothing else. The whole component's shape is what the file survey running alongside it reports; an instance that walks further duplicates that survey and makes the two disagree.
