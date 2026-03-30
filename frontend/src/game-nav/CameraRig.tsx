import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { RefObject } from 'react';

interface CameraRigProps {
  targetRef: RefObject<{ x: number; z: number }>;
}

const OFFSET_Y = 14;
const OFFSET_Z = 10;
const LERP = 0.1;

export function CameraRig({ targetRef }: CameraRigProps) {
  const { camera } = useThree();
  const initialized = useRef(false);

  useFrame(() => {
    const tx = targetRef.current.x;
    const tz = targetRef.current.z;
    const goalX = tx;
    const goalZ = tz + OFFSET_Z;

    if (!initialized.current) {
      camera.position.set(goalX, OFFSET_Y, goalZ);
      camera.lookAt(tx, 0, tz);
      initialized.current = true;
      return;
    }

    camera.position.x += (goalX - camera.position.x) * LERP;
    camera.position.z += (goalZ - camera.position.z) * LERP;
    camera.lookAt(camera.position.x, 0, camera.position.z - OFFSET_Z);
  });

  return null;
}
