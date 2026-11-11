"""Apply the checker's Fields behavior signal to the W02 labelled ledger and the pinned Status Changes field."""
import json
import sys
from pathlib import Path

sys.path.insert(0, sys.argv[1])
import check_skill_files as checker  # noqa: E402


def candidate(body):
    lines = body.splitlines()
    blocks = checker.scan_blocks(lines)
    clauses = list(checker.behavior_clauses(lines, blocks.fenced, blocks.html_lines, -1, len(lines)))
    families = set().union(*(clause[3] for clause in clauses)) if clauses else set()
    return any(clause[2] for clause in clauses) and len(families) >= 2, clauses


ledger = json.loads(Path(sys.argv[2]).read_text())
rows = [(entry['classification'], entry['source'], entry['body']) for entry in ledger]
rows.append(('status-changes', 'board-delivery.md#status-changes @ fbce2c75', Path(sys.argv[3]).read_text()))
tally = {}
for classification, source, body in rows:
    hit, clauses = candidate(body)
    counts = tally.setdefault(classification, [0, 0])
    counts[0] += 1
    counts[1] += hit
    if hit or classification in ('mixed', 'status-changes'):
        print(('candidate' if hit else 'no candidate'), classification, source)
        for line, sentence, agentive, families in clauses:
            print('   ', 'actor' if agentive else '     ', ','.join(sorted(families)), '|', sentence[:100])
print('classification: [fields, candidates]', json.dumps(tally, sort_keys=True))
