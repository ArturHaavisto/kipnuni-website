import { useState, useCallback, useRef, type ComponentType } from 'react';
import type { GameNavOverlayProps } from './GameNavOverlay';

type PreloadState = 'idle' | 'loading' | 'ready' | 'error';

// Module-scope: persists across renders/navigations within the session
let cachedComponent: ComponentType<GameNavOverlayProps> | null = null;
let cachedState: PreloadState = 'idle';

export function useGameNavPreload() {
  const [state, setState] = useState<PreloadState>(cachedState);
  const loadingRef = useRef(false);

  const preload = useCallback(async () => {
    if (cachedComponent || loadingRef.current) return;
    loadingRef.current = true;
    setState('loading');
    cachedState = 'loading';

    try {
      const mod = await import('./GameNavOverlay');
      cachedComponent = mod.default;
      cachedState = 'ready';
      setState('ready');
    } catch {
      cachedState = 'error';
      setState('error');
    } finally {
      loadingRef.current = false;
    }
  }, []);

  return {
    state,
    preload,
    GameNavComponent: cachedComponent,
  };
}
