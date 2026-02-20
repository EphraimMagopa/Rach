import type { Project } from '../models/project';

export type TemplateCategory =
  | 'pop'
  | 'rock'
  | 'jazz'
  | 'classical'
  | 'edm'
  | 'hip-hop'
  | 'r-and-b'
  | 'ambient'
  | 'cinematic'
  | 'lo-fi'
  | 'blues'
  | 'country'
  | 'latin'
  | 'funk'
  | 'folk'
  | 'world'
  | 'soul'
  | 'metal'
  | 'reggae';

export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
  bars: number;
}

export interface ProjectTemplate {
  metadata: TemplateMetadata;
  project: Project;
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  pop: 'Pop',
  rock: 'Rock',
  jazz: 'Jazz',
  classical: 'Classical',
  edm: 'EDM',
  'hip-hop': 'Hip-Hop',
  'r-and-b': 'R&B',
  ambient: 'Ambient',
  cinematic: 'Cinematic',
  'lo-fi': 'Lo-Fi',
  blues: 'Blues',
  country: 'Country',
  latin: 'Latin',
  funk: 'Funk',
  folk: 'Folk',
  world: 'World',
  soul: 'Soul',
  metal: 'Metal',
  reggae: 'Reggae',
};
