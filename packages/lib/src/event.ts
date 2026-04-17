import type { ListAction } from './types';

type Listener = (action: ListAction, index?: number) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribe(name: string, listener: Listener): () => void {
  if (!listeners.has(name)) listeners.set(name, new Set());
  const set = listeners.get(name)!;
  set.add(listener);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(name);
  };
}

export function emitChange(name: string, action: ListAction, index?: number): void {
  listeners.get(name)?.forEach((fn) => fn(action, index));
}
