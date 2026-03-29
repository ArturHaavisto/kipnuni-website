import { useEffect } from 'react';
import { useDirection } from './hooks/useDirection';
import { useNavMode } from './hooks/useNavMode';
import { useDarkMode } from './hooks/useDarkMode';
import TraditionalLayout from './layouts/TraditionalLayout';
import ExperimentalLayout from './layouts/ExperimentalLayout';

function App() {
  useDirection();
  useDarkMode(); // sync dark class on mount
  const { navMode, toggleMode } = useNavMode();

  // Keyboard shortcut: Ctrl+Shift+E (or Cmd+Shift+E on Mac) to toggle mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        toggleMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleMode]);

  if (navMode === 'experimental') {
    return <ExperimentalLayout />;
  }

  return <TraditionalLayout />;
}

export default App;
