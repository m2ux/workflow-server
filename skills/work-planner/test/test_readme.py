"""The test folder's README names every module and every script, and its rows
match what the folder holds.

A catalogue a reader trusts is one a change cannot quietly outdate. The check
reads the two tables the README carries against the files beside it: each
module gets a row in the table its subject belongs to, each row's Scope names
the scripts that module imports or runs, and every script in the scripts
folder is named by some row.
"""
import ast
import functools
import re
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT.parent / 'scripts'))
import check_skill_files as checker  # noqa: E402

README = HERE / 'README.md'
SCRIPT_TESTS = '### Script Tests'
PROSE_TESTS = '### Prose Tests'
# The sentence the README took over, held as a pattern so this module carries
# no copy of it.
STALE = r'^Run from the skill directory: python3 -m unittest discover -s test$'
THIS = Path(__file__).name


@functools.lru_cache(maxsize=None)
def scripts_named(name: str) -> frozenset[str]:
    """Every script stem the module names in an import or a run."""
    text = (HERE / name).read_text()
    stems = {path.stem for path in (ROOT / 'scripts').glob('*.py')}
    found = set()
    for node in ast.walk(ast.parse(text)):
        if isinstance(node, ast.Import):
            found |= {alias.name.split('.')[0] for alias in node.names}
        elif isinstance(node, ast.ImportFrom) and node.module:
            found.add(node.module.split('.')[0])
    found |= {match.group(1) for match in re.finditer(r"['\"]([\w-]+)\.py['\"]", text)}
    return frozenset(found & stems)


def modules() -> list[str]:
    return sorted(path.name for path in HERE.glob('test_*.py') if path.name != THIS)


def scripts() -> list[str]:
    return sorted(path.stem for path in (ROOT / 'scripts').glob('*.py'))


def summary(name: str) -> str:
    """The module docstring's first sentence, without its full stop."""
    doc = ' '.join((ast.get_docstring(ast.parse((HERE / name).read_text())) or '').split())
    return re.split(r'(?<=[.!?]) ', doc)[0].rstrip('.')


def section(title: str) -> list[str]:
    """The lines under one heading, up to the next heading of the same or a
    higher level."""
    level = len(title) - len(title.lstrip('#'))
    body = README.read_text().split(f'\n{title}\n', 1)[1]
    end = re.search(rf'^#{{1,{level}}} ', body, re.MULTILINE)
    return (body[:end.start()] if end else body).splitlines()


def rows(title: str) -> list[list[str]]:
    """The body rows of the first table under a heading, cells stripped."""
    found, started = [], False
    for line in section(title):
        if line.startswith('|'):
            started = True
            found.append([cell.strip() for cell in line.strip().strip('|').split('|')])
        elif started:
            break
    return found[2:]


def catalogue() -> list[list[str]]:
    """Every catalogue row from both tables."""
    return rows(SCRIPT_TESTS) + rows(PROSE_TESTS)


def backticked(cell: str) -> list[str]:
    return re.findall(r'`([^`]+)`', cell)


class Catalogue(unittest.TestCase):
    def test_every_module_has_one_row(self):
        named = [backticked(row[0])[0] for row in catalogue()]
        self.assertEqual(sorted(set(modules()) - set(named)), [], 'modules with no catalogue row')
        self.assertEqual(len(named), len(set(named)), 'modules with two catalogue rows')

    def test_no_row_names_an_absent_module(self):
        held = {path.name for path in HERE.glob('*.py')}
        named = {backticked(row[0])[0] for row in catalogue()}
        self.assertEqual(sorted(named - held), [], 'catalogue rows with no module')

    def test_a_script_row_lists_the_scripts_its_module_names(self):
        for row in rows(SCRIPT_TESTS):
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(set(backticked(row[1])), {f'{script}.py' for script in scripts_named(name)})

    def test_a_module_sits_under_the_table_its_scripts_put_it_in(self):
        """A module that reaches a script is a script test, and one that
        reaches none is a prose test. The split is what the rows state."""
        for title, expected in ((SCRIPT_TESTS, True), (PROSE_TESTS, False)):
            for row in rows(title):
                name = backticked(row[0])[0]
                with self.subTest(module=name, table=title):
                    self.assertEqual(bool(scripts_named(name)), expected)

    def test_the_description_is_the_docstring(self):
        """The row states what the docstring states. Backticks mark a name in
        one and not the other, so they are not part of the comparison."""
        for row in catalogue():
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(row[2].replace('`', ''), summary(name).replace('`', ''))

    def test_the_count_is_the_modules_test_methods(self):
        for row in catalogue():
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(row[3], str(len(re.findall(r'^\s*def test_', (HERE / name).read_text(), re.M))))


class Scope(unittest.TestCase):
    def test_every_script_is_named_by_a_row(self):
        """A script exists because something exercises it, and the Scope cells
        are where the catalogue says what."""
        named = {script for row in catalogue() for script in backticked(row[1]) if script.endswith('.py')}
        self.assertEqual(sorted({f'{script}.py' for script in scripts()} - named), [],
                         'scripts named by no Scope cell')

    def test_no_scope_names_an_absent_script(self):
        named = {script for row in catalogue() for script in backticked(row[1]) if script.endswith('.py')}
        self.assertEqual(sorted(named - {f'{script}.py' for script in scripts()}), [],
                         'Scope entries with no script')

    def test_a_prose_row_scopes_a_document_and_never_a_script(self):
        """A prose test reaches no script, so its Scope cell names the documents
        it reads and no program."""
        for row in rows(PROSE_TESTS):
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual([entry for entry in backticked(row[1]) if entry.endswith('.py')], [],
                                 'a prose test scoping a script')
                self.assertTrue(backticked(row[1]), 'a prose test with no Scope entry')


class RunCommand(unittest.TestCase):
    def test_only_the_readme_carries_the_run_command(self):
        """A module restating the command once the README states it is a second
        home that a change to the command has to find."""
        holders = [path.name for path in HERE.glob('*.py')
                   if path.name != THIS and re.search(STALE, path.read_text(), re.MULTILINE)]
        self.assertEqual(holders, [], 'modules repeating the README run command')


class ReadmeShape(unittest.TestCase):
    def test_the_readme_resolves_every_link(self):
        lines, fenced, headings = checker.scan(README)
        self.assertTrue(headings)
        for _, target in checker.targets(README, lines, fenced):
            name = target.partition('#')[0]
            if name:
                with self.subTest(link=target):
                    self.assertTrue((HERE / name).exists() or (ROOT / name).exists())
