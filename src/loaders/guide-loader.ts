import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { GuideNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';

export interface GuideEntry { name: string; title: string; path: string; }

export async function readGuide(guideDir: string, name: string): Promise<Result<string, GuideNotFoundError>> {
  for (const pattern of [`${name}.guide.md`, `${name}.md`, name]) {
    const filePath = join(guideDir, pattern);
    if (existsSync(filePath)) {
      try {
        const content = await readFile(filePath, 'utf-8');
        logInfo('Guide loaded', { name, path: filePath });
        return ok(content);
      } catch { /* continue */ }
    }
  }
  return err(new GuideNotFoundError(name));
}

export async function listGuides(guideDir: string): Promise<GuideEntry[]> {
  if (!existsSync(guideDir)) return [];
  try {
    const files = await readdir(guideDir);
    return files.filter(f => f.endsWith('.md')).map(file => {
      let name = basename(file, '.md');
      if (name.endsWith('.guide')) name = name.slice(0, -6);
      return { name, title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), path: file };
    });
  } catch { return []; }
}
