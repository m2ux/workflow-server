"""Source and canon inventories with explicit relationship and section rows."""

import re
import subprocess
from pathlib import Path
from urllib.parse import unquote

from audit_common import AuditError, digest, engine_identity, record_source, require, revision, tool_identity


KINDS = ('workflow', 'technique', 'routine', 'activity')


def corpus_files(root):
    folder = root / 'corpus'
    require(folder.is_dir(), 'The root must contain corpus/')
    return {str(path.relative_to(root)): record_source(path, str(path.relative_to(root)))
            for path in sorted(folder.rglob('*'))
            if path.is_file() and path.suffix.lower() in ('.md', '.yaml', '.yml')
            and '.git' not in path.parts}


def source_kind(path):
    parts = Path(path).parts
    if Path(path).name.lower() in ('readme.md', 'changelog.md'):
        return 'supporting'
    if Path(path).name in ('workflow.yaml', 'workflow.yml'):
        return 'workflow'
    for directory, kind in (('activities', 'activity'), ('routines', 'routine'),
                            ('techniques', 'technique')):
        if directory in parts:
            return kind
    return 'supporting'


def yaml_sources(sources, engine):
    payload = {'engine': str(engine), 'sources': [
        {'path': key, 'text': value['text']} for key, value in sources.items()
        if Path(key).suffix in ('.yaml', '.yml')]}
    if not payload['sources']:
        return {}
    import json
    run = subprocess.run(['node', str(Path(__file__).with_name('audit_yaml.mjs'))],
                         input=json.dumps(payload), capture_output=True, text=True)
    require(run.returncode == 0, 'YAML inventory failed: ' + run.stderr.strip())
    return {item['path']: item for item in json.loads(run.stdout)}


def markdown_nodes(text):
    """Preserve headings, paragraphs, bullets and subordinate source lines."""
    lines = text.splitlines()
    result, stack, counts = [], [], {}
    in_frontmatter = bool(lines and lines[0] == '---')
    for index, line in enumerate(lines, 1):
        if not line.strip():
            continue
        if in_frontmatter:
            result.append({'address': f'/metadata/line-{index}', 'section': 'Metadata',
                           'start': index, 'end': index, 'value': line})
            if index > 1 and line == '---':
                in_frontmatter = False
            continue
        heading = re.match(r'^(#{1,6})\s+(.+)', line)
        if heading:
            level, name = len(heading[1]), heading[2].strip()
            stack = stack[:next((i for i, item in enumerate(stack) if item[0] >= level),
                                len(stack))]
            slug = re.sub(r'[^\w-]+', '-', name.lower()).strip('-')
            counts[(tuple(stack), slug)] = counts.get((tuple(stack), slug), 0) + 1
            ordinal = counts[(tuple(stack), slug)]
            stack.append((level, slug + (f'~{ordinal}' if ordinal > 1 else '')))
            following = next((i for i in range(index, len(lines))
                              if re.match(r'^#{1,' + str(level) + r'}\s', lines[i])), len(lines))
            result.append({'address': '/' + '/'.join(item[1] for item in stack),
                           'section': next((item[1] for item in stack if item[0] == 2), 'Overview'),
                           'start': index, 'end': following, 'value': name, 'container': True})
        else:
            address = '/' + '/'.join(item[1] for item in stack) + f'/line-{index}'
            result.append({'address': address,
                           'section': next((item[1] for item in stack if item[0] == 2), 'Overview'),
                           'start': index, 'end': index, 'value': line})
            clauses = re.split(r';\s+|(?<=[.!?])\s+(?=[A-Z])', line.strip())
            if len(clauses) > 1:
                for ordinal, clause in enumerate(clauses, 1):
                    result.append({'address': address + f'/clause-{ordinal}',
                                   'section': next((item[1] for item in stack if item[0] == 2), 'Overview'),
                                   'start': index, 'end': index, 'value': clause})
    return result


def canon_inventory(sources):
    criteria, supplemental = {}, {}
    for filename, prefix in (('anti-patterns.md', 'AP'), ('design-principles.md', 'DP'),
                             ('convention-conformance.md', 'CC')):
        key = 'corpus/canon/resources/' + filename
        require(key in sources, f'Missing canon home: {key}')
        lines = sources[key]['text'].splitlines()
        headings = [(i, len(match[1]), match[2]) for i, line in enumerate(lines)
                    if (match := re.match(r'^(#{2,3})\s+(.+)', line))]
        family = ''
        for position, (start, level, title) in enumerate(headings):
            if level == 2:
                family = title
            ap = re.match(r'AP-(\d+)\.\s+(.+)', title)
            dp = re.match(r'(\d+)\.\s+(.+)', title) if prefix == 'DP' else None
            if prefix == 'AP' and ap and level == 3:
                identifier, label = 'ap:' + ap[2].strip(), 'AP-' + ap[1].zfill(2)
                destination = criteria
            elif dp and level == 2:
                identifier, label = 'dp:' + dp[1], 'DP-' + dp[1].zfill(2)
                destination = criteria
            elif (prefix == 'CC' and level == 2) or (prefix == 'AP' and level == 2) or (
                    prefix == 'AP' and level == 3 and family == 'Creation Rules'):
                identifier = prefix.lower() + ':' + re.sub(r'[^\w-]+', '-', title.lower()).strip('-')
                label, destination = title, supplemental
            else:
                continue
            end = next((item[0] for item in headings[position + 1:] if item[1] <= level),
                       len(lines))
            require(identifier not in destination, f'Duplicate criterion identity: {identifier}')
            destination[identifier] = {'id': identifier, 'label': label, 'title': title,
                                       'family': family, 'source': key, 'start': start + 1,
                                       'end': end, 'text': '\n'.join(lines[start:end]),
                                       'hash': digest(lines[start:end])}
    require(any(key.startswith('ap:') for key in criteria), 'No AP entries found')
    require(any(key.startswith('dp:') for key in criteria), 'No DP entries found')
    return criteria, supplemental


def relationships(sources, parsed, explicit):
    """Resolve source references; unresolved candidates remain inventory obligations."""
    links = []
    activity_ids = {}
    def namespace(key):
        parts = Path(key).parts
        stop = next((i for i, part in enumerate(parts) if part in ('activities', 'routines', 'techniques', 'resources')), len(parts) - 1)
        return '/'.join(parts[:stop])

    namespaces = {namespace(key) for key in sources}
    namespace_ids = {Path(key).name: key for key in sorted(namespaces)}
    for key, item in parsed.items():
        if source_kind(key) == 'workflow' and isinstance(item['value'], dict):
            namespace_ids[item['value'].get('id')] = namespace(key)
    for key, item in parsed.items():
        if source_kind(key) == 'activity' and isinstance(item['value'], dict):
            activity_ids[(namespace(key), item['value'].get('id'))] = key

    def add(source, target, address, label, context=()):
        record = {'source': source, 'target': target, 'address': address,
                  'label': label, 'context': sorted(set(context))}
        if record not in links:
            links.append(record)

    def resolve_reference(source, reference, kind):
        home = namespace(source)
        parts = reference.replace('::', '/').strip('/').split('/')
        directory = 'routines' if kind == 'routine' else 'techniques'
        if len(parts) > 1 and parts[0] in namespace_ids:
            home, parts = namespace_ids[parts[0]], parts[1:]
        candidates = [f'{home}/{directory}/' + '/'.join(parts) + ending
                      for ending in ('.md', '.yaml', '/TECHNIQUE.md')]
        # Shared references remain candidates for independent resolution review.
        candidates += [f'{shared}/{directory}/' + '/'.join(parts) + ending
                       for shared in ('corpus/meta', 'corpus/core')
                       for ending in ('.md', '.yaml', '/TECHNIQUE.md')]
        matches = [candidate for candidate in candidates if candidate in sources]
        return matches[0] if matches else None

    for key, source in sources.items():
        home = namespace(key)
        for index, match in enumerate(re.finditer(r'\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)', source['text'])):
            target = unquote(match[1]).split('#')[0]
            if not target or '://' in target or target.startswith('mailto:'):
                continue
            absolute = (Path(source['path']).parent / target).resolve()
            resolved = next((path for path, item in sources.items() if item['path'] == str(absolute)), None)
            add(key, resolved, f'markdown-link/{index}', match[1])
        for node in parsed.get(key, {}).get('nodes', []):
            value, address = node.get('value'), node['address']
            if source_kind(key) == 'workflow' and address.startswith('/graph'):
                for name in address.split('/')[2:]:
                    target = activity_ids.get((home, unquote(name)))
                    if target:
                        add(key, target, address, 'graph-entry:' + name)
            if not isinstance(value, str):
                continue
            if re.search(r'/(?:technique|routine)(?:/name)?$', address):
                kind = 'routine' if '/routine' in address else 'technique'
                target = resolve_reference(key, value, kind)
                add(key, target, address, value)
            elif address.startswith('/techniques/'):
                add(key, resolve_reference(key, value, 'technique'), address, value)
            elif '::' in value:
                for match in re.finditer(r'[a-z][a-z0-9_/-]*(?:::[a-z][a-z0-9_-]*)+', value):
                    add(key, resolve_reference(key, match[0], 'technique'), address, match[0])
            if source_kind(key) == 'workflow' and (address.startswith('/graph') or address == '/initialActivity'):
                target = activity_ids.get((home, value))
                if target:
                    add(key, target, address, 'graph:' + value)
        if source_kind(key) == 'technique':
            parent = Path(key).parent
            while len(parent.parts) >= 3:
                ancestor = str(parent / 'TECHNIQUE.md')
                if ancestor in sources and ancestor != key:
                    add(key, ancestor, 'ancestor/' + ancestor, 'declared contract context')
                parent = parent.parent
    # Instantiations retain each reference site, including nested routine bindings.
    # These source relationships supplement declaration rows; runtime validation
    # and independent inventory review settle unresolved or ambiguous references.
    def instances(source, steps, workflow, chain=(), context=(), arguments=None, ancestors=()):
        arguments = arguments or {}
        if not isinstance(steps, list):
            return
        for ordinal, step in enumerate(steps):
            if not isinstance(step, dict):
                continue
            site = chain + (str(step.get('id', ordinal)),)
            kind = step.get('kind')
            if kind == 'routine':
                reference = step.get('routine')
                if not isinstance(reference, str):
                    continue
                target = resolve_reference(source, arguments.get(reference, reference), 'routine')
                add(source, target, 'instance/' + '/'.join(site), 'routine reference site',
                    [workflow, *context])
                if target and target not in ancestors:
                    values = step.get('with', {})
                    bindings = {key: arguments.get(value, value) if isinstance(value, str) else value
                                for key, value in (values.items() if isinstance(values, dict) else ())}
                    body = parsed.get(target, {}).get('value') or {}
                    instances(target, body.get('steps') if isinstance(body, dict) else None,
                              workflow, site, [source, *context],
                              bindings, ancestors + (target,))
            elif kind == 'technique':
                reference = step.get('technique')
                if isinstance(reference, dict):
                    reference = reference.get('name')
                if isinstance(reference, str):
                    reference = arguments.get(reference, reference)
                    target = resolve_reference(source, reference, 'technique') if isinstance(reference, str) else None
                    contracts = []
                    if target:
                        parent = Path(target).parent
                        while len(parent.parts) >= 3:
                            contract = str(parent / 'TECHNIQUE.md')
                            if contract in sources and contract != target:
                                contracts.append(contract)
                            parent = parent.parent
                    add(source, target, 'instance/' + '/'.join(site), str(reference),
                        [workflow, *context, *contracts])
            instances(source, step.get('steps'), workflow, site, context, arguments, ancestors)

    workflows = [key for key in parsed if source_kind(key) == 'workflow']
    for workflow in workflows:
        activities = {link['target'] for link in links if link['source'] == workflow and link['target']
                      and source_kind(link['target']) == 'activity'}
        activities.update(key for key in parsed if source_kind(key) == 'activity'
                          and namespace(key) == namespace(workflow))
        for activity in sorted(activities):
            body = parsed[activity]['value'] or {}
            instances(activity, body.get('steps') if isinstance(body, dict) else None, workflow, (activity,))
    for link in explicit:
        require(link.get('source') in sources, 'Unknown explicit relationship source')
        require(link.get('target') in sources, 'Unknown explicit relationship target')
        require(all(key in sources for key in link.get('context', [])), 'Unknown relationship context')
        add(link['source'], link['target'], link['address'], link['label'], link.get('context', []))
    return links


def inventory(root, engine, spec, author):
    root, engine = Path(root).resolve(), Path(engine).resolve()
    all_sources = corpus_files(root)
    base = spec.get('base')
    deleted = {}
    if base:
        run = subprocess.run(['git', '-C', str(root), 'rev-parse', '--verify', base + '^{commit}'],
                             capture_output=True, text=True)
        require(run.returncode == 0, 'Invalid base revision')
        base = run.stdout.strip()
        listing = subprocess.run(['git', '-C', str(root), 'ls-tree', '-r', '--name-only', base, '--', 'corpus'],
                                 capture_output=True, text=True, check=True).stdout.splitlines()
        for key in listing:
            if key not in all_sources and Path(key).suffix in ('.md', '.yaml', '.yml'):
                raw = subprocess.run(['git', '-C', str(root), 'show', base + ':' + key],
                                     capture_output=True, check=True).stdout
                deleted[key] = {'path': str(root / key), 'key': key, 'text': raw.decode(),
                                'hash': digest(raw), 'deleted': True}
    all_sources.update(deleted)
    parsed = yaml_sources(all_sources, engine)
    criteria, supplemental = canon_inventory(all_sources)
    prefixes = [str(Path(path)).rstrip('/') for path in spec.get('paths', [])]
    require(prefixes, 'At least one explicit corpus path is required')
    seeds = {key for key in all_sources if any(key == prefix or key.startswith(prefix + '/') for prefix in prefixes)}
    require(seeds, 'No source files match the scope')
    links = relationships(all_sources, parsed, spec.get('relationships', []))
    surface = set(seeds)
    while True:
        additions = {link['source'] for link in links if link['target'] in surface} - surface
        if not additions:
            break
        surface.update(additions)
    selected = set(surface)
    while True:
        additions = {link['target'] for link in links if link['source'] in selected and link['target']}
        additions.update(path for link in links if link['source'] in selected for path in link['context'])
        additions -= selected
        if not additions:
            break
        selected.update(additions)
    canon_sources = {item['source'] for item in list(criteria.values()) + list(supplemental.values())}
    # Unselected bytes remain available to independent closure verification.
    sources = {key: all_sources[key] for key in sorted(all_sources)}
    rows, diagnostics = {}, []

    def row(source, address, section, start, end, kind, context=(), label=None):
        identifier = source + '#' + address
        require(identifier not in rows, f'Duplicate row: {identifier}')
        material = source_kind(source)
        rows[identifier] = {'id': identifier, 'source': source,
                            'sources': sorted({source, *context}), 'address': address,
                            'section': section if material != 'supporting' else 'Supporting Material / ' + section,
                            'start': start, 'end': end, 'kind': kind,
                            'type': material if material in KINDS else 'workflow',
                            'source_kind': material, 'label': label or address,
                            'origin': 'deleted' if sources[source].get('deleted') else (
                                'touched' if source in seeds else 'consumer' if source in surface else 'context')}

    for key in sorted(selected):
        count = len(sources[key]['text'].splitlines()) or 1
        row(key, '@element', 'Whole Element', 1, count, 'element')
        nodes = parsed[key]['nodes'] if key in parsed else markdown_nodes(sources[key]['text'])
        for node in nodes:
            if not node['address']:
                continue
            row(key, node['address'], node.get('section') or 'Metadata',
                node['start'], node['end'], 'section' if node.get('container') else 'item')
        for message in parsed.get(key, {}).get('errors', []):
            diagnostics.append({'source': key, 'message': message})
        if source_kind(key) == 'technique' and not any(
                node.get('section', '').lower() == 'capability' for node in nodes):
            row(key, '@missing/capability', 'Capability', 1, count, 'missing')
        if key in parsed and isinstance(parsed[key]['value'], dict) and not parsed[key]['value'].get('id'):
            row(key, '@missing/id', 'Metadata', 1, count, 'missing')
    for link in links:
        if link['source'] not in selected:
            continue
        context = {path for path in [link['target'], *link['context']] if path}
        identifier = '@relationship/' + digest(link)[:16]
        row(link['source'], identifier, 'Relationships', 1,
            len(sources[link['source']]['text'].splitlines()) or 1, 'relationship',
            context, link['label'])
        rows[link['source'] + '#' + identifier]['relationship'] = link
    for extra in spec.get('rows', []):
        require(extra['source'] in selected, 'Additional row must belong to the source surface')
        require(all(key in sources for key in extra.get('context', [])), 'Unknown additional row context')
        require(1 <= extra['start'] <= extra['end'] <= len(sources[extra['source']]['text'].splitlines()),
                'Additional row has an invalid source span')
        row(extra['source'], extra['address'], extra['section'], extra['start'], extra['end'],
            extra.get('kind', 'clause'), extra.get('context', []))
    scope_inputs = {'root': str(root), 'engine': str(engine), 'spec': spec, 'author': author}
    tree = {key: item['hash'] for key, item in all_sources.items() if not item.get('deleted')}
    identity = {'corpus': revision(root), 'engine': revision(engine), 'base': base,
                'engine_files': engine_identity(engine),
                'tree': digest(tree), 'tools': tool_identity(), 'spec': digest(spec)}
    corpus_manifest = {key: {'hash': item['hash'], 'selected': key in selected,
                            'seed': key in seeds, 'deleted': bool(item.get('deleted')),
                            'references': [link for link in links if link['source'] == key]}
                       for key, item in sorted(sources.items())}
    obligations = {}
    # Each closure obligation is bounded by one source's manifest and references.
    # Verifiers can inspect its captured bytes to challenge the proposed closure.
    for key in corpus_manifest:
        obligations['inventory:scope:' + key] = {
            'kind': 'inventory', 'sources': [key], 'context_mode': 'manifest'}
    for key in sorted(canon_sources):
        obligations['inventory:canon:' + key] = {'kind': 'inventory', 'sources': [key]}
    for key in selected:
        obligations['inventory:' + key] = {'kind': 'inventory', 'sources': [key]}
        obligations['read:' + key] = {'kind': 'read', 'sources': [key]}
    for key, unit in supplemental.items():
        obligations['unit:' + key] = {'kind': 'unit', 'sources': [unit['source']], 'criterion': unit}
    require('guards' in spec.get('checks', ['guards']), 'The guard obligation must be accounted for')
    for name in spec.get('checks', ['guards']):
        obligations['check:' + name] = {'kind': 'check', 'sources': sorted(selected),
                                       'context_mode': 'manifest'}
    state = {'format': 1, 'inputs': scope_inputs, 'identity': identity,
             'sources': sources, 'corpus_manifest': corpus_manifest,
             'rows': rows, 'criteria': criteria, 'supplemental': supplemental,
             'obligations': obligations, 'diagnostics': diagnostics, 'mappings': {},
             'verifications': {}, 'evaluations': {}, 'obligation_results': {},
             'assignments': {}, 'history': []}
    state['snapshot'] = digest([identity, rows, criteria, obligations])
    return state


def freshness(state):
    root = Path(state['inputs']['root'])
    current = {key: item['hash'] for key, item in corpus_files(root).items()}
    problems = []
    if digest(current) != state['identity']['tree']:
        problems.append('Corpus bytes or membership changed; refresh the inventory')
    if tool_identity() != state['identity']['tools']:
        problems.append('Audit tooling changed; refresh the inventory')
    if revision(Path(state['inputs']['engine'])) != state['identity']['engine']:
        problems.append('Engine revision changed; refresh the inventory')
    if engine_identity(state['inputs']['engine']) != state['identity']['engine_files']:
        problems.append('Engine/parser bytes changed; refresh the inventory')
    return problems
