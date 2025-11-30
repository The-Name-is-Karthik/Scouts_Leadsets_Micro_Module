import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LeadsetDetail from './pages/LeadsetDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leadsets/:leadsetId" element={<LeadsetDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
