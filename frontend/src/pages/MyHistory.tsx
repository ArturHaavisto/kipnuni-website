import { useTranslation } from 'react-i18next';

export default function MyHistory() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('history.title')}
      </h1>
      <div className="mt-6 text-gray-500 dark:text-gray-400 italic">
        <p>{t('common.inDevelopment')}</p>
      </div>
    </div>
  );
}
