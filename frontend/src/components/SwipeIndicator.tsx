import type { SwipeDirection } from '@/hooks/useSwipeNavigation';

interface SwipeIndicatorProps {
  direction: SwipeDirection;
}

/** Thickness of the border glow in pixels */
const GLOW_THICKNESS = 6;

/**
 * Maps each swipe direction to a radial-gradient origin point.
 * The glow emanates from the midpoint of the direction edge (or corner for diagonals).
 */
const originMap: Record<NonNullable<SwipeDirection>, string> = {
  up:             '50% 0%',
  down:           '50% 100%',
  left:           '0% 50%',
  right:          '100% 50%',
  'top-left':     '0% 0%',
  'top-right':    '100% 0%',
  'bottom-left':  '0% 100%',
  'bottom-right': '100% 100%',
};

export function SwipeIndicator({ direction }: SwipeIndicatorProps) {
  if (!direction) return null;

  const origin = originMap[direction];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 rounded-lg transition-opacity duration-150"
      style={{
        padding: GLOW_THICKNESS,
        background: `radial-gradient(ellipse at ${origin}, rgba(96,165,250,0.55) 0%, transparent 55%)`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
      }}
    />
  );
}
