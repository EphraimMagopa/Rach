import { useState, useMemo, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { useUIStore } from '../../stores/ui-store';
import { useProjectStore } from '../../stores/project-store';
import { searchTemplates, TEMPLATE_CATEGORIES } from '../../core/templates/template-registry';
import { CATEGORY_LABELS } from '../../core/templates/template-types';
import type { ProjectTemplate, TemplateCategory, TemplateDifficulty } from '../../core/templates/template-types';
import { hydrateTemplate } from '../../core/templates/template-hydration';
import { TemplateCard } from './TemplateCard';
import { TemplateDetail } from './TemplateDetail';

export function TemplateBrowser(): React.JSX.Element {
  const setTemplateBrowserOpen = useUIStore((s) => s.setTemplateBrowserOpen);
  const setProject = useProjectStore((s) => s.setProject);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<TemplateDifficulty | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const results = useMemo(
    () =>
      searchTemplates(
        query || undefined,
        selectedCategory ?? undefined,
        selectedDifficulty ?? undefined,
      ),
    [query, selectedCategory, selectedDifficulty],
  );

  const handleCreateProject = useCallback(
    (tpl: ProjectTemplate) => {
      const project = hydrateTemplate(tpl.project);
      setProject(project);
      setTemplateBrowserOpen(false);
    },
    [setProject, setTemplateBrowserOpen],
  );

  const handleClose = useCallback(() => {
    setTemplateBrowserOpen(false);
  }, [setTemplateBrowserOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[900px] h-[600px] max-w-[95vw] max-h-[90vh] bg-rach-surface rounded-xl border border-rach-border shadow-2xl flex overflow-hidden">
        {/* Sidebar: categories */}
        <div className="w-48 shrink-0 border-r border-rach-border bg-rach-bg flex flex-col">
          <div className="p-3 border-b border-rach-border">
            <h2 className="text-sm font-semibold text-rach-text">Templates</h2>
            <p className="text-[10px] text-rach-text-muted mt-0.5">{results.length} templates</p>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                selectedCategory === null
                  ? 'bg-rach-accent/10 text-rach-accent'
                  : 'text-rach-text-muted hover:text-rach-text hover:bg-rach-surface'
              }`}
            >
              All Genres
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-rach-accent/10 text-rach-accent'
                    : 'text-rach-text-muted hover:text-rach-text hover:bg-rach-surface'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="p-3 border-t border-rach-border">
            <div className="text-[10px] text-rach-text-muted uppercase tracking-wider mb-1">Difficulty</div>
            <div className="flex flex-wrap gap-1">
              {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d === selectedDifficulty ? null : d)}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                    selectedDifficulty === d
                      ? 'bg-rach-accent/20 text-rach-accent'
                      : 'bg-rach-bg text-rach-text-muted hover:text-rach-text'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search bar */}
          <div className="flex items-center gap-2 p-3 border-b border-rach-border">
            <Search size={14} className="text-rach-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-rach-text placeholder:text-rach-text-muted focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleClose}
              className="p-1 rounded text-rach-text-muted hover:text-rach-text hover:bg-rach-surface-light transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {results.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-rach-text-muted">
                  No templates match your search
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {results.map((tpl) => (
                    <TemplateCard
                      key={tpl.metadata.id}
                      template={tpl}
                      isSelected={selectedTemplate?.metadata.id === tpl.metadata.id}
                      onSelect={setSelectedTemplate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detail pane */}
            {selectedTemplate && (
              <div className="w-64 shrink-0 border-l border-rach-border">
                <TemplateDetail
                  template={selectedTemplate}
                  onCreateProject={handleCreateProject}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
