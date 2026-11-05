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


def modules() -> list[str]:
    return sorted(path.name for path in HERE.glob('test_*.py') if path.name != THIS)


def scripts() -> list[str]:
    return sorted(path.stem for path in (ROOT / 'scripts').glob('*.py'))


def summary(name: str) -> str:
    """The module docstring's first sentence, without its full stop."""
    doc = ' '.join((ast.get_docstring(ast.parse((HERE / name).read_text())) or '').split())
    return re.split(r'(?<=[.!?]) ', doc)[0].rstrip('.')


FOLDERS = ('modes', 'artifacts', 'protocols', 'references')
WHOLE_SKILL = frozenset([f'{folder}/' for folder in FOLDERS] + ['SKILL.md', 'guidelines.md'])
# The catalogue this folder carries, which the check reads rather than a skill
# document. Held in a constant so the check does not read its own search for it.
CATALOGUE = 'test/README.md'
READ_EVERY_FILE = 'rglob(' + "'*.md'" + ')'


@functools.lru_cache(maxsize=None)
def documents(name: str) -> frozenset[str]:
    """The skill documents the module reads, as the paths its source names.

    A module reading every markdown file covers each document. Otherwise each
    file it names is one entry and each folder it globs is another, except
    where it names a file within that folder.
    """
    if name == THIS:
        return frozenset([CATALOGUE])
    text = (HERE / name).read_text()
    if READ_EVERY_FILE in text:
        return WHOLE_SKILL
    files = {f'{folder}/{filename}'
             for folder, filename in re.findall(r"ROOT / '(\w+)' / '([\w-]+\.md)'", text)}
    folders = {f'{folder}/' for folder in re.findall(r"ROOT / '(\w+)'", text) if folder in FOLDERS}
    folders = {folder for folder in folders if not any(file.startswith(folder) for file in files)}
    found = files | folders
    found |= {filename for filename in ('SKILL.md', 'guidelines.md') if f"'{filename}'" in text}
    if "SKILLS.glob('*/SKILL.md')" in text:
        found.add('*/SKILL.md')
    return frozenset(found)


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
                self.assertEqual(row[1].replace('`', ''), summary(name).replace('`', ''))

    def test_the_count_is_the_modules_test_methods(self):
        for row in catalogue():
            name = backticked(row[0])[0]
            with self.subTest(module=name):
                self.assertEqual(row[2], str(len(re.findall(r'^\s*def test_', (HERE / name).read_text(), re.M))))


class Coverage(unittest.TestCase):
    def test_every_script_has_one_row(self):
        named = [backticked(row[0])[0] for row in rows(COVERAGE) if backticked(row[0])
                 and backticked(row[0])[0].endswith('.py')]
        self.assertEqual(sorted({f'{script}.py' for script in scripts()} - set(named)), [],
                         'scripts with no coverage row')
        self.assertEqual(len(named), len(set(named)), 'scripts with two coverage rows')

    def test_no_row_names_an_absent_script(self):
        named = {backticked(row[0])[0] for row in rows(COVERAGE)
                 if backticked(row[0]) and backticked(row[0])[0].endswith('.py')}
        self.assertEqual(sorted(named - {f'{script}.py' for script in scripts()}), [],
                         'coverage rows with no script')

    def test_a_row_names_every_module_that_reaches_the_script(self):
        for row in rows(COVERAGE):
            cell = backticked(row[0])
            if not cell or not cell[0].endswith('.py'):
                continue
            script = Path(cell[0]).stem
            holders = {name for name in modules() if script in scripts_named(name)}
            with self.subTest(script=script):
                self.assertEqual(set(backticked(row[1])), holders)

    def test_a_document_row_names_every_prose_module_that_reads_it(self):
        """A prose test reaches no script, so the coverage table states it
        against the documents it reads. The check itself is counted, since it
        reads this catalogue."""
        for row in rows(COVERAGE):
            cell = backticked(row[0])
            if not cell or cell[0].endswith('.py'):
                continue
            readers = {name for name in modules() + [THIS]
                       if not scripts_named(name) and cell[0] in documents(name)}
            with self.subTest(document=cell[0]):
                self.assertTrue(readers, f'{cell[0]} is read by no prose module')
                self.assertEqual(set(backticked(row[1])), readers)

    def test_every_prose_module_is_named_somewhere(self):
        named = {module for row in rows(COVERAGE) for module in backticked(row[1])}
        silent = {name for name in modules() + [THIS] if not scripts_named(name)} - named
        self.assertEqual(sorted(silent), [], 'prose modules named by no coverage row')


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
