import { useProjectStore } from '../../stores/project-store';
import type { EffectInstance } from '../../core/models/effects';
import { getEffectManager } from '../../hooks/use-effects';

interface EffectParameterEditorProps {
  trackId: string;
  effect: EffectInstance;
}

export function EffectParameterEditor({ trackId, effect }: EffectParameterEditorProps): React.JSX.Element {
  const { updateEffectParameter } = useProjectStore();
  const manager = getEffectManager();

  // Get live parameters from the audio engine instance (has correct ranges)
  const effects = manager?.getEffects(trackId) ?? [];
  const trackEffects = useProjectStore((s) =>
    s.project.tracks.find((t) => t.id === trackId)?.effects ?? []
  );
  const effectIndex = trackEffects.findIndex((e) => e.id === effect.id);
  const audioInstance = effectIndex >= 0 ? effects[effectIndex] : null;
  const liveParams = audioInstance?.getParameters() ?? [];

  // Use live params for ranges, store params for values
  const params = liveParams.map((lp) => {
    const storeParam = effect.parameters.find((p) => p.name === lp.name);
    return {
      ...lp,
      value: storeParam?.value ?? lp.value,
    };
  });

  if (params.length === 0) {
    return (
      <div className="px-1 py-1 text-[8px] text-rach-text-muted italic">
        No parameters
      </div>
    );
  }

  return (
    <div className="px-1 py-1 space-y-1 bg-rach-bg/50 rounded-b">
      {params.map((param) => (
        <div key={param.name} className="flex items-center gap-1">
          <label className="text-[8px] text-rach-text-muted w-14 truncate" title={param.name}>
            {param.name}
          </label>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={param.value}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateEffectParameter(trackId, effect.id, param.name, val);
            }}
            className="flex-1 h-1.5 cursor-pointer"
          />
          <span className="text-[8px] text-rach-text-muted w-10 text-right tabular-nums">
            {param.value.toFixed(param.step < 0.01 ? 3 : param.step < 1 ? 1 : 0)}
            {param.unit ? ` ${param.unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}
