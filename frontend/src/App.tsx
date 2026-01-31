import { useState } from 'react';
import Header from './components/Header';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Kipnuni
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A modern full-stack application built with React, TypeScript, and Tailwind CSS
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <p className="text-2xl font-semibold mb-4">Count: {count}</p>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Increment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
