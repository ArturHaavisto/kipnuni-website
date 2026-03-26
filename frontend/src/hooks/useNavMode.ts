import { useCallback, useEffect } from 'react';
import { useLocalStorage, useMediaQuery, useSessionStorage } from 'usehooks-ts';

type NavMode = 'traditional' | 'experimental';

const MOBILE_QUERY = '(max-width: 767px)';

// Toggle this flag if true fullscreen API is desired for production later.
// Note: Real Fullscreen API gets cancelled if window.location.reload() is called, 
// so it generally requires navigating without a hard reload.
const ENABLE_REAL_FULLSCREEN = false;

export function useNavMode() {
  const [storedMode, setStoredMode] = useLocalStorage<NavMode>('navMode', 'traditional');
  const [mobileOverride, setMobileOverride] = useSessionStorage<boolean>('mobileNavModeOverride', false);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Mobile override: default to traditional to avoid accidental blocking, 
  // but respect if they explicitly switched in this session.
  const navMode: NavMode = (isMobile && !mobileOverride) ? 'traditional' : storedMode;

  // Sync the data attribute on <html> so CSS can react
  useEffect(() => {
    document.documentElement.dataset.navMode = navMode;
  }, [navMode]);

  const toggleMode = useCallback(() => {
    const next: NavMode = navMode === 'traditional' ? 'experimental' : 'traditional';
    setStoredMode(next);
    
    if (isMobile) {
      setMobileOverride(next === 'experimental');
    }

    // In development or when using the mock CSS fullscreen (100dvh), skip the Fullscreen API.
    // Desktop browsers simulating mobile don't handle requestFullscreen well.
    if (ENABLE_REAL_FULLSCREEN && isMobile && next === 'experimental' && import.meta.env.PROD) {
      document.documentElement.requestFullscreen?.().then(() => {
        window.location.reload();
      }).catch(() => {
        window.location.reload();
      });
      return;
    }

    window.location.reload();
  }, [navMode, isMobile, setStoredMode, setMobileOverride]);

  return { navMode, toggleMode, isMobile } as const;
}
