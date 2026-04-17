import { useState } from 'react';
import type { ChangeEvent } from '@jswork/react-dynamic-list/src/main';
import type { Item } from './types';

export function ChangeLog({ onChange }: { onChange?: (event: ChangeEvent<Item>) => void }) {
  onChange;
  return null;
}

export function useChangeLog() {
  const [logs, setLogs] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<Item>) => {
    setLogs((prev) => [`[${event.action}] index=${event.index ?? '-'} count=${event.data.length}`, ...prev].slice(0, 20));
  };

  const LogView = () => (
    <div className="max-h-32 overflow-y-auto font-mono text-xs space-y-0.5">
      {logs.map((log, i) => (
        <div key={i} className="opacity-60">{log}</div>
      ))}
      {logs.length === 0 && <div className="opacity-30">No events yet</div>}
    </div>
  );

  return { handleChange, LogView };
}
