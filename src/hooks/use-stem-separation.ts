import { useState, useCallback } from 'react';
import { backendClient } from '../services/backend-client';

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

  const separate = useCallback(
    async (audioPath: string, options: { quality: 'fast' | 'balanced' | 'high'; stems: 4 | 2 }) => {
      setIsProcessing(true);
      setProgress(null);
      setResults(null);
      setError(null);

      const result = await backendClient.separateStems(audioPath, options, (p) => {
        setProgress(p);
      });

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
    backendClient.cancelStemSeparation();
  }, []);

  const checkModel = useCallback(async (): Promise<boolean> => {
    return backendClient.checkStemModel();
  }, []);

  return { isProcessing, progress, results, error, separate, cancel, checkModel };
}
