import { useRef, useMemo, useState, Suspense } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Gamepad2, Loader2 } from 'lucide-react';
import { getRouteByPath } from '@/navigation/routes';
import ArrowNavigation from '@/navigation/ArrowNavigation';
import PreviewContainer from '@/navigation/PreviewContainer';
import { NavigationContext } from '@/navigation/NavigationContext';
import { NavModeToggle } from '@/components/NavModeToggle';
import { SpatialLanguageSwitcher } from '@/components/SpatialLanguageSwitcher';
import { SpatialDarkModeToggle } from '@/components/SpatialDarkModeToggle';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useGameNavPreload } from '@/game-nav/useGameNavPreload';
import Now from '@/pages/Now';
import Me from '@/pages/Me';
import LinkPage from '@/pages/LinkPage';
import MyHistory from '@/pages/MyHistory';
import MyFuture from '@/pages/MyFuture';

export default function ExperimentalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentRoute = getRouteByPath(location.pathname);
  const prevRoute = useRef(currentRoute);
  const [isExpanded, setIsExpanded] = useState(false);
  const [gameNavOpen, setGameNavOpen] = useState(false);
  const { swipeIndicator, panHandlers } = useSwipeNavigation();
  const { state: gameNavState, preload: preloadGameNav, GameNavComponent } = useGameNavPreload();

  const direction = useMemo(() => {
    const prev = prevRoute.current;
    const curr = currentRoute;
    prevRoute.current = curr;

    if (!prev || !curr || (prev.x === curr.x && prev.y === curr.y)) {
      return { x: 0, y: 0 };
    }
    return {
      x: (curr.x - prev.x) * 100,
      y: -(curr.y - prev.y) * 100,
    };
  }, [currentRoute]);

  return (
    <NavigationContext.Provider value={{ isExpanded, setIsExpanded }}>
      <motion.div
        className="app-shell bg-gray-200 dark:bg-gray-900"
        onPanStart={panHandlers.onPanStart}
        onPan={panHandlers.onPan}
        onPanEnd={panHandlers.onPanEnd}
      >

        {/* Arrow navigation — hidden when mobile expanded */}
        {!isExpanded && <ArrowNavigation />}

        {/* Nav mode toggle centered in right side strip */}
        {!isExpanded && (
          <div className="absolute right-0 top-1/4 z-30 flex w-8 -translate-y-1/2 items-center justify-center md:w-16 lg:w-20">
            <NavModeToggle />
          </div>
        )}

        {/* Logo on left border at 1/4 height */}
        {!isExpanded && (
          <div className="absolute left-0 top-1/4 z-30 flex w-8 -translate-y-1/2 items-center justify-center md:w-16 lg:w-20">
            <img
              src="/logo-website.png"
              alt="Kipnuni"
              className="h-6 w-6 object-contain opacity-70 md:h-10 md:w-10 lg:h-14 lg:w-14"
            />
          </div>
        )}

        {/* Game nav trigger on right border at 3/4 height */}
        {!isExpanded && (
          <div className="absolute right-0 top-3/4 z-30 flex w-8 -translate-y-1/2 items-center justify-center md:w-16 lg:w-20">
            <button
              onClick={() => {
                if (gameNavState === 'idle' || gameNavState === 'error') {
                  preloadGameNav();
                } else if (gameNavState === 'ready') {
                  setGameNavOpen(true);
                }
              }}
              disabled={gameNavState === 'loading'}
              className="group cursor-pointer rounded-md p-1 transition-colors duration-200 focus:outline-none disabled:cursor-wait"
              title={
                gameNavState === 'idle'
                  ? t('gameNav.preload')
                  : gameNavState === 'loading'
                    ? t('gameNav.loading')
                    : gameNavState === 'ready'
                      ? t('gameNav.open')
                      : t('gameNav.error')
              }
            >
              {gameNavState === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 md:h-7 md:w-7 lg:h-9 lg:w-9" />
              ) : (
                <Gamepad2
                  className={`h-5 w-5 transition-colors duration-200 md:h-7 md:w-7 lg:h-9 lg:w-9 ${
                    gameNavState === 'ready'
                      ? 'text-blue-500 group-hover:text-blue-400'
                      : gameNavState === 'error'
                        ? 'text-red-400 group-hover:text-red-300'
                        : 'text-gray-400 opacity-60 group-hover:text-gray-300'
                  }`}
                />
              )}
            </button>
          </div>
        )}

        {/* Language switcher + dark mode toggle on left border at 3/4 height */}
        {!isExpanded && (
          <div className="absolute left-0 top-3/4 z-30 flex w-8 -translate-y-1/2 flex-col items-center justify-center gap-8 md:w-16 md:gap-6 lg:w-20 lg:gap-8">
            <SpatialLanguageSwitcher />
            <SpatialDarkModeToggle />
          </div>
        )}

        {/* Preview container with animated transitions */}
        <PreviewContainer swipeDirection={swipeIndicator}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={location.pathname}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (dir: { x: number; y: number }) => ({
                  x: `${dir.x}%`,
                  y: `${dir.y}%`,
                  opacity: 0,
                }),
                center: { x: 0, y: 0, opacity: 1 },
                exit: (dir: { x: number; y: number }) => ({
                  x: `${-dir.x}%`,
                  y: `${-dir.y}%`,
                  opacity: 0,
                }),
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Routes location={location}>
                <Route path="/" element={<Now />} />
                <Route path="/me" element={<Me />} />
                <Route path="/link" element={<LinkPage />} />
                <Route path="/history" element={<MyHistory />} />
                <Route path="/future" element={<MyFuture />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </PreviewContainer>

        {/* 3D Game Navigator popup */}
        {gameNavOpen && GameNavComponent && currentRoute && (
          <Suspense fallback={null}>
            <GameNavComponent
              currentRoute={currentRoute}
              onNavigate={(path) => {
                navigate(path);
                setGameNavOpen(false);
              }}
              onClose={() => setGameNavOpen(false)}
            />
          </Suspense>
        )}
      </motion.div>
    </NavigationContext.Provider>
  );
}
