"""The script registry, kinds.py, maps each kind of work to its module and selects an item's kind from its title, and each registered module supplies the Kind interface.
"""
import ast
import inspect
import re
import sys
import types
import unittest
from unittest import mock

from fixtures import SCRIPTS, issue, pr
from fixtures import hotfix as hotfix_issue

sys.path.insert(0, str(SCRIPTS))
import hotfix  # noqa: E402
import kinds  # noqa: E402
from kinds import KINDS, OFF_BOARD, Kind, interface, kind_of  # noqa: E402

KEY = ('o/r', 4)


def operations() -> dict[str, inspect.Signature]:
    """Each operation the Kind interface declares, with its parameters after self."""
    found = {}
    for name, member in vars(Kind).items():
        if inspect.isfunction(member) and not name.startswith('_'):
            signature = inspect.signature(member)
            found[name] = signature.replace(parameters=list(signature.parameters.values())[1:])
    return found


def kind_mentions(source: str) -> list[str]:
    """Each kind module a script's source imports, and each spelling of a registered kind's name or
    module, or of a tag of its letter, anywhere in the source, docstrings and comments included."""
    tree = ast.parse(source)
    imported = {alias.name for node in ast.walk(tree) if isinstance(node, ast.Import) for alias in node.names}
    imported |= {node.module for node in ast.walk(tree) if isinstance(node, ast.ImportFrom)}
    found = sorted(imported & set(KINDS.values()))
    for kind, module in KINDS.items():
        spellings = {kind, module, kind.replace('-', ' ')}
        found += [name for name in sorted(spellings) if name in source.lower()]
        found += re.findall(rf'\[{interface(kind).letter()}\d\d\]', source)
    return found


def linked(record: dict, *numbers: int) -> dict:
    record['closingIssuesReferences'] = [{'repo': 'o/r', 'number': n} for n in numbers]
    return record


class Registry(unittest.TestCase):
    def test_each_kind_maps_to_a_module_in_the_scripts_folder(self):
        self.assertEqual(KINDS, {'hot-fix': 'hotfix'})
        for kind, module in KINDS.items():
            with self.subTest(kind=kind):
                self.assertTrue((SCRIPTS / f'{module}.py').is_file())
                self.assertIs(interface(kind), sys.modules[module])

    def test_a_name_the_registry_does_not_hold_has_no_interface(self):
        with self.assertRaises(KeyError):
            interface('initiative')


class Lookup(unittest.TestCase):
    def test_a_hot_fix_title_selects_the_hot_fix_kind(self):
        self.assertEqual(kind_of(hotfix_issue(4)), 'hot-fix')
        self.assertEqual(kind_of(pr(951, '[F04] Reject Bad Keys', base='main')), 'hot-fix')

    def test_an_item_of_no_registered_kind_selects_none(self):
        for title in ('[I07] Canon Walk: Definitions Checked', '[I07:E02] Skill Separation',
                      '[I07:E02:W03] Kind Registry', 'Key Validation: Reject Bad Keys', ''):
            with self.subTest(title=title):
                self.assertIsNone(kind_of(issue(5, title, labels=('type:hot-fix',))))
        self.assertIsNone(kind_of({'number': 5, 'title': None}))
        self.assertIsNone(kind_of({'number': 5}))

    def test_an_unknown_prefix_selects_none(self):
        for title in ('[X01] Reject Bad Keys', '[F4] Reject Bad Keys', '[f04] Reject Bad Keys',
                      '[F004] Reject Bad Keys', 'Reject [F04] Bad Keys', ' [F04] Reject Bad Keys'):
            with self.subTest(title=title):
                self.assertIsNone(kind_of(issue(5, title)))


class Mentions(unittest.TestCase):
    def test_the_search_finds_each_kind_import_name_and_tag(self):
        self.assertEqual(kind_mentions('from hotfix import tag\n'), ['hotfix', 'hotfix'])
        self.assertEqual(kind_mentions('"""Places each hot-fix."""\n'), ['hot-fix'])
        self.assertEqual(kind_mentions("TITLE = '[F04] Fix'\n"), ['[F04]'])
        self.assertEqual(kind_mentions('from kinds import kind_of\n'), [])


class Substitution(unittest.TestCase):
    def test_every_registered_module_supplies_each_operation_with_its_contract(self):
        for kind in KINDS:
            module = interface(kind)
            for name, signature in operations().items():
                with self.subTest(kind=kind, operation=name):
                    self.assertTrue(callable(getattr(module, name, None)))
                    self.assertEqual(inspect.signature(getattr(module, name)), signature)

    def test_a_registered_module_is_selected_and_reached_through_the_interface(self):
        stand_in = types.ModuleType('stand_in')
        stand_in.tag = lambda item: 'Z01' if (item.get('title') or '').startswith('[Z01]') else None
        stand_in.target = lambda issue: 'workspace'
        with mock.patch.dict(sys.modules, {'stand_in': stand_in}), \
                mock.patch.dict(kinds.KINDS, {'stand-in': 'stand_in'}):
            self.assertEqual(kind_of(issue(5, '[Z01] Stand In')), 'stand-in')
            self.assertEqual(kind_of(hotfix_issue(4)), 'hot-fix')
            self.assertEqual(interface(kind_of(issue(5, '[Z01] Stand In'))).target(issue(5, '[Z01] Stand In')),
                             'workspace')
        self.assertIsNone(kind_of(issue(5, '[Z01] Stand In')))

    def test_the_hot_fix_module_shares_the_contracts_off_board_status_key_and_review(self):
        self.assertIs(hotfix.OFF_BOARD, OFF_BOARD)
        self.assertIs(hotfix.Key, kinds.Key)
        self.assertIs(hotfix.Review, kinds.Review)

    def test_the_hot_fix_kind_answers_an_item_of_any_kind_with_the_contracts_result_types(self):
        kind = interface('hot-fix')
        for item in (hotfix_issue(4), issue(5, '[I07] Canon Walk'), issue(6, 'Standalone', body=''),
                     {'number': 7, 'title': None, 'state': 'open', 'body': None}):
            with self.subTest(title=item['title']):
                self.assertIn(type(kind.tag(item)), (str, type(None)))
                self.assertIsInstance(kind.labels(item), list)
                self.assertIsInstance(kind.faults(item), list)
                self.assertIsInstance(kind.target(item), str)
                self.assertIsInstance(kind.linking_pulls([], KEY), list)
                self.assertIsInstance(kind.delivering_pulls([], KEY, item), list)
                self.assertIsInstance(kind.delivery_fault(linked(pr(951, 'Other', base='main'), 4), KEY, item), str)
                self.assertIn(kind.board_status(item, None, []), ('Ready', 'In Progress', 'In Review', 'Done',
                                                                  OFF_BOARD, None))
                self.assertIn(kind.unit_state(item, 'Ready', [], []), ('unrecorded', 'running', 'hold', 'unit', None))
                rule = kind.review(kinds.Tips('a' * 40, 'b' * 40, 'main'))
                self.assertIsInstance(rule, kinds.Review)
                self.assertIsInstance(rule.current, dict)
                self.assertIsInstance(rule.finding_fault({'disposition': 'fixed'}), str)


if __name__ == '__main__':
    unittest.main()
