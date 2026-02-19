import { Play } from 'lucide-react';
import type { Scene } from '../../core/models/session';

interface SceneRowProps {
  scene: Scene;
  onLaunchScene: (sceneIndex: number) => void;
}

export function SceneRow({ scene, onLaunchScene }: SceneRowProps): React.JSX.Element {
  return (
    <div className="flex items-center h-10">
      <button
        onClick={() => onLaunchScene(scene.index)}
        className="w-16 h-10 flex items-center gap-1 px-2 bg-rach-surface hover:bg-rach-surface-light border border-rach-border/50 rounded-sm transition-colors"
        title={`Launch ${scene.name}`}
      >
        <Play size={10} className="text-rach-accent shrink-0" />
        <span className="text-[9px] text-rach-text truncate">{scene.name}</span>
      </button>
    </div>
  );
}
