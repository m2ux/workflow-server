#!/usr/bin/env python3
"""Make the negative cases of the real layer: one deliberate defect each, applied
to a copy of 10-post-impl-review.yaml, translated by gen.py into data/<case>_data.bend.
Each case's law file <case>.bend, beside this script, imports its data and states
the law the defect must break.

    cd spike/real/negative && python3 make.py <corpus-root>
"""
import copy
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import gen  # noqa: E402

HERE = Path(__file__).resolve().parent
ROOT = Path(sys.argv[1])
SOURCE = ROOT / "work-package" / "activities" / "10-post-impl-review.yaml"


def find_step(doc, step_id):
    for s in doc["steps"]:
        if s.get("id") == step_id:
            return s
        for b in s.get("steps", []) or []:
            if b.get("id") == step_id:
                return b
    raise KeyError(step_id)


def unbounded_loop(doc):
    """The while loop loses its maxIterations: nothing bounds the review-fix cycle."""
    del find_step(doc, "review-fix-cycle")["maxIterations"]


def orphan_input(doc):
    """A bound input names, in braces, a variable nothing produces: a misspelt remap."""
    find_step(doc, "classify-and-route-findings")["technique"]["inputs"]["findings_to_classify"] = "{manual_diff_review_repor}"


def bare_rename_typo(doc):
    """The same misspelling as a bare value. The server's grammar reads a bare value that
    names no bag entry as a literal string (binding-provenance.ts 445-451), so the typo is
    not a defect the server or its guards can see; the law passes. This case lives in
    real/ as a finding, not under negative/."""
    find_step(doc, "classify-and-route-findings")["technique"]["inputs"]["findings_to_classify"] = "manual_diff_review_repor"


def undeclared_read(doc):
    """A gate consults a name the activity never declares or produces."""
    find_step(doc, "register-review-follow-ups")["when"] = "review_budget_remaining == true"


def unused_read(doc):
    """A declared read nothing consults."""
    doc["variables"]["reads"].append("reviewer_handle")


def unproduced_write(doc):
    """A declared write no step produces."""
    doc["variables"]["writes"].append({"name": "review_verdict", "type": "string", "description": "Never produced."})


def option_exit_undeclared(doc):
    """A checkpoint option selects an exit the activity does not declare."""
    step = find_step(doc, "local-validation-permission")
    step["options"][1]["effect"]["exit"] = "escalate"


CASES = {
    "neg_unbounded_loop": unbounded_loop,
    "neg_orphan_input": orphan_input,
    "neg_undeclared_read": undeclared_read,
    "neg_unused_read": unused_read,
    "neg_unproduced_write": unproduced_write,
    "neg_option_exit_undeclared": option_exit_undeclared,
    "finding_bare_rename_typo": bare_rename_typo,
}


def main():
    base = yaml.safe_load(SOURCE.read_text())
    (HERE / "data").mkdir(exist_ok=True)
    for case, mutate in CASES.items():
        doc = copy.deepcopy(base)
        mutate(doc)
        yaml_path = HERE / "data" / f"{case}.yaml"
        yaml_path.write_text(yaml.safe_dump(doc, sort_keys=False, width=1000))
        notes = gen.generate(ROOT, "work-package", yaml_path, HERE / "data" / f"{case}_data.bend", "activity", "./../../model.bend")
        for n in notes:
            print(f"note ({case}):", n, file=sys.stderr)


if __name__ == "__main__":
    main()
