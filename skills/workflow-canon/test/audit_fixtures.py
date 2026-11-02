"""Small independent expected surfaces for audit lifecycle tests."""

import os
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
from audit_common import cell_index
from audit_dispatch import plan_assignments
from audit_inventory import inventory
from audit_state import bind, ingest


class AuditFixture(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        engine = os.environ.get('CANON_TEST_ENGINE')
        if not engine:
            self.fail('CANON_TEST_ENGINE must name an engine with its installed yaml package')
        self.engine = Path(engine)
        self.write('corpus/canon/resources/anti-patterns.md',
                   '# Anti-patterns\n\n## Structural\n\n### AP-01. missing-contract\n'
                   'An output stated with no contract.\n\n**Fires on:** `technique.outputs`\n\n'
                   'Detect: An output lacks a contract.\nDo not flag: none.\nFix: define it.\n\n'
                   '### AP-02. unsafe-binding\nA bind naming another step output.\n\n'
                   '**Fires on:** `activity.steps`\n\n'
                   'Detect: The consumer binds the wrong output.\n')
        self.write('corpus/canon/resources/design-principles.md',
                   '# Principles\n\n## 1. Define contracts\nEvery output has one contract.\n\n'
                   '**Fires on:** `technique`, `routine`\n')
        self.write('corpus/canon/resources/convention-conformance.md',
                   '# Conformance\n\n## Sibling convention\n\n**Fires on:** `resource`\n\n'
                   'Inspect a sibling.\n')
        self.write('corpus/demo/workflow.yaml',
                   'id: demo\nname: Demo\ninitialActivity: start\ngraph:\n  start:\n    done: null\n')
        self.write('corpus/demo/activities/start.yaml',
                   'id: start\nsteps:\n  - id: run\n    kind: routine\n    routine: once\n')
        self.write('corpus/demo/routines/once.yaml',
                   'id: once\ninputs:\n  - id: value\nsteps:\n'
                   '  - id: call\n    kind: technique\n    technique: emit\n')
        self.write('corpus/demo/techniques/emit.md',
                   '# Emit\n\n## Capability\nProduce a report.\n\n## Outputs\n'
                   '### report\nA report.\n\n## Protocol\n- Produce the report.\n'
                   '- Validate the report; preserve its name.\n\n## Rules\n'
                   '### complete\nThe report is complete.\n')
        self.write('corpus/demo/README.md', '# Demo\nA specimen.\n')
        self.spec = {'paths': ['corpus/demo'], 'checks': ['guards']}
        self.state = inventory(self.root, self.engine, self.spec, 'coordinator')
        self.budgets = {'context_tokens': 200000, 'reserve_tokens': 1000, 'safety_tokens': 1000,
                        'output_tokens': 100000, 'work_seconds': 100000, 'slots': 2,
                        'bytes_per_token': 2,
                        'calibration': {phase: {'output_tokens_per_item': 80, 'seconds_per_item': 2,
                                               'evidence': 'Controlled fixture budget'}
                                        for phase in ('map', 'verify', 'evaluate', 'inventory', 'obligations')}}

    def write(self, key, text):
        path = self.root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def receipt(self, assignment_id, status, actor, items=None, attempt='one'):
        assignment = self.state['assignments'][assignment_id]
        index = cell_index(self.state)
        records = []
        for key in items or assignment['items']:
            if key in index:
                row, criterion = index[key]
                sources = set(self.state['rows'][row]['sources'])
                sources.add(self.state['criteria'][criterion]['source'])
                outcome = status
            else:
                obligation = self.state['obligations'][key]
                sources = obligation['sources']
                outcome = {'inventory': 'verified', 'read': 'read', 'unit': 'walked',
                           'check': 'pass', 'finding': 'confirmed'}[obligation['kind']]
            evidence = [{'source': source, 'start': 1,
                         'end': len(self.state['sources'][source]['text'].splitlines()) or 1}
                        for source in sources]
            record = {'items': [key], 'status': outcome,
                            'reason': 'The controlled fixture specifies this expected disposition.',
                            'evidence': evidence}
            if key not in index and obligation['kind'] == 'check':
                output = self.write('fixture-check.txt', 'Controlled fixture check passed.\n')
                record['check'] = {'command': ['controlled-fixture'], 'cwd': str(self.root),
                                   'exit_code': 0, 'output': str(output)}
            records.append(record)
        return {'assignment': assignment_id, 'actor': actor, 'attempt': attempt,
                'snapshot': self.state['snapshot'], 'records': records}

    def phase(self, phase, status, actor):
        result = plan_assignments(self.state, phase, self.budgets)
        for assignment_id in result['assignments']:
            bind(self.state, assignment_id, actor)
            self.state = ingest(self.state, self.receipt(assignment_id, status, actor))
        return result

    def verified_map(self):
        self.phase('map', 'A', 'mapper')
        self.phase('inventory', 'verified', 'inventory-reviewer')
        self.phase('verify', 'verified', 'map-reviewer')
