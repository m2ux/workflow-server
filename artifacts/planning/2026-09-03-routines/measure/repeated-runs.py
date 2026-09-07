#!/usr/bin/env python3
"""Repeated runs of steps, across every activity in the corpus.

The measurement behind drift-census.md, kept so it can be re-taken rather than rebuilt from prose.
Stage 1 of the routines proposal promotes it to `scripts/check-repeated-runs.ts`, where its output
becomes findings against a baseline; here it is a census.

An activity's step list is reduced to a sequence of signatures, and every consecutive window of
two to eight is indexed. A window appearing in two or more activity FILES is a shared run. Windows
contained in a longer shared window over the same file set are dropped, leaving the maximal ones.

Signatures ignore what a site is free to vary and keep what the run is:

  technique    the operation reference, plus the sorted keys of its input bindings
  checkpoint   the shared-body reference, or the sorted inline option ids
  loop         the iteration type, the collection, and the body's own signatures
  action       the sorted action verbs and their targets

Identifiers, `when` gates, `condition` blocks, `continueWhile`, `maxIterations` and prose sign as
nothing: they are the differences a routine's reference site is meant to carry.

Loop bodies are windowed as their own sequences as well as signing into their parent's window. The
census this reproduces saw top-level sequences only, so a run shared inside two loop bodies was
invisible to it; those windows are reported separately below.

    python3 repeated-runs.py [--root <workflows-dir>]
"""
from __future__ import annotations

import argparse
import pathlib
import sys
from collections import defaultdict

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit('pyyaml is required')

MIN_WINDOW = 2
MAX_WINDOW = 8


def op_reference(binding) -> str:
    """The operation a technique step binds, bare-string or structured."""
    if isinstance(binding, str):
        return binding
    if isinstance(binding, dict):
        return str(binding.get('name', ''))
    return ''


def input_keys(binding) -> str:
    if isinstance(binding, dict) and isinstance(binding.get('inputs'), dict):
        return ','.join(sorted(binding['inputs']))
    return ''


def signature(step: dict) -> str:
    kind = step.get('kind')
    if kind == 'technique':
        binding = step.get('technique')
        return 'T:' + op_reference(binding) + '(' + input_keys(binding) + ')'
    if kind == 'checkpoint':
        if step.get('ref'):
            return 'C:ref=' + str(step['ref'])
        options = step.get('options') or []
        ids = sorted(str(o.get('id', '')) for o in options if isinstance(o, dict))
        return 'C:[' + ','.join(ids) + ']'
    if kind == 'action':
        parts = []
        for action in step.get('actions') or []:
            if isinstance(action, dict):
                parts.append(str(action.get('action', '')) + '=' + str(action.get('target', '')))
        return 'A:' + ','.join(sorted(parts)) if parts else 'A:marker'
    if kind == 'loop':
        body = ';'.join(signature(s) for s in (step.get('steps') or []) if isinstance(s, dict))
        return 'L:' + str(step.get('loopType')) + '/' + str(step.get('over') or '') + '{' + body + '}'
    return 'X:' + str(kind)


def sequences(steps, path):
    """Every step list in an activity: the top-level one, then each loop body, with its depth."""
    yield [s for s in steps if isinstance(s, dict)], 0
    for step in steps:
        if isinstance(step, dict) and step.get('kind') == 'loop':
            for nested, depth in sequences(step.get('steps') or [], path):
                yield nested, depth + 1


def collect(root: pathlib.Path):
    windows = defaultdict(set)      # window signature -> set of activity files
    depth_of = {}                   # window signature -> shallowest depth it was seen at
    files = 0
    for path in sorted(root.glob('*/activities/**/*.yaml')):
        try:
            doc = yaml.safe_load(path.read_text())
        except yaml.YAMLError:
            continue
        if not isinstance(doc, dict) or not isinstance(doc.get('steps'), list):
            continue
        files += 1
        label = str(path.relative_to(root))
        for steps, depth in sequences(doc['steps'], label):
            signs = [signature(s) for s in steps]
            for size in range(MIN_WINDOW, MAX_WINDOW + 1):
                for start in range(0, len(signs) - size + 1):
                    key = ' | '.join(signs[start:start + size])
                    windows[key].add(label)
                    depth_of[key] = min(depth_of.get(key, depth), depth)
    return windows, depth_of, files


def maximal(shared):
    """Drop any window contained in a longer shared window over the same file set."""
    out = []
    for key, owners in shared.items():
        contained = False
        for other, other_owners in shared.items():
            if other is key or len(other) <= len(key):
                continue
            if owners == other_owners and (' | ' + key + ' | ') in (' | ' + other + ' | '):
                contained = True
                break
        if not contained:
            out.append((key, owners))
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='/home/mike1/projects/dev/workflow-server/workflows')
    args = parser.parse_args()
    root = pathlib.Path(args.root)

    windows, depth_of, files = collect(root)
    shared = {k: v for k, v in windows.items() if len(v) >= 2}
    result = maximal(shared)
    result.sort(key=lambda kv: (-len(kv[0].split(' | ')), -len(kv[1])))

    top = [(k, o) for k, o in result if depth_of[k] == 0]
    nested = [(k, o) for k, o in result if depth_of[k] > 0]

    print('activity files parsed: ' + str(files))
    print('maximal shared windows: ' + str(len(result)) + '  (top level ' + str(len(top))
          + ', inside a loop body ' + str(len(nested)) + ')')
    for label, group in (('TOP LEVEL', top), ('INSIDE A LOOP BODY', nested)):
        if not group:
            continue
        print('')
        print('== ' + label)
        for key, owners in group:
            steps = key.split(' | ')
            print('')
            print('  ' + str(len(steps)) + ' steps, ' + str(len(owners)) + ' activities')
            for owner in sorted(owners):
                print('    ' + owner)
            for step in steps:
                print('      ' + step)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
