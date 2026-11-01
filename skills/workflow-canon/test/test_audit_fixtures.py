"""The audit fixture's engine prerequisite."""

import os
import unittest
from unittest import mock

from audit_fixtures import MISSING_ENGINE, AuditFixture


class PrerequisiteTests(unittest.TestCase):
    def test_unset_engine_skips(self):
        class EngineBound(AuditFixture):
            def test_reached(self):
                """Runs only when the fixture holds an engine."""

        environment = {key: value for key, value in os.environ.items()
                       if key != 'CANON_TEST_ENGINE'}
        result = unittest.TestResult()
        with mock.patch.dict(os.environ, environment, clear=True):
            unittest.defaultTestLoader.loadTestsFromTestCase(EngineBound).run(result)
        self.assertEqual(result.failures + result.errors, [])
        self.assertEqual([reason for _, reason in result.skipped], [MISSING_ENGINE])
