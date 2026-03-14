import { type ReactNode, useCallback } from 'react';
import { useNavigation } from './NavigationContext';

interface PreviewContainerProps {
  children: ReactNode;
}

export default function PreviewContainer({ children }: PreviewContainerProps) {
  const { isExpanded, setIsExpanded } = useNavigation();

  const expand = useCallback(() => {
    if (!isExpanded) setIsExpanded(true);
  }, [isExpanded, setIsExpanded]);

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
      className={`absolute bg-white dark:bg-gray-950 rounded-lg shadow-2xl
        overflow-y-auto overscroll-y-contain
        transition-all duration-300 ease-in-out
        ${
          isExpanded
            ? 'inset-1 z-50 cursor-default'
            : 'inset-12 md:inset-16 lg:inset-20 z-10 cursor-pointer'
        }`}
    >
      {/* Close buttons — only visible when expanded */}
      {isExpanded && (
        <>
          <button
            onClick={collapse}
            className="fixed top-3 left-3 z-[60] flex items-center justify-center
              w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800
              text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700
              transition-colors cursor-pointer"
            aria-label="Close expanded view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className="w-4 h-4">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
          <button
            onClick={collapse}
            className="fixed top-3 right-3 z-[60] flex items-center justify-center
              w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800
              text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700
              transition-colors cursor-pointer"
            aria-label="Close expanded view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className="w-4 h-4">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </>
      )}

      {/* Page content */}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}
