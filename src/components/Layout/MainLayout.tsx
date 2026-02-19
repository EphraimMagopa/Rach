import { TransportBar } from '@/components/Transport/TransportBar'
import { Timeline } from '@/components/Timeline/Timeline'
import { MixerPanel } from '@/components/Mixer/MixerPanel'
import { AIPanel } from '@/components/AI/AIPanel'
import { useUIStore } from '@/stores/ui-store'

export function MainLayout(): React.JSX.Element {
  const { panelVisibility } = useUIStore()

  return (
    <div className="h-screen w-screen flex flex-col bg-rach-bg overflow-hidden">
      {/* Transport bar */}
      <TransportBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline (takes remaining space) */}
        <Timeline />

        {/* AI panel (right side, toggleable) */}
        {panelVisibility.ai && <AIPanel />}
      </div>

      {/* Mixer panel (bottom, toggleable) */}
      <MixerPanel />
    </div>
  )
}
