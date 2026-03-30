/**
 * World-space scale: each zone is ZONE_SIZE × ZONE_SIZE units,
 * centered at (route.x * ZONE_SIZE, 0, -route.y * ZONE_SIZE).
 * Note: spatial Y maps to world -Z (so "up" in the grid = -Z in 3D).
 */
export const ZONE_SIZE = 5;

/** Max ball speed in world units/sec (~0.7s per zone crossing) */
export const MAX_SPEED = 7;

/** Force applied from joystick input (terminal vel = MOVE_FORCE / LINEAR_DAMPING) */
export const MOVE_FORCE = 120;

/** Damping on the ball — high so it stops quickly when joystick released */
export const LINEAR_DAMPING = 12;

/** Convert spatial grid coords to world XZ position */
export function gridToWorld(gx: number, gy: number): [number, number, number] {
  return [gx * ZONE_SIZE, 0, -gy * ZONE_SIZE];
}

export const ZONE_COLORS: Record<string, string> = {
  now: '#6366f1',     // indigo
  future: '#22c55e',  // green
  history: '#f59e0b', // amber
  link: '#3b82f6',    // blue
  me: '#ec4899',      // pink
};
