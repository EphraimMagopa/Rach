import { useRef, useCallback, useEffect } from 'react'
import { AudioEngine } from '@/core/audio'

let sharedEngine: AudioEngine | null = null

export function useAudioEngine(): {
  engine: AudioEngine
  initialize: () => Promise<void>
  isInitialized: boolean
} {
  if (!sharedEngine) {
    sharedEngine = new AudioEngine()
  }

  const engineRef = useRef(sharedEngine)

  const initialize = useCallback(async () => {
    if (!engineRef.current.isInitialized) {
      await engineRef.current.initialize()
    }
  }, [])

  useEffect(() => {
    return () => {
      // Don't dispose on unmount — shared singleton
    }
  }, [])

  return {
    engine: engineRef.current,
    initialize,
    isInitialized: engineRef.current.isInitialized,
  }
}
