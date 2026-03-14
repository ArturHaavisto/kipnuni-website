import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDirection } from './hooks/useDirection';
import { NavigationContext } from './navigation/NavigationContext';
import AppShell from './navigation/AppShell';
import Now from './pages/Now';
import Me from './pages/Me';
import LinkPage from './pages/LinkPage';
import MyHistory from './pages/MyHistory';
import MyFuture from './pages/MyFuture';

function App() {
  useDirection();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <NavigationContext.Provider value={{ isExpanded, setIsExpanded }}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Now />} />
          <Route path="/me" element={<Me />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/history" element={<MyHistory />} />
          <Route path="/future" element={<MyFuture />} />
        </Routes>
      </AppShell>
    </NavigationContext.Provider>
  );
}

export default App;
