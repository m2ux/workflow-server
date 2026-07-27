# PoC Record — `naming-conventions` mechanisation

> Review · Created 2026-07-25 · **Status:** Planning

Built in `/tmp/wp-mech-poc/` (outside the repo, per the review's ground rules). Script, tests, diff
harness, and thin technique are reproduced here so the work survives the temp directory.

Candidate selected: **`naming-conventions`** — branch-name and `target_path` derivation. Chosen as
recommended, and the choice was right for a reason the recommendation did not state: it is the
*worst* candidate on tokens and the *best* on drift, so it stress-tests the honesty of the whole
programme.

---

## 1. What was built

| Artifact | Path | Size |
|---|---|---|
| Script | `/tmp/wp-mech-poc/scripts/wp.py` | 11,634 chars |
| Tests | `/tmp/wp-mech-poc/tests/test_wp.py` | 31 tests, all passing under bare `python3` |
| Prose-diff harness | `/tmp/wp-mech-poc/tests/diff_vs_prose.py` | 5 fixtures |
| Thin technique | `/tmp/wp-mech-poc/technique/naming-conventions.md` | 3,208 chars (was 3,233) |

Test run: `python3 tests/test_wp.py` → `Ran 31 tests in 0.009s — OK`. No install, no
`node_modules`, no network. Two of my initial test *expectations* were wrong and the script was
right (word-boundary truncation of a 35-char slug, and a 37-char slug needing no truncation) — a
small vote of confidence in fixture-testing over eyeballing.

Fixtures cover both path layouts plus review mode, as required:

| # | Fixture | Layout exercised |
|---|---|---|
| F1 | `~/projects/dev/workflow-server/.engineering/artifacts/planning/<slug>` | nested `.worktrees` (docs-mandated; **live on this host**) |
| F2 | `$INSTALL/projects/m2ux/midnight-node/.engineering/artifacts/planning/<slug>` | install co-location (the prose's primary branch) |
| F3 | `/var/tmp/planning/<slug>`, no planning ancestry | personal fallback (**live on this host**, 12+ worktrees) |
| F4 | review mode against midnight-node PR #1900's shape | review-mode branch passthrough |
| F5 | `issue_type: epic` | a type the prose table omits |

---

## 2. The script

```python
#!/usr/bin/env python3
"""wp — mechanised deterministic steps for the work-package workflow.

One executable, many subcommands. Stdlib only; no build step, no dependencies.

Contract: every subcommand prints ONE JSON object to stdout and nothing else.
Human-readable diagnostics go to stderr. Exit codes classify the outcome:

    0  ok            — `outputs` holds the technique's declared output ids
    2  precondition  — a required input is missing or malformed; agent fixes inputs
    3  ambiguous     — state the script may not resolve; agent takes over (judgement)
    4  environment   — interpreter/tool/filesystem prerequisite absent
    1  internal      — unexpected failure; treat as a script defect
"""

import argparse
import json
import os
import re
import sys

CONTRACT = 1
SCRIPT_ID = "wp"

EX_OK = 0
EX_INTERNAL = 1
EX_PRECONDITION = 2
EX_AMBIGUOUS = 3
EX_ENVIRONMENT = 4


class Fail(Exception):
    def __init__(self, code, klass, reason, detail=None):
        super().__init__(reason)
        self.code = code
        self.klass = klass
        self.reason = reason
        self.detail = detail or {}


def precondition(reason, **detail):
    return Fail(EX_PRECONDITION, "precondition", reason, detail)


def ambiguous(reason, **detail):
    return Fail(EX_AMBIGUOUS, "ambiguous", reason, detail)


# Total function from issue_type to Conventional-Commits branch prefix.
# Single-sourced here; the technique cites this table rather than restating it.
TYPE_PREFIX = {
    "feature": "feat",
    "bug": "fix",
    "task": "chore",
    "enhancement": "refactor",
    "epic": "feat",
    "docs": "docs",
    "chore": "chore",
    "refactor": "refactor",
}

SLUG_MAX = 40


def slugify(title, limit=SLUG_MAX):
    """Lowercase, non-alphanumeric to single dashes, trimmed, word-boundary
    truncation at `limit`. Deterministic for a given (title, limit)."""
    s = title.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    if len(s) <= limit:
        return s
    cut = s[:limit]
    if "-" in cut:
        boundary = cut.rsplit("-", 1)[0]
        if boundary:
            return boundary
    return cut.rstrip("-")


def normalise_issue_number(raw):
    """`#42` / `42` / `PROJ-42` -> canonical branch segment. Rejects junk."""
    v = str(raw).strip().lstrip("#").strip()
    if not v:
        raise precondition("issue_number is empty after normalisation", issue_number=raw)
    if re.fullmatch(r"\d+", v):
        return v
    if re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*-\d+", v):
        return v.upper()
    raise precondition(
        "issue_number matches neither a GitHub number nor a Jira PROJ-N key",
        issue_number=raw,
    )


def derive_branch_name(issue_type, issue_title, issue_number):
    key = (issue_type or "").strip().lower()
    if not key:
        raise precondition("issue_type is required to derive a branch name")
    if key not in TYPE_PREFIX:
        raise ambiguous(
            "issue_type is outside the type-prefix table; choose a prefix explicitly",
            issue_type=issue_type,
            known_types=sorted(TYPE_PREFIX),
        )
    prefix = TYPE_PREFIX[key]
    number = normalise_issue_number(issue_number)
    slug = slugify(issue_title or "")
    if not slug:
        raise precondition("issue_title slugifies to the empty string", issue_title=issue_title)
    return "{}/{}-{}".format(prefix, number, slug)


PLANNING_MARKERS = (
    os.path.join(".engineering", "artifacts", "planning"),
    os.path.join("artifacts", "planning"),
)


def split_planning_folder(planning_folder_path):
    """Return (checkout_root, wp_slug, marker) for a planning folder."""
    p = os.path.normpath(planning_folder_path)
    if not os.path.isabs(p):
        raise precondition("planning_folder_path must be absolute",
                           planning_folder_path=planning_folder_path)
    slug = os.path.basename(p)
    if not slug:
        raise precondition("planning_folder_path has no basename",
                           planning_folder_path=planning_folder_path)
    parent = os.path.dirname(p)
    for marker in PLANNING_MARKERS:
        suffix = os.sep + marker
        if parent.endswith(suffix):
            root = parent[: -len(suffix)]
            if marker == PLANNING_MARKERS[1] and os.path.basename(root) == ".engineering":
                root = os.path.dirname(root)
            return root, slug, marker
    return None, slug, None


def derive_target_path(planning_folder_path, component_name, repo_root, home):
    """Canonical feature-worktree path.

    Primary (docs/install-projects-worktrees.md): `<checkout>/.worktrees/<slug>/`
    Fallback (no planning-folder ancestry): `<home>/projects/work/<component>/<slug>/`
    """
    checkout, slug, marker = split_planning_folder(planning_folder_path)
    warnings = []
    if checkout:
        target = os.path.join(checkout, ".worktrees", slug)
        layout = "nested"
        if repo_root and os.path.normpath(repo_root) != os.path.normpath(checkout):
            warnings.append(
                "repo_root ({}) is not the planning folder's checkout ({}); "
                "target_path follows the planning folder".format(repo_root, checkout)
            )
    else:
        if not component_name:
            raise ambiguous(
                "planning_folder_path has no recognised planning ancestry and "
                "component_name is unbound, so no fallback path can be composed",
                planning_folder_path=planning_folder_path,
            )
        target = os.path.join(home, "projects", "work", component_name, slug)
        layout = "personal"
    return target, slug, layout, warnings


def assert_containment(target, planning_folder_path, repo_root):
    """Invariants the agent would otherwise have to check by reading.

    Enforced: target is neither the planning folder nor inside it, and is not
    equal to repo_root. NOT enforced: "never under repo_root" — the mandated
    nested layout places the worktree under the checkout by design. The
    declined clause is reported as a warning, not silently dropped.
    """
    t = os.path.normpath(target)
    pf = os.path.normpath(planning_folder_path)
    warnings = []
    if t == pf or t.startswith(pf + os.sep):
        raise precondition("derived target_path falls inside planning_folder_path",
                           target_path=t, planning_folder_path=pf)
    if repo_root:
        rr = os.path.normpath(repo_root)
        if t == rr:
            raise precondition("derived target_path equals repo_root", target_path=t, repo_root=rr)
        if t.startswith(rr + os.sep):
            warnings.append(
                "target_path is under repo_root ({}), which the nested "
                ".worktrees layout requires and naming-conventions step 6 forbids; "
                "the layout mandate wins".format(rr)
            )
    return warnings


def cmd_derive_names(args):
    warnings = []
    outputs = {}

    if args.review_mode:
        if not args.branch_name:
            raise precondition(
                "review mode requires branch_name captured from the PR reference",
                is_review_mode=True,
            )
        outputs["branch_name"] = args.branch_name
    else:
        outputs["branch_name"] = derive_branch_name(
            args.issue_type, args.issue_title, args.issue_number
        )

    if not args.planning_folder_path:
        raise precondition("planning_folder_path is required to derive target_path")

    target, slug, layout, w = derive_target_path(
        args.planning_folder_path, args.component_name, args.repo_root, args.home
    )
    warnings.extend(w)
    warnings.extend(assert_containment(target, args.planning_folder_path, args.repo_root))
    outputs["target_path"] = target + os.sep

    return outputs, warnings, {"layout": layout, "wp_slug": slug}


SUBCOMMANDS = {"derive-names": cmd_derive_names}


def build_parser():
    p = argparse.ArgumentParser(prog=SCRIPT_ID, add_help=True)
    p.add_argument("--require-contract", type=int, default=None,
                   help="fail with exit 2 unless the script's contract major equals this")
    sub = p.add_subparsers(dest="subcommand", required=True)

    dn = sub.add_parser("derive-names", help="branch_name + target_path for a work package")
    dn.add_argument("--issue-type", default=None)
    dn.add_argument("--issue-title", default=None)
    dn.add_argument("--issue-number", default=None)
    dn.add_argument("--component-name", default=None)
    dn.add_argument("--planning-folder-path", default=None)
    dn.add_argument("--repo-root", default=None)
    dn.add_argument("--branch-name", default=None, help="review mode: branch captured from the PR")
    dn.add_argument("--review-mode", action="store_true")
    dn.add_argument("--home", default=os.path.expanduser("~"),
                    help="home root for the personal-layout fallback (testability)")
    return p


def main(argv=None):
    args = build_parser().parse_args(argv)

    if args.require_contract is not None and args.require_contract != CONTRACT:
        sys.stdout.write(json.dumps({
            "ok": False, "contract": CONTRACT, "subcommand": args.subcommand,
            "class": "precondition", "fallback": "prose",
            "reason": "contract mismatch: technique requires {}, script provides {}".format(
                args.require_contract, CONTRACT),
        }) + "\n")
        return EX_PRECONDITION

    try:
        outputs, warnings, provenance = SUBCOMMANDS[args.subcommand](args)
    except Fail as f:
        sys.stderr.write("{}: {}\n".format(f.klass, f.reason))
        sys.stdout.write(json.dumps({
            "ok": False, "contract": CONTRACT, "subcommand": args.subcommand,
            "class": f.klass, "reason": f.reason, "fallback": "prose",
            "detail": f.detail,
        }) + "\n")
        return f.code
    except Exception as exc:
        sys.stderr.write("internal: {}\n".format(exc))
        sys.stdout.write(json.dumps({
            "ok": False, "contract": CONTRACT, "subcommand": args.subcommand,
            "class": "internal", "reason": str(exc), "fallback": "prose",
        }) + "\n")
        return EX_INTERNAL

    prov = {"script": SCRIPT_ID, "contract": CONTRACT, "subcommand": args.subcommand}
    prov.update(provenance)
    sys.stdout.write(json.dumps({
        "ok": True, "contract": CONTRACT, "subcommand": args.subcommand,
        "outputs": outputs, "warnings": warnings, "provenance": prov,
    }) + "\n")
    return EX_OK


if __name__ == "__main__":
    sys.exit(main())
```

---

## 3. Test coverage

31 tests, stdlib `unittest`. Grouped:

| Group | Tests | What they pin |
|---|---:|---|
| `TestSlugify` | 6 | basic, punctuation/repeat collapse, word-boundary truncation, hard cut with no boundary, determinism across calls, non-ASCII |
| `TestIssueNumber` | 5 | `#N` stripped, bare `N`, Jira up-cased, junk → exit 2, `#` alone → exit 2 |
| `TestBranchName` | 6 | type table total over the five declared types; each mapping; unknown type → **exit 3, not a guess** |
| `TestPlanningFolderSplit` | 4 | `.engineering/artifacts/planning`, engineering-branch checkout, no ancestry, relative path rejected |
| `TestDeriveNamesCli` | 10 | the five fixtures; review mode without a branch → exit 2; personal fallback without `component_name` → exit 3; target never inside the planning folder; contract mismatch fails closed; double-invocation idempotence; **exactly one JSON object on stdout** |

---

## 4. Script vs prose — the diff

The harness implements `naming-conventions.md` v1.0.0 *literally*, representing each indeterminacy as
a **set** of admissible answers. A candidate set with more than one member is itself the finding: the
prose does not determine the output.

```python
# Step 2: "feature -> feat, bug -> fix, task/enhancement -> chore/refactor as
# appropriate." The `/` plus "as appropriate" makes two types 2-valued.
PROSE_PREFIX = {
    "feature": {"feat"},
    "bug": {"fix"},
    "task": {"chore", "refactor"},
    "enhancement": {"chore", "refactor"},
    "epic": set(),            # not in the table at all
}

def prose_slugs(title):
    """Step 3: 'lowercase, dashes, max ~40 chars'. '~40' and the absence of a
    truncation rule admit several readings; enumerate the plausible ones."""
    ...
    out = {base[:40], base[:40].rstrip("-")}
    if "-" in base[:40]:
        out.add(base[:40].rsplit("-", 1)[0])
    out.add(base[:35]); out.add(base[:45])   # "~40" read loosely
    return {s for s in out if s}

def prose_branch_names(issue_type, issue_title, issue_number):
    """Step 4: '{type}/{issue_number}-{slugified-title}'. issue_number arrives
    from issue-reference-detection as '#N / bare number' — both readings kept."""
    ...

def prose_target_paths(planning_folder_path, component_name, home):
    """Step 6: install-layout branch when the planning folder matches
    `…/projects/<owner>/<repo>/.engineering/artifacts/planning/<slug>`, else the
    personal-layout fallback."""
    ...
```

### Results

| Fixture | Script `branch_name` | Prose candidates | Script `target_path` | Prose `target_path` | Agree? |
|---|---|---:|---|---|---|
| F1 nested | `feat/233-expose-ledger-events` | **4** | `…/projects/dev/workflow-server/.worktrees/2026-07-25-expose-events/` | `/home/mike1/worktrees/dev/workflow-server/2026-07-25-expose-events/` | **no** |
| F2 install | `chore/233-dust-public-key-fatal-validation` | **4** | `$INSTALL/projects/m2ux/midnight-node/.worktrees/2026-07-25-dust/` | `$INSTALL/worktrees/m2ux/midnight-node/2026-07-25-dust/` | **no** |
| F3 personal | `refactor/PM-77-contract-address-untagged-flag` | **4** | `~/projects/work/midnight-node/<slug>/` | `~/projects/work/midnight-node/<slug>/` | **yes** |
| F4 review | `feature/ledger-events` (passthrough) | 1 | `…/projects/dev/midnight-node/.worktrees/2026-07-25-review-pr1900/` | `/home/mike1/worktrees/dev/midnight-node/2026-07-25-review-pr1900/` | **no** |
| F5 epic | `feat/900-ledger-event-streaming` | **0** | `…/.worktrees/2026-07-25-epic/` | `/home/mike1/worktrees/dev/midnight-node/2026-07-25-epic/` | **no** |

**8 disagreements.** Every one is a live defect in the current technique, not a PoC artefact:

| ID | Defect | Severity |
|---|---|---|
| **D-1** | `task`/`enhancement` → "`chore`/`refactor` as appropriate" is **not a function**. Two runs on the same issue can produce different branch names, hence different worktrees, hence different PRs. | high |
| **D-2** | Step 6's primary branch emits `<install-root>/worktrees/<owner>/<repo>/<slug>/`, which `docs/install-projects-worktrees.md:10` marks **deprecated** and `docker-compose.yml:3` also deprecates. The live rule mandates a forbidden path. **Verified on this host: zero paths of that shape exist.** The primary branch of the rule has never produced a correct answer. | high |
| **D-3** | Step 6's fallback emits `~/projects/work/<component>/<slug>/`, which the docs also exclude ("Feature worktrees **only** under `<repo>/.worktrees/<slug>/`"). **But 12+ worktrees of exactly that shape exist on this host** — so the docs are the aspiration and the prose fallback is the practice. Both documents are wrong about reality, in opposite directions. | high |
| **D-4** | Step 6's rule "Never place `{target_path}` under `{planning_folder_path}` **or under `{repo_root}`**" **contradicts the docs-mandated layout**, since `repo-root-resolution` sets `repo_root` = the checkout for a standalone repo and the mandate is `<checkout>/.worktrees/<slug>/`. No implementation can satisfy both. The script enforces the substantive half and emits a warning naming the clause it declines — visible in all five fixture runs. | **high — hard contradiction** |
| **D-5** | Slug rule "max ~40 chars" is not a number, and no truncation policy is given (mid-word? word boundary? strip trailing dash?). The harness found 2–3 readings per title. | medium |
| **D-6** | `issue_number` arrives from `issue-reference-detection` as "`#N` / bare number"; step 4 interpolates it raw. `feat/#233-…` and `feat/233-…` are both faithful readings, and both are valid git refs, so nothing downstream catches it. | medium |
| **D-7** | Step 5's review-mode clause — "derive `{$wp_slug}` from the PR title or branch name instead" — is both **unnecessary** (the server created a planning folder in review mode too, so its basename is available) and **non-deterministic** (PR titles are free text). F4 shows the script needs no such branch. | medium |
| **D-8** | **New finding.** Step 6's install-layout test is **under-anchored**: `…/projects/<owner>/<repo>/.engineering/artifacts/planning/<slug>` matches the docs-*preferred* nested layout too, reading `~/projects/dev/workflow-server/…` as owner=`dev`, repo=`workflow-server`, install-root=`~`, and emitting `~/worktrees/dev/workflow-server/<slug>/` — a path in no layout, under no root, on no host. It misfires on the very layout the project mandates. Visible in F1 and F4. | **high — silently wrong output** |

D-8 is the finding I did not predict, and it is the one that most changes the case. The prose is not
merely ambiguous or stale; on the *mandated* layout it produces a confidently wrong path with no
warning attached. An agent following it faithfully creates a worktree in `~/worktrees/dev/…`.

---

## 5. Delta on the four decision goals

| Goal | Delta | Evidence |
|---|---|---|
| **Token usage** | **worse, marginally.** Technique payload 3,233 → 3,208 chars (**−0.6 %**); one tool call added where there were zero. Reasoning saved is real but unmeasured. | Section-by-section: Protocol −185, Outputs −251, Inputs **+174** (`repo_root`, `script_root`), Rules **+224** (`script-is-the-single-source`). |
| **Completion speed** | **worse, marginally.** +1 tool call ≈ +1–3 s per bind, ×2 binds. Offset only if the eliminated reasoning exceeds that, which is likely but unproven. | — |
| **Execution fidelity** | **much better.** 4 admissible branch names → 1. 2–3 slug readings → 1. A silently-wrong `target_path` (D-8) → a correct one plus an explicit warning. `epic` → a definite `feat` instead of no rule at all. A hard contradiction (D-4) → an enforced invariant plus a named declination. | 31 tests; 5 fixtures; 8 disagreements. |
| **Definition drift** | **much better.** Type table, slug rule, and layout formulas move from 2–3 diverged prose homes to one tested function. `script-is-the-single-source` makes a future restatement a review-catchable defect. | D-2/D-3/D-4/D-8 are all drift-class; all resolved by single-sourcing. |

**Verdict: mechanise it — on fidelity and drift, against a small token and speed cost.** Anyone
selling this candidate on token savings is selling the wrong thing.

---

## 6. What the exercise taught me that the contract design got wrong

Five corrections, each already folded back into [invocation-contract.md](invocation-contract.md).

1. **The technique payload does not shrink, and I expected it to.** My pre-PoC estimate was a
   40–60 % Protocol reduction translating to a meaningful payload win. Measured: **−0.6 %** overall.
   The reason is structural and applies to *every* candidate: `signature-is-the-contract` requires the
   full `## Inputs`/`## Outputs` declaration, and in a technique of this class the signature is most
   of the file. Worse, mechanisation *adds* inputs (`script_root`, and often an explicit path the
   prose left implicit) and adds a rule (`script-is-the-single-source`). Any roadmap that promises
   payload savings should be read sceptically; the contract now says this in §11.

2. **`warnings[]` was an afterthought and turned out to be load-bearing.** I added it as
   nice-to-have. Then D-4 appeared — a rule the script *cannot* satisfy while satisfying the mandated
   layout — and the only honest behaviours were to fail (blocking every run) or to obey silently
   (hiding a known contradiction). `warnings[]` is the third option: comply with the mandate, name the
   declined clause, hand the judgement to a human. It is now mandatory in the contract, and "surface
   verbatim, never act on" is a numbered protocol step in the template.

3. **The 2-vs-3 exit-code split needed to exist, and I nearly collapsed it.** My first sketch had one
   "failure" code. The fixtures forced the split: review mode without `branch_name` is *the agent's
   mistake* (fix the input, retry — code 2); `issue_type: spike` is *the specification's silence*
   (take over with judgement — code 3). One code would have made every retry-vs-escalate decision a
   judgement call, which is exactly what mechanisation is supposed to remove.

4. **Fixture-driven development caught two of my own wrong expectations.** I asserted
   `dust-public-key-fatal-validation` and the script returned `dust-public-key-fatal-validation-on`;
   I asserted a truncation that a 37-char slug did not need. In both cases the script was right and I
   was wrong. This is the argument for the contract's checklist item 4 stated as strongly as it is:
   **a mechanised technique without a test suite is not mechanised, it is delegated.**

5. **Distribution is less hard than the framing assumed — but only because someone is mid-way through
   solving it, which I nearly misreported as shipped.** I went looking for a new resource class and
   found `src/utils/path-presentation.ts`: a server-root → host-root prefix map, applied to
   `planning_folder_path` for exactly this reason ("so agents can open/write artifacts in their IDE
   workspace"), with `HOST_PROJECTS_ROOT` / `HOST_WORKTREE_ROOT` wired. It has no third pair for the
   workflows root, and `start.sh` already computes `HOST_WORKFLOWS_DIR` without passing it into the
   container. So distribution is ~20 lines, not a new addressable file class.

   **The correction:** that file is **untracked**, and committed `config.ts` (438 lines) has no
   presentation layer at all — the working-tree copy (509 lines) does. I first read the file *after* a
   stale cached read of the committed version had already told me the mechanism was absent, and the
   contradiction is what made me check `git cat-file`. Two lessons, and the second is the one worth
   keeping: re-read before concluding a mechanism is absent, **and check `git cat-file -e HEAD:<path>`
   before concluding one is present.** A review that cites uncommitted work as shipped behaviour
   produces a roadmap whose foundation can be reverted by someone else's `git checkout`.
