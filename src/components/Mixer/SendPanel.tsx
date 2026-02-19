import { Plus, X } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import type { Track } from '../../core/models';
import type { Send } from '../../core/models/send';

interface SendPanelProps {
  track: Track;
}

export function SendPanel({ track }: SendPanelProps): React.JSX.Element {
  const { project, addSend, removeSend, updateSend } = useProjectStore();
  const sends = track.sends ?? [];
  const busTracks = project.tracks.filter((t) => t.type === 'bus' && t.id !== track.id);

  const handleAddSend = () => {
    if (busTracks.length === 0) return;
    const send: Send = {
      id: crypto.randomUUID(),
      targetBusId: busTracks[0].id,
      gain: -6,
      preFader: false,
      enabled: true,
    };
    addSend(track.id, send);
  };

  return (
    <div className="w-full">
      {sends.map((send) => {
        return (
          <div key={send.id} className="flex items-center gap-0.5 px-0.5 py-0.5 text-[8px]">
            <select
              value={send.targetBusId}
              onChange={(e) => updateSend(track.id, send.id, { targetBusId: e.target.value })}
              className="flex-1 bg-rach-bg border border-rach-border rounded text-[8px] px-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {busTracks.map((bt) => (
                <option key={bt.id} value={bt.id}>{bt.name}</option>
              ))}
            </select>
            <input
              type="range"
              min={-60}
              max={6}
              step={0.5}
              value={send.gain}
              onChange={(e) => updateSend(track.id, send.id, { gain: Number(e.target.value) })}
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-1"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateSend(track.id, send.id, { preFader: !send.preFader });
              }}
              className={`text-[7px] px-0.5 rounded ${send.preFader ? 'text-rach-accent' : 'text-rach-text-muted'}`}
              title={send.preFader ? 'Pre-fader' : 'Post-fader'}
            >
              {send.preFader ? 'Pre' : 'Post'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeSend(track.id, send.id); }}
              className="text-rach-text-muted hover:text-red-400"
            >
              <X size={7} />
            </button>
          </div>
        );
      })}

      {busTracks.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleAddSend(); }}
          className="flex items-center gap-0.5 text-[8px] text-rach-text-muted hover:text-rach-text px-0.5 py-0.5"
        >
          <Plus size={7} />
          Send
        </button>
      )}
    </div>
  );
}
