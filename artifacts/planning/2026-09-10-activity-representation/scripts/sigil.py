#!/usr/bin/env python3
"""Do the proposed sigils survive a YAML parser unquoted?"""
import yaml

CASES = [
    ('*', 'technique',  "steps:\n  - *score-cicd-severity::apply-severity\n"),
    ('!', 'action',     "steps:\n  - !announce-start\n"),
    ('>', 'checkpoint', "steps:\n  - >wiki-target-confirmed\n"),
    ('@', 'safe?',      "steps:\n  - @apply-severity\n"),
    ('+', 'safe?',      "steps:\n  - +apply-severity\n"),
    ('=', 'safe?',      "steps:\n  - =apply-severity\n"),
    ('#', 'comment',    "steps:\n  - #apply-severity\n"),
    ('&', 'anchor',     "steps:\n  - &apply-severity\n"),
    ('%', 'directive',  "steps:\n  - %apply-severity\n"),
    ('~', 'null',       "steps:\n  - ~apply-severity\n"),
]

print(f"{'sigil':6s} {'intent':12s} {'result'}")
print('-' * 78)
for sig, intent, doc in CASES:
    try:
        got = yaml.safe_load(doc)
        val = (got or {}).get('steps')
        print(f"{sig:6s} {intent:12s} PARSES -> {val!r}")
    except Exception as e:
        msg = str(e).split('\n')[0].strip()
        print(f"{sig:6s} {intent:12s} FAILS  -> {msg}")

print("\n--- quoted forms (what authors would actually have to write) ---")
for sig in ['*', '!', '>', '@', '#', '&']:
    doc = f"steps:\n  - '{sig}apply-severity'\n"
    try:
        got = yaml.safe_load(doc)['steps']
        print(f"  '{sig}...'  OK -> {got!r}")
    except Exception as e:
        print(f"  '{sig}...'  FAILS -> {str(e).splitlines()[0]}")
