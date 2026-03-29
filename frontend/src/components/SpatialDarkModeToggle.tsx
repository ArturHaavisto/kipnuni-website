import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

export function SpatialDarkModeToggle() {
  const { isDark, toggleDark } = useDarkMode();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleDark}
      aria-label={t('darkMode.toggle')}
      className="flex items-center justify-center rounded-md p-1 text-gray-500 transition-colors hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-white"
    >
      {isDark ? (
        <Sun className="h-6 w-6 md:h-10 md:w-10 lg:h-14 lg:w-14" />
      ) : (
        <Moon className="h-6 w-6 md:h-10 md:w-10 lg:h-14 lg:w-14" />
      )}
    </button>
  );
}
