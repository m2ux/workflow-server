import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderSitePages, checkSiteNavigation } from '../scripts/generate-site-data.js';

const SITE_DIR = resolve(import.meta.dirname, '../site');

/** Staleness is a comparison against a render, so no guard can read it from the committed file. */
describe('documentation site', () => {
  it('generated regions match the server source (stale? run npm run build:site)', () => {
    for (const { relPath, content } of renderSitePages()) {
      const committed = readFileSync(join(SITE_DIR, relPath), 'utf-8');
      expect(committed, `site/${relPath} is stale — run npm run build:site and commit the result`).toBe(content);
    }
  });

  it('every page has global navigation linking all registered routes', () => {
    expect(checkSiteNavigation()).toEqual([]);
  });
});
