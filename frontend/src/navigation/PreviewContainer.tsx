import { type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';
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

  const expand = useCallback(() => {
    if (isMobile && !isExpanded) setIsExpanded(true);
  }, [isMobile, isExpanded, setIsExpanded]);

  const collapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(false);
    },
    [setIsExpanded],
  );

  return (
    <div
      onClick={expand}
      className={`absolute overflow-y-auto overscroll-y-contain rounded-lg bg-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-gray-950 ${
        isMobile && isExpanded
          ? 'inset-1 z-50 cursor-default'
          : 'inset-8 z-10 md:inset-16 lg:inset-20'
      } ${isMobile && !isExpanded ? 'cursor-pointer' : ''}`}
    >
      {/* Pill close button — mobile only, when expanded */}
      {isMobile && isExpanded && (
        <button
          onClick={collapse}
          className="fixed bottom-4 left-1/2 z-60 -translate-x-1/2 rounded-full bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 shadow-lg transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label={t('spatial.close')}
        >
          {t('spatial.close')}
        </button>
      )}

      <div className="p-4 md:p-6">
        {children}
      </div>

      {/* Radial glow overlay — inside the container so it follows its bounds */}
      <SwipeIndicator direction={swipeDirection ?? null} />
    </div>
  );
}
