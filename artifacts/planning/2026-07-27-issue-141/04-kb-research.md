# Knowledge Base Research - Hierarchical Path-Scoped Resource Section References

> 2026-07-27 · #141 · Draft

Research answers the two questions [DP-8](02-assumptions-log.md) carried forward: pin GitHub
heading-anchor slug semantics precisely enough to write and differentially test a shared slugger
**without** taking the `github-slugger` dependency, and pin CommonMark closing-fence rules precisely
enough to specify a correct fence tracker.

Both are now pinned from primary sources — `github-slugger`'s implementation, its regex **generator**
(which states the rule rather than the expanded output), its GitHub-validated fixture table, and the
CommonMark 0.31.2 specification text. Corpus measurements classify every divergence found as live or
latent, at `workflows` submodule commit **d9b30234** (the same revision as every prior measurement in
this package, so the figures are comparable).

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|------------|-----------------|
| identify-best-practices | `practice-research` (broad_chunks_search ×3) | **No relevant content.** Three probes (differential testing / test oracles; single-source-of-truth and specification drift; markdown-parser conformance and identifier normalization) returned only general software-engineering and ISO-process material at scores 0.20–0.34 with no topical match. The library holds no markdown-tooling, slug-normalization, or differential-testing content. Gap recorded; findings rest on web research and corpus measurement |
| Web research | Primary-source retrieval — package source, generator script, fixture table, specification text | Slug semantics pinned exactly, including the duplicate-counter algorithm and the exact Unicode rule; CommonMark fence rules quoted verbatim |
| Corpus measurement | Five purpose-built read-only probes over all 728 corpus `.md` files (6,315 headings, 537 in-corpus anchor links) | Every newly-found divergence classified live or latent; the SC-9 exposure number produced as a first cut; RE-3's 7-link count independently confirmed corpus-wide |

The probes are read-only Python reimplementations, not the project's own tooling. Their fidelity check:
the guard-equivalent probe reports **exactly 3** broken links under the naive fence toggle, matching the
guard's actual red baseline of 3 — so the reimplementation reproduces the guard's verdict on the current
corpus. Link count 537 vs the guard's own 527 differs by the probe's target-exists and `.md`-target
filters, consistent with earlier probes' ~2% spread.

## Relevant Concepts Discovered

The knowledge base yielded none. This section is empty by measurement, not by omission — see the
Research Approach row above and candidate [RC-1](#open-research-candidates).

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| `github-slugger` source, duplicate counter | package `index.js` (master) | Exact algorithm; counter keyed on the *derived base slug* with a skip loop |
| `github-slugger` strip regex | package `regex.js` + `script/generate-regex.js` | The **rule** behind the generated class: a Unicode General-Category remove-list minus `Alphabetic`, space and `-` |
| `github-slugger` fixtures | `test/fixtures.json` | GitHub-validated input→output table, including the `-N`-interaction cases |
| `github-slugger` version / currency | GitHub releases, libraries.io | 2.0.0 (Oct 2022), latest; algorithm unchanged since |
| CommonMark fenced code blocks | spec 0.31.2 | Closing-fence rules verbatim |
| CommonMark ATX / setext / indented code | spec 0.31.2 | Heading-recognition rules verbatim |
| CommonMark version currency; whether GFM specifies anchors | spec.commonmark.org, CommonMark discussion | 0.31.2 (2024-01-28) is current; **neither CommonMark nor GFM specifies heading-anchor generation** |
| Known GitHub-vs-`github-slugger` divergences | Flet/github-slugger issues, eslint/eslint#16067 | None documented; the double-hyphen behaviour independently corroborated |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| `github-slugger` `index.js` | https://github.com/Flet/github-slugger/blob/master/index.js | `slug(value, maintainCase)` is `toLowerCase()` → `replace(regex,'')` → `replace(/ /g,'-')`, **with no `trim()`**. The stateful `slug()` method holds an `occurrences` map and runs a skip loop | HIGH |
| `github-slugger` `script/generate-regex.js` | https://github.com/Flet/github-slugger/blob/master/script/generate-regex.js | States the strip rule as Unicode General Categories rather than an opaque class — the single most useful artefact for writing an equivalent without the dependency | HIGH |
| `github-slugger` `test/fixtures.json` | https://github.com/Flet/github-slugger/blob/master/test/fixtures.json | GitHub-validated expectations, including `-N` interaction with literal `-N`-shaped headings and the no-trim cases (which use `&#x20;` entities to force a literal space past the markdown parser) | HIGH |
| `github-slugger` README | https://github.com/Flet/github-slugger | *"This project is not a markdown or HTML parser: passing `alpha *bravo* charlie` … doesn't work. Instead pass the plain text value of the heading."* Goal is to *"emulate the way GitHub handles generating markdown heading anchors as close as possible"* — no ongoing-sync claim | HIGH |
| CommonMark spec 0.31.2 | https://spec.commonmark.org/0.31.2/ | Fenced-code-block and ATX/setext/indented-code rules, quoted below | HIGH |
| CommonMark discussion — auto-generated heading ids | https://talk.commonmark.org/t/feature-request-automatically-generated-ids-for-headers/115 | Anchor generation is deliberately outside the specification; every platform's rule is its own | MEDIUM |
| eslint/eslint#16067 | https://github.com/eslint/eslint/pull/16067 | A second project hitting the same double-hyphen behaviour when adopting `github-slugger` — independent corroboration that `plan--prepare` is real GitHub behaviour, not a quirk of our guard | MEDIUM |

### Version/Compatibility Notes

| Dependency | Current Version | Notes |
|------------|-----------------|-------|
| `github-slugger` | 2.0.0 (published 2022-10-27) | Latest. **Not** being adopted (out of scope) — read as the reference specification. Older than the ~2-year staleness threshold, but for a package whose only job is emulating a fixed external behaviour, three-plus years without change is evidence of *stability*, not staleness. 2.0.0's breaking changes were ESM-only + added types, not semantics |
| CommonMark spec | 0.31.2 (2024-01-28) | Current. |
| Unicode data | `github-slugger` pins `@unicode/unicode-13.0.0` | A `\p{…}`-based reimplementation follows the JS engine's Unicode version (Node ≥20 ≈ 15.x) instead. Divergence is confined to code points assigned after Unicode 13.0 — see [RC-3](#open-research-candidates) |

## Finding 1 — GitHub heading-anchor slug semantics, pinned exactly

### 1a. The transform

```js
// github-slugger index.js — the stateless half
export function slug (value, maintainCase) {
  if (typeof value !== 'string') return ''
  if (!maintainCase) value = value.toLowerCase()
  return value.replace(regex, '').replace(/ /g, '-')
}
```

Three properties matter and all three are counter-intuitive:

1. **No `trim()`.** Leading/trailing space survives into the slug. Fixtures: `" a"` → `-a`,
   `"a "` → `a-`, `" a "` → `-a-`. The fixtures need `markdownOverwrite: "# &#x20;a"` to produce these
   at all, because CommonMark's ATX rule already strips the raw heading's outer whitespace. So the
   `.trim()` in both of our implementations is **correct and load-bearing** — it stands in for
   CommonMark's *"raw contents of the heading are stripped of leading and trailing space or tabs"*.
   The consequence is architectural: **trimming belongs to heading-text extraction, not to the slug
   function.** A shared slugger seeded from the guard must split into `slug(renderedText)` (no trim)
   and a heading-text extractor (which trims). Merging them re-creates the bug in a new place.
2. **Only U+0020 becomes a hyphen**, one hyphen per space, via `/ /g` — no run collapsing. This is
   the guard's already-documented `plan--prepare` behaviour and it is correct
   (`"I ♥ unicode"` → `i--unicode`). The runtime's `/\s+/g` is the live defect.
3. **Every other whitespace character is deleted, not hyphenated** — see 1b. Neither of our
   implementations does this; this is a *new* finding and the third distinct answer for tabs.

### 1b. The exact strip rule

`regex.js` is a generated character class, but its generator states the rule directly. Strip every
code point in these Unicode 13.0 **General Categories**:

`Other_Number` · `Close_Punctuation` · `Final_Punctuation` · `Initial_Punctuation` ·
`Open_Punctuation` · `Other_Punctuation` · `Dash_Punctuation` · `Symbol` (all) · `Control` ·
`Private_Use` · `Format` · `Unassigned` · `Separator` (all)

then **re-add** (i.e. keep) every code point with the `Alphabetic` binary property, plus `' '`
(U+0020) and `'-'` (U+002D).

Everything in a category *not* on that list is kept — which is what preserves `Letter`, `Mark`,
`Decimal_Number`, `Letter_Number`, and `Connector_Punctuation` (this last is why `_` survives:
`"heading with an _ underscore"` → `heading-with-an-_-underscore`).

Complete divergence table against our `[^\w\s-]` (JS `\w` is ASCII-only; there is no `/u` flag):

| Character class | `github-slugger` | our `[^\w\s-]` | Agree? |
|---|---|---|---|
| `a-z A-Z 0-9` | keep | keep | yes |
| `_` (Pc) | keep | keep (`\w`) | yes |
| `-` (U+002D) | keep (explicit carve-out) | keep (explicit) | yes |
| space (U+0020) | keep → `-` | keep → `-` | yes |
| ASCII punctuation & symbols (`. : / ( ) [ ] , & + = { } ' ? ; * # \``) | strip | strip | yes |
| non-ASCII punctuation & symbols (`—` `–` `→` `§` `♥`, emoji) | strip | strip | yes |
| **tab, LF, CR, FF, VT (Cc)** | **strip** | keep — then guard leaves it verbatim, runtime turns it into `-` | **no — three-way split** |
| **NBSP and other `Zs`/`Zl`/`Zp`** | **strip** | keep (JS `\s` includes them) | **no** |
| **non-ASCII Alphabetic (é, Cyrillic, Han), non-ASCII `Nd`, `Nl`, `Mark`** | **keep** | **strip** | **no** |

That table is *closed*: the divergence is exactly (i) whitespace other than U+0020 and (ii) non-ASCII
letters/digits/marks. Nothing else differs.

**Corpus census — all 6,315 rendered headings across 728 files.** The complete set of
non-alphanumeric characters present is 26 code points: `space _ - . : ( ) / — \` [ ] , & + = § { } → – ' ? ; * #`.
Zero tabs. Zero NBSP. Zero non-ASCII letters, digits or marks. **Therefore `[^\w\s-]` and
`github-slugger`'s generated class produce identical output for every heading in the corpus today** —
the entire divergence is prospective, exactly like the 75-heading whitespace gap. Which is the
justification pattern this package already runs on: prevent the next occurrence.

**Dependency-free equivalent.** Because the rule is category-based, one modern-JS regex reproduces it:

```ts
// Keep letters/marks/digits/`_`, plus space and `-`; strip everything else, per
// github-slugger's General-Category remove-list (Alphabetic, ' ' and '-' re-added).
const STRIP = /[^\p{Alphabetic}\p{M}\p{Nd}\p{Pc} -]/gu;
```

Unicode property escapes need no dependency and, under `/u`, match whole code points — so an
astral-plane emoji is stripped as one unit rather than needing `github-slugger`'s surrogate carve-out.
This makes the Unicode half of [D-5](deferred-items.md) a **one-line fix rather than an accepted
limitation** — see [RC-2](#open-research-candidates).

### 1c. The `-N` duplicate counter, exactly

```js
// github-slugger index.js — the stateful half
slug (value, maintainCase) {
  let result = slug(value, maintainCase === true)
  const originalSlug = result
  while (own.call(this.occurrences, result)) {
    this.occurrences[originalSlug]++
    result = originalSlug + '-' + this.occurrences[originalSlug]
  }
  this.occurrences[result] = 0
  return result
}
reset () { this.occurrences = Object.create(null) }
```

| Question DP-8 asked | Answer |
|---|---|
| Scope of the counter | One slugger instance per rendered document, cleared by `reset()`. Per **file**, in our terms — and the file must be the *same text* on both surfaces (see Finding 3c) |
| Casing | The whole value is lowercased **before** stripping, so the counter operates on lowercased slugs: `## Foo` then `## foo` collide, and the second gets `foo-1` |
| Numbering base | Second occurrence is `-1`, third `-2`. The first occurrence keeps the bare slug — which is precisely why a bare `#slug` *legally* denotes the first of N and why [RE-1](02-assumptions-log.md) rejected a resolver throw |
| Which counter increments | The counter for the **derived base slug**, not for the taken variant. Two different heading texts sharing a base slug advance the *same* counter |
| Interaction with pre-existing `-N` suffixes | The `while` loop **skips already-taken slugs**, re-incrementing the base counter each pass until a free slug is found |
| Prototype safety | `Object.create(null)` + `hasOwnProperty.call` — a heading `__proto__` is handled (`__proto__`, then `__proto__-1`) |

The fixture table pins the interaction case exactly, and it is the case a naive counter gets wrong:

| # | Heading text | `github-slugger` result | Why |
|---|---|---|---|
| 1 | `echo` | `echo` | free |
| 2 | `echo` | `echo-1` | `echo` taken → counter[`echo`]=1 |
| 3 | `echo 1` | `echo-1-1` | base `echo-1` is **taken** → counter[`echo-1`]=1 → `echo-1-1` |
| 4 | `echo-1` | `echo-1-2` | base `echo-1` still taken; counter[`echo-1`] resumes at 1 → 2 |
| 5 | `echo` | `echo-2` | counter[`echo`] 1 → 2 |

**Our guard's dedupe does not implement the skip loop** and is therefore not GitHub-faithful:

```ts
// scripts/check-resource-anchors.ts:61-63 — the seed for the shared slugger
const n = counts.get(base) ?? 0;
counts.set(base, n + 1);
anchors.add(n === 0 ? base : `${base}-${n}`);
```

On the sequence above it yields `{echo, echo-1, echo-1-1, echo-2}` — **missing `echo-1-2`**, so a
GitHub-correct link to heading 4 is reported `missing-anchor` (a false red). Measured corpus
occurrence: **0 files** diverge today. But the seed is about to become the *runtime resolver*, so an
unfaithful counter becomes a resolution bug in exactly the class SC-1 exists to close. **Fix in the
seed; pin with the five-row fixture table above.**

### 1d. What `github-slugger` is NOT, and what that costs us

The README is explicit: *"This project is not a markdown or HTML parser … pass the plain text value
of the heading."* So `github-slugger` is faithful *given rendered text*; the inline-markdown half of
[D-5](deferred-items.md) is a defect in the **input**, not the slugger. Which inline constructs
actually make rendered text differ from raw text?

| Construct | Rendered vs raw | Slug divergence? | Corpus count |
|---|---|---|---|
| Emphasis `*x*` `**x**` `_x_` | delimiters vanish | **No** — they are stripped and leave no space, so raw and rendered slug identically | — |
| Code span `` `x` `` | backticks vanish | **No** — same reason | — |
| Link / image `[t](u)` | `t` only | **Yes** — the URL's word characters leak into the slug | **23** |
| Raw HTML `<em>x</em>` | tag vanishes | Yes in principle | **0** |
| Character entity `&amp;` | becomes `&` | Yes in principle | **0** |
| Autolink `<https://x>` | becomes the URL text | Yes in principle | **0** |

So the limitation is narrower and more specific than "inline markdown": it is **links and images in
headings, and nothing else**. All 23 sit in `README.md`-style tables of contents
(`work-packages/README.md` ×7, `substrate-node-security-audit/README.md` ×10,
`prism-update/activities/README.md` ×5, root `README.md` ×1) — **zero in `resources/`**, and **zero
live referencers of either slug form**. Representative case:

```
## 1. [Scope Setup](./activities/01-scope-setup.yaml)
  our slug     : 1-scope-setupactivities01-scope-setupyaml
  GitHub slug  : 1-scope-setup
```

Two corrections to the record follow. First, [SC-8](03-requirements-elicitation.md#success-criteria)
says both D-5 gaps are "zero-occurrence in resource files today" — true, but the **guard scans all
728 files**, and there the count is 23, not 0. Second, the direction of harm is Defect 1 inverted: the
guard *approves* a link written in our mangled form (which will not navigate on github.com) and
*rejects* a GitHub-correct one. A one-line pre-reduction closes it for the only construct that occurs:

```ts
// GitHub slugs the rendered heading text; reduce inline links/images to their text first.
const rendered = (t: string) => t.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
```

See [RC-2](#open-research-candidates) — this is a scope question, not a research question.

### 1e. Heading recognition — where our regexes stop short of CommonMark

Both implementations match `^#{1,6}\s+…` at column 0. CommonMark 0.31.2, verbatim:

- *"An ATX heading consists of a string of characters, parsed as inline content, between an opening sequence of 1–6 unescaped `#` characters"*
- *"The opening sequence of `#` characters must be followed by spaces or tabs, or by the end of line."*
- *"The opening `#` character may be preceded by up to three spaces of indentation."*
- *"The raw contents of the heading are stripped of leading and trailing space or tabs before being parsed as inline content."*
- *"The optional closing sequence of `#`s must be preceded by spaces or tabs and may be followed by spaces or tabs only."*
- *"ATX headings can be empty"*; *"they can interrupt paragraphs."*
- Setext: *"a sequence of `=` characters or a sequence of `-` characters, with no more than 3 spaces of indentation"* → level 1 and level 2 respectively.
- Indented code: *"a sequence of non-blank lines, each preceded by four or more spaces of indentation"*; *"cannot interrupt a paragraph."*

| CommonMark case | GitHub anchor? | Our two impls | Corpus count |
|---|---|---|---|
| `   ### Foo` (1–3 spaces indent) | yes | **missed** (both anchor at column 0) | **0** |
| `    ## Foo` (4+ spaces → indented code) | no | correctly none | **0** |
| `## Foo ##` (ATX closing sequence) | `foo` | **`foo-`** — the trailing `#`s are stripped but their preceding space becomes a hyphen | **0** |
| `##` / `## ` (empty heading) | yes, empty slug | missed; an empty slug is unlinkable anyway | **0** |
| `#Foo` (no space) | not a heading | correctly rejected | **0** |
| `## A<TAB>B` | `ab` | guard `a<TAB>b`, runtime `a-b` | **0** |
| Setext `Foo` + `===` | yes | **missed entirely** | **0** (see below) |
| `> ## Foo` (blockquote) | yes | missed | **0** |
| `- ## Foo` (list item) | yes | missed | **0** |

Every heading-recognition divergence is **latent at zero occurrences**. Two notes worth carrying:

- **Do not add setext detection casually.** A naive setext probe reports **664** hits corpus-wide —
  and every one is a YAML frontmatter closing `---` immediately after a `key: value` line. After
  excluding frontmatter, real setext headings number **0**. GitHub does not render frontmatter as
  markdown content, so today's total blindness to setext is accidentally correct; a setext-aware
  collector that skipped frontmatter-stripping would invent 664 phantom anchors.
- The guard's *fence* regex allows arbitrary leading whitespace (`^\s*(```|~~~)`) while its *heading*
  regex allows none. That asymmetry is backwards relative to CommonMark, which bounds both at three
  spaces.

## Finding 2 — CommonMark closing-fence rules, and the tracker they specify

### 2a. The rules, verbatim (spec 0.31.2 §4.5)

- *"A code fence is a sequence of at least three consecutive backtick characters (`` ` ``) or tildes (`~`). (Tildes and backticks cannot be mixed.)"*
- *"A fenced code block begins with a code fence, preceded by up to three spaces of indentation."*
- *"The line with the opening code fence may optionally contain some text following the code fence; this is trimmed of leading and trailing spaces or tabs and called the info string. If the info string comes after a backtick fence, it may not contain any backtick characters."*
- *"Info strings for tilde code blocks can contain backticks and tildes."*
- *"The content of the code block consists of all subsequent lines, until a closing code fence of the same type as the code block began with (backticks or tildes), and with at least as many backticks or tildes as the opening code fence."*
- *"The closing code fence may be preceded by up to three spaces of indentation, and may be followed only by spaces or tabs, which are ignored."*
- *"If the end of the containing block (or document) is reached and no closing code fence has been found, the code block contains all of the lines after the opening code fence until the end of the containing block (or document)."*
- *"A fenced code block may interrupt a paragraph, and does not require a blank line either before or after."*
- *"If the leading code fence is preceded by N spaces of indentation, then up to N spaces of indentation are removed from each line of the content (if present)."*
- On tabs: *"Tabs in lines are not expanded to spaces. However, in contexts where spaces help to define block structure, tabs behave as if they were replaced by spaces with a tab stop of 4 characters."*

### 2b. The five errors in `/^\s*(```|~~~)/` + boolean toggle

The naive toggle appears three times (`resource-ref.ts:37`, `check-resource-anchors.ts:56`, and again
in the guard's link scanner at `:90`). Against the rules above it is wrong in five ways:

1. **Ignores the fence character** — a ``` line "closes" a `~~~` block and vice versa. This is the
   corpus's `~~~~markdown`-wrapping-``` idiom.
2. **Ignores fence length** — a 3-char run "closes" a 4-char opener.
3. **Ignores the info string on a candidate closer** — a ```` ```json ```` line inside a
   ```` ``` ````-opened block is *content*, but the toggle treats it as a closer and inverts for the
   rest of the file. **This is the dominant real-world error**; it is what produces every divergent
   file measured below.
4. **Unbounded indentation** — `^\s*` admits 4+ spaces and tabs, where CommonMark bounds both fences
   at three spaces of indentation.
5. **Never validates the opener's info string** — a backtick fence whose info string contains a
   backtick is not a fence at all.

Errors 1–3 all present as *desynchronisation*: after a spurious toggle the file's inside/outside
polarity is inverted until the next spurious toggle re-inverts it.

### 2c. Tracker specification

```
state: openChar ∈ {'`','~',null}, openLen: int

for each line:
  if openChar === null:
      m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
      if m and not (m[1][0] === '`' and m[2].includes('`')):
          openChar = m[1][0]; openLen = m[1].length
          → FENCE LINE: never a heading; continue
      → OUTSIDE: test this line for a heading
  else:
      m = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line)      // closer: no info string
      if m and m[1][0] === openChar and m[1].length >= openLen:
          openChar = null
      → INSIDE (fence lines included): never a heading; continue

end of input: an unclosed fence swallows the remainder of the document
```

Two deliberate simplifications, both to be recorded rather than silently owned:

- **No container-block awareness.** CommonMark measures fence indentation relative to the enclosing
  blockquote or list item, so a fence legally nested four-plus columns inside a list item is not
  recognised by a column-0 tracker. Bounded by measurement: 0 corpus headings sit at 4+ indentation
  and the naive-vs-correct diff is 4 files / +1 link, so nothing in the corpus depends on it.
- **Tab indentation is not expanded to a 4-column tab stop.** `^ {0,3}` reads a leading tab as zero
  indentation where CommonMark reads four. Zero occurrences.

### 2d. Measured exposure — a first cut at SC-9

Guard-equivalent probe run twice over all 728 files, changing **only** the fence tracker (applied to
both the anchor collector and the link scanner, which is what "hardening" means):

| Fence tracker | Broken links reported |
|---|---|
| naive toggle (today) | **3** — exactly the known red baseline, validating the probe |
| CommonMark-correct | **4** |

**Newly exposed: exactly 1 link.**

```
+ [missing-file] work-package/resources/architecture-summary.md
                 -> work-package-plan.md#dependencies--risks
```

That is [D-2](deferred-items.md) — the already-known, already-deferred hidden 4th break. Nothing else
appears, and **nothing stops being broken** (`0` links move the other way).

Two further measurements make the decision safe rather than merely cheap:

- **Files whose fence windows differ at all: 4** — `cicd-audit-report-template.md`,
  `architecture-summary.md`, `scope-manifest.md` (resources), and `prism/README.md`. All four are
  info-string-on-a-candidate-closer desyncs (error 3).
- **Anchor-table effect is purely additive in all 3 affected files.** The correct tracker *reveals*
  headings the naive toggle wrongly believed were fenced (e.g. `architecture-summary.md` gains
  `what-changed`, `risks--mitigations`, `key-flows`, …). In no file does an anchor **disappear**, and
  in no file does an existing anchor **move to a different heading** — so **the fence fix re-points
  zero `-N` anchors.**

That last result matters more than its size. `-N` addressing and fence handling are coupled in
principle — a heading wrongly counted as rendered advances the duplicate counter and shifts every
later `-N` in that file — so fence hardening could in principle have invalidated the seven `-1`
repoints [RE-3](02-assumptions-log.md) depends on. Measured: it does not.
[RE-5](02-assumptions-log.md)'s "nothing else in scope depends on the outcome" is now **measured
rather than assumed**, and SC-9's exposure count is 1, already registered as D-2.

## Finding 3 — three corrections and confirmations to the elicitation record

### 3a. The `ambiguous-anchor` count is 7 corpus-wide, not 7-in-resources

Comprehension measured duplicate slugs in `resources/` only (10 slugs, 4 files). The guard scans
everything, so the new reason's true blast radius had to be measured corpus-wide.
**42 of 728 files carry at least one duplicated base slug** — the four known resource files plus 38
technique files, where the pattern is systemic in a different way: `#### variable_name` headings
repeat because the same variable appears under both Inputs and Outputs (`convergence_flag`,
`residue_flag`, `artifact`, `default`, `assumptions_log`, …).

Of **537** in-corpus anchor links, the number whose bare anchor names a duplicated base slug — i.e.
the number the new reason turns red — is **exactly 7**, and **all 7 target `resources/*.md`**. They are
precisely RE-3's seven `prism-evaluate` refs; **zero** additional links hit a duplicate anywhere in
the other 38 files. RE-3's count is confirmed corpus-wide, and the merge gate does not widen.

The precise predicate matters, because the obvious one is wrong. "Anchor `A` is ambiguous iff the
anchor table contains both `A` and `A-1`" produces false positives: a file with headings `Echo` and
`Echo 1` legitimately yields `{echo, echo-1}` with no ambiguity at all. The correct predicate is
over **base** slugs: *ambiguous iff two or more headings share base slug `A`*. That requires the
anchor table to carry each heading's `baseSlug` alongside its final `slug`.

### 3b. DP-11's untested half — `-N` stability — can now be closed

The [assumptions log](02-assumptions-log.md) wrap-up left DP-11 open on one point: *"the claim that
paths buy stability over positional `-N` anchors is argued, not measured — no test of what an inserted
heading does to existing `-N` refs."* The pinned algorithm answers it exactly rather than
approximately:

An existing `#base-N` ref re-points **only** when a heading whose base slug is *also* `base` is
inserted above it. Inserting any other heading — at any level, anywhere in the file — leaves every
`-N` untouched, because each base slug has its own independent counter. So `-N` anchors are not
"positionally fragile" in general; they are fragile against **same-title insertion above**, which is a
much narrower hazard than the Defect 2 framing implies.

Applied to the seven repoints: the base slug in each of the three `prism-evaluate` templates is the
document's own title, and the hazard is "someone inserts a *third* heading with the identical title
above line 17". Corroborating measurement: the fence-tracker change — a realistic perturbation that
alters which headings count as rendered in three files — re-points **zero** `-N` anchors. Treat DP-11
as resolved: the stability argument for hierarchy is real but small, and it does not threaten this
package's `-1` repoints.

### 3c. The frontmatter asymmetry is inert, but should stop being inert *by luck*

The guard reads the raw file; the runtime reads the frontmatter-stripped, trimmed body. With `-N`
addressing live, a single heading-shaped line inside frontmatter would shift every subsequent `-N` in
that file on one surface only. Measured: **0** heading-shaped lines inside frontmatter across all 728
files, so the two anchor tables are identical today. Recommendation: build the table from one
normalised text — either the shared module strips frontmatter itself, or the guard strips it too
(which also matches GitHub, since GitHub does not render frontmatter as markdown content). Body
`.trim()` is harmless: it removes leading blank lines only and cannot reorder headings.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| **Separate the slug function from heading-text extraction** | `github-slugger` `index.js` (no `trim`) + CommonMark ATX content rule | The shared module exposes `slug(renderedText)` with no trim, plus a CommonMark-correct extractor that trims and drops the optional closing `#` sequence. Merging them, as both current implementations do, is what makes `## Foo ##` slug as `foo-` | HIGH |
| **One anchor table per file, built once, consumed by both surfaces** | `github-slugger`'s stateful `Slugger` | `-N` addressing is not expressible as a per-heading slug comparison — it needs the file's ordered table. Export `buildAnchorTable(text) → Array<{slug, baseSlug, level, lineIndex}>`. This is the single change that serves every criterion at once: the guard's anchor set (SC-1), the runtime's `-N` resolution (SC-1), the section window (SC-5), and `ambiguous-anchor` via `baseSlug` (SC-4) | HIGH |
| **Collapse the resolver's two scans into one** | `resource-ref.ts:42-51` and `:55-63` | `extractMarkdownSection` currently tracks fences twice in two loops that can desync independently. With an anchor table carrying `lineIndex` and `level`, resolution becomes table lookup + window computation, removing two of the codebase's four heading parsers | HIGH |
| **Unicode property escapes instead of a dependency** | `script/generate-regex.js` | The strip rule is category-based, so `/[^\p{Alphabetic}\p{M}\p{Nd}\p{Pc} -]/gu` reproduces it in one line with zero dependencies — full GitHub fidelity while honouring the offline-sandbox constraint | HIGH |
| **Differential check as the oracle, replacing duplicated code** | comprehension [design rationale](../../comprehension/resource-section-addressing.md); the guard's own "imports nothing from `src/`" stance | Sharing the slugger removes the independent oracle *at the slug level*, but the differential check is not thereby tautological: the two paths still differ in input normalisation (frontmatter/trim), file resolution, and window computation, which is exactly where 3c's latent split lives. State this, or SC-3 reads as a no-op | HIGH |
| **Fixture-table pinning against an external specification** | `test/fixtures.json` | Pin our slugger with `github-slugger`'s own GitHub-validated pairs — especially the five-row `echo` sequence, which is the only thing that catches the missing skip loop — rather than with hand-written cases that would encode our current behaviour | HIGH |
| **Guard stricter than resolver, never more permissive** | comprehension Q10 resolution | `ambiguous-anchor` is a guard-only rule; the resolver stays faithful to GitHub. Directional strictness is the safe orientation and the inverse of today's defect | HIGH |
| **Measure before hardening** | RE-5 / SC-9 | The count is 1, and it is D-2. Generalises: for a guard change over a corpus, diff the guard's *verdict set* before/after, not the count of newly-scanned inputs | MEDIUM |

## Best Practices Found

### Pin against the reference implementation's own fixtures, not hand-written cases
**Source:** https://github.com/Flet/github-slugger/blob/master/test/fixtures.json
**Description:** The fixtures carry `markdownOverwrite` fields precisely because some expectations
(a literal leading space) cannot be produced by ordinary markdown — evidence they were validated
against real GitHub rendering rather than derived from the code.
**Application:** SC-1/SC-7 test cases should be lifted from this table. The five-row `echo` sequence
is the highest-value import: it is the only case that distinguishes a correct skip loop from our
guard's counter, and no hand-written test would have thought to write it.

### Treat the absence of a normative specification as a first-class risk
**Source:** https://talk.commonmark.org/t/feature-request-automatically-generated-ids-for-headers/115
**Description:** Neither CommonMark nor GFM specifies heading-anchor generation; it is a rendering
extension. `github-slugger`'s own goal statement is *"as close as possible"* with no ongoing-sync
guarantee.
**Application:** SC-8's framing is right for a reason stronger than the one recorded. We are not
merely accepting *our* divergences from `github-slugger` — we are adopting a *de-facto* spec that has
no authority behind it. The mitigation is the corpus census (a closed 26-character set with zero
occurrences in every divergent class), not fidelity claims.

### Diff the verdict set, not the input set, when strengthening a guard
**Source:** derived from the SC-9 measurement in this document
**Description:** Hardening a corpus guard changes what it *sees* in both directions at once: some
inputs become visible, some previously-counted headings stop counting. Counting newly-scanned inputs
answers the wrong question.
**Application:** SC-9's authoritative count should be produced as `collectBrokenAnchors()` before
vs after, diffed both ways. This probe's answer is +1/−0; the real guard should confirm it.

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| Seeding the shared slugger from the guard verbatim inherits the **non-GitHub-faithful `-N` counter** (no skip loop) — and promotes it from a guard-only false red into a runtime resolution bug | `check-resource-anchors.ts:61-63` vs `github-slugger` `index.js` | Implement the skip loop; pin with the five-row `echo` fixture sequence. 0 corpus occurrences today, so this is prevention, exactly as with the 75-heading gap |
| Keeping `.trim()` **inside** the slug function reproduces `## Foo ##` → `foo-` and makes the module untestable against `github-slugger`'s no-trim fixtures | `github-slugger` `index.js`; CommonMark ATX content rule | Split `slug()` (no trim) from heading-text extraction (trims, drops the closing `#` sequence) |
| Implementing `ambiguous-anchor` as "table holds both `A` and `A-1`" — false-positives on a file with headings `Echo` and `Echo 1` | Fixture rows 2–4 | Test over **base** slugs: ambiguous iff ≥2 headings share base slug `A`. Requires `baseSlug` in the anchor table |
| Adding setext-heading support without stripping frontmatter first would invent **664** phantom anchors | Probe (a): 664 naive hits, 0 after excluding frontmatter | Do not add setext detection; 0 real occurrences. If ever added, strip frontmatter first |
| Building the guard's and runtime's anchor tables from **different text** (raw file vs frontmatter-stripped body) silently shifts `-N` on one surface only | Finding 3c | Normalise the input in the shared module; 0 occurrences today, so this is cheap now and expensive later |
| Presenting SC-3's differential check as proving agreement when a shared slugger makes the slug half tautological | comprehension design rationale | Scope the claim: the check covers input normalisation, file resolution and window computation — the surfaces that still differ |
| Assuming fence hardening is independent of the 7 `-1` repoints | Finding 2d | Measured independent on this corpus (0 anchors re-pointed). Re-check if the corpus moves, because the coupling is real in principle |
| **[In Scope](03-requirements-elicitation.md#in-scope) items 1 and 2 contradicted each other** — item 2's "the guard retains its own slug and `-N` counting pass" against item 1 and SC-1's "exactly one slug implementation… grep returns one definition". A plan following item 2 literally would fail SC-1's own check | Challenge pass, rejected-paths lens; [RS-12](02-assumptions-log.md) | Resolved against the user's D2 decision (option (a) + the differential half of (b)) and comprehension's "the oracle lives in the test, not in duplicated code". Item 2 reworded: the guard retains its **corpus-scanning pass**, not a duplicate slugger |
| Shipping a slug-semantics change without updating the published resolution contract, which every agent consumes | Challenge pass, stakeholder-gap lens; [RS-11](02-assumptions-log.md) | `docs/resource_resolution_model.md:141` calls `#section` "a GitHub-style heading slug" — currently false for the runtime, true afterwards — and **nothing documents that `-N` suffixes are addressable**, which is a new agent-facing capability. A doc update is owed. Verified separately that no referencer of the 23 divergent anchors exists in `docs/`, `src/`, `tests/` or `scripts/`, so items 10–11 break nothing outside the corpus |
| `github-slugger` pins Unicode 13.0; `\p{…}` escapes follow the engine's version | `script/generate-regex.js` | Note it; divergence is confined to post-Unicode-13 assignments, and there is no authority to prefer either. Zero corpus exposure |

## Recommended Approach

1. **Primary pattern: one shared module exporting `slug()` + `buildAnchorTable()`.**
   - Rationale: `-N` addressing is a whole-file property, so the shareable unit is the *anchor table*,
     not the slug function. One table serves the guard's anchor set, the runtime's `-N` resolution,
     the section window, and `ambiguous-anchor`'s base-slug predicate — and it removes two of the
     four heading parsers plus one of the three naive fence toggles.
   - Shape: `slug(renderedText)` (no trim, category-based strip regex, `/ /g`), a CommonMark-correct
     ATX extractor (0–3 spaces indent, `#`s then space/tab or EOL, content trimmed, optional closing
     `#` sequence dropped), the CommonMark fence tracker from §2c, and `github-slugger`'s exact
     stateful counter including the skip loop.

2. **Key practices to apply:**
   - Lift the SC-1/SC-7 fixtures from `github-slugger`'s `test/fixtures.json`, the five-row `echo`
     sequence above all.
   - Give the anchor table entries `{slug, baseSlug, level, lineIndex}`; derive `ambiguous-anchor`
     from `baseSlug` multiplicity.
   - Normalise frontmatter identically on both surfaces so the two tables agree by construction.
   - State SC-3's differential scope explicitly in the guard's header comment, where the
     "imports nothing from `src/`" rationale currently lives.

3. **Risks to monitor:**
   - The seeded `-N` counter (missing skip loop) — the one place where "seed from the guard" imports
     a defect.
   - `.trim()` placement — the difference between a testable module and one that cannot match the
     reference fixtures.
   - Fence/`-N` coupling — measured benign here, real in principle.
   - `-N` addressability is a new agent-facing capability and is undocumented; the published
     `#section` contract needs the update ([RS-11](02-assumptions-log.md)).

## Assumptions

Assumptions surfaced during research: [assumptions log](02-assumptions-log.md) rows RS-1..RS-12
(categories: Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment, plus
Implicit Requirements and Requirement Interpretation for the two raised by the challenge pass) —
recorded there, not here. None remain open: eleven were closed by code or corpus evidence and one
(RS-2) by user decision at the research-convergence gate.

## Open Research Candidates

One row per open research gap, updated in place across passes. Statuses: Reconcilable · Resolved ·
Partially Resolved · Irreconcilable, per the `work-package` workflow's `research-reconciliation`
resource (§ Integration with Research Artifact).

| ID | Candidate | Status | Resolution | Outcome |
|----|-----------|--------|------------|---------|
| RC-1 | The knowledge base may hold guidance on differential testing / specification-drift patterns relevant to SC-1 and SC-3 | Resolved | Three `broad_chunks_search` probes (differential testing and test oracles; single-source-of-truth and specification drift; markdown-parser conformance and identifier normalization) returned only general SE/ISO-process material at 0.20–0.34 with no topical match | Resolved — the library has no relevant content; findings rest on primary web sources and corpus measurement |
| RC-2 | Both halves of [D-5](deferred-items.md) turn out to be one-line fixes (`\p{…}` strip class; inline link/image reduction) with measured exposure of 0 live / 23 latent. Should they still be accepted limitations under SC-8, or closed? | **Resolved** | Escalated to the user at the research-convergence gate and **settled: both halves come into scope.** Rationale the user acted on: they are one-line fixes, and since the `github-slugger` dependency was rejected the project owns GitHub-slug fidelity permanently, so closing the gap now costs less than owning a known divergence. Evidence that decided it: 0 non-ASCII letters and 0 tabs across 6,315 headings; 23 link-in-heading divergences, all in non-resource READMEs, 0 live referencers of either slug form | Resolved — [D-5](deferred-items.md) reversed; [In Scope](03-requirements-elicitation.md#in-scope) items 10–12 and [SC-11](03-requirements-elicitation.md#success-criteria) added; SC-8 narrowed to the two unresolvable residuals and its occurrence framing corrected |
| RC-3 | Does GitHub's own renderer delete a tab in heading text (as `github-slugger` does via `Control`), and does it track Unicode past 13.0? | Irreconcilable (out-of-scope) | `github-slugger`'s behaviour is definitive from its generator; GitHub's is not, because **no normative GitHub or GFM specification of anchor generation exists** and the package's fixtures contain no tab case. Corpus occurrence: 0 tabs, 0 non-ASCII letters | Irreconcilable (out-of-scope) — follow `github-slugger` as the de-facto spec and record it under SC-8 |
| RC-4 | SC-9's authoritative newly-exposed-link count | Partially Resolved | First cut produced here: **+1 / −0**, the newly exposed link being D-2. The probe reproduces the guard's current 3-red baseline exactly, but it is a reimplementation, not `collectBrokenAnchors()` | Partially Resolved — hand to implementation-analysis (SC-9's assigned owner) to confirm with the real guard, both directions |
| RC-5 | Is the column-0 fence tracker (no container-block-relative indentation, no tab-stop expansion) acceptable, and how is it tested when the corpus offers no failing case? | Irreconcilable (code-analysis) | The CommonMark rule is pinned (§2a) and the simplification's corpus exposure is bounded (0 headings at 4+ indent; 4 files differing; +1 link). Whether to accept the simplification and how to fixture it is a design/test decision | Irreconcilable (code-analysis) — for implementation-analysis and the plan's test strategy |

**RC-3: GitHub's tab and Unicode-version behaviour**
**Why research cannot resolve it:** there is no normative specification to consult — CommonMark and GFM both leave anchor generation out — and the reference package's fixtures do not cover the case.
**Handoff target:** out-of-scope — recorded under SC-8 with its zero-occurrence measurement.

**RC-5: fence-tracker simplification bounds**
**Why research cannot resolve it:** the specification is pinned; the open part is whether to accept a bounded deviation and how to fixture it with no failing corpus case.
**Handoff target:** code-analysis — implementation-analysis and the plan's test strategy.

## Alignment with KB Research

No knowledge-base findings existed to confirm or contradict (RC-1). Web findings were instead
cross-referenced against this package's own prior measurements:

| Prior finding | Web/measurement validation | Notes |
|------------|----------------|-------|
| Guard's `plan--prepare` double-hyphen is GitHub-correct (comprehension Q1) | **Confirmed** twice over | `github-slugger` fixture `"I ♥ unicode"` → `i--unicode`; independently corroborated by eslint/eslint#16067 |
| Runtime's `/\s+/g` run-collapse is the live defect | **Confirmed** | `github-slugger` uses `/ /g` |
| Bare `#slug` legally denotes the first of N ([RE-1](02-assumptions-log.md)) | **Confirmed** | First occurrence keeps the bare slug; `-1` starts at the second. The rejection of a resolver throw stands on the reference implementation, not on inference |
| D-5's two fidelity gaps | **Extended and corrected** | Unicode half is a one-line fix, not an inherent limitation. Inline-markdown half is specifically *links/images only* (raw HTML, entities, autolinks all 0) and its count is 23 corpus-wide, not 0 — SC-8's "zero-occurrence in resource files" is true but understates the guard-visible surface |
| Tab handling differs between guard and runtime (comprehension "two sluggers") | **Corrected** | Real `github-slugger` *deletes* tabs (`Control` category) — a third answer neither implementation gives. Latent: 0 corpus occurrences |
| Guard models GitHub `-N` dedupe faithfully | **Contradicted** | The guard omits `github-slugger`'s skip loop, so it under-generates anchors in files holding a literal `-N`-shaped slug. 0 corpus occurrences, but the guard is the seed for the runtime |
| RE-3: exactly 7 links become ambiguous | **Confirmed corpus-wide** | 42 files carry duplicate base slugs (38 of them technique files), yet only 7 links target one — all in `resources/`. The merge gate does not widen |
| RE-5 / SC-9: fence-hardening exposure unmeasured | **Measured** | +1 link (D-2), −0; anchor tables purely additive in 3 files; 0 `-N` anchors re-pointed, so RE-5's independence claim is now measured |
| DP-11's untested half: `-N` positional stability | **Resolved** | `-N` re-points only on same-base-slug insertion above the ref; unaffected by any other edit. Corroborated by the fence change re-pointing 0 |
| Comprehension Q4: fence exposure zero for resource files | **Refined** | 0 resource files differ in *heading sets*; 4 files (3 of them resources) differ in *fence windows*, and the corrected tracker only ever adds headings |

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| `github-slugger` `index.js` | The slug transform and the exact `-N` counter | `slug()`, `BananaSlug.slug()`, `reset()` |
| `github-slugger` `script/generate-regex.js` | The strip rule as Unicode categories — enables a dependency-free equivalent | category remove-list; `Alphabetic` / space / `-` re-adds |
| `github-slugger` `test/fixtures.json` | GitHub-validated expectations | `Repetition (1)`–`(5)`; `Characters: *`; `Non-ascii: *`; `Gemoji (1)`–`(4)` |
| `github-slugger` README | Input contract: rendered text, not markdown | "not a markdown or HTML parser"; non-Latin and emoji examples |
| CommonMark spec 0.31.2 | Fence and heading rules | §4.5 Fenced code blocks; §4.2 ATX headings; §4.3 Setext headings; §4.4 Indented code blocks; §2.2 Tabs |
| CommonMark discussion #115 | Anchor generation is out of scope for the spec | — |
| eslint/eslint#16067 | Independent corroboration of double-hyphen behaviour | — |
| `scripts/check-resource-anchors.ts` | The seed; its `slugify` and `collectAnchors` counter | `:42-48`, `:51-66`, `:78`, `:89-92` |
| `src/utils/resource-ref.ts` | The runtime resolver; two independent fence scans | `:33-65` |
| [comprehension artifact](../../comprehension/resource-section-addressing.md) | Prior measurements cross-referenced above | Two sluggers; Q1–Q4; Q10 resolution |

## Convergence Outcome

Research converged in one pass (no reconciliation iteration was warranted — no candidate was
reconcilable by further research). At the `research-convergence` gate the user selected
**accept-research** and settled RC-2 as a scope change:

- **[D-5](deferred-items.md) reversed — both fidelity halves come into scope.** Recorded as
  [In Scope](03-requirements-elicitation.md#in-scope) items 10–11 with
  [SC-11](03-requirements-elicitation.md#success-criteria) as the criterion, and SC-8 narrowed to the
  two residuals research proved unresolvable (post-Unicode-13 code points; GitHub's unvalidated tab
  behaviour). This closes 23 guard-visible divergences, 0 of them live in `resources/`.
- **The two seeding corrections carried into requirements** as In Scope item 12: the guard's `-N`
  counter must not be seeded verbatim (its missing skip loop would become a runtime resolution bug),
  and `.trim()` belongs in the heading-text extractor, not the slug function.
- **RC-4 stands as handed off.** The SC-9 first cut (+1 newly exposed / −0, the one link being
  already-deferred [D-2](deferred-items.md)) goes to implementation-analysis for confirmation against
  the real `collectBrokenAnchors()`, in both directions.
- **RC-3 and RC-5 remain irreconcilable** at their recorded handoff targets (out-of-scope and
  code-analysis respectively).

**Status:** Complete.
