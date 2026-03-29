import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Now() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('now.title')}
      </h1>
      <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
        <p>{t('now.goToMe')}</p>
        <Link
          to="/me"
          className="inline-block rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {t('nav.me')} →
        </Link>
      </div>
    </div>
  );
}
