"""Preserve tool evidence for the guideline iteration without private reasoning."""

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer')
LOGS = {
    'guidelines-revise-a': Path('/home/mike1/.codex/sessions/2026/10/10/rollout-2026-10-10T11-35-47-01a12562-1783-7641-aa65-e1458545dab7.jsonl'),
    'guidelines-revise-b': Path('/home/mike1/.codex/sessions/2026/10/10/rollout-2026-10-10T11-35-53-01a12562-2cb8-7e03-8e43-e2fdb73c7194.jsonl'),
}
snapshot = json.loads((ROOT / 'guideline-snapshot.json').read_text())
for relative, expected in snapshot['files'].items():
    assert hashlib.sha256((SOURCE / relative).read_bytes()).hexdigest() == expected, relative


def results(value):
    if isinstance(value, dict):
        if isinstance(value.get('output'), str) and 'exit_code' in value:
            yield value
        else:
            for child in value.values():
                yield from results(child)
    elif isinstance(value, list):
        for child in value:
            yield from results(child)


def sections(source):
    lines = source.splitlines(keepends=True)
    headings = []
    fence = None
    for index, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith((chr(96) * 3, '~~~')):
            fence = None if fence == stripped[0] else stripped[0]
            continue
        match = re.match(r'^(#{1,6}) (.+?)\s*$', line)
        if match and not fence:
            headings.append((index, len(match[1]), match[2]))
    for start, level, title in headings:
        end = next((pos for pos, depth, _ in headings if pos > start and depth <= level), len(lines))
        yield title, start + 1, end, ''.join(lines[start:end]).strip()


summaries = {}
for scenario, log in LOGS.items():
    records = []
    for line in log.read_text().splitlines():
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    metadata = next(row['payload'] for row in records if row['type'] == 'session_meta')
    trace, raw, decoded, truncated = [], [], [], []
    final = None
    for row in records:
        item = row.get('payload', {})
        if row['type'] == 'event_msg' and item.get('type') == 'task_complete':
            final = item.get('last_agent_message')
        if row['type'] != 'response_item':
            continue
        if item.get('type') in ('custom_tool_call', 'function_call'):
            trace.append({'call_id': item['call_id'], 'tool': item['name'], 'input': item.get('input', item.get('arguments', ''))})
        elif item.get('type') in ('custom_tool_call_output', 'function_call_output'):
            output = item.get('output', [])
            trace.append({'call_id': item['call_id'], 'output': output})
            chunks = [{'text': output}] if isinstance(output, str) else output
            for chunk in chunks:
                text = chunk.get('text', '')
                raw.append(text)
                if 'truncated output' in text:
                    truncated.append(item['call_id'])
                try:
                    decoded.extend(results(json.loads(text)))
                except (json.JSONDecodeError, TypeError):
                    for line in text.splitlines():
                        try:
                            decoded.extend(results(json.loads(line)))
                        except (json.JSONDecodeError, TypeError):
                            pass
    stdout = '\n'.join(item['output'] for item in decoded)
    raw_text = '\n'.join(raw)

    def observed(text):
        return text in stdout or any(json.dumps(text, ensure_ascii=ascii_only)[1:-1] in raw_text for ascii_only in (False, True))

    sources = []
    for path in sorted((SOURCE / 'skills/work-designer').rglob('*.md')) + [SOURCE / 'skills/guidelines.md']:
        content = path.read_text()
        matched = [{'heading': title, 'start': start, 'end': end} for title, start, end, section in sections(content) if len(section.splitlines()) > 2 and observed(section)]
        sources.append({'path': str(path.relative_to(SOURCE)), 'complete_file_observed': observed(content.strip()), 'complete_sections_observed': matched})
    summary = {
        'scenario': scenario,
        'session_id': metadata['id'],
        'source': metadata.get('source'),
        'snapshot': snapshot,
        'final_answer_observed': isinstance(final, str),
        'decoded_shell_results': len(decoded),
        'truncated_calls': sorted(set(truncated)),
        'sources': sources,
        'method': 'Exact complete-source matching against returned stdout or intact JSON-escaped text in truncated aggregates. Heading inventories are not body reads. Missing matches require manual inspection; decoded counts can omit truncated fragments. Private reasoning is excluded.',
    }
    (ROOT / (scenario + '-trace.json')).write_text(json.dumps(trace, indent=2) + '\n')
    (ROOT / (scenario + '-audit.json')).write_text(json.dumps(summary, indent=2) + '\n')
    if isinstance(final, str):
        (ROOT / (scenario + '-result.md')).write_text(final + '\n')
    summaries[scenario] = {
        'complete': summary['final_answer_observed'],
        'decoded_shell_results': len(decoded),
        'truncated_calls': summary['truncated_calls'],
        'whole_files': [item['path'] for item in sources if item['complete_file_observed']],
    }
print(json.dumps(summaries, indent=2))
