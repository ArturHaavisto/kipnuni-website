import { useTranslation } from 'react-i18next';

export default function Now() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('now.title')}
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        {t('now.subtitle')}
      </p>
      <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
        <p>{t('now.directions')}</p>
      </div>
    </div>
  );
}
