/**
 * Template adapter — exposes Rach's genre template library to the MCP server.
 */

import { ALL_TEMPLATES, searchTemplates } from '../src/core/templates/template-registry';
import type { TemplateCategory, ProjectTemplate } from '../src/core/templates/template-types';

export function listTemplates(
  category?: string,
  query?: string,
): Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  bars: number;
}> {
  const results = searchTemplates(query, category as TemplateCategory | undefined);
  return results.map(t => ({
    id: t.metadata.id,
    name: t.metadata.name,
    description: t.metadata.description,
    category: t.metadata.category,
    difficulty: t.metadata.difficulty,
    tags: t.metadata.tags,
    bars: t.metadata.bars,
  }));
}

export function loadTemplate(templateId: string): ProjectTemplate | null {
  return ALL_TEMPLATES.find(t => t.metadata.id === templateId) || null;
}
