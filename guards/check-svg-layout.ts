#!/usr/bin/env npx tsx
/**
 * Geometric layout guard for the documentation site's inline SVG diagrams.
 *
 * Text in hand-authored SVG has no automatic wrapping or clipping, so a label
 * that outgrows its box silently overlaps neighbouring shapes when rendered.
 * This check estimates every text element's bounding box from calibrated
 * per-font average glyph widths and fails when text crosses a rect border,
 * intersects an axis-aligned line (arrows), overlaps sibling text, or
 * escapes the viewBox.
 *
 * The glyph-width factors are deliberately conservative estimates of browser
 * rendering (system-ui sans and ui-monospace); they catch real collisions
 * while tolerating tight-but-clean layouts.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SITE_DIR = join(ROOT, 'site');

// Average character width in em, calibrated against observed rendering.
const SANS = 0.55;
const SANS_BOLD = 0.6;
const MONO = 0.62;

interface TextBox { text: string; x0: number; x1: number; y0: number; y1: number }
interface Rect { x: number; y: number; w: number; h: number }
interface Line { x1: number; y1: number; x2: number; y2: number }

function parseAttrs(chunk: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of chunk.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) attrs[m[1]!] = m[2]!;
  return attrs;
}

/** Extract texts/rects/lines from one SVG, resolving <g>-inherited font attributes. */
function parseSvg(svg: string): { texts: TextBox[]; rects: Rect[]; lines: Line[] } {
  const texts: TextBox[] = [];
  const rects: Rect[] = [];
  const lines: Line[] = [];
  const inheritedStack: Array<Record<string, string>> = [{}];

  const tagRe = /<(\/?)([a-zA-Z-]+)([^>]*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(svg)) !== null) {
    const [, closing, tag, attrChunk, selfClosing] = m;
    if (closing) {
      if (tag === 'g') inheritedStack.pop();
      continue;
    }
    const attrs = parseAttrs(attrChunk!);
    if (tag === 'g' && !selfClosing) {
      const merged = { ...inheritedStack[inheritedStack.length - 1] };
      for (const k of ['font-size', 'font-family', 'font-weight', 'text-anchor'] as const) {
        if (attrs[k]) merged[k] = attrs[k]!;
      }
      inheritedStack.push(merged);
      continue;
    }
    if (tag === 'rect') {
      rects.push({ x: +attrs['x']!, y: +attrs['y']!, w: +attrs['width']!, h: +attrs['height']! });
      continue;
    }
    if (tag === 'line') {
      lines.push({ x1: +attrs['x1']!, y1: +attrs['y1']!, x2: +attrs['x2']!, y2: +attrs['y2']! });
      continue;
    }
    if (tag === 'text' && !selfClosing) {
      const contentEnd = svg.indexOf('</text>', tagRe.lastIndex);
      const content = svg.slice(tagRe.lastIndex, contentEnd).trim();
      const scope = { ...inheritedStack[inheritedStack.length - 1], ...attrs };
      const size = +(scope['font-size'] ?? 16);
      const factor = (scope['font-family'] ?? '').includes('mono')
        ? MONO
        : ['600', '700', 'bold'].includes(scope['font-weight'] ?? '') ? SANS_BOLD : SANS;
      const w = content.length * size * factor;
      const x = +(attrs['x'] ?? 0);
      const y = +(attrs['y'] ?? 0);
      const anchor = scope['text-anchor'] ?? 'start';
      const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      texts.push({ text: content, x0, x1: x0 + w, y0: y - size * 0.8, y1: y });
    }
  }
  return { texts, rects, lines };
}

/** Text fully inside or fully outside a rect is fine; straddling its border is a collision. */
function crossesBorder(t: TextBox, r: Rect): boolean {
  const intersects = t.x0 < r.x + r.w && t.x1 > r.x && t.y0 < r.y + r.h && t.y1 > r.y;
  if (!intersects) return false;
  const contained = t.x0 >= r.x - 1 && t.x1 <= r.x + r.w + 1 && t.y0 >= r.y - 1 && t.y1 <= r.y + r.h + 1;
  return !contained;
}

function hitsLine(t: TextBox, l: Line): boolean {
  if (Math.abs(l.y1 - l.y2) < 2) {
    const [lx0, lx1] = [Math.min(l.x1, l.x2), Math.max(l.x1, l.x2)];
    return t.x0 < lx1 && t.x1 > lx0 && t.y0 < l.y1 + 1 && t.y1 > l.y1 - 1;
  }
  if (Math.abs(l.x1 - l.x2) < 2) {
    const [ly0, ly1] = [Math.min(l.y1, l.y2), Math.max(l.y1, l.y2)];
    return t.y0 < ly1 && t.y1 > ly0 && t.x0 < l.x1 + 1 && t.x1 > l.x1 - 1;
  }
  return false;
}

export function checkSvgLayout(): string[] {
  const errors: string[] = [];
  const files = readdirSync(SITE_DIR, { recursive: true, encoding: 'utf-8' })
    .filter(f => f.endsWith('.html'))
    .map(f => join(SITE_DIR, f));

  for (const file of files) {
    const page = relative(ROOT, file);
    const html = readFileSync(file, 'utf-8');
    let index = 0;
    for (const svgMatch of html.matchAll(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/g)) {
      index += 1;
      const at = `${page} svg#${index}`;
      const [vx, , vw] = svgMatch[1]!.split(/\s+/).map(Number);
      const { texts, rects, lines } = parseSvg(svgMatch[2]!);
      for (const t of texts) {
        if (t.x0 < vx! - 2 || t.x1 > vx! + vw! + 2) {
          errors.push(`${at}: text escapes viewBox: "${t.text}"`);
        }
        for (const r of rects) {
          if (crossesBorder(t, r)) {
            errors.push(`${at}: text crosses box (${r.x},${r.y} ${r.w}x${r.h}): "${t.text}"`);
          }
        }
        for (const l of lines) {
          if (hitsLine(t, l)) {
            errors.push(`${at}: text hits line (${l.x1},${l.y1})-(${l.x2},${l.y2}): "${t.text}"`);
          }
        }
      }
      for (let a = 0; a < texts.length; a++) {
        for (let b = a + 1; b < texts.length; b++) {
          const ta = texts[a]!;
          const tb = texts[b]!;
          if (ta.x0 < tb.x1 && ta.x1 > tb.x0 && ta.y0 < tb.y1 && ta.y1 > tb.y0) {
            errors.push(`${at}: text overlap: "${ta.text}" × "${tb.text}"`);
          }
        }
      }
    }
  }
  return errors;
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename);
if (isMain) {
  const errors = checkSvgLayout();
  if (errors.length > 0) {
    for (const error of errors) console.error(`[FAIL] ${error}`);
    process.exit(1);
  }
  console.log('[PASS] No SVG text collisions detected');
}
