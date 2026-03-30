import { useState, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import type { SpatialRoute } from '@/navigation/routes';
import { spatialRoutes } from '@/navigation/routes';
import { gridToWorld } from './constants';
import { Floor } from './Floor';
import { PlayerBall, type PlayerBallRef } from './PlayerBall';
import { ZoneSignage } from './ZoneSignage';
import { HUD } from './HUD';
import { VirtualJoystick } from './VirtualJoystick';
import { CameraRig } from './CameraRig';

export interface GameNavOverlayProps {
  currentRoute: SpatialRoute;
  onNavigate: (path: string) => void;
  onClose: () => void;
}

const SETTLE_DELAY_MS = 150;

export default function GameNavOverlay({ currentRoute, onNavigate, onClose }: GameNavOverlayProps) {
  const [activeZone, setActiveZone] = useState(currentRoute.id);
  const ballRef = useRef<PlayerBallRef>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [startX, , startZ] = gridToWorld(currentRoute.x, currentRoute.y);
  const forceRef = useRef({ x: 0, z: 0 });
  const ballPositionRef = useRef({ x: startX, z: startZ });

  const handleRelease = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      const zone = ballRef.current?.getCurrentZone();
      if (zone && zone !== currentRoute.id) {
        const targetRoute = spatialRoutes.find((r) => r.id === zone);
        if (targetRoute) {
          onNavigate(targetRoute.path);
        }
      }
    }, SETTLE_DELAY_MS);
  }, [currentRoute.id, onNavigate]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handlePopupClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative h-[65vh] w-[65vw] overflow-hidden rounded-2xl border border-white/20 bg-gray-950 shadow-2xl"
        onClick={handlePopupClick}
      >
        {/* HUD: current zone label */}
        <HUD activeZoneId={activeZone} />

        {/* 3D Canvas */}
        <Canvas
          camera={{
            position: [startX, 14, startZ + 10],
            fov: 45,
            near: 0.1,
            far: 200,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[8, 12, 5]} intensity={0.8} />
          <Suspense fallback={null}>
            <Physics gravity={[0, 0, 0]}>
              <Floor />
              <PlayerBall
                ref={ballRef}
                currentRoute={currentRoute}
                forceRef={forceRef}
                ballPositionRef={ballPositionRef}
                onZoneChange={setActiveZone}
              />
            </Physics>
            <ZoneSignage activeZoneId={activeZone} />
            <CameraRig targetRef={ballPositionRef} />
          </Suspense>
        </Canvas>

        {/* Virtual Joystick (HTML overlay) */}
        <VirtualJoystick forceRef={forceRef} onRelease={handleRelease} />
      </div>
    </div>
  );
}
