export function PianoRoll(): React.JSX.Element {
  const keys = Array.from({ length: 88 }, (_, i) => {
    const note = i + 21 // A0 = MIDI 21
    const name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][note % 12]
    const octave = Math.floor(note / 12) - 1
    const isBlack = name.includes('#')
    return { note, name, octave, isBlack, label: `${name}${octave}` }
  }).reverse()

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-rach-bg">
      <div className="h-6 bg-rach-surface border-b border-rach-border flex items-center px-3">
        <span className="text-[10px] text-rach-text-muted uppercase tracking-wider">Piano Roll</span>
      </div>
      <div className="flex-1 overflow-auto flex">
        {/* Piano keys */}
        <div className="w-12 shrink-0 border-r border-rach-border">
          {keys.map((key) => (
            <div
              key={key.note}
              className={`h-3 border-b flex items-center justify-end pr-1 text-[8px] ${
                key.isBlack
                  ? 'bg-rach-bg text-rach-text-muted border-rach-border/30'
                  : 'bg-rach-surface text-rach-text-muted border-rach-border/20'
              }`}
            >
              {key.name === 'C' && key.label}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex-1 relative">
          {keys.map((key) => (
            <div
              key={key.note}
              className={`h-3 border-b ${
                key.isBlack ? 'bg-rach-bg/50 border-rach-border/10' : 'bg-rach-bg border-rach-border/5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
