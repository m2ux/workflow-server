import { z } from 'zod';

export const RulesSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.string().optional(),
  rules: z.array(z.string()).optional(),
}).passthrough();

export const RulesSchema = z.object({
  id: z.string(),
  version: z.string(),
  title: z.string(),
  description: z.string(),
  precedence: z.string(),
  sections: z.array(RulesSectionSchema),
});

export type RulesSection = z.infer<typeof RulesSectionSchema> & {
  content?: string;
  [key: string]: unknown;
};

export type Rules = z.infer<typeof RulesSchema>;
