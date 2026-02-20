import { Music, Upload, X, AlertCircle } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useStemSeparation } from '../../hooks/use-stem-separation';
import { useProjectStore } from '../../stores/project-store';
import type { Track, Clip } from '../../core/models';

interface StemSeparationPanelProps {
  onClose: () => void;
}

export function StemSeparationPanel({ onClose }: StemSeparationPanelProps): React.JSX.Element {
  const { isProcessing, progress, results, error, separate, cancel, checkModel } =
    useStemSeparation();
  const { addTrack, addClip } = useProjectStore();
  const [audioPath, setAudioPath] = useState('');
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'high'>('balanced');
  const [stemCount, setStemCount] = useState<4 | 2>(4);
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    checkModel().then(setModelAvailable);
  }, [checkModel]);

  const handleSelectFile = useCallback(async () => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;
    const result = (await ipc.invoke('file:openAudio')) as {
      path: string;
    } | null;
    if (result) setAudioPath(result.path);
  }, []);

  const handleSeparate = useCallback(() => {
    if (!audioPath) return;
    setImported(false);
    separate(audioPath, { quality, stems: stemCount });
  }, [audioPath, quality, stemCount, separate]);

  const handleImportStems = useCallback(() => {
    if (!results) return;

    const colors: Array<Track['color']> = ['red', 'green', 'blue', 'purple'];
    results.forEach((stem, i) => {
      const trackId = crypto.randomUUID();
      const track: Track = {
        id: trackId,
        name: stem.name.charAt(0).toUpperCase() + stem.name.slice(1),
        type: 'audio',
        color: colors[i % colors.length],
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
        name: stem.name,
        type: 'audio',
        trackId,
        startBeat: 0,
        durationBeats: 16,
        loopEnabled: false,
        loopLengthBeats: 16,
        fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
        color: '#3b82f6',
        audioData: {
          fileId: stem.path,
          sampleRate: 44100,
          channels: 2,
          startOffset: 0,
          gain: 0,
          pitch: 0,
        },
      };
      addClip(trackId, clip);
    });

    setImported(true);
  }, [results, addTrack, addClip]);

  return (
    <div className="border border-rach-border rounded bg-rach-surface p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Music size={12} className="text-rach-accent" />
          <span className="text-xs font-medium text-rach-text">Stem Separation</span>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-rach-surface-light text-rach-text-muted"
        >
          <X size={12} />
        </button>
      </div>

      {modelAvailable === false && (
        <div className="flex items-start gap-1.5 text-[10px] text-yellow-500/80 bg-yellow-500/5 rounded px-2 py-1.5 mb-2">
          <AlertCircle size={10} className="mt-0.5 shrink-0" />
          <span>
            Demucs model not found. Run <code className="bg-rach-bg px-1 rounded">pnpm run download-models</code> to download.
          </span>
        </div>
      )}

      {/* File selection */}
      <div className="mb-2">
        <button
          onClick={handleSelectFile}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-rach-border rounded text-[10px] text-rach-text-muted hover:border-rach-accent hover:text-rach-accent disabled:opacity-40 transition-colors"
        >
          <Upload size={10} />
          {audioPath ? audioPath.split(/[/\\]/).pop() : 'Select audio file'}
        </button>
      </div>

      {/* Options */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <label className="text-[9px] text-rach-text-muted block mb-0.5">Quality</label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as 'fast' | 'balanced' | 'high')}
            disabled={isProcessing}
            className="w-full bg-rach-bg border border-rach-border rounded px-1.5 py-1 text-[10px] text-rach-text"
          >
            <option value="fast">Fast</option>
            <option value="balanced">Balanced</option>
            <option value="high">High Quality</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[9px] text-rach-text-muted block mb-0.5">Stems</label>
          <select
            value={stemCount}
            onChange={(e) => setStemCount(Number(e.target.value) as 4 | 2)}
            disabled={isProcessing}
            className="w-full bg-rach-bg border border-rach-border rounded px-1.5 py-1 text-[10px] text-rach-text"
          >
            <option value={4}>4-Stem</option>
            <option value={2}>2-Stem</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      {progress && isProcessing && (
        <div className="mb-2">
          <div className="flex justify-between text-[9px] text-rach-text-muted mb-0.5">
            <span>{progress.stage}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-rach-bg rounded overflow-hidden">
            <div
              className="h-full bg-rach-accent transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-[10px] text-red-400 bg-red-500/5 rounded px-2 py-1 mb-2">
          {error}
        </div>
      )}

      {/* Results */}
      {results && !isProcessing && (
        <div className="mb-2">
          <div className="text-[10px] text-rach-text-muted mb-1">Separated stems:</div>
          {results.map((stem) => (
            <div
              key={stem.name}
              className="flex items-center gap-1.5 text-[10px] text-rach-text py-0.5"
            >
              <Music size={8} className="text-rach-accent" />
              {stem.name}
            </div>
          ))}
          {!imported && (
            <button
              onClick={handleImportStems}
              className="w-full mt-1 py-1 rounded text-[10px] bg-rach-accent/10 text-rach-accent hover:bg-rach-accent/20 transition-colors"
            >
              Import as tracks
            </button>
          )}
          {imported && (
            <div className="text-[10px] text-green-400/80 mt-1">
              Stems imported as tracks
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={handleSeparate}
          disabled={!audioPath || isProcessing || modelAvailable === false}
          className="flex-1 py-1.5 rounded text-[10px] font-medium bg-rach-accent text-white hover:bg-rach-accent/90 disabled:opacity-40 transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Separate'}
        </button>
        {isProcessing && (
          <button
            onClick={cancel}
            className="px-3 py-1.5 rounded text-[10px] border border-rach-border text-rach-text-muted hover:text-rach-text transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
