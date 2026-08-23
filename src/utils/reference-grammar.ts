/**
 * The one reference grammar shared by the inline-reference guard and the delivery runtime.
 *
 * The module is deliberately narrower than either consumer wants: it fixes the counting terms and
 * partitions the link space into technique references, resource references and neither. It computes
 * no anchor slug — heading-anchor resolution stays with the resource layer, so the tree holds one
 * slug computation and one grammar rather than two of each.
 *
 * The partition keys on the destination's shape rather than on how the author spelled the path.
 * A destination naming a markdown file outside a `resources/` tree is a technique reference whether
 * or not it carries a leading `./`, so the same target cannot be a technique under one spelling and
 * a resource under another.
 */

/** A published counting term: the question it settles and the answer this grammar fixes. */
export interface GrammarTerm {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * The ten terms the guard publishes with its totals. A term left free admits two defensible
 * readings of the same file at any population size, so each is fixed here and pinned by its own
 * fixture — two of the ten describe overlapping forms, which a total cannot show.
 */
export const GRAMMAR_TERMS: readonly GrammarTerm[] = [
  {
    id: 'verb-list',
    question: 'Which invoking verbs mark a line as making a call?',
    answer:
      'Five verbs: `apply`, `via`, `use`, `follow`, `per`. They are the invoking forms the corpus writes — `apply` leads, `via` is the dominant connector where a caller derives a result from an operation, and `use` carries the rest. A word outside this list does not mark a call site, so a cross-reference verb such as `see` reads as a citation.',
  },
  {
    id: 'verb-case',
    question: 'Is the invoking verb matched case-sensitively?',
    answer: 'Case-insensitively, so a sentence-initial `Apply` counts as the verb.',
  },
  {
    id: 'verb-adjacency',
    question: 'How close to the link must the verb sit?',
    answer: 'Anywhere earlier on the same line, not necessarily adjacent to the link.',
  },
  {
    id: 'counting-unit',
    question: 'What is counted — a link occurrence or a call?',
    answer: 'A logical call site. Raw link occurrences are reported separately as an input to it.',
  },
  {
    id: 'container-target',
    question: 'Does a link whose destination is a group container count as a call site?',
    answer:
      'Only when it survives the qualified-pair collapse. A container link that forms the left half of a `group::op` pair is absorbed by the pair; a container link standing alone remains a call site.',
  },
  {
    id: 'section-scope',
    question: 'Which part of a technique file is scanned?',
    answer: 'The `## Protocol` section only, with fenced code blocks skipped.',
  },
  {
    id: 'anchoring',
    question: 'Does a link carrying a `#anchor` count as a call site?',
    answer:
      'No. An anchored link cites a named passage — a rule or a numbered step — rather than invoking the technique.',
  },
  {
    id: 'leading-dot',
    question: 'Must a technique-link destination begin with `./` or `../`?',
    answer:
      'No. The destination is classified by shape, so a dotless `op.md` is the same technique reference as `./op.md`. The dot is a spelling, not a term of the grammar.',
  },
  {
    id: 'qualified-pair',
    question: 'Does a qualified `group::op` citation written as two links count as one call or two?',
    answer:
      'One. The container link and the operation link name a single operation, so the pair collapses to one logical call site whose target is the operation.',
  },
  {
    id: 'unresolved-target',
    question: 'Does a call site whose destination resolves to no file count as a call site?',
    answer:
      'Yes. It is counted and reported as unresolved, and it is binned by the group its destination path names rather than being dropped from the census.',
  },
];

/**
 * The invoking verbs, per the `verb-list` term.
 *
 * Width is a published term rather than an implementation detail: it decides the guard's coverage as
 * well as its total. These five see 88% of the GitNexus cross-group call sites where `apply` alone
 * sees 30%, and widening past them buys 4 further points, so the list stops here.
 */
export const INVOKING_VERBS: readonly string[] = ['apply', 'via', 'use', 'follow', 'per'];

/** The section whose prose is scanned, per the `section-scope` term. */
export const SCANNED_SECTION = 'Protocol';

/** The container filename a group's shared contract lives in. */
export const CONTAINER_FILENAME = 'TECHNIQUE.md';

/** How a markdown link destination is classified within the reference grammar. */
export type LinkKind = 'technique' | 'technique-container' | 'resource' | 'neither';

/** A destination split into its path and anchor, with its kind. */
export interface ClassifiedLink {
  readonly kind: LinkKind;
  /** Destination with any `#anchor` removed. */
  readonly path: string;
  /** Anchor without the `#`, or undefined when the destination carries none. */
  readonly anchor: string | undefined;
}

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Classify a markdown link destination.
 *
 * Order matters. A destination under a `resources/` tree is a resource however it is spelled, so
 * that test comes first. Every remaining markdown-file destination is a technique reference — which
 * is what keeps a dotless `op.md` from being claimed as a resource id. An extensionless
 * destination is a resource id in already-projected text, where the loader has rewritten resource
 * links to bare or workflow-qualified slugs.
 */
export function classifyLink(destination: string): ClassifiedLink {
  const raw = destination.trim();
  const hashIdx = raw.indexOf('#');
  const anchor = hashIdx >= 0 ? raw.slice(hashIdx + 1) || undefined : undefined;
  const path = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;

  if (path === '' || raw.startsWith('#') || EXTERNAL.test(path)) {
    return { kind: 'neither', path, anchor };
  }

  const segments = path.split('/');
  if (segments.includes('resources')) {
    return { kind: 'resource', path, anchor };
  }

  if (/\.md$/i.test(path)) {
    const basename = segments[segments.length - 1] ?? '';
    const kind = basename.toLowerCase() === CONTAINER_FILENAME.toLowerCase() ? 'technique-container' : 'technique';
    return { kind, path, anchor };
  }

  // Projected text: a resource id is `[<workflow>/]<slug>`, so at most one slash and every segment
  // a plain slug. A deeper or dotted extensionless path is a filesystem path quoted in prose
  // rather than a reference.
  const slug = /^[a-z0-9][a-z0-9_-]*$/i;
  if (segments.length <= 2 && segments.every((s) => slug.test(s))) {
    return { kind: 'resource', path, anchor };
  }

  return { kind: 'neither', path, anchor };
}

/** True when the destination names a technique file, container or operation alike. */
export function isTechniqueLink(destination: string): boolean {
  const kind = classifyLink(destination).kind;
  return kind === 'technique' || kind === 'technique-container';
}

/** True when the destination is claimable as a `get_resource` id. */
export function isResourceLink(destination: string): boolean {
  return classifyLink(destination).kind === 'resource';
}

/** One markdown link found in scanned prose, with its position. */
export interface FoundLink {
  readonly label: string;
  readonly destination: string;
  readonly line: number;
  /** Character offset of the link within the line. */
  readonly column: number;
}

/** A call site under the grammar: an invoked technique reference, after pair collapse. */
export interface CallSite {
  /** Destination of the operation this site calls — the right half of a collapsed pair. */
  readonly destination: string;
  /** Container destination when this site was written as a qualified `group::op` pair. */
  readonly container: string | undefined;
  /** Operation name when the pair names it as bare text rather than as a second link. */
  readonly operation: string | undefined;
  readonly line: number;
  /** True when the site was written as a qualified pair and collapsed to one call. */
  readonly qualified: boolean;
}

const LINK = /\[([^\]]*)\]\(([^)\s]+)\)/g;
const FENCE = /^\s*(```|~~~)/;

/**
 * Verb test per the `verb-list`, `verb-case` and `verb-adjacency` terms.
 *
 * The verb is bounded on both sides rather than required to be followed by whitespace, so a verb
 * abutting punctuation — `via:` before a link on the next clause — counts like any other. The two
 * readings coincide for `apply` and diverge for the connectives, which is why the boundary is
 * stated here: it is the basis the asserted totals are measured against.
 */
function hasInvokingVerb(lineText: string, upToColumn: number): boolean {
  const before = lineText.slice(0, upToColumn).toLowerCase();
  return INVOKING_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`).test(before));
}

/**
 * Extract every markdown link in `text`, skipping fenced blocks. Line numbers are 1-based and
 * relative to `text`.
 */
export function findLinks(text: string): FoundLink[] {
  const found: FoundLink[] = [];
  let inFence = false;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i] ?? '';
    if (FENCE.test(lineText)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    LINK.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LINK.exec(lineText)) !== null) {
      found.push({ label: m[1] ?? '', destination: m[2] ?? '', line: i + 1, column: m.index });
    }
  }
  return found;
}

/**
 * Enumerate the call sites in one technique's protocol prose.
 *
 * `protocolText` is the `## Protocol` section body — the caller owns section selection so this
 * function stays independent of how a protocol is stored. Anchored links are excluded per the
 * `anchoring` term, and a qualified `group::op` pair collapses to the single call its operation
 * names per the `qualified-pair` term.
 */
export function extractCallSites(protocolText: string): CallSite[] {
  const lines = protocolText.split(/\r?\n/);
  const links = findLinks(protocolText).filter((l) => {
    const c = classifyLink(l.destination);
    return (c.kind === 'technique' || c.kind === 'technique-container') && c.anchor === undefined;
  });

  const sites: CallSite[] = [];
  const consumed = new Set<number>();

  for (let idx = 0; idx < links.length; idx++) {
    if (consumed.has(idx)) continue;
    const link = links[idx]!;
    const lineText = lines[link.line - 1] ?? '';
    if (!hasInvokingVerb(lineText, link.column)) continue;

    const kind = classifyLink(link.destination).kind;
    if (kind !== 'technique-container') {
      sites.push({ destination: link.destination, container: undefined, operation: undefined, line: link.line, qualified: false });
      continue;
    }

    // A container link followed by `::` names an operation, either as a second link or as bare
    // text. Both spellings are one logical call site whose target is the operation.
    const after = lineText.slice(link.column);
    const closeIdx = after.indexOf(')');
    const tail = closeIdx >= 0 ? after.slice(closeIdx + 1) : '';
    if (!tail.startsWith('::')) {
      sites.push({ destination: link.destination, container: undefined, operation: undefined, line: link.line, qualified: false });
      continue;
    }

    const next = links[idx + 1];
    const nextIsPartner =
      next !== undefined && next.line === link.line && tail.startsWith(`::[`) && next.column > link.column;
    if (nextIsPartner) {
      consumed.add(idx + 1);
      sites.push({
        destination: next.destination,
        container: link.destination,
        operation: undefined,
        line: link.line,
        qualified: true,
      });
      continue;
    }

    const bare = /^::([A-Za-z0-9][A-Za-z0-9_-]*)/.exec(tail);
    sites.push({
      destination: link.destination,
      container: link.destination,
      operation: bare?.[1],
      line: link.line,
      qualified: true,
    });
  }

  return sites;
}
