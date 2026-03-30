import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { spatialRoutes } from '@/navigation/routes';
import { ZONE_SIZE, ZONE_COLORS, gridToWorld } from './constants';

const FLOOR_THICKNESS = 0.2;
const WALL_HEIGHT = 2;
const WALL_THICKNESS = 0.3;

export function Floor() {
  // Walls along the perimeter of the plus/cross shape
  const walls = buildWalls();

  return (
    <group>
      {/* Zone floor tiles */}
      {spatialRoutes.map((route) => {
        const [wx, , wz] = gridToWorld(route.x, route.y);
        return (
          <group key={route.id} position={[wx, -FLOOR_THICKNESS / 2, wz]}>
            <mesh receiveShadow>
              <boxGeometry args={[ZONE_SIZE, FLOOR_THICKNESS, ZONE_SIZE]} />
              <meshStandardMaterial color={ZONE_COLORS[route.id] ?? '#888'} opacity={0.35} transparent />
            </mesh>
            {/* Thin border lines between zones */}
            <mesh position={[0, FLOOR_THICKNESS / 2 + 0.01, 0]}>
              <boxGeometry args={[ZONE_SIZE - 0.1, 0.01, ZONE_SIZE - 0.1]} />
              <meshStandardMaterial color={ZONE_COLORS[route.id] ?? '#888'} opacity={0.15} transparent />
            </mesh>
          </group>
        );
      })}

      {/* Invisible boundary walls */}
      {walls.map((w, i) => (
        <RigidBody key={i} type="fixed" position={w.pos as [number, number, number]}>
          <CuboidCollider args={w.half as [number, number, number]} />
        </RigidBody>
      ))}

      {/* Floor collider (static) — one large platform covering the cross */}
      {spatialRoutes.map((route) => {
        const [wx, , wz] = gridToWorld(route.x, route.y);
        return (
          <RigidBody key={`col-${route.id}`} type="fixed" position={[wx, -FLOOR_THICKNESS, wz]}>
            <CuboidCollider args={[ZONE_SIZE / 2, FLOOR_THICKNESS / 2, ZONE_SIZE / 2]} />
          </RigidBody>
        );
      })}
    </group>
  );
}

function buildWalls() {
  const half = ZONE_SIZE / 2;
  const wh = WALL_HEIGHT / 2;
  const wt = WALL_THICKNESS / 2;
  const walls: { pos: [number, number, number]; half: [number, number, number] }[] = [];

  // The cross shape occupies cells: (0,0), (0,1), (0,-1), (1,0), (-1,0)
  // Outer perimeter walls for the cross:
  const S = ZONE_SIZE;

  // Top edge of Future (0,1): z = -1*S - S/2 = -1.5S
  walls.push({ pos: [0, wh, -1.5 * S], half: [half, wh, wt] });
  // Bottom edge of History (0,-1): z = 1*S + S/2 = 1.5S
  walls.push({ pos: [0, wh, 1.5 * S], half: [half, wh, wt] });
  // Left edge of Me (-1,0): x = -1*S - S/2 = -1.5S
  walls.push({ pos: [-1.5 * S, wh, 0], half: [wt, wh, half] });
  // Right edge of Link (1,0): x = 1*S + S/2 = 1.5S
  walls.push({ pos: [1.5 * S, wh, 0], half: [wt, wh, half] });

  // Top-left corner: gap between Future(0,1) left edge and Me(-1,0) top edge
  // Future left wall: x = -S/2, z from -S/2 to -3S/2
  walls.push({ pos: [-half, wh, -S], half: [wt, wh, half] });
  // Me top wall: z = -S/2, x from -3S/2 to -S/2
  walls.push({ pos: [-S, wh, -half], half: [half, wh, wt] });

  // Top-right corner: Future right edge, Link top edge
  walls.push({ pos: [half, wh, -S], half: [wt, wh, half] });
  walls.push({ pos: [S, wh, -half], half: [half, wh, wt] });

  // Bottom-left corner: History left edge, Me bottom edge
  walls.push({ pos: [-half, wh, S], half: [wt, wh, half] });
  walls.push({ pos: [-S, wh, half], half: [half, wh, wt] });

  // Bottom-right corner: History right edge, Link bottom edge
  walls.push({ pos: [half, wh, S], half: [wt, wh, half] });
  walls.push({ pos: [S, wh, half], half: [half, wh, wt] });

  return walls;
}
