"""Architecture diagrams preserve measured topology and the consumer's owning contract."""
import json
import re
import unittest
from pathlib import Path

from test_plan_mode import section

ROOT = Path(__file__).resolve().parents[1]
OWNER = ROOT / 'artifacts' / 'architecture-overview.md'
CONSUMER = ROOT / 'protocols' / 'change-overview.md'
CAPTURE = json.loads(Path(__file__).with_name('architecture-captures.json').read_text())


def mermaid_blocks(text):
    return re.findall(r'^```mermaid\n(.*?)^```$', text, re.M | re.S)


def topology(diagram):
    """Read declared node ids and named edges in the fixture's flowchart subset."""
    nodes = set(re.findall(r'^\s*(N\d+)\[', diagram, re.M))
    edges = set(re.findall(r'^\s*(N\d+) -->\|([^|]+)\| (N\d+)$', diagram, re.M))
    return nodes, edges


def measured_diagram(edges):
    """A literal containment specimen populated only from captured graph evidence."""
    ids = sorted({key for source, target, _ in edges for key in (source, target)})
    lines = ['flowchart LR']
    lines += [f'    {key}["{CAPTURE["nodes"][key]["name"]}"]' for key in ids]
    lines += [f'    {source} -->|{relation}| {target}' for source, target, relation in edges]
    return '\n'.join(lines)


def faithful(diagram, expected):
    """Compare a specimen with its selected measurements, without applying size policy."""
    nodes, edges = topology(diagram)
    expected_nodes = {key for source, target, _ in expected for key in (source, target)}
    expected_edges = {(source, relation, target) for source, target, relation in expected}
    return nodes == expected_nodes and edges == expected_edges


class ArchitectureDiagrams(unittest.TestCase):
    def test_actual_structural_template_has_three_nodes_and_two_edges(self):
        structural = mermaid_blocks(OWNER.read_text())[0]
        nodes = set(re.findall(r'^\s*(\w+)\(?\[', structural, re.M))
        edges = re.findall(r'^\s*(\w+) -->\|.*?\| (\w+)$', structural, re.M)
        self.assertEqual(nodes, {'Caller', 'Entry', 'Store'})
        self.assertEqual(edges, [('Caller', 'Entry'), ('Entry', 'Store')])

    def test_actual_functional_template_has_three_participants(self):
        functional = mermaid_blocks(OWNER.read_text())[1]
        participants = re.findall(r'^\s*(?:actor|participant) (\w+)', functional, re.M)
        interactions = re.findall(r'^\s*(\w+)-+>>(\w+):', functional, re.M)
        self.assertEqual(participants, ['Caller', 'Entry', 'Store'])
        self.assertEqual(interactions, [('Caller', 'Entry'), ('Entry', 'Store'),
                                        ('Store', 'Entry'), ('Entry', 'Caller')])

    def test_diagrams_contract_distinguishes_target_from_measured_fidelity(self):
        contract = section(OWNER.read_text(), '### Diagrams')
        self.assertIn('Five to ten elements is a readability target.', contract)
        self.assertIn('A faithful measured diagram may contain fewer elements without padding.', contract)
        self.assertIn('A diagram that needs more splits by concept', contract)

    def test_existing_consumer_reaches_the_single_owning_size_contract(self):
        consumer = section(CONSUMER.read_text(), '### 2. Write the Overview')
        for anchor in ('measurements', 'diagrams', 'template', 'fields', 'pull-request-head', 'code-references'):
            with self.subTest(anchor=anchor):
                self.assertIn(f'../artifacts/architecture-overview.md#{anchor}', consumer)
        self.assertNotRegex(consumer, r'(?i)five to ten|five elements|fewer elements')
        self.assertIn('the ones measured over the graph', consumer)

    def test_real_small_containment_graph_has_two_nodes_without_padding(self):
        edges = CAPTURE['edges'][:1]
        diagram = measured_diagram(edges)
        self.assertTrue(faithful(diagram, edges))
        self.assertEqual(len(topology(diagram)[0]), 2)
        self.assertIn('Epic Integration', diagram)
        self.assertIn('Procedure', diagram)

    def test_real_complex_graph_splits_by_its_measured_section_concepts(self):
        edges = CAPTURE['edges']
        names = {node['name']: key for key, node in CAPTURE['nodes'].items()}
        parent_ids = ({names['Epic Integration'], names['Procedure']},
                      {names['2. Refresh and Validate']}, {names['3. Merge or Hand Off']})
        parts = [[edge for edge in edges if edge[0] in parents] for parents in parent_ids]
        diagrams = [measured_diagram(part) for part in parts]
        self.assertEqual(len(CAPTURE['nodes']), 12)
        self.assertEqual([len(topology(diagram)[0]) for diagram in diagrams], [6, 3, 5])
        self.assertEqual({tuple(edge) for part in parts for edge in part}, {tuple(edge) for edge in edges})
        self.assertTrue(all(faithful(diagram, part) for diagram, part in zip(diagrams, parts)))

    def test_padding_nodes_and_reversed_edges_fail_measured_topology_controls(self):
        edges = CAPTURE['edges'][:1]
        diagram = measured_diagram(edges)
        self.assertFalse(faithful(diagram + '\n    N99["Padding"]', edges))
        source, target, relation = edges[0]
        reversed_diagram = diagram.replace(f'{source} -->|{relation}| {target}',
                                           f'{target} -->|{relation}| {source}')
        self.assertFalse(faithful(reversed_diagram, edges))


if __name__ == '__main__':
    unittest.main()
