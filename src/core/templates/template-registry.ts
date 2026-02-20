import type { ProjectTemplate, TemplateCategory, TemplateDifficulty } from './template-types';
import { CATEGORY_LABELS } from './template-types';
import { classicalTemplates } from './genres/classical';
import { popTemplates } from './genres/pop';
import { rockTemplates } from './genres/rock';
import { edmTemplates } from './genres/edm';
import { hipHopTemplates } from './genres/hip-hop';
import { jazzTemplates } from './genres/jazz';
import { ambientTemplates } from './genres/ambient';
import { cinematicTemplates } from './genres/cinematic';
import { rAndBTemplates } from './genres/r-and-b';
import { loFiTemplates } from './genres/lo-fi';
import { otherTemplates } from './genres/other';

export const ALL_TEMPLATES: ProjectTemplate[] = [
  ...popTemplates,
  ...rockTemplates,
  ...edmTemplates,
  ...hipHopTemplates,
  ...jazzTemplates,
  ...classicalTemplates,
  ...rAndBTemplates,
  ...ambientTemplates,
  ...cinematicTemplates,
  ...loFiTemplates,
  ...otherTemplates,
];

/** All categories that have at least one template */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = Object.keys(CATEGORY_LABELS)
  .filter((cat) =>
    ALL_TEMPLATES.some((t) => t.metadata.category === cat)
  ) as TemplateCategory[];

/** Search templates by query, category, and difficulty */
export function searchTemplates(
  query?: string,
  category?: TemplateCategory,
  difficulty?: TemplateDifficulty,
): ProjectTemplate[] {
  let results = ALL_TEMPLATES;

  if (category) {
    results = results.filter((t) => t.metadata.category === category);
  }

  if (difficulty) {
    results = results.filter((t) => t.metadata.difficulty === difficulty);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (t) =>
        t.metadata.name.toLowerCase().includes(q) ||
        t.metadata.description.toLowerCase().includes(q) ||
        t.metadata.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  return results;
}
