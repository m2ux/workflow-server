#!/usr/bin/env python3
"""Translate one activity definition into Bend data for model.bend.

    python3 gen.py <corpus-root> <workflow-id> <activity.yaml> <out.bend> [<bend-name>] [<model-import>]

Reads the activity, the techniques and routines its steps bind, and emits a
Bend file that imports model.bend as M and defines <bend-name>() -> M.Activity
holding the activity as data in the model's shape, and ambient() -> the names
the server supplies to every session. The laws over that data live in the
hand-written file that imports the output.

The rules mirror the server's, cited where they come from:

- Reference resolution (docs/resolution.md): a bare technique name resolves in
  the current workflow's techniques/ folder, then meta's; `ns::path` or
  `ns/path` resolves in that namespace's techniques/, where the namespace is a
  workflow directory or a directory under support/. Routines resolve the same
  way under routines/.
- A technique's signature is the `###` headings under `## Inputs` and
  `## Outputs` (docs/technique.md), composed with every ancestor TECHNIQUE.md
  from the namespace's techniques/ root down to the technique's own folder,
  the local entry winning (technique-loader.ts composeLoaded; docs/technique.md
  "merged from every ancestor outward"). An input whose description opens
  with "(optional)" or that declares a `#### default` is not required
  (binding-provenance.ts OPTIONAL_INPUT_RE).
- A bound input resolves to the variable its `inputs:` entry names: a braced
  value is a host variable, member path stripped; a bare value is a rename when
  it names a resolvable bag entry, otherwise a literal (binding-provenance.ts
  445-451). A required own input left unbound resolves under its own id
  (activity-variables.ts 480). An inherited input is ambient session context
  (check-binding-fidelity.ts 1005-1006): it counts as a read only where the
  activity declares it. An output lands under its `outputs:` remap target,
  else its own id.
- A `{name}` token in a bound technique's body is a read of the bag
  (check-binding-fidelity.ts collectReads); `{$name}` binds a protocol local
  and is no read. A token naming nothing the activity holds is the
  workflow-scoped read-resolution family and is left out here, so a prose
  read counts as a use, never as an unresolved name.
- Ambient names, supplied by the server rather than produced in the activity:
  the seeded bag names (eager-client.ts SEEDED_VARIABLE_NAMES), the ambient
  context ids (binding-provenance.ts AMBIENT_CONTEXT_IDS), and the names the
  orchestrator holds (activity-variables.ts orchestratorInputs: every input of
  meta/techniques/workflow-engine and every read of a meta activity).
- A routine argument: a braced value is a host variable, a bare value a literal
  (activity.schema.json `with`); an input left unbound takes its default, then
  the host variable of the same name (docs/routine.md), so it is a read only
  where the activity has such a name.
"""
import re
import sys
from pathlib import Path

import yaml

IDENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
BRACED = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)")
FENCE = re.compile(r"```.*?```", re.S)
KEYWORDS = {"true", "false", "null", "and", "or", "not"}
OPTIONAL = re.compile(r"^[*_]{0,2}\(optional\b[^)]*\)", re.I)

SEEDED = ["user_request", "planning_folder_path", "host_repo_path", "target_repo", "component_path", "is_monorepo"]
AMBIENT_CONTEXT = ["target_symbol", "impact_report", "model_id"]


def resolve(root: Path, workflow: str, kind: str, ref: str, ext: str) -> Path:
    """kind is 'techniques' or 'routines'."""
    ref = ref.strip()
    if "::" in ref:
        ns, _, rest = ref.partition("::")
        candidates = [root / ns / kind / (rest.replace("::", "/") + ext),
                      root / "support" / ns / kind / (rest.replace("::", "/") + ext),
                      root / workflow / kind / (ref.replace("::", "/") + ext),
                      root / "meta" / kind / (ref.replace("::", "/") + ext)]
    elif "/" in ref:
        ns, _, rest = ref.partition("/")
        candidates = [root / ns / kind / (rest + ext),
                      root / "support" / ns / kind / (rest + ext),
                      root / workflow / kind / (ref + ext)]
    else:
        candidates = [root / workflow / kind / (ref + ext), root / "meta" / kind / (ref + ext)]
    for c in candidates:
        if c.exists():
            return c
        d = c.with_suffix("")
        if d.is_dir() and (d / "TECHNIQUE.md").exists():
            return d / "TECHNIQUE.md"
    raise SystemExit(f"unresolved {kind} reference {ref!r}; tried {[str(c) for c in candidates]}")


def signature(path: Path):
    """One file's (required, optional, outputs), names in order."""
    section = None
    required, optional, outputs = [], [], []
    current = None
    lines = path.read_text().splitlines()
    for i, line in enumerate(lines):
        if line.startswith("## "):
            section = line[3:].strip()
            current = None
            continue
        if section in ("Inputs", "Outputs") and line.startswith("### "):
            current = line[4:].strip()
            desc = ""
            for nxt in lines[i + 1:]:
                if nxt.strip():
                    desc = nxt.strip()
                    break
            if section == "Outputs":
                outputs.append(current)
            elif OPTIONAL.match(desc):
                optional.append(current)
            else:
                required.append(current)
            continue
        if section == "Inputs" and current and line.startswith("#### default"):
            if current in required:
                required.remove(current)
                optional.append(current)
    return required, optional, outputs


def prose_reads(path: Path) -> list:
    """The {name} tokens of a technique body outside fenced code, {$locals} left out."""
    text = FENCE.sub(" ", path.read_text())
    out = []
    for m in BRACED.finditer(text):
        n = m.group(1)
        if n not in out:
            out.append(n)
    return out


def ancestors(path: Path):
    """The TECHNIQUE.md files from the namespace's techniques/ root down to the file's folder."""
    parts = path.parts
    try:
        i = len(parts) - 1 - parts[::-1].index("techniques")
    except ValueError:
        return []
    out = []
    folder = Path(*parts[: i + 1])
    for seg in parts[i + 1:-1]:
        c = folder / "TECHNIQUE.md"
        if c.exists() and c != path:
            out.append(c)
        folder = folder / seg
    c = folder / "TECHNIQUE.md"
    if c.exists() and c != path:
        out.append(c)
    return out


def merge(req, opt, outs, r, o, s):
    """Later (more local) entries override earlier ones of the same id."""
    req = [n for n in req if n not in r and n not in o] + r
    opt = [n for n in opt if n not in r and n not in o] + o
    outs = [n for n in outs if n not in s] + s
    return req, opt, outs


def technique_contract(path: Path):
    """(required, optional, outputs, inherited): composed signature, local entry winning;
    inherited holds the ids an ancestor contributed and the file does not redeclare."""
    req, opt, outs = [], [], []
    inherited = set()
    for anc in ancestors(path):
        r, o, s = signature(anc)
        inherited.update(r + o + s)
        req, opt, outs = merge(req, opt, outs, r, o, s)
    r, o, s = signature(path)
    inherited.difference_update(r + o + s)
    req, opt, outs = merge(req, opt, outs, r, o, s)
    return req, opt, outs, inherited


def routine_contract(path: Path):
    doc = yaml.safe_load(path.read_text())
    required, optional, outputs = [], [], []
    for i in doc.get("inputs", []) or []:
        (optional if "default" in i else required).append(i["id"])
    for o in doc.get("outputs", []) or []:
        outputs.append(o["id"])
    return required, optional, outputs


def orchestrator_inputs(root: Path) -> list:
    """Every input a meta/techniques/workflow-engine technique declares, its contract included,
    and every name a meta activity declares as a read (activity-variables.ts orchestratorInputs)."""
    names = []
    folder = root / "meta" / "techniques" / "workflow-engine"
    for f in sorted(folder.glob("*.md")):
        r, o, s, _ = technique_contract(f)
        for n in r + o:
            add(names, n)
    for f in sorted((root / "meta" / "activities").glob("*.yaml")):
        doc = yaml.safe_load(f.read_text()) or {}
        for n in ((doc.get("variables") or {}).get("reads") or []):
            add(names, n)
    return names


def names_in_expression(expr) -> list:
    if expr is None:
        return []
    text = str(expr)
    text = re.sub(r"'[^']*'|\"[^\"]*\"", " ", text)
    out = []
    for m in IDENT.finditer(text):
        tok = m.group(0)
        if tok in KEYWORDS or tok in out:
            continue
        start = m.start()
        if start > 0 and text[start - 1] == ".":
            continue
        out.append(tok)
    return out


def names_in_condition(cond) -> list:
    if not cond:
        return []
    out = []
    t = cond.get("type")
    if t == "simple":
        out.append(cond["variable"].split(".")[0])
    elif t in ("and", "or"):
        for c in cond.get("conditions", []):
            for n in names_in_condition(c):
                add(out, n)
    elif t == "not":
        out.extend(names_in_condition(cond.get("condition")))
    return out


def braced_names(value) -> list:
    if value is None:
        return []
    out = []
    for m in BRACED.finditer(str(value)):
        add(out, m.group(1))
    return out


def gate_of(step) -> list:
    out = names_in_expression(step.get("when"))
    for n in names_in_condition(step.get("condition")):
        add(out, n)
    return out


def root_of(value: str) -> str:
    v = str(value).strip()
    if v.startswith("{"):
        return v[1:].split("}")[0].split(".")[0]
    return v.split(".")[0]


def add(xs: list, x: str) -> None:
    if x not in xs:
        xs.append(x)


class Emitter:
    def __init__(self, root: Path, workflow: str, known: set, declared_reads: set):
        self.root = root
        self.workflow = workflow
        self.known = known
        self.declared_reads = declared_reads
        self.notes = []

    def variable_or_literal(self, value, where: str):
        v = str(value).strip()
        if v.startswith("{"):
            return root_of(v)
        if root_of(v) in self.known:
            return root_of(v)
        self.notes.append(f"{where}: bare value {v!r} names no bag entry, read as a literal")
        return None

    def produced_by(self, s) -> list:
        """Pass one: every name a step may put in the bag, loop bodies included."""
        kind = s["kind"]
        out = []
        if kind == "technique":
            ref = s["technique"]
            outputs_map = (ref.get("outputs", {}) or {}) if isinstance(ref, dict) else {}
            name = ref["name"] if isinstance(ref, dict) else ref
            path = resolve(self.root, self.workflow, "techniques", name, ".md")
            _, _, outputs, _ = technique_contract(path)
            out += [outputs_map.get(n, n) for n in outputs]
            out += self.actions(s.get("actions"))[0]
        elif kind == "action":
            out += self.actions(s.get("actions"))[0]
        elif kind == "checkpoint":
            for o in s.get("options", []):
                effect = o.get("effect", {}) or {}
                out += list((effect.get("setVariable") or {}).keys())
                if effect.get("recordReply"):
                    out.append(effect["recordReply"])
        elif kind == "loop":
            if s.get("variable"):
                out.append(s["variable"])
            for b in s.get("steps", []):
                out += self.produced_by(b)
        elif kind == "routine":
            out += list((s.get("outputs") or {}).values())
        return out

    def step(self, s) -> str:
        kind = s["kind"]
        gate = gate_of(s)
        sid = s.get("id", "")
        if kind == "technique":
            ref = s["technique"]
            inputs_map, outputs_map = {}, {}
            if isinstance(ref, dict):
                inputs_map = ref.get("inputs", {}) or {}
                outputs_map = ref.get("outputs", {}) or {}
                ref = ref["name"]
            path = resolve(self.root, self.workflow, "techniques", ref, ".md")
            required, optional, outputs, inherited = technique_contract(path)
            if not sid:
                sid = ref.split("::")[-1].split("/")[-1]
            ins = []
            for name in required + optional:
                if name in inputs_map:
                    v = self.variable_or_literal(inputs_map[name], f"step {sid} input {name}")
                    if v:
                        add(ins, v)
                elif name in required and name not in inherited:
                    add(ins, name)
                elif name in inherited and name in self.declared_reads:
                    add(ins, name)
            for name in inputs_map:
                if name not in required and name not in optional:
                    self.notes.append(f"step {sid}: binds input {name!r} that {path.name} and its contracts do not declare")
                    v = self.variable_or_literal(inputs_map[name], f"step {sid} input {name}")
                    if v:
                        add(ins, v)
            own = set(required) | set(optional) | set(outputs)
            for name in prose_reads(path):
                if name in self.known and name not in own:
                    add(ins, name)
            outs = [outputs_map.get(name, name) for name in outputs]
            sets, consults = self.actions(s.get("actions"))
            for c in consults:
                add(ins, c)
            return f'M.Tech{{{q(sid)}, {lst(gate)}, {lst(ins)}, {lst(outs)}, {lst(sets)}}}'
        if kind == "action":
            sets, consults = self.actions(s.get("actions"))
            return f'M.Act{{{q(sid)}, {lst(gate)}, {lst(consults)}, {lst(sets)}}}'
        if kind == "checkpoint":
            consults = braced_names(s.get("message"))
            opts = []
            for o in s.get("options", []):
                effect = o.get("effect", {}) or {}
                sets = list((effect.get("setVariable") or {}).keys())
                if effect.get("recordReply"):
                    sets.append(effect["recordReply"])
                exit_ = effect.get("exit")
                ex = f'Some{{{q(exit_)}}}' if exit_ else "None{}"
                opts.append(f'M.Opt{{{q(o["id"])}, {lst(sets)}, {ex}}}')
            return f'M.Check{{{q(sid)}, {lst(gate)}, {lst(consults)}, [{", ".join(opts)}]}}'
        if kind == "loop":
            consults = names_in_condition(s.get("continueWhile")) + names_in_condition(s.get("breakCondition"))
            if s.get("over"):
                add(consults, str(s["over"]).split(".")[0])
            item = f'Some{{{q(s["variable"])}}}' if s.get("variable") else "None{}"
            bound = f'Some{{{s["maxIterations"]}n}}' if s.get("maxIterations") else "None{}"
            body = ", ".join(self.step(b) for b in s.get("steps", []))
            return f'M.Loop{{{q(sid)}, {lst(gate)}, {lst(consults)}, {item}, {bound}, [{body}]}}'
        if kind == "routine":
            path = resolve(self.root, self.workflow, "routines", s["routine"], ".yaml")
            required, optional, outputs = routine_contract(path)
            with_ = s.get("with", {}) or {}
            ins = []
            for name in required + optional:
                if name in with_:
                    v = str(with_[name])
                    if v.startswith("{"):
                        add(ins, root_of(v))
                    else:
                        self.notes.append(f"step {sid}: with {name}: {v!r} is a bare value, a literal per activity.schema.json")
                elif name in required and name in self.known:
                    add(ins, name)
            outs = list((s.get("outputs") or {}).values())
            return f'M.Rout{{{q(sid)}, {lst(gate)}, {lst(ins)}, {lst(outs)}}}'
        raise SystemExit(f"unknown step kind {kind!r}")

    def actions(self, actions):
        sets, consults = [], []
        for a in actions or []:
            kind = a.get("action")
            if kind == "set":
                add(sets, str(a["target"]).split(".")[0])
                for n in braced_names(a.get("value")):
                    add(consults, n)
            elif kind == "validate":
                for n in names_in_expression(a.get("target")):
                    add(consults, n)
                for n in braced_names(a.get("message")):
                    add(consults, n)
            else:
                for n in braced_names(a.get("message")):
                    add(consults, n)
        return sets, consults


def q(s: str) -> str:
    return '"' + str(s).replace('"', '\\"') + '"'


def lst(xs) -> str:
    return "[" + ", ".join(q(x) for x in xs) + "]"


TYPES = {"boolean": "TBool", "string": "TString", "number": "TNumber", "array": "TArray", "object": "TObject"}


def generate(root: Path, workflow: str, activity_path: Path, out_path: Path, name: str, model_import: str) -> list:
    """Write the Bend data file; return the generator's notes."""
    doc = yaml.safe_load(activity_path.read_text())
    variables = doc.get("variables", {}) or {}
    reads = variables.get("reads", []) or []
    ambient = []
    for n in SEEDED + AMBIENT_CONTEXT + orchestrator_inputs(root):
        add(ambient, n)
    known = set(reads) | set(ambient)
    for w in variables.get("writes", []) or []:
        known.add(w["name"])
    pre = Emitter(root, workflow, known, set(reads))
    for s in doc.get("steps", []):
        for n in pre.produced_by(s):
            known.add(n)
    em = Emitter(root, workflow, known, set(reads))
    writes = []
    for w in variables.get("writes", []) or []:
        defaulted = "True{}" if "defaultValue" in w else "False{}"
        writes.append(f'M.Decl{{{q(w["name"])}, {defaulted}, M.{TYPES[w["type"]]}{{}}}}')
    steps = [em.step(s) for s in doc.get("steps", [])]
    exits = []
    for e in doc.get("exits", []) or []:
        exits.append(f'M.Exit{{{q(e["id"])}, {lst(names_in_expression(e.get("when")))}}}')
    body = "\n".join([
        f"# Generated by gen.py from {activity_path.name} (workflow {workflow}). Do not edit.",
        "import Base",
        f"import {model_import} as M",
        "",
        "# The names the server supplies to every session: seeded bag names, ambient",
        "# context ids, and the names the orchestrator holds.",
        "def ambient() -> List<&2, String>:",
        f"  {lst(ambient)}",
        "",
        f"def {name}() -> M.Activity:",
        f"  M.Activity{{{q(doc['id'])},",
        f"    {lst(reads)},",
        "    [" + ",\n     ".join(writes) + "],",
        "    [" + ",\n     ".join(steps) + "],",
        "    [" + ", ".join(exits) + "]}",
        "",
    ])
    out_path.write_text(body)
    print(f"wrote {out_path} ({len(steps)} top-level steps, {len(writes)} writes, {len(reads)} reads, {len(ambient)} ambient)")
    return em.notes


def main():
    root, workflow, activity_path, out_path = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3]), Path(sys.argv[4])
    name = sys.argv[5] if len(sys.argv) > 5 else "activity"
    model_import = sys.argv[6] if len(sys.argv) > 6 else "./model.bend"
    for n in generate(root, workflow, activity_path, out_path, name, model_import):
        print("note:", n, file=sys.stderr)


if __name__ == "__main__":
    main()
