import { Download, Link, X, Music } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { backendClient } from '../../services/backend-client';
import type { Track, Clip } from '../../core/models';

interface SunoImportDialogProps {
  onClose: () => void;
  onStemSeparate?: (audioPath: string) => void;
}

export function SunoImportDialog({ onClose, onStemSeparate }: SunoImportDialogProps): React.JSX.Element {
  const { addTrack, addClip } = useProjectStore();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<{ audioPath: string; title: string } | null>(null);

  const handleImport = useCallback(async () => {
    if (!url.trim()) return;

    setIsImporting(true);
    setError(null);

    const result = await backendClient.importSuno(url.trim());

    setIsImporting(false);

    if (result.success && result.audioPath && result.metadata) {
      // Create audio track with the imported file
      const trackId = crypto.randomUUID();
      const track: Track = {
        id: trackId,
        name: result.metadata.title || 'Suno Import',
        type: 'audio',
        color: 'orange',
        volume: 0,
        pan: 0,
        muted: false,
        soloed: false,
        armed: false,
        height: 80,
        clips: [],
        effects: [],
        automationLanes: [],
        input: { type: 'virtual' },
        output: { type: 'master' },
      };
      addTrack(track);

      const clip: Clip = {
        id: crypto.randomUUID(),
        name: result.metadata.title || 'Suno Import',
        type: 'audio',
        trackId,
        startBeat: 0,
        durationBeats: 32,
        loopEnabled: false,
        loopLengthBeats: 32,
        fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
        color: '#f97316',
        audioData: {
          fileId: result.audioPath,
          sampleRate: 44100,
          channels: 2,
          startOffset: 0,
          gain: 0,
          pitch: 0,
        },
      };
      addClip(trackId, clip);

      setImported({ audioPath: result.audioPath, title: result.metadata.title });
    } else {
      setError(result.error || 'Import failed');
    }
  }, [url, addTrack, addClip]);

  return (
    <div className="border border-rach-border rounded bg-rach-surface p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Download size={12} className="text-rach-accent" />
          <span className="text-xs font-medium text-rach-text">Import from Suno</span>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-rach-surface-light text-rach-text-muted"
        >
          <X size={12} />
        </button>
      </div>

      {/* URL input */}
      <div className="mb-2">
        <div className="flex items-center gap-1 bg-rach-bg rounded border border-rach-border focus-within:border-rach-accent">
          <Link size={10} className="ml-2 text-rach-text-muted" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            placeholder="Paste Suno URL..."
            disabled={isImporting}
            className="flex-1 bg-transparent px-1.5 py-1.5 text-[10px] text-rach-text placeholder:text-rach-text-muted/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-[10px] text-red-400 bg-red-500/5 rounded px-2 py-1 mb-2">
          {error}
        </div>
      )}

      {/* Success */}
      {imported && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-[10px] text-green-400/80 bg-green-500/5 rounded px-2 py-1.5">
            <Music size={10} />
            Imported "{imported.title}" as audio track
          </div>
          {onStemSeparate && (
            <button
              onClick={() => onStemSeparate(imported.audioPath)}
              className="w-full mt-1 py-1 rounded text-[10px] bg-rach-accent/10 text-rach-accent hover:bg-rach-accent/20 transition-colors"
            >
              Stem separate this track
            </button>
          )}
        </div>
      )}

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={!url.trim() || isImporting}
        className="w-full py-1.5 rounded text-[10px] font-medium bg-rach-accent text-white hover:bg-rach-accent/90 disabled:opacity-40 transition-colors"
      >
        {isImporting ? 'Importing...' : 'Import'}
      </button>
    </div>
  );
}
