import { useTranslation } from 'react-i18next';

export default function MyHistory() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('history.title')}</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        {t('history.description')}
      </p>
      <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
        <p>{t('history.detail')}</p>
      </div>
    </div>
  );
}
