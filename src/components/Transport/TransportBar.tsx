import {
  Play,
  Square,
  Circle,
  SkipBack,
  Repeat
} from 'lucide-react'
import { useTransportStore } from '@/stores/transport-store'

function formatTime(beats: number, tempo: number): string {
  const totalSeconds = (beats / tempo) * 60
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const ms = Math.floor((totalSeconds % 1) * 100)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
}

function formatBeats(beats: number, timeSignature: [number, number]): string {
  const bar = Math.floor(beats / timeSignature[0]) + 1
  const beat = Math.floor(beats % timeSignature[0]) + 1
  const tick = Math.floor((beats % 1) * 100)
  return `${bar}.${beat}.${String(tick).padStart(2, '0')}`
}

export function TransportBar(): React.JSX.Element {
  const {
    isPlaying,
    isRecording,
    playheadBeats,
    tempo,
    timeSignature,
    loopEnabled,
    metronomeEnabled,
    play,
    pause,
    stop,
    toggleRecord,
    setTempo,
    toggleLoop,
    toggleMetronome
  } = useTransportStore()

  return (
    <div className="h-12 bg-rach-surface border-b border-rach-border flex items-center px-4 gap-2 shrink-0">
      {/* Transport controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={stop}
          className="p-1.5 rounded hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text transition-colors"
          title="Return to start"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          className={`p-1.5 rounded transition-colors ${
            isPlaying
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Square size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={toggleRecord}
          className={`p-1.5 rounded transition-colors ${
            isRecording
              ? 'bg-red-500/20 text-red-500 animate-pulse'
              : 'hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text'
          }`}
          title="Record"
        >
          <Circle size={16} fill={isRecording ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-rach-border mx-2" />

      {/* Time display */}
      <div className="flex items-center gap-4 font-mono text-sm">
        <div className="text-rach-text tabular-nums" title="Bars.Beats.Ticks">
          {formatBeats(playheadBeats, timeSignature)}
        </div>
        <div className="text-rach-text-muted tabular-nums" title="Time">
          {formatTime(playheadBeats, tempo)}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-rach-border mx-2" />

      {/* Tempo */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-rach-text-muted">BPM</label>
        <input
          type="number"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          min={20}
          max={300}
          className="w-14 bg-rach-bg border border-rach-border rounded px-1.5 py-0.5 text-sm text-rach-text text-center focus:outline-none focus:border-rach-accent"
        />
      </div>

      {/* Time signature */}
      <div className="text-xs text-rach-text-muted">
        {timeSignature[0]}/{timeSignature[1]}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Loop & Metronome */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLoop}
          className={`p-1.5 rounded transition-colors ${
            loopEnabled
              ? 'bg-rach-secondary/20 text-rach-secondary'
              : 'hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text'
          }`}
          title="Loop"
        >
          <Repeat size={16} />
        </button>

        <button
          onClick={toggleMetronome}
          className={`p-1.5 rounded text-xs font-bold transition-colors ${
            metronomeEnabled
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'hover:bg-rach-surface-light text-rach-text-muted hover:text-rach-text'
          }`}
          title="Metronome"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L8 22h8L12 2z" />
            <path d="M12 8l4-4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
