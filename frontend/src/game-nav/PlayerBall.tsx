import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { gridToWorld, ZONE_SIZE, MAX_SPEED, MOVE_FORCE, LINEAR_DAMPING } from './constants';
import { spatialRoutes, type SpatialRoute } from '@/navigation/routes';
import type { RefObject } from 'react';

interface PlayerBallProps {
  currentRoute: SpatialRoute;
  forceRef: RefObject<{ x: number; z: number }>;
  ballPositionRef: RefObject<{ x: number; z: number }>;
  onZoneChange: (zoneId: string) => void;
}

export interface PlayerBallRef {
  getCurrentZone: () => string;
}

export const PlayerBall = forwardRef<PlayerBallRef, PlayerBallProps>(
  function PlayerBall({ currentRoute, forceRef, ballPositionRef, onZoneChange }, ref) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const currentZoneRef = useRef(currentRoute.id);
    const [startX, , startZ] = gridToWorld(currentRoute.x, currentRoute.y);

    useImperativeHandle(ref, () => ({
      getCurrentZone: () => currentZoneRef.current,
    }));

    useFrame(() => {
      const rb = rigidBodyRef.current;
      if (!rb) return;

      // Apply force from joystick (normalized [-1,1] input)
      const input = forceRef.current;
      if (input.x !== 0 || input.z !== 0) {
        rb.resetForces(true);
        rb.addForce(
          { x: input.x * MOVE_FORCE, y: 0, z: input.z * MOVE_FORCE },
          true,
        );
      } else {
        // Stop immediately when joystick released — no residual roll
        rb.resetForces(true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }

      // Cap horizontal speed
      const vel = rb.linvel();
      const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
      if (speed > MAX_SPEED) {
        const s = MAX_SPEED / speed;
        rb.setLinvel({ x: vel.x * s, y: 0, z: vel.z * s }, true);
      }

      // Track position for camera
      const pos = rb.translation();
      ballPositionRef.current.x = pos.x;
      ballPositionRef.current.z = pos.z;

      // Zone detection
      const gx = Math.round(pos.x / ZONE_SIZE);
      const gy = Math.round(-pos.z / ZONE_SIZE);
      const matchedRoute = spatialRoutes.find((r) => r.x === gx && r.y === gy);
      const zoneId = matchedRoute?.id ?? currentZoneRef.current;

      if (zoneId !== currentZoneRef.current) {
        currentZoneRef.current = zoneId;
        onZoneChange(zoneId);
      }
    });

    return (
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={[startX, 0.5, startZ]}
        lockRotations
        enabledTranslations={[true, false, true]}
        linearDamping={LINEAR_DAMPING}
        mass={1}
      >
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.4} />
        </mesh>
      </RigidBody>
    );
  },
);
