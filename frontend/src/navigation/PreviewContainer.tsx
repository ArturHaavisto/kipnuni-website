import { type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';
import { ChevronDown } from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import type { SwipeDirection } from '@/hooks/useSwipeNavigation';

interface PreviewContainerProps {
  children: ReactNode;
  swipeDirection?: SwipeDirection;
}

export default function PreviewContainer({ children, swipeDirection }: PreviewContainerProps) {
  const { isExpanded, setIsExpanded } = useNavigation();
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isMobile || isExpanded) return;

      // If the click is on an internal link (React Router <Link>), let it navigate
      // without expanding to maximized view
      const target = (e.target as HTMLElement).closest('a');
      if (target && !target.getAttribute('target') && target.getAttribute('href')?.startsWith('/')) {
        return;
      }

      setIsExpanded(true);
    },
    [isMobile, isExpanded, setIsExpanded],
  );

  const collapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(false);
    },
    [setIsExpanded],
  );

  return (
    <div
      onClick={handleClick}
      className={`absolute flex flex-col rounded-lg bg-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-gray-950 ${
        isMobile && isExpanded
          ? 'inset-1 z-50 cursor-default'
          : 'inset-8 z-10 md:inset-16 lg:inset-20'
      } ${isMobile && !isExpanded ? 'cursor-pointer' : ''} ${!(isMobile && isExpanded) ? 'overflow-y-auto overscroll-y-contain' : ''}`}
    >
      <div className={`p-4 md:p-6 ${isMobile && isExpanded ? 'min-h-0 flex-1 overflow-y-auto overscroll-y-contain' : ''}`}>
        {children}
      </div>

      {/* Footer close bar — mobile only, when expanded */}
      {isMobile && isExpanded && (
        <button
          onClick={collapse}
          className="flex w-full shrink-0 items-center justify-center gap-1.5 border-t border-gray-200 bg-gray-100 py-3 text-sm font-medium text-gray-600 transition-colors active:bg-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:active:bg-gray-800"
          aria-label={t('spatial.close')}
        >
          <ChevronDown className="h-4 w-4" />
          {t('spatial.close')}
        </button>
      )}

      {/* Radial glow overlay — inside the container so it follows its bounds */}
      <SwipeIndicator direction={swipeDirection ?? null} />
    </div>
  );
}
