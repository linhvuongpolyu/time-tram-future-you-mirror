import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import QRScanner from './components/QRScanner';
import MagicMirror from './components/MagicMirror';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
          <Routes>
            <Route path="/" element={<QRScanner />} />
            <Route path="/mirror" element={<MagicMirror />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}
