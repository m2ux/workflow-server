import { z } from 'zod';

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

/**
 * Effectivity ID naming convention:
 * - Base names use hyphens: code-review, test-review
 * - Extensions use underscore delimiter: code-review_rust, code-review_rust_substrate
 */
const EffectivityIdSchema = z.string().regex(
  /^[a-z][a-z0-9-]*(_[a-z][a-z0-9-]*)*$/,
  'Effectivity ID must use lowercase, hyphens for base names, underscores for extensions'
);

/**
 * Applicability defines when an effectivity can be used
 */
export const ApplicabilitySchema = z.object({
  project_types: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  description: z.string().optional(),
}).passthrough();
export type Applicability = z.infer<typeof ApplicabilitySchema>;

/**
 * Tool definition for effectivity execution
 */
export const EffectivityToolSchema = z.object({
  when: z.string().optional(),
  usage: z.string().optional(),
  params: z.string().optional(),
  returns: z.string().optional(),
}).passthrough();
export type EffectivityTool = z.infer<typeof EffectivityToolSchema>;

/**
 * Execution pattern for the effectivity
 */
export const EffectivityExecutionSchema = z.object({
  requires_resource: z.string().optional(),
  flow: z.array(z.string()).optional(),
  tools: z.record(EffectivityToolSchema).optional(),
}).passthrough();
export type EffectivityExecution = z.infer<typeof EffectivityExecutionSchema>;

/**
 * State tracking for effectivity execution
 */
export const EffectivityStateSchema = z.object({
  track: z.array(z.string()).optional(),
  initialize: z.string().optional(),
  update_on: z.record(z.string()).optional(),
}).passthrough();
export type EffectivityState = z.infer<typeof EffectivityStateSchema>;

/**
 * Error handling definitions
 */
export const EffectivityErrorSchema = z.object({
  cause: z.string().optional(),
  recovery: z.string().optional(),
}).passthrough();
export type EffectivityError = z.infer<typeof EffectivityErrorSchema>;

/**
 * Main Effectivity schema
 * 
 * Effectivities are workflow-agnostic agent capabilities that can be
 * matched to workflow step requirements. They define what an agent
 * can do, not how a workflow progresses.
 */
export const EffectivitySchema = z.object({
  // Required fields
  id: EffectivityIdSchema,
  name: z.string(),
  version: SemanticVersionSchema,
  
  // Description
  description: z.string().optional(),
  
  // Composition: includes other effectivities
  includes: z.array(EffectivityIdSchema).optional(),
  
  // When this effectivity applies
  applicability: ApplicabilitySchema.optional(),
  
  // How to execute this effectivity
  execution: EffectivityExecutionSchema.optional(),
  
  // State tracking
  state: EffectivityStateSchema.optional(),
  
  // Error definitions
  errors: z.record(EffectivityErrorSchema).optional(),
}).passthrough();

export type Effectivity = z.infer<typeof EffectivitySchema>;

/**
 * Resolved effectivity with all includes merged
 */
export interface ResolvedEffectivity extends Effectivity {
  /** All effectivities this one includes (flattened) */
  resolvedIncludes: string[];
}

// Validation functions
export function validateEffectivity(data: unknown): Effectivity {
  return EffectivitySchema.parse(data);
}

export function safeValidateEffectivity(data: unknown) {
  return EffectivitySchema.safeParse(data);
}

/**
 * Parse effectivity ID to extract base and extensions
 * e.g., "code-review_rust_substrate" -> { base: "code-review", extensions: ["rust", "substrate"] }
 */
export function parseEffectivityId(id: string): { base: string; extensions: string[] } {
  const parts = id.split('_');
  const base = parts[0] ?? id;
  return {
    base,
    extensions: parts.slice(1),
  };
}

/**
 * Check if one effectivity ID is an extension of another
 * e.g., "code-review_rust" extends "code-review"
 */
export function isExtensionOf(childId: string, parentId: string): boolean {
  if (childId === parentId) return false;
  return childId.startsWith(parentId + '_');
}
