import { useProjectStore } from '../../stores/project-store';
import type { Track } from '../../core/models';

/**
 * Routing matrix — grid showing source tracks × destination buses.
 * Each cell shows send level. Click to add/remove sends.
 */
export function RoutingMatrix(): React.JSX.Element {
  const { project, addSend, removeSend } = useProjectStore();
  const sourceTracks = project.tracks.filter((t) => t.type !== 'bus');
  const busTracks = project.tracks.filter((t) => t.type === 'bus');

  if (busTracks.length === 0) {
    return (
      <div className="p-4 text-sm text-rach-text-muted text-center">
        No bus tracks. Add a bus track to use the routing matrix.
      </div>
    );
  }

  const getSend = (track: Track, busId: string) => {
    return (track.sends ?? []).find((s) => s.targetBusId === busId);
  };

  const toggleSend = (track: Track, busId: string) => {
    const existing = getSend(track, busId);
    if (existing) {
      removeSend(track.id, existing.id);
    } else {
      addSend(track.id, {
        id: crypto.randomUUID(),
        targetBusId: busId,
        gain: -6,
        preFader: false,
        enabled: true,
      });
    }
  };

  return (
    <div className="overflow-auto">
      <table className="text-[9px] border-collapse">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-rach-text-muted border border-rach-border">Source</th>
            {busTracks.map((bus) => (
              <th key={bus.id} className="px-2 py-1 text-center text-rach-text-muted border border-rach-border">
                {bus.name}
              </th>
            ))}
            <th className="px-2 py-1 text-center text-rach-text-muted border border-rach-border">Output</th>
          </tr>
        </thead>
        <tbody>
          {sourceTracks.map((track) => (
            <tr key={track.id}>
              <td className="px-2 py-1 text-rach-text border border-rach-border">{track.name}</td>
              {busTracks.map((bus) => {
                const send = getSend(track, bus.id);
                return (
                  <td
                    key={bus.id}
                    className="px-2 py-1 text-center border border-rach-border cursor-pointer hover:bg-rach-surface-light"
                    onClick={() => toggleSend(track, bus.id)}
                  >
                    {send ? (
                      <span className="text-rach-accent">
                        {send.gain <= -60 ? '-∞' : `${send.gain.toFixed(0)}`}
                      </span>
                    ) : (
                      <span className="text-rach-text-muted">—</span>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-1 text-center text-rach-text-muted border border-rach-border">
                {track.output.type === 'master' ? 'Master' : busTracks.find((b) => b.id === track.output.targetId)?.name ?? 'Master'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
