import { useState, useCallback, useEffect } from 'react';

export interface StemProgress {
  stage: string;
  percent: number;
}

export interface StemResult {
  name: string;
  path: string;
}

export function useStemSeparation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<StemProgress | null>(null);
  const [results, setResults] = useState<StemResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;

    const handler = (...args: unknown[]) => {
      const data = args[1] as StemProgress;
      if (data) setProgress(data);
    };

    ipc.on('stems:progress', handler);
    return () => {
      ipc.removeListener('stems:progress', handler);
    };
  }, []);

  const separate = useCallback(
    async (audioPath: string, options: { quality: 'fast' | 'balanced' | 'high'; stems: 4 | 2 }) => {
      const ipc = window.electron?.ipcRenderer;
      if (!ipc) {
        setError('Stem separation requires Electron');
        return;
      }

      setIsProcessing(true);
      setProgress(null);
      setResults(null);
      setError(null);

      const result = (await ipc.invoke('stems:separate', audioPath, options)) as {
        success: boolean;
        stems?: StemResult[];
        error?: string;
      };

      setIsProcessing(false);

      if (result.success && result.stems) {
        setResults(result.stems);
        setProgress({ stage: 'Complete', percent: 100 });
      } else {
        setError(result.error || 'Separation failed');
      }
    },
    []
  );

  const cancel = useCallback(() => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;
    // Use invoke instead of send for compatibility with the preload API
    ipc.invoke('stems:cancel').catch(() => {});
  }, []);

  const checkModel = useCallback(async (): Promise<boolean> => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return false;
    const result = (await ipc.invoke('stems:checkModel')) as { available: boolean };
    return result.available;
  }, []);

  return { isProcessing, progress, results, error, separate, cancel, checkModel };
}
