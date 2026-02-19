import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Power } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { ALL_EFFECT_TYPES, EFFECT_LABELS, EFFECT_CATEGORIES } from '../../core/effects/effect-factory';
import type { EffectType, EffectInstance } from '../../core/models/effects';
import { EffectParameterEditor } from './EffectParameterEditor';
import type { EffectCategory } from '../../core/effects/effect-interface';

interface EffectRackProps {
  trackId: string;
  effects: EffectInstance[];
}

function createEffectInstance(type: EffectType): EffectInstance {
  return {
    id: crypto.randomUUID(),
    type,
    name: EFFECT_LABELS[type] ?? type,
    enabled: true,
    parameters: [],
    presets: [],
  };
}

const CATEGORY_LABELS: Record<EffectCategory, string> = {
  dynamics: 'Dynamics',
  'eq-filter': 'EQ & Filters',
  'time-based': 'Time-Based',
  creative: 'Creative',
};

export function EffectRack({ trackId, effects }: EffectRackProps): React.JSX.Element {
  const { addEffect, removeEffect, updateEffect, reorderEffects } = useProjectStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingEffectId, setEditingEffectId] = useState<string | null>(null);

  const handleAddEffect = (type: EffectType) => {
    const effect = createEffectInstance(type);
    addEffect(trackId, effect);
    setShowAddMenu(false);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const ids = effects.map((e) => e.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderEffects(trackId, ids);
  };

  const handleMoveDown = (index: number) => {
    if (index >= effects.length - 1) return;
    const ids = effects.map((e) => e.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderEffects(trackId, ids);
  };

  // Group effects by category for the add menu
  const grouped = ALL_EFFECT_TYPES.reduce(
    (acc, type) => {
      const cat = EFFECT_CATEGORIES[type] ?? 'creative';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(type);
      return acc;
    },
    {} as Record<string, EffectType[]>
  );

  return (
    <div className="w-full">
      {/* Effect list */}
      <div className="space-y-0.5">
        {effects.map((effect, index) => (
          <div key={effect.id}>
            <div
              className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                effect.enabled ? 'bg-rach-surface-light text-rach-text' : 'bg-rach-bg text-rach-text-muted'
              } ${editingEffectId === effect.id ? 'ring-1 ring-rach-accent' : ''}`}
              onClick={() => setEditingEffectId(editingEffectId === effect.id ? null : effect.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateEffect(trackId, effect.id, { enabled: !effect.enabled });
                }}
                className={`shrink-0 ${effect.enabled ? 'text-green-400' : 'text-rach-text-muted'}`}
                title={effect.enabled ? 'Disable' : 'Enable'}
              >
                <Power size={8} />
              </button>
              <span className="flex-1 truncate">{effect.name}</span>
              <div className="flex shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                  className="text-rach-text-muted hover:text-rach-text"
                  title="Move up"
                >
                  <ChevronUp size={8} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                  className="text-rach-text-muted hover:text-rach-text"
                  title="Move down"
                >
                  <ChevronDown size={8} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeEffect(trackId, effect.id); }}
                  className="text-rach-text-muted hover:text-red-400"
                  title="Remove"
                >
                  <X size={8} />
                </button>
              </div>
            </div>
            {editingEffectId === effect.id && (
              <EffectParameterEditor trackId={trackId} effect={effect} />
            )}
          </div>
        ))}
      </div>

      {/* Add effect button */}
      <div className="relative mt-1">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-0.5 text-[9px] text-rach-text-muted hover:text-rach-text px-1 py-0.5"
        >
          <Plus size={8} />
          Add Effect
        </button>

        {showAddMenu && (
          <div className="absolute bottom-full left-0 mb-1 bg-rach-surface border border-rach-border rounded shadow-lg z-50 max-h-48 overflow-y-auto w-40">
            {(Object.keys(grouped) as EffectCategory[]).map((cat) => (
              <div key={cat}>
                <div className="text-[8px] text-rach-text-muted px-2 pt-1.5 pb-0.5 uppercase font-bold sticky top-0 bg-rach-surface">
                  {CATEGORY_LABELS[cat]}
                </div>
                {grouped[cat].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAddEffect(type)}
                    className="block w-full text-left text-[9px] px-2 py-0.5 text-rach-text hover:bg-rach-surface-light"
                  >
                    {EFFECT_LABELS[type]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
