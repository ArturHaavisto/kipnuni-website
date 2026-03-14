import { useTranslation } from 'react-i18next';

export default function Now() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('home.welcome')}
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        {t('home.subtitle')}
      </p>
      <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
        <p>This is the center of your experience. Navigate using the arrows on each side.</p>
        <p>← <strong>Me</strong> &nbsp;|&nbsp; → <strong>Link</strong> &nbsp;|&nbsp; ↑ <strong>My Future</strong> &nbsp;|&nbsp; ↓ <strong>My History</strong></p>
      </div>
    </div>
  );
}
