/**
 * markdown-refs — reading destinations and fences out of markdown, once (#407).
 *
 * Several guards need the same two questions answered: which lines are illustration rather than
 * instruction, and where does this line point. Each had grown its own answer, and each answer was
 * narrower than CommonMark — so a link written in a form the spec blesses slipped past whichever guard
 * was meant to catch it. The forms are not exotic: a destination wearing a title is ordinary markdown,
 * raw HTML is permitted inline, and a reference definition puts the destination nowhere near its use.
 *
 * The fence matcher is the part worth stating carefully, because getting it wrong is silent. Counting
 * markers reads a three-backtick example nested in a four-backtick wrapper as two blocks and inverts
 * the phase, so illustration reports as instruction. Requiring a closer to sit within three spaces of
 * the margin is worse: an over-indented closer is then invisible, the opener pairs with the NEXT
 * visible marker — a later block's opener — and the rendered prose between them is swallowed with the
 * count still even, so nothing reports. Openers stay bounded, closers do not.
 *
 * Which way to err is NOT a property of the matcher, though, and treating it as one was the mistake this
 * module was extracted with. A caller hunting destinations is safer reading more lines; a caller
 * collecting anchor targets is safer reading fewer, because an anchor it invents makes a broken link
 * resolve. `fencedLines` therefore takes the direction from its caller.
 */

/** An opener sits within three spaces of the margin; a stray marker deep in a list opens nothing. */
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
/** A closer matches its opener's character, runs at least as long, and carries no info string. */
const FENCE_CLOSE_RE = /^\s*(`{3,}|~{3,})\s*$/;

/**
 * An inline destination, with the optional title CommonMark allows after it, and an angle-bracket form
 * that may contain spaces.
 */
const INLINE_DEST_RE =
  /\]\(\s*(<[^>]*>|(?:[^()\s\\]|\\.|\([^()\s]*\))*)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
/** A reference definition, which carries the destination away from the `[text][label]` that uses it. */
const REF_DEF_RE = /^ {0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/;
/**
 * Any HTML attribute, matched by name and value so the pairs can be walked in order.
 *
 * Reading in order is what makes a quoted value safe: `alt="see href=x"` is consumed as ONE pair, so the
 * `href` inside it never looks like markup. A whitespace-before-the-name test does not achieve that —
 * a space inside the outer value satisfies it — and it was the wrong tool for excluding `data-href`
 * too, which is better done by matching the name exactly.
 *
 * Found by attribute rather than by tag on purpose: a tag may straddle lines, which the spec permits,
 * and requiring the tag would miss the destination sitting on the continuation line.
 */
const HTML_ATTR_RE = /([a-zA-Z_:][-\w:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
/** The attributes that carry a destination. Matched exactly, so `data-href` is not one of them. */
const DEST_ATTRS = new Set(['href', 'src']);

/**
 * Which lines sit inside a closed fence, and where an unclosed one opened.
 *
 * `onUnclosed` picks what an unclosed fence means, and callers genuinely need opposite answers.
 *
 * A caller looking for things the text POINTS AT wants `read-all`: suppressing lines could hide a link,
 * and a fence left open must not take that check out of service behind a green verdict.
 *
 * A caller COLLECTING what the text declares — headings that become anchor targets — wants
 * `suppress-to-end`, because for it the directions invert. Reading more lines collects more anchors, and
 * a phantom anchor makes a broken link resolve. Erring toward fewer anchors errs toward reporting.
 *
 * Either way the caller should surface `unclosed` as a finding of its own: it is a defect in the file,
 * and whichever direction is chosen, some check is running on a guess.
 */
export function fencedLines(
  lines: readonly string[],
  opts?: { onUnclosed?: 'read-all' | 'suppress-to-end' },
): { fenced: Set<number>; unclosed: number | null } {
  const fenced = new Set<number>();
  let open: { char: string; len: number; start: number } | null = null;
  lines.forEach((line, index) => {
    if (open) {
      const close = FENCE_CLOSE_RE.exec(line);
      if (close && close[1]![0] === open.char && close[1]!.length >= open.len) {
        for (let fencedLine = open.start; fencedLine <= index; fencedLine++) fenced.add(fencedLine);
        open = null;
      }
      return;
    }
    const opener = FENCE_OPEN_RE.exec(line);
    if (opener) open = { char: opener[1]![0]!, len: opener[1]!.length, start: index };
  });
  if (!open) return { fenced, unclosed: null };
  if (opts?.onUnclosed === 'suppress-to-end') {
    for (let line = open.start; line < lines.length; line++) fenced.add(line);
    return { fenced, unclosed: open.start + 1 };
  }
  return { fenced: new Set<number>(), unclosed: open.start + 1 };
}

/** Split on either line ending, so a CR does not stop a line looking like a fence. */
export function toLines(text: string): string[] {
  return text.split(/\r?\n/);
}

/**
 * Every destination this line points at, in each form markdown offers. A destination quoted in backticks
 * is being shown rather than offered, so code spans come out first.
 */
export function linkDestinations(line: string): string[] {
  const rendered = line.replace(/`[^`]*`/g, '');
  const out: string[] = [];
  for (const match of rendered.matchAll(INLINE_DEST_RE)) out.push(match[1]!);
  for (const [, name, quoted, single, bare] of rendered.matchAll(HTML_ATTR_RE)) {
    if (DEST_ATTRS.has(name!.toLowerCase())) out.push(quoted ?? single ?? bare!);
  }
  const refDef = REF_DEF_RE.exec(rendered);
  if (refDef) out.push(refDef[1]!);
  return out
    .map((target) => (/^<.*>$/.test(target) ? target.slice(1, -1) : target))
    .filter((target) => target !== '');
}

/**
 * The line with every destination blanked, for a scan that must not read a path as prose. A dotted
 * segment inside a destination is a path segment, not a reference to anything.
 */
export function stripDestinations(line: string): string {
  return line
    .replace(INLINE_DEST_RE, ']()')
    .replace(HTML_ATTR_RE, (whole, name: string) => (DEST_ATTRS.has(name.toLowerCase()) ? ' href=""' : whole))
    .replace(REF_DEF_RE, '[]:');
}
