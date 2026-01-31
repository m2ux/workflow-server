import { z } from 'zod';

/**
 * Priority levels for rule sections
 */
export const RulePrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type RulePriority = z.infer<typeof RulePrioritySchema>;

/**
 * Context subsection - named groups of related items
 */
export const RuleContextSchema = z.record(z.array(z.string()));
export type RuleContext = z.infer<typeof RuleContextSchema>;

/**
 * A single rule section with consistent structure
 */
export const RuleSectionSchema = z.object({
  id: z.string().describe('Unique identifier for this section'),
  title: z.string().describe('Human-readable section title'),
  priority: RulePrioritySchema.describe('Importance level: critical > high > medium > low'),
  description: z.string().optional().describe('Optional description of section purpose'),
  rules: z.array(z.string()).optional().describe('Imperative guidance rules'),
  context: RuleContextSchema.optional().describe('Named subsections with additional context'),
}).passthrough();

export type RuleSection = z.infer<typeof RuleSectionSchema>;

/**
 * Complete rules document
 */
export const RulesSchema = z.object({
  id: z.string().describe('Rules document identifier'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).describe('Semantic version'),
  title: z.string().describe('Document title'),
  description: z.string().describe('Document description'),
  precedence: z.string().optional().describe('Precedence rules for conflicts'),
  sections: z.array(RuleSectionSchema).describe('Rule sections'),
});

export type Rules = z.infer<typeof RulesSchema>;

/**
 * Validate rules data
 */
export function validateRules(data: unknown): Rules {
  return RulesSchema.parse(data);
}

/**
 * Safely validate rules data
 */
export function safeValidateRules(data: unknown) {
  return RulesSchema.safeParse(data);
}

/**
 * Get sections by priority
 */
export function getSectionsByPriority(rules: Rules, priority: RulePriority): RuleSection[] {
  return rules.sections.filter(s => s.priority === priority);
}

/**
 * Get a specific section by ID
 */
export function getSection(rules: Rules, sectionId: string): RuleSection | undefined {
  return rules.sections.find(s => s.id === sectionId);
}

/**
 * Get all rules from all sections as a flat list
 */
export function getAllRules(rules: Rules): { sectionId: string; rule: string }[] {
  const result: { sectionId: string; rule: string }[] = [];
  for (const section of rules.sections) {
    if (section.rules) {
      for (const rule of section.rules) {
        result.push({ sectionId: section.id, rule });
      }
    }
  }
  return result;
}
