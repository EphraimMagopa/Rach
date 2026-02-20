import React from 'react';
import { ChevronDown, ChevronRight, Wrench, BarChart3, Music, Sliders, Waves, ListMusic, Layers, Clock } from 'lucide-react';
import { useState } from 'react';
import type { ToolExecution } from '../../core/models/mutations';

/** Strip the MCP prefix (e.g. "mcp__rach-daw__set_tempo" → "set_tempo") */
function normalizeToolName(name: string): string {
  return name.replace(/^mcp__rach-daw__/, '');
}

const TOOL_ICONS: Record<string, typeof Wrench> = {
  get_project: Layers,
  set_tempo: Clock,
  set_time_signature: Clock,
  list_templates: ListMusic,
  load_template: ListMusic,
  create_track: Music,
  list_tracks: ListMusic,
  add_midi_notes: Music,
  create_clip: Music,
  set_track_volume: Sliders,
  set_track_pan: Sliders,
  add_effect: Waves,
  create_section: Layers,
  analyze_mix: BarChart3,
  generate_chord_progression: Music,
  // Legacy tool names (pre-MCP)
  set_track_level: Sliders,
  apply_eq: BarChart3,
  apply_compression: Waves,
  analyze_frequency_spectrum: BarChart3,
  create_midi_track: Music,
  detect_key_and_scale: Music,
  create_song_section: Layers,
  analyze_project_mix: BarChart3,
};

const TOOL_LABELS: Record<string, string> = {
  get_project: 'Get Project',
  set_tempo: 'Set Tempo',
  set_time_signature: 'Time Signature',
  list_templates: 'List Templates',
  load_template: 'Load Template',
  create_track: 'Create Track',
  list_tracks: 'List Tracks',
  add_midi_notes: 'Add MIDI Notes',
  create_clip: 'Create Clip',
  set_track_volume: 'Set Volume',
  set_track_pan: 'Set Pan',
  add_effect: 'Add Effect',
  create_section: 'Create Section',
  analyze_mix: 'Analyze Mix',
  generate_chord_progression: 'Generate Chords',
  // Legacy tool names
  set_track_level: 'Set Level',
  apply_eq: 'Apply EQ',
  apply_compression: 'Compress',
  analyze_frequency_spectrum: 'Analyze Spectrum',
  create_midi_track: 'Create MIDI',
  detect_key_and_scale: 'Detect Key',
  create_song_section: 'Create Section',
  analyze_project_mix: 'Analyze Mix',
};

interface ToolExecutionCardProps {
  execution: ToolExecution;
}

const ToolExecutionCard = React.memo(function ToolExecutionCard({ execution }: ToolExecutionCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const normalized = normalizeToolName(execution.name);
  const Icon = TOOL_ICONS[normalized] || Wrench;
  const label = TOOL_LABELS[normalized] || normalized;

  return (
    <div className="rounded border border-rach-border/50 bg-rach-bg/50 text-[10px] my-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-rach-surface-light/50 transition-colors"
      >
        <Icon size={10} className="text-rach-accent shrink-0" />
        <span className="text-rach-text-muted font-medium">{label}</span>
        <span className="flex-1 text-left text-rach-text-muted/60 truncate">
          {execution.result?.split('\n')[0].slice(0, 60) || ''}
        </span>
        {expanded ? (
          <ChevronDown size={10} className="text-rach-text-muted shrink-0" />
        ) : (
          <ChevronRight size={10} className="text-rach-text-muted shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-1.5 border-t border-rach-border/30">
          <div className="mt-1 text-rach-text-muted/70">
            <span className="font-medium">Input:</span>
            <pre className="whitespace-pre-wrap text-[9px] mt-0.5 text-rach-text-muted/50">
              {JSON.stringify(execution.input, null, 2)}
            </pre>
          </div>
          {execution.result && (
            <div className="mt-1 text-rach-text-muted/70">
              <span className="font-medium">Result:</span>
              <pre className="whitespace-pre-wrap text-[9px] mt-0.5">{execution.result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export { ToolExecutionCard };
