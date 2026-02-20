import React from 'react';
import type { ProjectTemplate } from '../../core/templates/template-types';
import { CATEGORY_LABELS } from '../../core/templates/template-types';

interface TemplateCardProps {
  template: ProjectTemplate;
  isSelected: boolean;
  onSelect: (template: ProjectTemplate) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-red-400 bg-red-400/10',
};

const TemplateCard = React.memo(function TemplateCard({
  template: tpl,
  isSelected,
  onSelect,
}: TemplateCardProps): React.JSX.Element {
  const { metadata, project } = tpl;
  const trackCount = project.tracks.length;

  return (
    <button
      onClick={() => onSelect(tpl)}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        isSelected
          ? 'border-rach-accent bg-rach-accent/10'
          : 'border-rach-border bg-rach-surface hover:bg-rach-surface-light'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-rach-text truncate">
          {metadata.name}
        </h3>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLORS[metadata.difficulty]}`}>
          {metadata.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-rach-text-muted">
        <span className="px-1.5 py-0.5 rounded bg-rach-bg">
          {CATEGORY_LABELS[metadata.category]}
        </span>
        <span>{project.tempo} BPM</span>
        <span>{metadata.bars} bars</span>
        <span>{trackCount} track{trackCount !== 1 ? 's' : ''}</span>
      </div>
    </button>
  );
});

export { TemplateCard };
