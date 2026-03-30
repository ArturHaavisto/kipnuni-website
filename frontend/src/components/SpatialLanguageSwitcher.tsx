import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { supportedLanguages } from '@/i18n/config';

export function SpatialLanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('header.selectLanguage')}
        className="flex items-center justify-center rounded-md p-1 text-gray-500 transition-colors hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-white"
      >
        <Globe className="h-6 w-6 md:h-10 md:w-10 lg:h-14 lg:w-14" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 min-w-[120px] rounded-lg border border-gray-300 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                i18n.language === lang.code
                  ? 'font-semibold text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
