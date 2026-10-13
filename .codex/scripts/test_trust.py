"""Project trust registration preserves existing user configuration."""

from pathlib import Path
import tempfile
import tomllib
import unittest

from trust import trust


class TrustTests(unittest.TestCase):
    def test_new_home_and_repeated_registration(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            workspace = home / 'project with "quotes" 🧪'
            trust(workspace, home)
            path = home / '.codex/config.toml'
            before = path.read_text()
            trust(workspace, home)
            self.assertEqual(path.read_text(), before)
            self.assertEqual(tomllib.loads(before)['projects'][str(workspace)]['trust_level'], 'trusted')

    def test_existing_project_table_preserves_settings(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            path = home / '.codex/config.toml'
            path.parent.mkdir()
            before = 'model = "example"\n\n[projects."/project"]\ntrust_level = "trusted"\n'
            path.write_text(before)
            trust(Path('/project'), home)
            self.assertEqual(path.read_text(), before)

    def test_explicit_untrusted_project_is_not_silently_overridden(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            path = home / '.codex/config.toml'
            path.parent.mkdir()
            before = '[projects."/project"]\ntrust_level = "untrusted"\n'
            path.write_text(before)
            with self.assertRaisesRegex(ValueError, 'untrusted'):
                trust(Path('/project'), home)
            self.assertEqual(path.read_text(), before)

    def test_invalid_configuration_is_not_modified(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            path = home / '.codex/config.toml'
            path.parent.mkdir()
            path.write_text('not = [valid')
            with self.assertRaises(tomllib.TOMLDecodeError):
                trust(Path('/project'), home)
            self.assertEqual(path.read_text(), 'not = [valid')


if __name__ == '__main__':
    unittest.main()
