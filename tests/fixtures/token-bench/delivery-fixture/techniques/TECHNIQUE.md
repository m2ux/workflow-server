---
metadata:
  version: 1.0.0
---

## Capability

Contract shared by every measurement this fixture takes — the directory each one reads, and what a measurement owes the activity that binds it.

## Inputs

### target_path

The directory a measurement reads, relative to the component root.

## Rules

### a-measurement-reads-one-directory

A measurement answers from one directory listing and reads no file contents. The fixture exists to price delivery, so a measurement that costs more than the delivery it is measuring has changed what is being measured.

### a-measurement-answers-under-its-declared-name

Every measurement lands under the output id its signature declares. An answer under a name of its own is one no later gate in the activity can read.

### a-measurement-states-what-it-skipped

A measurement that passes over an entry says so in its output. A count that silently omits what it could not read is indistinguishable from one that found nothing.
