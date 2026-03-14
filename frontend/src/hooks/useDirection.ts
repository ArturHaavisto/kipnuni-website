import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const rtlLanguages = ['ar'];

export function useDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);
}
