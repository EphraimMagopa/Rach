import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface PluginInfo {
  path: string;
  name: string;
  vendor: string;
  uid: string;
  isInstrument: boolean;
  isEffect: boolean;
}

interface PluginBrowserProps {
  onInsertPlugin: (plugin: PluginInfo) => void;
}

export function PluginBrowser({ onInsertPlugin }: PluginBrowserProps): React.JSX.Element {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'effect' | 'instrument'>('all');

  const ipc = (window as unknown as {
    electron?: {
      ipcRenderer?: {
        invoke: (ch: string, ...args: unknown[]) => Promise<unknown>;
      };
    };
  }).electron?.ipcRenderer;

  const scanPlugins = async () => {
    if (!ipc) return;
    setIsScanning(true);
    try {
      const result = await ipc.invoke('plugin:scan');
      setPlugins(result as PluginInfo[]);
    } catch (err) {
      console.error('Plugin scan failed:', err);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    scanPlugins();
  }, []);

  const filtered = plugins.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.vendor.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType === 'effect' && !p.isEffect) return false;
    if (filterType === 'instrument' && !p.isInstrument) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-rach-surface">
      {/* Header */}
      <div className="p-2 border-b border-rach-border">
        <div className="flex items-center gap-1 mb-2">
          <div className="flex-1 flex items-center gap-1 bg-rach-bg border border-rach-border rounded px-2 py-1">
            <Search size={12} className="text-rach-text-muted" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-rach-text outline-none"
            />
          </div>
          <button
            onClick={scanPlugins}
            className="p-1 rounded hover:bg-rach-surface-light"
            title="Rescan plugins"
            disabled={isScanning}
          >
            <RefreshCw size={12} className={`text-rach-text-muted ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'effect', 'instrument'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded text-[9px] ${
                filterType === type
                  ? 'bg-rach-accent/20 text-rach-accent'
                  : 'text-rach-text-muted hover:text-rach-text'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Plugin list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-rach-text-muted">
            {plugins.length === 0 ? 'No plugins found. Click refresh to scan.' : 'No matching plugins.'}
          </div>
        ) : (
          filtered.map((plugin) => (
            <button
              key={plugin.uid}
              onClick={() => onInsertPlugin(plugin)}
              className="w-full text-left px-3 py-1.5 border-b border-rach-border/30 hover:bg-rach-surface-light transition-colors"
            >
              <div className="text-xs text-rach-text">{plugin.name}</div>
              <div className="text-[9px] text-rach-text-muted">{plugin.vendor}</div>
            </button>
          ))
        )}
      </div>

      {/* Status bar */}
      <div className="px-2 py-1 border-t border-rach-border text-[8px] text-rach-text-muted">
        {plugins.length} plugins found
      </div>
    </div>
  );
}
