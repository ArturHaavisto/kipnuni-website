import { useRef, useMemo, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { getRouteByPath } from '@/navigation/routes';
import ArrowNavigation from '@/navigation/ArrowNavigation';
import PreviewContainer from '@/navigation/PreviewContainer';
import { NavigationContext } from '@/navigation/NavigationContext';
import { NavModeToggle } from '@/components/NavModeToggle';
import { SpatialLanguageSwitcher } from '@/components/SpatialLanguageSwitcher';
import { SpatialDarkModeToggle } from '@/components/SpatialDarkModeToggle';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import Now from '@/pages/Now';
import Me from '@/pages/Me';
import LinkPage from '@/pages/LinkPage';
import MyHistory from '@/pages/MyHistory';
import MyFuture from '@/pages/MyFuture';

export default function ExperimentalLayout() {
  const location = useLocation();
  const currentRoute = getRouteByPath(location.pathname);
  const prevRoute = useRef(currentRoute);
  const [isExpanded, setIsExpanded] = useState(false);
  const { swipeIndicator, panHandlers } = useSwipeNavigation();

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

        {/* Language switcher + dark mode toggle on right border at 3/4 height */}
        {!isExpanded && (
          <div className="absolute right-0 top-3/4 z-30 flex w-8 -translate-y-1/2 flex-col items-center justify-center gap-8 md:w-16 md:gap-6 lg:w-20 lg:gap-8">
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
      </motion.div>
    </NavigationContext.Provider>
  );
}
