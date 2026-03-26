import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRouteByPath, getNeighborSlots, type DirectionSlot } from './routes';

const slotContainerClasses: Record<DirectionSlot, string> = {
  top: 'absolute top-0 left-8 right-8 h-8 md:left-16 md:right-16 md:h-16 lg:left-20 lg:right-20 lg:h-20 flex flex-row items-center justify-center gap-2 p-1 z-30',
  bottom: 'absolute bottom-0 left-8 right-8 h-8 md:left-16 md:right-16 md:h-16 lg:left-20 lg:right-20 lg:h-20 flex flex-row items-center justify-center gap-2 p-1 z-30',
  left: 'absolute left-0 top-8 bottom-8 w-8 md:top-16 md:bottom-16 md:w-16 lg:top-20 lg:bottom-20 lg:w-20 flex flex-col items-center justify-center gap-0.5 p-0.5 z-30',
  right: 'absolute right-0 top-8 bottom-8 w-8 md:top-16 md:bottom-16 md:w-16 lg:top-20 lg:bottom-20 lg:w-20 flex flex-col items-center justify-center gap-0.5 p-0.5 z-30',
  'top-left': 'absolute top-0 left-0 w-8 h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center z-30',
  'top-right': 'absolute top-0 right-0 w-8 h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center z-30',
  'bottom-left': 'absolute bottom-0 left-0 w-8 h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center z-30',
  'bottom-right': 'absolute bottom-0 right-0 w-8 h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center z-30',
};

const slotArrowRotation: Record<DirectionSlot, string> = {
  top: 'rotate-0',
  bottom: 'rotate-180',
  left: '-rotate-90',
  right: 'rotate-90',
  'top-left': '-rotate-45',
  'top-right': 'rotate-45',
  'bottom-left': '-rotate-135',
  'bottom-right': 'rotate-135',
};

function renderContent(slot: DirectionSlot, _currentId: string, label: string) {
  const isCorner = slot.includes('-');
  const isHorizontalSide = slot === 'top' || slot === 'bottom';
  const isVerticalSide = slot === 'left' || slot === 'right';

  const svgArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-colors duration-200 text-gray-400 group-hover:text-white shrink-0 ${slotArrowRotation[slot]} ${
        isHorizontalSide || isCorner
          ? 'h-full max-h-12 w-auto'
          : 'w-full max-w-12 h-auto'
      }`}
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );

  const baseTextClasses = "font-bold uppercase text-gray-400 group-hover:text-white transition-colors duration-200 select-none shrink-0";

  if (isHorizontalSide) {
    return (
      <>
        {slot === 'bottom' && svgArrow}
        <span className={`text-xs md:text-xl lg:text-2xl tracking-wider whitespace-nowrap overflow-hidden ${baseTextClasses}`} style={{ maxWidth: '100%' }}>
          {label}
        </span>
        {slot === 'top' && svgArrow}
      </>
    );
  }

  if (isVerticalSide) {
    return (
      <>
        <span
          className={`text-[10px] sm:text-xs md:text-sm lg:text-base leading-none text-center tracking-tighter w-full overflow-hidden break-words ${baseTextClasses}`}
        >
          {label}
        </span>
        {svgArrow}
      </>
    );
  }

  // Corners
  let absoluteTextClasses = `absolute whitespace-nowrap text-xs md:text-xl lg:text-2xl tracking-wider ${baseTextClasses}`;
  if (slot === 'top-left') absoluteTextClasses += " top-1/2 -translate-y-1/2 left-[calc(100%+0.5rem)] leading-none";
  if (slot === 'top-right') absoluteTextClasses += " top-1/2 -translate-y-1/2 right-[calc(100%+0.5rem)] leading-none";
  if (slot === 'bottom-left') absoluteTextClasses += " bottom-1/2 translate-y-1/2 left-[calc(100%+0.5rem)] leading-none";
  if (slot === 'bottom-right') absoluteTextClasses += " bottom-1/2 translate-y-1/2 right-[calc(100%+0.5rem)] leading-none";

  return (
    <>
      {svgArrow}
      <span className={absoluteTextClasses}>
        {label}
      </span>
    </>
  );
}

export default function ArrowNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const current = getRouteByPath(location.pathname);

  if (!current) return null;

  const neighbors = getNeighborSlots(current.x, current.y);

  return (
    <>
      {neighbors.map(({ slot, route }) => {
        return (
          <button
            key={slot}
            onClick={() => navigate(route.path)}
            className={`group cursor-pointer touch-manipulation focus:outline-none ${slotContainerClasses[slot]}`}
            aria-label={t(`nav.${route.id}`)}
          >
            {renderContent(slot, current.id, t(`nav.${route.id}`))}
          </button>
        );
      })}
    </>
  );
}

