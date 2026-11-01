"""Each scenario's required reads, walked over one skills tree.

A scenario is one complete mode run: the reader holds the skill's entry
point, opens the selected mode and runs its procedure. What the reader must
load follows the shared skill-file check's own citation kinds, imported from
the checker path given, so one classification reads every revision:

  step           runs its target: the cited section, or a whole file's
                 procedure where the citation names no section
  specification  a command specification's citation, required to run it
  prerequisite   a canonical prerequisite sentence or a Prerequisites
                 section entry, read as a document without running it
  descriptive    followed by no one; recorded in the trace as not followed

Reading rules, from the Work Planner entry point's Linked sections:

  - A cited section is read with its subsections, stopping before the next
    heading of equal or higher level.
  - A file's Prerequisites load when the file is first opened, except a mode
    read as a document, whose Prerequisites load only where a step runs it.
  - A section already read at this revision is reused rather than read again.
  - Every step is taken. A scenario's exclude list names the mode sections
    its run does not enter, such as a procedure a dispatched session runs.

The measure is the count of distinct instruction files a scenario opens, with
lines loaded as a secondary observation. A citation to a file outside the
tree, or to a heading the file lacks, is recorded as unresolved rather than
dropped. A required file other than Markdown, such as a template, is listed
among the scenario's assets and not counted.

    python3 walk.py <check_skill_files.py> <skills-root> <scenarios.json> <out.json>
"""

import hashlib
import importlib.util
import json
import sys
from pathlib import Path


def load(path):
    spec = importlib.util.spec_from_file_location('check_skill_files', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Walk:
    def __init__(self, check, root, skill, exclude):
        self.check = check
        self.root = root
        self.skill = skill
        self.exclude = exclude
        self.files = {}
        self.structures = {}
        self.opened = []
        self.seen = set()
        self.prerequisites_loaded = set()
        self.trace = []
        self.skipped = []
        self.unresolved = []
        self.assets = []

    def name(self, path):
        return str(path.relative_to(self.root)) if path.is_relative_to(self.root) else str(path)

    def info(self, path):
        if path not in self.files:
            lines, fenced, headings = self.check.scan(path)
            kinds = self.check.citation_kinds(path, self.check.contract(path, self.structures))
            self.files[path] = (lines, headings, kinds)
        return self.files[path]

    def span(self, path, anchor):
        lines, headings, _ = self.info(path)
        if not anchor:
            return range(len(lines))
        for position, (index, level, title) in enumerate(headings):
            if self.check.anchor_of(title) == anchor:
                end = next((later for later, depth, _ in headings[position + 1:] if depth <= level),
                           len(lines))
                return range(index, end)
        return None

    def section_of(self, path, heading):
        """Line indices of a top-level section named exactly so."""
        lines, headings, _ = self.info(path)
        tops = [(index, title.strip()) for index, level, title in headings if level <= 2]
        for position, (start, title) in enumerate(tops):
            if title == heading:
                end = tops[position + 1][0] if position + 1 < len(tops) else len(lines)
                return set(range(start, end))
        return set()

    def excluded(self, path):
        held = set()
        for anchor in self.exclude.get(self.name(path), ()):
            if (lines := self.span(path, anchor)) is not None:
                held.update(lines)
        return held

    def resolve(self, path, target):
        name, _, fragment = target.partition('#')
        destination = (path.parent / name).resolve() if name else path
        return destination, self.check.anchor_of(fragment) if fragment else ''

    def visit(self, path, anchor, how, via, kind):
        label = f'{self.name(path)}#{anchor}' if anchor else self.name(path)
        if not path.is_file() or not path.is_relative_to(self.root):
            self.unresolved.append({'target': label, 'via': via, 'kind': kind,
                                    'reason': 'no such file in the tree'})
            return
        if path.suffix != '.md':
            if label not in self.assets:
                self.assets.append(label)
            return
        if anchor in self.exclude.get(self.name(path), ()):
            self.trace.append({'read': label, 'how': 'excluded', 'via': via, 'kind': kind})
            return
        lines = self.span(path, anchor)
        if lines is None:
            self.unresolved.append({'target': label, 'via': via, 'kind': kind,
                                    'reason': 'no such heading'})
            return
        key = (path, anchor)
        if (key, how) in self.seen or (how == 'read' and (key, 'run') in self.seen):
            return
        self.seen.add((key, how))
        if path not in self.opened:
            self.opened.append(path)
        self.trace.append({'read': label, 'how': how, 'via': via, 'kind': kind})

        is_mode = path.name.endswith('-mode.md')
        if path not in self.prerequisites_loaded and not (is_mode and how == 'read'):
            self.prerequisites_loaded.add(path)
            listed = self.section_of(path, 'Prerequisites')
            for index, target, cited in self.info(path)[2]:
                if index in listed:
                    self.follow(path, index, target, 'read', label, cited)

        listed = self.section_of(path, 'Prerequisites')
        held = self.excluded(path)
        for index, target, cited in self.info(path)[2]:
            if index not in lines or index in listed or index in held:
                continue
            if cited == self.check.PREREQUISITE_READ:
                self.follow(path, index, target, 'read', label, cited)
            elif how == 'run' and cited == self.check.STEP:
                self.follow(path, index, target, 'run', label, cited)
            elif how == 'run' and anchor and cited == self.check.SPECIFICATION:
                self.follow(path, index, target, 'run', label, cited)
            else:
                self.skipped.append({'target': target, 'in': label, 'line': index + 1,
                                     'kind': cited, 'how': how})

    def follow(self, path, index, target, how, via, kind):
        destination, anchor = self.resolve(path, target)
        self.visit(destination, anchor, how, f'{via}:{index + 1}', kind)


def mode_file(skill, mode):
    found = sorted(skill.rglob(f'{mode}-mode.md'))
    return found[0] if len(found) == 1 else None


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main(argv):
    checker, root, scenarios, out = (Path(arg).resolve() for arg in argv[1:5])
    check = load(checker)
    fixture = json.loads(scenarios.read_text())
    results = []
    covered = set()
    for case in fixture['scenarios']:
        skill = root / case['skill']
        mode = mode_file(skill, case['mode'])
        entry = skill / 'SKILL.md'
        if mode is None or not entry.is_file():
            results.append({'id': case['id'], 'status': 'unresolved',
                            'reason': 'mode or entry point absent at this revision'})
            continue
        covered.add(mode)
        walk = Walk(check, root, skill, case.get('exclude', {}))
        walk.visit(entry, '', 'read', 'selection', 'entry')
        walk.visit(mode, '', 'run', 'selection', 'mode')
        lines = sum(len(walk.info(path)[0]) for path in walk.opened)
        results.append({
            'id': case['id'], 'skill': case['skill'], 'mode': case['mode'],
            'status': 'unresolved' if walk.unresolved else 'measured',
            'files': len(walk.opened), 'lines': lines,
            'opened': [walk.name(path) for path in walk.opened],
            'assets': walk.assets, 'trace': walk.trace, 'not_followed': walk.skipped,
            'unresolved': walk.unresolved,
        })
    present = sorted(walk_name for skill in {case['skill'] for case in fixture['scenarios']}
                     for walk_name in (str(path.relative_to(root))
                                       for path in (root / skill).rglob('*-mode.md')
                                       if path not in covered))
    record = {
        'instrument': {'walk': digest(__file__), 'checker': digest(checker),
                       'scenarios': digest(scenarios)},
        'modes_without_scenario': present,
        'results': results,
    }
    out.write_text(json.dumps(record, indent=1) + '\n')
    print('scenario\tstatus\tfiles\tlines')
    for result in results:
        print(f"{result['id']}\t{result['status']}\t{result.get('files', '')}\t{result.get('lines', '')}")
    for name in present:
        print(f'mode without scenario: {name}')
    return 1 if present or any(result['status'] != 'measured' for result in results) else 0


if __name__ == '__main__':
    sys.setrecursionlimit(10000)
    sys.exit(main(sys.argv))
