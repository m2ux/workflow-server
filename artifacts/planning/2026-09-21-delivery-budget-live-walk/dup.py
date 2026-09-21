import re, sys, hashlib
from collections import defaultdict

path = sys.argv[1]
text = open(path, encoding="utf-8").read()
sep = "\n\n---\n\n"
i = text.find(sep)
bundle = text[:i] if i >= 0 else text
lines = bundle.split("\n")

tech = []
for n, ln in enumerate(lines):
    if re.match(r"^  [A-Za-z]\S*:\s*$", ln):
        tech.append((n, ln.strip().rstrip(":")))
tech.append((len(lines), None))

# Hash every indent-6 block under rules:, and the whole inherited_inputs block.
# Waste is counted ONLY across byte-identical copies: for each distinct hash seen
# k times, (k-1) * size is text a reader receives more than once.
blocks = defaultdict(list)   # (kind, key, hash) -> [(technique, chars)]

for t in range(len(tech) - 1):
    start, name = tech[t]
    end = tech[t + 1][0]
    body = lines[start:end]
    heads = [(k, ln) for k, ln in enumerate(body) if re.match(r"^    \S+:", ln)]
    heads.append((len(body), None))
    for h in range(len(heads) - 1):
        k, ln = heads[h]
        seg = body[k:heads[h + 1][0]]
        head = ln.strip().split(":")[0]
        if head == "rules":
            marks = [(j, l) for j, l in enumerate(seg) if re.match(r"^      \S+:", l)]
            marks.append((len(seg), None))
            for m in range(len(marks) - 1):
                j, l = marks[m]
                blk = "\n".join(seg[j:marks[m + 1][0]])
                key = l.strip().split(":")[0]
                blocks[("rule", key, hashlib.sha1(blk.encode()).hexdigest()[:10])].append((name, len(blk) + 1))
        elif head == "inherited_inputs":
            blk = "\n".join(seg)
            blocks[("inh", "inherited_inputs", hashlib.sha1(blk.encode()).hexdigest()[:10])].append((name, len(blk) + 1))

rows = []
for (kind, key, h), occ in blocks.items():
    k = len(occ)
    size = occ[0][1]
    rows.append((( k - 1) * size, k, size, kind, key, h))
rows.sort(reverse=True)

delivered = sum(r[1] * r[2] for r in rows)
waste = sum(r[0] for r in rows)

print(f"bundle: {len(bundle)} chars, {len(tech)-1} techniques")
print(f"rule + inherited_inputs blocks delivered: {delivered} chars")
print(f"byte-identical repeat text: {waste} chars = {100*waste/len(bundle):.1f}% of the whole bundle\n")
print(f"{'repeat':>8} {'copies':>7} {'each':>7}  kind  key")
for w, k, size, kind, key, h in rows:
    if w == 0:
        continue
    print(f"{w:>8} {k:>7} {size:>7}  {kind:<5} {key}")

singles = sum(1 for r in rows if r[1] == 1)
print(f"\n{singles} blocks appear exactly once (no repeat).")
print(f"{sum(1 for r in rows if r[1] > 1)} distinct blocks are delivered more than once.")
