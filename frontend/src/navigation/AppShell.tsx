import { useRef, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { getRouteByPath } from './routes';
import ArrowNavigation from './ArrowNavigation';
import PreviewContainer from './PreviewContainer';
import { useNavigation } from './NavigationContext';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const currentRoute = getRouteByPath(location.pathname);
  const prevRoute = useRef(currentRoute);
  const { isExpanded } = useNavigation();

  // Compute the slide direction based on coordinate delta
  const direction = useMemo(() => {
    const prev = prevRoute.current;
    const curr = currentRoute;
    // Update ref for next render
    prevRoute.current = curr;

    if (!prev || !curr || (prev.x === curr.x && prev.y === curr.y)) {
      return { x: 0, y: 0 };
    }
    // Slide opposite to the movement direction
    // Moving right (dx=1): content enters from the right → initial x = +100%
    return {
      x: (curr.x - prev.x) * 100,
      // Y-axis is inverted for screen coords (positive Y = up, but screen down)
      y: -(curr.y - prev.y) * 100,
    };
  }, [currentRoute]);

  return (
    <div className="app-shell">
      {/* Border / action area — arrow buttons */}
      {!isExpanded && <ArrowNavigation />}

      {/* Current page label — shown in border area */}
      {!isExpanded && currentRoute && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30
          text-[10px] md:text-xs tracking-widest uppercase text-gray-500 select-none">
          {currentRoute.label}
        </div>
      )}

      {/* Inner preview container with animated page transitions */}
      <PreviewContainer>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ x: `${direction.x}%`, y: `${direction.y}%`, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: `${-direction.x}%`, y: `${-direction.y}%`, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </PreviewContainer>
    </div>
  );
}
