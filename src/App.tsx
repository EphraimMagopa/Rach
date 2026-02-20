import { useEffect, useCallback, useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { useAudioEngine } from './hooks/use-audio-engine';
import { useTransport } from './hooks/use-transport';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useMixer } from './hooks/use-mixer';
import { useEffects } from './hooks/use-effects';
import { useProjectPersistence } from './hooks/use-project-persistence';
import { useTutorialWatcher } from './hooks/use-tutorial-watcher';
import { useTutorialStore } from './stores/tutorial-store';
import * as Tone from 'tone';

function App(): React.JSX.Element {
  const { engine: audioEngine, initialize: initAudio } = useAudioEngine();
  const [audioReady, setAudioReady] = useState(audioEngine.isInitialized);

  // Bridge transport-store ↔ engine (hook must always be called)
  useTransport(audioEngine);
  useKeyboardShortcuts();
  useMixer(audioEngine);
  useEffects(audioEngine);
  useProjectPersistence();
  useTutorialWatcher();

  // First-run: auto-start tutorial if not yet completed
  useEffect(() => {
    const { hasCompletedTutorial, startTutorial } = useTutorialStore.getState();
    if (!hasCompletedTutorial) {
      startTutorial();
    }
  }, []);

  const handleUserGesture = useCallback(async () => {
    if (audioReady) return;
    await initAudio();
    // Share our AudioContext with Tone.js
    const ctx = audioEngine.audioContext;
    if (ctx) {
      Tone.setContext(ctx);
    }
    setAudioReady(true);
  }, [audioReady, initAudio, audioEngine]);

  // Listen for first user interaction to initialize audio
  useEffect(() => {
    if (audioReady) return;
    const handler = () => handleUserGesture();
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [audioReady, handleUserGesture]);

  return <MainLayout />;
}

export default App;
