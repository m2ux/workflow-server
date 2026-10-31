"""Every worktree the skill creates is placed by a field, and git places a
relative path where the command runs.

A worktree path that reads as a project-root path lands wherever the command
runs instead. Update Epic Base is reached from a dispatched unit session
working in its own worktree, so a base checked out that way nests inside it,
and the three commands that create a worktree each carry a path a caller
composes. The structural test holds each of them to a field that says where
its kind sits; the behavioural test pins the fact those fields rely on, so a
spec cannot claim a resolution git does not perform.
"""
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker

CREATES_WORKTREE = 'git worktree add'
GIT = ('git', '-c', 'user.email=t@t', '-c', 'user.name=T', '-c', 'init.defaultBranch=main')


def specs_creating_a_worktree():
    """Each Commands subsection whose block creates a worktree, with its prose."""
    for path in sorted((ROOT / 'artifacts').glob('*.md')):
        lines, _, headings = checker.scan(path)
        section = None
        for position, (start, level, title) in enumerate(headings):
            if level == 2:
                section = title
            if section != 'Commands' or level != 3:
                continue
            end = next((i for i, depth, _ in headings[position + 1:] if depth <= 3), len(lines))
            body = lines[start + 1:end]
            if any(CREATES_WORKTREE in line for line in body):
                yield path, title, body


def git(*args, cwd):
    return subprocess.run(GIT + args, cwd=cwd, capture_output=True, text=True)


class WorktreePlacement(unittest.TestCase):
    def test_a_worktree_command_cites_the_field_that_places_it(self):
        """A command that creates a worktree takes a path, so the spec names
        where that kind of worktree sits rather than leaving it to the
        caller's working directory."""
        found = list(specs_creating_a_worktree())
        self.assertTrue(found, 'no command creates a worktree')
        for path, title, body in found:
            with self.subTest(file=path.name, command=title):
                prose = '\n'.join(line for line in body if not line.startswith(('```', 'git ')))
                anchors = re.findall(r'\]\(#([a-z0-9-]+)\)', prose)
                self.assertTrue(anchors, 'the spec cites no placement field')
                fields = {checker.anchor_of(t) for _, level, t in checker.scan(path)[2] if level == 3}
                for anchor in anchors:
                    self.assertIn(anchor, fields)

    def test_a_relative_path_lands_where_the_command_runs(self):
        """The fact each placement field rests on. A path given relative to a
        linked worktree creates the new worktree inside that worktree, and an
        anchored path reaches the main working tree wherever it runs from."""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'project'
            root.mkdir()
            self.assertEqual(git('init', cwd=root).returncode, 0)
            (root / 'f').write_text('x')
            git('add', 'f', cwd=root)
            self.assertEqual(git('commit', '-m', 'first', cwd=root).returncode, 0)

            linked = root / '.worktrees' / 'unit'
            self.assertEqual(git('worktree', 'add', str(linked), '-b', 'unit', cwd=root).returncode, 0)

            # A dispatched session runs in the linked worktree and composes the
            # path the field states, spelled from the project root.
            self.assertEqual(git('worktree', 'add', '.worktrees/base', '-b', 'base',
                                 cwd=linked).returncode, 0)
            self.assertTrue((linked / '.worktrees' / 'base').is_dir(),
                            'git resolved the path against something other than the '
                            'working directory; the placement fields say it does not')
            self.assertFalse((root / '.worktrees' / 'base').exists())

            # The same session, giving the anchored path the field requires.
            anchored = root / '.worktrees' / 'anchored'
            self.assertEqual(git('worktree', 'add', str(anchored), '-b', 'anchored',
                                 cwd=linked).returncode, 0)
            self.assertTrue(anchored.is_dir())


if __name__ == '__main__':
    unittest.main()
