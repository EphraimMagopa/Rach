interface PluginParameter {
  id: number;
  name: string;
  value: number;
  min: number;
  max: number;
}

interface PluginParameterViewProps {
  pluginName: string;
  parameters: PluginParameter[];
  onParameterChange: (paramId: number, value: number) => void;
}

export function PluginParameterView({
  pluginName,
  parameters,
  onParameterChange,
}: PluginParameterViewProps): React.JSX.Element {
  return (
    <div className="p-2 bg-rach-surface">
      <div className="text-xs text-rach-text font-medium mb-2">{pluginName}</div>

      {parameters.length === 0 ? (
        <div className="text-[9px] text-rach-text-muted italic">No parameters available</div>
      ) : (
        <div className="space-y-1">
          {parameters.map((param) => (
            <div key={param.id} className="flex items-center gap-1">
              <label className="text-[8px] text-rach-text-muted w-20 truncate" title={param.name}>
                {param.name}
              </label>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={0.01}
                value={param.value}
                onChange={(e) => onParameterChange(param.id, Number(e.target.value))}
                className="flex-1 h-1.5 cursor-pointer"
              />
              <span className="text-[8px] text-rach-text-muted w-8 text-right tabular-nums">
                {param.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
