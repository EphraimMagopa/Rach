import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import type { AutomationLane } from '../../core/models/automation';

interface AutomationLaneHeaderProps {
  lane: AutomationLane;
  trackId: string;
}

export function AutomationLaneHeader({ lane, trackId }: AutomationLaneHeaderProps): React.JSX.Element {
  const { removeAutomationLane, updateTrack } = useProjectStore();
  const track = useProjectStore((s) => s.project.tracks.find((t) => t.id === trackId));

  const toggleEnabled = () => {
    if (!track) return;
    const updatedLanes = track.automationLanes.map((l) =>
      l.id === lane.id ? { ...l, enabled: !l.enabled } : l
    );
    updateTrack(trackId, { automationLanes: updatedLanes });
  };

  return (
    <div className="h-12 border-b border-rach-border flex items-center px-2 gap-1 bg-rach-surface/50">
      <div className="w-1 h-8 rounded-full bg-rach-accent/50 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-rach-accent truncate">{lane.parameter}</div>
        <div className="text-[8px] text-rach-text-muted">{lane.points.length} pts</div>
      </div>

      <button
        onClick={toggleEnabled}
        className={`w-5 h-4 flex items-center justify-center rounded text-[9px] transition-colors ${
          lane.enabled ? 'text-rach-accent' : 'text-rach-text-muted'
        }`}
        title={lane.enabled ? 'Disable' : 'Enable'}
      >
        {lane.enabled ? <Eye size={9} /> : <EyeOff size={9} />}
      </button>

      <button
        onClick={() => removeAutomationLane(trackId, lane.id)}
        className="w-5 h-4 flex items-center justify-center rounded text-rach-text-muted hover:text-red-400"
        title="Delete lane"
      >
        <Trash2 size={9} />
      </button>
    </div>
  );
}
