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
 * count still even, so nothing reports. Openers stay bounded, closers do not. Both choices leave more
 * lines read, which is the only direction a guard can afford to err.
 */

/** An opener sits within three spaces of the margin; a stray marker deep in a list opens nothing. */
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
/** A closer matches its opener's character, runs at least as long, and carries no info string. */
const FENCE_CLOSE_RE = /^\s*(`{3,}|~{3,})\s*$/;

/**
 * An inline destination, with the optional title CommonMark allows after it, and an angle-bracket form
 * that may contain spaces.
 */
const INLINE_DEST_RE = /\]\(\s*(<[^>]*>|[^)\s]*)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
/** A reference definition, which carries the destination away from the `[text][label]` that uses it. */
const REF_DEF_RE = /^ {0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/;
/**
 * An HTML destination, found by its attribute rather than by the tag around it.
 *
 * Requiring a tag on the same line misses one split across lines, which the spec permits. Taking the
 * first `href` before the closing angle reads the one inside `alt="href='…'"` and never the real
 * destination beside it. And the value may be unquoted, which every renderer follows. Demanding
 * whitespace or line start ahead of the name does the discriminating: it rules out `data-href`, and an
 * `href` nested in a quoted value, since neither is preceded by space.
 */
const HTML_DEST_RE = /(?:^|\s)(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/gi;

/** Which lines sit inside a closed fence, and where an unclosed one opened. */
export function fencedLines(lines: readonly string[]): { fenced: Set<number>; unclosed: number | null } {
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
  // An unclosed fence yields no fenced lines at all, so every line is read. A fence left open must not
  // be able to take a check out of service behind a green verdict.
  if (open) return { fenced: new Set<number>(), unclosed: open.start + 1 };
  return { fenced, unclosed: null };
}

/** Split on either line ending, so a CR does not stop a line looking like a fence. */
export function toLines(text: string): string[] {
  return text.split(/\r?\n/);
}

/**
 * Every destination this line points at, in each form markdown offers.
 *
 * `keepCodeSpans` reads a destination quoted in backticks as well. Leave it off where a shown link is
 * illustration; turn it on where the line is being read for content rather than for instruction.
 */
export function linkDestinations(line: string, opts?: { keepCodeSpans?: boolean }): string[] {
  const rendered = opts?.keepCodeSpans ? line : line.replace(/`[^`]*`/g, '');
  const out: string[] = [];
  for (const match of rendered.matchAll(INLINE_DEST_RE)) out.push(match[1]!);
  for (const [, quoted, single, bare] of rendered.matchAll(HTML_DEST_RE)) out.push(quoted ?? single ?? bare!);
  const refDef = REF_DEF_RE.exec(rendered);
  if (refDef) out.push(refDef[1]!);
  return out.map((target) => target.replace(/^<|>$/g, '')).filter((target) => target !== '');
}

/**
 * The line with every destination blanked, for a scan that must not read a path as prose. A dotted
 * segment inside a destination is a path segment, not a reference to anything.
 */
export function stripDestinations(line: string): string {
  return line
    .replace(INLINE_DEST_RE, ']()')
    .replace(HTML_DEST_RE, ' href=""')
    .replace(REF_DEF_RE, '[]:');
}
