"""Print each tool call of a sub-agent transcript with its result size and truncation."""
import json
import sys

results = {}
calls = []
for line in open(sys.argv[1]):
    record = json.loads(line)
    message = record.get('message') or {}
    content = message.get('content')
    if not isinstance(content, list):
        continue
    for part in content:
        if part.get('type') == 'tool_use':
            calls.append((part['id'], part['name'], part['input']))
        elif part.get('type') == 'tool_result':
            body = part.get('content')
            if isinstance(body, list):
                body = ''.join(item.get('text', '') for item in body if isinstance(item, dict))
            body = body or ''
            truncated = 'persisted-output' in body or 'Output too large' in body or 'truncated' in body.lower()
            results[part['tool_use_id']] = (len(body), truncated)
for index, (key, name, arguments) in enumerate(calls, 1):
    size, truncated = results.get(key, (0, False))
    text = json.dumps(arguments)
    if len(text) > 400:
        text = text[:400] + '...'
    print(f'{index:3} {name} [{size}{" TRUNC" if truncated else ""}] {text}')
