from pathlib import Path

out=Path('/tmp/deliver17-20261106/e05-overview')
for path in out.glob('*.stderr'):
    if not path.read_text():
        path.unlink()
for name in ('context-probe.log','plan-sections.json'):
    (out/name).unlink(missing_ok=True)
rows=[]
for path in sorted(out.iterdir()):
    if path.is_file() and path.name != 'artifact-inventory.md':
        if path.name.startswith('context-') and path.suffix=='.json':
            description='Exact changed-symbol context and relationship receipt.'
        elif path.name.endswith('.py'):
            description='Local measurement or artifact verification helper.'
        elif path.name=='overview.md':
            description='Reviewer-facing architecture overview and measured diagrams.'
        elif path.name=='measurements.md':
            description='Graph provenance, coverage, caps and interpretation limits.'
        else:
            description='Raw graph, revision or indexing evidence.'
        rows.append(f'| [{path.name}]({path.name}) | {description} |')
(out/'artifact-inventory.md').write_text('# Overview Artifact Inventory\n\n| Artifact | What it holds |\n| --- | --- |\n'+'\n'.join(rows)+'\n')
print(len(rows),'artifacts inventoried')
