import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const modules = import.meta.glob<string>('@/content/**/*.md', {
  query: '?raw',
  import: 'default',
});

/**
 * Dynamically load a Markdown file from `src/content/<lang>/<page>.md`.
 * Falls back to the English version if the current language file is missing.
 */
export function useMarkdownContent(page: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const resolve = async () => {
      const primary = `/src/content/${lang}/${page}.md`;
      const fallback = `/src/content/en/${page}.md`;
      const loader = modules[primary] ?? modules[fallback];

      if (loader) {
        const text = await loader();
        if (!cancelled) {
          setContent(text);
          setLoading(false);
        }
      } else {
        if (!cancelled) {
          setContent('');
          setLoading(false);
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [lang, page]);

  return { content, loading };
}
