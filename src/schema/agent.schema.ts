import { z } from 'zod';

/**
 * Agent model types
 * These correspond to available sub-agent models
 */
export const AgentModelSchema = z.enum(['fast', 'default', 'capable']);
export type AgentModel = z.infer<typeof AgentModelSchema>;

/**
 * Single agent configuration
 * Defines how to spawn a sub-agent for specific effectivities
 */
export const AgentConfigSchema = z.object({
  // Effectivities this agent can handle (exact match required)
  effectivities: z.array(z.string()).min(1),
  
  // Model to use for this agent
  model: AgentModelSchema.optional().default('fast'),
  
  // Instructions/prompt for the sub-agent
  instructions: z.string().optional(),
  
  // Tools available to this agent
  tools: z.array(z.string()).optional(),
  
  // Timeout in seconds (optional)
  timeout: z.number().positive().optional(),
  
  // Additional configuration
  config: z.record(z.unknown()).optional(),
}).passthrough();

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

/**
 * Agent registry: maps agent IDs to configurations
 */
export const AgentRegistrySchema = z.object({
  // Registry metadata
  version: z.string().optional(),
  description: z.string().optional(),
  
  // Agent configurations keyed by agent ID
  agents: z.record(AgentConfigSchema),
}).passthrough();

export type AgentRegistry = z.infer<typeof AgentRegistrySchema>;

// Validation functions
export function validateAgentConfig(data: unknown): AgentConfig {
  return AgentConfigSchema.parse(data);
}

export function safeValidateAgentConfig(data: unknown) {
  return AgentConfigSchema.safeParse(data);
}

export function validateAgentRegistry(data: unknown): AgentRegistry {
  return AgentRegistrySchema.parse(data);
}

export function safeValidateAgentRegistry(data: unknown) {
  return AgentRegistrySchema.safeParse(data);
}

/**
 * Find an agent that can handle a specific effectivity
 * Returns the first matching agent (exact match required)
 */
export function findAgentForEffectivity(
  registry: AgentRegistry,
  effectivityId: string
): { agentId: string; config: AgentConfig } | null {
  for (const [agentId, config] of Object.entries(registry.agents)) {
    if (config.effectivities.includes(effectivityId)) {
      return { agentId, config };
    }
  }
  return null;
}

/**
 * Find all agents that can handle any of the given effectivities
 */
export function findAgentsForEffectivities(
  registry: AgentRegistry,
  effectivityIds: string[]
): Map<string, { agentId: string; config: AgentConfig }> {
  const result = new Map<string, { agentId: string; config: AgentConfig }>();
  
  for (const effectivityId of effectivityIds) {
    const match = findAgentForEffectivity(registry, effectivityId);
    if (match) {
      result.set(effectivityId, match);
    }
  }
  
  return result;
}
