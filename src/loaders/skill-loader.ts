import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logInfo } from '../logging.js';
import { decodeToon } from '../utils/toon.js';

export interface SkillEntry { id: string; name: string; path: string; }

export interface Skill {
  id: string;
  version: string;
  capability: string;
  execution_pattern: {
    start: string[];
    per_phase: string[];
    transitions: string[];
  };
  tools: Record<string, {
    when: string;
    returns: string;
    preserve?: string[];
    next?: string;
    action?: string;
  }>;
  state: {
    track: string[];
    initialize: string;
    update_on: Record<string, string>;
  };
  interpretation: Record<string, string>;
  errors: Record<string, { cause: string; recovery: string }>;
}

function getSkillDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const srcDir = dirname(dirname(currentFile));
  const projectRoot = dirname(srcDir);
  return join(projectRoot, 'prompts', 'skills');
}

export async function readSkill(skillId: string): Promise<Result<Skill, SkillNotFoundError>> {
  const skillDir = getSkillDir();
  const filePath = join(skillDir, `${skillId}.toon`);
  
  if (!existsSync(filePath)) {
    return err(new SkillNotFoundError(skillId));
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const skill = decodeToon<Skill>(content);
    logInfo('Skill loaded', { id: skillId, path: filePath });
    return ok(skill);
  } catch {
    return err(new SkillNotFoundError(skillId));
  }
}

export async function listSkills(): Promise<SkillEntry[]> {
  const skillDir = getSkillDir();
  
  if (!existsSync(skillDir)) return [];
  
  try {
    const files = await readdir(skillDir);
    return files.filter(f => f.endsWith('.toon')).map(file => {
      const id = basename(file, '.toon');
      const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { id, name, path: file };
    });
  } catch { 
    return []; 
  }
}
