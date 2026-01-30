import { describe, it, expect } from 'vitest';
import {
  validateRules,
  safeValidateRules,
  getSectionsByPriority,
  getSection,
  getAllRules,
  type Rules,
} from '../src/schema/rules.schema.js';

describe('rules-schema', () => {
  describe('validateRules', () => {
    it('should validate minimal rules document', () => {
      const data = {
        id: 'test-rules',
        version: '1.0.0',
        title: 'Test Rules',
        description: 'Test description',
        sections: [],
      };
      
      const result = safeValidateRules(data);
      expect(result.success).toBe(true);
    });

    it('should validate rules with sections', () => {
      const data = {
        id: 'test-rules',
        version: '1.0.0',
        title: 'Test Rules',
        description: 'Test description',
        sections: [
          {
            id: 'test-section',
            title: 'Test Section',
            priority: 'critical',
            rules: ['Rule 1', 'Rule 2'],
          },
        ],
      };
      
      const result = safeValidateRules(data);
      expect(result.success).toBe(true);
    });

    it('should validate rules with context subsections', () => {
      const data = {
        id: 'test-rules',
        version: '1.0.0',
        title: 'Test Rules',
        description: 'Test description',
        sections: [
          {
            id: 'test-section',
            title: 'Test Section',
            priority: 'high',
            rules: ['Main rule'],
            context: {
              topic_a: ['Context item 1', 'Context item 2'],
              topic_b: ['Another item'],
            },
          },
        ],
      };
      
      const result = safeValidateRules(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid priority', () => {
      const data = {
        id: 'test-rules',
        version: '1.0.0',
        title: 'Test Rules',
        description: 'Test description',
        sections: [
          {
            id: 'test-section',
            title: 'Test Section',
            priority: 'invalid',
          },
        ],
      };
      
      const result = safeValidateRules(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid version format', () => {
      const data = {
        id: 'test-rules',
        version: 'invalid',
        title: 'Test Rules',
        description: 'Test description',
        sections: [],
      };
      
      const result = safeValidateRules(data);
      expect(result.success).toBe(false);
    });
  });

  describe('helper functions', () => {
    const testRules: Rules = {
      id: 'test-rules',
      version: '1.0.0',
      title: 'Test Rules',
      description: 'Test description',
      sections: [
        {
          id: 'critical-section',
          title: 'Critical Section',
          priority: 'critical',
          rules: ['Critical rule 1', 'Critical rule 2'],
        },
        {
          id: 'high-section',
          title: 'High Section',
          priority: 'high',
          rules: ['High rule 1'],
        },
        {
          id: 'medium-section',
          title: 'Medium Section',
          priority: 'medium',
          rules: ['Medium rule 1'],
        },
      ],
    };

    it('getSectionsByPriority should filter by priority', () => {
      const critical = getSectionsByPriority(testRules, 'critical');
      expect(critical.length).toBe(1);
      expect(critical[0].id).toBe('critical-section');
    });

    it('getSection should find section by id', () => {
      const section = getSection(testRules, 'high-section');
      expect(section).toBeDefined();
      expect(section?.title).toBe('High Section');
    });

    it('getSection should return undefined for non-existent id', () => {
      const section = getSection(testRules, 'non-existent');
      expect(section).toBeUndefined();
    });

    it('getAllRules should flatten all rules', () => {
      const allRules = getAllRules(testRules);
      expect(allRules.length).toBe(4);
      expect(allRules[0]).toEqual({ sectionId: 'critical-section', rule: 'Critical rule 1' });
    });
  });
});
