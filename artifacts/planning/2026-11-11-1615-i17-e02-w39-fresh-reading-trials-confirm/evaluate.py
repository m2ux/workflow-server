"""Extract each trial's reading trace from its transcript and check it against the route contract.

Usage: evaluate.py <skill-test-dir> <out-dir> <route>:<trial>:<transcript> ...

Each trace is the ordered tool results of one trial, a call marked as an edit when it changed a
skill file. Conformance comes from test_reading_routes, the contract's one home.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, sys.argv[1])
import test_reading_routes as routes

EDIT = re.compile(r'sed -i|git apply')
USE = re.compile(r'progress\.py|gitnexus |git -C|git rev-parse|git merge-base|git diff|git worktree|git commit|check_skill_files|unittest')


def bash_edit(command):
    """Whether a shell command edits a skill file: an in-place edit run in, or naming, a skill folder."""
    cwd = ''
    for segment in re.split(r'&&|;|\n', command):
        segment = segment.strip()
        if segment.startswith('cd '):
            cwd = segment[3:].strip().strip('"\'')
        elif EDIT.search(segment) and ('skills/work-planner' in cwd or 'skills/work-planner' in segment):
            return True
    return False


def calls(path):
    results, order = {}, []
    for line in open(path):
        message = json.loads(line).get('message') or {}
        content = message.get('content')
        if not isinstance(content, list):
            continue
        for part in content:
            if part.get('type') == 'tool_use':
                order.append(part)
            elif part.get('type') == 'tool_result':
                body = part.get('content')
                if isinstance(body, list):
                    body = ''.join(item.get('text', '') for item in body if isinstance(item, dict))
                results[part['tool_use_id']] = body or ''
    for part in order:
        arguments = part['input']
        target = json.dumps(arguments)
        edit = (part['name'] in ('Edit', 'Write') and 'skills/work-planner/' in arguments.get('file_path', '')
                or part['name'] == 'Bash' and bash_edit(arguments.get('command', '')))
        use = (part['name'] in ('Write', 'Edit') or part['name'].startswith('mcp__')
               or part['name'] == 'Bash' and bool(USE.search(arguments.get('command', ''))))
        text = results.get(part['id'], '')
        yield {'tool': part['name'], 'input': arguments, 'text': text, 'edit': edit, 'use': use,
               'truncated': 'Output too large' in text or '<persisted-output>' in text}


def main():
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    summary = {}
    for spec in sys.argv[3:]:
        route, trial, transcript = spec.split(':', 2)
        trace = list(calls(transcript))
        inputs = routes.CAPTURES['routes'][route]['inputs']
        findings = routes.conformance(route, inputs, trace)
        seen, first = '', {}
        references = routes.required(route, inputs)
        for index, call in enumerate(trace):
            seen += '\n' + call['text']
            for reference in references:
                if reference not in first and routes.covered(reference, seen):
                    first[reference] = index + 1
        summary[trial] = {
            'route': route,
            'calls': len(trace),
            'returned_chars': sum(len(call['text']) for call in trace),
            'truncated_calls': [index + 1 for index, call in enumerate(trace) if call['truncated']],
            'edits': [index + 1 for index, call in enumerate(trace) if call['edit']],
            'first_use': next((index + 1 for index, call in enumerate(trace) if call['use'] or call['edit']), None),
            'first_retrieved': {reference: first.get(reference) for reference in references},
            'findings': findings,
        }
        (out / f'{trial}.json').write_text(json.dumps(
            [{key: call[key] for key in ('tool', 'input', 'truncated', 'edit', 'use')} | {'call': index + 1, 'chars': len(call['text'])}
             for index, call in enumerate(trace)], indent=1))
    (out / 'conformance.json').write_text(json.dumps(summary, indent=1))
    print(json.dumps(summary, indent=1))


main()
