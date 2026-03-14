import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
