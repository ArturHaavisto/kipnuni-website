import { Route, Routes } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Now from '@/pages/Now';
import Me from '@/pages/Me';
import LinkPage from '@/pages/LinkPage';
import MyHistory from '@/pages/MyHistory';
import MyFuture from '@/pages/MyFuture';

export default function TraditionalLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Now />} />
          <Route path="/me" element={<Me />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/history" element={<MyHistory />} />
          <Route path="/future" element={<MyFuture />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
