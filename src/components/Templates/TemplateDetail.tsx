import type { ProjectTemplate } from '../../core/templates/template-types';
import { CATEGORY_LABELS } from '../../core/templates/template-types';

interface TemplateDetailProps {
  template: ProjectTemplate;
  onCreateProject: (template: ProjectTemplate) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-green-400',
  intermediate: 'text-yellow-400',
  advanced: 'text-red-400',
};

export function TemplateDetail({ template: tpl, onCreateProject }: TemplateDetailProps): React.JSX.Element {
  const { metadata, project } = tpl;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-rach-border">
        <h2 className="text-lg font-semibold text-rach-text mb-1">{metadata.name}</h2>
        <div className="flex items-center gap-2 text-xs text-rach-text-muted mb-2">
          <span className="px-2 py-0.5 rounded bg-rach-bg">{CATEGORY_LABELS[metadata.category]}</span>
          <span className={DIFFICULTY_COLORS[metadata.difficulty]}>{metadata.difficulty}</span>
        </div>
        <p className="text-sm text-rach-text-muted">{metadata.description}</p>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-rach-bg rounded p-2 text-center">
            <div className="text-lg font-semibold text-rach-text">{project.tempo}</div>
            <div className="text-[10px] text-rach-text-muted">BPM</div>
          </div>
          <div className="bg-rach-bg rounded p-2 text-center">
            <div className="text-lg font-semibold text-rach-text">{metadata.bars}</div>
            <div className="text-[10px] text-rach-text-muted">Bars</div>
          </div>
          <div className="bg-rach-bg rounded p-2 text-center">
            <div className="text-lg font-semibold text-rach-text">
              {project.timeSignature.numerator}/{project.timeSignature.denominator}
            </div>
            <div className="text-[10px] text-rach-text-muted">Time Sig</div>
          </div>
        </div>

        {/* Tracks */}
        <div>
          <h3 className="text-xs font-semibold text-rach-text-muted uppercase tracking-wider mb-2">
            Tracks ({project.tracks.length})
          </h3>
          <div className="space-y-1">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-2 bg-rach-bg rounded px-2 py-1"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--tw-${track.color}, #3b82f6)` }} />
                <span className="text-xs text-rach-text flex-1 truncate">{track.name}</span>
                <span className="text-[10px] text-rach-text-muted">{track.type}</span>
                {track.instrumentType && (
                  <span className="text-[10px] text-rach-accent">{track.instrumentType}</span>
                )}
                {track.clips.length > 0 && (
                  <span className="text-[10px] text-rach-text-muted">
                    {track.clips.length} clip{track.clips.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {project.sections.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-rach-text-muted uppercase tracking-wider mb-2">
              Sections ({project.sections.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {project.sections.map((sec) => (
                <span
                  key={sec.id}
                  className="text-[10px] px-2 py-0.5 rounded bg-rach-bg text-rach-text"
                  style={{ borderLeft: `3px solid ${sec.color}` }}
                >
                  {sec.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {metadata.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-rach-text-muted uppercase tracking-wider mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-rach-accent/10 text-rach-accent">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="p-4 border-t border-rach-border">
        <button
          onClick={() => onCreateProject(tpl)}
          className="w-full py-2 rounded-lg bg-rach-accent text-white font-medium text-sm hover:bg-rach-accent/80 transition-colors"
        >
          Create Project
        </button>
      </div>
    </div>
  );
}
