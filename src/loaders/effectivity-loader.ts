import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { logInfo, logError } from '../logging.js';
import { decodeToon } from '../utils/toon.js';
import {
  type Effectivity,
  type ResolvedEffectivity,
  validateEffectivity,
  safeValidateEffectivity,
} from '../schema/effectivity.schema.js';

/**
 * Error thrown when an effectivity cannot be found
 */
export class EffectivityNotFoundError extends Error {
  constructor(public readonly effectivityId: string) {
    super(`Effectivity not found: ${effectivityId}`);
    this.name = 'EffectivityNotFoundError';
  }
}

/**
 * Error thrown when circular includes are detected
 */
export class CircularIncludeError extends Error {
  constructor(public readonly chain: string[]) {
    super(`Circular include detected: ${chain.join(' -> ')}`);
    this.name = 'CircularIncludeError';
  }
}

/**
 * Effectivity entry for listing
 */
export interface EffectivityEntry {
  id: string;
  name: string;
  version: string;
  description?: string;
  path: string;
}

/**
 * Parse effectivity filename: {effectivity-id}.toon
 */
function parseEffectivityFilename(filename: string): string | null {
  const match = filename.match(/^(.+)\.toon$/);
  if (!match || !match[1]) return null;
  return match[1];
}

/**
 * Read a single effectivity file by ID
 */
export async function readEffectivity(
  effectivityId: string,
  effectivityDir: string
): Promise<Result<Effectivity, EffectivityNotFoundError>> {
  const filePath = join(effectivityDir, `${effectivityId}.toon`);
  
  if (!existsSync(filePath)) {
    return err(new EffectivityNotFoundError(effectivityId));
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = decodeToon<unknown>(content);
    const effectivity = validateEffectivity(data);
    logInfo('Effectivity loaded', { id: effectivityId, path: filePath });
    return ok(effectivity);
  } catch (error) {
    logError('Failed to load effectivity', error instanceof Error ? error : undefined, { id: effectivityId });
    return err(new EffectivityNotFoundError(effectivityId));
  }
}

/**
 * List all effectivities in the effectivities directory
 */
export async function listEffectivities(
  effectivityDir: string
): Promise<EffectivityEntry[]> {
  if (!existsSync(effectivityDir)) return [];
  
  try {
    const files = await readdir(effectivityDir);
    const entries: EffectivityEntry[] = [];
    
    for (const file of files) {
      const id = parseEffectivityFilename(file);
      if (!id) continue;
      
      const result = await readEffectivity(id, effectivityDir);
      if (result.success) {
        const entry: EffectivityEntry = {
          id: result.value.id,
          name: result.value.name,
          version: result.value.version,
          path: file,
        };
        if (result.value.description) {
          entry.description = result.value.description;
        }
        entries.push(entry);
      }
    }
    
    return entries.sort((a, b) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

/**
 * Load all effectivities into a map
 */
export async function loadAllEffectivities(
  effectivityDir: string
): Promise<Map<string, Effectivity>> {
  const effectivities = new Map<string, Effectivity>();
  
  if (!existsSync(effectivityDir)) return effectivities;
  
  try {
    const files = await readdir(effectivityDir);
    
    for (const file of files) {
      const id = parseEffectivityFilename(file);
      if (!id) continue;
      
      const result = await readEffectivity(id, effectivityDir);
      if (result.success) {
        effectivities.set(result.value.id, result.value);
      }
    }
  } catch {
    // Return what we have
  }
  
  return effectivities;
}

/**
 * Resolve includes for an effectivity, returning a flattened list of all included effectivity IDs.
 * Detects circular includes.
 */
export async function resolveIncludes(
  effectivityId: string,
  effectivityDir: string,
  visited: Set<string> = new Set()
): Promise<Result<string[], CircularIncludeError | EffectivityNotFoundError>> {
  // Check for circular reference
  if (visited.has(effectivityId)) {
    return err(new CircularIncludeError([...visited, effectivityId]));
  }
  
  visited.add(effectivityId);
  
  // Load the effectivity
  const result = await readEffectivity(effectivityId, effectivityDir);
  if (!result.success) {
    return err(result.error);
  }
  
  const effectivity = result.value;
  const allIncludes: string[] = [];
  
  // Recursively resolve includes
  if (effectivity.includes && effectivity.includes.length > 0) {
    for (const includeId of effectivity.includes) {
      // Add the direct include
      allIncludes.push(includeId);
      
      // Recursively resolve its includes
      const nestedResult = await resolveIncludes(includeId, effectivityDir, new Set(visited));
      if (!nestedResult.success) {
        return err(nestedResult.error);
      }
      
      // Add nested includes (avoiding duplicates)
      for (const nestedId of nestedResult.value) {
        if (!allIncludes.includes(nestedId)) {
          allIncludes.push(nestedId);
        }
      }
    }
  }
  
  return ok(allIncludes);
}

/**
 * Read an effectivity with all includes resolved
 */
export async function readResolvedEffectivity(
  effectivityId: string,
  effectivityDir: string
): Promise<Result<ResolvedEffectivity, CircularIncludeError | EffectivityNotFoundError>> {
  // Load the effectivity
  const effectivityResult = await readEffectivity(effectivityId, effectivityDir);
  if (!effectivityResult.success) {
    return err(effectivityResult.error);
  }
  
  // Resolve includes
  const includesResult = await resolveIncludes(effectivityId, effectivityDir);
  if (!includesResult.success) {
    return err(includesResult.error);
  }
  
  const resolved: ResolvedEffectivity = {
    ...effectivityResult.value,
    resolvedIncludes: includesResult.value,
  };
  
  return ok(resolved);
}

/**
 * Check if an effectivity matches a required effectivity ID.
 * Exact match is required per design decision.
 */
export function matchesEffectivity(
  availableEffectivityId: string,
  requiredEffectivityId: string
): boolean {
  return availableEffectivityId === requiredEffectivityId;
}

/**
 * Build an effectivity index for display
 */
export interface EffectivityIndex {
  description: string;
  effectivities: Array<{
    id: string;
    name: string;
    description?: string;
    includes?: string[];
  }>;
}

export async function readEffectivityIndex(
  effectivityDir: string
): Promise<Result<EffectivityIndex, EffectivityNotFoundError>> {
  const entries = await listEffectivities(effectivityDir);
  
  if (entries.length === 0) {
    return err(new EffectivityNotFoundError('index'));
  }
  
  const effectivities: EffectivityIndex['effectivities'] = [];
  
  for (const entry of entries) {
    const result = await readEffectivity(entry.id, effectivityDir);
    if (result.success) {
      const effEntry: EffectivityIndex['effectivities'][number] = {
        id: result.value.id,
        name: result.value.name,
      };
      if (result.value.description) {
        effEntry.description = result.value.description;
      }
      if (result.value.includes && result.value.includes.length > 0) {
        effEntry.includes = result.value.includes;
      }
      effectivities.push(effEntry);
    }
  }
  
  const index: EffectivityIndex = {
    description: 'Effectivities are workflow-agnostic agent capabilities that can be matched to workflow step requirements.',
    effectivities,
  };
  
  logInfo('Effectivity index built', { count: effectivities.length });
  return ok(index);
}
