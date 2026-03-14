import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('about.title')}</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('about.description')}</p>
    </div>
  );
}
