import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const systemPrefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage('darkMode', systemPrefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return { isDark, toggleDark } as const;
}
