
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameLayout from './components/GameLayout';
import AssetStudio from './components/AssetStudio';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameLayout />} />
        <Route path="/studio" element={<AssetStudio />} />
      </Routes>
    </Router>
  );
};

export default App;
