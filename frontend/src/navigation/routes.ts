/**
 * Spatial coordinate system for the 2D navigation.
 *
 *              My Future (0, 1)
 *                   ▲
 *                   |
 *  Me (-1, 0) ◄── Now (0, 0) ──► Link (1, 0)
 *                   |
 *                   ▼
 *            My History (0, -1)
 *
 * Y-axis: positive = up (future), negative = down (history)
 */

export interface SpatialRoute {
  id: string;
  label: string;
  path: string;
  x: number;
  y: number;
}

export const spatialRoutes: SpatialRoute[] = [
  { id: 'now', label: 'Now', path: '/', x: 0, y: 0 },
  { id: 'future', label: 'My Future', path: '/future', x: 0, y: 1 },
  { id: 'history', label: 'My History', path: '/history', x: 0, y: -1 },
  { id: 'link', label: 'Link', path: '/link', x: 1, y: 0 },
  { id: 'me', label: 'Me', path: '/me', x: -1, y: 0 },
];

export function getRouteByPath(path: string): SpatialRoute | undefined {
  return spatialRoutes.find((r) => r.path === path);
}

/**
 * Direction slots around the border frame.
 * Each slot has a [deltaX, deltaY] relative to the current page coordinate.
 */
export type DirectionSlot =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface SlotDelta {
  dx: number;
  dy: number;
}

export const slotDeltas: Record<DirectionSlot, SlotDelta> = {
  top: { dx: 0, dy: 1 },
  bottom: { dx: 0, dy: -1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
  'top-left': { dx: -1, dy: 1 },
  'top-right': { dx: 1, dy: 1 },
  'bottom-left': { dx: -1, dy: -1 },
  'bottom-right': { dx: 1, dy: -1 },
};

/**
 * Given the current page's [x, y], return which border slots
 * should show an arrow and which route they point to.
 */
export function getNeighborSlots(
  currentX: number,
  currentY: number,
): { slot: DirectionSlot; route: SpatialRoute }[] {
  const results: { slot: DirectionSlot; route: SpatialRoute }[] = [];

  for (const [slot, { dx, dy }] of Object.entries(slotDeltas)) {
    const targetX = currentX + dx;
    const targetY = currentY + dy;
    const route = spatialRoutes.find((r) => r.x === targetX && r.y === targetY);
    if (route) {
      results.push({ slot: slot as DirectionSlot, route });
    }
  }

  return results;
}
