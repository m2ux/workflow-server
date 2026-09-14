#!/usr/bin/env python3
"""Every occurrence of the four-technique fan-out run, across a corpus tree.

The measurement behind stage 8's re-derivation, kept so it can be re-taken rather than rebuilt from
prose. Each activity's step list is flattened; a loop body is windowed as a sequence of its own as
well as sitting inside its parent's, so a run repeated inside one file is counted twice.

A window is a maximal stretch of steps binding members of the fan-out family, tolerating one
non-member between two members and reporting it as an interruption rather than ending the window.
Windows of fewer than two members are dropped, matching the census's own floor.

    python3 fan-out-occurrences.py <corpus-root>

Reported per occurrence: the file (and the loop, where the run is inside one), every step in the
window with its kind, id, bound operation and input bindings, the member count, which of the four
family positions are present, and how many steps interrupt it.
"""
import sys
from pathlib import Path

import yaml

FAMILY = [
    'orchestration-patterns::compose-worker-briefs',
    'orchestration-patterns::dispatch-workers',
    'orchestration-patterns::gather-results',
    'orchestration-patterns::synthesise-results',
]


def tech_name(step):
    """The operation a technique step binds, bare-string or structured."""
    binding = step.get('technique')
    if isinstance(binding, str):
        return binding
    if isinstance(binding, dict):
        return binding.get('name')
    return None


def tech_inputs(step):
    binding = step.get('technique')
    return binding.get('inputs') or {} if isinstance(binding, dict) else {}


def sequences(steps, label):
    """The top-level step list, and each loop body as a sequence of its own."""
    yield (label, steps)
    for step in steps or []:
        if step.get('kind') == 'loop':
            yield from sequences(step.get('steps') or [], f"{label} > loop {step.get('id')}")


def scan(path, root):
    document = yaml.safe_load(path.read_text())
    if not isinstance(document, dict) or 'steps' not in document:
        return
    for label, sequence in sequences(document.get('steps') or [], str(path.relative_to(root))):
        marks = [FAMILY.index(tech_name(s)) if tech_name(s) in FAMILY else None for s in sequence]
        index = 0
        while index < len(sequence):
            if marks[index] is None:
                index += 1
                continue
            cursor, members, interrupts = index, [], []
            while cursor < len(sequence):
                if marks[cursor] is not None:
                    members.append(cursor)
                elif members and cursor + 1 < len(sequence) and marks[cursor + 1] is not None:
                    interrupts.append(cursor)
                else:
                    break
                cursor += 1
            if len(members) >= 2:
                print('--', label)
                for position in range(members[0], members[-1] + 1):
                    step = sequence[position]
                    bound = tech_name(step) or ('actions' if step.get('actions') is not None else '')
                    print('   %s%-10s id=%-28s %s %s' % (
                        '   ' if position in members else '>> ',
                        step.get('kind'), step.get('id'), bound, tech_inputs(step) or ''))
                print('   members=%d positions=%s interrupts=%d' % (
                    len(members), sorted({marks[m] for m in members}), len(interrupts)))
            index = cursor if cursor > index else index + 1


def main():
    root = Path(sys.argv[1])
    files = sorted(root.rglob('activities/**/*.yaml'))
    print('activity files scanned:', len(files))
    for path in files:
        scan(path, root)


if __name__ == '__main__':
    main()
