import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useMarkdownContent } from '@/hooks/useMarkdownContent';

export default function Me() {
  const { t } = useTranslation();
  const { content, loading } = useMarkdownContent('me');

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('me.title')}
      </h1>
      <div className="mt-6 space-y-4 text-start text-gray-700 dark:text-gray-300">
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <Markdown
            components={{
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
            }}
          >
            {content}
          </Markdown>
        )}
      </div>
      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          {t('me.goToLinks')}
        </p>
        <Link
          to="/link"
          className="mt-3 inline-block rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {t('nav.link')} →
        </Link>
      </div>
    </div>
  );
}
