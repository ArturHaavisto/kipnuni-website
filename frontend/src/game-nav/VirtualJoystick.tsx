import { useRef, useCallback, useState, type PointerEvent } from 'react';
import type { RefObject } from 'react';

interface VirtualJoystickProps {
  forceRef: RefObject<{ x: number; z: number }>;
  onRelease: () => void;
}

const KNOB_RADIUS = 28;
const BASE_RADIUS = 60;
const MAX_DRAG = BASE_RADIUS - KNOB_RADIUS;

export function VirtualJoystick({ forceRef, onRelease }: VirtualJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const originRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = baseRef.current?.getBoundingClientRect();
    if (!rect) return;
    originRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setDragging(true);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging) return;
      let dx = e.clientX - originRef.current.x;
      let dy = e.clientY - originRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_DRAG) {
        dx = (dx / dist) * MAX_DRAG;
        dy = (dy / dist) * MAX_DRAG;
      }
      setOffset({ x: dx, y: dy });
      // Normalized input [-1, 1] written directly to ref (no re-render)
      forceRef.current.x = dx / MAX_DRAG;
      forceRef.current.z = dy / MAX_DRAG;
    },
    [dragging, forceRef],
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    setOffset({ x: 0, y: 0 });
    forceRef.current.x = 0;
    forceRef.current.z = 0;
    onRelease();
  }, [dragging, forceRef, onRelease]);

  return (
    <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div
        ref={baseRef}
        className="relative flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm"
        style={{ width: BASE_RADIUS * 2, height: BASE_RADIUS * 2 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="rounded-full bg-white/80 shadow-lg transition-shadow"
          style={{
            width: KNOB_RADIUS * 2,
            height: KNOB_RADIUS * 2,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            boxShadow: dragging ? '0 0 16px rgba(96,165,250,0.6)' : undefined,
          }}
        />
      </div>
    </div>
  );
}
