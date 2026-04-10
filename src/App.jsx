import React, { useState } from 'react';
import Portfolio from './components/Portfolio';  // ← Pastikan path ini benar
import LandingScreen from './components/LandingScreen';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  const handleEnterPortfolio = () => {
    setShowLanding(false);
  };

  return (
    <div className="App">
      {showLanding ? (
        <LandingScreen onEnter={handleEnterPortfolio} />
      ) : (
        <Portfolio />  // ← Ini harus Portfolio component yang asli
      )}
    </div>
  );
}

export default App;