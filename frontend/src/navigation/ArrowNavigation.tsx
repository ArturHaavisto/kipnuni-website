import { useNavigate, useLocation } from 'react-router-dom';
import { getRouteByPath, getNeighborSlots, type DirectionSlot } from './routes';

const slotPositionClasses: Record<DirectionSlot, string> = {
  top: 'top-0 left-1/2 -translate-x-1/2',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  left: 'left-0 top-1/2 -translate-y-1/2',
  right: 'right-0 top-1/2 -translate-y-1/2',
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
};

const slotArrowRotation: Record<DirectionSlot, string> = {
  top: 'rotate-0',        // ▲ points up
  bottom: 'rotate-180',   // ▼ points down
  left: '-rotate-90',     // ◄ points left
  right: 'rotate-90',     // ► points right
  'top-left': '-rotate-45',
  'top-right': 'rotate-45',
  'bottom-left': '-rotate-135',
  'bottom-right': 'rotate-135',
};

export default function ArrowNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = getRouteByPath(location.pathname);

  if (!current) return null;

  const neighbors = getNeighborSlots(current.x, current.y);

  return (
    <>
      {neighbors.map(({ slot, route }) => (
        <button
          key={slot}
          onClick={() => navigate(route.path)}
          title={route.label}
          className={`absolute z-30 flex items-center justify-center
            w-12 h-12 md:w-14 md:h-14
            text-gray-400 hover:text-white
            transition-colors duration-200
            cursor-pointer
            ${slotPositionClasses[slot]}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-6 h-6 md:w-7 md:h-7 ${slotArrowRotation[slot]}`}
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
          <span className="sr-only">{route.label}</span>
        </button>
      ))}
    </>
  );
}
