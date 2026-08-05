import { describe, it, expect } from 'vitest';
import { fencedLines, linkDestinations, stripDestinations, toLines } from '../scripts/markdown-refs.js';

/**
 * The shared markdown reader.
 *
 * It was extracted so three guards would stop each growing their own narrower answer to the same two
 * questions, and then it was reviewed only through those guards — whose corpora exercise almost none of
 * it. The real bootstrap text carries no links and no fences at all, so a hard-zero assertion over it
 * says nothing about whether this module works. These are the direct tests.
 */

const T = '../techniques/version-control/resolve-host-repo.md';

describe('linkDestinations', () => {
  it('reads every spelling of an inline destination', () => {
    expect(linkDestinations(`See [x](${T}).`)).toEqual([T]);
    expect(linkDestinations(`See [x](${T} "its home").`)).toEqual([T]);
    expect(linkDestinations(`See [x](<${T}>).`)).toEqual([T]);
    expect(linkDestinations('See [x](<a b.md>).')).toEqual(['a b.md']);
    // Two on one line, the first with a title.
    expect(linkDestinations('[a](one.md "T") and [b](two.md)')).toEqual(['one.md', 'two.md']);
  });

  it('strips the angle form only when it wraps the whole destination', () => {
    // Greedy matching turns a value that merely starts and ends with the brackets into one nobody wrote,
    // and the corpus writes `<placeholder>` idioms freely.
    expect(linkDestinations('See [x](<owner>/<repo>).')).toEqual(['<owner>/<repo>']);
    expect(linkDestinations('See <a href="<owner>/<repo>">x</a>.')).toEqual(['<owner>/<repo>']);
    expect(linkDestinations('See [x](<id>.md).')).toEqual(['<id>.md']);
    expect(linkDestinations('See [x](<a>).')).toEqual(['a']);
  });

  it('always yields a destination for a paren-bearing target, even a truncated one', () => {
    // A pattern that matches balanced parens fails wholesale once the nesting outruns it, and a
    // destination nobody reports is worse than one reported under a clipped name.
    expect(linkDestinations('See [x](a(b).md).')).not.toEqual([]);
    expect(linkDestinations('See [x](a(b(c)).md).')).not.toEqual([]);
    expect(linkDestinations('See [x](a(b.md).')).not.toEqual([]);
  });

  it('reads a reference definition, where the destination sits away from its use', () => {
    expect(linkDestinations(`[home]: ${T}`)).toEqual([T]);
    expect(linkDestinations(`  [home]: <${T}>`)).toEqual([T]);
  });

  it('reads an HTML destination by its attribute, in order, in any spelling', () => {
    expect(linkDestinations(`<a href="${T}">x</a>`)).toEqual([T]);
    expect(linkDestinations(`<a href='${T}'>x</a>`)).toEqual([T]);
    expect(linkDestinations(`<a href=${T}>x</a>`)).toEqual([T]);
    expect(linkDestinations(`<A HREF="${T}">x</A>`)).toEqual([T]);
    expect(linkDestinations(`<a href = "${T}">x</a>`)).toEqual([T]);
    expect(linkDestinations(`<a class="c" href="${T}">x</a>`)).toEqual([T]);
    // A tag may straddle lines, so the destination is read wherever it sits.
    expect(linkDestinations(`href="${T}">x</a>`)).toEqual([T]);
  });

  it('cannot be mined for a destination hidden inside another attribute value', () => {
    // The ordered walk consumes `alt="…"` whole, so the `href` inside it never looks like markup. This
    // is the fix a whitespace-before-the-name test only appeared to make.
    expect(linkDestinations(`<img alt="see href=fake.md" src="${T}">`)).toEqual([T]);
    expect(linkDestinations(`<img alt='see href=fake.md' src="${T}">`)).toEqual([T]);
  });

  it('does not read an attribute whose name merely ends in one that carries a destination', () => {
    expect(linkDestinations('<span data-href="fake.md">x</span>')).toEqual([]);
    expect(linkDestinations('<span xhref="fake.md">x</span>')).toEqual([]);
    // No left boundary would let this match by starting the name after the hyphen.
    expect(linkDestinations('<span -href="fake.md">x</span>')).toEqual([]);
    // But a bracket does not continue a name, so a destination behind one is still a destination. This
    // is the one construct where the boundary's exact shape shows, so it is pinned rather than left to
    // whichever form the pattern happened to take.
    expect(linkDestinations('Written as (href="fake.md") in the example.')).toEqual(['fake.md']);
  });

  it('treats a destination quoted in backticks as shown rather than offered', () => {
    expect(linkDestinations(`Write it as \`[x](${T})\`.`)).toEqual([]);
    expect(linkDestinations(`Write it as \`<a href="${T}">\`.`)).toEqual([]);
  });

  it('yields nothing for an empty destination', () => {
    expect(linkDestinations('See [x]().')).toEqual([]);
    expect(linkDestinations('See [x](<>).')).toEqual([]);
    expect(linkDestinations('See <a href="">x</a>.')).toEqual([]);
  });
});

describe('fencedLines', () => {
  const fence = '```';

  it('spans a closed fence, matching the closer to its opener', () => {
    const lines = ['# H', '', fence, 'body', fence, 'after'];
    expect([...fencedLines(lines).fenced].sort((a, b) => a - b)).toEqual([2, 3, 4]);
    expect(fencedLines(lines).unclosed).toBeNull();
  });

  it('does not let a nested block close a wider wrapper', () => {
    const lines = ['# H', '````markdown', fence, 'x', fence, '````', 'after'];
    const { fenced, unclosed } = fencedLines(lines);
    expect(unclosed).toBeNull();
    expect(fenced.has(3)).toBe(true);
    expect(fenced.has(6)).toBe(false);
  });

  it('accepts a closer at any indent, so a block cannot run past its real end', () => {
    // An invisible closer pairs the opener with the NEXT block's opener and swallows the prose between.
    const lines = ['1. Step:', '   ```json', '   {}', '      ```', '', '   after'];
    const { fenced, unclosed } = fencedLines(lines);
    expect(unclosed).toBeNull();
    expect(fenced.has(5)).toBe(false);
  });

  it('requires a closer to match its opener, in character and in length', () => {
    expect(fencedLines(['~~~', fence, 'x', '~~~']).unclosed).toBeNull();
    expect(fencedLines(['~~~', fence, 'x', fence]).unclosed).toBe(1);
    expect(fencedLines(['````', fence, 'x']).unclosed).toBe(1);
    // A marker carrying an info string opens a block and never closes one.
    expect(fencedLines([fence, fence + 'js', 'x']).unclosed).toBe(1);
  });

  it('keeps an opener within three spaces of the margin', () => {
    expect(fencedLines(['1. Step:', '    ```', '    x', '    ```']).unclosed).toBeNull();
    expect([...fencedLines(['1. Step:', '    ```', '    x', '    ```']).fenced]).toEqual([]);
  });

  it('reads every line when a fence is left open, by default', () => {
    // A caller hunting destinations cannot afford suppression: a fence left open must not take its check
    // out of service. The spans an EARLIER block closed are discarded too, since fence state is already
    // known to be unreliable.
    const lines = ['# H', fence, 'inside', fence, '', fence + 'json', 'after'];
    const { fenced, unclosed } = fencedLines(lines);
    expect(unclosed).toBe(6);
    expect([...fenced]).toEqual([]);
  });

  it('suppresses to the end of the file when the caller collects rather than points', () => {
    // A heading exposed from under an unclosed fence is an anchor the rendered page does not have, and
    // it makes a link to it resolve here and break in the reader's hands.
    const lines = ['# H', fence, 'x', '', '## Phantom', 'tail'];
    const { fenced, unclosed } = fencedLines(lines, { onUnclosed: 'suppress-to-end' });
    expect(unclosed).toBe(2);
    expect(fenced.has(4)).toBe(true);
    expect(fenced.has(5)).toBe(true);
    // A heading ABOVE the opener still counts.
    expect(fenced.has(0)).toBe(false);
  });
});

describe('stripDestinations and toLines', () => {
  it('blanks a destination so a path inside one is not read as prose', () => {
    expect(stripDestinations('See [x](docs/a.b.md) here')).not.toContain('a.b.md');
    expect(stripDestinations('See <a href="docs/a.b.md">x</a>')).not.toContain('a.b.md');
    expect(stripDestinations('[home]: docs/a.b.md')).not.toContain('a.b.md');
  });

  it('leaves an attribute that carries no destination exactly as it was', () => {
    // Blanking every attribute would hide a dotted reference written in one, which is a real finding.
    const line = '<span title="see resolve-host-repo.prose-sources-are-fallback-only">x</span>';
    expect(stripDestinations(line)).toContain('resolve-host-repo.prose-sources-are-fallback-only');
  });

  it('splits on either line ending', () => {
    expect(toLines('a\nb')).toEqual(['a', 'b']);
    expect(toLines('a\r\nb')).toEqual(['a', 'b']);
  });
});
