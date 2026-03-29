import { useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { PanInfo } from 'motion/react';
import { getRouteByPath, spatialRoutes } from '@/navigation/routes';

export type SwipeDirection =
  | 'up' | 'down' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | null;

const THRESHOLD = 50; // minimum px to count as a swipe
const DIAG_RATIO = 0.414; // tan(22.5°) — if minor/major > this → diagonal
const EDGE_ZONE = 60; // px from screen edge to recognise a swipe start

/**
 * Resolve the 8-directional delta from a pan offset.
 * Uses natural scrolling: swipe down → navigate up, etc.
 */
function resolveDirection(x: number, y: number): { dx: number; dy: number; indicator: SwipeDirection } {
  const absX = Math.abs(x);
  const absY = Math.abs(y);

  if (absX < THRESHOLD && absY < THRESHOLD) return { dx: 0, dy: 0, indicator: null };

  const major = Math.max(absX, absY);
  const minor = Math.min(absX, absY);
  const isDiagonal = minor / major > DIAG_RATIO && absX >= THRESHOLD && absY >= THRESHOLD;

  // Natural scrolling: invert gesture direction to get navigation delta
  const navDx = isDiagonal || absX >= absY ? (x > 0 ? -1 : 1) : 0;
  const navDy = isDiagonal || absY >= absX ? (y > 0 ? 1 : -1) : 0;

  // Indicator shows where the user would navigate TO
  let indicator: SwipeDirection = null;
  if (navDx !== 0 && navDy !== 0) {
    indicator = `${navDy > 0 ? 'top' : 'bottom'}-${navDx < 0 ? 'left' : 'right'}` as SwipeDirection;
  } else if (navDy > 0) indicator = 'up';
  else if (navDy < 0) indicator = 'down';
  else if (navDx < 0) indicator = 'left';
  else if (navDx > 0) indicator = 'right';

  return { dx: navDx, dy: navDy, indicator };
}

/**
 * Hook providing pan gesture handlers for spatial swipe navigation.
 * Supports all 8 directions matching the arrow navigation slots.
 */
export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [swipeIndicator, setSwipeIndicator] = useState<SwipeDirection>(null);
  const startedFromEdge = useRef(false);

  const onPanStart = useCallback((event: PointerEvent) => {
    setSwipeIndicator(null);
    const x = event.clientX;
    const y = event.clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    startedFromEdge.current = 
      x <= EDGE_ZONE || 
      x >= vw - EDGE_ZONE || 
      y <= EDGE_ZONE || 
      y >= vh - EDGE_ZONE;
  }, []);

  const onPan = useCallback((_: unknown, info: PanInfo) => {
    if (!startedFromEdge.current) return;
    const { indicator } = resolveDirection(info.offset.x, info.offset.y);
    setSwipeIndicator(indicator);
  }, []);

  const onPanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setSwipeIndicator(null);
      if (!startedFromEdge.current) return;

      const { dx, dy } = resolveDirection(info.offset.x, info.offset.y);
      if (dx === 0 && dy === 0) return;

      const current = getRouteByPath(location.pathname);
      if (!current) return;

      const target = spatialRoutes.find(
        (r) => r.x === current.x + dx && r.y === current.y + dy,
      );
      if (target) navigate(target.path);
    },
    [location.pathname, navigate],
  );

  return {
    swipeIndicator,
    panHandlers: { onPanStart, onPan, onPanEnd },
  } as const;
}
