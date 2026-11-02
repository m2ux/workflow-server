"""Extract tool evidence from three isolated skill evaluations."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKILL = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/work-designer/skills/work-designer')
LOGS = {
    'review': Path('/home/mike1/.codex/sessions/2026/10/10/rollout-2026-10-10T08-25-55-01a124b4-42f0-75b2-a189-abdafca91bb1.jsonl'),
    'revise': Path('/home/mike1/.codex/sessions/2026/10/10/rollout-2026-10-10T08-26-24-01a124b4-b2d6-7481-bd18-3b4d2de12495.jsonl'),
    'review-repeat': Path('/home/mike1/.codex/sessions/2026/10/10/rollout-2026-10-10T08-31-22-01a124b9-3fa6-7f70-9824-18f5ea0bd18c.jsonl'),
}


def shell_results(value):
    if isinstance(value, dict):
        if isinstance(value.get('output'), str) and 'exit_code' in value:
            yield value
        else:
            for item in value.values():
                yield from shell_results(item)
    elif isinstance(value, list):
        for item in value:
            yield from shell_results(item)


def headings(source):
    lines = source.splitlines(keepends=True)
    positions = []
    fence = None
    for index, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith(('```', '~~~')):
            delimiter = stripped[0]
            fence = None if fence == delimiter else delimiter
            continue
        if fence:
            continue
        match = re.match(r'^(#{1,6}) (.+?)\s*$', line)
        if match:
            positions.append((index, len(match[1]), match[2]))
    for index, level, title in positions:
        end = next((other for other, depth, _ in positions if other > index and depth <= level), len(lines))
        yield title, index + 1, end, ''.join(lines[index:end]).strip()


summaries = {}
for scenario, path in LOGS.items():
    records = []
    for line in path.read_text().splitlines():
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    metadata = next(item['payload'] for item in records if item['type'] == 'session_meta')
    trace = []
    outputs = []
    returned_text = []
    truncated_calls = []
    final_answers = [
        item['payload']['last_agent_message']
        for item in records
        if item['type'] == 'event_msg'
        and item['payload'].get('type') == 'task_complete'
        and isinstance(item['payload'].get('last_agent_message'), str)
    ]
    command_inputs = []
    for item in records:
        if item['type'] != 'response_item':
            continue
        payload = item['payload']
        if payload['type'] in ('custom_tool_call', 'function_call'):
            body = payload.get('input', payload.get('arguments', ''))
            trace.append({'call_id': payload['call_id'], 'tool': payload['name'], 'input': body})
            command_inputs.append(body)
        elif payload['type'] in ('custom_tool_call_output', 'function_call_output'):
            chunks = payload.get('output', [])
            trace.append({'call_id': payload['call_id'], 'output': chunks})
            if isinstance(chunks, str):
                chunks = [{'text': chunks}]
            for chunk in chunks:
                text = chunk.get('text', '')
                returned_text.append(text)
                if 'truncated output' in text:
                    truncated_calls.append(payload['call_id'])
                try:
                    decoded = json.loads(text)
                except (json.JSONDecodeError, TypeError):
                    # Aggregate truncation can wrap several intact JSON objects
                    # plus one partial object in a warning. Preserve intact lines.
                    for line in text.splitlines():
                        try:
                            outputs.extend(shell_results(json.loads(line)))
                        except (json.JSONDecodeError, TypeError):
                            pass
                else:
                    outputs.extend(shell_results(decoded))
    stdout = '\n'.join(result['output'] for result in outputs)
    raw_output = '\n'.join(returned_text)

    def observed_in_output(source):
        return source in stdout or any(
            json.dumps(source, ensure_ascii=ascii_only)[1:-1] in raw_output
            for ascii_only in (False, True)
        )

    files = []
    for source_path in sorted(SKILL.rglob('*.md')):
        source = source_path.read_text()
        observed = []
        for title, start, end, section in headings(source):
            if len(section.splitlines()) > 2 and observed_in_output(section):
                observed.append({'heading': title, 'start': start, 'end': end, 'words': len(section.split())})
        files.append({'path': str(source_path.relative_to(SKILL)), 'whole_file_observed': observed_in_output(source.strip()), 'complete_sections_observed': observed})
    summary = {
        'scenario': scenario,
        'session_id': metadata['id'],
        'source': metadata.get('source'),
        'log': str(path),
        'skill_revision': '0a6ac0b180370c03d6c10095aae577a003254834',
        'tool_calls': len(command_inputs),
        'decoded_shell_results': len(outputs),
        'decoded_shell_output_words': sum(len(result['output'].split()) for result in outputs),
        'truncated_tool_calls': sorted(set(truncated_calls)),
        'final_answer_observed': bool(final_answers),
        'complete_source_sections': files,
        'method': 'Exact complete-section matching against returned shell stdout or intact JSON-escaped source in aggregate-truncated tool output. Excludes reasoning; heading-only discovery is not section content. Decoded shell counts exclude any malformed JSON fragments. Partial reads require manual inspection; missing matches do not establish absence.',
    }
    (ROOT / (scenario + '-tool-trace.json')).write_text(json.dumps(trace, indent=2) + '\n')
    (ROOT / (scenario + '-audit.json')).write_text(json.dumps(summary, indent=2) + '\n')
    if final_answers:
        (ROOT / (scenario + '-result.md')).write_text('\n\n'.join(final_answers) + '\n')
    summaries[scenario] = {key: summary[key] for key in ('session_id', 'tool_calls', 'decoded_shell_results', 'final_answer_observed', 'truncated_tool_calls')}
    summaries[scenario]['whole_files'] = [entry['path'] for entry in files if entry['whole_file_observed']]
print(json.dumps(summaries, indent=2))
