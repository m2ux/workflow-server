"""The test folder's README names every module and every script, and its rows
match what the folder holds.

A catalogue a reader trusts is one a change cannot quietly outdate. The check
reads the two tables the README carries against the files beside it: each
module gets a row, each script gets one, no row survives its file, and each
row's Scripts cell names the scripts that module imports or runs.
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
CATALOGUE = '## Catalogue'
COVERAGE = '## Coverage'
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


@functools.lru_cache(maxsize=None)
def helpers() -> frozenset[str]:
    """The scripts the shared fixture module builds its runner from."""
    return scripts_named('fixtures.py')


@functools.lru_cache(maxsize=None)
def importing(script: str) -> frozenset[str]:
    """The scripts that import the script."""
    return frozenset(path.stem for path in (ROOT / 'scripts').glob('*.py')
                     if path.stem != script and script in scripts_named(path.name))


def modules() -> list[str]:
    return sorted(path.name for path in HERE.glob('test_*.py') if path.name != THIS)


def reached(script: str) -> bool:
    """Whether a module exercises the script, directly or through its importer."""
    if script in helpers():
        return True
    if any(script in scripts_named(name) for name in modules()):
        return True
    return bool(importing(script) & set(modules()))


def scripts() -> list[str]:
    return sorted(path.stem for path in (ROOT / 'scripts').glob('*.py'))


def summary(name: str) -> str:
    """The module docstring's first sentence, without its full stop."""
    doc = ' '.join((ast.get_docstring(ast.parse((HERE / name).read_text())) or '').split())
    return re.split(r'(?<=[.!?]) ', doc)[0].rstrip('.')


def section(title: str) -> list[str]:
    """The lines under one heading, up to the next heading of the same level."""
    body = README.read_text().split(f'\n{title}\n', 1)[1]
    end = re.search(r'^## ', body, re.MULTILINE)
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


def backticked(cell: str) -> list[str]:
    return re.findall(r'`([^`]+)`', cell)


class Catalogue(unittest.TestCase):
    def test_every_module_has_one_row(self):
        named = [backticked(row[0])[0] for row in rows(CATALOGUE)]
        self.assertEqual(sorted(set(modules()) - set(named)), [], 'modules with no catalogue row')
        self.assertEqual(len(named), len(set(named)), 'modules with two catalogue rows')

    def test_no_row_names_an_absent_module(self):
        held = {path.name for path in HERE.glob('*.py')}
        named = {backticked(row[0])[0] for row in rows(CATALOGUE)}
        self.assertEqual(sorted(named - held), [], 'catalogue rows with no module')

    def test_a_row_lists_the_scripts_its_module_names(self):
        for row in rows(CATALOGUE):
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(set(backticked(row[2])), {f'{script}.py' for script in scripts_named(name)})

    def test_the_description_is_the_docstring(self):
        """The row states what the docstring states. Backticks mark a name in
        one and not the other, so they are not part of the comparison."""
        for row in rows(CATALOGUE):
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(row[1].replace('`', ''), summary(name).replace('`', ''))

    def test_the_count_is_the_modules_test_methods(self):
        for row in rows(CATALOGUE):
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(row[3], str(len(re.findall(r'^\s*def test_', (HERE / name).read_text(), re.M))))


class Coverage(unittest.TestCase):
    def test_every_script_has_one_row(self):
        named = [backticked(row[0])[0] for row in rows(COVERAGE)]
        self.assertEqual(sorted({f'{script}.py' for script in scripts()} - set(named)), [],
                         'scripts with no coverage row')
        self.assertEqual(len(named), len(set(named)), 'scripts with two coverage rows')

    def test_no_row_names_an_absent_script(self):
        named = {backticked(row[0])[0] for row in rows(COVERAGE)}
        self.assertEqual(sorted(named - {f'{script}.py' for script in scripts()}), [],
                         'coverage rows with no script')

    def test_a_row_names_every_module_that_reaches_the_script(self):
        for row in rows(COVERAGE):
            script = Path(backticked(row[0])[0]).stem
            holders = {name for name in modules() if script in scripts_named(name)}
            with self.subTest(script=script):
                self.assertEqual(set(backticked(row[1])), holders)

    def test_every_script_is_reached_somewhere(self):
        for script in scripts():
            with self.subTest(script=script):
                self.assertTrue(reached(script), f'{script}.py is reached by no module')


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
