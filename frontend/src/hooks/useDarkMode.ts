import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return { isDark, toggleDark } as const;
}
