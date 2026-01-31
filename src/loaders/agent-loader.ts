import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { logInfo, logError } from '../logging.js';
import { decodeToon } from '../utils/toon.js';
import {
  type AgentRegistry,
  type AgentConfig,
  validateAgentRegistry,
  findAgentForEffectivity,
} from '../schema/agent.schema.js';

/**
 * Error thrown when an agent registry cannot be found
 */
export class AgentRegistryNotFoundError extends Error {
  constructor(public readonly variant: string) {
    super(`Agent registry not found: ${variant}`);
    this.name = 'AgentRegistryNotFoundError';
  }
}

/**
 * Agent registry entry for listing
 */
export interface AgentRegistryEntry {
  variant: string;
  path: string;
  description?: string;
}

/**
 * Parse agent registry filename: {variant}.toon
 */
function parseRegistryFilename(filename: string): string | null {
  const match = filename.match(/^(.+)\.toon$/);
  if (!match || !match[1]) return null;
  return match[1];
}

/**
 * Read an agent registry by variant name
 */
export async function readAgentRegistry(
  variant: string,
  agentsDir: string
): Promise<Result<AgentRegistry, AgentRegistryNotFoundError>> {
  const filePath = join(agentsDir, `${variant}.toon`);
  
  if (!existsSync(filePath)) {
    return err(new AgentRegistryNotFoundError(variant));
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = decodeToon<unknown>(content);
    const registry = validateAgentRegistry(data);
    logInfo('Agent registry loaded', { variant, path: filePath });
    return ok(registry);
  } catch (error) {
    logError('Failed to load agent registry', error instanceof Error ? error : undefined, { variant });
    return err(new AgentRegistryNotFoundError(variant));
  }
}

/**
 * List all available agent registry variants
 */
export async function listAgentRegistries(
  agentsDir: string
): Promise<AgentRegistryEntry[]> {
  if (!existsSync(agentsDir)) return [];
  
  try {
    const files = await readdir(agentsDir);
    const entries: AgentRegistryEntry[] = [];
    
    for (const file of files) {
      const variant = parseRegistryFilename(file);
      if (!variant) continue;
      
      // Try to load to get description
      const result = await readAgentRegistry(variant, agentsDir);
      const entry: AgentRegistryEntry = {
        variant,
        path: file,
      };
      if (result.success && result.value.description) {
        entry.description = result.value.description;
      }
      entries.push(entry);
    }
    
    return entries.sort((a, b) => a.variant.localeCompare(b.variant));
  } catch {
    return [];
  }
}

/**
 * Load the default agent registry
 */
export async function loadDefaultAgentRegistry(
  agentsDir: string
): Promise<Result<AgentRegistry, AgentRegistryNotFoundError>> {
  return readAgentRegistry('default', agentsDir);
}

/**
 * Find which agent can handle a specific effectivity
 */
export async function findAgentForEffectivityInRegistry(
  effectivityId: string,
  agentsDir: string,
  variant: string = 'default'
): Promise<Result<{ agentId: string; config: AgentConfig } | null, AgentRegistryNotFoundError>> {
  const registryResult = await readAgentRegistry(variant, agentsDir);
  if (!registryResult.success) {
    return err(registryResult.error);
  }
  
  const match = findAgentForEffectivity(registryResult.value, effectivityId);
  return ok(match);
}

/**
 * Get all effectivities covered by a registry
 */
export async function getRegistryCoverage(
  agentsDir: string,
  variant: string = 'default'
): Promise<Result<string[], AgentRegistryNotFoundError>> {
  const registryResult = await readAgentRegistry(variant, agentsDir);
  if (!registryResult.success) {
    return err(registryResult.error);
  }
  
  const effectivities = new Set<string>();
  for (const config of Object.values(registryResult.value.agents)) {
    for (const eff of config.effectivities) {
      effectivities.add(eff);
    }
  }
  
  return ok([...effectivities].sort());
}

/**
 * Agent registry index for display
 */
export interface AgentRegistryIndex {
  description: string;
  variants: Array<{
    variant: string;
    description?: string;
    agentCount: number;
    effectivityCount: number;
  }>;
}

export async function readAgentRegistryIndex(
  agentsDir: string
): Promise<Result<AgentRegistryIndex, AgentRegistryNotFoundError>> {
  const entries = await listAgentRegistries(agentsDir);
  
  if (entries.length === 0) {
    return err(new AgentRegistryNotFoundError('index'));
  }
  
  const variants: AgentRegistryIndex['variants'] = [];
  
  for (const entry of entries) {
    const result = await readAgentRegistry(entry.variant, agentsDir);
    if (result.success) {
      const effectivitySet = new Set<string>();
      for (const config of Object.values(result.value.agents)) {
        for (const eff of config.effectivities) {
          effectivitySet.add(eff);
        }
      }
      
      const variantEntry: AgentRegistryIndex['variants'][number] = {
        variant: entry.variant,
        agentCount: Object.keys(result.value.agents).length,
        effectivityCount: effectivitySet.size,
      };
      if (result.value.description) {
        variantEntry.description = result.value.description;
      }
      variants.push(variantEntry);
    }
  }
  
  const index: AgentRegistryIndex = {
    description: 'Agent registries map effectivities to sub-agent configurations for delegation.',
    variants,
  };
  
  logInfo('Agent registry index built', { variantCount: variants.length });
  return ok(index);
}
