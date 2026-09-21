import re, sys

path = sys.argv[1]
text = open(path, encoding="utf-8").read()
sep = "\n\n---\n\n"
idx = text.find(sep)
bundle = text[:idx] if idx >= 0 else text
meta = text[idx + len(sep):] if idx >= 0 else ""

lines = bundle.split("\n")
# Technique keys sit at indent 2 directly under `techniques:`.
marks = []
for i, ln in enumerate(lines):
    if re.match(r"^  [A-Za-z]\S*:\s*$", ln):
        marks.append((i, ln.strip().rstrip(":")))

rows = []
for j, (i, key) in enumerate(marks):
    end = marks[j + 1][0] if j + 1 < len(marks) else len(lines)
    body = "\n".join(lines[i:end])
    size = len(body) + 1
    # how much of it is protocol prose vs declaration
    pidx = body.find("\n    protocol:")
    proto = len(body) - pidx if pidx >= 0 else 0
    rows.append((size, proto, key))

rows.sort(reverse=True)
total = sum(r[0] for r in rows)
print(f"bundle {len(bundle)} chars   metadata {len(meta)} chars")
print(f"{len(rows)} techniques, {total} chars accounted\n")
print(f"{'chars':>8} {'protocol':>9} {'cum%':>6}  operation")
cum = 0
for size, proto, key in rows:
    cum += size
    print(f"{size:>8} {proto:>9} {100*cum/total:>5.1f}%  {key}")

ns = {}
for size, proto, key in rows:
    prefix = key.split("::")[0] if "::" in key else "(workflow-local)"
    ns[prefix] = ns.get(prefix, 0) + size
print("\nby namespace:")
for k, v in sorted(ns.items(), key=lambda x: -x[1]):
    print(f"{v:>8}  {100*v/total:>5.1f}%  {k}")
